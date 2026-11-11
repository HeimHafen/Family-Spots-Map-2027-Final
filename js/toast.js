// js/toast.js
// =======================================
// Toast-Benachrichtigungen
// =======================================

"use strict";

import { setTextWithHearts } from "./utils/dom.js?v=20261010-unified-4";

let toastEl = null;
let toastTimeoutId = null;
let translateFn = null;

/**
 * Initialisiert das Toast-System.
 * @param {Object} options
 * @param {HTMLElement} options.element   – das #toast-Element
 * @param {(key:string)=>string} [options.t] – Übersetzungsfunktion (optional)
 */
export function initToast({ element, t } = {}) {
  toastEl = element || toastEl;
  translateFn = typeof t === "function" ? t : null;
}

/**
 * Zeigt eine Toast-Nachricht an.
 * @param {string} keyOrMessage – Entweder fertiger Text oder i18n-Key
 */
export function showToast(keyOrMessage) {
  if (!toastEl) return;

  let message = keyOrMessage || "…";

  if (translateFn) {
    const translated = translateFn(keyOrMessage);
    if (translated) {
      message = translated;
    }
  }

  setTextWithHearts(toastEl, message);
  toastEl.classList.add("toast--visible");

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = window.setTimeout(() => {
    toastEl.classList.remove("toast--visible");
  }, 3200);
}