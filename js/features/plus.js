// js/features/plus.js
// ---------------------------------------
// Family Spots Plus – Status & Partnercodes
// ---------------------------------------

"use strict";

import {
  getPlusStatus as getPlusStatusFromStorage,
  savePlusStatus as savePlusStatusToStorage
} from "../storage.js";
import { t, getLanguage } from "../i18n.js?v=20261106-app-feinschliff-16";
import {
  SUBSCRIPTIONS,
  ADDONS,
  CATEGORY_ACCESS,
  DEV_FORCE_PLUS,
  PLUS_STORAGE_KEY
} from "../config.js";

import { fetchJsonWithTimeout } from "../data/dataLoader.js?v=20261010-unified-4";

const PARTNERS_URL = "data/partners.json";

// damit der Import nicht als "unused" gewertet wird (z. B. Bundler)
void SUBSCRIPTIONS;

// ---------------------------------------
// Typen (JSDoc – nur für Tooling/Lesbarkeit)
// ---------------------------------------

/**
 * @typedef {Object} NormalizedPlusStatus
 * @property {boolean} active          - Ist Plus aktuell aktiv (unter Berücksichtigung Ablauf)?
 * @property {string|null} plan        - z. B. "family_plus"
 * @property {string|null} validUntil  - ISO-String (Ende der Laufzeit)
 * @property {string[]|null} addons    - optionale Add-ons (IDs, z. B. ["addon_rv", "addon_water"])
 * @property {string|null} partner     - z. B. "Campingplatz XY"
 * @property {string|null} source      - z. B. "partner", "store", "dev"
 */

/**
 * @typedef {Object} PartnerCodeEntry
 * @property {string} [codeSha256]  - Only the public SHA-256 verifier of the owner code
 * @property {string} [code]          - Legacy partner-code format (disabled in owner-only mode)
 * @property {number} [days]          - Laufzeit in Tagen (Alternative zu validUntil)
 * @property {string} [plan]          - z. B. "family_plus" – falls leer, wird auf Standard gesetzt
 * @property {string} [partner]
 * @property {string} [source]
 * @property {boolean} [enabled]
 * @property {string[]} [addons]      - z. B. ["addon_rv", "addon_water"]
 * @property {string} [addonId]       - Single-Add-on-ID, z. B. "addon_water"
 * @property {string} [validUntil]    - ISO-String (falls feste Laufzeit)
 */

/**
 * @typedef {Object} PartnerCodeResult
 * @property {boolean} ok
 * @property {"empty"|"not_found"|"invalid_days"|"already_redeemed"|"unavailable"|"storage"|undefined} [reason]
 * @property {NormalizedPlusStatus} [status]
 * @property {PartnerCodeEntry} [entry]
 */

// ---------------------------------------
// Plus-Kategorien aus Config ableiten
// ---------------------------------------

/**
 * Erzeugt ein Set aller Kategorien, die gemäß CATEGORY_ACCESS Plus/Add-on erfordern.
 * @returns {Set<string>}
 */
function buildPlusCategorySet() {
  const result = new Set();

  if (!CATEGORY_ACCESS || !CATEGORY_ACCESS.perCategory) return result;

  Object.entries(CATEGORY_ACCESS.perCategory).forEach(([slug, rule]) => {
    if (!rule) return;
    const level = rule.level || CATEGORY_ACCESS.defaultLevel || "free";
    // alles, was nicht free ist, gilt als Plus-/Add-on-Kategorie
    if (level !== "free") {
      result.add(String(slug));
    }
  });

  return result;
}

/**
 * Set aller Kategorien, die nur mit Plus/Add-on sichtbar sein sollen.
 * Basis ist config.js → CATEGORY_ACCESS.
 * Wird einmalig beim Modul-Load berechnet.
 * @type {Set<string>}
 */
const PLUS_CATEGORIES = buildPlusCategorySet();

/**
 * Cache für Partnercodes (wird lazy befüllt).
 * @type {PartnerCodeEntry[]|null}
 */
let cachedPartnerCodes = null;

// ---------------------------------------
// Hilfsfunktionen
// ---------------------------------------

/**
 * Prüft, ob ein Date-Objekt gültig ist.
 * @param {Date|null} date
 * @returns {boolean}
 */
function isValidDate(date) {
  return !!(date && !Number.isNaN(date.getTime()));
}

/**
 * Normalisiert Add-ons aus beliebigen Feldern auf ein String-Array oder null.
 * @param {any} raw
 * @param {any} [fallbackRaw]
 * @returns {string[]|null}
 */
