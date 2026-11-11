// js/header-tagline.js
// Holt den Slogan aus data/index.json und passt ihn an die Sprache an

document.addEventListener("DOMContentLoaded", () => {
  const taglineEl = document.querySelector(".header-tagline");
  if (!taglineEl) return;

  fetch("data/index.json")
    .then((res) => res.json())
    .then((data) => {
      const tagline = (data && data.tagline) || {};

      function updateTagline() {
        const langSelect = document.getElementById("language-switcher");
        const lang = (langSelect && langSelect.value) || "de";
        const text = tagline[lang] || tagline.de || "";
        taglineEl.textContent = text;
      }

      updateTagline();

      const langSelect = document.getElementById("language-switcher");
      if (langSelect) {
        langSelect.addEventListener("change", updateTagline);
      }
    })
    .catch((err) => {
      console.error("Konnte Slogan nicht laden:", err);
    });
});
