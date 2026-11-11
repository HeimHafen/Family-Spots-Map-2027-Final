// js/features/daylog.js
// ---------------------------------------------
// Mein-Tag / Daylog – UI + Persistence
// ---------------------------------------------

"use strict";

import { DAYLOG_STORAGE_KEY, FEATURES, LANG_DE, LANG_EN } from "../config.js";

let sectionEl = null;
let toggleBtnEl = null;
let textareaEl = null;
let saveBtnEl = null;

let currentLang = LANG_DE;
let showToastFn = null;
let onDaylogSavedFn = null;
let markHintSeenFn = null;

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

function updateToggleLabel() {
  if (!toggleBtnEl || !sectionEl) return;

  const target = toggleBtnEl.querySelector("span") || toggleBtnEl;
  const isOpen = !!sectionEl.open;
  const isDe = currentLang === LANG_DE;

  const showLabel = isDe ? "Anzeigen" : "Show";
  const hideLabel = isDe ? "Ausblenden" : "Hide";

  target.textContent = isOpen ? hideLabel : showLabel;
  toggleBtnEl.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function loadDaylogFromStorage() {
  if (!FEATURES.daylog) return;
  if (!textareaEl) return;

  try {
    const stored = localStorage.getItem(DAYLOG_STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed.text === "string") {
      textareaEl.value = parsed.text;
    }
  } catch (err) {
    console.warn("[Family Spots] Konnte Mein-Tag nicht laden:", err);
  }
}

function handleDaylogSave() {
  if (!FEATURES.daylog) return;
  if (!textareaEl) return;

  const text = textareaEl.value.trim();
  if (!text) return;

  const payload = {
    text,
    ts: Date.now()
  };

  try {
    localStorage.setItem(DAYLOG_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("[Family Spots] Konnte Mein-Tag nicht speichern:", err);
  }

  if (typeof showToastFn === "function") {
    showToastFn("daylog_saved");
  }

  if (typeof onDaylogSavedFn === "function") {
    onDaylogSavedFn();
  }
}

export function updateDaylogLanguage(lang) {
  currentLang = lang === LANG_EN ? LANG_EN : LANG_DE;

  if (textareaEl && FEATURES.daylog) {
    textareaEl.placeholder =
      currentLang === LANG_DE
        ? "Heute waren wir im Wildpark – die Ziegen waren sooo süß!"
        : "Today we went to the wildlife park – the goats were sooo cute!";
  }

  updateToggleLabel();
}

export function initDaylog({
  section,
  toggleButton,
  textarea,
  saveButton,
  showToast,
  onDaylogSaved,
  markHintSeen,
  initialLang
} = {}) {
  if (!FEATURES.daylog) return;

  sectionEl = section || null;
  toggleBtnEl = toggleButton || null;
  textareaEl = textarea || null;
  saveBtnEl = saveButton || null;

  showToastFn = showToast || null;
  onDaylogSavedFn = onDaylogSaved || null;
  markHintSeenFn = markHintSeen || null;

  currentLang = initialLang || LANG_DE;

  if (!textareaEl || !saveBtnEl) {
    return;
  }

  // Speichern
  saveBtnEl.addEventListener("click", handleDaylogSave);

  // Auf/Zu-Klappen
  if (sectionEl && toggleBtnEl) {
    sectionEl.id = sectionEl.id || "daylog-section";
    toggleBtnEl.setAttribute("aria-controls", sectionEl.id);

    const toggleHandler = (event) => {
      event.preventDefault();
      const isOpen = !sectionEl.open;
      sectionEl.open = isOpen;
      updateToggleLabel();

      if (typeof markHintSeenFn === "function") {
        markHintSeenFn();
      }
    };

    toggleBtnEl.addEventListener("click", toggleHandler);
    toggleBtnEl.addEventListener(
      "keydown",
      activateOnEnterSpace(toggleHandler)
    );

    sectionEl.addEventListener("toggle", updateToggleLabel);
  }

  updateDaylogLanguage(currentLang);
  loadDaylogFromStorage();
}