// js/ui/language.js
import { qs, qsa } from "../utils/dom.js";

const langOrder = ["de", "da", "en"];

function getCurrentLang() {
  return (document.documentElement.getAttribute("lang") || "de").toLowerCase().slice(0, 2);
}

function syncActiveLangChip() {
  const current = getCurrentLang();
  qsa(".app-menu-lang-chip").forEach((btn) => {
    const isActive = btn.dataset.langTarget === current;
    btn.classList.toggle("app-menu-lang-chip--active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function cycleLanguageTo(targetLang) {
  const legacyBtn = qs("#language-switcher");
  if (!legacyBtn || getCurrentLang() === targetLang) {
    syncActiveLangChip();
    return;
  }

  let guard = 0;
  const max = langOrder.length + 2;

  while (getCurrentLang() !== targetLang && guard < max) {
    legacyBtn.click();
    guard++;
  }

  syncActiveLangChip();
}

export function initLanguageSwitcher() {
  qsa(".app-menu-lang-chip").forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      const target = btn.dataset.langTarget;
      if (target) cycleLanguageTo(target);
    });
  });

  window.addEventListener("load", syncActiveLangChip);

  const htmlEl = document.documentElement;
  const obs = new MutationObserver(syncActiveLangChip);
  obs.observe(htmlEl, { attributes: true, attributeFilter: ["lang"] });
}