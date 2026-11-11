// Fullscreen controls share the application's filter state through small events.
// No second map, copied spot dataset or independent filter engine.
import { shortcutIsSelected, shortcutLabel } from "../filter-model.js";
import { createHeartIcon, createCrownIcon } from "../utils/dom.js";
import { NAV_ORDER, navCopy } from "./navigation-spec.js";

const COPY = {
  de: { top: "Kartenwerkzeuge", categories: "Themen wählen", nav: "Hauptnavigation", search: "Spots suchen", placeholder: "Ort oder Spot suchen …", clear: "Suche leeren", closeSearch: "Suche schließen", menu: "Menü", all: "Alle", allTitle: "Alle Themen – andere Filter bleiben erhalten", map: "Karte", filters: "Filter", spots: "Spots", plus: "Spots Plus", diary: "Mein Tag", play: "Spiel & Bewegung", nature: "Natur", water: "Wasser", animals: "Tiere", results: n => `${n} Treffer`, loading: "Spots werden geladen …", error: "Spots konnten nicht geladen werden" },
  en: { top: "Map tools", categories: "Choose themes", nav: "Main navigation", search: "Search spots", placeholder: "Search for a place or spot …", clear: "Clear search", closeSearch: "Close search", menu: "Menu", all: "All", allTitle: "All themes – other filters stay active", map: "Map", filters: "Filters", spots: "Spots", plus: "Spots Plus", diary: "My day", play: "Play & movement", nature: "Nature", water: "Water", animals: "Animals", results: n => `${n} ${n === 1 ? "result" : "results"}`, loading: "Loading spots …", error: "Could not load spots" },
  da: { top: "Kortværktøjer", categories: "Vælg temaer", nav: "Hovednavigation", search: "Søg efter spots", placeholder: "Søg efter et sted eller spot …", clear: "Ryd søgning", closeSearch: "Luk søgning", menu: "Menu", all: "Alle", allTitle: "Alle temaer – andre filtre bevares", map: "Kort", filters: "Filtre", spots: "Spots", plus: "Spots Plus", diary: "Min dag", play: "Leg & bevægelse", nature: "Natur", water: "Vand", animals: "Dyr", results: n => `${n} resultater`, loading: "Indlæser spots …", error: "Spots kunne ikke indlæses" }
};
const PATHS = {
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M18 6 6 18",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
  check: "m5 12 4 4L19 6",
  map: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5m6-2v16m6-14v16",
  filters: "M3 4h18l-7 8v8l-4-2v-6Z",
  spots: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  play: "M5 21V3h14v18M3 3h18M7 7l5 7 5-7M8 16h8",
  nature: "M20 3C8 2 2 7 5 15s14 4 15-12ZM5 20 16 8",
  water: "M2 6q3-4 6 0t6 0 6 0M2 12q3-4 6 0t6 0 6 0M2 18q3-4 6 0t6 0 6 0",
  animals: "M7 15c-2 4 1 6 5 4 4 2 7 0 5-4l-3-3h-4ZM5 7v3M10 4v3M15 4v3M20 7v3",
  adventure: "m4 20 8-16 8 16ZM8 20l4-8 4 8",
  culture: "M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1ZM12 5v15",
  pause: "M4 3v7q0 3 3 3t3-3V3M7 3v18M18 21V3q-4 3-3 10h3",
  travel: "M2 20 12 4l10 16ZM8 20l4-7 4 7",
  services: "M12 3v18M3 12h18",
  events: "M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16",
  community: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
};
export function createMapToolIcon(name) {
  if (name === "filters") {
    const ns = "http://www.w3.org/2000/svg";
    const icon = document.createElementNS(ns, "svg");
    for (const [key, value] of Object.entries({viewBox:"0 0 24 24",width:"20",height:"20",fill:"none",stroke:"currentColor","stroke-width":"1.7","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"})) icon.setAttribute(key,value);
    const lines=document.createElementNS(ns,"path");lines.setAttribute("d","M3 5h18M3 12h18M3 19h18");icon.append(lines);
    for (const [cx,cy] of [[9,5],[16,12],[10,19]]) {
      const knob=document.createElementNS(ns,"circle");
      knob.setAttribute("cx",cx);knob.setAttribute("cy",cy);knob.setAttribute("r","2.5");
      knob.setAttribute("fill","var(--fsm-slider-knob-fill,#fffaf1)");icon.append(knob);
    }
    return icon;
  }
  if (name === "diary") return createHeartIcon("fsm-daylog-heart");
  if (name === "plus") return createCrownIcon();
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", width: "20", height: "20", fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" })) svg.setAttribute(key, value);
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", PATHS[name] || PATHS.map);
  svg.append(path);
  return svg;
}
export function createMapToolbar({ dialog, leaveMap, onLayout }) {
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const text = () => COPY[document.documentElement.lang] || COPY.de;
  const request = (action, value) => document.dispatchEvent(new CustomEvent("fsm:fullscreen-action", { detail: { action, value } }));
  let state = { world: "", types: [], search: "", total: 0, status: "loading", worlds: [], plus: true, diary: true };
  let signature = "";
  const bindings = [];
  function button(name, action, className = "") {
    const el = document.createElement("button");
    el.type = "button";
    el.className = `fsm-map-tool ${className}`;
    el.append(createMapToolIcon(name));
    const label = document.createElement("span");
    label.className = "fsm-map-tool__label";
    el.append(label);
    bindings.push({ el, label, name });
    el.addEventListener("click", action, options);
    return el;
  }
  function navigate(action) {
    // Close the native map dialog before the app opens its own menu/filter modal.
    leaveMap({ focus: true });
    request(action);
  }
  const top = document.createElement("nav");
  top.className = "fsm-map-tools";
  const searchButton = button("search", () => setSearch(searchRow.hidden), "fsm-map-tool--round");
  searchButton.setAttribute("aria-expanded", "false");
  searchButton.setAttribute("aria-controls", "fsm-map-search-row");
  const categories = document.createElement("div");
  categories.className = "fsm-map-themes";
  categories.setAttribute("role", "group");
  function updateThemeEdges() {
    const start = Math.max(0, categories.scrollLeft);
    categories.toggleAttribute("data-more-left", start > 1);
    categories.toggleAttribute("data-more-right", start + categories.clientWidth < categories.scrollWidth - 1);
  }
  categories.addEventListener("scroll", updateThemeEdges, { ...options, passive: true });
  function revealTheme(theme) {
    if (!(theme instanceof Element) || !categories.contains(theme)) return;
    const region = categories.getBoundingClientRect();
    const item = theme.getBoundingClientRect();
    const inset = 10;
    if (item.left < region.left + inset) {
      categories.scrollLeft -= region.left + inset - item.left;
    } else if (item.right > region.right - inset) {
      categories.scrollLeft += item.right - region.right + inset;
    }
    updateThemeEdges();
  }
  // Real keyboard focus and pointer selection keep the entire label in view.
  categories.addEventListener("focusin", event => revealTheme(event.target.closest(".fsm-map-tool--theme")), options);
  categories.addEventListener("click", event => revealTheme(event.target.closest(".fsm-map-tool--theme")), options);
  const themeResize = new ResizeObserver(updateThemeEdges);
  themeResize.observe(categories);
  const menu = button("menu", () => navigate("menu"), "fsm-map-tool--round");
  top.append(searchButton, categories, menu);
  const searchRow = document.createElement("form");
  searchRow.className = "fsm-map-search";
  searchRow.id = "fsm-map-search-row";
  searchRow.hidden = true;
  searchRow.setAttribute("role", "search");
  const input = document.createElement("input");
  input.type = "search";
  input.id = "fsm-map-search";
  input.autocomplete = "off";
  input.enterKeyHint = "search";
  input.maxLength = 240;
  const clear = button("close", () => { input.value = ""; request("search", ""); input.focus({ preventScroll: true }); }, "fsm-map-tool--clear");
  const closeSearch = button("closeSearch", () => setSearch(false), "fsm-map-tool--round");
  closeSearch.firstChild.replaceWith(createMapToolIcon("close"));
  searchRow.append(input, clear, closeSearch);
  searchRow.addEventListener("submit", event => { event.preventDefault(); request("search", input.value); input.blur(); }, options);
  input.addEventListener("input", () => { clear.hidden = !input.value; request("search", input.value); }, options);
  const status = document.createElement("p");
  status.className = "fsm-map-search-status";
  status.setAttribute("role", "status");
  status.hidden = true;
  const nav = document.createElement("nav");
  nav.className = "fsm-map-nav";
  const destinations = new Map();
  for (const name of NAV_ORDER) {
    const el = button(name, () => { if (name !== "map") navigate(name); }, "fsm-map-tool--destination");
    el.dataset.nav = name;
    el.firstElementChild?.classList.add("fsm-nav-icon");
    if (name === "map") el.setAttribute("aria-current", "page");
    destinations.set(name, el);
    nav.append(el);
  }
  dialog.append(top, searchRow, status, nav);
  for (const region of [top, searchRow, nav]) {
    region.addEventListener("wheel", event => event.stopPropagation(), { ...options, passive: true });
    region.addEventListener("dblclick", event => event.stopPropagation(), options);
  }
  function setSearch(open, focus = true) {
    searchRow.hidden = !open;
    status.hidden = !open;
    dialog.classList.toggle("fsm-map-search-open", open);
    searchButton.setAttribute("aria-expanded", String(open));
    if (open && focus) input.focus({ preventScroll: true });
    if (!open && focus) searchButton.focus({ preventScroll: true });
    onLayout();
  }
  function paint() {
    const copy = text();
    top.setAttribute("aria-label", copy.top);
    nav.setAttribute("aria-label", copy.nav);
    categories.setAttribute("aria-label", copy.categories);
    searchRow.setAttribute("aria-label", copy.search);
    input.setAttribute("aria-label", copy.search);
    input.placeholder = copy.placeholder;
    for (const binding of bindings) {
      const label = binding.el === clear ? copy.clear : (NAV_ORDER.includes(binding.name) ? navCopy(document.documentElement.lang)[binding.name] : copy[binding.name]);
      binding.label.textContent = label;
      binding.el.setAttribute("aria-label", label);
      binding.el.title = label;
    }
    searchButton.classList.toggle("fsm-map-tool--has-query", !!state.search);
    if (document.activeElement !== input) input.value = state.search;
    clear.hidden = !input.value;
    destinations.get("plus").hidden = !state.plus;
    destinations.get("diary").hidden = !state.diary;
    const countText = state.status === "loading" || state.status === "idle" ? copy.loading : state.status === "error" ? copy.error : copy.results(state.total);
    if (status.textContent !== countText) status.textContent = countText;
    destinations.get("spots").setAttribute("aria-label", `${copy.spots}: ${countText}`);
    // Water is a union spanning play and water worlds, shared with quick choice.
    // Do not mark All when specific place types remain selected without a world.
    const waterLabel = shortcutLabel("water", document.documentElement.lang);
    const nextSignature = JSON.stringify([document.documentElement.lang, state.worlds]);
    if (signature !== nextSignature) {
      signature = nextSignature;
      const focusedId = categories.contains(document.activeElement) ? document.activeElement.dataset.world : null;
      const scroll = categories.scrollLeft;
      const order = ["", "play", "nature", "water", "animals"];
      // Defensive guard: one visible chip per theme ID, even if a future
      // producer accidentally includes extra rows with duplicate data-world.
      const unique = new Map();
      for (const world of state.worlds) {
        if (typeof world.id !== "string" || unique.has(world.id)) continue;
        unique.set(world.id, world.id === "water"
          ? { ...world, hidden: false, disabled: false, label: waterLabel, accessible: waterLabel }
          : world);
      }
      const worlds = [...unique.values()].sort((a, b) => (order.includes(a.id) ? order.indexOf(a.id) : 100) - (order.includes(b.id) ? order.indexOf(b.id) : 100));
      categories.replaceChildren();
      for (const world of worlds) {
        if (world.hidden) continue;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "fsm-map-tool fsm-map-tool--theme";
        b.dataset.world = world.id;
        b.disabled = world.disabled;
        b.title = world.id ? world.label : copy.allTitle;
        b.setAttribute("aria-label", world.accessible || b.title);
        b.append(createMapToolIcon(world.id || "map"));
        const span = document.createElement("span");
        span.textContent = world.id === "water" ? waterLabel : world.id ? copy[world.id] || world.label : copy.all;
        b.append(span);
        if (world.id) {
          const check = createMapToolIcon("check");
          check.classList.add("fsm-map-theme-check");
          b.append(check);
        }
        // Nodes are replaced as the catalogue/counts change; do not keep abort
        // listeners referencing discarded nodes for the lifetime of the map.
        b.addEventListener("click", () => world.id === "water" ? request("shortcut", "water") : request("world", world.id));
        categories.append(b);
      }
      categories.scrollLeft = scroll;
      if (focusedId !== null) {
        const target = [...categories.children].find(el => el.dataset.world === focusedId && !el.disabled);
        (target || categories.firstElementChild)?.focus({ preventScroll: true });
        revealTheme(target || categories.firstElementChild);
      }
    }
    for (const b of categories.children) {
      const id = b.dataset.world;
      // The water chip represents either the selected water world or the
      // equivalent quick-choice water-and-sand combination.
      const selected = id === "water" ? (state.world === "water" || shortcutIsSelected(state, "water"))
        : id === "" ? !state.world && !(state.types || []).length : id === state.world;
      b.setAttribute("aria-pressed", String(selected));
    }
    updateThemeEdges();
  }
  document.addEventListener("fsm:fullscreen-state", event => { state = event.detail; paint(); }, options);
  const observer = new MutationObserver(paint);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  paint();
  return {
    open() { request("sync"); setSearch(!!state.search, false); paint(); },
    close() { setSearch(false, false); },
    escapeSearch() { if (searchRow.hidden) return false; setSearch(false); return true; },
    destroy() { abort.abort(); observer.disconnect(); themeResize.disconnect(); top.remove(); searchRow.remove(); status.remove(); nav.remove(); }
  };
}
