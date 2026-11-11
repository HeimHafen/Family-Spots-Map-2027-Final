// Map, About and private diary. The existing Leaflet instance is never rebuilt.
export function initRouter({ viewMapEl, viewAboutEl, bottomNavButtons, btnHelpEl, getCurrentLang, getMapView, restoreMapView }) {
  const diary = document.getElementById("view-diary");
  const buttons = Array.from(bottomNavButtons || []);
  const diaryHash = "#my-day";
  let route = null, mapScroll = 0, mapReturnHash = "", focusFrame = 0, mapView = history.state?.fsmMapView || null;
  const lang = () => { try { const l = getCurrentLang?.(); return ["de", "en", "da"].includes(l) ? l : "de"; } catch { return "de"; } };
  function switchRoute(next, options = {}) {
    if (!["map", "about", "diary"].includes(next) || (next === "diary" && !diary)) next = "map";
    const previous = route;
    if (previous === next && !options.initial) return;
    if (previous === "map") { mapScroll = window.scrollY; mapView = getMapView?.() || mapView; mapReturnHash = location.hash === diaryHash ? "" : location.hash; }
    if (!options.fromHistory) {
      if (next === "diary" && location.hash !== diaryHash) {
        const state = { ...history.state, fsmDiary: true, fsmDiaryPushed: !options.replace, fsmMapScroll: mapScroll, fsmMapView: mapView, fsmMapHash: mapReturnHash };
        try { history[options.replace ? "replaceState" : "pushState"](state, "", diaryHash); } catch { /* Navigation works even if history is blocked. */ }
      } else if (next !== "diary" && location.hash === diaryHash) {
        try { const state = { ...history.state }; delete state.fsmDiary; history.replaceState(state, "", location.pathname + location.search + mapReturnHash); } catch { /* Keep the view usable. */ }
      }
    }
    route = next;
    const showMap = next === "map", showAbout = next === "about", showDiary = next === "diary";
    if (viewMapEl) { viewMapEl.classList.toggle("view--active", showMap); viewMapEl.style.display = showMap ? "" : "none"; viewMapEl.setAttribute("aria-hidden", String(!showMap)); }
    if (viewAboutEl) { viewAboutEl.classList.toggle("view--active", showAbout); viewAboutEl.style.display = showAbout ? "block" : "none"; viewAboutEl.setAttribute("aria-hidden", String(!showAbout)); }
    if (diary) { diary.hidden = !showDiary; diary.setAttribute("aria-hidden", String(!showDiary)); }
    document.body.dataset.appView = next;
    const l = lang();
    const menuLabel = document.getElementById("menu-toggle-view-label");
    if (menuLabel) menuLabel.textContent = showMap
      ? (document.getElementById("sidebar")?.classList.contains("hidden") ? { de: "Liste anzeigen", en: "Show list", da: "Vis liste" }[l] : { de: "Nur Karte", en: "Map only", da: "Kun kort" }[l])
      : { de: "Zur Karte", en: "Back to map", da: "Tilbage til kortet" }[l];
    buttons.forEach(button => { const active = button.dataset.route === next; button.classList.toggle("bottom-nav-item--active", active); button.setAttribute("aria-current", active ? "page" : "false"); });
    const returning = showMap && previous === "diary";
    const target = showDiary ? document.getElementById("diary-title")
      : showAbout ? document.querySelector(`#page-about-${l} h2`)
      : returning ? (document.querySelector("#fsm-home-nav [data-fsm-home-action=diary]") || document.getElementById("btn-open-diary")) : document.getElementById("app-title");
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(() => {
      if (showMap) window.dispatchEvent(new Event("resize"));
      if (target) { target.tabIndex = target.tabIndex < 0 ? -1 : target.tabIndex; target.focus({ preventScroll: true }); }
      window.scrollTo({ top: returning ? mapScroll : 0, behavior: "auto" });
      focusFrame = requestAnimationFrame(() => { if (returning && route === "map") { restoreMapView?.(mapView); window.scrollTo({ top: mapScroll, behavior: "auto" }); } });
    });
  }
  function returnToMap() {
    if (route === "diary" && history.state?.fsmDiaryPushed && location.hash === diaryHash && history.length > 1) history.back();
    else switchRoute("map");
  }
  buttons.forEach(button => button.addEventListener("click", () => switchRoute(button.dataset.route)));
  btnHelpEl?.addEventListener("click", event => { event.preventDefault(); switchRoute("about"); });
  document.querySelectorAll("[data-return-map]").forEach(button => button.addEventListener("click", () => switchRoute("map")));
  document.getElementById("btn-open-diary")?.addEventListener("click", () => switchRoute("diary"));
  document.getElementById("diary-return-map")?.addEventListener("click", returnToMap);
  const restoreRoute = () => {
    if (location.hash === diaryHash) {
      if (Number.isFinite(history.state?.fsmMapScroll)) mapScroll = history.state.fsmMapScroll;
      mapReturnHash = history.state?.fsmMapHash || "";
      switchRoute("diary", { fromHistory: true });
    } else if (route === "diary") switchRoute("map", { fromHistory: true });
  };
  window.addEventListener("popstate", restoreRoute);
  window.addEventListener("hashchange", restoreRoute);
  if (location.hash === diaryHash && Number.isFinite(history.state?.fsmMapScroll)) { mapScroll = history.state.fsmMapScroll; mapReturnHash = history.state.fsmMapHash || ""; }
  switchRoute(location.hash === diaryHash ? "diary" : viewAboutEl?.classList.contains("view--active") ? "about" : "map", { initial: true, fromHistory: true });
  return { switchRoute };
}
