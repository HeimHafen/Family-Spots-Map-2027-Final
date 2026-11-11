// js/filters/apply.js
"use strict";

import { doesSpotMatchBaseFilters } from "./logic.js?v=20261010-unified-4";

/**
 * @typedef {import("../app.js").Spot} Spot
 */

/**
 * Wendet alle (nicht-geo) Filter auf die Spots an.
 *
 * @param {Spot[]} spots
 * @param {Object} filterState siehe doesSpotMatchBaseFilters
 * @returns {Spot[]}
 */
export function filterSpots(
  spots,
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
    favorites,
    activeFilterIds,
  }
) {
  const activeTagFilters =
    activeFilterIds instanceof Set
      ? activeFilterIds
      : new Set(activeFilterIds || []);

  const trimmedSearch = (searchTerm || "").trim();

  return spots.filter((spot) =>
    doesSpotMatchBaseFilters(spot, {
      plusActive: !!plusActive,
      searchTerm: trimmedSearch,
      categoryFilter: categoryFilter || "",
      ageFilter: ageFilter || "all",
      moodFilter: moodFilter || null,
      travelMode: travelMode || null,
      onlyBigAdventures: !!onlyBigAdventures,
      onlyVerified: !!onlyVerified,
      onlyFavorites: !!onlyFavorites,
      activeTagFilters,
      favorites,
    })
  );
}