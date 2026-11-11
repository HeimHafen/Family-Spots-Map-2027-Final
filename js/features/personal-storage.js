// Transactional personal data for tabs sharing the same browser storage.
// Existing localStorage data is imported on first write and mirrored after
// changes, retaining the previous data format for export and rollback.
import { DAYLOG_STORAGE_KEY } from "../config.js";
import { PRIVATE_CALENDAR_KEY, validatedPrivateCalendar, mergePrivateCalendars } from "./calendar-backup.js";
const FAVORITES_KEY = "fs_favorites";
let databasePromise = null;

function database() {
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("family-spots-personal-coordination", 1);
    let cancelled = false;
    const timer = setTimeout(() => { cancelled = true; reject(new Error("personal_storage_timeout")); }, 5000);
    request.onupgradeneeded = () => request.result.createObjectStore("gate");
    request.onerror = () => { clearTimeout(timer); reject(request.error); };
    request.onblocked = () => { cancelled = true; clearTimeout(timer); reject(new Error("personal_storage_blocked")); };
    request.onsuccess = () => {
      clearTimeout(timer);
      const db = request.result;
      if (cancelled) { db.close(); return; }
      db.onversionchange = () => { db.close(); databasePromise = null; };
      resolve(db);
    };
  }).catch(error => { databasePromise = null; throw error; });
  return databasePromise;
}

function legacyPayload(key) {
  const raw = localStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}
function favoritesFrom(value) {
  if (value !== null && !Array.isArray(value)) throw new Error("invalid_favorites");
  return new Set((value || []).filter(id =>
    (typeof id === "string" && id.trim()) || (typeof id === "number" && Number.isFinite(id))
  ).map(String));
}
export function photoIds(entry) {
  const photos = entry?.photos ?? [];
  if (!Array.isArray(photos) || photos.length > 3 || new Set(photos).size !== photos.length || photos.some(id => typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id))) throw new Error("invalid_memory_photos");
  return photos;
}
function daylogFrom(value) {
  const entries = value === null ? [] : Array.isArray(value) ? value
    : Array.isArray(value?.entries) ? value.entries : typeof value?.text === "string" ? [value] : null;
  if (!entries) throw new Error("invalid_daylog");
  const ids = new Set();
  return entries.filter(entry => entry && typeof entry.text === "string" && (entry.text.trim() || photoIds(entry).length)).map((entry, index) => {
    const ts = Number.isFinite(entry.ts) && Number.isFinite(new Date(entry.ts).getTime()) ? entry.ts : Date.now();
    const base = String(entry.id ?? (Number.isFinite(entry.ts) ? entry.ts : `legacy-entry-${index}`));
    let id = base, suffix = 0;
    while (ids.has(id)) id = `${base}-legacy-${index}-${++suffix}`;
    ids.add(id);
    return { id, text: entry.text.trim(), ts,
      ...(photoIds(entry).length ? { photos: photoIds(entry).slice() } : {}),
      ...(Number.isFinite(entry.updatedTs) && Number.isFinite(new Date(entry.updatedTs).getTime()) ? { updatedTs: entry.updatedTs } : {}) };
  });
}

async function transaction(key, transform) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("gate", transform ? "readwrite" : "readonly");
    const store = tx.objectStore("gate"), request = store.get(key);
    let result, error, previousRaw, writtenRaw, mirrored = false;
    request.onsuccess = () => {
      try {
        const value = request.result === undefined ? legacyPayload(key) : request.result;
        if (!transform) { result = value; return; }
        const next = transform(value, store);
        result = next.result;
        previousRaw = localStorage.getItem(key);
        writtenRaw = JSON.stringify(next.value);
        // If the old storage cannot be updated, report failure and keep the DB
        // unchanged too. Never silently erase a corrupt legacy payload.
        localStorage.setItem(key, writtenRaw);
        mirrored = true;
        store.put(next.value, key);
      } catch (caught) { error = caught; tx.abort(); }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () => {
      if (mirrored) {
        try {
          if (localStorage.getItem(key) === writtenRaw) {
            if (previousRaw === null) localStorage.removeItem(key);
            else localStorage.setItem(key, previousRaw);
          }
        } catch { /* The database still retains the last committed data. */ }
      }
      reject(error || tx.error || new Error("personal_storage_failed"));
    };
  });
}

export async function readFavorites() {
  let value;
  try { value = await transaction(FAVORITES_KEY); }
  catch { value = legacyPayload(FAVORITES_KEY); } // Viewing remains possible if IndexedDB is unavailable.
  return favoritesFrom(value);
}
export async function readDaylogEntries() {
  let value;
  try { value = await transaction(DAYLOG_STORAGE_KEY); }
  catch { value = legacyPayload(DAYLOG_STORAGE_KEY); }
  return daylogFrom(value);
}
export function changeFavorite(id, selected, normalize = ids => ids) {
  return transaction(FAVORITES_KEY, value => {
    if (typeof selected !== "boolean" || !((typeof id === "string" && id.trim()) || (typeof id === "number" && Number.isFinite(id)))) throw new Error("invalid_favorite_operation");
    const next = normalize(favoritesFrom(value));
    if (selected) next.add(String(id)); else next.delete(String(id));
    return { value: [...next], result: next };
  });
}
function conflict() { const error = new Error("personal_conflict"); error.code = "personal_conflict"; return error; }
const isPhotoBlob = blob => blob instanceof Blob && blob.type === "image/jpeg" &&
  blob.size > 0 && blob.size <= 1024 * 1024;

