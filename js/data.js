// js/data.js
// ------------------------------------------------------
// Daten-Layer für Spots & Index
//  - nutzt data/dataLoader.js zum Einlesen
//  - kümmert sich um Offline-Cache in localStorage
// ------------------------------------------------------

"use strict";

import { SPOTS_CACHE_KEY } from "./config.js";
import { loadAppData } from "./data/dataLoader.js?v=20261010-unified-4";

/** @typedef {import("./app.js").Spot} Spot */

/**
 * Struktur des App-Index (abhängig von dataLoader).
 * Hier bewusst grob gehalten – kann bei Bedarf verfeinert werden.
 *
 * @typedef {Object<string, any>} AppIndex
 */

/**
 * Struktur, wie Spots/Index im Cache liegen können.
 *
 * @typedef {Object} SpotsCachePayload
 * @property {Spot[]} spots
 * @property {AppIndex|null|undefined} [index]
 */

// ------------------------------------------------------
// Modulinterner Zustand
// ------------------------------------------------------

/** @type {Spot[]} */
let spots = [];

/** @type {AppIndex|null} */
let indexData = null;
let hasLoaded = false;
let loadedFromCache = false;

// ------------------------------------------------------
// Cache-Helfer (localStorage)
// ------------------------------------------------------

/**
 * Cache aus localStorage lesen.
 * Akzeptiert:
 *  - ein reines Array von Spots
 *  - ein Objekt { spots: [...] }
 *  - ein Objekt { spots: [...], index: {...} }
 *
 * @returns {SpotsCachePayload|null}
 */
