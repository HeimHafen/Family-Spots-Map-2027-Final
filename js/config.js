// js/config.js
// ------------------------------------------------------
// Family Spots Map – zentrale Konfiguration & Labels
// ------------------------------------------------------

"use strict";

/**
 * Sprachcodes, die die App unterstützt.
 * @typedef {"de" | "en" | "da"} LangCode
 */

/**
 * Konfiguration für Feature-Flags.
 * Alle Flags sind read-only und werden nur gelesen (nicht beschrieben).
 * @typedef {Object} FeaturesConfig
 * @property {boolean} plus
 * @property {boolean} moodFilter
 * @property {boolean} travelMode
 * @property {boolean} bigAdventureFilter
 * @property {boolean} verifiedFilter
 * @property {boolean} favorites
 * @property {boolean} daylog
 * @property {boolean} playIdeas
 */

/**
 * Kategorie-Gruppen-Key (deutscher Gruppenname als interne ID).
 * @typedef {
 *  "Spiel & Bewegung" |
 *  "Tiere & Natur" |
 *  "Wasser & Schwimmen" |
 *  "Erlebnis & Freizeit" |
 *  "Wandern & Radfahren" |
 *  "Essen & Trinken" |
 *  "Lernen & Kultur" |
 *  "Praktisches" |
 *  "Unterwegs mit WoMo & Rad" |
 *  "Entspannung & Naturorte"
 * } CategoryGroupKey
 */

/**
 * Zugriffslevel für Kategorien.
 * @typedef {"free" | "subscription" | "addon"} CategoryAccessLevel
 */

/**
 * Zugriffsregel für eine einzelne Kategorie.
 * @typedef {Object} CategoryAccessRule
 * @property {CategoryAccessLevel} level
 * @property {string} [subscriptionId]
 * @property {string} [addonId]
 */

/**
 * Gesamtkonfiguration für Kategorie-Zugriff.
 * @typedef {Object} CategoryAccessConfig
 * @property {CategoryAccessLevel} defaultLevel
 * @property {Record<string, CategoryAccessRule>} perCategory
 */

/**
 * Subscription-Definition (z. B. Family Spots Plus).
 * @typedef {Object} SubscriptionConfig
 * @property {string} id
 * @property {"subscription"} type
 * @property {number|null} pricePerYear
 * @property {string} currency
 * @property {Record<LangCode, string>} label
 * @property {Record<LangCode, string>} shortLabel
 * @property {Record<LangCode, string>} description
 * @property {{id: string, label: Record<LangCode, string>}[]} benefits
 */

/**
 * Add-on-Definition (z. B. Wasser & Baden).
 * @typedef {Object} AddonConfig
 * @property {string} id
 * @property {"addon"} type
 * @property {string} requiresSubscriptionId
 * @property {number|null} pricePerYear
 * @property {string} currency
 * @property {Record<LangCode, string>} label
 * @property {Record<LangCode, string>} description
 * @property {string[]} categories
 */

/**
 * Filterchip-Konfiguration.
 * @typedef {Object} FilterConfig
 * @property {string} id
 * @property {string[]} tags
 * @property {Record<LangCode, string>} label
 */

// ------------------------------------------------------
// Map & Storage Keys
// ------------------------------------------------------

export const DEFAULT_MAP_CENTER = [52.4, 9.7];
export const DEFAULT_MAP_ZOOM = 7;

export const PLUS_STORAGE_KEY = "fs_plus_active";
export const DAYLOG_STORAGE_KEY = "fs_daylog_last";
export const SPOTS_CACHE_KEY = "fs_spots_cache_v1";

// ------------------------------------------------------
// Dev / Demo-Konfiguration
// ------------------------------------------------------

/**
 * Aktiviert einen erzwungenen Plus-Modus für Entwicklung & Demos.
 *
 * Wenn true, behandelt die App Family Spots Plus so,
 * als wäre es dauerhaft aktiv – unabhängig vom gespeicherten Status.
 *
 * WICHTIG:
 *  - In Produktion MUSS dieser Wert false sein.
 *  - Dieser Wert wird ausschließlich gelesen, niemals zur Laufzeit beschrieben.
 */
export const DEV_FORCE_PLUS = false;

// ------------------------------------------------------
// Sprachen & Theme
// ------------------------------------------------------

/** @type {LangCode} */
export const LANG_DE = "de";
/** @type {LangCode} */
export const LANG_EN = "en";
/** @type {LangCode} */
export const LANG_DA = "da";


// ------------------------------------------------------
// Radius / Marker-Limit
// ------------------------------------------------------

/** 0–4 → Radius in km, Infinity = kein Limit */
export const RADIUS_STEPS_KM = [1, 5, 15, 40, Infinity];

/** Maximale Marker-Anzahl für gute Performance */
export const MAX_MARKERS_RENDER = 500;

// ------------------------------------------------------
// Feature-Flags
// ------------------------------------------------------

