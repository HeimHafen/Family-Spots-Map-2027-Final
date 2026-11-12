// js/map.js
// =========================================
// Leaflet-Map + Marker / Cluster
// =========================================

"use strict";

import { initMapFullscreen } from "./ui/map-fullscreen.js";

import { getSpotName } from "./filters/tags.js?v=20261010-unified-4";
import { createSpotPin, createSpotPreview, attachSpotLabels, setSpotLabelMarkers, scheduleSpotLabels, spotPinId } from "./ui/map-spots.js?v=20261112-mein-tag-album";

// Keep existing marker DOM nodes when only distances or the viewport changed.
const markerRenderSignatures = new WeakMap();

let mapStatus = null;
let mapUnavailable = false;

export function updateMapStatusLanguage() {
  if (!mapStatus) return;
  const lang = document.documentElement.lang;
  const texts = mapUnavailable
    ? {de: "Die Karte ist gerade nicht verfügbar. Spotinfos, Filter und Erinnerungen könnt ihr weiter nutzen.", en: "The map is currently unavailable. You can still use spot information, filters and memories.", da: "Kortet er ikke tilgængeligt lige nu. I kan stadig bruge spotoplysninger, filtre og minder."}
    : {de: "Offline · Die Hintergrundkarte braucht Internet. Spotinfos und lokal vorbereitete Bilder bleiben verfügbar.", en: "Offline · The background map needs internet. Spot information and prepared photos are still available.", da: "Offline · Baggrundskortet kræver internet. Stedoplysninger og klargjorte billeder er stadig tilgængelige."};
  mapStatus.textContent = texts[lang] || texts.de;
  mapStatus.hidden = !mapUnavailable && navigator.onLine;
}

function initMapStatus() {
  mapStatus = document.createElement("p");
  mapStatus.setAttribute("role", "status");
  mapStatus.className = "fsm-map-offline-status";
  mapStatus.style.cssText = "position:absolute;left:12px;right:12px;bottom:38px;z-index:550;margin:0;padding:10px 12px;border-radius:12px;background:var(--card-bg,#fff7ee);color:var(--text-color,#452213);box-shadow:0 2px 8px #0002;font:inherit;font-size:13px;line-height:1.45;pointer-events:none";
  document.getElementById("map")?.appendChild(mapStatus);
  updateMapStatusLanguage();
}

/**
 * Prüft, ob ein Spot brauchbare Koordinaten hat.
 * Normalisiert ggf. lon -> lng.
 */
export function hasValidLatLng(spot) {
  if (!spot) return false;

  if (spot.lat == null || String(spot.lat).trim() === "" || (spot.lng == null && spot.lon == null)) return false;
  const rawLng = spot.lng ?? spot.lon;
  if (String(rawLng).trim() === "") return false;
  let lat = Number(spot.lat);
  let lng = spot.lng != null ? Number(spot.lng) : Number(spot.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return false;
  }

  spot.lat = lat;
  spot.lng = lng;
  return true;
}

/**
 * Liefert einen sinnvollen a11y-Label-Text für Marker (ohne externe Imports).
 */
function getSpotA11yLabel(spot) {
  return getSpotName(spot);
}

/**
 * Macht einen Marker per Tastatur erreichbar und bindet Click/Keyboard-Action.
 * - setzt tabindex, role, aria-label sobald das DOM-Element existiert
 * - Enter/Space öffnet die am Pin verankerte Vorschau
 */
