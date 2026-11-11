import { photoIds, personalSnapshot } from "./personal-storage.js?v=20261106-app-feinschliff-16";

import { writeZip, readZip, MAX_ARCHIVE_BYTES, MAX_MANIFEST_BYTES } from "./backup-zip.js";
import { validatePhoto } from "./memory-images.js";
import { validatedPrivateCalendar } from "./calendar-backup.js";

const FORMAT = "family-spots-personal-backup";
export const MAX_BACKUP_BYTES = MAX_MANIFEST_BYTES;
const stamp = n => Number.isSafeInteger(n) && n >= 0 && Number.isFinite(new Date(n).getTime());
const invalid = () => { const e = new Error("invalid_backup"); e.code = "invalid_backup"; return e; };

export function parseBackup(text, version = 1) {
  if (![1, 2, 3].includes(version) || typeof text !== "string" || new Blob([text]).size > MAX_BACKUP_BYTES) throw invalid();
  let data;
  try { data = JSON.parse(text); } catch { throw invalid(); }
  if (!data || data.format !== FORMAT || data.version !== version ||
      !Array.isArray(data.favorites) || !Array.isArray(data.entries)) throw invalid();
  if (data.favorites.some(id => typeof id !== "string" || !id.trim() || id.length > 512)) throw invalid();
  const safePhotos = entry => { try { return photoIds(entry); } catch { throw invalid(); } };
  const entries = data.entries.map(entry => {
    if (version === 1 && entry?.photos?.length) throw invalid();
    if (!entry || typeof entry.id !== "string" || !entry.id.trim() || entry.id.length > 512 ||
        typeof entry.text !== "string" || (!entry.text.trim() && !(version >= 2 && safePhotos(entry).length)) ||
        !stamp(entry.ts) || (entry.updatedTs !== undefined && !stamp(entry.updatedTs))) throw invalid();
    return { id: entry.id, text: entry.text.trim(), ts: entry.ts,
      ...(version >= 2 && safePhotos(entry).length ? { photos: safePhotos(entry).slice() } : {}),
      ...(entry.updatedTs !== undefined ? { updatedTs: entry.updatedTs } : {}) };
  });
  if (version === 3 && !Array.isArray(data.calendar)) throw invalid();
  const calendar = version === 3 ? validatedPrivateCalendar(data.calendar) : undefined;
  return { favorites: [...new Set(data.favorites)], entries, ...(calendar ? { calendar } : {}) };
}

export async function exportPersonalBackup() {
  const { favorites, entries } = await personalSnapshot();
  if (entries.some(entry => photoIds(entry).length)) throw invalid(); // Use the complete archive API for photos.
  const data = { format: FORMAT, version: 1, exportedAt: new Date().toISOString(), favorites, entries };
  const text = JSON.stringify(data, null, 2);
  // Never offer a backup which this version cannot restore.
  parseBackup(text);
  return text;
}
export async function importPersonalBackup(text) {
  const data = parseBackup(text); // Validate the complete file before any writes.
  return personalSnapshot(data);
}