/**
 * Feature-Flags zentral, damit man Funktionen gezielt deaktivieren kann.
 * Wichtig: Flags werden von app.js nur gelesen, nicht beschrieben.
 * @type {FeaturesConfig}
 */
export const FEATURES = Object.freeze({
  plus: true,
  moodFilter: true,
  travelMode: true,
  bigAdventureFilter: true,
  verifiedFilter: true,
  favorites: true,
  daylog: true,
  playIdeas: true
});

// ------------------------------------------------------
// Kategorien & Gruppen
// ------------------------------------------------------

/**
 * Kuratierte Hauptkategorien pro Gruppe.
 * Nur diese Slugs erscheinen als Kategorien in der UI.
 * Weitere Slugs bleiben über Labels/Tags technisch nutzbar (Legacy / Feintypen).
 *
 * @type {Record<CategoryGroupKey, string[]>}
 */
export const CATEGORY_GROUPS = {
  "Spiel & Bewegung": [
    "multifunktionsfeld",
    "spielplatz",
    "abenteuerspielplatz",
    "indoor-spielplatz",
    "waldspielplatz",
    "wasserspielplatz",
    "bewegungspark",
    "bolzplatz",
    "pumptrack",
    "skatepark",
    "verkehrsgarten"
  ],
  "Tiere & Natur": [
    "aquarium",
    "zoo",
    "tierpark",
    "wildpark",
    "bauernhof",
    "naturerlebnispfad"
    // "walderlebnisroute" als Feintyp via Tags/Label
  ],
  "Wasser & Schwimmen": [
    "schwimmbad",
    "badesee",
    "strand",
    "eisbahn",
    "rodelhuegel"
  ],
  "Erlebnis & Freizeit": [
    "freizeitpark",
    "trampolinpark",
    "kletterhalle",
    "kletterwald-hochseilgarten",
    "boulderpark",
    "minigolf"
    // hoehle / labyrinth / baumhaus etc. laufen über Tags auf Natur-/Wander-Kategorien
  ],
  "Wandern & Radfahren": ["wanderweg", "wanderweg-kinderwagen", "radweg-family"],
  "Essen & Trinken": [
    "familiencafe",
    "familien-restaurant"
    // "kinder-familiencafe" als Legacy-Slug/Label möglich
  ],
  "Lernen & Kultur": [
    "museum",
    "historischer-ort",
    "kinder-museum",
    "freilichtmuseum",
    "bibliothek"
    // "museum-kinder" / "kinder_museum" als Legacy-Slugs
  ],
  "Praktisches": ["oeffentliche-toilette", "wickelraum"],
  "Unterwegs mit WoMo & Rad": [
    "wohnmobil-parkplatz",
    "stellplatz-spielplatz-naehe-kostenlos",
    "wohnmobil-service-station",
    "rastplatz-spielplatz-dusche",
    "bikepacking-spot",
    "campingplatz-familien"
  ],
  "Entspannung & Naturorte": [
    "natur-aussichtspunkt",
    "park-garten",
    "mitmachgarten",
    "picknickwiese"
    // "waldbaden-ort" als Tag-Feintyp
  ]
};

/**
 * Labels für Kategorie-Gruppen in verschiedenen Sprachen.
 * Key ist immer der deutsche Gruppenname.
 * @type {Record<LangCode, Record<CategoryGroupKey, string>>}
 */
export const CATEGORY_GROUP_LABELS = {
  de: {
    "Spiel & Bewegung": "Spiel & Bewegung",
    "Tiere & Natur": "Tiere & Natur",
    "Wasser & Schwimmen": "Wasser & Schwimmen",
    "Erlebnis & Freizeit": "Erlebnis & Freizeit",
    "Wandern & Radfahren": "Wandern & Radfahren",
    "Essen & Trinken": "Essen & Trinken",
    "Lernen & Kultur": "Lernen & Kultur",
    "Praktisches": "Praktisches",
    "Unterwegs mit WoMo & Rad": "Unterwegs mit WoMo & Rad",
    "Entspannung & Naturorte": "Entspannung & Naturorte"
  },
  en: {
    "Spiel & Bewegung": "Play & activity",
    "Tiere & Natur": "Animals & nature",
    "Wasser & Schwimmen": "Water & swimming",
    "Erlebnis & Freizeit": "Adventure & leisure",
    "Wandern & Radfahren": "Hiking & cycling",
    "Essen & Trinken": "Food & drinks",
    "Lernen & Kultur": "Learning & culture",
    "Praktisches": "Useful on your trip",
    "Unterwegs mit WoMo & Rad": "On the road (motorhome & bike)",
    "Entspannung & Naturorte": "Relaxation & nature"
  },
  da: {
    "Spiel & Bewegung": "Leg & bevægelse",
    "Tiere & Natur": "Dyr & natur",
    "Wasser & Schwimmen": "Vand & badning",
    "Erlebnis & Freizeit": "Oplevelser & fritid",
    "Wandern & Radfahren": "Vandring & cykling",
    "Essen & Trinken": "Mad & drikke",
    "Lernen & Kultur": "Læring & kultur",
    "Praktisches": "Praktisk på tur",
    "Unterwegs mit WoMo & Rad": "På farten (autocamper & cykel)",
    "Entspannung & Naturorte": "Afslapning & natursteder"
  }
};

