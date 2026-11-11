// js/features/plus-ui.js
// ---------------------------------------------
// Family Spots Plus – UI + Status-Handling
// ---------------------------------------------

"use strict";

import { FEATURES, LANG_DE, LANG_EN, LANG_DA } from "../config.js";
import { getPlusStatus, formatPlusStatus, redeemPartnerCode } from "./plus.js?v=20261010-unified-4";

let sectionEl = null;
let toggleBtnEl = null;
let codeInputEl = null;
let codeSubmitEl = null;
let statusTextEl = null;

let currentLang = LANG_DE;
let plusActive = false;

let showToastFn = null;
let tillaInstance = null;
let markHintSeenFn = null;
let onPlusStateChangedFn = null;

/**
 * Hilfsfunktion: Keyboard-Activation (Enter/Space) auf Buttons.
 * @param {(event: KeyboardEvent) => void} handler
 * @returns {(event: KeyboardEvent) => void}
 */
function activateOnEnterSpace(handler) {
  return (event) => {
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      handler(event);
    }
  };
}

/**
 * Sprachabhängige Labels für den Toggle-Button (Anzeigen/Ausblenden).
 * @param {string} lang
 * @returns {{show: string, hide: string}}
 */
function getToggleLabels(lang) {
  switch (lang) {
    case LANG_EN:
      return { show: "Show", hide: "Hide" };
    case LANG_DA:
      return { show: "Vis", hide: "Skjul" };
    case LANG_DE:
    default:
      return { show: "Anzeigen", hide: "Ausblenden" };
  }
}

/**
 * Text des Toggle-Buttons aktualisieren (inkl. aria-expanded).
 */
