// Verbindlicher Family-Spots-Map-Navigationsvertrag.
// Alle vier Oberflächen verwenden diese Reihenfolge und dieselben Texte.
export const NAV_ORDER = Object.freeze(["map", "filters", "spots", "diary", "plus"]);
export const NAV_COPY = Object.freeze({
  de: Object.freeze({nav:"Hauptnavigation",map:"Karte",filters:"Filter",spots:"Spots",diary:"Mein Tag",plus:"Spots Plus"}),
  en: Object.freeze({nav:"Main navigation",map:"Map",filters:"Filters",spots:"Spots",diary:"My day",plus:"Spots Plus"}),
  da: Object.freeze({nav:"Hovednavigation",map:"Kort",filters:"Filtre",spots:"Spots",diary:"Min dag",plus:"Spots Plus"})
});
export function navCopy(locale = "de") {
  return NAV_COPY[String(locale).slice(0, 2)] || NAV_COPY.de;
}
