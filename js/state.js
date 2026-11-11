// js/state.js
// ======================================================
// Zentraler UI- / App-State für Family Spots Map
// ======================================================

"use strict";

import { LANG_DE } from "./config.js";

/**
 * Globaler, aber in einem Modul gekapselter State.
 * Alle anderen Dateien greifen nur noch über dieses Objekt zu.
 */
export const state = {
  // Sprache & Theme
  currentLang: LANG_DE,

  // Map & Marker
  map: null,
  markersLayer: null,

  // Daten / Spots
  spots: [],
  filteredSpots: [],
  favorites: new Set(),

  // Marker-Limit-Toast
  hasShownMarkerLimitToast: false,

  // Filter-States
  plusActive: false,
  moodFilter: null,       // "relaxed" | "action" | "water" | "animals" | null
  travelMode: null,       // "everyday" | "trip" | null
  radiusStep: 4,          // 0–4
  ageFilter: "all",       // "all" | "0-3" | "4-9" | "10+"
  searchTerm: "",
  categoryFilter: "",
  onlyBigAdventures: false,
  onlyVerified: false,
  onlyFavorites: false,
  filtersCollapsed: true,

  /** Aktive Tag-Filter (IDs aus FILTERS) */
  activeTagFilters: new Set()
};