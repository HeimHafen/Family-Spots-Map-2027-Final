import { PLACE_TYPES, WORLDS, getPlaceTypes, getWorlds, FACETS, facetValue } from "../categories.js";
// js/filters/tags.js
"use strict";

import { getLanguage } from "../i18n.js?v=20261106-app-feinschliff-16";

import { CATEGORY_TAGS, CATEGORY_LABELS_DE, CATEGORY_LABELS_EN, CATEGORY_LABELS_DA } from "../config.js";

/**
 * @typedef {import("../app.js").Spot} Spot
 */

/**
 * Liefert den primären Anzeigenamen eines Spots.
 * @param {Spot} spot
 * @returns {string}
 */
export function getSpotName(spot) {
  return (
    spot[`title_${getLanguage()}`] ||
    spot[`name_${getLanguage()}`] ||
    spot.title ||
    spot.name ||
    spot.spotName ||
    (spot.id ? String(spot.id) : "Spot")
  );
}

/**
 * Liefert eine Unterzeile (Ort / Adresse / Kurzbeschreibung).
 * @param {Spot} spot
 * @returns {string}
 */
export function getSpotSubtitle(spot) {
  // Translate display labels only; stored country codes and search aliases stay intact.
  const countries = {
    de: { DE: "Deutschland", DK: "Dänemark" },
    en: { DE: "Germany", DK: "Denmark" },
    da: { DE: "Tyskland", DK: "Danmark" }
  };
  const country = countries[getLanguage()]?.[spot.country] || spot.country;
  if (spot.city && country) return `${spot.city}, ${country}`;
  if (spot.city) return spot.city;
  if (spot.town && country) return `${spot.town}, ${country}`;
  if (spot.address) return spot.address;
  return spot[`subtitle_${getLanguage()}`] || spot.subtitle || spot.shortDescription || "";
}

/**
 * Liefert eine stabile ID für den Spot (für Favoriten etc.).
 * @param {Spot} spot
 * @returns {string}
 */
export function getSpotId(spot) {
  return String(spot.id != null && String(spot.id).trim() !== "" ? spot.id : getSpotName(spot));
}

/**
 * Liefert alle Kategorie-Slugs eines Spots.
 * @param {Spot} spot
 * @returns {string[]}
 */
export function getSpotCategorySlugs(spot) {
  const slugs = new Set();
  if (spot.category) slugs.add(String(spot.category));
  if (Array.isArray(spot.categories)) {
    spot.categories.forEach((c) => {
      if (c) slugs.add(String(c));
    });
  }
  if (spot.categorySlug) {
    slugs.add(String(spot.categorySlug));
  }
  return Array.from(slugs);
}

/**
 * Kombiniert Tags aus den Rohdaten mit Kategorie-basierten Tags (CATEGORY_TAGS).
 * Ergebnis wird gecached in spot._tagsMerged.
 * @param {Spot} spot
 * @returns {string[]}
 */
export function getSpotTags(spot) {
  if (Array.isArray(spot._tagsMerged)) return spot._tagsMerged;

  const tagSet = new Set();

  // 1. Tags aus den Rohdaten (falls vorhanden)
  if (Array.isArray(spot.tags)) {
    spot.tags.forEach((tag) => {
      if (tag) tagSet.add(String(tag));
    });
  }

  // 2. Kategorien einsammeln (category + categories[])
  const catSlugs = new Set();

  if (spot.category) {
    catSlugs.add(String(spot.category));
  }

  if (Array.isArray(spot.categories)) {
    spot.categories.forEach((c) => {
      if (c) catSlugs.add(String(c));
    });
  }

  // Optional: falls du categorySlug verwendest, diesen auch berücksichtigen
  if (spot.categorySlug) {
    catSlugs.add(String(spot.categorySlug));
  }

  // 3. Kategorie-Tags aus CATEGORY_TAGS hinzumischen
  catSlugs.forEach((slug) => {
    const catTags = CATEGORY_TAGS[slug];
    if (Array.isArray(catTags)) {
      catTags.forEach((tag) => {
        if (tag) tagSet.add(String(tag));
      });
    }
  });

  const merged = Array.from(tagSet);
  spot._tagsMerged = merged;
  return merged;
}

