// Eine Symbolquelle für Startseite, Tourenwelt und Kalender.
// Die Vollbildkarte nutzt denselben createMapToolIcon direkt.
import { createMapToolIcon } from "./map-toolbar.js";
import { NAV_ORDER } from "./navigation-spec.js";
export function createNavigationIcon(name, { calendar = false } = {}) {
  if (!NAV_ORDER.includes(name)) throw new TypeError(`Unknown navigation destination: ${name}`);
  const icon = createMapToolIcon(name);
  icon.classList.add("fsm-nav-icon");
  if (calendar) icon.classList.add("fse-svg");
  return icon;
}
export function navigationIconHtml(name, options) {
  return createNavigationIcon(name, options).outerHTML;
}
