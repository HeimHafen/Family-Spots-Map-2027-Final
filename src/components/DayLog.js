import { setTextWithHearts } from "../../js/utils/dom.js?v=20261010-unified-4";
// src/components/DayLog.js

import { memoryStore } from "../services/memoryStore.js";

const feedbackTexts = {
  de: {empty: "Bitte schreibe etwas.", saved: "{heart} Gespeichert. Schön, dass du dir Zeit nimmst.", none: "Noch keine Einträge – leg heute los!", locale: "de-DE"},
  en: {empty: "Please write something.", saved: "{heart} Saved. Thank you for taking a moment.", none: "No entries yet – start today!", locale: "en-GB"},
  da: {empty: "Skriv venligst noget.", saved: "{heart} Gemt. Tak, fordi du tager dig tid.", none: "Ingen indlæg endnu – begynd i dag!", locale: "da-DK"}
};
const currentFeedbackTexts = () => feedbackTexts[document.documentElement.lang.slice(0, 2)] || feedbackTexts.de;

export function initDayLog() {
  const textarea = document.getElementById("daylog-text");
  const saveBtn = document.getElementById("daylog-save");
  const showBtn = document.getElementById("daylog-show-random");
  const feedback = document.getElementById("daylog-feedback");

  if (!textarea || !saveBtn || !showBtn || !feedback) return;

  saveBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (!text) {
      feedback.textContent = currentFeedbackTexts().empty;
      return;
    }

    memoryStore.save(text);
    setTextWithHearts(feedback, currentFeedbackTexts().saved);
    textarea.value = "";
  });

  showBtn.addEventListener("click", () => {
    const entry = memoryStore.random();
    if (entry) {
      feedback.textContent = `📅 ${new Date(entry.date).toLocaleDateString(currentFeedbackTexts().locale)}: ${entry.text}`;
    } else {
      feedback.textContent = currentFeedbackTexts().none;
    }
  });
}