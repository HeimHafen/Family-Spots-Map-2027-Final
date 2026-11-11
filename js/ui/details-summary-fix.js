// js/ui/details-summary-fix.js
export function initDetailsSummaryButtonFix() {
  ["btn-toggle-plus", "btn-toggle-daylog"].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    // Verhindert, dass der Klick auf den Button das <summary>/<details> toggelt
    btn.addEventListener("click", (e) => e.stopPropagation());

    // Optional: auch Keyboard sauber abfangen
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.stopPropagation();
      }
    });
  });
}

// Auto-init (damit du es nur via <script type="module"> einbinden musst)
initDetailsSummaryButtonFix();