// One readable description for the filter card, result list and empty state.
// The values describe effective constraints; a requested inactive radius is explicit.
import { describeCategorySelection } from "../filter-model.js";
const COPY = {
 de: { search: "Suche", radius: "Radius", pending: "noch nicht aktiv – Standort fehlt", straight: "Luftlinie", category: "Kategorie", age: "Alter", tags: "Weitere Filter", mood: "Thema", travel: "Unterwegs", favorites: "Nur Favoriten", verified: "Mit geprüften Infos", big: "Große Abenteuer", or: " oder " },
 en: { search: "Search", radius: "Radius", pending: "not active yet – location unavailable", straight: "straight-line distance", category: "Category", age: "Age", tags: "Other filters", mood: "Theme", travel: "Travel", favorites: "Favourites only", verified: "With checked information", big: "Big adventures", or: " or " },
 da: { search: "Søgning", radius: "Radius", pending: "endnu ikke aktiv – position mangler", straight: "i fugleflugtslinje", category: "Kategori", age: "Alder", tags: "Andre filtre", mood: "Tema", travel: "På tur", favorites: "Kun favoritter", verified: "Med tjekkede oplysninger", big: "Store eventyr", or: " eller " }
};
export function describeFilters(state = {}, lang = "de") {
 const t = COPY[lang] || COPY.de, parts = [];
 const search = String(state.search || "").trim();
 if (search) parts.push(`${t.search}: „${search}“`);
 parts.push(...describeCategorySelection(state.categoryState, lang));
 if (state.legacyCategory) parts.push(`${t.category}: ${state.legacyCategory}`);
 if (state.age) parts.push(`${t.age}: ${state.age}`);
 if (state.mood) parts.push(`${t.mood}: ${state.mood}`);
 if (state.travel) parts.push(`${t.travel}: ${state.travel}`);
 if (state.tags?.length) parts.push(`${t.tags}: ${state.tags.join(t.or)}`);
 if (state.favorites) parts.push(t.favorites);
 if (state.verified) parts.push(t.verified);
 if (state.big) parts.push(t.big);
 if (Number.isFinite(state.radiusKm)) {
   parts.push(`${t.radius}: ${state.radiusKm} km ${state.hasLocation ? t.straight : `(${t.pending})`}`);
 }
 return parts;
}
