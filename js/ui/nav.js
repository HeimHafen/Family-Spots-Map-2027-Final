// Einfache Routensteuerung für die Bottom-Navigation
// Unabhängig von app.js, damit 🗺️ / ℹ️ zuverlässig funktionieren.

window.addEventListener("DOMContentLoaded", () => {
  const views = {
    map: document.getElementById("view-map"),
    about: document.getElementById("view-about"),
  };

  const navButtons = Array.from(
    document.querySelectorAll(".bottom-nav-item[data-route]")
  );
  const indicator = document.getElementById("bottom-nav-indicator");

  function setRoute(route) {
    const targetRoute = views[route] ? route : "map";

    // Views ein-/ausblenden
    Object.entries(views).forEach(([name, el]) => {
      if (!el) return;
      if (name === targetRoute) {
        el.classList.add("view--active");
      } else {
        el.classList.remove("view--active");
      }
    });

    // Bottom-Nav-Buttons markieren + Indikator verschieben
    navButtons.forEach((btn, index) => {
      const isActive = btn.dataset.route === targetRoute;
      btn.classList.toggle("bottom-nav-item--active", isActive);

      if (isActive && indicator) {
        indicator.style.transform = `translateX(${index * 100}%)`;
      }
    });

    // Optional: Hash in der URL aktualisieren (#about / #)
    const newHash = targetRoute === "map" ? "" : `#${targetRoute}`;
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash !== targetRoute) {
      const newUrl = newHash ? newHash : " ";
      // replaceState, damit kein History-Spam entsteht
      history.replaceState(null, "", newUrl);
    }
  }

  // Klick-Events an Buttons hängen
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route || "map";
      setRoute(route);
    });
  });

  // Initiale Route aus Hash ableiten (#about) oder Default "map"
  const initialHash = window.location.hash.replace("#", "");
  const initialRoute = initialHash === "about" ? "about" : "map";
  setRoute(initialRoute);
});
