// utils/lang.js
import { getLanguage } from "../js/i18n.js?v=20261010-unified-4";

export function getLanguageInfo() {
  const lang = (getLanguage && getLanguage()) || "de";
  const lower = lang.toLowerCase();
  return {
    lang: lower,
    isDe: lower.startsWith("de"),
    isDa: lower.startsWith("da"),
    isEn: lower.startsWith("en"),
  };
}