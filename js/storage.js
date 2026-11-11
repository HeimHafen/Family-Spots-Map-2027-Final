// js/storage.js
// ===============================================
// Zentrale Storage-Helfer für Family Spots Map
// – alles rund um localStorage
// ===============================================

"use strict";

import {
  PLUS_STORAGE_KEY,
  DAYLOG_STORAGE_KEY,
  SPOTS_CACHE_KEY,
  COMPASS_PLUS_HINT_KEY
} from "./config.js";

const LANG_STORAGE_KEY = "fs_lang";
const FAVORITES_STORAGE_KEY = "fs_favorites";

// Legacy-Flags für das alte Plus-Format
const LEGACY_PLUS_TRUE = "1";
const LEGACY_PLUS_FALSE = "0";

// ------------------------------------------------------
// interne Helfer für sicheren Zugriff
// ------------------------------------------------------

/**
 * Lies einen Wert aus localStorage (sicher, mit Fallback).
 * @param {string} key
 * @returns {string|null}
 */
function safeGet(key) {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch (err) {
    console.warn("[Family Spots] Konnte localStorage lesen:", err);
    return null;
  }
}

/**
 * Schreibe einen Wert nach localStorage (sicher, mit Fehler-Logging).
 * @param {string} key
 * @param {string} value
 */
function safeSet(key, value) {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn("[Family Spots] Konnte localStorage schreiben:", err);
    return false;
  }
}

/**
 * JSON-Parsing mit Fallback.
 * @template T
 * @param {string|null} raw
 * @param {T} fallback
 * @returns {T}
 */
function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    // Nur "objectige" oder Array-Strukturen akzeptieren, primitive Werte ignorieren
    if (parsed === null || typeof parsed === "object") {
      return /** @type {T} */ (parsed);
    }
    return fallback;
  } catch (err) {
    console.warn("[Family Spots] Konnte JSON aus localStorage nicht lesen:", err);
    return fallback;
  }
}

// ------------------------------------------------------
// Sprache
// ------------------------------------------------------

/**
 * Gespeicherte Sprachwahl laden.
 * @returns {string|null}
 */
export function loadStoredLang() {
  return safeGet(LANG_STORAGE_KEY);
}

/**
 * Sprachwahl persistieren.
 * @param {string} lang
 */
export function saveStoredLang(lang) {
  if (!lang) return;
  safeSet(LANG_STORAGE_KEY, lang);
}

// ------------------------------------------------------
// Spots-Cache
// ------------------------------------------------------

/**
 * Spots-Cache aus localStorage laden.
 * Akzeptiert sowohl:
 *  - Array   → [ ...spots ]
 *  - Objekt  → { spots: [...] }
 *
 * @returns {any[] | null}
 */
export function loadSpotsFromCache() {
  const stored = safeGet(SPOTS_CACHE_KEY);
  if (!stored) return null;

  const parsed = safeParseJson(stored, null);
  if (!parsed) return null;

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && Array.isArray(parsed.spots)) {
    return parsed.spots;
  }

  return null;
}

/**
 * Spots im Cache speichern.
 * @param {any[]} spots
 */
export function saveSpotsToCache(spots) {
  if (!spots) return;

  try {
    safeSet(SPOTS_CACHE_KEY, JSON.stringify(spots));
  } catch (err) {
    console.warn("[Family Spots] Konnte Spots-Cache nicht speichern:", err);
  }
}

// ------------------------------------------------------
// Favoriten
// ------------------------------------------------------

/**
 * Favoriten als Set laden.
 * Rückgabe: immer ein Set<string>.
 * @returns {Set<string>}
 */
export function loadFavoritesFromStorage() {
  const stored = safeGet(FAVORITES_STORAGE_KEY);
  if (!stored) return new Set();

  const parsed = safeParseJson(stored, null);
  if (Array.isArray(parsed)) {
    return new Set(parsed.map((v) => String(v)));
  }

  return new Set();
}

/**
 * Favoriten-Set speichern.
 * @param {Set<string>} favoritesSet
 */
