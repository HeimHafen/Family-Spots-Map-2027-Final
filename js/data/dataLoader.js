// js/data/dataLoader.js
// ------------------------------------------------------
// Lädt Rohdaten für Family Spots Map aus data/spots.json
//  - Wird von js/data.js verwendet
//  - Liefert immer ein Objekt { spots, index }
// ------------------------------------------------------

"use strict";

/**
 * @typedef {Object<string, any>} AppIndex
 */

/**
 * @typedef {Object} AppDataPayload
 * @property {any[]} spots
 * @property {AppIndex|null} index
 */

/** Pfad zur Datenquelle relativ zu index.html */
const SPOTS_DATA_URL = "./data/spots.json?v=20261010-unified-4";

/**
 * Normalisiert den JSON-Response in ein konsistentes
 * AppData-Format { spots, index }.
 *
 * Unterstützte Formate von data/spots.json:
 *  - [ { ...Spot... }, ... ]
 *  - { spots: [ ... ], index: { ... } }
 *
 * Bei unerwarteter Struktur wird ein Fehler ausgelöst; gespeicherte Daten bleiben erhalten.
 *
 * @param {any} json
 * @returns {AppDataPayload}
 */
function normalizeAppData(json) {
  /** @type {any[]} */
  let spots = [];
  /** @type {AppIndex|null} */
  let index = null;

  if (Array.isArray(json)) {
    // Altes / einfaches Format: reines Array von Spots
    spots = json;
  } else if (json && typeof json === "object") {
    // Objekt-Format: { spots: [...], index: {...} }
    if (Array.isArray(json.spots)) {
      spots = json.spots;
    }

    if (json.index && typeof json.index === "object") {
      index = json.index;
    }
  } else {
    // Vollkommen unerwartete Struktur → entwickeln freundlich loggen
    console.warn(
      "[Family Spots] Unerwartetes Format in spots.json – erwarte Array oder Objekt mit { spots, index }."
    );
  }

  if (!Array.isArray(json) && !Array.isArray(json?.spots)) {
    throw new Error("[Family Spots] spots.json muss ein Array oder ein Objekt mit spots enthalten.");
  }
  if (spots.some(spot => !spot || typeof spot !== "object" || Array.isArray(spot))) {
    throw new Error("[Family Spots] Ungültiger Spot-Datensatz.");
  }
  return { spots, index };
}

/**
 * Lädt die App-Daten (Spots + optionale Index-Metadaten) aus JSON.
 *
 * Erwartete Formate von data/spots.json:
 *  - [ { ...Spot... }, ... ]
 *  - { spots: [ ... ], index: { ... } }
 *
 * Fehlerfälle:
 *  - Netzwerkproblem       → Error mit Hinweis "Netzwerkfehler"
 *  - HTTP-Status != 2xx    → Error mit HTTP-Code
 *  - Ungültiges JSON       → Error mit Hinweis "Ungültiges JSON-Format"
 *
 * @returns {Promise<AppDataPayload>}
 * @throws {Error} wenn Fetch oder JSON-Parsing fehlschlägt
 */
export async function fetchJsonWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { cache: "no-cache", signal: controller.signal });
    if (!response.ok) throw new Error(`[Family Spots] HTTP ${response.status}: ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function loadAppData() {
  return normalizeAppData(await fetchJsonWithTimeout(SPOTS_DATA_URL));
}