function normalizeAddons(raw, fallbackRaw) {
  let source = raw;

  if (!Array.isArray(source) && fallbackRaw) {
    source = fallbackRaw;
  }

  if (Array.isArray(source)) {
    const list = source
      .map((v) => (v == null ? "" : String(v).trim()))
      .filter(Boolean);
    return list.length ? list : null;
  }

  if (source) {
    const single = String(source).trim();
    return single ? [single] : null;
  }

  return null;
}

/**
 * Filtert Add-ons auf bekannte IDs aus config.js (ADDONS),
 * um Tippfehler oder veraltete Partner-Codes abzufangen.
 *
 * @param {any} raw
 * @param {any} [fallbackRaw]
 * @returns {string[]|null}
 */
function normalizeAndFilterAddons(raw, fallbackRaw) {
  const list = normalizeAddons(raw, fallbackRaw);
  if (!list || !ADDONS) return list;

  const knownIds = new Set(Object.keys(ADDONS));
  const filtered = list.filter((id) => knownIds.has(id));
  return filtered.length ? filtered : null;
}

/**
 * Prüft, ob ein gespeicherter Status im Wesentlichen "leer" ist.
 * @param {any} raw
 * @returns {boolean}
 */
function isEmptyStoredStatus(raw) {
  if (!raw || typeof raw !== "object") return true;
  return Object.keys(raw).length === 0;
}

// Each redeemed code is a fixed grant. Grants keep their own expiry so a short
// add-on neither replaces a long base subscription nor inherits its full term.
function storedGrants(stored) {
  if (!stored || typeof stored !== "object") return [];
  if (stored.grantVersion === 1 && Array.isArray(stored.grants)) {
    return stored.grants.filter(grant => grant && typeof grant === "object" &&
      (grant.expiresAt === null || (typeof grant.expiresAt === "string" && Number.isFinite(Date.parse(grant.expiresAt))))
    ).map(grant => ({
      code: typeof grant.code === "string" ? grant.code.trim().toUpperCase() : null,
      codeSha256: typeof grant.codeSha256 === "string" ? grant.codeSha256 : null,
      active: grant.active !== false && stored.active !== false,
      plan: typeof grant.plan === "string" && grant.plan ? grant.plan : "family_plus",
      expiresAt: grant.expiresAt,
      activatedAt: typeof grant.activatedAt === "string" ? grant.activatedAt : null,
      partner: typeof grant.partner === "string" ? grant.partner : null,
      source: typeof grant.source === "string" ? grant.source : "partner",
      addons: normalizeAndFilterAddons(grant.addons) || []
    }));
  }
  // Migrate the current old-format grant, including an expired code's history.
  // Older codes that were overwritten before this update cannot be recovered.
  const expiry = stored.expiresAt || stored.validUntil || null;
  const validExpiry = expiry === null || (typeof expiry === "string" && Number.isFinite(Date.parse(expiry)));
  const code = typeof stored.code === "string" ? stored.code.trim().toUpperCase() : null;
  if (!stored.active && !code) return [];
  return [{code, codeSha256: null, active: !!stored.active && validExpiry, plan: stored.plan || "family_plus",
    expiresAt: validExpiry ? expiry : "1970-01-01T00:00:00.000Z",
    activatedAt: stored.activatedAt || null, partner: stored.partner || null,
    source: stored.source || "legacy", addons: normalizeAndFilterAddons(stored.addons, stored.addonId) || []}];
}
// Prototype rule: access is only granted to the locally redeemed owner code.
// This is *not* security against someone modifying their own browser or the public JS.
const isOwnerGrant = grant => grant.source === "development_owner" && grant.expiresAt === null && grant.active;

function grantSummary(grants, now = Date.now()) {
  const alive = grants.filter(grant => grant.active && (grant.expiresAt === null || Date.parse(grant.expiresAt) > now));
  const rank = grant => grant.expiresAt === null ? Infinity : Date.parse(grant.expiresAt);
  const order = list => [...list].sort((a, b) => rank(b) - rank(a));
  const subscriptions = alive.filter(grant => Object.hasOwn(SUBSCRIPTIONS, grant.plan));
  const leading = order(subscriptions)[0] || order(alive)[0] || order(grants)[0];
  const addons = leading?.source === "development_owner" && leading.expiresAt === null
    ? Object.keys(ADDONS)
    : [...new Set(alive.filter(grant => grant.plan === leading?.plan).flatMap(grant => grant.addons))];
  const boundaries = alive.map(grant => grant.expiresAt).filter(Boolean).map(Date.parse).filter(ts => ts > now);
  return {active: alive.length > 0, plan: leading?.plan || null,
    validUntil: leading?.expiresAt || null, addons: addons.length ? addons : null,
    partner: leading?.partner || null, source: leading?.source || null,
    nextChangeAt: boundaries.length ? Math.min(...boundaries) : null};
}

