// js/ui/dialog-portal.js
// Family Spots Map – Dialog-Portal + Backdrop-Z-Index-Fix

"use strict";

(function () {
  /**
   * Verschiebt alle [role="dialog"]-Elemente direkt unter <body>,
   * damit Z-Index und Backdrop korrekt funktionieren.
   */
  function portalizeDialogs() {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((el) => {
      if (el.parentElement !== document.body) {
        document.body.appendChild(el);
      }
    });

    ensureBackdrop();
    updateBodyLock();
  }

  /**
   * Erstellt bei Bedarf ein zentrales Backdrop-Element.
   * Klick auf den Backdrop schließt Dialoge mit data-backdrop-close="true".
   */
  function ensureBackdrop() {
    let backdrop = document.getElementById("dialog-backdrop");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "dialog-backdrop";
      document.body.appendChild(backdrop);
    }

    backdrop.addEventListener("click", () => {
      visibleDialogs().forEach((dialog) => {
        if (dialog.getAttribute("data-backdrop-close") === "true") {
          dialog.setAttribute("hidden", "");
        }
      });
      updateBodyLock();
    });
  }

  /**
   * Liefert alle aktuell sichtbaren Dialoge.
   * @returns {Element[]}
   */
  function visibleDialogs() {
    return Array.from(document.querySelectorAll('[role="dialog"]')).filter(
      (el) =>
        !el.hasAttribute("hidden") &&
        el.style.display !== "none" &&
        el.offsetParent !== null // sichtbar im Layout
    );
  }

  /**
   * Sperrt Body-Scroll & zeigt Backdrop an, wenn mindestens 1 Dialog offen ist.
   */
  function updateBodyLock() {
    const anyOpen = visibleDialogs().length > 0;
    const backdrop = document.getElementById("dialog-backdrop");

    document.body.classList.toggle("body--dialog-open", anyOpen);
    backdrop?.classList.toggle("is-visible", anyOpen);
  }

  /**
   * Beobachtet Dialog-Veränderungen (z. B. hidden/class/style) und
   * aktualisiert Body-Lock & Backdrop-Zustand.
   */
  function observeMutations() {
    const observer = new MutationObserver(updateBodyLock);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "style", "class"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      portalizeDialogs();
      observeMutations();
    });
  } else {
    portalizeDialogs();
    observeMutations();
  }
})();