/** @type {Record<string, string>} */
export const CATEGORY_LABELS_DE = {
  "wanderweg": "Wanderweg / Rundwanderung",
  "museum": "Museum / Ausstellung",
  "aquarium": "Aquarium",
  "historischer-ort": "Historischer Ort",

  // Spiel & Bewegung
  spielplatz: "Spielplatz",
  abenteuerspielplatz: "Abenteuerspielplatz",
  "indoor-spielplatz": "Indoor-Spielplatz",
  waldspielplatz: "Waldspielplatz",
  wasserspielplatz: "Wasserspielplatz",
  "barrierefreier-spielplatz": "Barrierefreier Spielplatz",
  bewegungspark: "Bewegungspark",
  multifunktionsfeld: "Multifunktionsfeld",
  bolzplatz: "Bolzplatz",
  pumptrack: "Pumptrack",
  skatepark: "Skatepark",
  verkehrsgarten: "Verkehrsgarten",
  "toddler-barfuss-motorik": "Kleinkind / Barfuß & Motorik",

  // Tiere & Natur
  zoo: "Zoo",
  tierpark: "Tierpark",
  wildpark: "Wildpark & Safaris",
  bauernhof: "Bauernhof",
  naturerlebnispfad: "Naturerlebnispfad",
  walderlebnisroute: "Walderlebnisroute",

  // Lernen & Kultur / Outdoor
  freilichtmuseum: "Freilichtmuseum",

  // Wasser & Schwimmen / Winter
  schwimmbad: "Schwimmbad",
  badesee: "Badesee",
  strand: "Familienstrand",
  eisbahn: "Eisbahn",
  rodelhuegel: "Rodelhügel",

  // Erlebnis & Freizeit
  freizeitpark: "Freizeitpark",

  // Feintypen / Natur-Erlebnis (laufen primär über Tags)
  hoehle: "Höhle / Felsenwanderung",
  felsenwanderung: "Felsenwanderung",
  aussichtspunkt: "Aussichtspunkt / Panorama",
  baumhaus: "Baumhaus / Hütte",
  labyrinth: "Labyrinth / Irrgarten",
  klangpfad: "Natur-Klangpfad",
  "ueberdachter-spielplatz": "Überdachter Spielplatz",
  "dirtbike-track": "Dirtbike / Jugend-Bike Track",
  "streetball-platz": "Streetball / Basketball-Platz",
  "waldbaden-ort": "Waldbaden / Naturruheplatz",
  "natur-aussichtspunkt": "Natur-Aussichtspunkt",

  trampolinpark: "Trampolinpark",
  kletterhalle: "Kletterhalle",
  "kletteranlage-outdoor": "Kletteranlage (Outdoor)",
  "kletterwald-hochseilgarten": "Kletterwald / Hochseilgarten",
  boulderpark: "Boulderpark",
  minigolf: "Minigolf",

  // Wandern & Radfahren
  "wanderweg-kinderwagen": "Wanderweg (kinderwagenfreundlich)",
  "radweg-family": "Familien-Radweg",

  // Essen & Trinken
  familiencafe: "Familiencafé",
  "kinder-familiencafe": "Kinder- & Familiencafé",
  "familien-restaurant": "Familienrestaurant",

  // Lernen & Kultur (indoor)
  "museum-kinder": "Kinderfreundliches Museum",
  "kinder-museum": "Kindermuseum",
  kinder_museum: "Kindermuseum",
  bibliothek: "Bibliothek",

  // Praktisches
  "oeffentliche-toilette": "Öffentliche Toilette",
  wickelraum: "Wickelraum",

  // Unterwegs mit WoMo & Rad
  "stellplatz-spielplatz-naehe-kostenlos":
    "Kostenloser Stellplatz (Spielplatznähe)",
  "wohnmobil-parkplatz": "Wohnmobil-Parkplatz",
  "wohnmobil-service-station": "Wohnmobil-Service-Station",
  "rastplatz-spielplatz-dusche": "Rastplatz (Spielplatz & Dusche)",
  "bikepacking-spot": "Bikepacking-Spot",
  "campingplatz-familien": "Familienfreundlicher Campingplatz",

  // Entspannung & Naturorte
  "park-garten": "Park / Garten",
  mitmachgarten: "Mitmachgarten",
  picknickwiese: "Picknickwiese"
};