/**
 * Suchtext aus Spot zusammenbauen und cachen.
 * @param {Spot} spot
 * @returns {string}
 */
// Search is language-independent: accents and common German/Danish keyboard
// transcriptions must resolve to the same places, without changing display text.
export function normalizeSearchText(value) {
  return String(value ?? "").toLowerCase().normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/ø/g, "o").replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/œ/g, "oe")
    .replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u").replace(/aa/g, "a")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// Additional query words are derived only from existing place types.
// No amenities, entry prices or overnight permissions are inferred from them.
const PLACE_SEARCH_ALIASES = {
  "playground": [
    "Kinderspielplatz",
    "Kinderspielplätze",
    "Spieli"
  ],
  "adventure-playground": [
    "Abenteuerspielplätze",
    "Erlebnisspielplatz"
  ],
  "forest-playground": [
    "Spielplatz im Wald",
    "Waldspielplätze",
    "woodland playground"
  ],
  "indoor-playground": [
    "Indoorspielplatz",
    "Indoorspielplätze",
    "Hallenspielplatz",
    "drinnen spielen",
    "indoor play centre",
    "indoor play center",
    "indendørs legeplads"
  ],
  "water-playground": [
    "Wasserspielplätze",
    "water play area",
    "vandlegeplads"
  ],
  "activity-park": [
    "Aktivpark",
    "Bewegungsparks"
  ],
  "football": [
    "Fußballplatz",
    "Fussballplatz",
    "Fußball spielen",
    "kicken",
    "soccer pitch"
  ],
  "basketball": [
    "Basketball spielen",
    "basketball court"
  ],
  "skatepark": [
    "Skaterpark",
    "Skateanlage",
    "Skateboard fahren",
    "skateboarding"
  ],
  "pumptrack": [
    "Pump Track",
    "Pumptrack fahren"
  ],
  "zoo": [
    "Tiergarten",
    "zoologischer Garten",
    "Tierparks"
  ],
  "wildpark": [
    "Wildgehege",
    "Wildtierpark",
    "Wildtierparks",
    "wildlife park"
  ],
  "farm": [
    "Bauernhofbesuch",
    "Bauernhöfe",
    "farm visit"
  ],
  "walk": [
    "Spaziergang",
    "Spaziergänge",
    "spazieren",
    "Wandertour",
    "Wandertouren",
    "wandern",
    "hiking trail",
    "gåtur"
  ],
  "cycle": [
    "Radtour",
    "Radtouren",
    "Fahrradtour",
    "Fahrradtouren",
    "radeln",
    "Radfahren",
    "bike ride",
    "cycling route",
    "cykeltur"
  ],
  "viewpoint": [
    "Aussichtsplatz",
    "Aussicht genießen",
    "Aussicht geniessen",
    "lookout point",
    "udsigtspunkt"
  ],
  "barefoot": [
    "Barfußweg",
    "Barfussweg",
    "barfuß laufen",
    "barfuss laufen"
  ],
  "lake": [
    "Badeseen",
    "swimming lake"
  ],
  "beach": [
    "Strände",
    "Strandtag",
    "beach day"
  ],
  "sled": [
    "Schlitten fahren",
    "Schlittenfahren",
    "rodeln",
    "Rodelberg"
  ],
  "ice": [
    "Schlittschuh laufen",
    "Schlittschuhlaufen",
    "Eislaufen",
    "ice skating"
  ],
  "ropes": [
    "Hochseilgarten",
    "Kletterparks",
    "rope course"
  ],
  "boulder": [
    "bouldern",
    "Bouldering"
  ],
  "minigolf": [
    "Minigolfen",
    "Bahnengolf",
    "mini golf"
  ],
  "maze": [
    "Irrgärten",
    "Labyrinthe",
    "maze"
  ],
  "museum": [
    "Museen",
    "Museum besuchen"
  ],
  "openair-museum": [
    "Freiluftmuseum",
    "Open Air Museum",
    "frilandsmuseum"
  ],
  "library": [
    "Bücherei",
    "Buecherei",
    "Büchereien",
    "Stadtbibliothek"
  ],
  "picnic": [
    "Picknik",
    "Picknicken",
    "Picknick machen",
    "picnic area"
  ],
  "cafe": [
    "Kaffeepause",
    "Kaffee trinken",
    "coffee shop"
  ],
  "restaurant": [
    "Gaststätte",
    "Gaststaette",
    "Gaststätten",
    "essen gehen"
  ],
  "motorhome": [
    "Camperstopp",
    "Camper Stopp",
    "Wohnmobilpause",
    "Reisemobilpause"
  ],
  "camping": [
    "Zeltplatz",
    "Zeltplätze",
    "zelten",
    "campground"
  ],
  "rest-stop": [
    "Rast machen",
    "Reisepause"
  ]
};

