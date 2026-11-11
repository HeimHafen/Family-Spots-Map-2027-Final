import { readPhoto, readPhotoDraft, writePhotoDraft } from "./personal-storage.js?v=20261106-app-feinschliff-16";
import { preparePhoto, MAX_PHOTOS } from "./memory-images.js?v=20261105-photo-v928";

const words = {
  de: {
    add: "Fotos hinzufügen", choose: "Fotos auswählen", brief: "Text optional · Fotos nur in diesem Browser.", info: "Hinweise zu Fotos", hint: "Bis zu 3 Fotos · Text ist optional. JPEG, PNG oder WebP, je Bild bis 25 MB. Die App speichert verkleinerte Kopien nur in diesem Browser. Bitte sichere wichtige Erinnerungen regelmäßig.",
    count: n => `${n} von 3 Fotos`, remove: n => `Foto ${n} entfernen`, view: n => `Foto ${n} vergrößern`, image: n => `Foto ${n} dieser Erinnerung`, close: "Schließen", previous: "Vorheriges Foto", next: "Nächstes Foto", gallery: n => `Fotos ansehen (${n})`, position: (n, total) => `Foto ${n} von ${total}`, preparing: "Fotos werden vorbereitet …", limit: "Du kannst bis zu drei verschiedene Fotos je Erinnerung hinzufügen.",
    photo_size: "Dieses Bild ist zu groß. Bitte wähle eine Datei bis 25 MB und höchstens 60 Megapixel.", photo_format: "Bitte wähle ein Foto im Format JPEG, PNG oder WebP. Falls dein Browser HEIC nicht öffnen kann, exportiere das Bild als JPEG.", invalid_photo: "Dieses Bild konnte nicht geöffnet werden. Bitte versuche es mit einem anderen Foto.", missing: "Ein gespeichertes Foto konnte nicht geladen werden. Bitte lade die Seite erneut. Die Erinnerung wurde nicht verändert.", draft: "Die Fotoauswahl bleibt hier erhalten, konnte aber nicht für das Neuladen gesichert werden. Bitte speichere deine Erinnerung vor dem Schließen."
  },
  en: {
    add: "Add photos", choose: "Choose photos", brief: "Text optional · Photos stay in this browser.", info: "Photo information", hint: "Up to 3 photos · Text is optional. JPEG, PNG or WebP, up to 25 MB each. The app saves smaller copies only in this browser. Please back up important memories regularly.",
    count: n => `${n} of 3 photos`, remove: n => `Remove photo ${n}`, view: n => `Enlarge photo ${n}`, image: n => `Photo ${n} of this memory`, close: "Close", previous: "Previous photo", next: "Next photo", gallery: n => `View photos (${n})`, position: (n, total) => `Photo ${n} of ${total}`, preparing: "Preparing photos …", limit: "You can add up to three different photos per memory.",
    photo_size: "This image is too large. Please choose a file up to 25 MB and no more than 60 megapixels.", photo_format: "Please choose a JPEG, PNG or WebP photo. If your browser cannot open HEIC, export the image as JPEG.", invalid_photo: "This image could not be opened. Please try another photo.", missing: "A saved photo could not be loaded. Please reload the page. The memory has not been changed.", draft: "Your selected photos are still here, but could not be saved for a reload. Please save your memory before closing the page."
  },
  da: {
    add: "Tilføj billeder", choose: "Vælg billeder", brief: "Tekst valgfri · Billeder gemmes i denne browser.", info: "Om billeder", hint: "Op til 3 billeder · Tekst er valgfri. JPEG, PNG eller WebP, højst 25 MB pr. billede. Appen gemmer mindre kopier kun i denne browser. Tag jævnligt en sikkerhedskopi af vigtige minder.",
    count: n => `${n} af 3 billeder`, remove: n => `Fjern billede ${n}`, view: n => `Forstør billede ${n}`, image: n => `Billede ${n} fra dette minde`, close: "Luk", previous: "Forrige billede", next: "Næste billede", gallery: n => `Se billeder (${n})`, position: (n, total) => `Billede ${n} af ${total}`, preparing: "Billederne klargøres …", limit: "Du kan tilføje op til tre forskellige billeder pr. minde.",
    photo_size: "Billedet er for stort. Vælg en fil på højst 25 MB og højst 60 megapixel.", photo_format: "Vælg et billede i JPEG-, PNG- eller WebP-format. Hvis browseren ikke kan åbne HEIC, skal du eksportere billedet som JPEG.", invalid_photo: "Billedet kunne ikke åbnes. Prøv et andet billede.", missing: "Et gemt billede kunne ikke indlæses. Indlæs siden igen. Mindet er ikke ændret.", draft: "Dine valgte billeder er stadig her, men kunne ikke gemmes til næste indlæsning. Gem dit minde, før du lukker siden."
  }
};
export function initDaylogPhotos({ notify, onDirty, isLocked }) {
  const t = () => words[document.documentElement.lang] || words.de;
  const slots = new Map(), blobs = new Map(), mounts = new Map(), galleryURLs = new Set();
  let draftKey, draftStorageAvailable = true, pending = 0, queue = Promise.resolve(), main, dialog, dialogURL, opener;
  const busy = () => pending > 0 || isLocked();
  const changed = () => { document.documentElement.dataset.memoryDraft = String(pending > 0 || [...slots.values()].some(s => s.ids.length)); onDirty?.(); };
  const entrySlot = (key, ids = []) => {
    if (!slots.has(key)) slots.set(key, { ids: ids.slice() });
    return slots.get(key);
  };
  const blobFor = async id => {
    if (blobs.has(id)) return blobs.get(id);
    const blob = await readPhoto(id);
    if ([...slots.values()].some(s => s.ids.includes(id))) blobs.set(id, blob);
    return blob;
  };
  const saveDraft = () => {
    const snapshot = { version: 1, slots: Object.fromEntries([...slots].map(([key, s]) => [key, { ids: s.ids.slice(), media: s.ids.map(id => ({ id, blob: blobs.get(id) })).filter(x => x.blob) }])) };
    queue = queue.catch(() => {}).then(() => { if (!draftKey || !draftStorageAvailable) throw new Error("draft_unavailable"); return writePhotoDraft(draftKey, snapshot); });
    return queue.catch(() => { notify(t().draft); });
  };
  const ready = (async () => {
    try {
      let tab = sessionStorage.getItem("fs_photo_draft_tab");
      if (!tab) { tab = crypto.randomUUID(); sessionStorage.setItem("fs_photo_draft_tab", tab); }
      draftKey = `photo-draft:${tab}`;
      const saved = await readPhotoDraft(draftKey);
      if (saved != null && (saved.version !== 1 || !saved.slots || typeof saved.slots !== "object" || Array.isArray(saved.slots))) throw new Error("bad_photo_draft");
      if (saved?.version === 1 && saved.slots) for (const [key, s] of Object.entries(saved.slots)) {
        if (!Array.isArray(s.ids) || s.ids.length > MAX_PHOTOS || new Set(s.ids).size !== s.ids.length || s.ids.some(id => !/^[a-f0-9]{64}$/.test(id))) throw new Error("bad_photo_draft");
        for (const media of s.media || []) if (media.blob instanceof Blob && s.ids.includes(media.id)) blobs.set(media.id, media.blob);
        slots.set(key, { ids: s.ids.slice() });
      }
    } catch { draftStorageAvailable = false; notify(t().draft); }
    changed();
  })();
  const makeButton = (label, handler, className = "btn-ghost btn-small") => {
    const button = document.createElement("button"); button.type = "button"; button.className = className; button.textContent = label; button.addEventListener("click", handler); return button;
  };
  let viewerIds = [], viewerIndex = 0, viewerGeneration = 0;
  function closeViewer() { ++viewerGeneration; if (dialog?.open) dialog.close(); }
  async function showViewerPhoto(index) {
    if (index < 0 || index >= viewerIds.length) return;
    const generation = ++viewerGeneration;
    try {
      const blob = await blobFor(viewerIds[index]);
      if (generation !== viewerGeneration || (!dialog.open && (!opener?.isConnected || !opener.getClientRects().length))) return;
      if (dialogURL) URL.revokeObjectURL(dialogURL);
      dialogURL = URL.createObjectURL(blob); viewerIndex = index;
      const focused = document.activeElement;
      const image = dialog.querySelector("img");
      image.src = dialogURL; image.alt = t().image(index + 1);
      dialog.setAttribute("aria-label", t().position(index + 1, viewerIds.length));
      dialog.querySelector(".memory-photo-viewer-status").textContent = t().position(index + 1, viewerIds.length);
      dialog.querySelector("[data-photo-direction=previous]").disabled = index === 0;
      dialog.querySelector("[data-photo-direction=next]").disabled = index === viewerIds.length - 1;
      // Keep keyboard focus when the navigation button just became disabled.
      if (focused?.disabled && (document.activeElement === focused || document.activeElement === document.body)) dialog.querySelector(".memory-photo-close").focus({ preventScroll: true });
      if (!dialog.open && opener?.isConnected) { dialog.showModal(); dialog.querySelector(".memory-photo-close").focus(); }
    } catch { if (generation === viewerGeneration) notify(t().missing); }
  }
  function view(id, n, source, ids = [id]) {
    if (!source.isConnected) return;
    if (!dialog) {
      dialog = document.createElement("dialog"); dialog.className = "memory-photo-dialog";
      const close = makeButton(t().close, closeViewer, "btn-ghost memory-photo-close");
      const image = document.createElement("img");
      const nav = document.createElement("div"); nav.className = "memory-photo-viewer-nav";
      const previous = makeButton("", () => showViewerPhoto(viewerIndex - 1)); previous.dataset.photoDirection = "previous";
      const next = makeButton("", () => showViewerPhoto(viewerIndex + 1)); next.dataset.photoDirection = "next";
      const status = document.createElement("span"); status.className = "memory-photo-viewer-status"; status.setAttribute("role", "status");
      nav.append(previous, status, next); dialog.append(close, image, nav); document.body.append(dialog);
      dialog.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); showViewerPhoto(viewerIndex + (event.key === "ArrowLeft" ? -1 : 1)); }
        if (event.key === "Tab") {
          const controls = [...dialog.querySelectorAll("button")].filter(e => !e.disabled && !e.closest("[hidden]"));
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      });
      dialog.addEventListener("click", e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeViewer(); } });
      dialog.addEventListener("close", () => {
        ++viewerGeneration;
        if (dialogURL) URL.revokeObjectURL(dialogURL); dialogURL = null; image.removeAttribute("src");
        const fallback = document.getElementById("diary-new-memory") || document.getElementById("daylog-text");
        (opener?.isConnected ? opener : fallback)?.focus({ preventScroll: true });
      });
    }
    viewerIds = ids.slice(); opener = source;
    dialog.querySelector(".memory-photo-close").textContent = t().close;
    dialog.querySelector("[data-photo-direction=previous]").textContent = t().previous;
    dialog.querySelector("[data-photo-direction=next]").textContent = t().next;
    dialog.querySelector(".memory-photo-viewer-nav").hidden = viewerIds.length < 2;
    showViewerPhoto(Math.max(0, viewerIds.indexOf(id)));
  }
  function thumbnail(id, n, editable, key, owner, ids = [id]) {
    const figure = document.createElement("div"); figure.className = "memory-photo-tile";
    const button = makeButton("", () => view(id, n, button, ids), "memory-photo-thumb"); button.setAttribute("aria-label", t().view(n));
    const img = document.createElement("img"); img.alt = t().image(n); img.loading = "lazy"; img.width = 160; img.height = 120; button.append(img); figure.append(button);
    blobFor(id).then(blob => {
      if (!img.isConnected) return;
      const url = URL.createObjectURL(blob); owner.add(url); img.src = url;
    }).catch(() => { if (img.isConnected) { button.textContent = t().missing; button.disabled = true; } });
    if (editable) {
      const remove = makeButton(t().remove(n), async () => {
        if (busy()) return;
        pending++; changed();
        const s = entrySlot(key); s.ids = s.ids.filter(photo => photo !== id);
        try { await saveDraft(); } finally { pending--; changed(); paint(key); mounts.get(key)?.root.querySelector(".memory-photo-add")?.focus({ preventScroll: true }); }
      }, "btn-ghost memory-photo-remove"); remove.disabled = busy(); figure.append(remove);
    }
    return figure;
  }
  function paint(key) {
    const mount = mounts.get(key); if (!mount) return;
    for (const url of mount.urls) URL.revokeObjectURL(url); mount.urls.clear();
    const { root } = mount, s = entrySlot(key);
    const previousHelp = root.querySelector("details");
    const helpOpen = !!previousHelp?.open;
    const helpFocused = previousHelp?.querySelector("summary") === document.activeElement;
    root.replaceChildren();
    const row = document.createElement("div"); row.className = "memory-photo-controls";
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"; input.multiple = true; input.hidden = true;
    const add = makeButton(t().choose, () => { if (!busy()) input.click(); }, "btn-ghost btn-small memory-photo-add"); add.disabled = busy() || s.ids.length >= MAX_PHOTOS;
    const count = document.createElement("span"); count.className = "filter-group-helper"; count.textContent = pending ? t().preparing : t().count(s.ids.length); count.setAttribute("role", "status");
    const heading = document.createElement("div"); heading.className = "memory-photo-heading";
    const title = document.createElement("strong"); title.textContent = t().add;
    heading.append(title, count); root.append(heading);
    const camera = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    camera.setAttribute("viewBox", "0 0 24 24"); camera.setAttribute("aria-hidden", "true"); camera.setAttribute("focusable", "false");
    const cameraPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cameraPath.setAttribute("d", "M4 7h4l2-3h4l2 3h4v13H4z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0"); camera.append(cameraPath);add.prepend(camera);
    row.append(add, input);
    if (key === "new") {
      const brief = document.createElement("p"); brief.className = "filter-group-helper memory-photo-hint";
      brief.id = "memory-photo-hint"; brief.textContent = t().brief; add.setAttribute("aria-describedby", brief.id);
      const help = document.createElement("details"); help.className = "memory-help"; help.open = helpOpen;
      const summary = document.createElement("summary");
      const infoLabel = document.createElement("span"); infoLabel.textContent = t().info;
      const infoIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      infoIcon.classList.add("memory-help-icon");
      infoIcon.setAttribute("viewBox", "0 0 20 20");
      infoIcon.setAttribute("aria-hidden", "true");
      infoIcon.setAttribute("focusable", "false");
      const infoCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      infoCircle.setAttribute("cx", "10"); infoCircle.setAttribute("cy", "10"); infoCircle.setAttribute("r", "8.2");
      const infoMark = document.createElementNS("http://www.w3.org/2000/svg", "path");
      infoMark.setAttribute("d", "M10 9v5 M10 6.3v.15");
      infoIcon.append(infoCircle, infoMark);
      summary.append(infoIcon, infoLabel);
      const hint = document.createElement("p"); hint.className = "filter-group-helper"; hint.textContent = t().hint;
      help.append(summary, hint); root.append(brief, row, help);
      if (helpFocused) summary.focus({ preventScroll: true });
    }
    if (key !== "new") root.append(row);
    const grid = document.createElement("div"); grid.className = "memory-photo-grid";
    s.ids.forEach((id, i) => grid.append(thumbnail(id, i + 1, true, key, mount.urls))); root.append(grid);
    input.addEventListener("cancel", () => add.focus({ preventScroll: true }));
    input.addEventListener("change", async () => {
      const files = [...(input.files || [])]; if (!files.length || busy()) return;
      if (files.length + s.ids.length > MAX_PHOTOS) { notify(t().limit); input.value = ""; add.focus(); return; }
      pending++; changed(); paint(key);
      try {
        // Prepare the entire selection first; a bad file never partly adds a batch.
        const prepared = [];
        for (const file of files) prepared.push(await preparePhoto(file));
        const unique = prepared.filter((m, i) => !s.ids.includes(m.id) && prepared.findIndex(x => x.id === m.id) === i);
        if (unique.length !== prepared.length) notify(t().limit);
        for (const media of unique) { blobs.set(media.id, media.blob); s.ids.push(media.id); }
        await saveDraft();
      } catch (error) { notify(t()[error.code] || t().invalid_photo); }
      finally { pending--; changed(); paint(key); const next = mounts.get(key)?.root.querySelector(".memory-photo-add"); if (next && !next.disabled) next.focus({ preventScroll: true }); }
    });
  }
  function mountEditor(key, host, ids = []) {
    const first = !slots.has(key);
    entrySlot(key, ids);
    const prior = mounts.get(key); if (prior) for (const url of prior.urls) URL.revokeObjectURL(url);
    const root = document.createElement("div"); root.className = "memory-photo-editor"; root.dataset.photoSlot = key; host.append(root);
    mounts.set(key, { root, urls: new Set() }); paint(key);
    // Keep the original photos with an edit draft too, even if another tab
    // later deletes the saved memory. Its conflict copy can still be saved.
    if (first && key !== "new" && ids.length) {
      pending++; changed(); paint(key);
      Promise.all(ids.map(blobFor)).then(saveDraft).catch(() => notify(t().missing)).finally(() => { pending--; changed(); paint(key); });
    }
    return root;
  }
  const api = {
    ready,
    ids: key => (slots.get(key)?.ids || []).slice(),
    hasDraft: () => pending > 0 || [...slots.values()].some(s => s.ids.length > 0),
    isBusy: () => pending > 0,
    restoredEdits: () => [...slots.keys()].filter(key => key.startsWith("entry:")).map(key => key.slice(6)),
    hasNew: () => !!slots.get("new")?.ids.length,
    mountMain(host) { main = mountEditor("new", host); },
    mountEditor,
    beginRender() { for (const url of galleryURLs) URL.revokeObjectURL(url); galleryURLs.clear(); for (const [key, m] of mounts) if (key !== "new") { for (const url of m.urls) URL.revokeObjectURL(url); mounts.delete(key); } },
    gallery(ids, host) {
      if (!ids?.length) return;
      const grid = document.createElement("div"); grid.className = "memory-photo-grid memory-photo-gallery"; grid.dataset.count = String(ids.length); host.append(grid);
      ids.forEach((id, i) => { const tile = thumbnail(id, i + 1, false, null, galleryURLs, ids); if (i > 0) tile.hidden = true; grid.append(tile); });
      const open = makeButton(t().gallery(ids.length), () => view(ids[0], 1, open, ids), "diary-photos-open"); host.append(open);
    },
    async operation(key) {
      if (pending) throw new Error("photos_busy");
      pending++; changed();
      try {
        const ids = entrySlot(key).ids.slice(), media = [];
        for (const id of ids) media.push({ id, blob: await blobFor(id) });
        return { photos: ids, media, photoDraftKey: draftStorageAvailable ? draftKey : null, photoDraftSlot: key };
      } catch (error) { notify(t().missing); throw error; }
      finally { pending--; changed(); }
    },
    async clear(key) {
      pending++; changed();
      try {
        slots.delete(key); if (key === "new") entrySlot("new");
        await saveDraft();
        const retained = new Set([...slots.values()].flatMap(s => s.ids));
        for (const id of blobs.keys()) if (!retained.has(id)) blobs.delete(id);
      } finally { pending--; changed(); if (key === "new") paint("new"); }
    },
    refresh() { for (const key of mounts.keys()) paint(key); if (dialog?.open) {
      dialog.querySelector(".memory-photo-close").textContent = t().close;
      dialog.querySelector("[data-photo-direction=previous]").textContent = t().previous;
      dialog.querySelector("[data-photo-direction=next]").textContent = t().next;
      dialog.querySelector(".memory-photo-viewer-status").textContent = t().position(viewerIndex + 1, viewerIds.length);
      dialog.querySelector("img").alt = t().image(viewerIndex + 1);
      dialog.setAttribute("aria-label", t().position(viewerIndex + 1, viewerIds.length));
    } changed(); }
  };
  new MutationObserver(() => api.refresh()).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  new MutationObserver(() => { if (document.body.dataset.appView !== "diary") closeViewer(); })
    .observe(document.body, { attributes: true, attributeFilter: ["data-app-view"] });
  window.addEventListener("beforeunload", e => { if (pending || api.hasDraft()) { e.preventDefault(); e.returnValue = ""; } });
  return api;
}
