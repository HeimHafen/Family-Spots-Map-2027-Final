// src/services/memoryStore.js

export const memoryStore = {
  save(entry) {
    const entries = JSON.parse(localStorage.getItem("daylog") || "[]");
    entries.push({ text: entry, date: new Date().toISOString() });
    localStorage.setItem("daylog", JSON.stringify(entries));
  },
  random() {
    const entries = JSON.parse(localStorage.getItem("daylog") || "[]");
    if (!entries.length) return null;
    const idx = Math.floor(Math.random() * entries.length);
    return entries[idx];
  },
  all() {
    return JSON.parse(localStorage.getItem("daylog") || "[]");
  },
};