/** @type {Record<string, string>} */
export const CATEGORY_LABELS_EN = {
  "wanderweg": "Walking trail / circular walk",
  "museum": "Museum / exhibition",
  "aquarium": "Aquarium",
  "historischer-ort": "Historic site",

  // Play & movement
  spielplatz: "Playground",
  abenteuerspielplatz: "Adventure playground",
  "indoor-spielplatz": "Indoor playground",
  waldspielplatz: "Forest playground",
  wasserspielplatz: "Water playground",
  "barrierefreier-spielplatz": "Accessible playground",
  bewegungspark: "Activity park",
  multifunktionsfeld: "Multi-sport court",
  bolzplatz: "Football pitch",
  pumptrack: "Pumptrack",
  skatepark: "Skate park",
  verkehrsgarten: "Traffic training park",
  "toddler-barfuss-motorik": "Toddlers / barefoot play & motor skills",

  // Animals & nature
  zoo: "Zoo",
  tierpark: "Animal park",
  wildpark: "Wildlife park & safaris",
  bauernhof: "Farm",
  naturerlebnispfad: "Nature trail",
  walderlebnisroute: "Forest discovery route",

  // Learning & culture / outdoor
  freilichtmuseum: "Open-air museum",

  // Water & swimming / winter
  schwimmbad: "Swimming pool",
  badesee: "Swimming lake",
  strand: "Family beach",
  eisbahn: "Ice rink",
  rodelhuegel: "Sledging hill",

  // Adventure & leisure
  freizeitpark: "Theme park",

  // Fine types (mostly via tags)
  hoehle: "Cave / rock hike",
  felsenwanderung: "Rock hike",
  aussichtspunkt: "Scenic viewpoint / panorama",
  baumhaus: "Treehouse / lookout hut",
  labyrinth: "Maze / labyrinth",
  klangpfad: "Nature sound trail",
  "ueberdachter-spielplatz": "Covered playground",
  "dirtbike-track": "Dirtbike / youth bike track",
  "streetball-platz": "Streetball / basketball court",
  "waldbaden-ort": "Forest bathing / quiet nature spot",
  "natur-aussichtspunkt": "Nature viewpoint",

  trampolinpark: "Trampoline park",
  kletterhalle: "Climbing gym",
  "kletteranlage-outdoor": "Outdoor climbing area",
  "kletterwald-hochseilgarten": "Ropes course / treetop adventure",
  boulderpark: "Bouldering park",
  minigolf: "Mini golf",

  // Hiking & cycling
  "wanderweg-kinderwagen": "Pushchair-friendly route",
  "radweg-family": "Family-friendly cycle route",

  // Food & drinks
  familiencafe: "Family café",
  "kinder-familiencafe": "Children’s & family café",
  "familien-restaurant": "Family restaurant",

  // Learning & culture (indoor)
  "museum-kinder": "Child-friendly museum",
  "kinder-museum": "Children's museum",
  kinder_museum: "Children's museum",
  bibliothek: "Library",

  // Practical
  "oeffentliche-toilette": "Public toilet",
  wickelraum: "Baby changing room",

  // RV & vanlife
  "stellplatz-spielplatz-naehe-kostenlos":
    "Free motorhome parking (near playground)",
  "wohnmobil-parkplatz": "Motorhome parking",
  "wohnmobil-service-station": "Motorhome service point",
  "rastplatz-spielplatz-dusche": "Rest area (playground & shower)",
  "bikepacking-spot": "Bikepacking spot",
  "campingplatz-familien": "Family-friendly campsite",

  // Relax & nature
  "park-garten": "Park / garden",
  mitmachgarten: "Community garden",
  picknickwiese: "Picnic meadow"
};