// IndexedDB serializes redemption read/merge/write across tabs, even on browsers
// without Web Locks. localStorage remains the existing authoritative format.
let plusDatabasePromise = null;
function plusDatabase() {
  if (!plusDatabasePromise) plusDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("family-spots-plus-coordination", 1);
    let cancelled = false;
    const timer = setTimeout(() => { cancelled = true; reject(new Error("plus_storage_timeout")); }, 5000);
    request.onupgradeneeded = () => request.result.createObjectStore("gate");
    request.onerror = () => { clearTimeout(timer); reject(request.error); };
    request.onblocked = () => { cancelled = true; clearTimeout(timer); reject(new Error("plus_storage_blocked")); };
    request.onsuccess = () => {
      clearTimeout(timer);
      const db = request.result;
      if (cancelled) { db.close(); return; }
      db.onversionchange = () => { db.close(); plusDatabasePromise = null; };
      resolve(db);
    };
  }).catch(error => { plusDatabasePromise = null; throw error; });
  return plusDatabasePromise;
}
async function redeemUnderLock(transform) {
  const db = await plusDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("gate", "readwrite"), store = tx.objectStore("gate");
    const request = store.get("redemption");
    let result, error, previous, written;
    request.onsuccess = () => {
      try {
        previous = localStorage.getItem(PLUS_STORAGE_KEY);
        result = transform();
        written = localStorage.getItem(PLUS_STORAGE_KEY);
        store.put(1, "redemption");
      } catch (caught) { error = caught; tx.abort(); }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () => {
      if (written !== undefined && written !== previous) {
        try {
          if (localStorage.getItem(PLUS_STORAGE_KEY) === written) {
            if (previous === null) localStorage.removeItem(PLUS_STORAGE_KEY);
            else localStorage.setItem(PLUS_STORAGE_KEY, previous);
          }
        } catch { /* Report failure; never remove unrelated data. */ }
      }
      reject(error || tx.error || new Error("plus_storage_failed"));
    };
  });
}

// ---------------------------------------
// Status-API
// ---------------------------------------

/**
 * Normalisierte Sicht auf den Plus-Status.
 * Nutzt intern den Storage, gibt aber immer ein konsistentes Objekt zurück:
 *
 * {
 *   active: boolean,
 *   plan: string|null,
 *   validUntil: string|null,
 *   addons: string[]|null,
 *   partner: string|null,
 *   source: string|null
 * }
 *
 * WICHTIG:
 *  - Berücksichtigt Ablaufdatum (validUntil / expiresAt)
 *  - Wenn abgelaufen → active = false
 *  - DEV_FORCE_PLUS kann den Status ausschließlich zur Laufzeit überschreiben
 *
 * @returns {NormalizedPlusStatus}
 */
export function getPlusStatus() {
  const stored = getPlusStatusFromStorage() || {};

  // Falls überhaupt kein sinnvoller Status vorliegt, standardisieren:
  if (isEmptyStoredStatus(stored)) {
    /** @type {NormalizedPlusStatus} */
    const base = {
      active: false,
      plan: null,
      validUntil: null,
      addons: null,
      partner: null,
      source: null
    };

    // Dev-Override: Plus für Demos erzwingen, ohne Storage zu verändern
    if (DEV_FORCE_PLUS) {
      return {
        ...base,
        active: true,
        plan: "family_plus",
        source: "dev"
      };
    }

    return base;
  }

  if (stored.grantVersion === 1 && Array.isArray(stored.grants)) {
    const status = grantSummary(storedGrants(stored).filter(isOwnerGrant));
    return DEV_FORCE_PLUS ? { ...status, active: true, source: "dev" } : status;
  }

  // Do not honour legacy partner, campaign or trial statuses from earlier versions.
  // Preserve an existing owner grant on the same device for backward compatibility.
  const owner = stored.active === true && stored.source === "development_owner" &&
    !stored.expiresAt && !stored.validUntil;
  const normalized = owner
    ? { active: true, plan: "family_plus", validUntil: null, addons: Object.keys(ADDONS), partner: stored.partner || null, source: "development_owner" }
    : { active: false, plan: null, validUntil: null, addons: null, partner: null, source: null };
  return DEV_FORCE_PLUS ? { ...normalized, active: true, plan: "family_plus", source: "dev" } : normalized;
}