export function buildSpotSearchText(spot) {
  if (spot._searchText) return spot._searchText;

  const parts = [
    ...getPlaceTypes(spot).flatMap(id => PLACE_SEARCH_ALIASES[id] || []),
    ...PLACE_TYPES.filter(item => getPlaceTypes(spot).includes(item.id)).flatMap(item => Object.values(item.label)),
    ...WORLDS.filter(item => getWorlds(spot).includes(item.id)).flatMap(item => Object.values(item.label)),
    getSpotName(spot),
    spot.title, spot.title_de, spot.title_en, spot.title_da,
    ...(Array.isArray(spot.search_aliases) ? spot.search_aliases : []),
    ...["de", "en", "da"].flatMap(lang => spot[`tags_${lang}`] || []),
    getSpotSubtitle(spot),
    ...["de", "en", "da"].flatMap(lang => [spot[`summary_${lang}`], spot[`description_${lang}`], spot[`name_${lang}`]]).filter(x => typeof x === "string"),
    ...(typeof spot.summary === "string" ? [spot.summary] : []),
    ...FACETS.filter(f => facetValue(spot, f.id) === "yes").flatMap(f => Object.values(f.label)),
    ...(facetValue(spot, "free") === "yes" ? ["kostenlos kostenfrei gratis free admission gratis adgang"] : []),
    spot.address, spot.city, spot.town, spot.region, spot.country,
    {DE: "Deutschland Germany Tyskland", DK: "Dänemark Denmark Danmark"}[spot.country],
    ...getSpotCategorySlugs(spot).flatMap(slug => [CATEGORY_LABELS_DE[slug], CATEGORY_LABELS_EN[slug], CATEGORY_LABELS_DA[slug]]),
    spot.category,
    ...(Array.isArray(spot.tags) ? spot.tags : []),
    ...getSpotTags(spot),
  ].filter(Boolean);

  const text = normalizeSearchText(parts.join(" "));
  spot._searchText = text;
  return text;
}
// Only localized display tags; filter matching uses the original tag data.
export function getSpotDisplayTags(spot) {
  const value = spot[`tags_${getLanguage()}`];
  return Array.isArray(value) ? value : (Array.isArray(spot.tags) ? spot.tags : []);
}

// Shared AND matching: every word must occur, irrespective of word order.
export function matchesSpotSearch(spot, query) {
  if (!String(query ?? "").trim()) return true;
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.some(term => /^(kostenlos(?:e|en|er|es)?|kostenfrei(?:e|en|er|es)?|gratis)$/.test(term)) && facetValue(spot, "free") !== "yes") return false;
  const haystack = buildSpotSearchText(spot);
  return terms.length > 0 && terms.every(term => haystack.includes(term));
}