function makeMarkerAccessible(marker, spot, focusSpotOnMap, map) {
  // bindPopup owns click and Enter. Space shares the same preview action.

  marker.on("add", () => {
    const el = marker.getElement?.();
    if (!el) return;

    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", getSpotA11yLabel(spot));
    el.setAttribute("aria-expanded", "false");
    el.addEventListener("focus", () => scheduleSpotLabels(map));
    el.addEventListener("blur", () => scheduleSpotLabels(map));

    // Keydown direkt am DOM-Element (robuster als Leaflet-"keypress")
    if (typeof focusSpotOnMap === "function") {
      const onKeyDown = (e) => {
        const key = e?.key;
        if (key === " " || key === "Space" || key === "Spacebar") {
          // Space würde sonst bei vielen Browsern scrollen
          e.preventDefault?.();
          focusSpotOnMap(spot);
        }
      };

      // Handler merken, damit wir ihn beim Entfernen wieder lösen können
      marker._a11yKeyDownHandler = onKeyDown;
      el.addEventListener("keydown", onKeyDown);
    }
  });

  marker.on("remove", () => {
    const el = marker.getElement?.();
    const h = marker._a11yKeyDownHandler;
    if (el && h) {
      el.removeEventListener("keydown", h);
    }
    marker._a11yKeyDownHandler = null;
  });
}

/**
 * Initialisiert die Leaflet-Karte und den Marker-Layer.
 * Wenn das MarkerCluster-Plugin verfügbar ist, wird ein Cluster-Layer genutzt,
 * sonst fällt die Funktion auf ein einfaches LayerGroup zurück.
 */
export function initMap({ center, zoom }) {
  if (typeof L === "undefined") {
    mapUnavailable = true;
    initMapStatus();
    return {map: null, markersLayer: null};
  }

  const map = L.map("map", {
    center,
    zoom,
    maxZoom: 19,
    zoomControl: true,
    attributionControl: true
  });

  // Basis-Tiles
  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      ""
  }).addTo(map);
  initMapStatus();
  function syncConnection() {
    if (!navigator.onLine && map.hasLayer(tiles)) map.removeLayer(tiles);
    else if (navigator.onLine && !map.hasLayer(tiles)) tiles.addTo(map);
    updateMapStatusLanguage();
  }
  window.addEventListener("online", syncConnection);
  window.addEventListener("offline", syncConnection);
  syncConnection();

  // Marker-Layer: Cluster, wenn möglich
  let markersLayer;
  if (typeof L.markerClusterGroup === "function") {
    markersLayer = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: zoom => zoom >= 15 ? 28 : zoom >= 13 ? 44 : 80
    });
  } else {
    console.warn(
      "[Family Spots] Leaflet.markercluster nicht verfügbar – verwende einfache Marker-Ebene."
    );
    markersLayer = L.layerGroup();
  }

  markersLayer.addTo(map);

  L.control.scale({ imperial: false, maxWidth: 90 }).addTo(map);
  let popupSource = null;
  map.on("popupopen", event => { popupSource = event.popup._source; });
  map.on("popupclose", () => { popupSource = null; });
  map.getContainer().addEventListener("keydown", event => {
    if (event.key === "Escape" && popupSource) {
      const source = popupSource;
      event.preventDefault();
      event.stopPropagation();
      map.closePopup();
      source.getElement()?.focus({ preventScroll: true });
    }
  }, true);
  attachSpotLabels(map);
  initMapFullscreen(map);
  return { map, markersLayer };
}

/**
 * Rendert Marker für eine Spot-Liste.
 * - nutzt den übergebenen markersLayer (Cluster oder LayerGroup)
 * - maxMarkers dient nur noch als Schwellenwert für einen Hinweis-Toast,
 *   es werden aber trotzdem alle Spots gerendert
 * - öffnet bei Klick/Enter/Space eine kompakte Vorschau; der Button öffnet die Details
 * - gibt zurück, ob der Marker-Limit-Toast bereits gezeigt wurde
 */
