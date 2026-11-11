// Shared, versioned validation for private outing plans in personal ZIP backups.
// The calendar still stores plans locally under the original key. No remote sync.
export const PRIVATE_CALENDAR_KEY = "fsm-together-rc-private-v1";
const CATEGORIES = new Set(["camping", "sport", "nature", "family"]);
const bad = () => { const error = new Error("invalid_private_calendar"); error.code = "invalid_backup"; return error; };
const validDate = text => {
  if (typeof text !== "string" || !/^(\d{4})-(\d{2})-(\d{2})$/.test(text)) return false;
  const [, y, m, d] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const date = new Date(Date.UTC(+y, +m - 1, +d));
  return date.getUTCFullYear() === +y && date.getUTCMonth() === +m - 1 && date.getUTCDate() === +d;
};
export function validatedPrivateCalendar(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 300) throw bad();
  const seen = new Set();
  return value.map(plan => {
    if (!plan || typeof plan !== "object" || Array.isArray(plan) ||
      typeof plan.id !== "string" || !plan.id || plan.id.length > 512 || seen.has(plan.id) ||
      typeof plan.title !== "string" || !plan.title.trim() || plan.title.length > 150 ||
      !CATEGORIES.has(plan.category) || !validDate(plan.date) ||
      typeof plan.time !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(plan.time) ||
      (plan.spotId != null && (typeof plan.spotId !== "string" || plan.spotId.length > 256)) ||
      (plan.spotName != null && (typeof plan.spotName !== "string" || plan.spotName.length > 300)) ||
      (plan.note != null && (typeof plan.note !== "string" || plan.note.length > 1000)) ||
      (plan.yearly != null && typeof plan.yearly !== "boolean")) throw bad();
    seen.add(plan.id);
    return { id: plan.id, title: plan.title.trim(), category: plan.category,
      date: plan.date, time: plan.time, spotId: plan.spotId || "",
      spotName: plan.spotName || "", note: plan.note || "", yearly: plan.yearly === true };
  });
}
export function mergePrivateCalendars(existing, imported) {
  const merged = validatedPrivateCalendar(existing);
  const source = validatedPrivateCalendar(imported);
  const ids = new Set(merged.map(entry => entry.id));
  const signature = p => JSON.stringify([p.title,p.category,p.date,p.time,p.spotId,p.spotName,p.note,p.yearly]);
  const sigs = new Set(merged.map(signature));
  let added = 0, conflicts = 0;
  for (const plan of source) {
    if (sigs.has(signature(plan))) continue;
    let id = plan.id;
    if (ids.has(id)) {
      conflicts++;
      let suffix = 0;
      do { id = `${plan.id.slice(0, 475)}-import-${++suffix}`; } while (ids.has(id));
    }
    merged.push({ ...plan, id }); ids.add(id); sigs.add(signature(plan)); added++;
    if (merged.length > 300) throw bad(); // Fail before any writes; never drop existing plans.
  }
  return { plans: merged, added, conflicts };
}