function storedPhotoBlob(value) {
  if (isPhotoBlob(value)) return value;
  if (value instanceof ArrayBuffer && value.byteLength > 0 && value.byteLength <= 1024 * 1024) {
    return new Blob([value], { type: "image/jpeg" });
  }
  return null;
}

export async function changeDaylog(operation) {
  // Read bytes before opening the transaction so Safari can commit photo data
  // without depending on IndexedDB's Blob storage implementation.
  const mediaBytes = new Map();
  for (const { id, blob } of operation.media || []) {
    if (!isPhotoBlob(blob)) throw new Error("missing_memory_photo");
    mediaBytes.set(id, await blob.arrayBuffer());
  }
  return transaction(DAYLOG_STORAGE_KEY, (value, store) => {
    if (!["add", "edit", "delete"].includes(operation.type) || typeof operation.id !== "string" || !operation.id.trim()) throw new Error("invalid_daylog_operation");
    if (operation.type === "add" && (!operation.entry || operation.entry.id !== operation.id || typeof operation.entry.text !== "string" || (!operation.entry.text.trim() && !photoIds(operation.entry).length) || !Number.isFinite(operation.entry.ts) || !Number.isFinite(new Date(operation.entry.ts).getTime()))) throw new Error("invalid_daylog_entry");
    if (operation.type === "edit" && (typeof operation.text !== "string" || (!operation.text.trim() && !photoIds(operation).length))) throw new Error("invalid_daylog_text");
    const entries = daylogFrom(value), index = entries.findIndex(entry => entry.id === operation.id);
    const oldPhotos = index < 0 ? [] : photoIds(entries[index]);
    if (operation.type === "add") {
      if (index >= 0) throw conflict();
      entries.push({ ...operation.entry, text: operation.entry.text.trim() });
    } else if (index < 0) {
      if (operation.type !== "delete") throw conflict();
    } else {
      const current = entries[index], expected = operation.expected;
      if (!expected || current.text !== expected.text || current.updatedTs !== expected.updatedTs || JSON.stringify(photoIds(current)) !== JSON.stringify(photoIds(expected))) throw conflict();
      if (operation.type === "delete") entries.splice(index, 1);
      else if (operation.type === "edit") entries[index] = { ...current, text: operation.text.trim(), photos: photoIds(operation).slice(), updatedTs: Math.max(Date.now(), (current.updatedTs || 0) + 1) };
      else throw new Error("invalid_daylog_operation");
    }
    const selected = operation.type === "delete" ? [] : photoIds(entries.find(entry => entry.id === operation.id));
    for (const id of selected) {
      const bytes = mediaBytes.get(id);
      if (!bytes) throw new Error("missing_memory_photo");
      store.put(bytes, `photo:${id}`);
    }
    const retained = new Set(entries.flatMap(photoIds));
    for (const id of oldPhotos) if (!retained.has(id)) store.delete(`photo:${id}`);
    // Clear the committed photo draft in the same transaction as the memory.
    if (operation.photoDraftKey && operation.photoDraftSlot) {
      const request = store.get(operation.photoDraftKey);
      request.onsuccess = () => {
        try {
          const draft = request.result;
          if (draft?.slots) {
            delete draft.slots[operation.photoDraftSlot];
            if (hasPhotoDraftState(draft)) store.put(draft, operation.photoDraftKey);
            else store.delete(operation.photoDraftKey);
          }
        } catch { store.transaction.abort(); }
      };
    }
    return { value: { entries }, result: entries };
  });
}

