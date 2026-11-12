import { initCycleTours } from "./ui/cycle-tours.js?v=20261112-touren-filter-icons";
import { initTourenwelt } from "./ui/tourenwelt.js?v=20261112-touren-filter-icons";
// js/app.js
// ======================================================
// Family Spots Map – Hauptlogik
// UI, State, Tilla, Navigation und Erinnerungen
//
// Map- und Filterlogik: map.js / filters.js
// Daten und Plus-Logik: data.js / features/plus.js
// ======================================================

"use strict";

// Track the interaction that placed focus. A returned photo focus must not
// leave a tap ring, while Tab navigation keeps its visible keyboard marker.
document.documentElement.dataset.fsmFocusModality = "pointer";
document.addEventListener("pointerdown", () => {
  document.documentElement.dataset.fsmFocusModality = "pointer";
}, { capture: true, passive: true });
document.addEventListener("keydown", event => {
  if (["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) {
    document.documentElement.dataset.fsmFocusModality = "keyboard";
  }
}, { capture: true });

import { evaluateSelection, selectShortcut, shortcutIsSelected, shortcutLabel } from "./filter-model.js";
import { createMapToolIcon } from "./ui/map-toolbar.js";
import { createHomeNavigation } from "./ui/home-navigation.js?v=20261112-fahrrad-test";
import { initCommunityPlay } from "./features/community-play.js?v=20261109-details-v43";
import { initPrivateCalendar } from "./features/gemeinsam-erleben-rc.js?v=20261112-fahrrad-test";
import { describeFilters } from "./ui/filter-summary.js";
import { resultsCopy } from "./ui/filter-results.js";
import { categoryIcon } from "./ui/category-icons.js";
import { createCategoryExplorer } from "./ui/category-explorer.js?v=20261109-details-v43";
import { hasCategorySelection, isExpiredEvent, FACETS, labelOf, facetValue, placeTypeLabels } from "./categories.js";

import { initFilterSelects } from "./ui/filter-select.js";

import { initDiaryView } from "./features/diary-view.js";
import { initDiaryPremium } from "./features/diary-premium.js";

import { initDaylogPhotos } from "./features/daylog-photos.js?v=20261105-photo-v928";

import { initPersonalBackup } from "./features/personal-backup.js";

import { readDaylogDrafts, writeDaylogDrafts } from "./features/daylog-drafts.js";

import { readFavorites, readDaylogEntries, changeFavorite, changeDaylog } from "./features/personal-storage.js?v=20261109-details-v43";

import { createHeartIcon, createCrownIcon, setTextWithHearts } from "./utils/dom.js?v=20261109-details-v43";

import { I18N, getCurrentPlayIdea } from "./i18n.js?v=20261109-details-v43";
import { getSpotDisplayTags, getSpotTags } from "./filters/tags.js?v=20261109-details-v43";

import { createModalController } from "./ui/modal.js";
import { createSpotDetailsController, createSpotTypeChips, getSpotHighlights } from "./ui/spot-details.js?v=20261109-details-v43";
import { initMenu } from "./ui/menu.js?v=20261109-details-v43";
import { initLanguageSwitcher } from "./ui/language.js";
import { initSkipToSpots } from "./ui/skip-to-spots.js";

import { TillaCompanion } from "./features/tilla.js?v=20261030-focus-fields-77";

import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DAYLOG_STORAGE_KEY,
  PLUS_STORAGE_KEY,
  LANG_DE,
  LANG_EN,
  LANG_DA,
  RADIUS_STEPS_KM,
  MAX_MARKERS_RENDER,
  FEATURES,
  CATEGORY_GROUPS,
  CATEGORY_GROUP_LABELS,
  CATEGORY_LABELS_DE,
  CATEGORY_LABELS_EN,
  HEADER_TAGLINE_TEXT,
  FILTERS,
  CATEGORY_ACCESS,
  CATEGORY_LABELS_DA
} from "./config.js";

import {
  normalizeSpot,
  getSpotAgeGroups,
  filterSpots,
  getSpotName,
  getSpotSubtitle,
  getSpotId
} from "./filters.js?v=20261109-details-v43";

import {
  initMap,
  updateMapStatusLanguage,
  renderMarkers,
  hasValidLatLng
} from "./map.js?v=20261112-fahrrad-test";

import { initRouter } from "./router.js?v=20261109-details-v43";
import { initToast, showToast } from "./toast.js";
import { loadData } from "./data.js?v=20261109-details-v43";

import {
  getPlusStatus,
  formatPlusStatus,
  redeemPartnerCode,
  isPlusCategory
} from "./features/plus.js?v=20261109-details-v43";

// ------------------------------------------------------
// Debug
// ------------------------------------------------------

const DEBUG = false;

const log = (...args) => {
  if (DEBUG) console.log(...args);
};

const warn = (...args) => {
  if (DEBUG) console.warn(...args);
};

// ------------------------------------------------------
// Menü, Sprache und Skip-Link
// ------------------------------------------------------

