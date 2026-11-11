import { filsoe, filsoeSketch } from "./filsoe-tour.js";
import { trackPoints } from "./stroebeck-track.js";

const photo = "assets/spots/schachplatz-stroebeck/schachplatz.webp";
const source = "https://www.strava.com/routes/3247495945863738730";
const credit = '<a href="https://commons.wikimedia.org/wiki/File:Schachplatz_(Str%C3%B6beck)_P1130227.jpg">Goldmull / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>';
const icons = {
  external: '<path d="M13 5h6v6m0-6-9 9m7-1v6H5V7h6"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-12 12m-2 2 9-9"/>',
  cup: '<path d="M4 7h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V7Zm12 1h2a2 2 0 0 1 0 4h-2M3 21h17"/>',
  bike: '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 4-8 5 8H5m9 0 3-10h2M7 9h5"/>',
  tent: '<path d="M3 20 12 4l9 16H3Zm6 0 3-6 3 6"/>',
  pin: '<path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  hills: '<path d="m2 19 7-10 4 5 3-8 6 13H2Z"/>',
  route: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h8"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};
const icon = name => `<svg class="cycle-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
const elevation = { de: "Ca. 123 hm", en: "Approx. 123 m ascent", da: "Ca. 123 højdemeter" };
// Curated places in riding order. Source links stay available independently of the GPX.
export const schachplatzNearbyStops = {
  park: {
    icon: "leaf",
    title: "Europapark Ströbeck",
    url: "https://www.halberstadt.de/de/wichtige-orte-und-sehenswuerdigkeiten/europapark.html",
    text: {
      de: "Bäume aus Europas Kulturdörfern entdecken · ca. 200 m vom Schachplatz",
      en: "Discover trees representing European cultural villages · approx. 200 m from the chess square",
      da: "Oplev træer fra Europas kulturlandsbyer · ca. 200 m fra skakpladsen",
    },
  },
  cafe: {
    icon: "cup",
    title: "Hofcafé Gut Mahndorf",
    url: "https://www.gut-mahndorf.de/hofcafe/",
    text: {
      de: "Hausgebackener Kuchen auf dem Rückweg · Öffnungszeiten beim Hofcafé",
      en: "Homemade cake on the way back · check opening times with the café",
      da: "Hjemmebagt kage på vejen tilbage · se caféens åbningstider",
    },
  },
};
const copy = {
  de: ["Radtouren & Bikepacking", "Entdeckt Ausflugsziele entlang eurer nächsten Radtour.", "Familienradtouren", "Bikepacking", "Deutschland", "Dänemark", "Mit dem Rad ins Schachdorf", "Ca. 23 km · Rundtour", "Von Halberstadt nach Ströbeck und zurück.", "Hier sind noch keine Touren eingetragen.", "Zur Übersicht", "Streckenskizze", "Unterwegs entdecken", "Optionaler Stopp in Ströbeck", "Originalroute ansehen", "Veranstaltungsstrecke von 2025 · ProSport Harz", "Schließen", "Bildzuschnitt"],
  en: ["Cycle tours & bikepacking", "Discover places to visit along your next ride.", "Family rides", "Bikepacking", "Germany", "Denmark", "Ride to the chess village", "Approx. 23 km · Loop", "From Halberstadt to Ströbeck and back.", "There are no rides listed here yet.", "Back to tours", "Route outline", "Discover along the way", "Optional stop in Ströbeck", "View original route", "2025 event route · ProSport Harz", "Close", "Cropped photo"],
  da: ["Cykelture og bikepacking", "Find steder at besøge på jeres næste cykeltur.", "Familiecykelture", "Bikepacking", "Tyskland", "Danmark", "På cykel til skaklandsbyen", "Ca. 23 km · Rundtur", "Fra Halberstadt til Ströbeck og tilbage.", "Der er endnu ingen ture her.", "Tilbage til oversigten", "Ruteskitse", "Oplev undervejs", "Valgfrit stop i Ströbeck", "Se den originale rute", "Eventrute fra 2025 · ProSport Harz", "Luk", "Beskåret foto"],
};

export function initCycleTours({ getLanguage, closeMenu, openStop, onBackToOverview }) {
  const trigger = document.getElementById("btn-cycle-tours");
  if (!trigger) return;
  const dialog = document.createElement("dialog");
  dialog.className = "fsm-cycle-tours";
  dialog.setAttribute("aria-labelledby", "cycle-tours-heading");
  document.body.append(dialog);
  let type = "family";
  let country = "DE";
  let detail = false;
  function render(focusTarget) {
    const [title, intro, family, bikepacking, germany, denmark, name, metrics, description, empty, back, outline, discover, stopHint, original, provenance, close, crop] = copy[getLanguage()] || copy.de;
    const filters = '<div class="cycle-filters">' +
      [["family", family], ["bike", bikepacking]].map(([value, label]) =>
        `<button type="button" data-type="${value}" aria-pressed="${type === value}">${icon(value === "family" ? "bike" : "tent")}${label}</button>`).join("") +
      [["DE", germany], ["DK", denmark]].map(([value, label]) =>
        `<button type="button" data-country="${value}" aria-pressed="${country === value}">${icon("pin")}${label}</button>`).join("") +
      "</div>";
    const row = `<button type="button" class="cycle-card" data-detail>
      <img src="${photo}" alt="" width="470" height="470">
      <span><strong>${name}</strong><small>${metrics}</small><span>${description}</span><em>${family}</em></span>
      <span aria-hidden="true">›</span>
    </button><p class="cycle-credit">${credit} · ${crop}</p>`;
    const route = `<button class="cycle-back" type="button" data-back>‹ ${back}</button>
      <h2 id="cycle-tours-heading" tabindex="-1">${icon("bike")}<span>${name}</span></h2>
      <div class="cycle-meta"><span>${icon("route")}${metrics}</span><span>${icon("hills")}${elevation[getLanguage()] || elevation.de}</span></div>
      <figure class="cycle-map-frame">
        <figcaption>${outline}</figcaption>
        <svg class="cycle-map" viewBox="0 0 480 240" role="img" aria-label="${outline} · Halberstadt · Ströbeck">
          <path class="cycle-sketch-green" d="M0 48Q22 28 43 41T87 36Q110 26 126 45T172 63Q189 75 165 86T115 95Q96 105 77 86T30 92Q11 99 0 89ZM315 0H425Q433 11 411 23T376 38Q355 45 347 29T315 20ZM480 65V130Q462 139 447 126T440 95Q445 76 480 65ZM0 177Q23 159 41 178T77 183Q98 191 82 205T54 216Q32 225 39 240H0ZM150 240Q140 219 155 205T187 212Q202 214 209 240ZM335 240Q331 221 348 215T366 199Q373 182 397 191T425 211Q441 220 459 204T480 196V240ZM223 131Q228 111 246 119T267 113Q279 103 290 119T283 145Q270 154 273 170T245 175Q229 166 214 161T223 131Z"/>
          <path class="cycle-sketch-road" d="M-10 62Q32 58 63 114T149 178Q179 186 183 246M473 12Q403 44 367 82T317 147Q295 173 292 246"/>
          <path class="cycle-sketch-water" d="M284 -5Q248 24 229 53T177 89Q150 101 128 143T79 198Q61 219 54 246M470 79Q441 87 410 107T351 144Q323 161 300 186T263 246"/>
          <polyline points="${trackPoints.map(([x, y]) => `${x + 47},${y * 0.64 + 25}`).join(" ")}" />
        </svg>
        <span class="cycle-sketch-start" style="left:${(trackPoints[0][0] + 47) / 4.8}%;top:${(trackPoints[0][1] * 0.64 + 25) / 2.4}%">
          <span class="cycle-map-number-badge">1</span><span class="cycle-map-place">Halberstadt</span>
        </span>
        <button class="cycle-map-stop-button" type="button" data-stop aria-label="Platz am Schachspiel · Ströbeck">
          <span class="cycle-map-number-badge">2</span><span class="cycle-map-place">Ströbeck</span>
        </button>
      </figure>
      <h3>${icon("pin")}${discover}</h3>
      <button type="button" class="cycle-stop" data-stop><img src="${photo}" alt="" width="470" height="470"><span><strong>Platz am Schachspiel</strong><small>${stopHint}</small></span><span aria-hidden="true">›</span></button>
      ${Object.values(schachplatzNearbyStops).map(stop => `<a class="cycle-stop cycle-nearby" href="${stop.url}" target="_blank" rel="noopener noreferrer">${icon(stop.icon)}<span><strong>${stop.title}</strong><small>${stop.text[getLanguage()] || stop.text.de}</small></span>${icon("external")}</a>`).join("")}
      <a class="cycle-action" href="${source}" target="_blank" rel="noopener noreferrer">${icon("route")}${original}${icon("external")}</a>
      <p class="cycle-credit">${provenance} · OpenStreetMap contributors</p>`;
    const isDenmark = country === "DK";
    const language = getLanguage();
    const [filsoeName, filsoeMetrics, filsoeDescription, difficulty, terrain, download, viewRoute] = filsoe.copy[language] || filsoe.copy.de;
    const photoCredit = `<a href="${filsoe.photoSource}" target="_blank" rel="noopener noreferrer">Mipani / Wikimedia Commons · CC0</a>`;
    const filsoeRow = `<button type="button" class="cycle-card" data-detail>
      <img src="${filsoe.photo}" alt="" width="960" height="540">
      <span><strong>${filsoeName}</strong><small>${filsoeMetrics}</small><span>${filsoeDescription}</span><em>${family}</em></span>
      <span aria-hidden="true">›</span>
    </button><p class="cycle-credit">${photoCredit}</p>`;
    const filsoeRoute = `<button class="cycle-back" type="button" data-back>‹ ${back}</button>
      <h2 id="cycle-tours-heading" tabindex="-1">${icon("bike")}<span>${filsoeName}</span></h2>
      <div class="cycle-meta"><span>${icon("route")}${filsoeMetrics}</span><span>${icon("hills")}${difficulty}</span></div>
      ${filsoeSketch(outline)}
      <p class="cycle-terrain">${terrain}</p>
      <h3>${icon("pin")}${discover}</h3>
      ${filsoe.stops.map(stop => `<a class="cycle-stop cycle-nearby" href="${stop.url}" target="_blank" rel="noopener noreferrer">${icon(stop.icon)}<span><strong>${stop.title}</strong><small>${stop.text[language] || stop.text.de}</small></span>${icon("external")}</a>`).join("")}
      <a class="cycle-action" href="${filsoe.source}" target="_blank" rel="noopener noreferrer">${icon("route")}${viewRoute}${icon("external")}</a>
      <p class="cycle-credit"><a href="${filsoe.gpx}">${download}</a> · Varde Kommune / <a href="https://www.geodanmark.dk/home/vejledninger/vilkaar-for-data-anvendelse/">GeoDanmark, GeoFA · CC BY 4.0</a></p>`;
    dialog.innerHTML = `<header><span>Family Spots Map</span><button type="button" aria-label="${close}" data-close>${icon("close")}</button></header><div class="cycle-content">${detail ? (isDenmark ? filsoeRoute : route) :
      `<h2 id="cycle-tours-heading" tabindex="-1">${icon("bike")}<span>${title}</span></h2><p>${intro}</p>${filters}${type === "family" ? (isDenmark ? filsoeRow : row) : `<p class="cycle-empty">${empty}</p>`}`}</div>`;
    dialog.querySelector(".cycle-content").scrollTop = 0;
    if (focusTarget) dialog.querySelector(focusTarget)?.focus({ preventScroll: true });
  }

  function openTourDetail(selectedCountry = "DE") {
    country = selectedCountry === "DK" ? "DK" : "DE";
    type = "family";
    detail = true;
    render();
    dialog.showModal();
    dialog.querySelector("#cycle-tours-heading")?.focus({ preventScroll: true });
  }
  dialog.addEventListener("close", () => {
    if (!document.activeElement || document.activeElement === document.body) document.getElementById("menu-toggle")?.focus({preventScroll: true});
  });
  dialog.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-close")) dialog.close();
    if (button.dataset.type) {
      type = button.dataset.type;
      render(`[data-type="${type}"]`);
    }
    if (button.dataset.country) {
      country = button.dataset.country;
      render(`[data-country="${country}"]`);
    }
    if (button.hasAttribute("data-detail")) {
      detail = true;
      render("#cycle-tours-heading");
    }
    if (button.hasAttribute("data-back")) {
      dialog.close();
      onBackToOverview?.();
    }
    if (button.hasAttribute("data-stop") && openStop(() => dialog.close())) return;
  });
  return { openTourDetail };
}
