// js/ui/skip-to-spots.js
// Fokus-Sprung zur Spotliste – für Accessibility & Skip-Links

"use strict";

import { qs } from "../utils/dom.js";

/**
 * Initialisiert den Skip-Link zur Spotliste.
 * Optionaler Callback kann z. B. das Menü schließen.
 *
 * @param {Function} onSkipCallback
 */
export function initSkipToSpots(onSkipCallback = () => {}) {
  const btnSkipSpots = qs("#btn-skip-spots");
  if (!btnSkipSpots) return;

  btnSkipSpots.addEventListener("click", () => {
    const target = qs("#spots-title");

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // a11y: Fokus setzen, damit Screenreader landen
      target.setAttribute("tabindex", "-1"); // falls nicht fokussierbar
      target.focus?.({ preventScroll: true });
    }

    onSkipCallback();
  });
}