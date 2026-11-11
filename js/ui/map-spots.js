// Geographic spot presentation. Text comes from the existing translated data.
import { getSpotName, getSpotId } from "../filters/tags.js?v=20261010-unified-4";

export function createSpotPin(spot) {
  const node = document.createElement("div");
  node.className = "fsm-spot-pin";
  const art = document.createElement("span");
  art.className = "spot-marker-inner fsm-spot-pin__dot";
  art.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.className = "fsm-spot-pin__name";
  label.setAttribute("aria-hidden", "true");
  label.textContent = getSpotName(spot);
  node.append(art, label);
  return node;
}

const copy = {
  de: {open: "Spot ansehen", close: "Vorschau schließen", free: "Kostenlos"},
  en: {open: "View spot", close: "Close preview", free: "Free"},
  da: {open: "Se spot", close: "Luk forhåndsvisning", free: "Gratis"}
};

export function createSpotPreview(spot, { lang, metaParts, onOpen, onClose }) {
  const labels = copy[lang] || copy.de;
  const card = document.createElement("section");
  card.className = "fsm-spot-preview";
  const title = document.createElement("h3");
  title.id = "fsm-map-preview-title";
  title.textContent = getSpotName(spot);
  card.setAttribute("aria-labelledby", title.id);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "fsm-spot-preview__close";
  close.setAttribute("aria-label", labels.close);
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  close.addEventListener("click", onClose);
  card.append(title, close);
  const parts = (metaParts || []).filter(part => part && part !== spot.city).slice(0, 2);
  if (parts.length) {
    const meta = document.createElement("p");
    meta.className = "fsm-spot-preview__meta";
    meta.textContent = parts.join(" · ");
    card.appendChild(meta);
  }
  if (Array.isArray(spot.tags) && spot.tags.includes("free")) {
    const free = document.createElement("span");
    free.className = "fsm-spot-preview__free";
    free.textContent = labels.free;
    card.appendChild(free);
  }
  const summaryText = spot[`summary_${lang}`] || spot.summary;
  if (summaryText) {
    const summary = document.createElement("p");
    summary.className = "fsm-spot-preview__summary";
    summary.textContent = summaryText;
    card.appendChild(summary);
  }
  const open = document.createElement("button");
  open.type = "button";
  open.className = "fsm-spot-preview__open";
  open.textContent = labels.open;
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="m9 5 7 7-7 7"/></svg>';
  open.appendChild(arrow);
  open.addEventListener("click", () => onOpen(open));
  card.appendChild(open);
  return card;
}

const mapStates = new WeakMap();
const overlap = (a, b) => a.left < b.right + 6 && a.right + 6 > b.left && a.top < b.bottom + 6 && a.bottom + 6 > b.top;

// Labels use the existing marker DOM, not a second clickable geographic layer.
// Reserve all pin hit areas and visible controls; try right then left and suppress collisions.
export function attachSpotLabels(map) {
  const state = { markers: [], frame: null, schedule: null };
  function update() {
    state.frame = null;
    const container = map.getContainer();
    const bounds = container.getBoundingClientRect();
    const size = map.getSize();
    const entries = state.markers.map(marker => ({ marker, el: marker.getElement?.() })).filter(entry => entry.el?.isConnected);
    for (const { marker } of entries) {
      const popup = marker.getPopup();
      const maxWidth = Math.min(300, Math.max(190, size.x - 60));
      const fullscreen = container.closest("#fsm-map-fullscreen[open]");
      const reservedHeight = fullscreen
        ? (fullscreen.classList.contains("fsm-map-search-open") ? 290 : 200) : 110;
      const maxHeight = Math.max(80, Math.min(300, size.y - reservedHeight));
      if (popup && (popup.options.maxWidth !== maxWidth || popup.options.maxHeight !== maxHeight)) {
        popup.options.maxWidth = maxWidth;
        popup.options.maxHeight = maxHeight;
        if (marker.isPopupOpen()) popup.update();
      }
    }
    const reserved = entries.map(({ marker }) => {
      const p = map.latLngToContainerPoint(marker.getLatLng());
      return {marker, left: p.x - 22, right: p.x + 22, top: p.y - 22, bottom: p.y + 22};
    });
    container.querySelectorAll(".leaflet-control, .leaflet-popup, .marker-cluster, .fsm-map-offline-status").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) reserved.push({left: r.left - bounds.left, right: r.right - bounds.left, top: r.top - bounds.top, bottom: r.bottom - bounds.top});
    });
    const fullscreen = container.closest("#fsm-map-fullscreen[open]");
    fullscreen?.querySelectorAll(".fsm-map-tools, .fsm-map-nav, .fsm-map-search, .fsm-map-search-status").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) reserved.push({ left: r.left - bounds.left, right: r.right - bounds.left, top: r.top - bounds.top, bottom: r.bottom - bounds.top });
    });
    entries.sort((a, b) => {
      const focused = entry => entry.marker.isPopupOpen() ? 0 : entry.el === document.activeElement ? 1 : 2;
      return focused(a) - focused(b) || String(a.marker._fsmSpotId).localeCompare(String(b.marker._fsmSpotId));
    });
    for (const { marker, el } of entries) {
      const label = el.querySelector(".fsm-spot-pin__name");
      if (!label) continue;
      el.classList.remove("fsm-label-visible", "fsm-label-left");
      label.style.maxWidth = "190px";
      el.setAttribute("aria-expanded", String(marker.isPopupOpen()));
      if (map.getZoom() < 13) continue;
      const p = map.latLngToContainerPoint(marker.getLatLng());
      for (const left of [false, true]) {
        // Fit long names to the actual space beside their geographic pin.
        const available = left ? p.x - 34 : size.x - p.x - 34;
        if (available < 86) continue;
        label.style.maxWidth = `${Math.min(190, available)}px`;
        const width = label.offsetWidth, height = label.offsetHeight;
        const x = left ? p.x - 26 - width : p.x + 26;
        const box = {left: x, right: x + width, top: p.y - 14, bottom: p.y - 14 + height};
        if (box.left < 8 || box.right > size.x - 8 || box.top < 8 || box.bottom > size.y - 8 || reserved.some(other => other.marker !== marker && overlap(box, other))) continue;
        el.classList.toggle("fsm-label-left", left);
        el.classList.add("fsm-label-visible");
        reserved.push(box);
        break;
      }
    }
  }
  state.schedule = () => { if (state.frame === null) state.frame = requestAnimationFrame(update); };
  mapStates.set(map, state);
  map.on("moveend zoomend resize popupopen popupclose layeradd layerremove", state.schedule);
  map.on("unload", () => { if (state.frame !== null) cancelAnimationFrame(state.frame); mapStates.delete(map); });
}

export function setSpotLabelMarkers(map, markers) {
  const state = mapStates.get(map);
  if (!state) return;
  state.markers = markers;
  state.schedule();
}

export function scheduleSpotLabels(map) { mapStates.get(map)?.schedule(); }

export function spotPinId(spot) { return getSpotId(spot); }