const { closeMenu } = initMenu();
initCommunityPlay({ getLanguage: () => currentLang, closeMenu });
initPrivateCalendar({
  closeMenu,
  captureMemory(title) {
    appRouter?.switchRoute("diary");
    document.getElementById("diary-new-memory")?.click();
    if (daylogTextEl && !daylogTextEl.value.trim() && !daylogPhotos?.hasDraft()) {
      daylogTextEl.value = title;
      daylogTextEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
});

initLanguageSwitcher();
initSkipToSpots(closeMenu);
let tourenwelt;
const existingCycleDetails = initCycleTours({
  getLanguage: () => currentLang,
  onBackToOverview: () => tourenwelt?.open(),
  closeMenu,
  openStop: closeTours => {
    const stop = spots.find(spot => getSpotId(spot) === "platz_am_schachspiel_stroebeck");
    if (!stop) return false;
    closeTours();
    appRouter?.switchRoute("map");
    focusSpotOnMap(stop);
    return true;
  },
});
tourenwelt = initTourenwelt({
  getLanguage: () => currentLang,
  closeMenu,
  openLegacyTour: country => existingCycleDetails?.openTourDetail(country),
});

// ------------------------------------------------------
// Typdefinitionen
// ------------------------------------------------------

/**
 * @typedef {Object} Spot
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {number} [lon]
 * @property {string|number} [id]
 * @property {string} [title]
 * @property {string} [name]
 * @property {string} [spotName]
 * @property {string} [city]
 * @property {string} [town]
 * @property {string} [country]
 * @property {string} [category]
 * @property {string} [categorySlug]
 * @property {string[]} [categories]
 * @property {string[]} [tags]
 * @property {string} [subtitle]
 * @property {string} [shortDescription]
 * @property {string} [summary_de]
 * @property {string} [summary_en]
 * @property {string} [summary_da]
 * @property {string} [poetry]
 * @property {string} [description]
 * @property {string} [text]
 * @property {string} [address]
 * @property {string} [postcode]
 * @property {number} [visit_minutes]
 * @property {boolean} [plusOnly]
 * @property {boolean} [plus]
 * @property {boolean} [bigAdventure]
 * @property {boolean} [isBigAdventure]
 * @property {boolean} [longTrip]
 * @property {boolean} [verified]
 * @property {boolean} [isVerified]
 * @property {string[]|string} [ageGroups]
 * @property {string[]|string} [age]
 * @property {string[]|string} [ages]
 * @property {string[]|string} [moods]
 * @property {string[]|string} [moodTags]
 * @property {string[]|string} [mood]
 * @property {string[]|string} [travelModes]
 * @property {string[]|string} [travel]
 * @property {string[]|string} [tripModes]
 * @property {string} [_searchText]
 * @property {string[]} [_ageGroups]
 * @property {string[]} [_moods]
 * @property {string[]} [_travelModes]
 * @property {string[]} [_tagsMerged]
 * @property {string} [validFrom]
 * @property {string} [validTo]
 * @property {string} [valid_from]
 * @property {string} [valid_to]
 */

// ------------------------------------------------------
// Übersetzungen
// ------------------------------------------------------

const t = (key, fallback) =>
  typeof I18N !== "undefined" && typeof I18N.t === "function"
    ? I18N.t(key, fallback)
    : (fallback ?? key);

function toastKey(key, fallbackText) {
  const translated = t(key, null);

  if (translated && translated !== key) {
    showToast(key);
  } else if (fallbackText) {
    showToast(fallbackText);
  } else {
    showToast(key);
  }
}

// ------------------------------------------------------
// Hilfsfunktionen
// ------------------------------------------------------

function debounce(fn, delay = 200) {
  let timeoutId;

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------
// Tilla
// ------------------------------------------------------

function safeTillaCall(method, ...args) {
  try {
    if (tilla && typeof tilla[method] === "function") {
      tilla[method](...args);
    }
  } catch (err) {
    warn("[Family Spots] Tilla call failed:", method, err);
  }
}

// ------------------------------------------------------
// Globaler UI-State
// ------------------------------------------------------

let currentLang = LANG_DE;

/** @type {any} */
let map = null;

/** @type {any} */
let markersLayer = null;

/** @type {Spot[]} */
let spots = [];
let spotAliases = new Map();
const canonicalSpotId = id => spotAliases.get(id) ?? id;
const canonicalFavorites = ids => new Set([...ids].map(canonicalSpotId));

/** @type {Spot[]} */
let filteredSpots = [];
let spotsLoadState = "idle";
let spotsLoadHasFailed = false;

let favorites = new Set();

// Mein Tag
let daylogEntries = [];
// Persisted memories exclude recovered drafts of entries deleted in another tab.
let savedDaylogEntries = [];

// Bearbeitungsentwürfe bleiben bei Änderungen anderer Einträge erhalten.
const daylogEditDrafts = new Map();
const daylogEditBases = new Map();
const daylogEditConflicts = new Set();
let daylogDraftsReady = false;
let daylogDraftStorageAvailable = true;
let hasShownDraftStorageWarning = false;
const favoritePendingIds = new Set();
let daylogMutationPending = false;
let daylogSyncPending = false;
let daylogReadGeneration = 0;
let favoriteReadGeneration = 0;
let daylogIdSequence = 0;

// Toast-Entprellung
let hasShownMarkerLimitToast = false;

// Filter
let plusActive = false;
let plusStateSignature = null;
let plusRefreshTimer = null;
let moodFilter = null;
let travelMode = null;
let radiusStep = 4;
let ageFilter = "all";
let searchTerm = "";
let categoryFilter = "";
let categoryExplorer = null;
let onlyBigAdventures = false;
let onlyVerified = false;
let onlyFavorites = false;
let filtersCollapsed = true;

let activeTagFilters = new Set();

// ------------------------------------------------------
// Standort
// ------------------------------------------------------

/**
 * @type {{lat:number,lng:number,accuracy?:number,ts?:number}|null}
 */
let userLocation = null;

/** @type {number|null} */
let geoWatchId = null;
let locationWatchGeneration = 0;

let userLocationMarker = null;
let userAccuracyCircle = null;
let pendingPreciseLocate = false;
let preciseLocateUntil = 0;
let locating = false;
let locationRenderTimer = null;
let lastLocationRenderAt = 0;
const LOCATION_MAX_AGE_MS = 60000;
let locationExpiryTimer = null;

function hasFreshUserLocation() {
  return !!userLocation && Number.isFinite(userLocation.ts) &&
    Date.now() - userLocation.ts >= -5000 &&
    Date.now() - userLocation.ts < LOCATION_MAX_AGE_MS;
}

function expireUserLocation({ force = false } = {}) {
  if (!userLocation || (!force && hasFreshUserLocation())) return;
  userLocation = null;
  pendingPreciseLocate = false;
  if (locationExpiryTimer !== null) clearTimeout(locationExpiryTimer);
  locationExpiryTimer = null;
  if (locationRenderTimer !== null) clearTimeout(locationRenderTimer);
  locationRenderTimer = null;
  userLocationMarker?.remove();
  userAccuracyCircle?.remove();
  userLocationMarker = null;
  userAccuracyCircle = null;
  refreshDetailLocation();
  applyFiltersAndRender();
}

function scheduleLocationExpiry() {
  if (locationExpiryTimer !== null) clearTimeout(locationExpiryTimer);
  locationExpiryTimer = setTimeout(() => {
    locationExpiryTimer = null;
    expireUserLocation();
  }, Math.max(0, LOCATION_MAX_AGE_MS - (Date.now() - userLocation.ts)));
}

function locationText(de, en, da) {
  return currentLang === LANG_EN ? en : currentLang === LANG_DA ? da : de;
}

function locationAccuracyText() {
  const accuracy = userLocation?.accuracy;
  if (!Number.isFinite(accuracy)) return "";
  const locale = currentLang === LANG_EN ? "en-GB" : currentLang === LANG_DA ? "da-DK" : "de-DE";
  const distance = accuracy >= 1000
    ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(accuracy / 1000)} km`
    : `${Math.max(1, Math.round(accuracy))} m`;
  return `±${distance}`;
}

function updateUserLocationMarker() {
  if (!map || !userLocation || typeof L === "undefined") return;
  const point = [userLocation.lat, userLocation.lng];
  const radius = Number.isFinite(userLocation.accuracy) ? userLocation.accuracy : 0;
  if (!userAccuracyCircle) {
    userAccuracyCircle = L.circle(point, {
      radius, color: "#f3831a", weight: 1, opacity: 0.5,
      fillColor: "#f3831a", fillOpacity: 0.12, interactive: false
    }).addTo(map);
  } else {
    userAccuracyCircle.setLatLng(point).setRadius(radius);
  }
  if (!userLocationMarker) {
    userLocationMarker = L.circleMarker(point, {
      radius: 7, color: "#ffffff", weight: 3, fillColor: "#f3831a",
      fillOpacity: 1, className: "fsm-user-location"
    }).addTo(map);
  } else {
    userLocationMarker.setLatLng(point);
  }
  const label = `${locationText("Euer Standort", "Your location", "Jeres position")}${radius ? ` · ${locationAccuracyText()}` : ""}`;
  if (userLocationMarker.getTooltip()) userLocationMarker.setTooltipContent(label);
  else userLocationMarker.bindTooltip(label);
  const element = userLocationMarker.getElement();
  element?.setAttribute("role", "img");
  element?.setAttribute("aria-label", label);
}

function scheduleLocationRender() {
  if (locationRenderTimer !== null) return;
  const delay = Math.max(0, 5000 - (Date.now() - lastLocationRenderAt));
  locationRenderTimer = setTimeout(() => {
    locationRenderTimer = null;
    lastLocationRenderAt = Date.now();
    applyFiltersAndRender();
    refreshDetailLocation();
  }, delay);
}

let hasShownRadiusDisabledToast = false;

function setUserLocation(lat, lng, accuracy, timestamp = Date.now()) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  if (!Number.isFinite(accuracy) || accuracy < 0) return false;
  const ts = Number.isFinite(timestamp) ? timestamp : Date.now();
  if (Date.now() - ts > 30000 || ts > Date.now() + 5000) return false;
  if (userLocation) {
    if (ts < userLocation.ts) return false;
    const previousAccuracy = userLocation.accuracy ?? Infinity;
    // A recent precise fix must not be replaced by a much coarser network fix.
    if (Date.now() - userLocation.ts < 30000 && accuracy > 100 && accuracy > previousAccuracy * 3) return false;
    const moved = typeof L !== "undefined" && typeof L.latLng === "function"
      ? L.latLng(userLocation.lat, userLocation.lng).distanceTo(L.latLng(lat, lng)) : Infinity;
    if (moved < Math.max(3, Math.min(accuracy, previousAccuracy) * 0.25) && accuracy >= previousAccuracy * 0.8) {
      userLocation.ts = ts;
      scheduleLocationExpiry();
      return false;
    }
  }

  userLocation = {
    lat,
    lng,
    accuracy,
    ts
  };
  hasShownRadiusDisabledToast = false;
  scheduleLocationExpiry();
  updateUserLocationMarker();
  return true;
}

function getUserOriginLatLng() {
  if (!hasFreshUserLocation()) return null;
  if (typeof L === "undefined" || typeof L.latLng !== "function") {
    return null;
  }

  return L.latLng(userLocation.lat, userLocation.lng);
}

function requestUserLocationOnce(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 8000,
    maximumAge = 0
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation_unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const {
          latitude,
          longitude,
          accuracy
        } = pos.coords || {};

        setUserLocation(latitude, longitude, accuracy, pos.timestamp);
        if (userLocation && Date.now() - userLocation.ts <= 30000) resolve(userLocation);
        else reject(new Error("geolocation_invalid_position"));
      },
      (err) => reject(err),
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  });
}

function startLocationWatch() {
  if (!navigator.geolocation) return;
  if (geoWatchId != null) return;
  const generation = ++locationWatchGeneration;

  try {
    geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (generation !== locationWatchGeneration) return;
        const {
          latitude,
          longitude,
          accuracy
        } = pos.coords || {};

        const accepted = setUserLocation(latitude, longitude, accuracy, pos.timestamp);
        if (accepted) scheduleLocationRender();
        if (Date.now() > preciseLocateUntil) pendingPreciseLocate = false;
        if (pendingPreciseLocate && hasFreshUserLocation() && userLocation.accuracy <= 100) {
          pendingPreciseLocate = false;
          map?.setView([userLocation.lat, userLocation.lng], 16, { animate: false });
          showToast("toast_location_ok");
        }
      },
      (error) => {
        if (generation !== locationWatchGeneration) return;
        pendingPreciseLocate = false;
        if (error?.code === 1) {
          stopLocationWatch();
          expireUserLocation({ force: true });
        } else {
          expireUserLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } catch {
    geoWatchId = null;
  }
}

function stopLocationWatch() {
  locationWatchGeneration += 1;
  if (geoWatchId != null) {
    try { navigator.geolocation?.clearWatch(geoWatchId); } catch {}
  }
  geoWatchId = null;
  if (locationRenderTimer !== null) clearTimeout(locationRenderTimer);
  locationRenderTimer = null;
}

// ------------------------------------------------------
// Routen
// ------------------------------------------------------

function getRouteUrlsForSpotFromUserLocation(spot) {
  // A retained historic pin is not a confirmed destination.
  if (spot?.quality_review_status === "location_assignment_unconfirmed") return null;
  if (!hasValidLatLng(spot)) return null;

  const destLat = spot.lat;
  const destLng = spot.lng;

  const origin = hasFreshUserLocation()
    ? {
        lat: userLocation.lat,
        lng: userLocation.lng
      }
    : null;

  const apple = origin
    ? `https://maps.apple.com/?saddr=${encodeURIComponent(origin.lat + "," + origin.lng)}&daddr=${encodeURIComponent(destLat + "," + destLng)}`
    : `https://maps.apple.com/?daddr=${encodeURIComponent(destLat + "," + destLng)}`;

  const google = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.lat + "," + origin.lng)}&destination=${encodeURIComponent(destLat + "," + destLng)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destLat + "," + destLng)}`;

  return { apple, google };
}

// ------------------------------------------------------
// DOM-Referenzen
// ------------------------------------------------------

let languageSwitcherEl;
let languageSwitcherFlagEl;
let btnLocateEl;
let btnHelpEl;
let viewMapEl;
let viewAboutEl;
let appRouter = null;
let diaryView = null;
let bottomNavButtons;
let bottomNavMapLabelEl;
let bottomNavAboutLabelEl;
let sidebarEl;
let filterSectionEl;
let btnToggleFiltersEl;
let btnToggleViewEl;
let filterSearchEl;
let filterCategoryEl;
let filterAgeEl;
let filterRadiusEl;
let filterRadiusMaxLabelEl;
let filterRadiusDescriptionEl;
let filterBigEl;
let filterVerifiedEl;
let filterFavoritesEl;
let spotListEl;
let spotDetailEl;
let tagFilterContainerEl;

// Plus und Mein Tag
let plusSectionEl;
let btnTogglePlusEl;
let daylogSectionEl;
let btnToggleDaylogEl;

let plusCodeInputEl;
let plusCodeSubmitEl;
let plusStatusTextEl;
let daylogPhotos;
let personalBackupBusy = false;
let daylogTextEl;
let daylogSaveEl;
let daylogLastSavedEl;
let daylogClearEl;
let daylogListEl;
let toastEl;

// Tilla
let tilla = null;

// Spielideen
let playIdeasBtnEl = null;

// Filter
let filterBodyEls = [];

// Fokus
let lastSpotTriggerEl = null;

const spotDetails = createSpotDetailsController({
  getElement: () => spotDetailEl,
  getListElement: () => spotListEl,
  getLastTrigger: () => lastSpotTriggerEl,
  getRelatedSpot: id => spots.find(spot => getSpotId(spot) === canonicalSpotId(id)),
  openRelatedSpot: spot => showSpotDetails(spot, { focus: true }),
  getLanguage: () => currentLang,
  getSpotId,
  getSpotName,
  getSpotSubtitle,
  getSpotMetaParts,
  getSpotDisplayTags,
  buildSpotBadges,
  getRouteUrlsForSpotFromUserLocation,
  syncFavButtonState,
  toggleFavorite,
  translate: t
});

// Filtermodal
let btnOpenFilterModalEl;
let filterModalEl;
let filterModalCloseEl;
let filterModalApplyEl;
let homeNavigation = null;
let filterModalResetEl;
let filterSummaryEl;

let isFilterModalOpen = false;
let lastFocusBeforeFilterModal = null;
let filterModalController = null;

// Skip-Link
let skipLinkEl;

// ------------------------------------------------------
// Statische Übersetzungen
// ------------------------------------------------------

function applyStaticI18n() {
  document.querySelectorAll("[data-i18n-de]").forEach((el) => {
    let attrName;

    if (currentLang === LANG_EN) {
      attrName = "data-i18n-en";
    } else if (currentLang === LANG_DA) {
      attrName = "data-i18n-da";
    } else {
      attrName = "data-i18n-de";
    }

    let text = el.getAttribute(attrName);

    if (!text) {
      text =
        el.getAttribute("data-i18n-de") ||
        el.getAttribute("data-i18n-en");
    }

    if (text) {
      if (el.matches("input, textarea")) el.setAttribute("placeholder", text);
      else el.textContent = text;
    }
  });
  // Accessibility: the filter's icon-only close action must follow the chosen language.
  const closeFilterButton = document.getElementById("filter-modal-close");
  if (closeFilterButton) {
    const labels = { de: "Filter schließen", en: "Close filters", da: "Luk filtre" };
    closeFilterButton.setAttribute("aria-label", labels[currentLang] || labels.de);
  }
}

function initLazyLoadImages() {
  if (!("loading" in HTMLImageElement.prototype)) return;

  document.querySelectorAll("img").forEach((img) => {
    if (!img.loading || img.loading === "auto") {
      img.loading = "lazy";
    }
  });
}

function updateMetaAndA11yFromI18n() {
  if (
    typeof I18N === "undefined" ||
    typeof I18N.t !== "function"
  ) {
    return;
  }

  const metaTitle = I18N.t("meta_title", document.title || "");

  if (metaTitle) document.title = metaTitle;

  const metaDescEl = document.querySelector(
    'meta[name="description"]'
  );

  if (metaDescEl) {
    const currentDesc = metaDescEl.getAttribute("content") || "";

    metaDescEl.setAttribute(
      "content",
      I18N.t("meta_description", currentDesc)
    );
  }

  const tillaImg = document.querySelector("#tilla-section img");

  if (tillaImg) {
    const fallback = tillaImg.alt || "";

    tillaImg.alt = I18N.t("alt_tilla_image", fallback);
  }
}

function updateHeaderTagline(lang) {
  const el = document.getElementById("header-tagline");
  if (!el) return;

  let text =
    (HEADER_TAGLINE_TEXT && HEADER_TAGLINE_TEXT[lang]) ||
    (HEADER_TAGLINE_TEXT && HEADER_TAGLINE_TEXT.de) ||
    el.textContent ||
    "";

  if (
    typeof I18N !== "undefined" &&
    typeof I18N.t === "function"
  ) {
    text = I18N.t("header_tagline", text) || text;
  }

  el.textContent = text;
}

// ------------------------------------------------------
// Sprache
// ------------------------------------------------------

function getInitialLang() {
  const pathLang = location.pathname.match(/\/(en|da)\/(?:index\.html)?$/)?.[1];
  if (pathLang) return pathLang;
  const stored = storageGet("fs_lang");

  if (
    stored === LANG_DE ||
    stored === LANG_EN ||
    stored === LANG_DA
  ) {
    return stored;
  }

  if (
    typeof I18N !== "undefined" &&
    typeof I18N.getLanguage === "function"
  ) {
    const fromI18n = I18N.getLanguage();

    if (
      fromI18n === LANG_DE ||
      fromI18n === LANG_EN ||
      fromI18n === LANG_DA
    ) {
      return fromI18n;
    }
  }

  const htmlLang = (
    document.documentElement.lang ||
    navigator.language ||
    LANG_DE
  ).toLowerCase().slice(0, 2);

  if (htmlLang === "en") return LANG_EN;
  if (htmlLang === "da" || htmlLang === "dk") return LANG_DA;

  return LANG_DE;
}

function updateLanguageSwitcherVisual() {
  if (!languageSwitcherEl) return;

  if (languageSwitcherFlagEl) {
    let src = "assets/flags/flag-de.svg";
    let alt = "Deutsch";

    if (currentLang === LANG_EN) {
      src = "assets/flags/flag-gb.svg";
      alt = "English";
    } else if (currentLang === LANG_DA) {
      src = "assets/flags/flag-dk.svg";
      alt = "Dansk";
    }

    languageSwitcherFlagEl.src = src;
    languageSwitcherFlagEl.alt = alt;
  } else {
    let label = "DE";

    if (currentLang === LANG_EN) label = "EN";
    else if (currentLang === LANG_DA) label = "DA";

    languageSwitcherEl.textContent = label;
  }

  const ariaLabel =
    currentLang === LANG_DE
      ? "Sprache: Deutsch (Tippen für Dänisch)"
      : currentLang === LANG_DA
        ? "Sprog: dansk (tryk for engelsk)"
        : "Language: English (tap for German)";

  languageSwitcherEl.setAttribute("aria-label", ariaLabel);
}

function setLanguage(lang, { initial = false } = {}) {
  currentLang =
    lang === LANG_EN
      ? LANG_EN
      : lang === LANG_DA
        ? LANG_DA
        : LANG_DE;

  storageSet("fs_lang", currentLang);
  document.documentElement.lang = currentLang;

  try {
    if (
      typeof I18N !== "undefined" &&
      typeof I18N.setLanguage === "function"
    ) {
      I18N.setLanguage(currentLang);
    }
  } catch (err) {
    console.error(
      "[Family Spots] I18N.setLanguage fehlgeschlagen:",
      err
    );
  }

  updateMetaAndA11yFromI18n();
  updateHeaderTagline(currentLang);

  if (bottomNavMapLabelEl) {
    bottomNavMapLabelEl.textContent = t(
      "nav_map",
      bottomNavMapLabelEl.textContent || "Karte"
    );
  }

  if (bottomNavAboutLabelEl) {
    bottomNavAboutLabelEl.textContent = t(
      "nav_about",
      bottomNavAboutLabelEl.textContent || "Über"
    );
  }

  const aboutDe = document.getElementById("page-about-de");
  const aboutDa = document.getElementById("page-about-da");
  const aboutEn = document.getElementById("page-about-en");

  if (aboutDe && aboutEn && aboutDa) {
    const showDe = currentLang === LANG_DE;
    const showDa = currentLang === LANG_DA;
    const showEn = currentLang === LANG_EN;

    aboutDe.classList.toggle("hidden", !showDe);
    aboutDe.setAttribute("aria-hidden", showDe ? "false" : "true");

    aboutDa.classList.toggle("hidden", !showDa);
    aboutDa.setAttribute("aria-hidden", showDa ? "false" : "true");

    aboutEn.classList.toggle("hidden", !showEn);
    aboutEn.setAttribute("aria-hidden", showEn ? "false" : "true");
  }

  if (btnToggleFiltersEl) {
    const span = btnToggleFiltersEl.querySelector("span");

    if (span) {
      span.textContent = filtersCollapsed
        ? t("btn_show_filters", "Filter anzeigen")
        : t("btn_hide_filters", "Filter ausblenden");
    }
  }

  if (btnToggleViewEl && sidebarEl) {
    const sidebarHidden = sidebarEl.classList.contains("hidden");
    const span = btnToggleViewEl.querySelector("span");

    if (span) {
      span.textContent = sidebarHidden
        ? t("btn_show_list", "Liste anzeigen")
        : t("btn_only_map", "Nur Karte");
    }
  }

  if (filterSearchEl) {
    filterSearchEl.placeholder =
      currentLang === LANG_EN
        ? "Place, spot, keywords …"
        : currentLang === LANG_DA
          ? "Sted, spot, søgeord …"
          : "Ort, Spot, Stichwort …";
  }

  if (daylogTextEl && FEATURES.daylog) {
    daylogTextEl.placeholder =
      currentLang === LANG_EN
        ? "Today we found a place where time seemed to slow down."
        : currentLang === LANG_DA
          ? "I dag fandt vi et sted, hvor tiden føltes lidt langsommere."
          : "Heute haben wir einen Ort gefunden, an dem die Zeit kurz langsamer wurde.";
  }

  if (filterCategoryEl) populateCategoryOptions();
  if (tagFilterContainerEl) renderTagFilterChips();

  updateLanguageSwitcherVisual();
  applyStaticI18n();
  updateRadiusTexts();
  updateDaylogUI();
  updatePlusStatusText();
  updateFilterSummary();

  if (btnToggleFiltersEl) {
    const label = btnToggleFiltersEl.querySelector("span") || btnToggleFiltersEl;
    label.textContent = t(filtersCollapsed ? "btn_show_filters" : "btn_hide_filters");
  }
  for (const [sectionId, buttonId] of [["plus-section", "btn-toggle-plus"], ["daylog-section", "btn-toggle-daylog"]]) {
    const section = document.getElementById(sectionId);
    const button = document.getElementById(buttonId);
    if (section && button) {
      (button.querySelector("span") || button).textContent = t(section.open ? "btn_hide" : "btn_show");
      section.querySelector("summary")?.setAttribute("aria-expanded", String(section.open));
    }
  }
  if (spotsLoadState !== "idle") applyFiltersAndRender();
  const openSpot = spotDetails.getOpenSpot();
  if (openSpot) showSpotDetails(openSpot);
  if (tilla?.state === "play-idea") safeTillaCall("showPlayIdea", getCurrentPlayIdea());
  else safeTillaCall("onLanguageChanged");
  updateMapLanguage();

  if (!initial && document.getElementById("app-menu")?.hidden) {
    const headerTitle = document.querySelector(".header-title");

    if (headerTitle && typeof headerTitle.focus === "function") {
      headerTitle.focus();
    }
  }
}

// ------------------------------------------------------
// Kategorien
// ------------------------------------------------------

function getCategoryLabel(slug) {
  if (!slug) return "";

  let langMap;
  let fallbackMap;

  if (currentLang === LANG_EN) {
    langMap = CATEGORY_LABELS_EN;
    fallbackMap = CATEGORY_LABELS_DE;
  } else if (currentLang === LANG_DA) {
    langMap = CATEGORY_LABELS_DA;
    fallbackMap = CATEGORY_LABELS_DE;
  } else {
    langMap = CATEGORY_LABELS_DE;
    fallbackMap = CATEGORY_LABELS_EN;
  }

  return (
    (langMap && langMap[slug]) ||
    (fallbackMap && fallbackMap[slug]) ||
    slug.replace(/[_-]/g, " ")
  );
}

function getCategoryLabelWithAccess(slug) {
  const base = getCategoryLabel(slug);

  if (!CATEGORY_ACCESS || !CATEGORY_ACCESS.perCategory) {
    return base;
  }

  const access = CATEGORY_ACCESS.perCategory[slug];
  if (!access) return base;

  if (access.level === "subscription") {
    return base + " · Plus";
  }

  if (access.level === "addon") {
    let suffix;

    if (access.addonId === "addon_water") {
      suffix =
        currentLang === LANG_EN
          ? " · water add-on (Plus)"
          : currentLang === LANG_DA
            ? " · vandtilvalg (Plus)"
            : " · Wasser-Add-on (Plus)";
    } else if (access.addonId === "addon_rv") {
      suffix =
        currentLang === LANG_EN
          ? " · motorhome add-on (Plus)"
          : currentLang === LANG_DA
            ? " · autocampertilvalg (Plus)"
            : " · WoMo-Add-on (Plus)";
    } else {
      suffix =
        currentLang === LANG_EN
          ? " · add-on (Plus)"
          : currentLang === LANG_DA
            ? " · add-on (Plus)"
            : " · Add-on (Plus)";
    }

    return base + suffix;
  }

  return base;
}

function populateCategoryOptions() {
  if (!filterCategoryEl) return;

  const frag = document.createDocumentFragment();

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = t(
    "filter_category_all",
    "Alle Kategorien"
  );
  frag.appendChild(firstOption);

  const groupedSlugs = new Set();
  const availableCategories = new Set(spots.flatMap(spot => Array.isArray(spot.categories) ? spot.categories : (spot.category ? [spot.category] : [])));

  Object.entries(CATEGORY_GROUPS || {}).forEach(
    ([groupKey, slugs]) => {
      if (!Array.isArray(slugs) || !slugs.length) return;

      const groupLabel =
        (
          CATEGORY_GROUP_LABELS &&
          CATEGORY_GROUP_LABELS[currentLang] &&
          CATEGORY_GROUP_LABELS[currentLang][groupKey]
        ) ||
        groupKey;

      const optgroup = document.createElement("optgroup");
      optgroup.label = groupLabel;

      slugs.forEach((slug) => {
        if (!slug || !availableCategories.has(slug)) return;

        groupedSlugs.add(slug);

        const opt = document.createElement("option");
        opt.value = slug;
        opt.textContent = getCategoryLabelWithAccess(slug);

        optgroup.appendChild(opt);
      });

      if (optgroup.children.length) frag.appendChild(optgroup);
    }
  );

  const extraSet = new Set();

  spots.forEach((spot) => {
    if (Array.isArray(spot.categories)) {
      spot.categories.forEach((category) => {
        if (category && !groupedSlugs.has(category)) {
          extraSet.add(category);
        }
      });
    } else if (spot.category && !groupedSlugs.has(spot.category)) {
      extraSet.add(spot.category);
    }
  });

  if (extraSet.size > 0) {
    const extraGroup = document.createElement("optgroup");

    extraGroup.label =
      currentLang === LANG_EN
        ? "Other categories"
        : currentLang === LANG_DA
          ? "Andre kategorier"
          : "Weitere Kategorien";

    Array.from(extraSet)
      .sort((a, b) =>
        getCategoryLabel(a).toLowerCase().localeCompare(
          getCategoryLabel(b).toLowerCase(),
          currentLang === LANG_DE
            ? "de"
            : currentLang === LANG_DA
              ? "da"
              : "en"
        )
      )
      .forEach((slug) => {
        const opt = document.createElement("option");
        opt.value = slug;
        opt.textContent = getCategoryLabelWithAccess(slug);
        extraGroup.appendChild(opt);
      });

    frag.appendChild(extraGroup);
  }

  const selected = categoryFilter || "";

  filterCategoryEl.replaceChildren(frag);
  filterCategoryEl.value = selected;
}

// ------------------------------------------------------
// Radius und Geodistanz
// ------------------------------------------------------

function getMaxRadiusIndex() {
  return Math.max(0, (RADIUS_STEPS_KM?.length || 1) - 1);
}

function updateRadiusTexts() {
  if (
    !filterRadiusEl ||
    !filterRadiusMaxLabelEl ||
    !filterRadiusDescriptionEl
  ) {
    return;
  }

  let value = parseInt(filterRadiusEl.value, 10);

  if (Number.isNaN(value)) value = getMaxRadiusIndex();

  value = Math.min(
    Math.max(value, 0),
    getMaxRadiusIndex()
  );

  radiusStep = value;

  filterRadiusEl.value = String(radiusStep);
  filterRadiusEl.setAttribute("aria-valuenow", String(radiusStep));
  filterRadiusEl.setAttribute("aria-valuetext", radiusStep === getMaxRadiusIndex()
    ? t("filter_radius_max_label", "Alle Spots")
    : `${RADIUS_STEPS_KM[radiusStep]} km${hasFreshUserLocation() ? "" : locationText(" – noch nicht aktiv", " – not active yet", " – endnu ikke aktiv")}`);

  const maxIndex = getMaxRadiusIndex();

  if (radiusStep === maxIndex) {
    filterRadiusMaxLabelEl.textContent = t(
      "filter_radius_max_label",
      "Alle Spots"
    );

    filterRadiusDescriptionEl.textContent = t(
      "filter_radius_description_all",
      "Ohne Entfernungsgrenze."
    );
  } else {
    const km = RADIUS_STEPS_KM[radiusStep];
    const key = `filter_radius_description_step${radiusStep}`;

    filterRadiusMaxLabelEl.textContent = `${km} km`;

    filterRadiusDescriptionEl.textContent = hasFreshUserLocation()
      ? locationText(`${km} km Luftlinie rund um euren Standort.`, `${km} km straight-line distance from your location.`, `${km} km i fugleflugtslinje fra jeres position.`)
      : locationText("Noch nicht aktiv: Standort freigeben oder „Alle Spots“ wählen.", "Not active yet: share your location or choose All spots.", "Endnu ikke aktiv: del jeres position, eller vælg Alle spots.");
  }
}

function getEffectiveRadiusKm() {
  const maxIndex = getMaxRadiusIndex();

  const requested =
    RADIUS_STEPS_KM[radiusStep] ??
    RADIUS_STEPS_KM[maxIndex] ??
    Infinity;

  if (radiusStep === maxIndex) return requested;
  if (hasFreshUserLocation()) return requested;

  if (!hasShownRadiusDisabledToast) {
    hasShownRadiusDisabledToast = true;

    toastKey(
      "toast_location_unavailable_radius_disabled",
      currentLang === LANG_EN
        ? "Your location is unavailable – the radius filter is disabled."
        : currentLang === LANG_DA
          ? "Jeres position er ikke tilgængelig – radiusfilteret er slået fra."
          : "Standort nicht verfügbar – Radiusfilter ist deaktiviert."
    );
  }

  return Infinity;
}

function initRadiusSliderA11y() {
  if (!filterRadiusEl) return;

  const min = filterRadiusEl.min || "0";
  const max = filterRadiusEl.max || String(getMaxRadiusIndex());

  if (!filterRadiusEl.value) filterRadiusEl.value = max;

  filterRadiusEl.setAttribute("aria-valuemin", min);
  filterRadiusEl.setAttribute("aria-valuemax", max);
  filterRadiusEl.setAttribute(
    "aria-valuenow",
    filterRadiusEl.value
  );

  const onRadiusInput = debounce(async () => {
    // Reflect the requested radius immediately, including its inactive state.
    // Location permission may take seconds; the summary must not lag behind.
    applyFiltersAndRender();

    const maxIndex = getMaxRadiusIndex();

    if (
      radiusStep !== maxIndex &&
      !hasFreshUserLocation() &&
      navigator.geolocation
    ) {
      try {
        await requestUserLocationOnce({
          enableHighAccuracy: true,
          timeout: 9000
        });

        startLocationWatch();
      } catch {
        // The visible summary explains why the requested radius is inactive.
      }
      applyFiltersAndRender();
    }
  }, 120);

  filterRadiusEl.addEventListener("input", () => onRadiusInput());

  updateRadiusTexts();
}

function isSpotInRadius(spot, originLatLng, radiusKm) {
  if (
    !originLatLng ||
    typeof originLatLng.distanceTo !== "function"
  ) {
    return true;
  }

  if (!isFinite(radiusKm) || radiusKm === Infinity) return true;
  if (!hasValidLatLng(spot)) return false;

  if (typeof L === "undefined" || typeof L.latLng !== "function") {
    return true;
  }

  const spotLatLng = L.latLng(spot.lat, spot.lng);
  const distanceKm = originLatLng.distanceTo(spotLatLng) / 1000;

  return distanceKm <= radiusKm;
}

// ------------------------------------------------------
// Schnellfilter
// ------------------------------------------------------

function renderTagFilterChips() {
  if (!tagFilterContainerEl) return;

  if (!FILTERS || !Array.isArray(FILTERS) || !FILTERS.length) {
    tagFilterContainerEl.replaceChildren();
    return;
  }

  const frag = document.createDocumentFragment();

  FILTERS.forEach((filter) => {
    if (!filter || !filter.id) return;
    // These requirements now use evidence-based AND filters in the category explorer.
    if (["low-budget", "accessible", "stroller-friendly"].includes(filter.id)) {
      activeTagFilters.delete(filter.id);
      return;
    }

    const btn = document.createElement("button");

    btn.type = "button";
    btn.className = "tag-filter-chip btn-chip";
    btn.dataset.filterId = filter.id;

    // Availability describes the whole maintained dataset, never the current
    // viewport, other filters, or a user's Plus access.
    const unavailable = spotsLoadState === "ready" && !spots.some(spot =>
      Array.isArray(filter.tags) && filter.tags.some(tag => getSpotTags(spot).includes(tag))
    );
    if (unavailable) activeTagFilters.delete(filter.id);
    const isActive = activeTagFilters.has(filter.id);

    btn.classList.toggle("tag-filter-chip--active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");

    const label =
      (
        filter.label &&
        (filter.label[currentLang] || filter.label.de)
      ) ||
      filter.id;

    const unavailableText = locationText(
      "Hierzu fehlen noch gepflegte Angaben. Dieser Filter ist noch nicht verfügbar.",
      "This information has not been added yet. This filter is not available yet.",
      "Disse oplysninger er endnu ikke tilføjet. Filteret er ikke tilgængeligt endnu."
    );
    btn.textContent = unavailable
      ? `${label} · ${locationText("folgt", "pending", "kommer")}`
      : label;
    if (unavailable) {
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("aria-describedby", "filter-tags-helper");
      btn.setAttribute("aria-label", `${label}. ${unavailableText}`);
      btn.title = unavailableText;
    }

    btn.addEventListener("click", () => {
      if (unavailable) { showToast(unavailableText); return; }
      if (activeTagFilters.has(filter.id)) {
        activeTagFilters.delete(filter.id);
      } else {
        activeTagFilters.add(filter.id);
      }

      const active = activeTagFilters.has(filter.id);
      btn.classList.toggle("tag-filter-chip--active", active);
      btn.setAttribute("aria-pressed", String(active));
      applyFiltersAndRender();
    });

    frag.appendChild(btn);
  });

  tagFilterContainerEl.replaceChildren(frag);
}

// ------------------------------------------------------
// Filterzusammenfassung
// ------------------------------------------------------

function getMoodLabel(moodKey) {
  if (!moodKey) return "";

  if (currentLang === LANG_EN) {
    if (moodKey === "relaxed") return "Relaxed";
    if (moodKey === "action") return "Active";
    if (moodKey === "water") return "Swimming & water play";
    if (moodKey === "animals") return "Animal day";
  } else if (currentLang === LANG_DA) {
    if (moodKey === "relaxed") return "Afslappet";
    if (moodKey === "action") return "Aktiv";
    if (moodKey === "water") return "Badning og vandleg";
    if (moodKey === "animals") return "Dyredag";
  } else {
    if (moodKey === "relaxed") return "Entspannt";
    if (moodKey === "action") return "Bewegung";
    if (moodKey === "water") return "Baden & Wasserspiel";
    if (moodKey === "animals") return "Tier-Tag";
  }

  return "";
}

function updateFilterSummary() {
  if (!filterSummaryEl) return;
  const parts = selectionDescription();
  filterSummaryEl.textContent = parts.length
    ? locationText("Auswahl: ", "Selection: ", "Valg: ") + parts.join(" · ")
    : locationText("Alle verfügbaren Spots", "All available spots", "Alle tilgængelige spots");
}

function getFilterContext() {
  const maxIndex = getMaxRadiusIndex();

  const radiusKm =
    radiusStep >= 0 && radiusStep <= maxIndex
      ? (RADIUS_STEPS_KM[radiusStep] ?? Infinity)
      : (RADIUS_STEPS_KM[maxIndex] ?? Infinity);

  const origin = hasFreshUserLocation()
    ? {
        lat: userLocation.lat,
        lng: userLocation.lng
      }
    : null;

  return {
    lang: currentLang,
    plusActive,
    searchTerm,
    moodFilter,
    travelMode,
    radiusStep,
    radiusKm,
    ageFilter,
    categoryFilter,
    categoryProfile: categoryExplorer ? {world: categoryExplorer.state.world, types: [...categoryExplorer.state.types], facets: [...categoryExplorer.state.facets]} : null,
    onlyBigAdventures,
    onlyVerified,
    onlyFavorites,
    activeTagFilters: Array.from(activeTagFilters),
    origin
  };
}

// ------------------------------------------------------
// Filtermodal
// ------------------------------------------------------

function openFilterModal() {
  if (!filterModalEl) return;

  isFilterModalOpen = true;
  lastFocusBeforeFilterModal = homeNavigation?.getButton("filters") || document.activeElement;

  filterModalEl.hidden = false;
  document.body?.setAttribute("data-filter-modal-open", "1");

  filterModalController ||= createModalController(filterModalEl);
  filterModalController.activate();
}

function closeFilterModal({ returnFocus = true } = {}) {
  if (!filterModalEl || !isFilterModalOpen) return;

  isFilterModalOpen = false;
  filterModalController?.deactivate({ returnFocus: false });
  filterModalEl.hidden = true;

  document.body?.removeAttribute("data-filter-modal-open");

  if (returnFocus && lastFocusBeforeFilterModal?.focus) {
    lastFocusBeforeFilterModal.focus();
  }
}

function resetAllFilters({ render = true } = {}) {
  searchTerm = "";
  moodFilter = null;
  travelMode = null;
  ageFilter = "all";
  categoryFilter = "";
  categoryExplorer?.reset();
  onlyBigAdventures = false;
  onlyVerified = false;
  onlyFavorites = false;

  activeTagFilters.clear();

  radiusStep = getMaxRadiusIndex();
  hasShownRadiusDisabledToast = false;

  if (filterSearchEl) filterSearchEl.value = "";
  if (filterAgeEl) filterAgeEl.value = "all";
  if (filterCategoryEl) filterCategoryEl.value = "";

  if (filterRadiusEl) {
    filterRadiusEl.value = String(radiusStep);
    updateRadiusTexts();
  }

  if (filterBigEl) filterBigEl.checked = false;
  if (filterVerifiedEl) filterVerifiedEl.checked = false;
  if (filterFavoritesEl) filterFavoritesEl.checked = false;

  document.querySelectorAll(".mood-chip").forEach((chip) => {
    chip.classList.remove("mood-chip--active");
    chip.setAttribute("aria-pressed", "false");
  });

  document.querySelectorAll(".travel-chip").forEach((chip) => {
    chip.classList.remove("travel-chip--active");
    chip.setAttribute("aria-pressed", "false");
  });

  safeTillaCall("setTravelMode", null);

  renderTagFilterChips();
  if (render) applyFiltersAndRender();
}

// ------------------------------------------------------
// Sichtbarkeit: Datum, Plus und Add-ons
// ------------------------------------------------------

// Date-only values are inclusive calendar days in Europe/Berlin.
// Values containing a time retain their exact timestamp semantics.
const spotValidityDateFormatter = new Intl.DateTimeFormat("en", {
  timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit"
});

function isSpotCurrentlyValid(spot, now = new Date()) {
  const fromStr = spot.validFrom || spot.valid_from;
  const toStr = spot.validTo || spot.valid_to;
  if (!fromStr && !toStr) return true;
  const parts = spotValidityDateFormatter.formatToParts(now);
  const part = type => parts.find(item => item.type === type).value;
  const day = `${part("year")}-${part("month")}-${part("day")}`;
  const isCalendarDate = value => typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(new Date(`${value}T00:00:00Z`).getTime()) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  if (fromStr) {
    const from = new Date(fromStr);

    if (isCalendarDate(fromStr) ? day < fromStr : !Number.isNaN(from.getTime()) && now < from) {
      return false;
    }
  }

  if (toStr) {
    const to = new Date(toStr);

    if (isCalendarDate(toStr) ? day > toStr : !Number.isNaN(to.getTime()) && now > to) {
      return false;
    }
  }

  return true;
}

function userCanSeeSpot(spot) {
  if (!isSpotCurrentlyValid(spot)) return false;

  const slugs = Array.isArray(spot.categories)
    ? spot.categories
    : spot.category
      ? [spot.category]
      : [];

  if (!slugs.length) return true;

  const status = getPlusStatus();
  const plan = status.plan || null;
  const addons = status.addons || [];

  return slugs.every((slug) => {
    if (!isPlusCategory(slug)) return true;
    if (!CATEGORY_ACCESS?.perCategory) return true;

    const rule = CATEGORY_ACCESS.perCategory[slug];
    if (!rule) return true;

    if (!status.active) return false;

    if (rule.level === "subscription") {
      return plan === rule.subscriptionId;
    }

    if (rule.level === "addon") {
      const hasBase = plan === rule.subscriptionId;

      const hasAddon =
        Array.isArray(addons) && rule.addonId
          ? addons.includes(rule.addonId)
          : false;

      return hasBase && hasAddon;
    }

    return true;
  });
}

// ------------------------------------------------------
// Favoriten
// ------------------------------------------------------

function syncFavoritesShortcut() {
  const button = document.getElementById("btn-open-favorites");
  if (!button) return;
  button.hidden = !FEATURES.favorites;
  button.querySelector("[data-favorite-count]").textContent = String(favorites.size);
}

function openFavoritesFromMenu() {
  if (!FEATURES.favorites) return;
  closeMenu();
  appRouter?.switchRoute("map");
  if (sidebarEl?.classList.contains("hidden")) handleToggleView();
  closeSpotDetails({ returnFocus: false });
  resetAllFilters({ render: false });
  onlyFavorites = true;
  if (filterFavoritesEl) filterFavoritesEl.checked = true;
  applyFiltersAndRender();
  if (homeNavigation) {
    homeNavigation.openPanel("spots");
    return;
  }
  const listToggle = document.getElementById("btn-toggle-spots");
  if (listToggle?.getAttribute("aria-expanded") === "false") listToggle.click();
  requestAnimationFrame(() => {
    const target = spotListEl?.querySelector(".spot-card-open, .empty-state button") || listToggle;
    target?.focus({ preventScroll: true });
    listToggle?.closest("header")?.scrollIntoView({ block: "start", behavior: "auto" });
    map?.invalidateSize({ animate: false });
  });
}

async function loadFavoritesFromStorage() {
  if (!FEATURES.favorites) return;
  const generation = ++favoriteReadGeneration;
  try { const next = await readFavorites(); if (generation === favoriteReadGeneration) { favorites = canonicalFavorites(next); syncFavoritesShortcut(); } }
  catch (error) { warn("[Family Spots] Favorites unavailable:", error); }
}

function syncFavButtonState(btn, spotId) {
  const isFav = favorites.has(spotId);

  const svg = createHeartIcon("fsm-favorite-heart", btn.ownerDocument);
  btn.replaceChildren(svg);
  btn.classList.add("fsm-favorite");
  btn.dataset.favoriteSpotId = spotId;
  btn.setAttribute("aria-pressed", String(isFav));
  if (favoritePendingIds.has(spotId)) btn.setAttribute("aria-busy", "true");
  else btn.removeAttribute("aria-busy");

  btn.setAttribute(
    "aria-label",
    isFav
      ? currentLang === LANG_EN
        ? "Remove from favourites"
        : currentLang === LANG_DA
          ? "Fjern fra favoritter"
          : "Aus Favoriten entfernen"
      : currentLang === LANG_EN
        ? "Add to favourites"
        : currentLang === LANG_DA
          ? "Tilføj til favoritter"
          : "Zu Favoriten hinzufügen"
  );
}

async function toggleFavorite(spot) {
  if (!FEATURES.favorites) return;

  const spotId = getSpotId(spot);
  if (favoritePendingIds.has(spotId)) return;
  const wasFavorite = favorites.has(spotId);
  favoritePendingIds.add(spotId);
  document.querySelectorAll("button.fsm-favorite").forEach(button => { if (button.dataset.favoriteSpotId === spotId) button.setAttribute("aria-busy", "true"); });
  try { favorites = await changeFavorite(spotId, !wasFavorite, canonicalFavorites); ++favoriteReadGeneration; syncFavoritesShortcut(); }
  catch (error) {
    warn("[Family Spots] Favorite save failed:", error);
    showToast(locationText("Favorit konnte nicht gespeichert werden.", "Could not save this favourite.", "Favoritten kunne ikke gemmes."));
    return;
  } finally {
    favoritePendingIds.delete(spotId);
    document.querySelectorAll("button.fsm-favorite").forEach(button => { if (button.dataset.favoriteSpotId === spotId) button.removeAttribute("aria-busy"); });
    setTimeout(() => refreshPersonalData({ favorite: true }), 0);
  }

  showToast(
    wasFavorite
      ? "toast_fav_removed"
      : "toast_fav_added"
  );

  safeTillaCall(
    wasFavorite
      ? "onFavoriteRemoved"
      : "onFavoriteAdded"
  );

  if (onlyFavorites) {
    const trigger = document.activeElement;
    const cards = [...spotListEl.querySelectorAll(".spot-card")];
    const index = cards.findIndex(card => card.dataset.spotId === String(spotId));
    applyFiltersAndRender();
    if (trigger?.closest("#spot-list")) {
      const remaining = [...spotListEl.querySelectorAll(".spot-card-open")];
      (remaining[Math.min(Math.max(index, 0), remaining.length - 1)] || spotListEl.querySelector("button"))?.focus();
    }
  }

  // Keep the visible list and any open detail in the same favorite state.
  document.querySelectorAll("button.fsm-favorite").forEach((button) => {
    if (button.dataset.favoriteSpotId === spotId) {
      syncFavButtonState(button, spotId);
    }
  });
}

// ------------------------------------------------------
// Plus
// ------------------------------------------------------

function updatePlusStatusText(status) {
  if (!plusStatusTextEl) return;

  if (!FEATURES.plus) {
    plusStatusTextEl.textContent = "";
    return;
  }

  const s = status || getPlusStatus();

  plusStatusTextEl.textContent = formatPlusStatus(s);

  // Only show the generic 90-day introductory note before activation or after
  // expiry. An active owner/partner/test grant already has its own precise status.
  // This avoids a permanent developer grant appearing to expire after 90 days.
  const section = plusStatusTextEl.closest("#plus-section");
  if (!section) return;
  const note = section.querySelector(".plus-note");
  const form = section.querySelector(".plus-code-form");
  const owner = s.active && s.source === "development_owner" && !s.validUntil;
  const expired = !s.active && !!s.validUntil;
  section.dataset.plusAccess = owner ? "owner" : s.active
    ? (s.source === "family_test" ? "family-test" : "active")
    : (expired ? "expired" : "inactive");
  if (note) {
    note.hidden = !!s.active;
    note.setAttribute("aria-hidden", String(!!s.active));
  }
  // A permanent owner grant needs no activation controls; others can still
  // redeem a new/extended code without any misleading trial-duration copy.
  if (form) {
    form.hidden = !!owner;
    form.setAttribute("aria-hidden", String(!!owner));
    const control = form.querySelector("#plus-code-input");
    const submit = form.querySelector("#plus-code-submit");
    if (control) control.disabled = !!owner;
    if (submit) submit.disabled = !!owner;
  }
}

function loadPlusStateFromStorage({
  reapplyFilters = false
} = {}) {
  if (!FEATURES.plus) {
    plusActive = false;

    updatePlusStatusText({
      active: false,
      plan: null,
      validUntil: null,
      addons: null,
      partner: null,
      source: null
    });

    if (reapplyFilters && spots.length) {
      applyFiltersAndRender();
    }

    return;
  }

  const status = getPlusStatus();
  const signature = JSON.stringify([status.active, status.plan, status.validUntil, status.addons]);
  const changed = signature !== plusStateSignature;
  plusStateSignature = signature;
  plusActive = !!status.active;
  updatePlusStatusText(status);
  clearTimeout(plusRefreshTimer);
  const boundary = status.nextChangeAt || (status.active && status.validUntil ? Date.parse(status.validUntil) : null);
  if (Number.isFinite(boundary)) {
    plusRefreshTimer = setTimeout(() => loadPlusStateFromStorage({ reapplyFilters: true }),
      Math.min(2147483647, Math.max(25, boundary - Date.now() + 1)));
  }

  log("[Family Spots] Plus status:", {
    plusActive,
    status
  });

  if (reapplyFilters && spots.length && changed) {
    const openSpot = spotDetails.getOpenSpot();
    if (openSpot && !userCanSeeSpot(openSpot)) closeSpotDetails({ returnFocus: false });
    applyFiltersAndRender();
  }
}

async function handlePlusCodeSubmit() {
  if (!FEATURES.plus) return;
  if (!plusCodeInputEl || !plusStatusTextEl || plusCodeSubmitEl?.disabled) return;
  if (plusCodeSubmitEl) plusCodeSubmitEl.disabled = true;
  plusCodeSubmitEl?.setAttribute("aria-busy", "true");
  try {
    const raw = plusCodeInputEl.value.trim();
    const result = await redeemPartnerCode(raw);

    if (!result.ok) {
      showToast(result.reason === "already_redeemed"
        ? locationText("Dieser Code wurde in diesem Browser bereits eingelöst. Seine ursprüngliche Laufzeit bleibt bestehen.", "This code has already been redeemed in this browser. Its original expiry date is unchanged.", "Denne kode er allerede indløst i denne browser. Den oprindelige udløbsdato er uændret.")
        : result.reason === "unavailable"
        ? locationText("Codes sind gerade nicht erreichbar. Bitte später erneut versuchen.", "Codes are unavailable. Please try again later.", "Koderne er ikke tilgængelige. Prøv igen senere.")
        : result.reason === "storage"
          ? locationText("Plus konnte auf diesem Gerät nicht gespeichert werden.", "Could not save Plus on this device.", "Plus kunne ikke gemmes på denne enhed.")
          : result.reason === "empty" ? "plus_code_empty" : "plus_code_unknown");

      return;
    }

    loadPlusStateFromStorage();

    showToast("plus_code_activated");
    safeTillaCall("onPlusActivated");

    applyFiltersAndRender();
  } catch (error) {
    warn("[Family Spots] Plus activation failed:", error);
    showToast(locationText("Code konnte gerade nicht aktiviert werden. Bitte erneut versuchen.", "Could not activate code. Please try again.", "Koden kunne ikke aktiveres. Prøv igen."));
  } finally {
    if (plusCodeSubmitEl) plusCodeSubmitEl.disabled = false;
    plusCodeSubmitEl?.removeAttribute("aria-busy");
  }
}

// ------------------------------------------------------
// Mein Tag – Erinnerungen
// ------------------------------------------------------

function formatDaylogTimestamp(ts) {
  try {
    const date = new Date(ts);

    const locale =
      currentLang === LANG_EN
        ? "en-GB"
        : currentLang === LANG_DA
          ? "da-DK"
          : "de-DE";

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    return "";
  }
}

function daylogText(de, en, da) {
  return currentLang === LANG_EN
    ? en
    : currentLang === LANG_DA
      ? da
      : de;
}

function createDaylogId() {
  let id;

  do {
    id = typeof crypto.randomUUID === "function" ? `moment-${crypto.randomUUID()}` : `moment-${Date.now()}-${++daylogIdSequence}-${Math.random().toString(36).slice(2)}`;
  } while (
    daylogEntries.some((entry) => String(entry.id) === id)
  );

  return id;
}

async function persistDaylogChange(operation) {
  if (daylogMutationPending || personalBackupBusy || daylogPhotos?.isBusy()) return false;
  daylogMutationPending = true;
  const controls = [...(daylogListEl?.querySelectorAll("button") || []), daylogSaveEl].filter(Boolean);
  const disabled = controls.map(button => button.disabled);
  controls.forEach(button => { button.disabled = true; });
  daylogListEl?.setAttribute("aria-busy", "true");
  try {
    daylogEntries = await changeDaylog(operation);
    savedDaylogEntries = daylogEntries.slice();
    ++daylogReadGeneration;
    return true;
  } catch (error) {
    warn("[Family Spots] Memory save failed:", error);
    if (error.code === "personal_conflict") {
      if (daylogEditDrafts.has(operation.id)) daylogEditConflicts.add(operation.id);
      refreshPersonalData({ daylog: true });
      showToast(daylogText(
        "Diese Erinnerung wurde in einem anderen Fenster geändert oder gelöscht. Dein Entwurf bleibt erhalten.",
        "This memory was changed or deleted in another window. Your draft has been kept.",
        "Dette minde blev ændret eller slettet i et andet vindue. Din kladde er bevaret."
      ));
    } else {
      showToast(daylogText(
        "Die Änderung konnte nicht gespeichert werden. Dein Entwurf mit Text und Fotos bleibt erhalten.",
        "Could not save the change. Your draft, including text and photos, has been kept.",
        "Ændringen kunne ikke gemmes. Din kladde med tekst og billeder er bevaret."
      ));
    }
    return false;
  } finally {
    daylogMutationPending = false;
    controls.forEach((button, index) => { button.disabled = disabled[index]; });
    for (const button of daylogListEl?.querySelectorAll("button") || []) {
      if (!controls.includes(button)) button.disabled = false;
    }
    daylogListEl?.removeAttribute("aria-busy");
    if (daylogSyncPending) {
      daylogSyncPending = false;
      setTimeout(() => { refreshPersonalData({ daylog: true }); updateDaylogUI(); }, 0);
    }
  }
}

async function refreshPersonalData({ daylog = false, favorite = false } = {}) {
  if (favorite && FEATURES.favorites) {
    const generation = ++favoriteReadGeneration;
    try {
      const next = await readFavorites();
      if (generation === favoriteReadGeneration) {
        favorites = canonicalFavorites(next);
        syncFavoritesShortcut();
        if (onlyFavorites) applyFiltersAndRender();
        document.querySelectorAll("button.fsm-favorite").forEach(button => syncFavButtonState(button, button.dataset.favoriteSpotId));
      }
    } catch (error) { warn("[Family Spots] Favorites synchronization failed:", error); }
  }
  if (daylog && FEATURES.daylog) {
    if (daylogMutationPending) { daylogSyncPending = true; return; }
    const generation = ++daylogReadGeneration;
    try {
      const next = await readDaylogEntries();
      if (generation !== daylogReadGeneration) return;
      if (daylogMutationPending) { daylogSyncPending = true; return; }
      const savedCountChanged = savedDaylogEntries.length !== next.length;
      savedDaylogEntries = next.slice();
      for (const id of daylogEditDrafts.keys()) {
        const current = next.find(entry => entry.id === id);
        const base = daylogEditBases.get(id);
        if (base && (!current || current.text !== base.text || current.updatedTs !== base.updatedTs)) {
          daylogEditConflicts.add(id);
        }
        if (!current && base) next.push({ ...base });
      }
      if (savedCountChanged || JSON.stringify(next) !== JSON.stringify(daylogEntries)) {
        daylogEntries = next;
        updateDaylogUI();
      }
    } catch (error) { warn("[Family Spots] Memory synchronization failed:", error); }
  }
}

function focusDaylogEntry(id) {
  const item = Array.from(daylogListEl?.children || [])
    .find(
      (element) => element.dataset.entryId === String(id)
    );

  (item?.querySelector("textarea, button") || daylogTextEl)?.focus();
}

function persistDaylogDrafts() {
  if (!daylogDraftsReady) return;
  try {
    if (!daylogDraftStorageAvailable) throw new Error("draft_storage_unavailable");
    writeDaylogDrafts(daylogTextEl?.value || "", daylogEditDrafts, daylogEditBases, daylogEditConflicts);
  } catch (error) {
    warn("[Family Spots] Draft backup failed:", error);
    if (!hasShownDraftStorageWarning) {
      hasShownDraftStorageWarning = true;
      showToast(daylogText(
        "Dein Entwurf bleibt hier erhalten, konnte aber nicht für das Neuladen der Seite gesichert werden.",
        "Your draft is still here, but could not be saved for when the page reloads.",
        "Din kladde er stadig her, men kunne ikke gemmes til næste gang, siden indlæses."
      ));
    }
  }
}

function updateDaylogUI() {
  const active = document.activeElement;
  const entry = active?.closest?.(".daylog-entry");
  const restore = entry && daylogListEl?.contains(entry) ? {
    id: entry.dataset.entryId, input: active.matches("textarea"),
    action: active.dataset.daylogAction,
    start: active.selectionStart, end: active.selectionEnd, scroll: active.scrollTop
  } : null;
  daylogPhotos?.beginRender();
  renderDaylogUI();
  diaryView?.refresh(daylogEntries.length);
  persistDaylogDrafts();
  if (restore) {
    const item = [...(daylogListEl?.children || [])].find(element => element.dataset.entryId === restore.id);
    const target = restore.input ? item?.querySelector("textarea") : item?.querySelector(`[data-daylog-action="${restore.action}"]`);
    if (target) {
      target.focus({ preventScroll: true });
      if (restore.input) { target.setSelectionRange(restore.start, restore.end); target.scrollTop = restore.scroll; }
    }
  }
}

function renderDaylogUI() {
  safeTillaCall(
    "setMemoryCount",
    FEATURES.daylog ? savedDaylogEntries.length : 0
  );

  // Der frühere Button löschte alle Erinnerungen.
  // Jeder Eintrag hat jetzt seine eigenen Aktionen.
  if (daylogClearEl) {
    daylogClearEl.hidden = true;
    daylogClearEl.classList.add("hidden");
  }

  if (!FEATURES.daylog) return;

  daylogListEl?.replaceChildren();

  const orderedEntries = [...daylogEntries].sort(
    (a, b) => b.ts - a.ts
  );

  if (daylogLastSavedEl) {
    if (!savedDaylogEntries.length) {
      daylogLastSavedEl.textContent = daylogText(
        "Noch nichts gespeichert.",
        "Nothing saved yet.",
        "Ingen minder gemt endnu."
      );
    } else {
      const latestTs = Math.max(
        ...savedDaylogEntries.map(
          (entry) => entry.updatedTs || entry.ts
        )
      );

      daylogLastSavedEl.textContent =
        daylogText(
          "Zuletzt gespeichert: ",
          "Last saved: ",
          "Sidst gemt: "
        ) +
        formatDaylogTimestamp(latestTs);
    }
  }

  // Ungespeicherter Text im Hauptfeld bleibt erhalten.
  if (!daylogListEl) return;

  const frag = document.createDocumentFragment();

  orderedEntries.forEach((entry) => {
    const id = String(entry.id);

    const item = document.createElement("article");
    item.className = "daylog-entry";
    item.dataset.entryId = id;

    const header = document.createElement("header");
    header.className = "daylog-entry-header";

    const dateEl = document.createElement("p");
    dateEl.className = "daylog-entry-date";
    dateEl.textContent = new Intl.DateTimeFormat(currentLang === LANG_DA ? "da-DK" : currentLang === LANG_EN ? "en-GB" : "de-DE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(entry.ts));

    header.appendChild(dateEl);
    item.appendChild(header);

    const actions = document.createElement("div");
    actions.className = "daylog-entry-actions";

    const addButton = (label, handler, primary = false, action = "") => {
      const button = document.createElement("button");

      button.type = "button";
      button.dataset.daylogAction = action;
      button.disabled = daylogMutationPending;
      button.className = primary
        ? "btn btn-small"
        : "btn-ghost btn-small";

      button.textContent = label;
      if (action === "edit" || action === "delete") {
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("viewBox", "0 0 24 24"); icon.setAttribute("aria-hidden", "true"); icon.classList.add("diary-action-icon");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", action === "edit" ? "m16 3 5 5-12 12-6 1 1-6L16 3Zm-9 10 5 5M14 5l5 5" : "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7");
        icon.append(path); button.prepend(icon);
      }
      button.addEventListener("click", handler);

      actions.appendChild(button);

      return button;
    };

    if (daylogEditDrafts.has(id)) {
      const label = document.createElement("label");
      label.className = "daylog-entry-editor";

      const labelText = document.createElement("span");

      labelText.textContent = daylogText(
        "Erinnerung bearbeiten",
        "Edit memory",
        "Rediger minde"
      );

      const input = document.createElement("textarea");
      input.className = "input daylog-entry-input";
      input.rows = 4;
      input.value = daylogEditDrafts.get(id);

      input.addEventListener("input", () => {
        daylogEditDrafts.set(id, input.value);
        persistDaylogDrafts();
      });

      label.appendChild(labelText);
      label.appendChild(input);
      item.appendChild(label);
      daylogPhotos?.mountEditor(`entry:${id}`, item, entry.photos || []);

      addButton(
        daylogText("Speichern", "Save", "Gem"),
        async () => {
          const text = input.value.trim();

          if (!text && !daylogPhotos?.ids(`entry:${id}`).length) {
            showToast(
              daylogText(
                "Bitte füge Text oder ein Foto hinzu oder brich die Bearbeitung ab.",
                "Please add text or a photo, or cancel editing.",
                "Tilføj tekst eller et billede, eller annuller redigeringen."
              )
            );

            input.focus();
            return;
          }

          if (daylogPhotos?.isBusy() || personalBackupBusy || daylogMutationPending) return;
          const returnFocus = document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === id;
          let media;
          try { media = await daylogPhotos.operation(`entry:${id}`); } catch { return; }
          if (!await persistDaylogChange({ type: "edit", id, text, ...media, expected: daylogEditBases.get(id) })) return;
          await daylogPhotos.clear(`entry:${id}`);

          if (daylogEditDrafts.get(id)?.trim() === text) {
            daylogEditDrafts.delete(id);
            daylogEditBases.delete(id);
            daylogEditConflicts.delete(id);
          } else {
            daylogEditBases.set(id, { ...daylogEntries.find(entry => entry.id === id) });
          }

          updateDaylogUI();
          if (returnFocus && (document.activeElement === document.body || document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === id)) focusDaylogEntry(id);

          showToast(
            daylogText(
              "Erinnerung aktualisiert.",
              "Memory updated.",
              "Minde opdateret."
            )
          );

          // Bearbeiten erzeugt keine neue Zettelanimation.
        },
        true, "save"
      );

      if (daylogEditConflicts.has(id)) {
        addButton(daylogText("Als neue Erinnerung speichern", "Save as a new memory", "Gem som et nyt minde"), async () => {
          const text = daylogEditDrafts.get(id)?.trim();
          if (!text && !daylogPhotos.ids(`entry:${id}`).length) { input.focus(); return; }
          if (daylogPhotos.isBusy() || personalBackupBusy || daylogMutationPending) return;
          const returnFocus = document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === id;
          let media;
          try { media = await daylogPhotos.operation(`entry:${id}`); } catch { return; }
          const copy = { id: createDaylogId(), text, photos: media.photos, ts: Date.now() };
          if (!await persistDaylogChange({ type: "add", id: copy.id, entry: copy, ...media })) return;
          await daylogPhotos.clear(`entry:${id}`);
          // Keep any further typing while the copy was queued.
          if (daylogEditDrafts.get(id)?.trim() === text) {
            daylogEditDrafts.delete(id);
            daylogEditBases.delete(id);
            daylogEditConflicts.delete(id);
          }
          refreshPersonalData({ daylog: true });
          const remainingDraft = daylogEditDrafts.has(id);
          if (remainingDraft && !daylogEntries.some(entry => entry.id === id)) daylogEntries.push({ ...daylogEditBases.get(id) });
          updateDaylogUI();
          if (returnFocus && (document.activeElement === document.body || document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === id)) focusDaylogEntry(remainingDraft ? id : copy.id);
          showToast(daylogText("Erinnerung gespeichert.", "Memory saved.", "Minde gemt."));
        }, false, "copy");
      }

      addButton(
        daylogText("Abbrechen", "Cancel", "Annuller"),
        async () => {
          if (daylogMutationPending || personalBackupBusy || daylogPhotos?.isBusy()) return;
          await daylogPhotos?.clear(`entry:${id}`);
          daylogEditDrafts.delete(id);
          daylogEditBases.delete(id);
          daylogEditConflicts.delete(id);
          persistDaylogDrafts();
          const returnFocus = document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === id;
          await refreshPersonalData({ daylog: true });

          updateDaylogUI();
          if (returnFocus && (document.activeElement === document.body || document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === id)) focusDaylogEntry(id);
        }, false, "cancel"
      );
    } else {
      const textEl = document.createElement("p");
      textEl.className = "daylog-entry-text";
      textEl.textContent = entry.text;

      if (entry.text) item.appendChild(textEl);
      daylogPhotos?.gallery(entry.photos, item);

      addButton(
        daylogText("Bearbeiten", "Edit", "Rediger"),
        () => {
          if (daylogMutationPending || personalBackupBusy || daylogPhotos?.isBusy()) return;
          daylogEditDrafts.set(id, entry.text);
          daylogEditBases.set(id, { ...entry });

          updateDaylogUI();
          focusDaylogEntry(id);
        }, false, "edit"
      );
    }

    const deleteButton = addButton(
      daylogText("Löschen", "Delete", "Slet"),
      () => {
        handleDaylogDelete(id);
      }, false, "delete"
    );

    deleteButton.setAttribute(
      "aria-label",
      daylogText(
        "Diese Erinnerung löschen",
        "Delete this memory",
        "Slet dette minde"
      ) +
      ": " +
      formatDaylogTimestamp(entry.ts)
    );

    item.appendChild(actions);
    frag.appendChild(item);
  });

  daylogListEl.appendChild(frag);
}

async function loadDaylogFromStorage() {
  if (!FEATURES.daylog) return;
  daylogEditDrafts.clear();
  daylogEditBases.clear();
  daylogEditConflicts.clear();
  try {
    const saved = readDaylogDrafts();
    if (daylogTextEl && !daylogTextEl.value) daylogTextEl.value = saved.newText;
    for (const edit of saved.edits) {
      daylogEditDrafts.set(edit.id, edit.text);
      daylogEditBases.set(edit.id, { ...edit.base });
      if (edit.conflict) daylogEditConflicts.add(edit.id);
    }
  } catch (error) {
    // Leave an unreadable draft backup untouched; never block the app's start.
    daylogDraftStorageAvailable = false;
    warn("[Family Spots] Draft restore unavailable:", error);
  }
  daylogDraftsReady = true;
  const generation = ++daylogReadGeneration;
  try { const next = await readDaylogEntries(); if (generation === daylogReadGeneration) { daylogEntries = next; savedDaylogEntries = next.slice(); } }
  catch (error) { warn("[Family Spots] Memories unavailable:", error); }
  for (const id of daylogPhotos?.restoredEdits() || []) {
    const entry = daylogEntries.find(item => item.id === id);
    if (entry && !daylogEditDrafts.has(id)) { daylogEditDrafts.set(id, entry.text); daylogEditBases.set(id, { ...entry }); }
  }
  for (const [id, base] of daylogEditBases) {
    const entry = daylogEntries.find(item => item.id === id);
    if (!entry) { daylogEntries.push({ ...base }); daylogEditConflicts.add(id); }
    else if (entry.text !== base.text || entry.updatedTs !== base.updatedTs) daylogEditConflicts.add(id);
  }
  if (daylogTextEl?.value || daylogEditDrafts.size || daylogPhotos?.hasNew()) daylogSectionEl.open = true;
  updateDaylogUI();
}

async function handleDaylogSave() {
  if (!FEATURES.daylog || !daylogTextEl) return;

  const text = daylogTextEl.value.trim();

  if ((!text && !daylogPhotos?.ids("new").length) || daylogMutationPending || personalBackupBusy || daylogPhotos?.isBusy()) return;
  const returnFocus = document.activeElement === daylogSaveEl;
  let media;
  try { media = await daylogPhotos.operation("new"); } catch { return; }
  const now = Date.now();
  const entry = { id: createDaylogId(), text, photos: media.photos, ts: now };
  if (!await persistDaylogChange({ type: "add", id: entry.id, entry, ...media })) return;
  await daylogPhotos.clear("new");

  if (daylogTextEl.value.trim() === text) daylogTextEl.value = "";

  showToast(
    daylogText(
      "Erinnerung gespeichert.",
      "Memory saved.",
      "Minde gemt."
    )
  );

  safeTillaCall("onDaylogSaved", savedDaylogEntries.length);

  updateDaylogUI();
  diaryView?.afterSave(entry.id, returnFocus);
}

async function handleDaylogDelete(id) {
  if (!FEATURES.daylog || personalBackupBusy || daylogMutationPending || daylogPhotos?.isBusy()) return;

  const index = daylogEntries.findIndex(
    (entry) => String(entry.id) === String(id)
  );

  if (index < 0) return;

  // A native, translated confirmation protects text and photos without
  // introducing another app layout or changing any of the existing colours.
  const message = daylogText(
    "Diese Erinnerung mit ihrem Text und ihren Fotos endgültig löschen? Ohne eine vorherige Sicherung kann sie nicht wiederhergestellt werden.",
    "Permanently delete this memory, including its text and photos? It cannot be restored without a previous backup.",
    "Vil I slette dette minde med tekst og billeder permanent? Det kan ikke gendannes uden en tidligere sikkerhedskopi."
  );
  if (!window.confirm(message)) return;

  const orderedIds = [...daylogEntries]
    .sort((a, b) => b.ts - a.ts)
    .map((entry) => String(entry.id));

  const visibleIndex = orderedIds.indexOf(String(id));

  const nextFocusId =
    orderedIds[visibleIndex + 1] ||
    orderedIds[visibleIndex - 1];

  const expected = { ...(daylogEditBases.get(String(id)) || daylogEntries[index]) };
  const draftAtStart = daylogEditDrafts.get(String(id));
  const returnFocus = document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === String(id);
  if (!await persistDaylogChange({ type: "delete", id: String(id), expected })) return;
  await daylogPhotos?.clear(`entry:${id}`);
  const keepNewerDraft = typeof draftAtStart === "string" && daylogEditDrafts.get(String(id)) !== draftAtStart;
  if (keepNewerDraft) {
    daylogEditConflicts.add(String(id));
    daylogEntries.push({ ...expected });
  } else {
    daylogEditDrafts.delete(String(id));
    daylogEditBases.delete(String(id));
    daylogEditConflicts.delete(String(id));
  }

  updateDaylogUI();

  if (returnFocus && (document.activeElement === document.body || document.activeElement?.closest?.(".daylog-entry")?.dataset.entryId === String(id))) {
    if (keepNewerDraft) focusDaylogEntry(String(id));
    else if (nextFocusId) focusDaylogEntry(nextFocusId);
    else (document.getElementById("diary-new-memory") || daylogTextEl)?.focus();
  }

  showToast(
    daylogText(
      "Erinnerung gelöscht.",
      "Memory deleted.",
      "Minde slettet."
    )
  );
}

// ------------------------------------------------------
// Spots laden
// ------------------------------------------------------

function showSpotsLoadErrorUI() {
  if (!spotListEl) return;

  spotListEl.replaceChildren();

  const msg = document.createElement("p");
  msg.className = "filter-group-helper";

  msg.setAttribute("role", "status");
  msg.textContent = spotsLoadState === "loading"
    ? locationText("Spots werden geladen …", "Loading spots …", "Indlæser spots …")
    : currentLang === LANG_EN
      ? "Spots could not be loaded. Please check your connection and try again."
      : currentLang === LANG_DA
        ? "Spots kunne ikke indlæses. Tjek forbindelsen, og prøv igen."
        : "Die Spots konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.";

  spotListEl.appendChild(msg);

  const retryBtn = document.createElement("button");

  retryBtn.type = "button";
  retryBtn.className = "btn btn-small";
  retryBtn.dataset.spotAction = "retry";
  retryBtn.setAttribute("aria-disabled", String(spotsLoadState === "loading"));
  retryBtn.setAttribute("aria-busy", String(spotsLoadState === "loading"));

  retryBtn.textContent =
    currentLang === LANG_EN
      ? "Try again"
      : currentLang === LANG_DA
        ? "Prøv igen"
        : "Erneut versuchen";

  retryBtn.addEventListener("click", () => {
    if (spotsLoadState === "loading") return;
    showToast(
      currentLang === LANG_EN
        ? "Reloading spots …"
        : currentLang === LANG_DA
          ? "Indlæser spots igen …"
          : "Spots werden erneut geladen …"
    );

    loadSpots();
  });

  spotListEl.appendChild(retryBtn);
}

function syncAgeFilterAvailability() {
  const select = document.getElementById("filter-age");
  const hint = document.getElementById("filter-age-availability");
  const available = spots.some(spot => getSpotAgeGroups(spot).length > 0);
  if (select) {
    select.disabled = !available;
    if (!available) { select.value = "all"; ageFilter = "all"; }
  }
  if (hint) hint.hidden = available;
}

async function loadSpots() {
  if (spotsLoadState === "loading") return;
  spotsLoadState = "loading";
  safeTillaCall("onFiltersUpdated", { status: spotsLoadState });
  renderSpotList();
  try {
    const result = await loadData();

    const rawSpots = Array.isArray(result?.spots)
      ? result.spots
      : [];

    const normalized = rawSpots.map(normalizeSpot);
    const byId = new Map(normalized.map(spot => [getSpotId(spot), spot]));
    spotAliases = new Map();
    for (const spot of normalized) {
      const target = byId.get(spot.same_place_as);
      if (!target || target === spot || target.same_place_as) continue;
      spotAliases.set(getSpotId(spot), getSpotId(target));
      delete target._searchText;
      target.search_aliases = [...new Set([
        ...(target.search_aliases || []), spot.title, spot.title_de, spot.title_en, spot.title_da
      ].filter(Boolean))];
    }
    spots = normalized.filter(spot => !spotAliases.has(getSpotId(spot)));
    syncAgeFilterAvailability();
    spotsLoadState = "ready";
    spotsLoadHasFailed = false;

    log("[Family Spots] loadSpots:", {
      total: spots.length
    });

    await loadFavoritesFromStorage();
    populateCategoryOptions();
    renderTagFilterChips();

    if (result?.fromCache) {
      showToast(
        currentLang === LANG_EN
          ? "Loaded offline data."
          : currentLang === LANG_DA
            ? "Indlæste offline-data."
            : "Offline-Daten geladen."
      );
    }

    applyFiltersAndRender();
  } catch (err) {
    console.error(
      "[Family Spots] Fehler beim Laden der Spots:",
      err
    );

    showToast("error_data_load");
    spotsLoadState = "error";
    spotsLoadHasFailed = true;
    spots = [];
    filteredSpots = [];
    categoryExplorer?.sync([], 0, "error");
    renderSpotList();

    if (map && markersLayer) {
      hasShownMarkerLimitToast = renderMarkers({
        map,
        markersLayer,
        spots: [],
        maxMarkers: MAX_MARKERS_RENDER,
        currentLang,
        showToast,
        hasShownMarkerLimitToast,
        focusSpotOnMap,
        onPreviewOpen: () => closeSpotDetails({ returnFocus: false }),
        getSpotMetaParts
      });
    }

    safeTillaCall("onFiltersUpdated", { status: spotsLoadState });
  }
}

// ------------------------------------------------------
// Filterlogik
// ------------------------------------------------------

let selectionEvaluation = null;

function applyFiltersAndRender() {
  syncThemeShortcuts();
  updateRadiusTexts();
  if (!spots.length) {
    filteredSpots = [];
    selectionEvaluation = evaluateSelection([], categoryExplorer?.state);
    categoryExplorer?.sync([], 0, spotsLoadState, selectionEvaluation);

    renderSpotList();

    if (map && markersLayer) {
      hasShownMarkerLimitToast = renderMarkers({
        map,
        markersLayer,
        spots: [],
        maxMarkers: MAX_MARKERS_RENDER,
        currentLang,
        showToast,
        hasShownMarkerLimitToast,
        focusSpotOnMap,
        onPreviewOpen: () => closeSpotDetails({ returnFocus: false }),
        getSpotMetaParts
      });
    }

    updateFilterSummary();

    safeTillaCall("onFiltersUpdated", {
      status: spotsLoadState,
      totalSpots: spots.length,
      filteredSpotsCount: filteredSpots.length,
      filters: getFilterContext()
    });

    return;
  }

  const nonGeoFiltered = filterSpots(spots, {
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
    activeFilterIds: activeTagFilters
  });

  const originLatLng = getUserOriginLatLng();
  const radiusKm = getEffectiveRadiusKm();
  const availableSpots = nonGeoFiltered.filter(spot =>
    userCanSeeSpot(spot) && !isExpiredEvent(spot) &&
    (!originLatLng || !isFinite(radiusKm) || radiusKm === Infinity || isSpotInRadius(spot, originLatLng, radiusKm))
  );
  selectionEvaluation = evaluateSelection(availableSpots, categoryExplorer?.state);
  filteredSpots = selectionEvaluation.spots;
  categoryExplorer?.sync(availableSpots, filteredSpots.length, spotsLoadState, selectionEvaluation);

  renderSpotList();

  if (map && markersLayer) {
    hasShownMarkerLimitToast = renderMarkers({
      map,
      markersLayer,
      spots: filteredSpots,
      maxMarkers: MAX_MARKERS_RENDER,
      currentLang,
      showToast,
      hasShownMarkerLimitToast,
      focusSpotOnMap,
      onPreviewOpen: () => closeSpotDetails({ returnFocus: false }),
      getSpotMetaParts
    });
  }

  updateFilterSummary();

  safeTillaCall("onFiltersUpdated", {
    status: spotsLoadState,
    totalSpots: spots.length,
    filteredSpotsCount: filteredSpots.length,
    filters: getFilterContext()
  });
}

// ------------------------------------------------------
// Badges und Metadaten
// ------------------------------------------------------

function isSpotVerified(spot) {
  return !!spot.verified || !!spot.isVerified;
}

function isBigAdventureSpot(spot) {
  return (
    !!spot.bigAdventure ||
    !!spot.isBigAdventure ||
    !!spot.longTrip
  );
}

function isPlusSpot(spot) {
  if (!FEATURES.plus) return false;
  if (spot.plusOnly || spot.plus) return true;

  const slugs = Array.isArray(spot.categories)
    ? spot.categories
    : spot.category
      ? [spot.category]
      : [];

  return slugs.some(
    (slug) =>
      slug &&
      typeof isPlusCategory === "function" &&
      isPlusCategory(slug)
  );
}

function getSpotPrimaryMoodKey(spot) {
  const src =
    spot._moods ||
    spot.moods ||
    spot.moodTags ||
    spot.mood;

  let arr = [];

  if (Array.isArray(src)) {
    arr = src;
  } else if (typeof src === "string" && src.trim()) {
    arr = src
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return arr.length ? arr[0] : null;
}

function getSpotAgeLabel(spot) {
  const src =
    spot._ageGroups ||
    spot.ageGroups ||
    spot.age ||
    spot.ages;

  let arr = [];

  if (Array.isArray(src)) {
    arr = src;
  } else if (typeof src === "string" && src.trim()) {
    arr = src
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const key = arr.length ? arr[0] : null;

  if (!key) return "";

  if (currentLang === LANG_EN) {
    if (key === "0-3") return "0–3 yrs";
    if (key === "4-9") return "4–9 yrs";
    if (key === "10+") return "10+ yrs";

    return key;
  }

  if (currentLang === LANG_DA) {
    if (key === "0-3") return "0–3 år";
    if (key === "4-9") return "4–9 år";
    if (key === "10+") return "10+ år";

    return key;
  }

  if (key === "0-3") return "0–3 Jahre";
  if (key === "4-9") return "4–9 Jahre";
  if (key === "10+") return "10+ Jahre";

  return key;
}

function getSpotVisitTimeLabel(spot) {
  const onSite = currentLang === LANG_EN ? "on site" : currentLang === LANG_DA ? "på stedet" : "vor Ort";
  const approx = currentLang === LANG_EN ? "About" : "Ca.";
  const range = spot.visit_range_minutes;
  if (Array.isArray(range) && range.length === 2 && range.every(value => Number.isFinite(value) && value > 0) && range[1] >= range[0]) {
    return `${range[0]}–${range[1]} ${currentLang === LANG_DE ? "Min." : "min"} ${onSite}`;
  }
  const minutes = spot.visit_minutes;

  if (!Number.isFinite(minutes) || minutes <= 0) return "";

  if (minutes < 60) {
    return currentLang === LANG_DE
      ? `${approx} ${minutes} Min. ${onSite}`
      : `${approx} ${minutes} min ${onSite}`;
  }

  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;

  const formatter = new Intl.NumberFormat(
    currentLang === LANG_DA
      ? "da-DK"
      : currentLang === LANG_EN
        ? "en-GB"
        : "de-DE",
    { maximumFractionDigits: 1 }
  );

  const hoursLabel = formatter.format(rounded);

  if (currentLang === LANG_EN) return `${approx} ${hoursLabel} h ${onSite}`;
  if (currentLang === LANG_DA) return `${approx} ${hoursLabel} t ${onSite}`;

  return `${approx} ${hoursLabel} Std. ${onSite}`;
}

function getSpotDistanceKm(spot) {
  try {
    if (
      typeof L === "undefined" ||
      typeof L.latLng !== "function"
    ) {
      return null;
    }

    if (!hasValidLatLng(spot)) return null;

    const originLatLng = getUserOriginLatLng();
    if (!originLatLng) return null;

    const spotLatLng = L.latLng(spot.lat, spot.lng);
    const km = originLatLng.distanceTo(spotLatLng) / 1000;

    if (!Number.isFinite(km)) return null;

    return Math.max(0.1, Math.round(km * 10) / 10);
  } catch {
    return null;
  }
}

function formatKmBadgeLabel(km) {
  if (!km || !Number.isFinite(km)) return "";

  const formatter = new Intl.NumberFormat(
    currentLang === LANG_DA
      ? "da-DK"
      : currentLang === LANG_EN
        ? "en-GB"
        : "de-DE",
    { maximumFractionDigits: 1 }
  );

  return `≈ ${formatter.format(km)} km · ${locationText("Luftlinie", "straight-line", "fugleflugtslinje")}`;
}

function getSpotMetaParts(spot, { includeCategory = true } = {}) {
  const parts = [];

  if (includeCategory) {
    const categoryLabels = placeTypeLabels(spot, currentLang);
    if (categoryLabels.length) parts.push(categoryLabels.join(" · "));
  }

  if (spot.city) {
    parts.push(spot.city);
  }

  const timeLabel = getSpotVisitTimeLabel(spot);

  if (timeLabel) {
    parts.push(timeLabel);
  }

  return parts;
}

function buildSpotBadges(spot) {
  const badges = [];

  const distanceKm = getSpotDistanceKm(spot);

  if (distanceKm != null) {
    badges.push({
      className: "badge badge--distance",
      icon: "📍",
      label: formatKmBadgeLabel(distanceKm),
      title:
        currentLang === LANG_EN
          ? "Approx. straight-line distance from your location"
          : currentLang === LANG_DA
            ? "Cirka afstand i fugleflugtslinje fra jeres position"
            : "Ungefähre Entfernung in Luftlinie von eurem Standort"
    });
  }

  const timeLabel = getSpotVisitTimeLabel(spot);

  if (timeLabel) {
    badges.push({
      className: "badge badge--time",
      icon: "clock",
      label: timeLabel
    });
  }

  const ageLabel = getSpotAgeLabel(spot);

  if (ageLabel) {
    badges.push({
      className: "badge badge--age",
      icon: "👶",
      label: ageLabel
    });
  }

  const moodKey = getSpotPrimaryMoodKey(spot);
  const moodLabel = getMoodLabel(moodKey);

  if (moodLabel) {
    badges.push({
      className: "badge badge--soft",
      icon: moodKey === "relaxed" ? "🌿" : "🎈",
      label: moodLabel
    });
  }

  if (spot.review_label?.[currentLang]) {
    badges.push({className: "badge badge--outline", icon: "", label: spot.review_label[currentLang]});
  }

  if (isSpotVerified(spot)) {
    badges.push({
      className: "badge badge--verified",
      icon: "✔︎",
      label:
        spot.verification_label?.[currentLang] || (currentLang === LANG_EN
          ? "Information checked"
          : currentLang === LANG_DA
            ? "Oplysninger tjekket"
            : "Infos geprüft")
    });
  }

  if (isPlusSpot(spot)) {
    badges.push({
      className: "badge badge--plus",
      icon: "crown",
      label: "Plus"
    });
  }

  if (isBigAdventureSpot(spot)) {
    badges.push({
      className: "badge badge--big",
      icon: "🎒",
      label:
        currentLang === LANG_EN
          ? "Big adventure"
          : currentLang === LANG_DA
            ? "Stort eventyr"
            : "Großes Abenteuer"
    });
  }

  return badges;
}

// ------------------------------------------------------
// Spot-Liste
// ------------------------------------------------------

function syncThemeShortcuts() {
  document.querySelectorAll(".mood-chip").forEach(chip => {
    const active = shortcutIsSelected(categoryExplorer?.state, chip.dataset.mood);
    const symbol = chip.querySelector(".mood-chip-emoji");
    if (symbol && !symbol.querySelector("svg")) {
      symbol.replaceChildren(createMapToolIcon({ relaxed: "nature", action: "play", water: "water", animals: "animals" }[chip.dataset.mood]));
    }
    const label = chip.querySelector(".mood-chip-label");
    if (label) label.textContent = shortcutLabel(chip.dataset.mood, currentLang);
    chip.classList.toggle("mood-chip--active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
}

function getTravelModeLabel(mode) {
  const labels = {
    de: { bike: "Mit dem Fahrrad", car: "Mit dem Auto", camper: "Mit dem Wohnmobil", walk: "Zu Fuß" },
    en: { bike: "By bike", car: "By car", camper: "By motorhome", walk: "On foot" },
    da: { bike: "På cykel", car: "I bil", camper: "I autocamper", walk: "Til fods" }
  };
  return labels[currentLang]?.[mode] || mode;
}

function selectionDescription() {
  const selectedCategory = categoryFilter
    ? filterCategoryEl?.selectedOptions?.[0]?.textContent.trim() || getCategoryLabel(categoryFilter) : "";
  const age = ageFilter !== "all"
    ? filterAgeEl?.selectedOptions?.[0]?.textContent.trim() || ageFilter : "";
  const tags = (FILTERS || []).filter(filter => activeTagFilters.has(filter.id))
    .map(filter => filter.label?.[currentLang] || filter.label?.de || filter.id);
  return describeFilters({
    search: searchTerm,
    categoryState: categoryExplorer?.state,
    legacyCategory: selectedCategory,
    age,
    mood: moodFilter ? getMoodLabel(moodFilter) : "",
    travel: travelMode ? getTravelModeLabel(travelMode) : "",
    tags,
    favorites: onlyFavorites,
    verified: onlyVerified,
    big: onlyBigAdventures,
    radiusKm: radiusStep < getMaxRadiusIndex() ? RADIUS_STEPS_KM[radiusStep] : Infinity,
    hasLocation: hasFreshUserLocation()
  }, currentLang);
}

// Publish only presentation/filter metadata; the fullscreen map never owns a
// second spot collection or separate selection. The explorer stays authoritative.
function syncFullscreenControls() {
  // Only the actual theme buttons belong in the fullscreen theme strip.
  // Place-type labels also carry data-world as metadata; including them
  // duplicates a theme and can make several chips look selected at once.
  const worlds = [...document.querySelectorAll(
    "#category-explorer > .category-explorer__worlds > button[data-world]"
  )].map(button => ({
    id: button.dataset.world,
    label: button.querySelector(".category-explorer__name")?.textContent || button.textContent,
    accessible: button.getAttribute("aria-label"),
    hidden: button.hidden,
    disabled: button.disabled
  }));
  document.dispatchEvent(new CustomEvent("fsm:fullscreen-state", { detail: {
    world: categoryExplorer?.state.world || "",
    types: [...(categoryExplorer?.state.types || [])],
    search: filterSearchEl?.value || "",
    total: filteredSpots.length,
    status: spotsLoadState,
    plus: FEATURES.plus,
    diary: FEATURES.daylog,
    worlds
  } }));
}

function syncResultsControls() {
  syncFullscreenControls();
  const copy = resultsCopy(filteredSpots.length, currentLang, spotsLoadState);
  if (filterModalApplyEl) {
    // Keep the approved binocular pictogram while updating live result counts.
    const actionLabel = document.createElement("span");
    actionLabel.className = "filter-modal__action-label";
    actionLabel.textContent = copy.action;
    filterModalApplyEl.replaceChildren(categoryIcon("binoculars", "filter-modal__action-icon"), actionLabel);
    filterModalApplyEl.disabled = copy.disabled;
  }
  filterModalCloseEl?.setAttribute("aria-label", locationText("Filter schließen", "Close filters", "Luk filtre"));
  const status = document.getElementById("filter-results-status");
  if (status) {
    status.classList.toggle("sr-only", spotsLoadState !== "error");
    if (status.textContent !== copy.summary) status.textContent = copy.summary;
  }
  const context = document.getElementById("spot-results-context");
  if (context) {
    context.hidden = spotListEl?.hidden !== false;
    const selection = selectionDescription();
    context.textContent = [copy.summary, ...selection].join(" · ");
  }
  if (filterAgeEl) filterAgeEl.closest(".filter-group").hidden = filterAgeEl.disabled;
}

function showFilteredResults() {
  searchTerm = String(filterSearchEl?.value || "").trim();
  applyFiltersAndRender();
  closeFilterModal({ returnFocus: false });
  appRouter?.switchRoute("map");
  if (sidebarEl?.classList.contains("hidden")) handleToggleView();
  closeSpotDetails({ returnFocus: false });
  if (homeNavigation) {
    homeNavigation.openPanel("spots");
    return;
  }
  const toggle = document.getElementById("btn-toggle-spots");
  if (toggle?.getAttribute("aria-expanded") !== "true") toggle?.click();
  requestAnimationFrame(() => {
    if (spotListEl) spotListEl.scrollTop = 0;
    const heading = document.getElementById("spots-title");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    heading?.closest("section")?.scrollIntoView({ block: "start", behavior: "auto" });
    map?.invalidateSize({ animate: false });
  });
}

function syncSpotListLabels() {
  const title = document.getElementById("spots-title");
  if (title) title.textContent = onlyFavorites
    ? locationText("Favoriten", "Favourites", "Favoritter")
    : locationText("Spots", "Spots", "Spots");
  const toggle = document.getElementById("btn-toggle-spots");
  const show = toggle?.querySelector('[data-state="show"]');
  const hide = toggle?.querySelector('[data-state="hide"]');
  if (show) show.textContent = onlyFavorites
    ? locationText("Favoriten anzeigen", "Show favourites", "Vis favoritter")
    : resultsCopy(filteredSpots.length, currentLang, spotsLoadState).action;
  if (hide) hide.textContent = onlyFavorites
    ? locationText("Favoriten ausblenden", "Hide favourites", "Skjul favoritter")
    : locationText("Spots ausblenden", "Hide spots", "Skjul spots");
}

function showAllSpotsFromFavorites() {
  resetAllFilters();
  if (homeNavigation) homeNavigation.openPanel("spots");
  else document.getElementById("btn-toggle-spots")?.focus({ preventScroll: true });
}

function renderSpotList() {
  syncResultsControls();
  syncSpotListLabels();
  syncFavoritesShortcut();
  if (!spotListEl) return;
  const active = document.activeElement;
  const inList = !!active && spotListEl.contains(active);
  const oldCards = [...spotListEl.querySelectorAll(".spot-card")];
  const oldCard = inList ? active.closest(".spot-card") : null;
  const id = oldCard?.dataset.spotId;
  const index = oldCard ? oldCards.indexOf(oldCard) : 0;
  const onFavoritesBack = active?.classList.contains("favorites-back");
  const action = active?.classList.contains("fsm-favorite") ? ".fsm-favorite" : ".spot-card-open";
  renderSpotListContent();
  const cards = [...spotListEl.querySelectorAll(".spot-card")];
  // Detail close must return to a current node after background rendering.
  if (lastSpotTriggerEl?.closest?.(".spot-card")) {
    const triggerId = lastSpotTriggerEl.closest(".spot-card").dataset.spotId;
    lastSpotTriggerEl = cards.find(card => card.dataset.spotId === triggerId)?.querySelector(".spot-card-open") || null;
  }
  if (!inList) return;
  const favoritesBack = onFavoritesBack && spotListEl.querySelector(".favorites-back");
  if (favoritesBack) { favoritesBack.focus({ preventScroll: true }); return; }
  const card = cards.find(item => item.dataset.spotId === id) || cards[Math.min(index, cards.length - 1)];
  const next = card?.querySelector(action) || card?.querySelector(".spot-card-open") || spotListEl.querySelector("button");
  next?.focus({ preventScroll: true });
}

function renderSpotListContent() {
  spotListEl.replaceChildren();
  if (spotsLoadState === "error" || (spotsLoadState === "loading" && spotsLoadHasFailed)) {
    showSpotsLoadErrorUI();
    return;
  }
  if (spotsLoadState === "loading" || spotsLoadState === "idle") {
    const message = document.createElement("p");
    message.className = "filter-group-helper";
    message.setAttribute("role", "status");
    message.textContent = locationText("Spots werden geladen …", "Loading spots …", "Indlæser spots …");
    spotListEl.appendChild(message);
    return;
  }

  if (onlyFavorites && !filteredSpots.length) {
    const wrapper = document.createElement("div");
    wrapper.className = "empty-state";
    wrapper.setAttribute("role", "status");
    const title = document.createElement("h3");
    title.className = "empty-state-title";
    title.textContent = favorites.size === 0
      ? locationText("Noch keine Favoriten", "No favourites yet", "Ingen favoritter endnu")
      : locationText("Keine Favoriten für diese Auswahl", "No favourites for this selection", "Ingen favoritter til dette valg");
    const text = document.createElement("p");
    text.className = "empty-state-text";
    text.textContent = favorites.size === 0
      ? locationText("Tippt bei einem Spot auf das Herz, um ihn hier wiederzufinden.", "Tap the heart on a spot to find it here later.", "Tryk på hjertet ved et spot for at finde det her igen.")
      : locationText("Andere Filter oder die aktuelle Verfügbarkeit können eure gespeicherten Spots ausblenden.", "Other filters or current availability may hide your saved spots.", "Andre filtre eller den aktuelle tilgængelighed kan skjule jeres gemte spots.");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-small btn-secondary";
    button.textContent = locationText("Alle Spots anzeigen", "Show all spots", "Vis alle spots");
    button.addEventListener("click", showAllSpotsFromFavorites);
    wrapper.append(title, text, button);
    spotListEl.appendChild(wrapper);
    return;
  }

  if (!filteredSpots.length) {
    const wrapper = document.createElement("div");
    wrapper.className = "empty-state";

    const titleEl = document.createElement("h3");
    titleEl.className = "empty-state-title";

    titleEl.textContent =
      currentLang === LANG_EN
        ? "No spots match your selection right now"
        : currentLang === LANG_DA
          ? "Ingen spots matcher jeres valg lige nu"
          : "Gerade keine Spots für eure Auswahl";

    const textEl = document.createElement("p");
    textEl.className = "empty-state-text";

    const hasSearch = !!searchTerm.trim();
    const canIncreaseRadius = hasFreshUserLocation() && radiusStep < getMaxRadiusIndex();
    const hasOtherFilters = !!(hasCategorySelection(categoryExplorer?.state) || categoryFilter || moodFilter || travelMode ||
      ageFilter !== "all" || onlyBigAdventures || onlyVerified || activeTagFilters.size);
    textEl.textContent = hasSearch
      ? locationText(
        "Zu eurem Suchbegriff gibt es in der aktuellen Auswahl keine Treffer. Löscht die Suche oder passt eure Filter an.",
        "No spots match your search within the current selection. Clear the search or adjust your filters.",
        "Ingen spots matcher jeres søgning i det aktuelle udvalg. Ryd søgningen, eller tilpas filtrene."
      )
      : canIncreaseRadius
        ? locationText("In diesem Umkreis passt gerade kein Spot zu eurer Auswahl. Vergrößert den Radius oder passt eure Filter an.", "No spots in this radius match your selection. Increase the radius or adjust your filters.", "Ingen spots i denne radius matcher jeres valg. Øg radius, eller tilpas filtrene.")
        : hasOtherFilters
          ? locationText("Zu diesen Filtern gibt es gerade keine Treffer. Setzt die Filter zurück, um wieder alle verfügbaren Spots zu sehen.", "No spots match these filters. Reset them to see all available spots again.", "Ingen spots matcher disse filtre. Nulstil dem for at se alle tilgængelige spots igen.")
          : locationText("Momentan sind keine passenden Spots verfügbar.", "No matching spots are available at the moment.", "Der er ingen passende spots tilgængelige lige nu.");

    const actionsEl = document.createElement("div");
    actionsEl.className = "empty-state-actions";
    const addAction = (label, action, secondary = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = secondary ? "btn btn-small btn-secondary" : "btn btn-small";
      button.textContent = label;
      button.addEventListener("click", action);
      actionsEl.appendChild(button);
    };
    const selection = selectionDescription();
    if (selection.length) textEl.textContent = locationText(
      "Für diese Auswahl gibt es keine bestätigten Treffer: ",
      "No confirmed matches for this selection: ",
      "Ingen bekræftede match for dette valg: "
    ) + selection.join(" · ") + ".";
    const recovery = selectionEvaluation?.recovery?.[0];
    if (recovery) {
      const label = labelOf(FACETS.find(item => item.id === recovery.id), currentLang);
      addAction(locationText(`„${label}“ entfernen`, `Remove “${label}”`, `Fjern „${label}“`), () => {
        categoryExplorer.state.facets.delete(recovery.id);
        applyFiltersAndRender();
      });
    }
    if (hasSearch && actionsEl.children.length < 2) {
      addAction(locationText("Suche löschen", "Clear search", "Ryd søgning"), () => {
        searchTerm = "";
        if (filterSearchEl) filterSearchEl.value = "";
        applyFiltersAndRender();
      });
    }
    if (canIncreaseRadius && actionsEl.children.length < 2) {
      addAction(locationText("Radius vergrößern", "Increase radius", "Større radius"), () => {
        radiusStep = Math.min(radiusStep + 1, getMaxRadiusIndex());
        filterRadiusEl.value = String(radiusStep);
        updateRadiusTexts();
        applyFiltersAndRender();
      });
    }
    if (hasOtherFilters && actionsEl.children.length < 2) {
      addAction(locationText("Alle Filter zurücksetzen", "Reset all filters", "Nulstil alle filtre"), resetAllFilters, true);
    }

    wrapper.appendChild(titleEl);
    wrapper.appendChild(textEl);
    wrapper.appendChild(actionsEl);

    spotListEl.appendChild(wrapper);

    return;
  }

  if (onlyFavorites) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "btn-ghost btn-small favorites-back";
    back.textContent = locationText("Alle Spots anzeigen", "Show all spots", "Vis alle spots");
    back.addEventListener("click", showAllSpotsFromFavorites);
    spotListEl.appendChild(back);
  }

  const frag = document.createDocumentFragment();

  const orderedSpots = filteredSpots.map((spot, index) => ({spot, index, distance: getSpotDistanceKm(spot)}));
  if (getUserOriginLatLng()) orderedSpots.sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity) || a.index - b.index);
  orderedSpots.forEach(({spot}) => {
    const card = document.createElement("article");
    card.className = "spot-card";

    const spotId = getSpotId(spot);

    card.dataset.spotId = spotId;
    card.setAttribute("aria-label", getSpotName(spot));

    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.alignItems = "center";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.gap = "8px";

    const titleEl = document.createElement("h3");
    titleEl.className = "spot-card-title";
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "spot-card-open";
    openButton.textContent = getSpotName(spot);
    titleEl.appendChild(openButton);

    headerRow.appendChild(titleEl);

    if (FEATURES.favorites) {
      const favBtn = document.createElement("button");
      favBtn.type = "button";
      favBtn.className = "btn-ghost btn-small";

      syncFavButtonState(favBtn, spotId);

      favBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        toggleFavorite(spot);
        syncFavButtonState(favBtn, spotId);
      });

      headerRow.appendChild(favBtn);
    }

    const cardImage = spot.photos?.find(image => image.src);
    if (cardImage) {
      const photo = document.createElement("img");
      photo.className = "preview-card-image";
      photo.src = cardImage.src;
      photo.alt = cardImage.caption?.[currentLang] || getSpotName(spot);
      photo.loading = "lazy";
      photo.decoding = "async";
      photo.addEventListener("error", () => photo.remove(), { once: true });
      card.appendChild(photo);
    }
    card.appendChild(headerRow);

    const subtitleText = getSpotSubtitle(spot);

    if (subtitleText) {
      const subtitleEl = document.createElement("p");
      subtitleEl.className = "spot-card-subtitle";
      subtitleEl.textContent = subtitleText;

      card.appendChild(subtitleEl);
    }

    const typeChips = createSpotTypeChips(spot, currentLang);
    if (typeChips.length) {
      const metaEl = document.createElement("div");
      metaEl.className = "spot-card-meta spot-card-types";
      metaEl.append(...typeChips);
      card.appendChild(metaEl);
    }

    const description = spot[`summary_${currentLang}`] || spot.summary_de || "";
    if (description) {
      const excerpt = document.createElement("p");
      excerpt.className = "spot-card-description";
      const sentences = typeof Intl.Segmenter === "function"
        ? [...new Intl.Segmenter(currentLang, { granularity: "sentence" }).segment(description)]
        : [];
      const completeExcerpt = sentences.filter(({ index, segment }) => index + segment.length <= 180)
        .map(({ segment }) => segment).join("").trim();
      const wordExcerpt = description.slice(0, 179).replace(/\s+\S*$/u, "");
      excerpt.textContent = description.length <= 180
        ? description
        : completeExcerpt || (wordExcerpt === description.slice(0, 179) ? description : wordExcerpt + "…");
      card.appendChild(excerpt);
    }
    const requirements = [...(categoryExplorer?.state.facets || [])];
    if (requirements.length) {
      const match = document.createElement("p");
      match.className = "spot-card-match";
      match.textContent = locationText("Passt zu: ", "Matches: ", "Matcher: ") + requirements
        .filter(id => facetValue(spot, id) === "yes")
        .map(id => labelOf(FACETS.find(item => item.id === id), currentLang)).join(" · ");
      if (match.textContent !== locationText("Passt zu: ", "Matches: ", "Matcher: ")) card.appendChild(match);
    }
    const badgesRow = document.createElement("div");
    badgesRow.className = "spot-card-badges";

    buildSpotBadges(spot).forEach((badge) => {
      const badgeEl = document.createElement("span");
      badgeEl.className = badge.className;

      if (badge.title) badgeEl.title = badge.title;

      if (badge.icon) {
        const iconEl = document.createElement("span");
        iconEl.className = "badge__icon";
        iconEl.setAttribute("aria-hidden", "true");
        if (badge.icon === "crown") iconEl.appendChild(createCrownIcon());
        else if (badge.icon === "clock") iconEl.appendChild(createMapToolIcon("clock"));
        else iconEl.textContent = badge.icon;

        badgeEl.appendChild(iconEl);
      }

      const labelEl = document.createElement("span");
      labelEl.textContent = badge.label;

      badgeEl.appendChild(labelEl);
      badgesRow.appendChild(badgeEl);
    });

    if (badgesRow.children.length) card.appendChild(badgesRow);

    const displayTags = getSpotHighlights(spot, currentLang, getSpotDisplayTags(spot));
    if (displayTags.length) {
      const highlightsRow = document.createElement("div");
      highlightsRow.className = "spot-card-badges spot-card-highlights";
      displayTags.slice(0,3).forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.className = "badge badge--soft";
        tagEl.textContent = tag;

        highlightsRow.appendChild(tagEl);
      });
      card.appendChild(highlightsRow);
    }


    const open = () => {
      lastSpotTriggerEl = openButton;
      focusSpotOnMap(spot);
    };

    const actions = document.createElement("div");
    actions.className = "spot-card-actions";
    const detailAction = document.createElement("button");
    detailAction.type = "button";
    detailAction.className = "btn-ghost btn-small";
    detailAction.textContent = locationText("Details ansehen", "View details", "Se detaljer");
    detailAction.setAttribute("aria-label", `${detailAction.textContent}: ${getSpotName(spot)}`);
    detailAction.addEventListener("click", () => { lastSpotTriggerEl = detailAction; showSpotDetails(spot, {focus:true}); });
    const mapAction = document.createElement("button");
    mapAction.type = "button";
    mapAction.className = "btn-ghost btn-small";
    mapAction.textContent = locationText("Auf Karte zeigen", "Show on map", "Vis på kort");
    mapAction.setAttribute("aria-label", `${mapAction.textContent}: ${getSpotName(spot)}`);
    mapAction.addEventListener("click", () => {
      focusSpotOnMap(spot, mapAction, { details: false });
      const target = document.getElementById("map");
      target?.setAttribute("tabindex", "-1");
      target?.focus({preventScroll:true});
      target?.scrollIntoView({block:"start",behavior:"auto"});
    });
    actions.append(detailAction, mapAction);
    card.appendChild(actions);
    card.addEventListener("click", (event) => {
      if (!event.target.closest("button, a, input, select, textarea")) open();
    });
    openButton.addEventListener("click", open);

    frag.appendChild(card);
  });

  spotListEl.appendChild(frag);
  // An optional compact overview makes 172 locations scannable without changing
  // detail, map, favourite or keyboard behavior. Never store UI state with memories.
  if (orderedSpots.length) {
    const tools = document.createElement("div");
    tools.className = "fsm-list-view-tools";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "fsm-list-view-toggle";
    const refresh = () => {
      const compact = spotListEl.classList.contains("fsm-compact-view");
      toggle.setAttribute("aria-pressed", String(compact));
      toggle.textContent = locationText("Kompakte Ansicht", "Compact view", "Kompakt visning");
    };
    toggle.addEventListener("click", () => {
      spotListEl.classList.toggle("fsm-compact-view");
      refresh();
    });
    refresh();
    tools.appendChild(toggle);
    spotListEl.prepend(tools);
  }
}

// ------------------------------------------------------
// Spot-Details
// ------------------------------------------------------

function focusSpotOnMap(spot, trigger, { details = true } = {}) {
  if (trigger) lastSpotTriggerEl = trigger;
  map?.closePopup();
  if (!map || !hasValidLatLng(spot)) {
    showSpotDetails(spot, { focus: true });
    return;
  }

  const zoom = Math.max(
    map.getZoom ? map.getZoom() : DEFAULT_MAP_ZOOM,
    13
  );

  if (!details) closeSpotDetails({ returnFocus: false });
  map.invalidateSize({ animate: false });
  map.setView([spot.lat, spot.lng], zoom);

  if (details) showSpotDetails(spot, { focus: true });
}

// The detail controller owns rendering and its expanded/open state.
function showSpotDetails(spot, options) {
  // A detail must never open behind the native Spots sheet or fullscreen map.
  // Each owner closes its own top-layer UI before the existing detail renders.
  document.dispatchEvent(new CustomEvent("fsm:before-spot-details"));
  spotDetails.show(spot, options);
}

function closeSpotDetails(options) {
  spotDetails.close(options);
}

function refreshDetailLocation() {
  spotDetails.refreshLocation();
}

// ------------------------------------------------------
// Standort anfordern
// ------------------------------------------------------

async function handleLocateClick() {
  if (locating) return;
  if (!navigator.geolocation || !map) {
    showToast("toast_location_error");
    return;
  }

  locating = true;
  btnLocateEl?.setAttribute("aria-busy", "true");
  closeMenu();
  pendingPreciseLocate = false;
  try {
    const loc = await requestUserLocationOnce({
      enableHighAccuracy: true,
      timeout: 9000,
      maximumAge: 0
    });

    if (
      loc &&
      Number.isFinite(loc.lat) &&
      Number.isFinite(loc.lng)
    ) {
      if (viewMapEl && getComputedStyle(viewMapEl).display === "none") appRouter?.switchRoute("map");
      map.invalidateSize({ animate: false });
      updateUserLocationMarker();
      if (loc.accuracy <= 100) {
        map.setView([loc.lat, loc.lng], 16, { animate: false });
        showToast("toast_location_ok");
      } else {
        pendingPreciseLocate = true;
        preciseLocateUntil = Date.now() + 30000;
        map.fitBounds(userAccuracyCircle.getBounds(), { padding: [24, 24], maxZoom: 15, animate: false });
        showToast(locationText(
          `Standort noch ungenau (${locationAccuracyText()}). Eine genauere Position wird gesucht.`,
          `Location is approximate (${locationAccuracyText()}). Looking for a more accurate position.`,
          `Positionen er endnu upræcis (${locationAccuracyText()}). Søger en mere præcis position.`
        ));
      }
      lastLocationRenderAt = Date.now();
      applyFiltersAndRender();
      refreshDetailLocation();
      startLocationWatch();
      setTimeout(() => {
        if (viewMapEl && getComputedStyle(viewMapEl).display !== "none") {
          document.getElementById("map")?.scrollIntoView({ block: "center", behavior: "auto" });
        }
      }, 80);
    }
  } catch (error) {
    pendingPreciseLocate = false;
    if (error?.code === 1) {
      stopLocationWatch();
      expireUserLocation({ force: true });
    }
    showToast("toast_location_error");
  } finally {
    locating = false;
    btnLocateEl?.removeAttribute("aria-busy");
  }
}

// ------------------------------------------------------
// Filter und Ansicht umschalten
// ------------------------------------------------------

function handleToggleFilters() {
  if (!btnToggleFiltersEl || !filterBodyEls.length) return;

  filtersCollapsed = !filtersCollapsed;

  const isExpanded = !filtersCollapsed;

  filterBodyEls.forEach((el) => {
    el.classList.toggle("hidden", filtersCollapsed);
  });

  const span = btnToggleFiltersEl.querySelector("span");

  if (span) {
    span.textContent = filtersCollapsed
      ? t("btn_show_filters", "Filter anzeigen")
      : t("btn_hide_filters", "Filter ausblenden");
  }

  btnToggleFiltersEl.setAttribute(
    "aria-expanded",
    isExpanded ? "true" : "false"
  );
}

function handleToggleView() {
  if (viewMapEl && getComputedStyle(viewMapEl).display === "none") {
    appRouter?.switchRoute("map");
    map?.invalidateSize();
    return;
  }
  if (!sidebarEl || !btnToggleViewEl) return;

  const isHidden = sidebarEl.classList.toggle("hidden");
  const span = btnToggleViewEl.querySelector("span");

  if (span) {
    span.textContent = isHidden
      ? t("btn_show_list", "Liste anzeigen")
      : t("btn_only_map", "Nur Karte");
  }

  btnToggleViewEl.setAttribute(
    "aria-pressed",
    isHidden ? "true" : "false"
  );

  if (map) {
    window.setTimeout(() => map.invalidateSize(), 300);
  }
}

// ------------------------------------------------------
// Spielideen
// ------------------------------------------------------

function getRandomPlayIdea() {
  if (
    typeof I18N !== "undefined" &&
    typeof I18N.getRandomPlayIdea === "function"
  ) {
    const idea = I18N.getRandomPlayIdea();

    if (idea) return idea;
  }

  return "";
}

// ------------------------------------------------------
// Initialisierung
// ------------------------------------------------------

async function init() {
  try {
    languageSwitcherEl =
      document.getElementById("language-switcher") ||
      document.getElementById("language-toggle");

    languageSwitcherFlagEl = document.getElementById(
      "language-switcher-flag"
    );

    btnLocateEl = document.getElementById("btn-locate");
    btnHelpEl = document.getElementById("btn-help");

    viewMapEl = document.getElementById("view-map");
    viewAboutEl = document.getElementById("view-about");

    bottomNavButtons = document.querySelectorAll(
      ".bottom-nav-item"
    );

    bottomNavMapLabelEl = document.getElementById(
      "bottom-nav-map-label"
    );

    bottomNavAboutLabelEl = document.getElementById(
      "bottom-nav-about-label"
    );

    sidebarEl = document.querySelector(".sidebar");

    const filterTitleEl = document.getElementById("filter-title");

    filterSectionEl = filterTitleEl
      ? filterTitleEl.closest(".sidebar-section")
      : null;

    if (filterSectionEl) {
      filterBodyEls = Array.from(filterSectionEl.children)
        .filter(
          (el) =>
            !el.classList.contains("sidebar-section-header")
        );

      filtersCollapsed = true;

      filterBodyEls.forEach((el) => {
        el.classList.add("hidden");
      });
    }

    btnToggleFiltersEl = document.getElementById(
      "btn-toggle-filters"
    );

    btnToggleViewEl = document.getElementById(
      "btn-toggle-view"
    );

    playIdeasBtnEl = document.getElementById("btn-play-idea");

    filterSearchEl = document.getElementById("filter-search");
    filterCategoryEl = document.getElementById("filter-category");
    categoryExplorer = createCategoryExplorer({
      mount: document.getElementById("category-explorer"),
      getLang: () => currentLang,
      onChange: () => applyFiltersAndRender()
    });
    filterAgeEl = document.getElementById("filter-age");
    filterRadiusEl = document.getElementById("filter-radius");

    filterRadiusMaxLabelEl = document.getElementById(
      "filter-radius-max-label"
    );

    filterRadiusDescriptionEl = document.getElementById(
      "filter-radius-description"
    );

    filterBigEl = document.getElementById(
      "filter-big-adventures"
    );

    filterVerifiedEl = document.getElementById(
      "filter-verified"
    );

    filterFavoritesEl = document.getElementById(
      "filter-favorites"
    );

    tagFilterContainerEl = document.getElementById(
      "filter-tags"
    );

    filterSummaryEl = document.getElementById(
      "filter-summary"
    );

    btnOpenFilterModalEl = document.getElementById(
      "btn-open-filter-modal"
    );

    filterModalEl = document.getElementById("filter-modal");

    filterModalCloseEl = document.getElementById(
      "filter-modal-close"
    );

    filterModalApplyEl = document.getElementById(
      "filter-modal-apply"
    );

    filterModalResetEl = document.getElementById(
      "filter-modal-reset"
    );

    spotListEl = document.getElementById("spot-list");
    spotDetailEl = document.getElementById("spot-detail");

    plusSectionEl = document.getElementById("plus-section");

    btnTogglePlusEl = document.getElementById(
      "btn-toggle-plus"
    );

    daylogSectionEl = document.getElementById(
      "daylog-section"
    );

    btnToggleDaylogEl = document.getElementById(
      "btn-toggle-daylog"
    );

    plusCodeInputEl = document.getElementById(
      "plus-code-input"
    );

    plusCodeSubmitEl = document.getElementById(
      "plus-code-submit"
    );

    plusStatusTextEl = document.getElementById(
      "plus-status-text"
    );

    daylogTextEl = document.getElementById("daylog-text");
    daylogTextEl?.addEventListener("input", persistDaylogDrafts);
    daylogSaveEl = document.getElementById("daylog-save");

    daylogLastSavedEl = document.getElementById(
      "daylog-last-saved"
    );

    daylogClearEl = document.getElementById("daylog-clear");
    daylogListEl = document.getElementById("daylog-list");

    toastEl = document.getElementById("toast");
    skipLinkEl = document.querySelector(".skip-link");

    const initialLang = getInitialLang();

    setLanguage(initialLang, { initial: true });

    initToast({
      element: toastEl,
      t
    });

    const mapResult = initMap({
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM
    });

    map = mapResult.map;
    markersLayer = mapResult.markersLayer;

    const debouncedResize = debounce(
      () => {
        const element = map?.getContainer();
        if (!element?.clientWidth || !element.clientHeight) return;
        const size = map.getSize();
        // Leaflet also handles window resize. Avoid a duplicate invalidation
        // which would round the just-restored diary return position.
        if (size.x !== element.clientWidth || size.y !== element.clientHeight) map.invalidateSize({ animate: false });
      },
      200
    );

    if (map) {
      map.on("dragstart", () => { pendingPreciseLocate = false; });
      map.on("click", () => {
        closeSpotDetails({ returnFocus: true });
      });

      // Marker clustering handles viewport changes without rebuilding the spot list.

      window.addEventListener("resize", debouncedResize);
    }

    tilla = new TillaCompanion({
      getText: (key) => t(key)
    });

    if (languageSwitcherEl) {
      languageSwitcherEl.addEventListener("click", () => {
        const nextLang =
          currentLang === LANG_DE
            ? LANG_DA
            : currentLang === LANG_DA
              ? LANG_EN
              : LANG_DE;

        setLanguage(nextLang);
      });

      updateLanguageSwitcherVisual();
    }

    btnLocateEl?.addEventListener(
      "click",
      handleLocateClick
    );

    appRouter = initRouter({
      viewMapEl,
      viewAboutEl,
      bottomNavButtons,
      btnHelpEl,
      getCurrentLang: () => currentLang,
      getMapView: () => map ? { center: { lat: map.getCenter().lat, lng: map.getCenter().lng }, zoom: map.getZoom() } : null,
      restoreMapView: saved => {
        if (!map || !saved || !Number.isFinite(saved.center?.lat) || !Number.isFinite(saved.center?.lng) || !Number.isFinite(saved.zoom)) return;
        map.invalidateSize({ animate: false });
        map.setView(saved.center, saved.zoom, { animate: false, reset: true });
      }
    });

    diaryView = initDiaryView({
      router: appRouter,
      hasNewDraft: () => !!daylogTextEl?.value.trim() || !!daylogPhotos?.hasNew()
    });

    // Suche
    if (filterSearchEl) {
      const applySearch = debounce(() => {
        searchTerm = String(filterSearchEl.value || "").trim();

        applyFiltersAndRender();
      }, 180);

      filterSearchEl.addEventListener("input", () => {
        applySearch();
      });
    }

    filterCategoryEl?.addEventListener("change", (event) => {
      categoryFilter = event.target.value;

      applyFiltersAndRender();
    });

    filterAgeEl?.addEventListener("change", (event) => {
      ageFilter = event.target.value;

      applyFiltersAndRender();
    });

    if (filterRadiusEl) {
      initRadiusSliderA11y();
    }

    filterBigEl?.addEventListener("change", (event) => {
      onlyBigAdventures = event.target.checked;

      applyFiltersAndRender();
    });

    filterVerifiedEl?.addEventListener("change", (event) => {
      onlyVerified = event.target.checked;

      applyFiltersAndRender();
    });

    document.getElementById("btn-open-favorites")?.addEventListener("click", openFavoritesFromMenu);
    syncFavoritesShortcut();

    if (FEATURES.favorites && filterFavoritesEl) {
      filterFavoritesEl.addEventListener("change", (event) => {
        onlyFavorites = event.target.checked;

        applyFiltersAndRender();
      });
    }

    // Shortcuts set the visible category state; no additional hidden mood constraint.
    if (FEATURES.moodFilter) {
      document.querySelectorAll(".mood-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          moodFilter = null;
          selectShortcut(categoryExplorer.state, chip.dataset.mood);
          applyFiltersAndRender();
        });
      });
    }

    // Reisemodus
    if (FEATURES.travelMode) {
      document.querySelectorAll(".travel-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const mode =
            chip.getAttribute("data-travel-mode") ||
            "everyday";

          if (travelMode === mode) {
            travelMode = null;

            chip.classList.remove("travel-chip--active");
            chip.setAttribute("aria-pressed", "false");

            safeTillaCall("setTravelMode", null);
          } else {
            travelMode = mode;

            document.querySelectorAll(".travel-chip")
              .forEach((otherChip) => {
                const isActive = otherChip === chip;

                otherChip.classList.toggle(
                  "travel-chip--active",
                  isActive
                );

                otherChip.setAttribute(
                  "aria-pressed",
                  isActive ? "true" : "false"
                );
              });

            safeTillaCall("setTravelMode", mode);
          }

          applyFiltersAndRender();
        });
      });
    }

    // Filteransicht
    if (btnToggleFiltersEl) {
      btnToggleFiltersEl.addEventListener(
        "click",
        handleToggleFilters
      );

      btnToggleFiltersEl.querySelector("span")
        ?.replaceChildren?.();

      const span = btnToggleFiltersEl.querySelector("span");

      if (span) {
        span.textContent = t(
          "btn_show_filters",
          "Filter anzeigen"
        );
      }

      btnToggleFiltersEl.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    // Kartenansicht
    if (btnToggleViewEl) {
      btnToggleViewEl.addEventListener(
        "click",
        handleToggleView
      );

      const span = btnToggleViewEl.querySelector("span");

      if (span) {
        span.textContent = t("btn_only_map", "Nur Karte");
      }

      btnToggleViewEl.setAttribute(
        "aria-pressed",
        "false"
      );
    }

    // Plus und Mein Tag auf- und zuklappen
    function updateGenericSectionToggleLabel(btn, isOpen) {
      if (!btn) return;

      const target = btn.querySelector("span") || btn;

      target.textContent = t(isOpen ? "btn_hide" : "btn_show");

      btn.closest("summary")?.setAttribute("aria-expanded", String(isOpen));
    }

    if (plusSectionEl && btnTogglePlusEl) {
      plusSectionEl.addEventListener("toggle", () => {
        updateGenericSectionToggleLabel(
          btnTogglePlusEl,
          !!plusSectionEl.open
        );
      });

      updateGenericSectionToggleLabel(
        btnTogglePlusEl,
        !!plusSectionEl.open
      );
    }

    if (daylogSectionEl && btnToggleDaylogEl) {
      daylogSectionEl.addEventListener("toggle", () => {
        updateGenericSectionToggleLabel(
          btnToggleDaylogEl,
          !!daylogSectionEl.open
        );
      });

      updateGenericSectionToggleLabel(
        btnToggleDaylogEl,
        !!daylogSectionEl.open
      );
    }

    // Plus aktivieren
    if (FEATURES.plus && plusCodeSubmitEl) {
      plusCodeSubmitEl.addEventListener(
        "click",
        handlePlusCodeSubmit
      );
    }

    // Neue Erinnerung speichern
    if (FEATURES.daylog && daylogSaveEl) {
      daylogSaveEl.addEventListener(
        "click",
        handleDaylogSave
      );
    }

    // Spielideen
    if (FEATURES.playIdeas && playIdeasBtnEl) {
      playIdeasBtnEl.addEventListener("click", () => {
        const idea = getRandomPlayIdea();

        if (!idea) return;

        if (tilla && typeof tilla.showPlayIdea === "function") {
          safeTillaCall("showPlayIdea", idea);

          document.querySelector(".tilla-sidebar-card")
            ?.scrollIntoView?.({
              behavior: "smooth",
              block: "nearest"
            });
        } else {
          showToast(idea);
        }
      });
    }

    // Fullscreen navigation delegates to the same application actions/state.
    document.addEventListener("fsm:fullscreen-action", event => {
      const { action, value } = event.detail || {};
      if (action === "sync") syncFullscreenControls();
      else if (action === "search" && filterSearchEl) {
        filterSearchEl.value = String(value || "").slice(0, 240);
        filterSearchEl.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (action === "shortcut" && value === "water" && categoryExplorer) {
        // The fullscreen water theme is exactly the same union as quick choice.
        moodFilter = null;
        if (!shortcutIsSelected(categoryExplorer.state, "water")) selectShortcut(categoryExplorer.state, "water");
        applyFiltersAndRender();
      } else if (action === "world") {
        const target = [...document.querySelectorAll("#category-explorer [data-world]")]
          .find(button => button.dataset.world === value);
        if (target && !target.hidden && !target.disabled) target.click();
      } else if (action === "filters") openFilterModal();
      else if (action === "spots") showFilteredResults();
      else if (action === "diary") appRouter?.switchRoute("diary");
      else if (action === "menu") document.getElementById("menu-toggle")?.click();
      else if (action === "plus" && plusSectionEl) {
        appRouter?.switchRoute("map");
        if (homeNavigation) homeNavigation.openPanel("plus");
        else {
          plusSectionEl.open = true;
          requestAnimationFrame(() => {
            const summary = plusSectionEl.querySelector("summary");
            summary?.focus({ preventScroll: true });
            plusSectionEl.scrollIntoView({ block: "start", behavior: "auto" });
          });
        }
      }
    });

    // Home navigation reuses the existing Filter, Spots, Plus and Diary state.
    homeNavigation = createHomeNavigation({plusEnabled: FEATURES.plus, diaryEnabled: FEATURES.daylog});

    // Filtermodal
    btnOpenFilterModalEl?.addEventListener(
      "click",
      openFilterModal
    );

    filterModalCloseEl?.addEventListener("click", () => {
      closeFilterModal({ returnFocus: true });
    });

    filterModalApplyEl?.addEventListener("click", showFilteredResults);

    filterModalResetEl?.addEventListener(
      "click",
      resetAllFilters
    );

    filterModalEl?.addEventListener("click", (event) => {
      if (event.target === filterModalEl) {
        closeFilterModal({ returnFocus: true });
      }
    });

    // Skip-Link
    if (skipLinkEl) {
      skipLinkEl.addEventListener("click", (event) => {
        const href = skipLinkEl.getAttribute("href") || "";

        if (!href.startsWith("#")) return;

        event.preventDefault();

        const id = href.slice(1);
        const target = document.getElementById(id);

        if (!target) return;

        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }

        target.scrollIntoView();
        target.focus?.();
      });
    }

    // Escape
    document.addEventListener("keydown", (event) => {
      if (
        event.key !== "Escape" &&
        event.key !== "Esc"
      ) {
        return;
      }

      if (
        isFilterModalOpen &&
        filterModalEl &&
        !filterModalEl.hidden
      ) {
        event.preventDefault();

        closeFilterModal({ returnFocus: true });

        return;
      }

      const isOpen =
        spotDetailEl &&
        !spotDetailEl.classList.contains(
          "spot-details--hidden"
        );

      if (isOpen) {
        event.preventDefault();

        closeSpotDetails({ returnFocus: true });
      }
    });

    // Timers can pause in background tabs; recheck before using the last fix.
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) expireUserLocation();
    });
    window.addEventListener("pageshow", () => expireUserLocation());
    window.addEventListener("pagehide", () => {
      stopLocationWatch();
      if (locationExpiryTimer !== null) clearTimeout(locationExpiryTimer);
      locationExpiryTimer = null;
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted && hasFreshUserLocation()) {
        scheduleLocationExpiry();
        startLocationWatch();
      }
    });

    // Gespeicherte Zustände laden
    loadPlusStateFromStorage();
    if (FEATURES.daylog && daylogSaveEl) {
      daylogPhotos = initDaylogPhotos({
        notify: showToast,
        onDirty: () => { if (daylogSaveEl) daylogSaveEl.disabled = !!daylogPhotos?.isBusy() || daylogMutationPending || personalBackupBusy; },
        isLocked: () => daylogMutationPending || personalBackupBusy
      });
      await daylogPhotos.ready;
      const photoHost = document.createElement("div");
      daylogSaveEl.before(photoHost);
      daylogPhotos.mountMain(photoHost);
    }
    await loadDaylogFromStorage();
    diaryView?.restoreDrafts(daylogEditDrafts.size > 0);
    initPersonalBackup({
      setBusy: value => {
        personalBackupBusy = value;
        if (daylogSaveEl) daylogSaveEl.disabled = value || daylogMutationPending || !!daylogPhotos?.isBusy();
        document.documentElement.dataset.personalBackupBusy = String(value);
      },
      afterImport: () => refreshPersonalData({ daylog: true, favorite: true }),
      hasDraft: () => daylogMutationPending || !!daylogPhotos?.hasDraft() || !!daylogTextEl?.value.trim() || daylogEditDrafts.size > 0
    });
    // Isolated V5 design only: records, photos and navigation remain the original implementations.
    initDiaryPremium();
    window.addEventListener("storage", event => {
      if (event.key === null || event.key === PLUS_STORAGE_KEY) loadPlusStateFromStorage({ reapplyFilters: true });
      if (event.key === null || event.key === DAYLOG_STORAGE_KEY || event.key === "fs_favorites") {
        refreshPersonalData({ daylog: event.key !== "fs_favorites", favorite: event.key !== DAYLOG_STORAGE_KEY });
      }
    });
    const syncPersonalData = () => {
      loadPlusStateFromStorage({ reapplyFilters: true });
      refreshPersonalData({ daylog: true, favorite: true });
    };
    window.addEventListener("focus", syncPersonalData);
    window.addEventListener("pageshow", syncPersonalData);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) syncPersonalData(); });
    syncPersonalData();
    initLazyLoadImages();

    updateFilterSummary();
    updateMapLanguage();
    loadSpots();
  } catch (err) {
    console.error("[Family Spots] Init-Fehler:", err);
  }
}

// ------------------------------------------------------
// App starten
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  // init() sets the initial language synchronously from complete bundled copy.
  // Network refreshes run in parallel and never hold up the map or controls.
  const messagesReady = I18N.init().catch(err => {
    warn("[Family Spots] I18N refresh failed:", err);
  });
  await init();
  initFilterSelects();
  await messagesReady;
  const activeFilterId = document.activeElement?.dataset?.filterId;
  setLanguage(currentLang, { initial: true });
  if (activeFilterId) {
    [...(tagFilterContainerEl?.querySelectorAll("[data-filter-id]") || [])]
      .find(button => button.dataset.filterId === activeFilterId)?.focus({ preventScroll: true });
  }
});
function updateMapLanguage() {
  updateMapStatusLanguage();
  updateUserLocationMarker();
  for (const [selector, key] of [[".leaflet-control-zoom-in", "map_zoom_in"], [".leaflet-control-zoom-out", "map_zoom_out"]]) {
    document.querySelectorAll(selector).forEach(el => {
      el.setAttribute("title", t(key));
      el.setAttribute("aria-label", t(key));
    });
  }
  if (map?.attributionControl) {
    const old = map._fsmAttribution;
    if (old) map.attributionControl.removeAttribution(old);
    const text = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ${t("map_contributors")}`;
    map.attributionControl.addAttribution(text);
    map._fsmAttribution = text;
  }
}