/** @type {Record<string, string>} */
export const CATEGORY_LABELS_DA = {
  "wanderweg": "Vandrerute / rundtur",
  "museum": "Museum / udstilling",
  "aquarium": "Akvarium",
  "historischer-ort": "Historisk sted",

  // Leg & bevægelse
  spielplatz: "Legeplads",
  abenteuerspielplatz: "Eventyrlegeplads",
  "indoor-spielplatz": "Indendørs legeplads",
  waldspielplatz: "Skovlegeplads",
  wasserspielplatz: "Vandlegeplads",
  "barrierefreier-spielplatz": "Tilgængelig legeplads",
  bewegungspark: "Aktivitetspark",
  multifunktionsfeld: "Multibane",
  bolzplatz: "Boldbane",
  pumptrack: "Pumptrack",
  skatepark: "Skatepark",
  verkehrsgarten: "Trafiklegeplads",
  "toddler-barfuss-motorik": "Småbørn / barfodsleg & motorik",

  // Dyr & natur
  zoo: "Zoo",
  tierpark: "Dyrepark",
  wildpark: "Dyrepark & safari",
  bauernhof: "Gård",
  naturerlebnispfad: "Natursti",
  walderlebnisroute: "Skovoplevelsesrute",

  // Frilandsmuseum
  freilichtmuseum: "Frilandsmuseum",

  // Vand & badning / vinter
  schwimmbad: "Svømmebad",
  badesee: "Badesø",
  strand: "Familiestrand",
  eisbahn: "Skøjtebane",
  rodelhuegel: "Kælkebakke",

  // Oplevelser & fritid
  freizeitpark: "Forlystelsespark",

  // Fine typer (primært via tags)
  hoehle: "Hule / klippevandring",
  felsenwanderung: "Klippevandring",
  aussichtspunkt: "Udsigtspunkt / panorama",
  baumhaus: "Træhus / udsigtshytte",
  labyrinth: "Labyrint",
  klangpfad: "Natur-lydsti",
  "ueberdachter-spielplatz": "Overdækket legeplads",
  "dirtbike-track": "Dirtbike / ungdomsbane",
  "streetball-platz": "Streetball / basketballbane",
  "waldbaden-ort": "Skovbadning / roligt naturspot",
  "natur-aussichtspunkt": "Udsigtspunkt i naturen",

  trampolinpark: "Trampolinpark",
  kletterhalle: "Klatrehal",
  "kletteranlage-outdoor": "Udendørs klatreanlæg",
  "kletterwald-hochseilgarten": "Klatreskov / højdebane",
  boulderpark: "Boulderpark",
  minigolf: "Minigolf",

  // Vandring & cykling
  "wanderweg-kinderwagen": "Vandrerute (barnevognsvenlig)",
  "radweg-family": "Familievenlig cykelrute",

  // Mad & drikke
  familiencafe: "Familiecafé",
  "kinder-familiencafe": "Børne- & familiecafé",
  "familien-restaurant": "Familierestaurant",

  // Læring & kultur (indendørs)
  "museum-kinder": "Børnevenligt museum",
  "kinder-museum": "Børnemuseum",
  kinder_museum: "Børnemuseum",
  bibliothek: "Bibliotek",

  // Praktisk
  "oeffentliche-toilette": "Offentligt toilet",
  wickelraum: "Puslerum",

  // Autocamper & vanlife
  "stellplatz-spielplatz-naehe-kostenlos":
    "Gratis autocamperplads (tæt på legeplads)",
  "wohnmobil-parkplatz": "Autocamperparkering",
  "wohnmobil-service-station": "Serviceplads til autocampere",
  "rastplatz-spielplatz-dusche": "Rasteplads (legeplads & bruser)",
  "bikepacking-spot": "Bikepacking-spot",
  "campingplatz-familien": "Familievenlig campingplads",

  // Afslapning & natursteder
  "park-garten": "Park / have",
  mitmachgarten: "Fælleshave",
  picknickwiese: "Picniceng"
};

// ------------------------------------------------------
// Kategorie-Tags (für Filter-Logik)
// ------------------------------------------------------

