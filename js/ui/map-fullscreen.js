import { createMapToolbar } from "./map-toolbar.js?v=20261110-nav-unified-compact-1";

// One Leaflet instance, temporarily moved into a modal, viewport-sized map.
// No browser Fullscreen API: this also works in an iPhone browser tab.
const COPY = {
  de: { open: "Vollbild", close: "Schließen", openLabel: "Karte im Vollbild öffnen", closeLabel: "Vollbildkarte schließen", title: "Vollbildkarte" },
  en: { open: "Full screen", close: "Close", openLabel: "Open full-screen map", closeLabel: "Close full-screen map", title: "Full-screen map" },
  da: { open: "Fuld skærm", close: "Luk", openLabel: "Åbn kort i fuld skærm", closeLabel: "Luk kort i fuld skærm", title: "Kort i fuld skærm" }
};

export function initMapFullscreen(map) {
  const element = map.getContainer();
  const dialog = document.createElement("dialog");
  if (typeof dialog.showModal !== "function") return;
  dialog.id = "fsm-map-fullscreen";
  document.body.appendChild(dialog);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "fsm-map-fullscreen-button";
  button.setAttribute("aria-controls", dialog.id);
  button.setAttribute("aria-haspopup", "dialog");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  const path = document.createElementNS(icon.namespaceURI, "path");
  icon.appendChild(path);
  const label = document.createElement("span");
  label.className = "sr-only";
  button.append(icon, label);
  const control = L.control({ position: "topright" });
  control.onAdd = () => {
    const wrapper = L.DomUtil.create("div", "leaflet-control fsm-map-fullscreen-control");
    wrapper.appendChild(button);
    L.DomEvent.disableClickPropagation(wrapper);
    L.DomEvent.disableScrollPropagation(wrapper);
    return wrapper;
  };
  control.addTo(map);

  let placeholder = null;
  let scrollPosition = null;
  let frame = 0;
  let previewOpen = false;
  const toolbar = createMapToolbar({ dialog, leaveMap: restoreMap, onLayout: updateViewport });
  const keyboardPadding = new Map();
  const viewport = window.visualViewport;
  function updateViewport() {
    // A native dialog follows the layout viewport; keep controls above the
    // iPhone keyboard when Safari shrinks/pans only the visual viewport.
    const top = viewport?.offsetTop || 0;
    const bottom = viewport ? Math.max(0, (dialog.clientHeight || window.innerHeight) - viewport.height - top) : 0;
    dialog.style.setProperty("--fsm-viewport-top", `${top}px`);
    dialog.style.setProperty("--fsm-viewport-bottom", `${bottom}px`);
    dialog.classList.toggle("fsm-map-keyboard-open", bottom > 120);
  }
  function padPopup(event) {
    if (!dialog.open) return;
    const popup = event.popup;
    if (!keyboardPadding.has(popup)) keyboardPadding.set(popup, {
      autoPanPaddingTopLeft: popup.options.autoPanPaddingTopLeft,
      autoPanPaddingBottomRight: popup.options.autoPanPaddingBottomRight
    });
    popup.options.autoPanPaddingTopLeft = L.point(12, dialog.classList.contains("fsm-map-search-open") ? 160 : 70);
    popup.options.autoPanPaddingBottomRight = L.point(12, 106);
    popup.update();
  }
  map.on("popupopen", padPopup);
  // Modal autofocus can match :focus-visible after a tap in Safari. Keep the
  // visible ring tied to actual keyboard use, without removing keyboard focus.
  const onKeyboard = event => {
    if (!["Shift", "Control", "Alt", "Meta"].includes(event.key)) button.dataset.keyboardFocus = "true";
  };
  const onPointer = () => { button.dataset.keyboardFocus = "false"; };
  document.addEventListener("keydown", onKeyboard, true);
  document.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
  map.on("popupopen", () => { previewOpen = true; });
  map.on("popupclose", () => { previewOpen = false; });
  function updateLanguage() {
    const text = COPY[document.documentElement.lang] || COPY.de;
    label.textContent = dialog.open ? text.close : text.open;
    button.setAttribute("aria-label", dialog.open ? text.closeLabel : text.openLabel);
    button.title = dialog.open ? text.closeLabel : text.openLabel;
    button.setAttribute("aria-expanded", String(dialog.open));
    dialog.setAttribute("aria-label", text.title);
    path.setAttribute("d", dialog.open
      ? "m6 6 12 12M18 6 6 18"
      : "M9 3H3v6m0-6 6 6m6-6h6v6m0-6-6 6M3 15v6h6m-6 0 6-6m6 6h6v-6m0 6-6-6");
  }
  const languageObserver = new MutationObserver(updateLanguage);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  updateLanguage();

  function resizeMap() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      // Leaflet's non-animated pan compensates for the changed container size,
      // retaining the current geographic center and zoom, including user pans.
      map.invalidateSize({ animate: false, pan: true });
    });
  }
  function restoreMap({ focus = true } = {}) {
    if (!placeholder) return;
    placeholder.replaceWith(element);
    placeholder = null;
    document.documentElement.classList.remove("fsm-map-fullscreen-open");
    if (dialog.open) dialog.close();
    toolbar.close();
    for (const [popup, padding] of keyboardPadding) Object.assign(popup.options, padding);
    keyboardPadding.clear();
    updateLanguage();
    resizeMap();
    if (scrollPosition) window.scrollTo({ ...scrollPosition, behavior: "instant" });
    scrollPosition = null;
    if (focus) button.focus({ preventScroll: true });
  }
  function openMap() {
    if (dialog.open) return;
    map.stop();
    map.closePopup();
    scrollPosition = { left: window.scrollX, top: window.scrollY };
    placeholder = document.createElement("div");
    placeholder.className = "fsm-map-placeholder";
    placeholder.style.height = `${element.getBoundingClientRect().height}px`;
    placeholder.setAttribute("aria-hidden", "true");
    element.replaceWith(placeholder);
    dialog.appendChild(element);
    document.documentElement.classList.add("fsm-map-fullscreen-open");
    dialog.showModal();
    toolbar.open();
    updateViewport();
    updateLanguage();
    resizeMap();
    button.focus({ preventScroll: true });
  }
  button.addEventListener("click", () => dialog.open ? restoreMap() : openMap());
  dialog.addEventListener("keydown", event => {
    // Background app shortcuts must not close an already open detail panel.
    if (event.key === "Escape") event.stopPropagation();
    if (event.key === "Tab") {
      const targets = [...dialog.querySelectorAll("button, a[href], input, select, textarea, summary, [tabindex]")]
        .filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length && getComputedStyle(node).visibility !== "hidden");
      const current = targets.indexOf(document.activeElement);
      const next = current < 0 ? (event.shiftKey ? targets.length - 1 : 0)
        : (current + (event.shiftKey ? -1 : 1) + targets.length) % targets.length;
      event.preventDefault();
      (targets[next] || button).focus({ preventScroll: true });
    }
  });
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    // Escape first closes an open preview; a second Escape leaves the map.
    if (toolbar.escapeSearch()) return;
    if (previewOpen) map.closePopup();
    else restoreMap();
  });
  dialog.addEventListener("close", () => {
    // The close event is queued: an immediate reopen must not be undone by it.
    if (!dialog.open) restoreMap();
  });
  // Do not move the map out of the native dialog during the capture phase of
  // the spot button's click: on iOS this may abort the button's own listener.
  // The app announces an actual detail transition, not just a pointer click.
  const onBeforeSpotDetails = () => { if (dialog.open) restoreMap({focus:false}); };
  document.addEventListener("fsm:before-spot-details", onBeforeSpotDetails);
  window.addEventListener("resize", resizeMap);
  window.visualViewport?.addEventListener("resize", updateViewport);
  window.visualViewport?.addEventListener("scroll", updateViewport);
  const onRouteChange = () => { if (dialog.open) restoreMap({ focus: false }); };
  window.addEventListener("hashchange", onRouteChange);
  map.on("unload", () => {
    restoreMap({ focus: false });
    cancelAnimationFrame(frame);
    languageObserver.disconnect();
    document.removeEventListener("keydown", onKeyboard, true);
    document.removeEventListener("pointerdown", onPointer, true);
    window.removeEventListener("resize", resizeMap);
    window.visualViewport?.removeEventListener("resize", updateViewport);
    window.visualViewport?.removeEventListener("scroll", updateViewport);
    window.removeEventListener("hashchange", onRouteChange);
    map.off("popupopen", padPopup);
    document.removeEventListener("fsm:before-spot-details", onBeforeSpotDetails);
    toolbar.destroy();
    dialog.remove();
  });
}