/**
 * True, wenn Plus aktuell aktiv ist (inkl. Ablaufprüfung & Dev-Override).
 * @returns {boolean}
 */
export function isPlusActive() {
  return getPlusStatus().active;
}

/**
 * True, wenn die Kategorie in eine Plus-/Add-on-Kategorie fällt.
 * Basis: CATEGORY_ACCESS in config.js
 *
 * @param {string} slug
 * @returns {boolean}
 */
export function isPlusCategory(slug) {
  if (!slug) return false;
  return PLUS_CATEGORIES.has(String(slug));
}

/**
 * Prüft, ob ein bestimmtes Add-on beim aktuellen Nutzer aktiv ist,
 * z. B. "addon_water".
 *
 * @param {string} addonId
 * @param {NormalizedPlusStatus} [status]
 * @returns {boolean}
 */
export function hasAddon(addonId, status = getPlusStatus()) {
  if (!addonId) return false;
  const s = status || getPlusStatus();
  if (!s.active || !Array.isArray(s.addons)) return false;
  return s.addons.includes(addonId);
}

/**
 * Prüft, ob für eine bestimmte Kategorie das zugehörige Add-on aktiv ist.
 * Nutzt CATEGORY_ACCESS (level === "addon" & addonId).
 *
 * @param {string} slug
 * @param {NormalizedPlusStatus} [status]
 * @returns {boolean}
 */
export function hasAddonForCategory(slug, status = getPlusStatus()) {
  if (
    !slug ||
    !CATEGORY_ACCESS ||
    !CATEGORY_ACCESS.perCategory ||
    !CATEGORY_ACCESS.perCategory[slug]
  ) {
    return false;
  }

  const rule = CATEGORY_ACCESS.perCategory[slug];
  if (!rule || rule.level !== "addon" || !rule.addonId) return false;
  return hasAddon(rule.addonId, status);
}

/**
 * Formatiert den Status als Text für die UI.
 * Nutzt i18n-Fallbacks.
 *
 * @param {NormalizedPlusStatus} [status]
 * @returns {string}
 */
