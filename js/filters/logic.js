// js/filters/logic.js
"use strict";

import { CATEGORY_ACCESS, FEATURES, FILTERS } from "../config.js";
import {
  buildSpotSearchText,
  matchesSpotSearch,
  normalizeSearchText,
  getSpotCategorySlugs,
  getSpotId,
  getSpotTags,
} from "./tags.js?v=20261010-unified-4";
import { getSpotAgeGroups, getSpotMoods, getSpotTravelModes } from "./normalize.js?v=20261010-unified-4";

/**
 * @typedef {import("../app.js").Spot} Spot
 */

/**
 * Prüft, ob eine Kategorie eine Plus-/Add-on-Kategorie ist.
 * @param {string} slug
 * @returns {boolean}
 */
function isCategoryRestricted(slug) {
  if (!CATEGORY_ACCESS || !CATEGORY_ACCESS.perCategory) return false;
  const rule = CATEGORY_ACCESS.perCategory[slug];
  if (!rule) return false;

  const level = rule.level || CATEGORY_ACCESS.defaultLevel || "free";
  // "subscription" oder "addon" → Plus nötig
  return level !== "free";
}

/**
 * Prüft, ob ein Spot Plus/Add-on erfordert.
 * @param {Spot} spot
 * @returns {boolean}
 */
function isSpotPlusRestricted(spot) {
  // 1. Alte Flags auf Spots (falls du irgendwo plusOnly gesetzt hast)
  if (spot.plusOnly || spot.plus) return true;

  // 2. Kategorie-Regeln aus CATEGORY_ACCESS
  const slugs = getSpotCategorySlugs(spot);
  return slugs.some(isCategoryRestricted);
}

/**
 * Prüft, ob ein Spot "großes Abenteuer" ist.
 * @param {Spot} spot
 * @returns {boolean}
 */
function isSpotBigAdventure(spot) {
  return !!spot.bigAdventure || !!spot.isBigAdventure || !!spot.longTrip;
}

/**
 * Prüft, ob ein Spot verifiziert ist.
 * @param {Spot} spot
 * @returns {boolean}
 */
export function isSpotVerified(spot) {
  return !!spot.verified || !!spot.isVerified;
}

/**
 * OR-Liste aller Tags, die durch aktive Tag-Filter (FILTERS + activeTagFilters) gemeint sind.
 * @param {Set<string>} activeTagFilters
 * @returns {string[]}
 */
function getActiveFilterTags(activeTagFilters) {
  if (
    !activeTagFilters ||
    !(activeTagFilters instanceof Set) ||
    !activeTagFilters.size
  ) {
    return [];
  }

  if (!FILTERS || !Array.isArray(FILTERS) || !FILTERS.length) {
    return [];
  }

  const tagSet = new Set();

  FILTERS.forEach((filter) => {
    if (!filter || !filter.id || !Array.isArray(filter.tags)) return;
    if (!activeTagFilters.has(filter.id)) return;
    filter.tags.forEach((tag) => {
      if (tag) tagSet.add(String(tag));
    });
  });

  return Array.from(tagSet);
}

/**
 * Prüft, ob ein Spot alle (nicht-geo) Filter erfüllt.
 *
 * @param {Spot} spot
 * @param {Object} filterState
 * @param {boolean} filterState.plusActive
 * @param {string} filterState.searchTerm
 * @param {string} filterState.categoryFilter
 * @param {string} filterState.ageFilter
 * @param {string|null} filterState.moodFilter
 * @param {string|null} filterState.travelMode
 * @param {boolean} filterState.onlyBigAdventures
 * @param {boolean} filterState.onlyVerified
 * @param {boolean} filterState.onlyFavorites
 * @param {Set<string>} filterState.activeTagFilters
 * @param {Set<string>} filterState.favorites
 * @returns {boolean}
 */
const MOOD_TAGS = {
  relaxed: ["quiet", "relax", "nature", "park", "picnic", "viewpoint"],
  action: ["playground", "sports", "skate", "skatepark", "pumptrack", "climbing", "adventure", "movement", "active", "cycling"],
  water: ["water", "swimming", "lake", "beach"],
  animals: ["animals", "zoo", "wildlife", "farm"]
};

export function doesSpotMatchBaseFilters(
  spot,
  {
    plusActive,
    searchTerm,
    categoryFilter,
    ageFilter,
    moodFilter,
    travelMode,
    onlyBigAdventures,
    onlyVerified,
    onlyFavorites,
    activeTagFilters,
    favorites,
  }
) {
  // Plus / Add-ons:
  if (FEATURES.plus && !plusActive && isSpotPlusRestricted(spot)) {
    return false;
  }

  // Volltext-Suche
  if (searchTerm) {
    if (!matchesSpotSearch(spot, searchTerm)) return false;
  }

  // Kategorie
  if (categoryFilter) {
    const filterSlug = String(categoryFilter);
    const categories = [];

    if (Array.isArray(spot.categories)) {
      categories.push(...spot.categories.map(String));
    } else if (spot.category || spot.type) {
      categories.push(String(spot.category || spot.type));
    }

    if (!categories.some((c) => c === filterSlug)) return false;
  }

  // Alter
  if (ageFilter && ageFilter !== "all") {
    const ages = getSpotAgeGroups(spot);
    if (!ages.includes(ageFilter)) {
      return false;
    }
  }

  // Stimmung
  if (FEATURES.moodFilter && moodFilter) {
    const moods = getSpotMoods(spot);
    const themeTags = MOOD_TAGS[moodFilter] || [];
    const matchesTheme = getSpotTags(spot).some(tag => themeTags.includes(tag));
    if (!moods.includes(moodFilter) && !matchesTheme) return false;
  }

  // Travel-Mode
  if (FEATURES.travelMode && travelMode) {
    const modes = getSpotTravelModes(spot);
    if (modes.length && !modes.includes(travelMode)) {
      return false;
    }
  }

  // Große Abenteuer
  if (FEATURES.bigAdventureFilter && onlyBigAdventures && !isSpotBigAdventure(spot)) {
    return false;
  }

  // Verifiziert
  if (FEATURES.verifiedFilter && onlyVerified && !isSpotVerified(spot)) {
    return false;
  }

  // Nur Favoriten
  if (FEATURES.favorites && onlyFavorites) {
    const id = getSpotId(spot);
    if (!favorites || !(favorites instanceof Set) || !favorites.has(id)) {
      return false;
    }
  }

  // Tag-Filter (FILTERS): OR-Logik
  const activeTags = getActiveFilterTags(activeTagFilters);
  if (activeTags.length) {
    const spotTags = getSpotTags(spot);
    const hasAny = activeTags.some((tag) => spotTags.includes(tag));
    if (!hasAny) return false;
  }

  return true;
}