// A backup/import reads both stores under the same gate transaction. Imports
// merge both datasets in one commit, including rollback of the legacy mirrors.
export async function personalSnapshot(imported = null) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("gate", imported ? "readwrite" : "readonly");
    const store = tx.objectStore("gate");
    const keys = [FAVORITES_KEY, DAYLOG_STORAGE_KEY, PRIVATE_CALENDAR_KEY];
    const values = [], mirrors = [];
    let remaining = keys.length, result, error;
    keys.forEach((key, index) => {
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          // Calendar is still written directly by the existing planner, so its
          // localStorage value must take precedence over an older DB mirror.
          values[index] = key === PRIVATE_CALENDAR_KEY ? legacyPayload(key) :
            request.result === undefined ? legacyPayload(key) : request.result;
          if (--remaining) return;
          const favorites = favoritesFrom(values[0]);
          const entries = daylogFrom(values[1]);
          const calendar = validatedPrivateCalendar(values[2]);
          let effectiveCalendar = calendar;
          const counts = { favorites: 0, entries: 0, conflicts: 0, calendar: 0, calendarConflicts: 0 };
          if (imported) {
            for (const id of imported.favorites) if (!favorites.has(id)) { favorites.add(id); counts.favorites++; }
            const ids = new Set(entries.map(entry => entry.id));
            const signature = entry => JSON.stringify([entry.ts, entry.text, photoIds(entry)]);
            const seen = new Set(entries.map(signature));
            for (const entry of imported.entries) {
              if (seen.has(signature(entry))) continue;
              let id = entry.id, suffix = 0;
              if (ids.has(id)) {
                counts.conflicts++;
                do { id = `${entry.id.slice(0, 480)}-import-${++suffix}`; } while (ids.has(id));
              }
              entries.push({ ...entry, id }); ids.add(id); seen.add(signature(entry)); counts.entries++;
            }
            const next = [[...favorites], { entries }];
            if (Array.isArray(imported.calendar)) {
              const merged = mergePrivateCalendars(calendar, imported.calendar);
              next[2] = merged.plans;
              effectiveCalendar = merged.plans;
              counts.calendar = merged.added;
              counts.calendarConflicts = merged.conflicts;
            }
            // All writes are synchronous inside the transaction callback. No
            // other gate writer can change either dataset until commit/abort.
            keys.forEach((key, i) => {
              if (next[i] === undefined) return; // Old backups must not touch the calendar.
              const previous = localStorage.getItem(key), written = JSON.stringify(next[i]);
              localStorage.setItem(key, written);
              mirrors.push({ key, previous, written });
              store.put(next[i], key);
            });
          }
          const photos = {};
          const used = new Set(entries.flatMap(photoIds));
          if (imported) {
            for (const id of imported.entries.flatMap(photoIds)) {
              const blob = imported.photos?.[id];
              if (!(blob instanceof Blob) || blob.type !== "image/jpeg" || !blob.size || blob.size > 1024 * 1024) throw new Error("missing_memory_photo");
              store.put(blob, `photo:${id}`);
            }
          }
          result = { favorites: [...favorites], entries, calendar: effectiveCalendar, counts, photos };
          for (const id of used) {
            const request = store.get(`photo:${id}`);
            request.onsuccess = () => {
              const blob = storedPhotoBlob(request.result);
              if (!blob) { error = new Error("missing_memory_photo"); tx.abort(); }
              else photos[id] = blob;
            };
          }
        } catch (caught) { error = caught; tx.abort(); }
      };
    });
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () => {
      for (const mirror of mirrors.reverse()) {
        try {
          if (localStorage.getItem(mirror.key) === mirror.written) {
            if (mirror.previous === null) localStorage.removeItem(mirror.key);
            else localStorage.setItem(mirror.key, mirror.previous);
          }
        } catch { /* Committed IndexedDB data is still retained. */ }
      }
      reject(error || tx.error || new Error("personal_storage_failed"));
    };
  });
}

// Photo blobs and per-tab photo drafts share the existing transaction gate.
// Only compact photo IDs enter the localStorage mirror, never image bytes.
export async function readPhoto(id) {
  if (!/^[a-f0-9]{64}$/.test(id)) throw new Error("invalid_memory_photo");
  const blob = storedPhotoBlob(await transaction(`photo:${id}`));
  if (!(blob instanceof Blob)) throw new Error("missing_memory_photo");
  return blob;
}
// Only discard a known, completely empty photo selection. Empty edit slots
// still mean that the user removed the original photos and must survive reload.
// Unknown shapes/fields are retained, so future or damaged data is never erased.
const isPlainPhotoDraftRecord = value => !!value && typeof value === "object" &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
export function hasPhotoDraftState(value) {
  if (!isPlainPhotoDraftRecord(value) || value.version !== 1 || !isPlainPhotoDraftRecord(value.slots) ||
      Object.keys(value).some(key => key !== "version" && key !== "slots")) return true;
  return Object.entries(value.slots).some(([key, slot]) => key !== "new" || !isPlainPhotoDraftRecord(slot) ||
    Object.keys(slot).some(field => field !== "ids" && field !== "media") ||
    !Array.isArray(slot.ids) || slot.ids.length > 0 || !Array.isArray(slot.media) || slot.media.length > 0);
}

export async function readPhotoDraft(key) {
  if (!key.startsWith("photo-draft:")) throw new Error("invalid_photo_draft");
  return transaction(key);
}
export async function writePhotoDraft(key, value) {
  if (!key.startsWith("photo-draft:")) throw new Error("invalid_photo_draft");
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("gate", "readwrite");
    const store = tx.objectStore("gate");
    if (hasPhotoDraftState(value)) store.put(value, key);
    else store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("photo_draft_failed"));
  });
}
