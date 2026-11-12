// js/utils/dom.js
// -----------------------------------------
// Mini-Utils für DOM-Zugriff
// -----------------------------------------

/**
 * Kurzform für querySelector.
 * @param {string} sel - CSS-Selektor
 * @param {ParentNode} [root=document]
 * @returns {Element|null}
 */
export function qs(sel, root = document) {
  return root.querySelector(sel);
}

/**
 * Kurzform für querySelectorAll als Array.
 * @param {string} sel - CSS-Selektor
 * @param {ParentNode} [root=document]
 * @returns {Element[]}
 */
export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

/** Shared decorative heart, matching the favourite and memory icons. */
export function createHeartIcon(className = "fsm-inline-heart", ownerDocument = document) {
  const svg = ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add(className);
  const path = ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z");
  svg.appendChild(path);
  return svg;
}

/** Render translated text safely, replacing heart markers with our own SVG. */
export function setTextWithHearts(element, text) {
  if (!element) return;
  const ownerDocument = element.ownerDocument;
  const parts = String(text ?? "").split(/\{heart\}|\u{1f49a}/u);
  const fragment = ownerDocument.createDocumentFragment();
  parts.forEach((part, index) => {
    if (index) fragment.appendChild(createHeartIcon("fsm-inline-heart", ownerDocument));
    fragment.appendChild(ownerDocument.createTextNode(part));
  });
  element.replaceChildren(fragment);
}

/** Decorative Plus crown, matching the established Spots Plus heading. */
export function createCrownIcon(ownerDocument = document) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = ownerDocument.createElementNS(ns, "svg");
  for (const [name, value] of Object.entries({class: "spots-plus-crown", viewBox: "0 0 32 26", width: "22", height: "20", "aria-hidden": "true", focusable: "false"})) svg.setAttribute(name, value);
  const group = ownerDocument.createElementNS(ns, "g");
  group.setAttribute("fill", "currentColor");
  for (const [tag, attrs] of [
    ["path", {d: "M4 8.5l5 5 1-6 4 5 2-8 2 8 4-5 1 6 5-5-3 13H7z"}],
    ["circle", {cx: 4, cy: 7, r: 2}], ["circle", {cx: 10, cy: 6, r: 1.6}],
    ["circle", {cx: 16, cy: 3, r: 2}], ["circle", {cx: 22, cy: 6, r: 1.6}],
    ["circle", {cx: 28, cy: 7, r: 2}], ["rect", {x: 7, y: 23, width: 18, height: 2, rx: .7}]
  ]) {
    const element = ownerDocument.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value));
    group.appendChild(element);
  }
  svg.appendChild(group);
  return svg;
}

/** Decorative bicycle for labelled tour controls and headings. */
export function bicycleIconHtml({ size = 24, bikepacking = false } = {}) {
  const bag = bikepacking ? '<rect x="2.8" y="6.8" width="4.3" height="3" rx=".6"/><path d="M7.1 9.8h2.2"/>' : "";
  return `<svg class="fsm-bike-icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.3" cy="16.6" r="3.8"/><circle cx="18.7" cy="16.6" r="3.8"/><path d="M5.3 16.6 9.5 9.3l3.7 7.3H5.3m7.9 0 3-7H9.7m9 7-3-10h2.8l1 1.4M8.1 7.7h3.3"/>${bag}</svg>`;
}
