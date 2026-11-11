// Family Spots Map: automatic, version-aware service-worker updates without clearing user data.
(() => {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  let registration, banner, message, updateButton, laterButton;
  let reloadStarted = false, reloadDeferred = false, checking = false;
  let activeWaitingWorker = null;
  const copy = {
    de: ["Eine neue Version ist bereit.", "Aktualisieren", "Später", "Bitte sichere offene Eingaben, Erinnerungen und Fotos vor dem Aktualisieren."],
    en: ["A new version is ready.", "Update", "Later", "Please save open entries, memories and photos before updating."],
    da: ["En ny version er klar.", "Opdater", "Senere", "Gem åbne indtastninger, minder og billeder før opdatering."]
  };

  const texts = () => copy[document.documentElement.lang] || copy.de;
  const hasDraft = () => {
    if (document.documentElement.dataset.memoryDraft === "true" ||
        document.documentElement.dataset.personalBackupBusy === "true" ||
        document.documentElement.dataset.fsmUnsaved === "true") return true;
    if (document.querySelector("#fse-draft-form")) return true;
    return [...document.querySelectorAll("#daylog-text, .daylog-entry-input")]
      .some(element => typeof element.value === "string" && element.value.trim());
  };

  function updateCopy() {
    if (!banner) return;
    const t = texts();
    message.textContent = hasDraft() ? t[3] : t[0];
    updateButton.textContent = t[1];
    laterButton.textContent = t[2];
  }

  function showBanner(worker) {
    if (worker) activeWaitingWorker = worker;
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "fsm-update-banner";
      banner.setAttribute("role", "status");
      banner.style.cssText = "position:relative;z-index:10000;padding:12px 16px;padding-bottom:max(12px,env(safe-area-inset-bottom));background:var(--card-bg,#fff7ee);color:var(--text-color,#452213);box-shadow:0 -3px 16px #0002;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font:inherit;font-size:14px";
      message = document.createElement("span");
      message.style.flex = "1 1 180px";
      updateButton = document.createElement("button");
      updateButton.type = "button";
      updateButton.className = "btn btn-small";
      laterButton = document.createElement("button");
      laterButton.type = "button";
      laterButton.className = "btn-ghost btn-small";
      updateButton.addEventListener("click", () => {
        if (hasDraft()) { updateCopy(); return; }
        if (activeWaitingWorker && activeWaitingWorker.state === "installed") {
          activeWaitingWorker.postMessage({type:"SKIP_WAITING"});
          updateButton.disabled = true;
        } else safeReload();
      });
      laterButton.addEventListener("click", () => { banner.hidden = true; });
      banner.append(message, updateButton, laterButton);
      document.body.prepend(banner);
      new MutationObserver(updateCopy).observe(document.documentElement, {attributes:true,attributeFilter:["lang"]});
    }
    banner.hidden = false;
    updateButton.disabled = false;
    updateCopy();
  }

  function safeReload() {
    if (reloadStarted) return;
    if (hasDraft()) {
      reloadDeferred = true;
      showBanner();
      return;
    }
    reloadStarted = true;
    window.location.reload();
  }

  // Every controlled tab gets this event on activation, including when the
  // update was installed in a different Safari tab. Never discard a draft.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (navigator.serviceWorker.controller) safeReload();
  });

  function loadedVersion() {
    const link = document.querySelector('link[href*="css/styles.css?v="]');
    if (!link) return null;
    try { return new URL(link.href).searchParams.get("v"); }
    catch { return null; }
  }
  function workerVersion() {
    const controller = navigator.serviceWorker.controller;
    if (!controller || typeof MessageChannel === "undefined") return Promise.resolve(null);
    return new Promise(resolve => {
      const channel = new MessageChannel();
      let finished = false;
      const done = value => {
        if (finished) return;
        finished = true;
        channel.port1.close();
        resolve(value);
      };
      channel.port1.onmessage = event => done(event.data?.version || null);
      controller.postMessage({type:"GET_VERSION"}, [channel.port2]);
      setTimeout(() => done(null), 1500);
    });
  }

  async function checkUpdate() {
    if (checking || !navigator.onLine) return;
    checking = true;
    try {
      if (reloadDeferred && !hasDraft()) { safeReload(); return; }
      if (registration.waiting && !hasDraft()) {
        registration.waiting.postMessage({type:"SKIP_WAITING"});
      }
      await registration.update();
      // This file is written into GitHub Pages with the release. It is
      // intentionally NOT SW-cached; a query prevents stale HTTP responses.
      const receipt = await fetch(`./release-info.json?check=${Date.now()}`, {cache:"no-store"})
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
      if (receipt?.release && receipt.release !== loadedVersion()) {
        const active = await workerVersion();
        if (active === receipt.release) safeReload();
        // Otherwise the worker is installing, or the edge is still updating:
        // retry when this page next becomes visible, without corrupting caches.
      }
    } catch (error) {
      console.warn("[Family Spots] Update check will retry", error);
    } finally { checking = false; }
  }

  async function start() {
    try {
      registration = await navigator.serviceWorker.register("./service-worker.js", {updateViaCache:"none"});
      if (registration.waiting) {
        if (hasDraft()) showBanner(registration.waiting);
        else registration.waiting.postMessage({type:"SKIP_WAITING"});
      }
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            if (hasDraft()) showBanner(installing);
            else installing.postMessage({type:"SKIP_WAITING"});
          }
          if (installing.state === "redundant") console.warn("[Family Spots] Incomplete update: previous version stays active.");
        });
      });
      window.addEventListener("online", checkUpdate);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) checkUpdate(); });
      window.addEventListener("pageshow", checkUpdate);
      setInterval(() => { if (!document.hidden) checkUpdate(); }, 5 * 60 * 1000);
      checkUpdate();
    } catch (error) { console.warn("[Family Spots] Service-worker setup failed", error); }
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, {once:true});
})();