/** @type {Record<string, string[]>} */
export const CATEGORY_TAGS = {
  wanderweg: ["walking", "hiking", "nature", "outdoor"],
  museum: ["museum", "culture", "learning", "indoor"],
  aquarium: ["aquarium", "animals", "learning", "indoor", "family-friendly"],
  "historischer-ort": ["history", "culture"],
  // Spiel & Bewegung
  spielplatz: ["playground", "outdoor", "all-ages", "family-friendly"],
  abenteuerspielplatz: [
    "playground",
    "adventure",
    "outdoor",
    "older-kids",
    "family-friendly"
  ],
  "indoor-spielplatz": [
    "playground",
    "indoor",
    "bad-weather",
    "younger-kids",
    "family-friendly"
  ],
  waldspielplatz: [
    "playground",
    "outdoor",
    "forest",
    "nature",
    "family-friendly"
  ],
  wasserspielplatz: [
    "playground",
    "water",
    "outdoor",
    "summer",
    "family-friendly"
  ],
  "barrierefreier-spielplatz": [
    "playground",
    "accessible",
    "wheelchair",
    "outdoor",
    "family-friendly"
  ],
  bewegungspark: [
    "playground",
    "sport",
    "fitness",
    "outdoor",
    "family-friendly"
  ],
  multifunktionsfeld: ["sport", "ball-sports", "outdoor", "family-friendly"],
  bolzplatz: ["sport", "soccer", "outdoor", "family-friendly"],
  pumptrack: ["sport", "bike", "pumptrack", "outdoor", "family-friendly"],
  skatepark: ["sport", "skate", "bikes", "outdoor", "teen-friendly"],
  verkehrsgarten: [
    "playground",
    "traffic-training",
    "bikes",
    "learning",
    "outdoor",
    "family-friendly"
  ],
  "toddler-barfuss-motorik": [
    "playground",
    "toddler-friendly",
    "sensory",
    "barefoot",
    "family-friendly"
  ],

  // Tiere & Natur
  zoo: [
    "animals",
    "zoo",
    "full-day",
    "paid",
    "family-friendly"
  ],
  tierpark: ["animals", "outdoor", "family-friendly"],
  wildpark: ["animals", "wildlife", "nature", "outdoor", "family-friendly"],
  bauernhof: [
    "animals",
    "farm",
    "nature",
    "outdoor",
    "family-friendly"
  ],
  naturerlebnispfad: [
    "hiking",
    "learning",
    "nature",
    "outdoor",
    "kids-friendly",
    "family-friendly"
  ],
  walderlebnisroute: [
    "hiking",
    "forest",
    "nature",
    "learning",
    "outdoor",
    "family-friendly"
  ],

  // Lernen & Kultur (outdoor)
  freilichtmuseum: [
    "museum",
    "outdoor",
    "history",
    "culture",
    "learning",
    "family-friendly"
  ],

  // Wasser & Schwimmen / Winter
  schwimmbad: [
    "water",
    "swimming",
    "sport",
    "indoor-or-outdoor",
    "family-friendly"
  ],
  badesee: [
    "water",
    "swimming",
    "lake",
    "outdoor",
    "summer",
    "nature",
    "family-friendly"
  ],
  strand: ["water", "beach", "outdoor", "summer", "family-friendly"],
  eisbahn: ["ice-skating", "winter", "sport", "seasonal", "family-friendly"],
  rodelhuegel: ["sledding", "winter", "snow", "outdoor", "family-friendly"],

  // Erlebnis & Freizeit
  freizeitpark: [
    "theme-park",
    "rides",
    "full-day",
    "paid",
    "family-friendly"
  ],
  trampolinpark: [
    "trampoline",
    "sport",
    "indoor",
    "bad-weather",
    "family-friendly"
  ],
  kletterhalle: [
    "climbing",
    "indoor",
    "sport",
    "bad-weather",
    "family-friendly"
  ],
  "kletteranlage-outdoor": [
    "climbing",
    "outdoor",
    "sport",
    "family-friendly"
  ],
  "kletterwald-hochseilgarten": [
    "climbing",
    "rope-course",
    "adventure",
    "outdoor",
    "family-friendly"
  ],
  boulderpark: ["climbing", "bouldering", "sport", "family-friendly"],
  minigolf: ["sport", "mini-golf", "game", "family-friendly"],

  // Feintypen Natur / Aussicht / Spezial
  hoehle: [
    "hiking",
    "adventure",
    "nature",
    "outdoor",
    "older-kids",
    "family-friendly"
  ],
  felsenwanderung: [
    "hiking",
    "adventure",
    "nature",
    "outdoor",
    "family-friendly"
  ],
  aussichtspunkt: [
    "nature",
    "viewpoint",
    "outdoor",
    "relax",
    "family-friendly"
  ],
  baumhaus: [
    "playground",
    "viewpoint",
    "adventure",
    "outdoor",
    "family-friendly"
  ],
  labyrinth: ["game", "maze", "adventure", "family-friendly"],
  klangpfad: [
    "nature",
    "learning",
    "sensory",
    "outdoor",
    "family-friendly"
  ],
  "ueberdachter-spielplatz": [
    "playground",
    "outdoor",
    "covered",
    "rain-safe",
    "family-friendly"
  ],
  "dirtbike-track": [
    "sport",
    "bike",
    "dirtbike",
    "outdoor",
    "teen-friendly"
  ],
  "streetball-platz": [
    "sport",
    "basketball",
    "streetball",
    "outdoor",
    "teen-friendly"
  ],
  "waldbaden-ort": [
    "nature",
    "forest",
    "relax",
    "quiet",
    "outdoor",
    "family-friendly"
  ],
  "natur-aussichtspunkt": [
    "nature",
    "viewpoint",
    "outdoor",
    "family-friendly"
  ],

  // Wandern & Radfahren
  "wanderweg-kinderwagen": [
    "hiking",
    "stroller-friendly",
    "outdoor",
    "nature",
    "family-friendly"
  ],
  "radweg-family": ["cycling", "family-route", "outdoor", "family-friendly"],

  // Essen & Trinken
  familiencafe: ["food", "cafe", "indoor", "family-friendly"],
  "kinder-familiencafe": [
    "food",
    "cafe",
    "indoor",
    "kids-area",
    "family-friendly"
  ],
  "familien-restaurant": ["food", "restaurant", "indoor", "family-friendly"],

  // Lernen & Kultur (indoor)
  "museum-kinder": [
    "museum",
    "indoor",
    "learning",
    "kids-friendly",
    "bad-weather",
    "family-friendly"
  ],
  "kinder-museum": [
    "museum",
    "indoor",
    "learning",
    "kids-friendly",
    "bad-weather",
    "family-friendly"
  ],
  bibliothek: [
    "library",
    "indoor",
    "quiet",
    "books",
    "learning",
    "bad-weather",
    "family-friendly"
  ],

  // Praktisches
  "oeffentliche-toilette": ["infrastructure", "toilet"],
  wickelraum: ["infrastructure", "baby-changing", "indoor"],

  // Unterwegs mit WoMo & Rad
  // Free parking near a playground does not establish overnight permission.
  // Confirmed overnight use must be stated explicitly in the spot's own tags.
  "stellplatz-spielplatz-naehe-kostenlos": [
    "rv",
    "free",
    "playground-nearby",
    "infrastructure",
    "travel"
  ],
  "wohnmobil-parkplatz": ["rv", "parking", "outdoor", "travel"],
  "wohnmobil-service-station": [
    "rv",
    "service",
    "dump-station",
    "water",
    "infrastructure",
    "travel"
  ],
  "rastplatz-spielplatz-dusche": [
    "rest-area",
    "highway",
    "playground",
    "toilet",
    "shower",
    "infrastructure",
    "travel",
    "family-friendly"
  ],
  "bikepacking-spot": [
    "bikepacking",
    "overnight",
    "minimal-infrastructure",
    "nature",
    "outdoor",
    "travel"
  ],
  "campingplatz-familien": [
    "camping",
    "overnight",
    "nature",
    "travel",
    "family-friendly"
  ],

  // Entspannung & Naturorte
  "park-garten": [
    "park",
    "nature",
    "relax",
    "outdoor",
    "picnic-possible",
    "family-friendly"
  ],
  picknickwiese: ["picnic", "nature", "relax", "outdoor", "family-friendly"]
};

