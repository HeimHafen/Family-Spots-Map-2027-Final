// A separate draft per browser tab. sessionStorage survives a reload without
// letting another tab replace the user's unfinished text.
const KEY = "fs_daylog_drafts_v1";

export function readDaylogDrafts() {
  const raw = sessionStorage.getItem(KEY);
  if (raw === null) return { newText: "", edits: [] };
  const payload = JSON.parse(raw);
  if (payload?.version !== 1 || typeof payload.newText !== "string" || !Array.isArray(payload.edits)) {
    throw new Error("invalid_daylog_drafts");
  }
  const ids = new Set();
  for (const edit of payload.edits) {
    if (!edit || typeof edit.id !== "string" || !edit.id || ids.has(edit.id) ||
        typeof edit.text !== "string" || edit.base?.id !== edit.id ||
        typeof edit.base.text !== "string" || !Number.isFinite(edit.base.ts) ||
        !Number.isFinite(new Date(edit.base.ts).getTime()) ||
        (edit.base.updatedTs !== undefined && !Number.isFinite(edit.base.updatedTs))) {
      throw new Error("invalid_daylog_draft_entry");
    }
    ids.add(edit.id);
  }
  return payload;
}

export function writeDaylogDrafts(newText, drafts, bases, conflicts) {
  const edits = [...drafts].map(([id, text]) => ({ id, text, base: bases.get(id), conflict: conflicts.has(id) }));
  if (!newText && !edits.length) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, JSON.stringify({ version: 1, newText, edits }));
}
