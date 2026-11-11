// Family Spots Map V84 – a single home navigation, sharing existing controls.
// The actual filter/spot sections are moved, never copied or reimplemented.
import { createMapToolIcon } from "./map-toolbar.js";
import { createNavigationIcon } from "./navigation-icons.js";
import { NAV_ORDER, navCopy } from "./navigation-spec.js";

const COPY = {
  de: {nav:"Hauptnavigation",map:"Karte",filters:"Filter",spots:"Spots",plus:"Spots Plus",diary:"Mein Tag",close:"Schließen",sheetFilter:"Filter einstellen",sheetSpots:"Spots ansehen"},
  en: {nav:"Main navigation",map:"Map",filters:"Filters",spots:"Spots",plus:"Spots Plus",diary:"My day",close:"Close",sheetFilter:"Adjust filters",sheetSpots:"View spots"},
  da: {nav:"Hovednavigation",map:"Kort",filters:"Filtre",spots:"Spots",plus:"Spots Plus",diary:"Min dag",close:"Luk",sheetFilter:"Tilpas filtre",sheetSpots:"Vis spots"}
};

export function createHomeNavigation({ plusEnabled = true, diaryEnabled = true } = {}) {
  const mapView = document.getElementById("view-map");
  const filter = document.getElementById("filter-section");
  const spots = document.getElementById("btn-toggle-spots")?.closest(".sidebar-section");
  const plus = document.getElementById("plus-section");
  if (!mapView || !filter || !spots || (plusEnabled && !plus) || typeof HTMLDialogElement === "undefined") return null;

  const text = () => COPY[document.documentElement.lang] || COPY.de;
  const nav = document.createElement("nav");
  nav.id = "fsm-home-nav";
  nav.className = "fsm-home-nav";
  const buttons = new Map();
  let activeSection = "";
  let returnFocus = null;
  const sheet = document.createElement("dialog");
  sheet.id = "fsm-home-sheet";
  sheet.className = "fsm-home-sheet";
  const head = document.createElement("header");
  head.className = "fsm-home-sheet__head";
  const title = document.createElement("h2");
  title.className = "fsm-home-sheet__title";
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "fsm-home-sheet__close";
  closeButton.append(createMapToolIcon("close"));
  const content = document.createElement("div");
  content.className = "fsm-home-sheet__content";
  head.append(title, closeButton);
  sheet.append(head, content);
  const placeholder = document.createComment("Original filter or spots position");
  const sources = { filters: filter, spots, ...(plusEnabled ? { plus } : {}) };
  let previousParent = null;
  let nextSibling = null;

  for (const name of NAV_ORDER) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fsm-home-nav__item";
    button.dataset.fsmHomeAction = name;
    button.dataset.nav = name;
    button.append(createNavigationIcon(name));
    const label = document.createElement("span");
    label.className = "fsm-home-nav__label";
    button.append(label);
    button.addEventListener("click", () => navigate(name));
    if (name === "plus" && !plusEnabled || name === "diary" && !diaryEnabled) button.hidden = true;
    nav.append(button);
    buttons.set(name, {button, label});
  }
  const paint = () => {
    const copy = text();
    const navigation = navCopy(document.documentElement.lang);
    nav.setAttribute("aria-label", navigation.nav);
    Object.entries(sources).forEach(([key, el]) => { if (el) el.dataset.fsmSection = key; });
    for (const [name, item] of buttons) { item.label.textContent = navigation[name]; item.button.setAttribute("aria-label", navigation[name]); }
    closeButton.setAttribute("aria-label", copy.close);
    title.textContent = activeSection === "filters" ? copy.sheetFilter : activeSection === "spots" ? copy.sheetSpots : copy.plus;
  };
  const languageObserver = new MutationObserver(paint);
  languageObserver.observe(document.documentElement, {attributes: true, attributeFilter:["lang"]});

  function closePanel({focus = true} = {}) {
    if (!activeSection) return;
    const before = returnFocus;
    if (sheet.open) sheet.close();
    // In V89 the real navigation stays visible inside the native dialog.
    // Return the same DOM node and its event listeners when closing.
    if (nav.parentNode === sheet) document.body.append(nav);
    if (content.firstElementChild) {
      const el = content.firstElementChild;
      if (placeholder.parentNode) placeholder.replaceWith(el);
      else previousParent?.insertBefore(el, nextSibling);
    }
    activeSection = "";
    document.documentElement.classList.remove("fsm-home-sheet-open");
    sheet.removeAttribute("aria-labelledby");
    sheet.removeAttribute("aria-label");
    if (focus) before?.focus({preventScroll:true});
    returnFocus = null;
    markMap();
  }
  function openPanel(name) {
    const source = sources[name];
    if (!source) return;
    if (activeSection === name) return;
    if (activeSection) closePanel({focus:false});
    previousParent = source.parentNode;
    nextSibling = source.nextSibling;
    previousParent.insertBefore(placeholder, source);
    content.replaceChildren(source);
    activeSection = name;
    returnFocus = buttons.get(name)?.button || document.activeElement;
    title.id = "fsm-home-sheet-title";
    sheet.setAttribute("aria-labelledby", title.id);
    document.documentElement.classList.add("fsm-home-sheet-open");
    paint();
    // Keep actual interactive bottom navigation visible in the top layer.
    sheet.append(nav);
    sheet.showModal();
    for (const [section, item] of buttons) {
      if (section === name) item.button.setAttribute("aria-current", "page");
      else item.button.removeAttribute("aria-current");
    }
    // Existing controls are the sole source of truth for expanded state.
    if (name === "plus") {
      // Reuse the original <details>, status output and partner-code input.
      // Do not synthesize a second Plus implementation or trigger navigation.
      source.open = true;
    } else {
      const toggle = document.getElementById(name === "filters" ? "btn-toggle-filters" : "btn-toggle-spots");
      if (toggle?.getAttribute("aria-expanded") !== "true") toggle.click();
    }
    closeButton.focus({preventScroll:true});
  }
  function markMap() {
    for (const [name, item] of buttons) {
      if (name === "map") item.button.setAttribute("aria-current", "page");
      else item.button.removeAttribute("aria-current");
    }
  }
  function navigate(name) {
    if (name === "filters" || name === "spots" || name === "plus") { openPanel(name); return; }
    closePanel({focus:false});
    if (name === "map") {
      document.getElementById("map")?.scrollIntoView({block:"start", behavior:"smooth"});
    } else {
      document.dispatchEvent(new CustomEvent("fsm:fullscreen-action", {detail:{action:name}}));
    }
  }
  // Keep the selected visual tab in sync with the existing router.
  new MutationObserver(() => {
    const inDiary = document.body.dataset.appView === "diary";
    for (const [name, item] of buttons) {
      if (name === (inDiary ? "diary" : "map")) item.button.setAttribute("aria-current", "page");
      else item.button.removeAttribute("aria-current");
    }
  }).observe(document.body,{attributes:true,attributeFilter:["data-app-view"]});
  closeButton.addEventListener("click", () => closePanel());
  sheet.addEventListener("cancel", event => { event.preventDefault(); closePanel(); });
  sheet.addEventListener("click", event => { if (event.target === sheet) closePanel(); });
  // Keep the existing "show/hide spots" affordance functional inside the sheet.
  spots.querySelector("#btn-toggle-spots")?.addEventListener("click", () => {
    if (activeSection === "spots") queueMicrotask(() => {
      if (activeSection === "spots" && spots.querySelector("#btn-toggle-spots")?.getAttribute("aria-expanded") === "false") closePanel();
    });
  });
  // The advanced filter dialog must be opened AFTER leaving the native top layer.
  filter.querySelector("#btn-open-filter-modal")?.addEventListener("click", () => {
    if (activeSection === "filters") closePanel({focus:false});
  }, {capture:true});
  // Opening a result navigates to the original detail view, never a duplicate.
  spots.addEventListener("click", event => {
    if (!event.target.closest(".spot-card-open, .favorites-back")) return;
    if (activeSection === "spots") requestAnimationFrame(() => closePanel({focus:false}));
  }, true);
  // "Details ansehen" also exists inside the original Spot cards. When that
  // card has been moved into the native Spots sheet, dismiss it synchronously
  // before the shared #spot-detail (outside the dialog) becomes visible.
  document.addEventListener("fsm:before-spot-details", () => closePanel({focus:false}));
  window.addEventListener("popstate", () => closePanel({focus:false}));
  document.body.append(nav, sheet);
  document.documentElement.classList.add("fsm-home-nav-ready");
  paint();
  markMap();
  return {openPanel, closePanel, getButton: name => buttons.get(name)?.button || null};
}