function loadSpotsFromCache() {
  try {
    const stored = localStorage.getItem(SPOTS_CACHE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Fall 1: reines Array → alte Struktur
    if (Array.isArray(parsed)) {
      return { spots: parsed, index: null };
    }

    // Fall 2: Objekt mit spots-Array
    if (parsed && Array.isArray(parsed.spots)) {
      /** @type {SpotsCachePayload} */
      const payload = {
        spots: parsed.spots,
        index: parsed.index || null
      };
      return payload;
    }

    return null;
  } catch {
    // bei Fehlern einfach kein Cache nutzen
    return null;
  }
}

/**
 * Spots (und optional Index) im Cache speichern.
 *
 * @param {Spot[]} spotsToSave
 * @param {AppIndex|null} indexToSave
 */
function saveSpotsToCache(spotsToSave, indexToSave) {
  try {
    /** @type {SpotsCachePayload} */
    const payload = {
      spots: spotsToSave || [],
      index: indexToSave || null
    };
    localStorage.setItem(SPOTS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // egal – App funktioniert auch ohne Cache
  }
}

// ------------------------------------------------------
// Positions-Helfer
// ------------------------------------------------------

/**
 * Hilfsfunktion: Position aus verschiedenen Feldern lesen.
 * Unterstützte Felder:
 *  - lat / lng
 *  - latitude / longitude
 *  - lon (als Alternative für lng)
 *
 * @param {any} source
 * @returns {{ lat: number|undefined, lng: number|undefined }}
 */
function extractLatLng(source) {
  if (!source || typeof source !== "object") {
    return { lat: undefined, lng: undefined };
  }

  /** @type {number|string|undefined} */
  let lat = source.lat;
  /** @type {number|string|undefined} */
  let lng = source.lng;

  if (lat == null) lat = source.latitude;
  if (lng == null) lng = source.longitude;
  if (lng == null && source.lon != null) lng = source.lon;

  if (typeof lat === "string") lat = lat.trim() ? Number(lat.trim()) : undefined;
  if (typeof lng === "string") lng = lng.trim() ? Number(lng.trim()) : undefined;

  if (!Number.isFinite(lat) || Math.abs(lat) > 90) lat = undefined;
  if (!Number.isFinite(lng) || Math.abs(lng) > 180) lng = undefined;

  return { lat, lng };
}

/**
 * Normalisiert einen Roh-Spot aus dem dataLoader in das Format,
 * das von map.js / app.js erwartet wird:
 *
 *  - bevorzugt s.raw als Basisdaten,
 *  - merged s darüber (damit berechnete Felder erhalten bleiben),
 *  - lat/lng werden aus s.location, raw.location, s selbst und raw extrahiert,
 *  - categories/category & tags werden in eine robuste Standardform gebracht.
 *
 * @param {any} s
 * @returns {Spot}
 */
function normalizeRawSpot(s) {
  const raw = s && typeof s === "object" && s.raw ? s.raw : s || {};

  // Position aus s.location, raw.location, s selbst und raw auslesen
  const fromLocation = extractLatLng((s && s.location) || raw.location || {});
  const fromSelf = extractLatLng(s);
  const fromRaw = extractLatLng(raw);

  const lat = fromLocation.lat ?? fromSelf.lat ?? fromRaw.lat;
  const lng = fromLocation.lng ?? fromSelf.lng ?? fromRaw.lng;

  /** @type {Spot} */
  const spot = {
    ...raw,
    ...s,
    lat,
    lng
  };

  // --- Struktur-Sicherungen ---------------------------------------

  // Kategorien / category
  if (Array.isArray(spot.categories)) {
    // category aus erster Kategorie spiegeln, falls nicht gesetzt
    if (!spot.category && spot.categories.length > 0) {
      spot.category = String(spot.categories[0]);
    }
  } else if (spot.category) {
    // categories aus category ableiten
    spot.categories = [String(spot.category)];
  } else if (raw.category) {
    // Fallback, falls nur im raw vorhanden
    spot.category = String(raw.category);
    spot.categories = [String(raw.category)];
  } else if (Array.isArray(raw.categories)) {
    spot.categories = raw.categories.slice();
    if (!spot.category && raw.categories.length > 0) {
      spot.category = String(raw.categories[0]);
    }
  } else {
    // keine Kategorie-Infos vorhanden – leeres Array
    spot.categories = [];
  }

  // Tags immer als Array
  if (!Array.isArray(spot.tags)) {
    if (Array.isArray(raw.tags)) {
      spot.tags = raw.tags.slice();
    } else if (typeof raw.tags === "string") {
      spot.tags = raw.tags
        .split(/[;,]+/)
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      spot.tags = [];
    }
  }

  return spot;
}

// ------------------------------------------------------
// Haupt-API
// ------------------------------------------------------

/**
 * Lädt die App-Daten (Index + Spots).
 *  - bevorzugt Netzwerk (dataLoader)
 *  - bei Fehlern: Fallback auf localStorage-Cache
 *
 * Rückgabe:
 *  {
 *    spots: Spot[],
 *    index: AppIndex|null,
 *    fromCache: boolean,
 *    error?: any
 *  }
 *
 * @returns {Promise<{spots: Spot[], index: AppIndex|null, fromCache: boolean, error?: any}>}
 */
export async function loadData() {
  // Bereits geladen? Dann direkt liefern.
  // Die Herkunft bleibt auch bei weiteren Aufrufen erhalten.
  if (hasLoaded) {
    return { spots, index: indexData, fromCache: loadedFromCache };
  }

  try {
    const appData = await loadAppData();

    indexData = (appData && appData.index) || null;

    const rawSpots = Array.isArray(appData.spots) ? appData.spots : [];
    spots = rawSpots.map(normalizeRawSpot);

    // Offline-Cache aktualisieren
    saveSpotsToCache(spots, indexData);
    hasLoaded = true;
    loadedFromCache = !navigator.onLine;

    return { spots, index: indexData, fromCache: loadedFromCache };
  } catch (err) {
    // Fallback: Cache
    const cached = loadSpotsFromCache();
    if (cached && Array.isArray(cached.spots) && cached.spots.length) {
      spots = cached.spots.map(normalizeRawSpot);
      hasLoaded = true;
      loadedFromCache = true;
      indexData = cached.index || null;

      return {
        spots,
        index: indexData,
        fromCache: true,
        error: err
      };
    }

    // Kein Cache → Fehler nach oben durchreichen
    throw err;
  }
}

/**
 * Aktuell geladene Spots zurückgeben.
 * Gibt immer das im Modul gehaltene Array zurück
 * (evtl. leer, wenn loadData() noch nicht erfolgreich lief).
 *
 * @returns {Spot[]}
 */
export function getSpots() {
  return spots;
}

/**
 * Index-Daten (z.B. defaultLocation), falls du sie später brauchst.
 * Kann null sein, insbesondere wenn:
 *  - loadData() noch nicht ausgeführt wurde oder
 *  - der Cache aus einer älteren Version ohne index stammt.
 *
 * @returns {AppIndex|null}
 */
export function getIndexData() {
  return indexData;
}