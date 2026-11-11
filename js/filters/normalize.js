// js/filters/normalize.js
"use strict";

import { buildSpotSearchText } from "./tags.js?v=20261010-unified-4";

/**
 * @typedef {import("../app.js").Spot} Spot
 */

/**
 * Hilfsfunktion: String/Array-Feld in ein String-Array normalisieren.
 * @param {string[]|string|undefined|null} raw
 * @returns {string[]}
 */
export function normalizeArrayField(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (v == null ? "" : String(v).trim()))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Altersgruppen normalisieren und cachen.
 * @param {Spot} spot
 * @returns {string[]}
 */
export function getSpotAgeGroups(spot) {
  if (Array.isArray(spot._ageGroups)) return spot._ageGroups;
  const raw = spot.ageGroups || spot.age || spot.ages;
  const result = normalizeArrayField(raw);
  spot._ageGroups = result;
  return result;
}

/**
 * Stimmungen normalisieren und cachen.
 * @param {Spot} spot
 * @returns {string[]}
 */
export function getSpotMoods(spot) {
  if (Array.isArray(spot._moods)) return spot._moods;
  const raw = spot.moods || spot.moodTags || spot.mood;
  const result = normalizeArrayField(raw);
  spot._moods = result;
  return result;
}

/**
 * Reise-Modi normalisieren und cachen.
 * @param {Spot} spot
 * @returns {string[]}
 */
export function getSpotTravelModes(spot) {
  if (Array.isArray(spot._travelModes)) return spot._travelModes;
  const raw = spot.travelModes || spot.travel || spot.tripModes;
  const result = normalizeArrayField(raw);
  spot._travelModes = result;
  return result;
}

/**
 * Vereinheitlichte Normalisierung fÃÂ¼r alle Spots.
 * @param {Spot} raw
 * @returns {Spot}
 */
export function normalizeSpot(raw) {
  /** @type {Spot} */
  const spot = { ...raw };

  // lon Ã¢ÂÂ lng normalisieren
  if (spot.lon != null && spot.lng == null) {
    spot.lng = spot.lon;
  }

  // falls keine Haupt-Kategorie gesetzt ist, erste Kategorie aus categories[] ÃÂ¼bernehmen
  if (
    !spot.category &&
    Array.isArray(spot.categories) &&
    spot.categories.length
  ) {
    spot.category = spot.categories[0];
  }

  // Caches vorbereiten
  buildSpotSearchText(spot);
  getSpotAgeGroups(spot);
  getSpotMoods(spot);
  getSpotTravelModes(spot);

  return spot;
}