// ------------------------------------------------------
// Filter-Chips (Mapping Filter → Tags)
// ------------------------------------------------------

/**
 * Filter-Chips (Mapping Filter → Tags)
 * @type {FilterConfig[]}
 */
export const FILTERS = [
  {
    id: "bad-weather",
    tags: ["indoor", "bad-weather"],
    label: {
      de: "Schlechtwetter",
      en: "Bad weather",
      da: "Dårligt vejr"
    }
  },
  {
    id: "toddlers",
    tags: ["toddler-friendly", "younger-kids", "sensory", "barefoot"],
    label: {
      de: "Kleinkinder",
      en: "Toddlers",
      da: "Små børn"
    }
  },
  {
    id: "older-kids-teens",
    tags: [
      "older-kids",
      "teen-friendly",
      "skate",
      "pumptrack",
      "climbing",
      "bouldering"
    ],
    label: {
      de: "Größere Kinder & Jugendliche",
      en: "Older children & teenagers",
      da: "Større børn & teenagere"
    }
  },
  {
    id: "accessible",
    tags: ["accessible", "wheelchair"],
    label: {
      de: "Barrierefrei",
      en: "Accessible",
      da: "Tilgængelig"
    }
  },
  {
    id: "stroller-friendly",
    tags: ["stroller-friendly"],
    label: {
      de: "Kinderwagentauglich",
      en: "Pushchair-friendly",
      da: "Barnevognsvenlig"
    }
  },
  {
    id: "animals",
    tags: ["animals", "zoo", "wildlife", "petting-zoo", "farm"],
    label: {
      de: "Tiere",
      en: "Animals",
      da: "Dyr"
    }
  },
  {
    id: "water-fun",
    tags: ["water", "swimming", "lake", "beach"],
    label: {
      de: "Wasserbezug",
      en: "Water-related",
      da: "Med vand"
    }
  },
  {
    id: "winter-fun",
    tags: ["winter", "snow", "ice-skating", "sledding"],
    label: {
      de: "Winter & Schnee",
      en: "Winter & snow",
      da: "Vinter & sne"
    }
  },
  {
    id: "rv-vanlife",
    tags: ["rv", "rest-area", "dump-station", "service", "travel"],
    label: {
      de: "WoMo & Vanlife",
      en: "Motorhome & vanlife",
      da: "Autocamper & vanlife"
    }
  },
  {
    id: "overnight-outdoor",
    tags: ["camping", "bikepacking", "overnight"],
    label: {
      de: "Mit Übernachtung",
      en: "With overnight stay",
      da: "Med overnatning"
    }
  },
  {
    id: "full-day",
    tags: ["full-day", "theme-park"],
    label: {
      de: "Ganztages-Ausflug",
      en: "Full-day trip",
      da: "Heldagstur"
    }
  },
  {
    id: "low-budget",
    tags: ["free"],
    label: {
      de: "Kostenlos",
      en: "Free",
      da: "Gratis"
    }
  }
];

// ------------------------------------------------------
// Texte & Onboarding-Keys
// ------------------------------------------------------

/** @type {Record<LangCode, string>} */
export const HEADER_TAGLINE_TEXT = {
  de: "Orte entdecken.\nMenschen verbinden.\nErinnerungen schaffen.",
  en: "Discover places.\nConnect people.\nCreate memories.",
  da: "Opdag steder.\nSkab forbindelser.\nSkab minder."
};

// Onboarding-Hint (Spots / Plus / Mein Tag)
export const COMPASS_PLUS_HINT_KEY = "fs_hint_compass_plus_v1";

// ------------------------------------------------------
// Abos & Add-ons (Subscription-Modell)
// ------------------------------------------------------

/**
 * Basis-Abos (z. B. 19,90 €/Jahr)
 * – aktuell 1 Abo: "Family Spots Plus"
 * @type {Record<string, SubscriptionConfig>}
 */