export function renderMarkers({
  map,
  markersLayer,
  spots,
  maxMarkers,
  currentLang, // aktuell nur für evtl. spätere Toast-Texte
  showToast,
  hasShownMarkerLimitToast,
  focusSpotOnMap,
  onPreviewOpen,
  getSpotMetaParts
}) {
  if (!map || !markersLayer) return hasShownMarkerLimitToast;

  // NEU: wir begrenzen die Liste nicht mehr hart, sondern nutzen maxMarkers
  // nur als Schwellwert für einen Hinweis.
  const list = Array.isArray(spots) ? spots.filter(hasValidLatLng) : [];
  // Include the rendered content: an updated summary/category must refresh a popup too.
  const entries = list.map(spot => [spotPinId(spot), spot.lat, spot.lng, getSpotName(spot), spot.category, spot.categories, spot.tags, spot[`summary_${currentLang}`] || spot.summary, getSpotMetaParts?.(spot)]);
  entries.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const signature = JSON.stringify([currentLang, ...entries]);
  const unchanged = markerRenderSignatures.get(markersLayer) === signature;
  if (!unchanged) {
    markersLayer.clearLayers();
    markerRenderSignatures.set(markersLayer, signature);
  }
  const tooManyMarkers =
    maxMarkers && Number.isFinite(maxMarkers) && list.length > maxMarkers;

  const renderedMarkers = [];
  if (!unchanged) list.forEach((spot) => {
    if (!hasValidLatLng(spot)) return;

    const icon = L.divIcon({
      className: "fsm-map-marker",
      html: createSpotPin(spot),
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -10]
    });
    const marker = L.marker([spot.lat, spot.lng], { icon, riseOnHover: true, title: getSpotName(spot) });
    marker._fsmSpotId = spotPinId(spot);
    const preview = createSpotPreview(spot, {
      lang: currentLang,
      metaParts: getSpotMetaParts?.(spot),
      onClose: () => { marker.closePopup(); marker.getElement()?.focus({preventScroll: true}); },
      onOpen: (button) => {
        const trigger = marker.getElement() || button;
        marker.closePopup();
        focusSpotOnMap?.(spot, trigger);
      }
    });
    marker.bindPopup(preview, {
      className: "fsm-map-popup",
      closeButton: false,
      maxWidth: Math.min(300, Math.max(190, map.getSize().x - 60)),
      minWidth: 180,
      maxHeight: Math.max(100, Math.min(300, map.getSize().y - 110)),
      autoPan: true,
      autoPanPaddingTopLeft: [52, 12],
      autoPanPaddingBottomRight: [12, 28],
      keepInView: true
    });
    marker.on("popupopen", () => {
      onPreviewOpen?.();
      marker.getElement()?.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => {
        if (marker.isPopupOpen() && preview.isConnected) {
          preview.querySelector(".fsm-spot-preview__open")?.focus({preventScroll: true});
        }
      });
    });
    marker.on("popupclose", () => {
      const hadFocus = preview.contains(document.activeElement);
      marker.getElement()?.setAttribute("aria-expanded", "false");
      if (hadFocus) marker.getElement()?.focus({preventScroll: true});
    });
    // Leaflet provides Enter activation; our Space handler shares the same action.
    makeMarkerAccessible(marker, spot, () => marker.openPopup(), map);
    renderedMarkers.push(marker);

    markersLayer.addLayer(marker);
  });

  if (!unchanged) setSpotLabelMarkers(map, renderedMarkers);

  // Hinweis-Toast, wenn sehr viele Marker gerendert werden
  if (
    tooManyMarkers &&
    !hasShownMarkerLimitToast &&
    typeof showToast === "function"
  ) {
    showToast("toast_marker_limit");
    hasShownMarkerLimitToast = true;
  }

  return hasShownMarkerLimitToast;
}

/**
 * Baut Routing-URLs für Apple Maps und Google Maps.
 */
export function getRouteUrlsForSpot(spot) {
  // A retained historic pin is not a confirmed destination.
  if (spot?.quality_review_status === "location_assignment_unconfirmed") return null;
  if (!hasValidLatLng(spot)) return null;

  const { lat, lng } = spot;

  return {
    apple: `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(
      `${lat},${lng}`
    )}`,
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  };
}