export function formatPlusStatus(status = getPlusStatus()) {
  if (!status) {
    return t("plus_status_inactive", "Family Spots Plus ist nicht aktiviert.");
  }

  const untilIso = status.validUntil;
  const until = untilIso ? new Date(untilIso) : null;
  const hasValidDate = isValidDate(until);

  // Inaktiv (nie aktiviert oder abgelaufen)
  if (!status.active) {
    if (hasValidDate && until) {
      const dateStr = until.toLocaleDateString({de: "de-DE", en: "en-GB", da: "da-DK"}[getLanguage()], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

      return t("plus_status_expired", "Family Spots Plus ist am {date} abgelaufen.").replace("{date}", dateStr);
    }

    return t("plus_status_inactive", "Family Spots Plus ist nicht aktiviert.");
  }

  if (status.source === "development_owner" && !untilIso) {
    return t("plus_status_owner", "Entwicklungszugang: alle Spots und Zusatzbereiche dauerhaft freigeschaltet. Kostenlos, kein Abo.");
  }
  if (status.source === "family_test" && hasValidDate) {
    const dateStr = until.toLocaleDateString({de: "de-DE", en: "en-GB", da: "da-DK"}[getLanguage()]);
    return t("plus_status_family_test", "Kostenloser Familientest bis {date}: alle Spots und Zusatzbereiche freigeschaltet. Kein Abo.").replace("{date}", dateStr);
  }

  // Aktiv, aber ohne sinnvolles Datum
  if (!hasValidDate) {
    return t("plus_status_active", "Family Spots Plus ist aktiv.");
  }

  // Aktiv bis konkretes Datum
  const dateStr = until.toLocaleDateString({de: "de-DE", en: "en-GB", da: "da-DK"}[getLanguage()], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return t("plus_status_active_until", "Family Spots Plus ist aktiv bis {date}.").replace("{date}", dateStr);
}

// ---------------------------------------
// Partnercodes
// ---------------------------------------

/**
 * Lädt Partnercodes aus data/partners.json.
 *
 * Erwartetes Format:
 * {
 *   "codes": [
 *     {
 *       "code": "TESTPLUS",
 *       "days": 365,
 *       "plan": "family_plus",
 *       "partner": "Dev",
 *       "source": "partner",
 *       "addons": ["addon_rv", "addon_water"],             // optional
 *       "validUntil": "2026-12-31T23:59:59.000Z",          // optional
 *       "enabled": true                                     // optional
 *     }
 *   ]
 * }
 *
 * Alternativ:
 *  - direkt ein Array von Einträgen.
 *
 * @returns {Promise<PartnerCodeEntry[]>}
 */
async function loadPartnerCodes() {
  if (cachedPartnerCodes) return cachedPartnerCodes;

  try {
    const json = await fetchJsonWithTimeout(PARTNERS_URL, 8000);
    if (Array.isArray(json)) {
      // Fallback, falls direkt ein Array gespeichert wurde
      cachedPartnerCodes = json;
    } else if (Array.isArray(json?.codes)) {
      cachedPartnerCodes = json.codes;
    } else {
      return null;
    }

    return cachedPartnerCodes;
  } catch (err) {
    console.error("[Family Spots] Error loading partner codes:", err);
    return null;
  }
}

/**
 * Versucht, einen Partnercode einzulösen.
 *
 * Rückgabe:
 *  { ok, reason?, status?, entry? }
 *
 * reason:
 *  - "empty"        → kein Code eingegeben
 *  - "not_found"    → Code unbekannt oder deaktiviert
 *  - "invalid_days" → Weder gültiges validUntil noch gültige days
 *
 * @param {string} rawCode
 * @returns {Promise<PartnerCodeResult>}
 */
export async function redeemPartnerCode(rawCode) {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) {
    return { ok: false, reason: "empty" };
  }

  const codes = await loadPartnerCodes();
  if (codes === null) return { ok: false, reason: "unavailable" };
  if (!Array.isArray(codes) || !codes.length) {
    return { ok: false, reason: "not_found" };
  }

  // Never distribute the plaintext owner code in a static public repository.
  // A digest only avoids casual disclosure; local UI entitlements are not secure
  // and must be replaced by server-side authorization before paid launch.
  if (!globalThis.crypto?.subtle) return { ok: false, reason: "unavailable" };
  const digestBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  const codeSha256 = Array.from(new Uint8Array(digestBytes), byte => byte.toString(16).padStart(2, "0")).join("");
  const entry = codes.find(c => c?.source === "development_owner" && c.permanent === true &&
    c.enabled !== false && c.codeSha256 === codeSha256);

  if (!entry) {
    return { ok: false, reason: "not_found" };
  }

  try {
    return await redeemUnderLock(() => {
      const stored = getPlusStatusFromStorage();
      const grants = storedGrants(stored);
      if (grants.some(grant => grant.codeSha256 === codeSha256 || (grant.source === "development_owner" && grant.code === code))) {
        return { ok: false, reason: "already_redeemed" };
      }
      const now = Date.now();
      // An explicit local development grant is the only code allowed without
      // expiry. This is a prototype convenience, not server-side authentication.
      const permanentOwner = entry.source === "development_owner" && entry.permanent === true;
      let expiry;
      if (permanentOwner) {
        expiry = null;
      } else if (entry.validUntil !== undefined && entry.validUntil !== null) {
        // A malformed fixed expiry must never turn into a fresh relative term.
        expiry = typeof entry.validUntil === "string" ? Date.parse(entry.validUntil) : NaN;
      } else {
        const days = ["number", "string"].includes(typeof entry.days) ? Number(entry.days) : NaN;
        expiry = Number.isFinite(days) && days > 0 ? now + days * 86400000 : NaN;
      }
      if (!permanentOwner && (!Number.isFinite(expiry) || !Number.isFinite(new Date(expiry).getTime()))) return { ok: false, reason: "invalid_days" };
      if (!permanentOwner && expiry <= now) return { ok: false, reason: "not_found" };
      grants.push({code: null, codeSha256, active: true, plan: entry.plan || "family_plus", expiresAt: permanentOwner ? null : new Date(expiry).toISOString(),
        activatedAt: new Date(now).toISOString(), partner: entry.partner || null,
        source: entry.source || "partner", addons: normalizeAndFilterAddons(entry.addons, entry.addonId) || []});
      const status = grantSummary(grants.filter(isOwnerGrant), now);
      const storedStatus = {...status, expiresAt: status.validUntil,
        activatedAt: new Date(now).toISOString(), grantVersion: 1, grants};
      if (!savePlusStatusToStorage(storedStatus)) return { ok: false, reason: "storage" };
      return { ok: true, status, entry };
    });
  } catch (error) {
    console.warn("[Family Spots] Could not store Plus redemption:", error);
    return { ok: false, reason: "storage" };
  }
}