export function saveFavoritesToStorage(favoritesSet) {
  if (!(favoritesSet instanceof Set)) return;

  try {
    const arr = Array.from(favoritesSet);
    safeSet(FAVORITES_STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn("[Family Spots] Konnte Favoriten nicht speichern:", err);
  }
}

// ------------------------------------------------------
// Plus-Status (neues Modell)
// ------------------------------------------------------

/**
 * Lies den vollständigen Plus-Status aus dem Storage.
 *
 * Mögliche Rückgabe:
 *  - null
 *  - {
 *      active,
 *      plan?,
 *      code?,
 *      partner?,
 *      source?,
 *      activatedAt?,
 *      expiresAt?,
 *      validUntil? (legacy),
 *      addons? (string[])
 *    }
 *
 * Eigenschaften:
 *  - abwärtskompatibel zum alten "1"/"0"-Format
 *  - gibt bei abgelaufenen Codes active=false zurück, ohne beim Lesen zu schreiben
 *
 * @returns {any|null}
 */
export function getPlusStatus() {
  const stored = safeGet(PLUS_STORAGE_KEY);
  if (!stored) return null;

  // Legacy-Format: nur "1" / "0"
  if (stored === LEGACY_PLUS_TRUE) {
    return {
      active: true,
      plan: "legacy",
      code: null,
      partner: null,
      source: "legacy",
      activatedAt: null,
      expiresAt: null
    };
  }

  if (stored === LEGACY_PLUS_FALSE) {
    return {
      active: false,
      plan: null,
      code: null,
      partner: null,
      source: "legacy",
      activatedAt: null,
      expiresAt: null
    };
  }

  // Neues JSON-Format
  const parsed = safeParseJson(stored, null);
  if (!parsed || typeof parsed !== "object") return null;

  const status = { ...parsed };

  // Fallback: validUntil → expiresAt
  if (!status.expiresAt && status.validUntil) {
    status.expiresAt = status.validUntil;
  }

  // Fixed grants can outlive the currently displayed subscription (for example
  // a legacy unlimited status). Evaluate each grant without writing on reads.
  if (status.grantVersion === 1 && Array.isArray(status.grants)) {
    status.active = !!status.active && status.grants.some(grant => grant && grant.active !== false &&
      (grant.expiresAt === null || (typeof grant.expiresAt === "string" && Date.parse(grant.expiresAt) > Date.now())));
  } else if (status.expiresAt) {
    const ts = Date.parse(status.expiresAt);
    if (!Number.isFinite(ts) || ts <= Date.now()) {
      // Ungültiges Datum oder Ablaufgrenze erreicht → inaktiv, ohne Schreibzugriff.
      if (status.active !== false) {
        status.active = false;
        // Reads stay side-effect-free so they cannot race a redemption in another tab.
      }
    }
  }

  if (typeof status.active !== "boolean") {
    status.active = !!status.active;
  }

  return status;
}

/**
 * Speichert den vollständigen Plus-Status im neuen JSON-Format.
 * Wird z. B. von features/plus.js (redeemPartnerCode) verwendet.
 *
 * @param {any} status
 */
export function savePlusStatus(status) {
  if (!status || typeof status !== "object") return;

  const normalized = {
    code: status.code || null,
    plan: status.plan || "plus",
    partner: status.partner || null,
    source: status.source || "manual",
    activatedAt: status.activatedAt || new Date().toISOString(),
    expiresAt: status.expiresAt || status.validUntil || null,
    // Wenn active explizit gesetzt ist, respektieren – sonst default true
    active: status.active !== undefined ? !!status.active : true,
    // Preserve the fixed grants and redemption history in the same atomic write.
    ...(status.grantVersion === 1 && Array.isArray(status.grants)
      ? { grantVersion: 1, grants: status.grants }
      : {}),
    // Add-ons, falls vorhanden, übernehmen (string-normalisiert)
    ...(Array.isArray(status.addons)
      ? { addons: status.addons.map(String) }
      : {})
  };

  try {
    return safeSet(PLUS_STORAGE_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.warn("[Family Spots] Konnte Plus-Status nicht speichern:", err);
  }
}

/**
 * Kompatibilitäts-Helfer:
 * Gibt nur true/false zurück, ob Plus aktuell aktiv ist
 * (inkl. Ablaufprüfung).
 *
 * @returns {boolean}
 */
export function loadPlusActive() {
  // Keep legacy readers aligned with the owner-only prototype. Ordinary
  // partner/trial flags from old versions cannot reactivate Plus.
  const status = getPlusStatus();
  if (!status?.active) return false;
  if (status.grantVersion === 1 && Array.isArray(status.grants)) {
    return status.grants.some(grant => grant && grant.active !== false &&
      grant.source === "development_owner" && grant.expiresAt === null);
  }
  return status.source === "development_owner" && !status.expiresAt && !status.validUntil;
}

/**
 * Kompatibilitäts-Helfer:
 * Setzt nur das active-Flag, lässt alle anderen Felder unverändert.
 *
 * @param {boolean} isActive
 */
export function savePlusActive(isActive) {
  const current = getPlusStatus() || {};
  const next = {
    ...current,
    active: !!isActive
  };

  if (!next.plan) next.plan = "manual";
  if (!next.source) next.source = "manual_toggle";

  savePlusStatus(next);
}

// ------------------------------------------------------
// Mein Tag (Daylog)
// ------------------------------------------------------

/**
 * Daylog laden.
 * Rückgabe:
 *  - null
 *  - { text: string, ts: number }
 *
 * @returns {{text: string, ts: number} | null}
 */
export function loadDaylog() {
  const stored = safeGet(DAYLOG_STORAGE_KEY);
  if (!stored) return null;

  const parsed = safeParseJson(stored, null);
  if (parsed && typeof parsed.text === "string") {
    return parsed;
  }

  return null;
}

/**
 * Daylog speichern (nur nicht-leere Texte).
 * @param {string} text
 */
export function saveDaylog(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return;

  const payload = { text: trimmed, ts: Date.now() };
  try {
    safeSet(DAYLOG_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("[Family Spots] Konnte Mein-Tag nicht speichern:", err);
  }
}

// ------------------------------------------------------
// Kompass/Plus-Onboarding-Hint
// ------------------------------------------------------

/**
 * Prüft, ob der Kompass/Plus-Hinweis schon gezeigt wurde.
 * @returns {boolean}
 */
export function hasSeenCompassPlusHint() {
  return safeGet(COMPASS_PLUS_HINT_KEY) === "1";
}

/**
 * Markiert den Kompass/Plus-Hinweis als gesehen.
 */
export function markCompassPlusHintSeen() {
  safeSet(COMPASS_PLUS_HINT_KEY, "1");
}