// A complete snapshot is split only at memory boundaries. Every part carries
// the selected memories with their complete photos, never partial photo data.
export async function exportPersonalArchives() {
  const { favorites, entries, photos, calendar } = await personalSnapshot();
  const exportedAt = new Date().toISOString(), id = crypto.randomUUID();
  for (const [photoId, blob] of Object.entries(photos)) await validatePhoto(blob, photoId);
  const groups = [];
  let group = { favorites, calendar, entries: [], ids: new Set(), bytes: 4096 + new Blob([JSON.stringify([favorites, calendar])]).size, manifestBytes: 4096 + new Blob([JSON.stringify([favorites, calendar])]).size };
  const flush = () => { groups.push(group); group = { favorites: [], calendar: [], entries: [], ids: new Set(), bytes: 4096, manifestBytes: 4096 }; };
  for (const entry of entries) {
    const textBytes = new Blob([JSON.stringify(entry)]).size + 1;
    const cost = () => photoIds(entry).filter(photoId => !group.ids.has(photoId)).reduce((sum, photoId) => sum + photos[photoId].size + 256, textBytes);
    if ((group.entries.length || group.favorites.length) && (group.bytes + cost() > MAX_ARCHIVE_BYTES || group.manifestBytes + textBytes > MAX_MANIFEST_BYTES || new Set([...group.ids, ...photoIds(entry)]).size > 60000)) flush();
    if (group.bytes + cost() > MAX_ARCHIVE_BYTES || group.manifestBytes + textBytes > MAX_MANIFEST_BYTES) throw invalid();
    group.bytes += cost(); group.manifestBytes += textBytes;
    group.entries.push(entry); photoIds(entry).forEach(photoId => group.ids.add(photoId));
  }
  flush();
  const archives = [];
  for (const [index, part] of groups.entries()) {
    const metadata = { format: FORMAT, version: 3, exportedAt, favorites: part.favorites, entries: part.entries, calendar: part.calendar,
      ...(groups.length > 1 ? { bundle: { id, index: index + 1, total: groups.length } } : {}) };
    const manifest = JSON.stringify(metadata);
    parseBackup(manifest, 3);
    const files = [{ name: "manifest.json", blob: new Blob([manifest], { type: "application/json" }) }];
    for (const photoId of [...part.ids].sort()) files.push({ name: `photos/${photoId}.jpg`, blob: photos[photoId] });
    archives.push(await writeZip(files));
  }
  return archives;
}
// Retained for callers expecting a single file. The UI uses the complete set.
export async function exportPersonalArchive() {
  const archives = await exportPersonalArchives();
  if (archives.length !== 1) { const error = new Error("multipart_required"); error.code = "multipart_required"; throw error; }
  return archives[0];
}
async function readPersonalFile(file) {
  if (!(file instanceof Blob) || file.size > MAX_ARCHIVE_BYTES) throw invalid();
  const signature = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  let data, bundle = null;
  if (signature[0] === 80 && signature[1] === 75) {
    const files = await readZip(file);
    const text = await files.get("manifest.json").text();
    const raw = JSON.parse(text);
    data = parseBackup(text, raw.version);
    if (raw.bundle !== undefined) {
      bundle = raw.bundle;
      if (!bundle || typeof bundle.id !== "string" || !/^[a-f0-9-]{36}$/i.test(bundle.id) || !Number.isSafeInteger(bundle.index) || !Number.isSafeInteger(bundle.total) || bundle.total < 2 || bundle.index < 1 || bundle.index > bundle.total) throw invalid();
    }
    const ids = new Set(data.entries.flatMap(photoIds));
    if (files.size !== ids.size + 1) throw invalid();
    data.photos = Object.create(null);
    for (const photoId of ids) {
      const blob = files.get(`photos/${photoId}.jpg`);
      try { await validatePhoto(blob, photoId); } catch { throw invalid(); }
      data.photos[photoId] = blob;
    }
  } else {
    if (file.size > MAX_BACKUP_BYTES) throw invalid();
    data = parseBackup(await file.text());
  }
  return { data, bundle };
}
export async function importPersonalFiles(files, mayImport = () => true) {
  const selected = Array.from(files || []);
  if (!selected.length) throw invalid();
  const parts = [];
  // Validate every selected file, including all photos, before the single commit.
  for (const file of selected) parts.push(await readPersonalFile(file));
  const bundle = parts[0].bundle;
  if (bundle || parts.some(part => part.bundle)) {
    if (!bundle || parts.length !== bundle.total || parts.some(part => !part.bundle || part.bundle.id !== bundle.id || part.bundle.total !== bundle.total) || new Set(parts.map(part => part.bundle.index)).size !== bundle.total) {
      const error = new Error("incomplete_backup"); error.code = "incomplete_backup"; throw error;
    }
    parts.sort((a, b) => a.bundle.index - b.bundle.index);
  }
  const data = { favorites: [], entries: [], photos: Object.create(null) };
  let includesCalendar = false;
  for (const part of parts) {
    for (const favorite of part.data.favorites) data.favorites.push(favorite);
    // Avoid argument-count limits with large imported diaries.
    for (const entry of part.data.entries) data.entries.push(entry);
    Object.assign(data.photos, part.data.photos);
    if (part.data.calendar) {
      if (!includesCalendar) data.calendar = [];
      includesCalendar = true;
      data.calendar.push(...part.data.calendar);
    }
  }
  if (!mayImport()) { const error = new Error("draft"); error.code = "draft"; throw error; }
  return personalSnapshot(data);
}
export async function importPersonalFile(file, mayImport = () => true) {
  return importPersonalFiles([file], mayImport);
}