export const SUBSCRIPTIONS = Object.freeze({
  family_plus: {
    id: "family_plus",
    type: "subscription",
    pricePerYear: null,
    salesEnabled: false,
    currency: "EUR",
    label: {
      de: "Family Spots Plus",
      en: "Family Spots Plus",
      da: "Family Spots Plus"
    },
    shortLabel: {
      de: "Plus",
      en: "Plus",
      da: "Plus"
    },
    description: {
      de: "Schaltet zusätzliche Spots, Kategorien und Komfort-Funktionen für Familien frei.",
      en: "Unlocks additional spots, categories and useful features for families.",
      da: "Låser op for ekstra spots, kategorier og komfortfunktioner for familier."
    },
    benefits: [
      {
        id: "more_spots",
        label: {
          de: "Mehr sorgfältig kuratierte Spots & Regionen",
          en: "More carefully curated spots & regions",
          da: "Flere nøje udvalgte spots og regioner"
        }
      },
      {
        id: "special_categories",
        label: {
          de: "Spezielle Kategorien wie WoMo-Spots, Bikepacking & Routen",
          en: "Special categories such as motorhome stops, bikepacking & routes",
          da: "Særlige kategorier som autocamper-spots, bikepacking & ruter"
        }
      },
      {
        id: "support_project",
        label: {
          de: "Unterstützt die Weiterentwicklung von Family Spots Map",
          en: "Supports the ongoing development of Family Spots Map",
          da: "Støtter den fortsatte udvikling af Family Spots Map"
        }
      }
    ]
  }
});

/**
 * Add-ons (z. B. 2,99 €/Jahr) – an ein Basis-Abo gebunden.
 * @type {Record<string, AddonConfig>}
 */
export const ADDONS = Object.freeze({
  addon_water: {
    id: "addon_water",
    type: "addon",
    requiresSubscriptionId: "family_plus",
    pricePerYear: null,
    salesEnabled: false,
    currency: "EUR",
    label: {
      de: "Wasser & Baden Add-on",
      en: "Water & swimming add-on",
      da: "Tilvalg: vand & badning"
    },
    description: {
      de: "Besondere Wasser-Spots, Badeseen & familienfreundliche Badeplätze.",
      en: "Special water spots, swimming lakes and family-friendly bathing places.",
      da: "Særlige vand-spots, badesøer og familievenlige badesteder."
    },
    categories: ["badesee", "strand", "schwimmbad"]
  },

  addon_rv: {
    id: "addon_rv",
    type: "addon",
    requiresSubscriptionId: "family_plus",
    pricePerYear: null,
    salesEnabled: false,
    currency: "EUR",
    label: {
      de: "WoMo & Vanlife Add-on",
      en: "Motorhome & vanlife add-on",
      da: "Tilvalg: autocamper & vanlife"
    },
    description: {
      de: "Zusätzliche Spots für Reisen mit Wohnmobil, Camper & Rad.",
      en: "Extra spots for trips by motorhome, campervan or bike.",
      da: "Ekstra spots til rejser med autocamper, campervan og cykel."
    },
    categories: [
      "wohnmobil-parkplatz",
      "stellplatz-spielplatz-naehe-kostenlos",
      "wohnmobil-service-station",
      "rastplatz-spielplatz-dusche",
      "bikepacking-spot",
      "campingplatz-familien"
    ]
  }
});

/**
 * Zugriffsregeln pro Kategorie:
 *
 *  - level: "free" | "subscription" | "addon"
 *  - subscriptionId: wenn "subscription" oder "addon"
 *  - addonId: wenn level === "addon"
 *
 * Default ist "free", falls Kategorie hier nicht eingetragen ist.
 * @type {CategoryAccessConfig}
 */
export const CATEGORY_ACCESS = Object.freeze({
  defaultLevel: "free",
  perCategory: {
    // ---------- Nur mit Basis-Abo (Family Spots Plus) ----------
    freizeitpark: {
      level: "subscription",
      subscriptionId: "family_plus"
    },
    trampolinpark: {
      level: "subscription",
      subscriptionId: "family_plus"
    },
    "kletterwald-hochseilgarten": {
      level: "subscription",
      subscriptionId: "family_plus"
    },

    // ---------- Add-on: Wasser & Baden ----------
    badesee: {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_water"
    },
    strand: {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_water"
    },
    // Public water playgrounds remain freely visible.
    wasserspielplatz: {
      level: "free"
    },
    schwimmbad: {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_water"
    },

    // ---------- Add-on: WoMo & Vanlife ----------
    "wohnmobil-parkplatz": {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_rv"
    },
    "stellplatz-spielplatz-naehe-kostenlos": {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_rv"
    },
    "wohnmobil-service-station": {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_rv"
    },
    "rastplatz-spielplatz-dusche": {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_rv"
    },
    "bikepacking-spot": {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_rv"
    },
    "campingplatz-familien": {
      level: "addon",
      subscriptionId: "family_plus",
      addonId: "addon_rv"
    }

    // ➕ weitere Kategorien kannst du hier jederzeit ergänzen
  }
});