// js/ui-extras.js
// Kleine Zusatz-Logik für UI-Buttons (Filter, Nur Karte)

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initFilterToggle();
  initViewToggle();
});

/**
 * Filter ein-/ausblenden
 */
function initFilterToggle() {
  const btn = document.getElementById("btn-toggle-filters");
  if (!btn) return;

  const section = btn.closest(".sidebar-section");
  const labelEl = btn.querySelector("span") || btn;
  const groups = section ? Array.from(section.querySelectorAll(".filter-group")) : [];

  if (!groups.length) return;

  btn.addEventListener("click", () => {
    const willShow = groups[0].classList.contains("fsm-hidden");

    groups.forEach((el) => el.classList.toggle("fsm-hidden", !willShow));
    labelEl.textContent = willShow ? "Filter ausblenden" : "Filter anzeigen";

    // a11y: optional aria-expanded
    btn.setAttribute("aria-expanded", willShow ? "true" : "false");
  });
}

/**
 * Nur Karte / Liste zeigen
 */
function initViewToggle() {
  const btn = document.getElementById("btn-toggle-view");
  const section = document.querySelector(".sidebar-section--grow");
  if (!btn || !section) return;

  const labelEl = btn.querySelector("span") || btn;

  btn.addEventListener("click", () => {
    const isHidden = section.classList.toggle("fsm-hidden");
    labelEl.textContent = isHidden ? "Liste zeigen" : "Nur Karte";

    // a11y: optional aria-pressed
    btn.setAttribute("aria-pressed", isHidden ? "true" : "false");
  });
}