const copy = {
  de: {
    title: "Erinnerungen & Favoriten sichern", brief: "Erinnerungen, Fotos, Favoriten und private Ausflugspläne gemeinsam sichern.", info: "Hinweise zur Sicherung", export: "Daten exportieren", import: "Daten importieren",
    hint: "Beim Import bleiben vorhandene Daten erhalten. ZIP-Sicherungen enthalten auch gespeicherte Fotos und private Kalenderpläne. Große Sicherungen werden in nummerierte Teile aufgeteilt. Speichere alle Teile zusammen und wähle sie beim Import gemeinsam aus. Bisherige JSON-Sicherungen lassen sich weiterhin importieren. Entwürfe und Plus-Zugänge sind nicht enthalten. Bewahre die Datei privat auf.",
    incomplete: "Bitte wähle alle nummerierten Teile derselben Sicherung gemeinsam aus. Es wurde nichts importiert.",
    parts: n => `Deine Sicherung besteht aus ${n} Teilen. Lade jeden Teil einzeln herunter und bewahre alle Dateien zusammen auf.`,
    download: (n, total) => total === 1 ? "Sicherung herunterladen" : `Teil ${n} von ${total} herunterladen`,
    exported: "Die Sicherungsdatei wurde zum Download bereitgestellt. Bitte bewahre sie sicher auf.",
    exportLarge: "Die Sicherung ist für dieses Dateiformat zu groß oder enthält nicht unterstützte Daten. Deine gespeicherten Daten bleiben erhalten.",
    invalid: "Diese Datei ist keine unterstützte Sicherung oder zu groß (je ZIP-Datei höchstens 100 MB, JSON: 16 MB). Es wurde nichts importiert.",
    failed: "Die Sicherung konnte nicht verarbeitet werden. Bitte prüfe den verfügbaren Speicher und versuche es erneut.",
    draft: "Bitte speichere deine offenen Erinnerungen samt Fotos vor dem Import oder brich die Bearbeitung ab.",
    imported: (e, f, c, p) => e === 0 && f === 0 && p === 0 ? "Die Sicherung ist bereits vollständig vorhanden. Es wurden keine doppelten Einträge hinzugefügt." : `Import abgeschlossen: ${e} ${e === 1 ? "Erinnerung" : "Erinnerungen"} und ${f} ${f === 1 ? "Favorit" : "Favoriten"} hinzugefügt.${p ? ` ${p} private ${p === 1 ? "Ausflugsplanung" : "Ausflugsplanungen"} ergänzt.` : ""}${c ? " Abweichende Versionen wurden als zusätzliche Erinnerungen erhalten." : ""}`
  },
  en: {
    title: "Back up memories & favourites", brief: "Back up memories, photos, favourites and private outing plans together.", info: "Backup information", export: "Export data", import: "Import data",
    hint: "Importing keeps existing data. ZIP backups include saved photos and private calendar plans. Large backups are split into numbered parts. Keep all parts together and select them together when importing. Previous JSON backups can still be imported. Drafts and Plus access are not included. Keep the file private.",
    incomplete: "Please select all numbered parts of the same backup together. Nothing was imported.",
    parts: n => `Your backup has ${n} parts. Download each part separately and keep all files together.`,
    download: (n, total) => total === 1 ? "Download backup" : `Download part ${n} of ${total}`,
    exported: "The backup file is ready to download. Please keep it somewhere safe.",
    exportLarge: "The backup is too large for this file format or contains unsupported data. Your stored data has been kept.",
    invalid: "This file is not a supported backup or is too large (up to 100 MB per ZIP file, JSON: 16 MB). Nothing was imported.",
    failed: "The backup could not be processed. Please check available storage and try again.",
    draft: "Please save unfinished memories, including selected photos, or cancel editing before importing.",
    imported: (e, f, c, p) => e === 0 && f === 0 && p === 0 ? "Everything in this backup is already present. No duplicate entries were added." : `Import complete: ${e} ${e === 1 ? "memory" : "memories"} and ${f} ${f === 1 ? "favourite" : "favourites"} added.${p ? ` ${p} private outing ${p === 1 ? "plan" : "plans"} added.` : ""}${c ? " Different versions were kept as additional memories." : ""}`
  },
  da: {
    title: "Sikkerhedskopi af minder og favoritter", brief: "Gem minder, billeder, favoritter og private planer sammen i én fil.", info: "Om sikkerhedskopiering", export: "Eksportér data", import: "Importér data",
    hint: "Eksisterende data bevares ved import. ZIP-sikkerhedskopier indeholder også gemte billeder og private kalenderplaner. Store sikkerhedskopier opdeles i nummererede dele. Gem alle delene sammen, og vælg dem samlet ved import. Tidligere JSON-sikkerhedskopier kan stadig importeres. Kladder og Plus-adgang er ikke med. Opbevar filen privat.",
    incomplete: "Vælg alle nummererede dele af den samme sikkerhedskopi samlet. Intet blev importeret.",
    parts: n => `Din sikkerhedskopi består af ${n} dele. Download hver del for sig, og opbevar alle filerne sammen.`,
    download: (n, total) => total === 1 ? "Download sikkerhedskopi" : `Download del ${n} af ${total}`,
    exported: "Sikkerhedskopien er klar til download. Opbevar den et sikkert sted.",
    exportLarge: "Sikkerhedskopien er for stor til dette filformat eller indeholder data, som ikke understøttes. Dine gemte data er bevaret.",
    invalid: "Filen er ikke en understøttet sikkerhedskopi eller er for stor (højst 100 MB pr. ZIP-fil, JSON: 16 MB). Intet blev importeret.",
    failed: "Sikkerhedskopien kunne ikke behandles. Kontrollér den ledige lagerplads, og prøv igen.",
    draft: "Gem ufærdige minder med de valgte billeder, eller annuller redigeringen før import.",
    imported: (e, f, c, p) => e === 0 && f === 0 && p === 0 ? "Alt i sikkerhedskopien findes allerede. Ingen dubletter blev tilføjet." : `Import afsluttet: ${e} ${e === 1 ? "minde" : "minder"} og ${f} ${f === 1 ? "favorit" : "favoritter"} tilføjet.${p ? ` ${p} private ${p === 1 ? "turplan" : "turplaner"} tilføjet.` : ""}${c ? " Forskellige versioner blev bevaret som ekstra minder." : ""}`
  }
};