function updateToggleLabel() {
  if (!toggleBtnEl || !sectionEl) return;

  const target = toggleBtnEl.querySelector("span") || toggleBtnEl;
  const isOpen = !!sectionEl.open;

  const { show, hide } = getToggleLabels(currentLang);
  target.textContent = isOpen ? hide : show;

  toggleBtnEl.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

/**
 * Plus-Status-Text anhand gespeicherten Status oder übergebenem Status aktualisieren.
 * @param {ReturnType<typeof getPlusStatus>} [status]
 */
function updatePlusStatusText(status) {
  if (!statusTextEl) return;

  if (!FEATURES.plus) {
    statusTextEl.textContent = "";
    return;
  }

  const s = status || getPlusStatus();
  statusTextEl.textContent = formatPlusStatus(s);
}

/**
 * Plus-Status aus Storage laden und internen State aktualisieren.
 * Triggert onPlusStateChanged, falls gesetzt.
 */
function loadPlusStateFromStorage() {
  if (!FEATURES.plus) {
    plusActive = false;
    updatePlusStatusText({ active: false, plan: null, validUntil: null });
    return;
  }

  try {
    const status = getPlusStatus();
    plusActive = !!status.active;
    updatePlusStatusText(status);
  } catch (err) {
    console.warn("[Family Spots] Konnte Plus-Status nicht laden:", err);
    plusActive = false;
    updatePlusStatusText({ active: false, plan: null, validUntil: null });
  }

  if (typeof onPlusStateChangedFn === "function") {
    onPlusStateChangedFn(plusActive);
  }
}

/**
 * Einlösen eines Partnercodes (Plus).
 * Nutzt redeemPartnerCode und zeigt passende Toasts.
 */
async function handlePlusCodeSubmit() {
  if (!FEATURES.plus) return;
  if (!codeInputEl || !statusTextEl) return;

  const raw = codeInputEl.value.trim();
  const result = await redeemPartnerCode(raw);

  if (!result.ok) {
    if (typeof showToastFn === "function") {
      if (result.reason === "empty") {
        showToastFn("plus_code_empty");
      } else if (result.reason === "invalid_days") {
        showToastFn("plus_code_unknown");
      } else {
        showToastFn("plus_code_unknown");
      }
    }
    return;
  }

  const status = result.status || getPlusStatus();
  plusActive = !!status.active;
  updatePlusStatusText(status);

  if (typeof showToastFn === "function") {
    showToastFn("plus_code_activated");
  }

  if (tillaInstance && typeof tillaInstance.onPlusActivated === "function") {
    tillaInstance.onPlusActivated();
  }

  if (typeof onPlusStateChangedFn === "function") {
    onPlusStateChangedFn(plusActive);
  }
}

/**
 * Sprache für die Plus-UI aktualisieren (DE/EN/DA).
 * Wird typischerweise von außen aufgerufen, wenn der globale Language-Switcher wechselt.
 *
 * @param {string} lang
 */
export function updatePlusLanguage(lang) {
  if (lang === LANG_EN) {
    currentLang = LANG_EN;
  } else if (lang === LANG_DA) {
    currentLang = LANG_DA;
  } else {
    currentLang = LANG_DE;
  }

  updatePlusStatusText();
  updateToggleLabel();
}

/**
 * Liefert, ob Plus aktuell aktiv ist (laut lokalem Status).
 * @returns {boolean}
 */
export function isPlusActive() {
  return !!plusActive;
}

/**
 * Initialisiert die Plus-UI (Bereich, Toggle, Code-Feld, Status-Text).
 *
 * @param {Object} [options]
 * @param {HTMLElement} [options.section] - <details>-Element für Plus-Bereich.
 * @param {HTMLButtonElement} [options.toggleButton] - Button zum Öffnen/Schließen des Plus-Abschnitts.
 * @param {HTMLInputElement} [options.codeInput] - Eingabefeld für Partnercode.
 * @param {HTMLButtonElement} [options.codeSubmit] - Button zum Einlösen des Codes.
 * @param {HTMLElement} [options.statusText] - Element für Statusanzeige.
 * @param {(msg: string) => void} [options.showToast] - Toast-Funktion.
 * @param {any} [options.tilla] - Tilla-Instanz (optional, für onPlusActivated).
 * @param {() => void} [options.markHintSeen] - Callback, um Onboarding-Hints als "gesehen" zu markieren.
 * @param {(active: boolean) => void} [options.onPlusStateChanged] - Callback, wenn sich Plus-Status ändert.
 * @param {string} [options.initialLang] - Initiale Sprache (z. B. LANG_DE / LANG_EN / LANG_DA).
 */
export function initPlusUI({
  section,
  toggleButton,
  codeInput,
  codeSubmit,
  statusText,
  showToast,
  tilla,
  markHintSeen,
  onPlusStateChanged,
  initialLang
} = {}) {
  if (!FEATURES.plus) return;

  sectionEl = section || null;
  toggleBtnEl = toggleButton || null;
  codeInputEl = codeInput || null;
  codeSubmitEl = codeSubmit || null;
  statusTextEl = statusText || null;

  showToastFn = showToast || null;
  tillaInstance = tilla || null;
  markHintSeenFn = markHintSeen || null;
  onPlusStateChangedFn = onPlusStateChanged || null;

  currentLang = initialLang || LANG_DE;

  // Accordion / Toggle
  if (sectionEl && toggleBtnEl) {
    sectionEl.id = sectionEl.id || "plus-section";
    toggleBtnEl.setAttribute("aria-controls", sectionEl.id);
    toggleBtnEl.setAttribute(
      "aria-expanded",
      sectionEl.open ? "true" : "false"
    );

    const toggleHandler = (event) => {
      event.preventDefault();
      const isOpen = !sectionEl.open;
      sectionEl.open = isOpen;
      updateToggleLabel();

      if (isOpen && typeof markHintSeenFn === "function") {
        // Hint nur dann als "gesehen" markieren, wenn der Bereich geöffnet wird
        markHintSeenFn();
      }
    };

    toggleBtnEl.addEventListener("click", toggleHandler);
    toggleBtnEl.addEventListener("keydown", activateOnEnterSpace(toggleHandler));

    sectionEl.addEventListener("toggle", () => {
      updateToggleLabel();
    });
  }

  // Code-Submit
  if (codeSubmitEl) {
    codeSubmitEl.addEventListener("click", () => {
      handlePlusCodeSubmit();
    });
  }

  // Initiale Sprache anwenden + Status laden
  updatePlusLanguage(currentLang);
  loadPlusStateFromStorage();
}