export function initPersonalBackup({ afterImport, hasDraft, setBusy = () => {} }) {
  const host = document.querySelector("#daylog-section .filter-group");
  if (!host || document.getElementById("personal-backup")) return;
  const section = document.createElement("details"); section.id = "personal-backup"; section.className = "memory-backup";
  const summary = document.createElement("summary");
  const heading = document.createElement("span"); summary.append(heading);
  const body = document.createElement("div"); body.className = "memory-backup-body";
  const brief = document.createElement("p"); brief.className = "filter-group-helper"; brief.id = "personal-backup-hint";
  const help = document.createElement("details"); help.className = "memory-help";
  const helpTitle = document.createElement("summary");
  const hint = document.createElement("p"); hint.className = "filter-group-helper";
  help.append(helpTitle, hint);
  const row = document.createElement("div"); row.className = "memory-backup-actions";
  const exportButton = document.createElement("button"), importButton = document.createElement("button");
  for (const button of [exportButton, importButton]) {
    button.type = "button"; button.className = "btn-ghost btn-small";
    button.style.cssText = "min-height:44px;max-width:100%;white-space:normal";
    button.setAttribute("aria-describedby", brief.id);
  }
  exportButton.id = "personal-backup-export"; importButton.id = "personal-backup-import";
  const input = document.createElement("input"); input.type = "file"; input.accept = ".zip,.json,application/zip,application/json"; input.hidden = true; input.multiple = true;
  const status = document.createElement("p"); status.id = "personal-backup-status"; status.setAttribute("role", "status"); status.setAttribute("aria-atomic", "true"); status.className = "filter-group-helper"; status.style.margin = "0";
  status.hidden = true;
  const downloads = document.createElement("div"); downloads.className = "memory-backup-downloads"; downloads.hidden = true;
  row.append(exportButton, importButton); body.append(brief, row, help, input, downloads, status); section.append(summary, body); host.append(section);
  const language = () => copy[document.documentElement.lang] || copy.de;
  let statusKey = null, counts = null, downloadLinks = [];
  const clearDownloads = () => { for (const link of downloadLinks) URL.revokeObjectURL(link.href); downloadLinks = []; downloads.replaceChildren(); downloads.hidden = true; };
  window.addEventListener("pagehide", event => { if (!event.persisted) clearDownloads(); });
  const translate = () => {
    const t = language(); heading.textContent = t.title; brief.textContent = t.brief; hint.textContent = t.hint; helpTitle.textContent = t.info;
    exportButton.textContent = t.export; importButton.textContent = t.import;
    downloadLinks.forEach((link, index) => { link.textContent = t.download(index + 1, downloadLinks.length); });
    if (statusKey) status.textContent = statusKey === "imported" ? t.imported(counts.entries, counts.favorites, counts.conflicts, counts.calendar || 0) : statusKey === "parts" ? t.parts(downloadLinks.length) : t[statusKey];
  };
  const announce = key => { section.open = true; statusKey = key; status.hidden = false; translate(); };
  const busy = value => { setBusy(value); exportButton.disabled = importButton.disabled = value; section.setAttribute("aria-busy", String(value)); };
  const restoreFocus = button => {
    if (document.activeElement === document.body || document.activeElement === input) button.focus({ preventScroll: true });
  };
  input.addEventListener("cancel", () => restoreFocus(importButton));
  translate(); new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  exportButton.addEventListener("click", async () => {
    busy(true);
    try {
      const archives = await exportPersonalArchives();
      clearDownloads();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      for (const [index, archive] of archives.entries()) {
        const link = document.createElement("a"); link.href = URL.createObjectURL(archive);
        link.download = `family-spots-sicherung-${stamp}${archives.length > 1 ? `-teil-${String(index + 1).padStart(3, "0")}-von-${String(archives.length).padStart(3, "0")}` : ""}.zip`;
        link.className = "btn-ghost btn-small"; link.style.cssText = "display:block;min-height:44px;white-space:normal;overflow-wrap:anywhere";
        downloadLinks.push(link); downloads.append(link);
      }
      downloads.hidden = false;
      if (archives.length === 1) { downloadLinks[0].click(); announce("exported"); }
      else announce("parts");
    } catch (error) { announce(error.code === "invalid_backup" ? "exportLarge" : "failed"); }
    finally { busy(false); restoreFocus(exportButton); }
  });
  importButton.addEventListener("click", () => {
    if (hasDraft()) { announce("draft"); return; }
    input.value = ""; input.click();
  });
  input.addEventListener("change", async () => {
    const files = Array.from(input.files || []); if (!files.length) return;
    if (hasDraft()) { announce("draft"); input.value = ""; return; }
    busy(true);
    try {
      const result = await importPersonalFiles(files, () => !hasDraft());
      counts = result.counts; announce("imported");
      await afterImport();
    } catch (error) { announce(error.code === "draft" ? "draft" : error.code === "incomplete_backup" ? "incomplete" : error.code === "invalid_backup" ? "invalid" : "failed"); }
    finally { input.value = ""; busy(false); restoreFocus(importButton); }
  });
}
