// js/i18n.js
// --------------------------------------
// Family Spots Map – i18n / Spielideen
// (ABF 2026 nutzt dieselbe i18n-Logik;
//  ABF-spezifische Texte liegen in data/i18n/*.json)
// --------------------------------------

"use strict";

import { setTextWithHearts } from "./utils/dom.js?v=20261106-app-feinschliff";

import { fetchJsonWithTimeout } from "./data/dataLoader.js?v=20261106-app-feinschliff";

/**
 * Unterstützte Sprachen & Defaults
 * ---------------------------------- */

/** @type {readonly ["de", "en", "da"]} */
const SUPPORTED_LANGS = ["de", "en", "da"];
/** @type {const} */
const DEFAULT_LANG = "de";
/** @type {const} */
const STORAGE_LANG_KEY = "fs_lang";

/** @typedef {"de" | "en" | "da"} LangCode */

/** @type {LangCode} */
let currentLang = DEFAULT_LANG;

/**
 * messagesByLang[lang] = { key: "Übersetzung" }
 * @type {Record<LangCode, Record<string, string>>}
 */
// Complete bundled translations remain available even if a language request fails.
// tools/check-project.mjs verifies exact agreement with the editable JSON files.
const FALLBACK_MESSAGES = {
  "de": {
    "__meta.locale": "de-DE",
    "__meta.source": "family-spots",
    "__meta.updatedAt": "2026-10-15",
    "ui.meta.title": "Family Spots Map – Die schönste Karte für Familien-Abenteuer",
    "ui.meta.description": "Handverlesene Orte für Familien: Spielplätze, Tiere, Wasser & Wege mit Erinnerungswert.",
    "ui.errors.dataLoad": "Ups – das hat gerade nicht geklappt. Bitte versuch es gleich noch einmal.",
    "ui.aria.help": "Hilfe und Infos anzeigen",
    "ui.aria.locate": "Standort zentrieren",
    "ui.labels.languageSwitcher": "Sprache wechseln",
    "ui.alt.tillaImage": "Tilla die Schildkröte – eure Familienbegleiterin",
    "ui.header.tagline": "Orte entdecken.\nMenschen verbinden.\nErinnerungen schaffen.",
    "ui.buttons.showFilters": "Filter aufklappen",
    "ui.buttons.hideFilters": "Filter zuklappen",
    "ui.buttons.onlyMap": "Nur Karte",
    "ui.buttons.showList": "Liste zeigen",
    "ui.toast.locationOk": "Standort gesetzt – euer nächster Moment wartet. 🌍",
    "ui.toast.locationError": "Euer Standort ist gerade nicht verfügbar. Ihr könnt die Karte trotzdem weiter erkunden.",
    "ui.toast.locationUnavailableRadiusDisabled": "Standort nicht verfügbar – Radiusfilter ist deaktiviert.",
    "ui.toast.favAdded": "Zu den Favoriten – ein Ort, der bleiben darf. 💚",
    "ui.toast.favRemoved": "Aus Favoriten entfernt – neue Schätze warten. 🌿",
    "ui.filters.categoryAll": "Alle Kategorien",
    "ui.filters.radius.maxLabel": "Alle Spots",
    "ui.filters.radius.description.step0": "Mini-Abenteuer – ganz nah, perfekt für eine kleine Pause.",
    "ui.filters.radius.description.step1": "Kurz raus – schnell da, schnell wieder zurück.",
    "ui.filters.radius.description.step2": "Kleine Tour – ein halber Tag voller Entdeckungen.",
    "ui.filters.radius.description.step3": "Großes Ziel – ein ganzer Tag für magische Momente.",
    "ui.filters.radius.description.all": "Ohne Entfernungsgrenze.",
    "ui.plus.codeEmpty": "Bitte zuerst einen Zugangscode eingeben.",
    "ui.plus.codeUnknown": "Dieser Code ist unbekannt oder nicht mehr gültig.",
    "ui.plus.activated": "Family Spots Plus ist aktiv – viel Freude auf euren Touren!",
    "ui.plus.failed": "Code gerade nicht prüfbar. Bitte später noch einmal versuchen.",
    "ui.tilla.intro1": "Ich bin Tilla. Ich zeige euch Orte für Nähe, Erinnerungen und kleine Abenteuer. Gehen wir los? 🐢",
    "ui.tilla.intro2": "Gerade finde ich keinen passenden Spot. Vielleicht passt ein Spaziergang – oder ihr vergrößert den Radius etwas. 🐢",
    "ui.tilla.afterDaylogSave": "Euer Tag ist gespeichert – klein erlebt, groß erinnert. 💚",
    "ui.tilla.afterFavAdded": "Dieser Ort hat jetzt ein Herz auf eurer Karte. 💚",
    "ui.tilla.afterFavRemoved": "Alles gut – nicht jeder Ort bleibt. Wir finden neue. 🐢",
    "ui.tilla.tripMode": "Ihr seid unterwegs – ich halte Ausschau nach Herzmomenten. 🚐",
    "ui.tilla.everydayMode": "Alltag darf leuchten. Lass uns Wunder ganz nah finden. 🌿",
    "ui.tilla.plusActivated": "Plus ist aktiv – mehr Wege, mehr Orte, mehr Abenteuer. ✨",
    "ui.daylog.saved": "Gespeichert 💾 – später könnt ihr zurücklächeln.",
    "ui.nav.map": "Karte",
    "ui.nav.about": "Über Family Spots Map",
    "ui.route.apple": "In Apple Karten öffnen",
    "ui.route.google": "In Google Maps öffnen",
    "domain.categories.spielplatz": "Spielplatz",
    "domain.categories.abenteuerspielplatz": "Abenteuerspielplatz",
    "domain.categories.indoor_spielplatz": "Indoor-Spielplatz",
    "domain.categories.waldspielplatz": "Waldspielplatz",
    "domain.categories.wasserspielplatz": "Wasserspielplatz",
    "domain.categories.barrierefreier_spielplatz": "Barrierefreier Spielplatz",
    "domain.categories.bewegungspark": "Bewegungspark",
    "domain.categories.multifunktionsfeld": "Multifunktionsfeld",
    "domain.categories.bolzplatz": "Bolzplatz",
    "domain.categories.pumptrack": "Pumptrack",
    "domain.categories.skatepark": "Skatepark",
    "domain.categories.verkehrsgarten": "Verkehrsgarten",
    "domain.categories.toddler_barfuss_motorik": "Kleinkind / Barfuß & Motorik",
    "domain.categories.zoo": "Zoo",
    "domain.categories.tierpark": "Tierpark",
    "domain.categories.wildpark": "Wildpark & Safaris",
    "domain.categories.bauernhof": "Bauernhof",
    "domain.categories.naturerlebnispfad": "Naturerlebnispfad",
    "domain.categories.walderlebnisroute": "Walderlebnisroute",
    "domain.categories.freilichtmuseum": "Freilichtmuseum",
    "domain.categories.schwimmbad": "Schwimmbad",
    "domain.categories.badesee": "Badesee",
    "domain.categories.strand": "Familienstrand",
    "domain.categories.eisbahn": "Eisbahn",
    "domain.categories.rodelhuegel": "Rodelhügel",
    "domain.categories.freizeitpark": "Freizeitpark",
    "domain.categories.trampolinpark": "Trampolinpark",
    "domain.categories.kletterhalle": "Kletterhalle",
    "domain.categories.kletteranlage_outdoor": "Kletteranlage (Outdoor)",
    "domain.categories.kletterwald_hochseilgarten": "Kletterwald / Hochseilgarten",
    "domain.categories.boulderpark": "Boulderpark",
    "domain.categories.minigolf": "Minigolf",
    "domain.categories.hoehle": "Höhle / Felsenwanderung",
    "domain.categories.felsenwanderung": "Felsenwanderung",
    "domain.categories.aussichtspunkt": "Aussichtspunkt / Panorama",
    "domain.categories.baumhaus": "Baumhaus / Hütte",
    "domain.categories.labyrinth": "Labyrinth / Irrgarten",
    "domain.categories.klangpfad": "Natur-Klangpfad",
    "domain.categories.ueberdachter_spielplatz": "Überdachter Spielplatz",
    "domain.categories.dirtbike_track": "Dirtbike / Jugend-Bike Track",
    "domain.categories.streetball_platz": "Streetball / Basketball-Platz",
    "domain.categories.waldbaden_ort": "Waldbaden / Naturruheplatz",
    "domain.categories.natur_aussichtspunkt": "Natur-Aussichtspunkt",
    "domain.categories.wanderweg_kinderwagen": "Wanderweg (kinderwagenfreundlich)",
    "domain.categories.radweg_family": "Familien-Radweg",
    "domain.categories.familiencafe": "Familiencafé",
    "domain.categories.kinder_familiencafe": "Kinder- & Familiencafé",
    "domain.categories.familien_restaurant": "Familienrestaurant",
    "domain.categories.museum_kinder": "Kinderfreundliches Museum",
    "domain.categories.kinder_museum": "Kindermuseum",
    "domain.categories.bibliothek": "Bibliothek",
    "domain.categories.oeffentliche_toilette": "Öffentliche Toilette",
    "domain.categories.wickelraum": "Wickelraum",
    "domain.categories.familien_event": "Familien-Event",
    "domain.categories.stellplatz_spielplatz_naehe_kostenlos": "Kostenloser Stellplatz (Spielplatznähe)",
    "domain.categories.wohnmobil_service_station": "Wohnmobil-Service-Station",
    "domain.categories.rastplatz_spielplatz_dusche": "Rastplatz (Spielplatz & Dusche)",
    "domain.categories.bikepacking_spot": "Bikepacking-Spot",
    "domain.categories.campingplatz_familien": "Familienfreundlicher Campingplatz",
    "domain.categories.park_garten": "Park / Garten",
    "domain.categories.picknickwiese": "Picknickwiese",
    "meta_title": "Family Spots Map – Die schönste Karte für Familien-Abenteuer",
    "meta_description": "Handverlesene Orte für Familien: Spielplätze, Tiere, Wasser & Wege mit Erinnerungswert.",
    "error_data_load": "Ups – das hat gerade nicht geklappt. Bitte versuch es gleich noch einmal.",
    "btn_help_aria": "Hilfe und Infos anzeigen",
    "btn_locate_aria": "Standort zentrieren",
    "alt_tilla_image": "Tilla die Schildkröte – eure Familienbegleiterin",
    "header_tagline": "Orte entdecken.\nMenschen verbinden.\nErinnerungen schaffen.",
    "btn_show_filters": "Filter aufklappen",
    "btn_hide_filters": "Filter zuklappen",
    "btn_only_map": "Nur Karte",
    "btn_show_list": "Liste zeigen",
    "filter_category_all": "Alle Kategorien",
    "filter_radius_max_label": "Alle Spots",
    "filter_radius_description_all": "Ohne Entfernungsgrenze.",
    "plus_code_empty": "Bitte zuerst einen Zugangscode eingeben.",
    "plus_code_unknown": "Dieser Code ist unbekannt oder nicht mehr gültig.",
    "plus_code_activated": "Family Spots Plus ist aktiv – viel Freude auf euren Touren!",
    "plus_code_failed": "Code gerade nicht prüfbar. Bitte später noch einmal versuchen.",
    "nav_map": "Karte",
    "nav_about": "Über Family Spots Map",
    "route_apple": "In Apple Karten öffnen",
    "route_google": "In Google Maps öffnen",
    "daylog_saved": "Gespeichert 💾 – später könnt ihr zurücklächeln.",
    "turtle_intro_1": "Ich bin Tilla. Ich zeige euch Orte für Nähe, Erinnerungen und kleine Abenteuer. Gehen wir los? 🐢",
    "turtle_intro_2": "Gerade finde ich keinen passenden Spot. Vielleicht passt ein Spaziergang – oder ihr vergrößert den Radius etwas. 🐢",
    "turtle_after_daylog_save": "Euer Tag ist gespeichert – klein erlebt, groß erinnert. 💚",
    "turtle_after_fav_added": "Dieser Ort hat jetzt ein Herz auf eurer Karte. 💚",
    "turtle_after_fav_removed": "Alles gut – nicht jeder Ort bleibt. Wir finden neue. 🐢",
    "turtle_trip_mode": "Ihr seid unterwegs – ich halte Ausschau nach Herzmomenten. 🚐",
    "turtle_everyday_mode": "Alltag darf leuchten. Lass uns Wunder ganz nah finden. 🌿",
    "turtle_plus_activated": "Plus ist aktiv – mehr Wege, mehr Orte, mehr Abenteuer. ✨",
    "toast_location_ok": "Standort gesetzt – euer nächster Moment wartet. 🌍",
    "toast_location_error": "Euer Standort ist gerade nicht verfügbar. Ihr könnt die Karte trotzdem weiter erkunden.",
    "toast_location_unavailable_radius_disabled": "Standort nicht verfügbar – Radiusfilter ist deaktiviert.",
    "toast_fav_added": "Zu den Favoriten – ein Ort, der bleiben darf. 💚",
    "toast_fav_removed": "Aus Favoriten entfernt – neue Schätze warten. 🌿",
    "filter_radius_description_step0": "Mini-Abenteuer – ganz nah, perfekt für eine kleine Pause.",
    "filter_radius_description_step1": "Kurz raus – schnell da, schnell wieder zurück.",
    "filter_radius_description_step2": "Kleine Tour – ein halber Tag voller Entdeckungen.",
    "filter_radius_description_step3": "Großes Ziel – ein ganzer Tag für magische Momente.",
    "btn_show": "Anzeigen",
    "btn_hide": "Ausblenden",
    "plus_status_inactive": "Spots Plus ist derzeit nicht freigeschaltet.",
    "plus_status_active": "Family Spots Plus ist aktiv.",
    "plus_status_owner": "Entwicklungszugang: alle Spots und Zusatzbereiche dauerhaft freigeschaltet. Kostenlos, kein Abo.",
    "plus_status_family_test": "Kostenloser Familientest bis {date}: alle Spots und Zusatzbereiche freigeschaltet. Kein Abo.",
    "plus_status_active_until": "Family Spots Plus ist aktiv bis {date}.",
    "plus_status_expired": "Family Spots Plus ist am {date} abgelaufen.",
    "menu_title": "Menü",
    "aria_settings": "App-Einstellungen und Schnellzugriffe",
    "aria_map": "Karte",
    "aria_map_spots": "Karte mit Spots",
    "aria_hint": "Kurze Anleitung zur Karte",
    "aria_hint_close": "Anleitung schließen",
    "aria_about": "Über Family Spots Map",
    "aria_navigation": "Navigation",
    "landscape_hint": "Bitte Gerät drehen 📱🔄 – im Hochformat fühlt sich Tilla wohler.",
    "map_zoom_in": "Vergrößern",
    "map_zoom_out": "Verkleinern",
    "map_contributors": "Mitwirkende",
    "spot_fallback": "Ausflugsort",
    "spots_title": "Spots",
    "plus_suffix": " (Plus)",
    "addon_suffix": " (Zusatzpaket)",
    "locked_suffix": " 🔒",
    "toast_marker_limit": "Viele Spots gefunden – zoomt für mehr Übersicht in die Karte.",
    "category_spielplatz": "Spielplatz",
    "category_abenteuerspielplatz": "Abenteuerspielplatz",
    "category_indoor_spielplatz": "Indoor-Spielplatz",
    "category_waldspielplatz": "Waldspielplatz",
    "category_wasserspielplatz": "Wasserspielplatz",
    "category_barrierefreier_spielplatz": "Barrierefreier Spielplatz",
    "category_bewegungspark": "Bewegungspark",
    "category_multifunktionsfeld": "Multifunktionsfeld",
    "category_bolzplatz": "Bolzplatz",
    "category_pumptrack": "Pumptrack",
    "category_skatepark": "Skatepark",
    "category_verkehrsgarten": "Verkehrsgarten",
    "category_toddler_barfuss_motorik": "Kleinkind / Barfuß & Motorik",
    "category_zoo": "Zoo",
    "category_tierpark": "Tierpark",
    "category_wildpark": "Wildpark & Safaris",
    "category_bauernhof": "Bauernhof",
    "category_naturerlebnispfad": "Naturerlebnispfad",
    "category_walderlebnisroute": "Walderlebnisroute",
    "category_freilichtmuseum": "Freilichtmuseum",
    "category_schwimmbad": "Schwimmbad",
    "category_badesee": "Badesee",
    "category_strand": "Familienstrand",
    "category_eisbahn": "Eisbahn",
    "category_rodelhuegel": "Rodelhügel",
    "category_freizeitpark": "Freizeitpark",
    "category_trampolinpark": "Trampolinpark",
    "category_kletterhalle": "Kletterhalle",
    "category_kletteranlage_outdoor": "Kletteranlage (Outdoor)",
    "category_kletterwald_hochseilgarten": "Kletterwald / Hochseilgarten",
    "category_boulderpark": "Boulderpark",
    "category_minigolf": "Minigolf",
    "category_hoehle": "Höhle / Felsenwanderung",
    "category_felsenwanderung": "Felsenwanderung",
    "category_aussichtspunkt": "Aussichtspunkt / Panorama",
    "category_baumhaus": "Baumhaus / Hütte",
    "category_labyrinth": "Labyrinth / Irrgarten",
    "category_klangpfad": "Natur-Klangpfad",
    "category_ueberdachter_spielplatz": "Überdachter Spielplatz",
    "category_dirtbike_track": "Dirtbike / Jugend-Bike Track",
    "category_streetball_platz": "Streetball / Basketball-Platz",
    "category_waldbaden_ort": "Waldbaden / Naturruheplatz",
    "category_natur_aussichtspunkt": "Natur-Aussichtspunkt",
    "category_wanderweg_kinderwagen": "Wanderweg (kinderwagenfreundlich)",
    "category_radweg_family": "Familien-Radweg",
    "category_familiencafe": "Familiencafé",
    "category_kinder_familiencafe": "Kinder- & Familiencafé",
    "category_familien_restaurant": "Familienrestaurant",
    "category_museum_kinder": "Kinderfreundliches Museum",
    "category_kinder_museum": "Kindermuseum",
    "category_bibliothek": "Bibliothek",
    "category_oeffentliche_toilette": "Öffentliche Toilette",
    "category_wickelraum": "Wickelraum",
    "category_familien_event": "Familien-Event",
    "category_stellplatz_spielplatz_naehe_kostenlos": "Kostenloser Stellplatz (Spielplatznähe)",
    "category_wohnmobil_service_station": "Wohnmobil-Service-Station",
    "category_rastplatz_spielplatz_dusche": "Rastplatz (Spielplatz & Dusche)",
    "category_bikepacking_spot": "Bikepacking-Spot",
    "category_campingplatz_familien": "Familienfreundlicher Campingplatz",
    "category_park_garten": "Park / Garten",
    "category_picknickwiese": "Picknickwiese"
  },
  "en": {
    "__meta.locale": "en-GB",
    "__meta.source": "family-spots",
    "__meta.updatedAt": "2026-10-15",
    "ui.meta.title": "Family Spots Map – Family adventures near you",
    "ui.meta.description": "Handpicked places for families: playgrounds, animals, water play, and short routes that turn into memories.",
    "ui.errors.dataLoad": "Oops – we couldn’t load the data just now. Please try again in a moment.",
    "ui.aria.help": "Show help and information",
    "ui.aria.locate": "Centre on your location",
    "ui.labels.languageSwitcher": "Change language",
    "ui.alt.tillaImage": "Tilla the turtle – your family companion",
    "ui.header.tagline": "Discover places.\nConnect people.\nCreate memories.",
    "ui.buttons.showFilters": "Expand filters",
    "ui.buttons.hideFilters": "Collapse filters",
    "ui.buttons.onlyMap": "Map only",
    "ui.buttons.showList": "Show list",
    "ui.toast.locationOk": "Location found – your next little adventure awaits. 🌍",
    "ui.toast.locationError": "We can’t access your location right now. You can still browse the map.",
    "ui.toast.locationUnavailableRadiusDisabled": "Your location is unavailable – the radius filter is disabled.",
    "ui.toast.favAdded": "Saved to favourites – a place worth keeping. 💚",
    "ui.toast.favRemoved": "Removed from favourites – new treasures await. 🌿",
    "ui.filters.categoryAll": "All categories",
    "ui.filters.radius.maxLabel": "All spots",
    "ui.filters.radius.description.step0": "Mini adventures – very close by, perfect for a short break.",
    "ui.filters.radius.description.step1": "Quick outing – out and back in no time.",
    "ui.filters.radius.description.step2": "Half-day outing – lots to discover.",
    "ui.filters.radius.description.step3": "A big day out – full of magical moments.",
    "ui.filters.radius.description.all": "No distance limit.",
    "ui.plus.codeEmpty": "Please enter an access code.",
    "ui.plus.codeUnknown": "This code is unknown or no longer valid.",
    "ui.plus.activated": "Family Spots Plus is active – happy travels!",
    "ui.plus.failed": "The code couldn’t be checked right now. Please try again later.",
    "ui.tilla.intro1": "I’m Tilla. I’ll help you find places to spend time together, make memories and enjoy little adventures. Shall we go? 🐢",
    "ui.tilla.intro2": "I can’t find a matching spot right now. How about a short walk, or a slightly wider radius? 🐢",
    "ui.tilla.afterDaylogSave": "Your day is saved – small moments, big memories. 💚",
    "ui.tilla.afterFavAdded": "This place now has a heart on your map. 💚",
    "ui.tilla.afterFavRemoved": "No worries – we’ll find new memories. 🐢",
    "ui.tilla.tripMode": "You’re on the move – I’m watching for heartwarming moments. 🚐",
    "ui.tilla.everydayMode": "Little adventures are closer than you think. 🌿",
    "ui.tilla.plusActivated": "Plus is active – more paths, more places, more adventures. ✨",
    "ui.daylog.saved": "Saved 💾 – a little memory to smile about later.",
    "ui.nav.map": "Map",
    "ui.nav.about": "About Family Spots Map",
    "ui.route.apple": "Open in Apple Maps",
    "ui.route.google": "Open in Google Maps",
    "domain.categories.spielplatz": "Playground",
    "domain.categories.abenteuerspielplatz": "Adventure playground",
    "domain.categories.indoor_spielplatz": "Indoor playground",
    "domain.categories.waldspielplatz": "Forest playground",
    "domain.categories.wasserspielplatz": "Water playground",
    "domain.categories.barrierefreier_spielplatz": "Accessible playground",
    "domain.categories.bewegungspark": "Activity park",
    "domain.categories.multifunktionsfeld": "Multi-sport court",
    "domain.categories.bolzplatz": "Football pitch",
    "domain.categories.pumptrack": "Pumptrack",
    "domain.categories.skatepark": "Skate park",
    "domain.categories.verkehrsgarten": "Traffic training park",
    "domain.categories.toddler_barfuss_motorik": "Toddlers / barefoot play & motor skills",
    "domain.categories.zoo": "Zoo",
    "domain.categories.tierpark": "Animal park",
    "domain.categories.wildpark": "Wildlife park & safaris",
    "domain.categories.bauernhof": "Farm",
    "domain.categories.naturerlebnispfad": "Nature trail",
    "domain.categories.walderlebnisroute": "Forest discovery route",
    "domain.categories.freilichtmuseum": "Open-air museum",
    "domain.categories.schwimmbad": "Swimming pool",
    "domain.categories.badesee": "Swimming lake",
    "domain.categories.strand": "Family beach",
    "domain.categories.eisbahn": "Ice rink",
    "domain.categories.rodelhuegel": "Sledging hill",
    "domain.categories.freizeitpark": "Theme park",
    "domain.categories.trampolinpark": "Trampoline park",
    "domain.categories.kletterhalle": "Climbing gym",
    "domain.categories.kletteranlage_outdoor": "Outdoor climbing area",
    "domain.categories.kletterwald_hochseilgarten": "Ropes course / treetop adventure",
    "domain.categories.boulderpark": "Bouldering park",
    "domain.categories.minigolf": "Mini golf",
    "domain.categories.hoehle": "Cave / rock hike",
    "domain.categories.felsenwanderung": "Rock hike",
    "domain.categories.aussichtspunkt": "Scenic viewpoint / panorama",
    "domain.categories.baumhaus": "Treehouse / lookout hut",
    "domain.categories.labyrinth": "Maze / labyrinth",
    "domain.categories.klangpfad": "Nature sound trail",
    "domain.categories.ueberdachter_spielplatz": "Covered playground",
    "domain.categories.dirtbike_track": "Dirtbike / youth bike track",
    "domain.categories.streetball_platz": "Streetball / basketball court",
    "domain.categories.waldbaden_ort": "Forest bathing / quiet nature spot",
    "domain.categories.natur_aussichtspunkt": "Nature viewpoint",
    "domain.categories.wanderweg_kinderwagen": "Pushchair-friendly route",
    "domain.categories.radweg_family": "Family-friendly cycle route",
    "domain.categories.familiencafe": "Family café",
    "domain.categories.kinder_familiencafe": "Children’s & family café",
    "domain.categories.familien_restaurant": "Family restaurant",
    "domain.categories.museum_kinder": "Child-friendly museum",
    "domain.categories.kinder_museum": "Children's museum",
    "domain.categories.bibliothek": "Library",
    "domain.categories.oeffentliche_toilette": "Public toilet",
    "domain.categories.wickelraum": "Baby changing room",
    "domain.categories.familien_event": "Family event",
    "domain.categories.stellplatz_spielplatz_naehe_kostenlos": "Free motorhome parking (near playground)",
    "domain.categories.wohnmobil_service_station": "Motorhome service point",
    "domain.categories.rastplatz_spielplatz_dusche": "Rest area (playground & shower)",
    "domain.categories.bikepacking_spot": "Bikepacking spot",
    "domain.categories.campingplatz_familien": "Family-friendly campsite",
    "domain.categories.park_garten": "Park / garden",
    "domain.categories.picknickwiese": "Picnic meadow",
    "meta_title": "Family Spots Map – Family adventures near you",
    "meta_description": "Handpicked places for families: playgrounds, animals, water play, and short routes that turn into memories.",
    "error_data_load": "Oops – we couldn’t load the data just now. Please try again in a moment.",
    "btn_help_aria": "Show help and information",
    "btn_locate_aria": "Centre on your location",
    "alt_tilla_image": "Tilla the turtle – your family companion",
    "header_tagline": "Discover places.\nConnect people.\nCreate memories.",
    "btn_show_filters": "Expand filters",
    "btn_hide_filters": "Collapse filters",
    "btn_only_map": "Map only",
    "btn_show_list": "Show list",
    "filter_category_all": "All categories",
    "filter_radius_max_label": "All spots",
    "filter_radius_description_all": "No distance limit.",
    "plus_code_empty": "Please enter an access code first.",
    "plus_code_unknown": "This code is unknown or no longer valid.",
    "plus_code_activated": "Family Spots Plus is active – happy travels!",
    "plus_code_failed": "The code couldn’t be checked right now. Please try again later.",
    "nav_map": "Map",
    "nav_about": "About Family Spots Map",
    "route_apple": "Open in Apple Maps",
    "route_google": "Open in Google Maps",
    "daylog_saved": "Saved 💾 – a little memory to smile about later.",
    "turtle_intro_1": "I’m Tilla. I’ll help you find places to spend time together, make memories and enjoy little adventures. Shall we go? 🐢",
    "turtle_intro_2": "I can’t find a matching spot right now. How about a short walk, or a slightly wider radius? 🐢",
    "turtle_after_daylog_save": "Your day is saved – small moments, big memories. 💚",
    "turtle_after_fav_added": "This place now has a heart on your map. 💚",
    "turtle_after_fav_removed": "No worries – we’ll find new memories. 🐢",
    "turtle_trip_mode": "You’re on the move – I’m watching for heartwarming moments. 🚐",
    "turtle_everyday_mode": "Little adventures are closer than you think. 🌿",
    "turtle_plus_activated": "Plus is active – more paths, more places, more adventures. ✨",
    "toast_location_ok": "Location found – your next little adventure awaits. 🌍",
    "toast_location_error": "We can’t access your location right now. You can still browse the map.",
    "toast_location_unavailable_radius_disabled": "Your location is unavailable – the radius filter is disabled.",
    "toast_fav_added": "Saved to favourites – a place worth keeping. 💚",
    "toast_fav_removed": "Removed from favourites – new treasures await. 🌿",
    "filter_radius_description_step0": "Mini adventures – very close by, perfect for a short break.",
    "filter_radius_description_step1": "Quick outing – out and back in no time.",
    "filter_radius_description_step2": "Half-day outing – lots to discover.",
    "filter_radius_description_step3": "A big day out – full of magical moments.",
    "btn_show": "Show",
    "btn_hide": "Hide",
    "plus_status_inactive": "Spots Plus is not currently unlocked.",
    "plus_status_active": "Family Spots Plus is active.",
    "plus_status_owner": "Development access: all spots and additional areas unlocked without an expiry date. Free, no subscription.",
    "plus_status_family_test": "Free family test until {date}: all spots and additional areas unlocked. No subscription.",
    "plus_status_active_until": "Family Spots Plus is active until {date}.",
    "plus_status_expired": "Family Spots Plus expired on {date}.",
    "menu_title": "Menu",
    "aria_settings": "App settings and shortcuts",
    "aria_map": "Map",
    "aria_map_spots": "Map of spots",
    "aria_hint": "Quick guide to the map",
    "aria_hint_close": "Close guide",
    "aria_about": "About Family Spots Map",
    "aria_navigation": "Navigation",
    "landscape_hint": "Please rotate your device 📱🔄 – Tilla feels more at home in portrait mode.",
    "map_zoom_in": "Zoom in",
    "map_zoom_out": "Zoom out",
    "map_contributors": "contributors",
    "spot_fallback": "Place to visit",
    "spots_title": "Spots",
    "plus_suffix": " (Plus)",
    "addon_suffix": " (Add-on)",
    "locked_suffix": " 🔒",
    "toast_marker_limit": "Lots of spots found – zoom in to see them more clearly.",
    "category_spielplatz": "Playground",
    "category_abenteuerspielplatz": "Adventure playground",
    "category_indoor_spielplatz": "Indoor playground",
    "category_waldspielplatz": "Forest playground",
    "category_wasserspielplatz": "Water playground",
    "category_barrierefreier_spielplatz": "Accessible playground",
    "category_bewegungspark": "Activity park",
    "category_multifunktionsfeld": "Multi-sport court",
    "category_bolzplatz": "Football pitch",
    "category_pumptrack": "Pumptrack",
    "category_skatepark": "Skate park",
    "category_verkehrsgarten": "Traffic training park",
    "category_toddler_barfuss_motorik": "Toddlers / barefoot play & motor skills",
    "category_zoo": "Zoo",
    "category_tierpark": "Animal park",
    "category_wildpark": "Wildlife park & safaris",
    "category_bauernhof": "Farm",
    "category_naturerlebnispfad": "Nature trail",
    "category_walderlebnisroute": "Forest discovery route",
    "category_freilichtmuseum": "Open-air museum",
    "category_schwimmbad": "Swimming pool",
    "category_badesee": "Swimming lake",
    "category_strand": "Family beach",
    "category_eisbahn": "Ice rink",
    "category_rodelhuegel": "Sledging hill",
    "category_freizeitpark": "Theme park",
    "category_trampolinpark": "Trampoline park",
    "category_kletterhalle": "Climbing gym",
    "category_kletteranlage_outdoor": "Outdoor climbing area",
    "category_kletterwald_hochseilgarten": "Ropes course / treetop adventure",
    "category_boulderpark": "Bouldering park",
    "category_minigolf": "Mini golf",
    "category_hoehle": "Cave / rock hike",
    "category_felsenwanderung": "Rock hike",
    "category_aussichtspunkt": "Scenic viewpoint / panorama",
    "category_baumhaus": "Treehouse / lookout hut",
    "category_labyrinth": "Maze / labyrinth",
    "category_klangpfad": "Nature sound trail",
    "category_ueberdachter_spielplatz": "Covered playground",
    "category_dirtbike_track": "Dirtbike / youth bike track",
    "category_streetball_platz": "Streetball / basketball court",
    "category_waldbaden_ort": "Forest bathing / quiet nature spot",
    "category_natur_aussichtspunkt": "Nature viewpoint",
    "category_wanderweg_kinderwagen": "Pushchair-friendly route",
    "category_radweg_family": "Family-friendly cycle route",
    "category_familiencafe": "Family café",
    "category_kinder_familiencafe": "Children’s & family café",
    "category_familien_restaurant": "Family restaurant",
    "category_museum_kinder": "Child-friendly museum",
    "category_kinder_museum": "Children's museum",
    "category_bibliothek": "Library",
    "category_oeffentliche_toilette": "Public toilet",
    "category_wickelraum": "Baby changing room",
    "category_familien_event": "Family event",
    "category_stellplatz_spielplatz_naehe_kostenlos": "Free motorhome parking (near playground)",
    "category_wohnmobil_service_station": "Motorhome service point",
    "category_rastplatz_spielplatz_dusche": "Rest area (playground & shower)",
    "category_bikepacking_spot": "Bikepacking spot",
    "category_campingplatz_familien": "Family-friendly campsite",
    "category_park_garten": "Park / garden",
    "category_picknickwiese": "Picnic meadow"
  },
  "da": {
    "__meta.locale": "da-DK",
    "__meta.source": "family-spots",
    "__meta.updatedAt": "2026-10-15",
    "ui.meta.title": "Family Spots Map – Det smukkeste kort til familieeventyr",
    "ui.meta.description": "Håndplukkede steder for familier: legepladser, dyr, vand og små ture, der bliver til minder.",
    "ui.errors.dataLoad": "Ups – vi kunne ikke indlæse dataene lige nu. Prøv igen om lidt.",
    "ui.aria.help": "Vis hjælp og info",
    "ui.aria.locate": "Centrér på jeres position",
    "ui.labels.languageSwitcher": "Skift sprog",
    "ui.alt.tillaImage": "Tilla skildpadden – jeres familieledsager",
    "ui.header.tagline": "Opdag steder.\nSkab forbindelser.\nSkab minder.",
    "ui.buttons.showFilters": "Fold filtre ud",
    "ui.buttons.hideFilters": "Fold filtre sammen",
    "ui.buttons.onlyMap": "Kun kort",
    "ui.buttons.showList": "Vis liste",
    "ui.toast.locationOk": "Jeres position er fundet – næste lille eventyr venter. 🌍",
    "ui.toast.locationError": "Vi kan ikke få adgang til jeres position lige nu. I kan stadig bruge kortet.",
    "ui.toast.locationUnavailableRadiusDisabled": "Jeres position er ikke tilgængelig – radiusfilteret er slået fra.",
    "ui.toast.favAdded": "Gemt som favorit – et sted, I kan vende tilbage til. 💚",
    "ui.toast.favRemoved": "Fjernet fra favoritter – nye skatte venter. 🌿",
    "ui.filters.categoryAll": "Alle kategorier",
    "ui.filters.radius.maxLabel": "Alle spots",
    "ui.filters.radius.description.step0": "Mini-eventyr – helt tæt på, perfekt til en lille pause.",
    "ui.filters.radius.description.step1": "En kort tur – hurtigt af sted og hjemme igen.",
    "ui.filters.radius.description.step2": "En lille udflugt – en halv dag fuld af oplevelser.",
    "ui.filters.radius.description.step3": "Et stort udflugtsmål – en hel dag med magiske øjeblikke.",
    "ui.filters.radius.description.all": "Ingen afstandsgrænse.",
    "ui.plus.codeEmpty": "Indtast først en adgangskode.",
    "ui.plus.codeUnknown": "Koden er ukendt eller ikke længere gyldig.",
    "ui.plus.activated": "Family Spots Plus er aktiveret – god tur!",
    "ui.plus.failed": "Koden kunne ikke tjekkes nu. Prøv igen senere.",
    "ui.tilla.intro1": "Jeg er Tilla. Jeg viser jer steder til samvær, minder og små eventyr. Skal vi tage af sted? 🐢",
    "ui.tilla.intro2": "Lige nu kan jeg ikke finde et passende spot. Hvad med en gåtur eller en lidt større radius? 🐢",
    "ui.tilla.afterDaylogSave": "Jeres dag er gemt – små øjeblikke, store minder. 💚",
    "ui.tilla.afterFavAdded": "Stedet har nu et hjerte på jeres kort. 💚",
    "ui.tilla.afterFavRemoved": "Helt i orden – vi finder nye minder. 🐢",
    "ui.tilla.tripMode": "I er på vej – jeg kigger efter hjerteøjeblikke. 🚐",
    "ui.tilla.everydayMode": "Hverdagen må gerne lyse. Lad os finde små mirakler tæt på. 🌿",
    "ui.tilla.plusActivated": "Plus er aktiv – flere veje, flere steder, flere eventyr. ✨",
    "ui.daylog.saved": "Gemt 💾 – et lille minde, I kan glæde jer over senere.",
    "ui.nav.map": "Kort",
    "ui.nav.about": "Om Family Spots Map",
    "ui.route.apple": "Åbn i Apple Maps",
    "ui.route.google": "Åbn i Google Maps",
    "domain.categories.spielplatz": "Legeplads",
    "domain.categories.abenteuerspielplatz": "Eventyrlegeplads",
    "domain.categories.indoor_spielplatz": "Indendørs legeplads",
    "domain.categories.waldspielplatz": "Skovlegeplads",
    "domain.categories.wasserspielplatz": "Vandlegeplads",
    "domain.categories.barrierefreier_spielplatz": "Tilgængelig legeplads",
    "domain.categories.bewegungspark": "Aktivitetspark",
    "domain.categories.multifunktionsfeld": "Multibane",
    "domain.categories.bolzplatz": "Boldbane",
    "domain.categories.pumptrack": "Pumptrack",
    "domain.categories.skatepark": "Skatepark",
    "domain.categories.verkehrsgarten": "Trafiklegeplads",
    "domain.categories.toddler_barfuss_motorik": "Småbørn / barfodsleg & motorik",
    "domain.categories.zoo": "Zoo",
    "domain.categories.tierpark": "Dyrepark",
    "domain.categories.wildpark": "Dyrepark & safari",
    "domain.categories.bauernhof": "Gård",
    "domain.categories.naturerlebnispfad": "Natursti",
    "domain.categories.walderlebnisroute": "Skovoplevelsesrute",
    "domain.categories.freilichtmuseum": "Frilandsmuseum",
    "domain.categories.schwimmbad": "Svømmebad",
    "domain.categories.badesee": "Badesø",
    "domain.categories.strand": "Familiestrand",
    "domain.categories.eisbahn": "Skøjtebane",
    "domain.categories.rodelhuegel": "Kælkebakke",
    "domain.categories.freizeitpark": "Forlystelsespark",
    "domain.categories.trampolinpark": "Trampolinpark",
    "domain.categories.kletterhalle": "Klatrehal",
    "domain.categories.kletteranlage_outdoor": "Udendørs klatreanlæg",
    "domain.categories.kletterwald_hochseilgarten": "Klatreskov / højdebane",
    "domain.categories.boulderpark": "Boulderpark",
    "domain.categories.minigolf": "Minigolf",
    "domain.categories.hoehle": "Hule / klippevandring",
    "domain.categories.felsenwanderung": "Klippevandring",
    "domain.categories.aussichtspunkt": "Udsigtspunkt / panorama",
    "domain.categories.baumhaus": "Træhus / udsigtshytte",
    "domain.categories.labyrinth": "Labyrint",
    "domain.categories.klangpfad": "Natur-lydsti",
    "domain.categories.ueberdachter_spielplatz": "Overdækket legeplads",
    "domain.categories.dirtbike_track": "Dirtbike / ungdomsbane",
    "domain.categories.streetball_platz": "Streetball / basketballbane",
    "domain.categories.waldbaden_ort": "Skovbadning / roligt naturspot",
    "domain.categories.natur_aussichtspunkt": "Udsigtspunkt i naturen",
    "domain.categories.wanderweg_kinderwagen": "Vandrerute (barnevognsvenlig)",
    "domain.categories.radweg_family": "Familievenlig cykelrute",
    "domain.categories.familiencafe": "Familiecafé",
    "domain.categories.kinder_familiencafe": "Børne- & familiecafé",
    "domain.categories.familien_restaurant": "Familierestaurant",
    "domain.categories.museum_kinder": "Børnevenligt museum",
    "domain.categories.kinder_museum": "Børnemuseum",
    "domain.categories.bibliothek": "Bibliotek",
    "domain.categories.oeffentliche_toilette": "Offentligt toilet",
    "domain.categories.wickelraum": "Puslerum",
    "domain.categories.familien_event": "Familieevent",
    "domain.categories.stellplatz_spielplatz_naehe_kostenlos": "Gratis autocamperplads (tæt på legeplads)",
    "domain.categories.wohnmobil_service_station": "Serviceplads til autocampere",
    "domain.categories.rastplatz_spielplatz_dusche": "Rasteplads (legeplads & bruser)",
    "domain.categories.bikepacking_spot": "Bikepacking-spot",
    "domain.categories.campingplatz_familien": "Familievenlig campingplads",
    "domain.categories.park_garten": "Park / have",
    "domain.categories.picknickwiese": "Picniceng",
    "meta_title": "Family Spots Map – Det smukkeste kort til familieeventyr",
    "meta_description": "Håndplukkede steder for familier: legepladser, dyr, vand og små ture, der bliver til minder.",
    "error_data_load": "Ups – vi kunne ikke indlæse dataene lige nu. Prøv igen om lidt.",
    "btn_help_aria": "Vis hjælp og info",
    "btn_locate_aria": "Centrér på jeres position",
    "alt_tilla_image": "Tilla skildpadden – jeres familieledsager",
    "header_tagline": "Opdag steder.\nSkab forbindelser.\nSkab minder.",
    "btn_show_filters": "Fold filtre ud",
    "btn_hide_filters": "Fold filtre sammen",
    "btn_only_map": "Kun kort",
    "btn_show_list": "Vis liste",
    "filter_category_all": "Alle kategorier",
    "filter_radius_max_label": "Alle spots",
    "filter_radius_description_all": "Ingen afstandsgrænse.",
    "plus_code_empty": "Indtast først en adgangskode.",
    "plus_code_unknown": "Koden er ukendt eller ikke længere gyldig.",
    "plus_code_activated": "Family Spots Plus er aktiveret – god tur!",
    "plus_code_failed": "Koden kunne ikke tjekkes nu. Prøv igen senere.",
    "nav_map": "Kort",
    "nav_about": "Om Family Spots Map",
    "route_apple": "Åbn i Apple Maps",
    "route_google": "Åbn i Google Maps",
    "daylog_saved": "Gemt 💾 – et lille minde, I kan glæde jer over senere.",
    "turtle_intro_1": "Jeg er Tilla. Jeg viser jer steder til samvær, minder og små eventyr. Skal vi tage af sted? 🐢",
    "turtle_intro_2": "Lige nu kan jeg ikke finde et passende spot. Hvad med en gåtur eller en lidt større radius? 🐢",
    "turtle_after_daylog_save": "Jeres dag er gemt – små øjeblikke, store minder. 💚",
    "turtle_after_fav_added": "Stedet har nu et hjerte på jeres kort. 💚",
    "turtle_after_fav_removed": "Helt i orden – vi finder nye minder. 🐢",
    "turtle_trip_mode": "I er på vej – jeg kigger efter hjerteøjeblikke. 🚐",
    "turtle_everyday_mode": "Hverdagen må gerne lyse. Lad os finde små mirakler tæt på. 🌿",
    "turtle_plus_activated": "Plus er aktiv – flere veje, flere steder, flere eventyr. ✨",
    "toast_location_ok": "Jeres position er fundet – næste lille eventyr venter. 🌍",
    "toast_location_error": "Vi kan ikke få adgang til jeres position lige nu. I kan stadig bruge kortet.",
    "toast_location_unavailable_radius_disabled": "Jeres position er ikke tilgængelig – radiusfilteret er slået fra.",
    "toast_fav_added": "Gemt som favorit – et sted, I kan vende tilbage til. 💚",
    "toast_fav_removed": "Fjernet fra favoritter – nye skatte venter. 🌿",
    "filter_radius_description_step0": "Mini-eventyr – helt tæt på, perfekt til en lille pause.",
    "filter_radius_description_step1": "En kort tur – hurtigt af sted og hjemme igen.",
    "filter_radius_description_step2": "En lille udflugt – en halv dag fuld af oplevelser.",
    "filter_radius_description_step3": "Et stort udflugtsmål – en hel dag med magiske øjeblikke.",
    "btn_show": "Vis",
    "btn_hide": "Skjul",
    "plus_status_inactive": "Spots Plus er ikke aktiveret.",
    "plus_status_active": "Family Spots Plus er aktiveret.",
    "plus_status_owner": "Udvikleradgang: alle spots og ekstra områder er åbne uden udløbsdato. Gratis, intet abonnement.",
    "plus_status_family_test": "Gratis familietest indtil {date}: alle spots og ekstra områder er åbne. Intet abonnement.",
    "plus_status_active_until": "Family Spots Plus er aktiveret indtil {date}.",
    "plus_status_expired": "Family Spots Plus udløb den {date}.",
    "menu_title": "Menu",
    "aria_settings": "Appindstillinger og genveje",
    "aria_map": "Kort",
    "aria_map_spots": "Kort med spots",
    "aria_hint": "Kort vejledning til kortet",
    "aria_hint_close": "Luk vejledning",
    "aria_about": "Om Family Spots Map",
    "aria_navigation": "Navigation",
    "landscape_hint": "Drej venligst enheden 📱🔄 – Tilla føler sig bedst tilpas i stående format.",
    "map_zoom_in": "Zoom ind",
    "map_zoom_out": "Zoom ud",
    "map_contributors": "bidragydere",
    "spot_fallback": "Udflugtssted",
    "spots_title": "Spots",
    "plus_suffix": " (Plus)",
    "addon_suffix": " (Tilvalg)",
    "locked_suffix": " 🔒",
    "toast_marker_limit": "Mange steder fundet – zoom ind for at få et bedre overblik.",
    "category_spielplatz": "Legeplads",
    "category_abenteuerspielplatz": "Eventyrlegeplads",
    "category_indoor_spielplatz": "Indendørs legeplads",
    "category_waldspielplatz": "Skovlegeplads",
    "category_wasserspielplatz": "Vandlegeplads",
    "category_barrierefreier_spielplatz": "Tilgængelig legeplads",
    "category_bewegungspark": "Aktivitetspark",
    "category_multifunktionsfeld": "Multibane",
    "category_bolzplatz": "Boldbane",
    "category_pumptrack": "Pumptrack",
    "category_skatepark": "Skatepark",
    "category_verkehrsgarten": "Trafiklegeplads",
    "category_toddler_barfuss_motorik": "Småbørn / barfodsleg & motorik",
    "category_zoo": "Zoo",
    "category_tierpark": "Dyrepark",
    "category_wildpark": "Dyrepark & safari",
    "category_bauernhof": "Gård",
    "category_naturerlebnispfad": "Natursti",
    "category_walderlebnisroute": "Skovoplevelsesrute",
    "category_freilichtmuseum": "Frilandsmuseum",
    "category_schwimmbad": "Svømmebad",
    "category_badesee": "Badesø",
    "category_strand": "Familiestrand",
    "category_eisbahn": "Skøjtebane",
    "category_rodelhuegel": "Kælkebakke",
    "category_freizeitpark": "Forlystelsespark",
    "category_trampolinpark": "Trampolinpark",
    "category_kletterhalle": "Klatrehal",
    "category_kletteranlage_outdoor": "Udendørs klatreanlæg",
    "category_kletterwald_hochseilgarten": "Klatreskov / højdebane",
    "category_boulderpark": "Boulderpark",
    "category_minigolf": "Minigolf",
    "category_hoehle": "Hule / klippevandring",
    "category_felsenwanderung": "Klippevandring",
    "category_aussichtspunkt": "Udsigtspunkt / panorama",
    "category_baumhaus": "Træhus / udsigtshytte",
    "category_labyrinth": "Labyrint",
    "category_klangpfad": "Natur-lydsti",
    "category_ueberdachter_spielplatz": "Overdækket legeplads",
    "category_dirtbike_track": "Dirtbike / ungdomsbane",
    "category_streetball_platz": "Streetball / basketballbane",
    "category_waldbaden_ort": "Skovbadning / roligt naturspot",
    "category_natur_aussichtspunkt": "Udsigtspunkt i naturen",
    "category_wanderweg_kinderwagen": "Vandrerute (barnevognsvenlig)",
    "category_radweg_family": "Familievenlig cykelrute",
    "category_familiencafe": "Familiecafé",
    "category_kinder_familiencafe": "Børne- & familiecafé",
    "category_familien_restaurant": "Familierestaurant",
    "category_museum_kinder": "Børnevenligt museum",
    "category_kinder_museum": "Børnemuseum",
    "category_bibliothek": "Bibliotek",
    "category_oeffentliche_toilette": "Offentligt toilet",
    "category_wickelraum": "Puslerum",
    "category_familien_event": "Familieevent",
    "category_stellplatz_spielplatz_naehe_kostenlos": "Gratis autocamperplads (tæt på legeplads)",
    "category_wohnmobil_service_station": "Serviceplads til autocampere",
    "category_rastplatz_spielplatz_dusche": "Rasteplads (legeplads & bruser)",
    "category_bikepacking_spot": "Bikepacking-spot",
    "category_campingplatz_familien": "Familievenlig campingplads",
    "category_park_garten": "Park / have",
    "category_picknickwiese": "Picniceng"
  }
};
const loadedLanguages = new Set();
const messagesByLang = Object.fromEntries(
  SUPPORTED_LANGS.map(lang => [lang, { ...FALLBACK_MESSAGES[lang] }])
);

/**
 * Spielideen-Struktur (aus data/play-ideas.json):
 * [
 *   { id: string, texts: { de?: string, en?: string, da?: string }, ... },
 *   ...
 * ]
 * Wir unterstützen sowohl dieses Schema mit `texts` als auch
 * ein älteres flaches Schema ({ de, en, da }).
 * @type {Array<any>}
 */
const FALLBACK_PLAY_IDEAS = [
  {
    "id": "red-cars-counting",
    "texts": {
      "de": "Zählt unterwegs alle roten Autos. Wer zuerst 10 gesehen hat, darf das nächste Ziel aussuchen.",
      "en": "Count all the red cars you see. Whoever reaches 10 first may choose the next stop.",
      "da": "Tæl alle de røde biler, I ser undervejs. Den, der først når 10, må vælge næste stop."
    }
  },
  {
    "id": "story-about-tilla",
    "texts": {
      "de": "Denkt euch gemeinsam eine Geschichte über Tilla aus – woher kommt sie, wo will sie heute hin?",
      "en": "Make up a story about Tilla together – where does she come from and where is she going today?",
      "da": "Find sammen på en historie om Tilla – hvor kommer hun fra, og hvor vil hun hen i dag?"
    }
  },
  {
    "id": "tree-with-name",
    "texts": {
      "de": "Sucht einen Baum, der euch besonders gefällt, und gebt ihm einen Namen.",
      "en": "Find a tree you really like and give it a name.",
      "da": "Find et træ, I særligt godt kan lide, og giv det et navn."
    }
  },
  {
    "id": "mini-photo-walk",
    "texts": {
      "de": "Macht einen kleinen Fotospaziergang: Jedes Kind darf 3 Fotos von Dingen machen, die es schön findet.",
      "en": "Take a little photo walk: each child can take 3 photos of things they find beautiful.",
      "da": "Tag på en lille fototur: Hvert barn må tage 3 billeder af ting, det synes er smukke."
    }
  },
  {
    "id": "sound-guessing",
    "texts": {
      "de": "Spielt Geräusche-Raten: Einer macht ein Geräusch, die anderen müssen erraten, was es ist.",
      "en": "Play sound guessing: one person makes a sound, the others guess what it is.",
      "da": "Leg gætteleg med lyde: Én laver en lyd, og de andre gætter, hvad det er."
    }
  },
  {
    "id": "rainbow-hunt",
    "texts": {
      "de": "Sucht unterwegs nach Dingen in Regenbogenfarben – findet ihr alle sieben Farben?",
      "en": "Hunt for rainbow colours on the way – can you find all seven?",
      "da": "Kig efter ting i regnbuens farver undervejs – kan I finde alle syv?"
    }
  },
  {
    "id": "animal-spotting-count",
    "texts": {
      "de": "Zählt, wie viele Tiere ihr unterwegs entdeckt – echte und als Figuren oder auf Schildern.",
      "en": "Count how many animals you spot – real ones and those on signs or as statues.",
      "da": "Tæl, hvor mange dyr I opdager – både rigtige dyr og dem på skilte eller som figurer."
    }
  },
  {
    "id": "secret-family-sign",
    "texts": {
      "de": "Erfindet ein Familien-Geheimzeichen, das nur ihr kennt – zum Beispiel für „Ich hab dich lieb“.",
      "en": "Invent a secret family sign only you know – for example for 'I love you'.",
      "da": "Find på et hemmeligt familiesignal, som kun I kender – for eksempel for »Jeg elsker dig«."
    }
  },
  {
    "id": "child-navigator",
    "texts": {
      "de": "Lasst ein Kind den Weg ansagen: „Geradeaus“, „links“, „rechts“ – natürlich nur, wenn es sicher ist.",
      "en": "Let one child be the navigator: 'straight', 'left', 'right' – as long as it’s safe, of course.",
      "da": "Lad et barn være navigator: »Ligeud«, »til venstre«, »til højre« – selvfølgelig kun dér, hvor det er sikkert."
    }
  },
  {
    "id": "mini-pause-listening",
    "texts": {
      "de": "Macht eine Mini-Pause und legt euch für eine Minute ins Gras oder setzt euch auf eine Bank und lauscht.",
      "en": "Take a tiny break: lie down in the grass or sit on a bench for a minute and just listen.",
      "da": "Hold en mini-pause og læg jer i græsset eller sæt jer på en bænk i et minut og lyt."
    }
  },
  {
    "id": "memory-marker-stone",
    "texts": {
      "de": "Sucht einen Ort, an dem ihr gemeinsam einen kleinen Stein oder Zapfen als „Erinnerungszeichen“ ablegt.",
      "en": "Find a spot where you place a small stone or cone together as a little memory marker.",
      "da": "Find et sted, hvor I sammen lægger en lille sten eller kogle som et mindetegn."
    }
  },
  {
    "id": "i-spy-seasonal",
    "texts": {
      "de": "Spielt „Ich sehe was, was du nicht siehst“ mit Dingen, die typisch für euren Ort oder die Jahreszeit sind.",
      "en": "Play 'I spy with my little eye' using things typical for your area or the current season.",
      "da": "Leg »Jeg ser noget, som du ikke ser« med ting, der er typiske for stedet eller årstiden."
    }
  },
  {
    "id": "same-letter-hunt",
    "texts": {
      "de": "Jede Person sucht etwas, das mit demselben Buchstaben beginnt wie ihr Vorname.",
      "en": "Each person finds something that starts with the same letter as their first name.",
      "da": "Hver person finder noget, der begynder med samme bogstav som deres fornavn."
    }
  },
  {
    "id": "rhyme-game",
    "texts": {
      "de": "Erfindet ein Reimspiel: Einer sagt ein Wort, die anderen denken sich passende Reime dazu aus.",
      "en": "Play a rhyming game: one person says a word, the others think of words that rhyme with it.",
      "da": "Leg en rimleg: Én siger et ord, og de andre finder på ord, der rimer på det."
    }
  },
  {
    "id": "soft-and-hard-hunt",
    "texts": {
      "de": "Sucht unterwegs drei Dinge, die weich sind, und drei, die sich hart anfühlen.",
      "en": "Look for three things that feel soft and three that feel hard.",
      "da": "Find tre ting, der føles bløde, og tre, der føles hårde."
    }
  },
  {
    "id": "superhero-family",
    "texts": {
      "de": "Denkt euch eine kleine Superhelden-Familie aus. Welche Kräfte hat jede Person?",
      "en": "Invent a superhero family. What special power does each person have?",
      "da": "Find på en lille superheltefamilie. Hvilken superkraft har hver person?"
    }
  },
  {
    "id": "yes-and-story",
    "texts": {
      "de": "Spielt „Ja, und …“: Eine Person beginnt eine Geschichte. Jeder neue Satz muss mit „Ja, und …“ anfangen.",
      "en": "Play “Yes, and …”: one person starts a story. Every new sentence must begin with “Yes, and …”.",
      "da": "Leg »Ja, og …«: Én begynder en historie. Hver ny sætning skal starte med »Ja, og …«."
    }
  },
  {
    "id": "moving-things-count",
    "texts": {
      "de": "Zählt Dinge, die sich bewegen: Autos, Fahrräder, Blätter im Wind, Wolken…",
      "en": "Count things that are moving: cars, bikes, leaves in the wind, clouds…",
      "da": "Tæl ting, der bevæger sig: biler, cykler, blade i vinden, skyer …"
    }
  },
  {
    "id": "cloud-shapes",
    "texts": {
      "de": "Sucht Formen in den Wolken und gebt ihnen Namen oder kleine Geschichten.",
      "en": "Look for shapes in the clouds and give them names or little stories.",
      "da": "Kig efter former i skyerne og giv dem navne eller små historier."
    }
  },
  {
    "id": "animal-abc",
    "texts": {
      "de": "Spielt ein Tier-ABC: Für jeden Buchstaben des Alphabets nennt ihr ein Tier.",
      "en": "Play an animal ABC: for each letter of the alphabet, name an animal.",
      "da": "Leg dyre-ABC: For hvert bogstav i alfabetet nævner I et dyr."
    }
  },
  {
    "id": "playground-superpower",
    "texts": {
      "de": "Überlegt euch für jeden unterwegs gesehenen Spielplatz eine besondere Superkraft: Was ist hier das Beste?",
      "en": "For every playground you see, think of its superpower: what is the very best thing about it?",
      "da": "Find på en superkraft til hver legeplads, I ser: Hvad er det allerbedste ved lige præcis den?"
    }
  },
  {
    "id": "one-colour-hunt",
    "texts": {
      "de": "Wählt eine Farbe und sucht alle Dinge unterwegs, die diese Farbe haben.",
      "en": "Pick one colour and look for everything along the way that has this colour.",
      "da": "Vælg én farve og kig efter alle ting undervejs, som har den farve."
    }
  },
  {
    "id": "sound-bingo",
    "texts": {
      "de": "Macht ein Geräusche-Bingo: Jede Person denkt sich ein Geräusch aus, das sie heute gern hören würde.",
      "en": "Play sound bingo: each person chooses a sound they’d like to hear today.",
      "da": "Leg lydbingo: Hver person vælger en lyd, de gerne vil høre i dag."
    }
  },
  {
    "id": "bridges-and-tunnels-count",
    "texts": {
      "de": "Zählt, wie viele Brücken, Tunnel oder Unterführungen ihr auf der Tour entdeckt.",
      "en": "Count how many bridges, tunnels or underpasses you find on your trip.",
      "da": "Tæl, hvor mange broer, tunneller eller underføringer I opdager på turen."
    }
  },
  {
    "id": "if-i-were-an-animal",
    "texts": {
      "de": "Spielt „Wenn ich ein Tier wäre…“: Jede Person sagt, welches Tier sie heute wäre und warum.",
      "en": "Play 'If I were an animal…': everyone says which animal they would be today and why.",
      "da": "Leg »Hvis jeg var et dyr…«: Hver person fortæller, hvilket dyr de ville være i dag – og hvorfor."
    }
  },
  {
    "id": "letter-hunt-word",
    "texts": {
      "de": "Sucht unterwegs nach Buchstaben, aus denen ihr gemeinsam ein Wort legen könnt (z. B. auf Schildern).",
      "en": "Hunt for letters on signs that you can combine to form a word together.",
      "da": "Led efter bogstaver på skilte, som I kan sætte sammen til et ord."
    }
  },
  {
    "id": "family-song",
    "texts": {
      "de": "Erfindet ein kleines Familien-Lied mit einer einfachen Melodie, die ihr unterwegs summen könnt.",
      "en": "Invent a little family song with a simple melody you can hum on the way.",
      "da": "Find på en lille familiesang med en enkel melodi, som I kan nynne undervejs."
    }
  },
  {
    "id": "step-count-guess",
    "texts": {
      "de": "Zählt eure Schritte bis zum nächsten Ziel und schätzt vorher, wie viele es wohl sein werden.",
      "en": "Count your steps to the next stop and guess beforehand how many it will be.",
      "da": "Tæl jeres skridt til det næste mål og gæt på forhånd, hvor mange det mon bliver."
    }
  },
  {
    "id": "gratitude-game",
    "texts": {
      "de": "Spielt ein Dankbarkeits-Spiel: Jede Person nennt drei Dinge, für die sie heute dankbar ist.",
      "en": "Play a gratitude game: each person names three things they are thankful for today.",
      "da": "Leg en taknemmelighedsleg: Hver person nævner tre ting, de er taknemmelige for i dag."
    }
  },
  {
    "id": "reporter-game",
    "texts": {
      "de": "Stellt euch vor, ihr seid Reporter. Was würdet ihr über den Ort schreiben, an dem ihr gerade seid?",
      "en": "Pretend you are reporters. What would you write about the place you are in right now?",
      "da": "Forestil jer, at I er reportere. Hvad ville I skrive om stedet, hvor I er lige nu?"
    }
  },
  {
    "id": "favourite-smell",
    "texts": {
      "de": "Sucht einen „Lieblingsgeruch des Tages“ – vielleicht Wald, Meer, Regen oder frische Luft.",
      "en": "Find your 'favourite smell of the day' – maybe forest, sea, rain or just fresh air.",
      "da": "Find dagens »yndlingsduft« – måske skov, hav, regn eller bare frisk luft."
    }
  },
  {
    "id": "statue-game",
    "texts": {
      "de": "Spielt Statue: Einer ruft „Stopp!“, alle bleiben wie eingefroren stehen, bis jemand „Weiter!“ sagt.",
      "en": "Play statues: one person shouts “Stop!” and everyone freezes until someone says “Go!”.",
      "da": "Leg statue: Én råber »Stop!«, og alle står helt stille som statuer, indtil nogen siger »Fortsæt!«."
    }
  },
  {
    "id": "tiny-courage-challenge",
    "texts": {
      "de": "Überlegt euch für jeden eine kleine Mutaufgabe, die sich gut anfühlt – z. B. kurz barfuß gehen.",
      "en": "Think of a tiny courage challenge for each person that feels good – like walking barefoot for a moment.",
      "da": "Find på en lille modig udfordring til hver person, som føles rar – for eksempel at gå lidt barfodet."
    }
  },
  {
    "id": "nature-floor-art",
    "texts": {
      "de": "Sucht drei verschiedene Blätter oder Steine und legt daraus ein kleines Bodenbild.",
      "en": "Find three different leaves or stones and create a tiny artwork on the ground.",
      "da": "Find tre forskellige blade eller sten og lav et lille kunstværk på jorden."
    }
  },
  {
    "id": "time-travel-forward",
    "texts": {
      "de": "Spielt „Vorwärts-Zeitreise“: Wie könnte dieser Ort in 10 Jahren aussehen?",
      "en": "Play 'time travel forward': how might this place look in 10 years?",
      "da": "Leg »tidsrejse fremad«: Hvordan kunne dette sted se ud om 10 år?"
    }
  },
  {
    "id": "birdsong-count",
    "texts": {
      "de": "Zählt, wie viele verschiedene Vogelstimmen ihr hören könnt – ihr müsst sie nicht kennen, nur wahrnehmen.",
      "en": "Count how many different birdsongs you can hear – no need to know them, just notice them.",
      "da": "Tæl, hvor mange forskellige fuglestemmer I kan høre – I behøver ikke kende dem, bare lægge mærke til dem."
    }
  },
  {
    "id": "family-motto",
    "texts": {
      "de": "Erfindet für die Familie ein gemeinsames Motto für diesen Ausflug und sprecht es laut aus.",
      "en": "Invent a shared family motto for this trip and say it out loud together.",
      "da": "Find på et fælles familiemotto for denne tur og sig det højt sammen."
    }
  },
  {
    "id": "swap-places-sign",
    "texts": {
      "de": "Spielt „Wechsel den Platz“: Immer wenn ihr ein bestimmtes Zeichen seht (z. B. ein rotes Schild), tauschen zwei Personen die Plätze.",
      "en": "Play 'swap places': whenever you see a certain sign (for example a red sign), two people swap places.",
      "da": "Leg »Byt plads«: Hver gang I ser et bestemt tegn (for eksempel et rødt skilt), bytter to personer plads."
    }
  },
  {
    "id": "favourite-moment-of-day",
    "texts": {
      "de": "Zum Abschluss: Jede Person erzählt einen Lieblingsmoment des Tages – groß oder ganz winzig.",
      "en": "To finish, everyone shares a favourite moment from the day – big or tiny.",
      "da": "Til sidst: Hver person fortæller om ét yndlingsøjeblik fra dagen – stort eller bitte lille."
    }
  },
  {
    "id": "tilla-postcard",
    "texts": {
      "de": "Stellt euch vor, ihr schreibt Tilla eine Postkarte von diesem Ort: Was würdet ihr ihr erzählen?",
      "en": "Imagine you are writing Tilla a postcard from this place: what would you tell her?",
      "da": "Forestil jer, at I skriver et postkort til Tilla fra dette sted: Hvad ville I fortælle hende?"
    }
  },
  {
    "id": "mini-treasure-map",
    "texts": {
      "de": "Zeichnet gemeinsam eine Mini-Schatzkarte von dem Ort, an dem ihr seid, und versteckt einen kleinen Schatz (z. B. einen Stein oder Stock).",
      "en": "Draw a tiny treasure map of the place you are in and hide a little treasure (for example a stone or stick).",
      "da": "Tegn et lille skattekort over stedet, hvor I er, og gem en lille skat (for eksempel en sten eller en pind)."
    }
  },
  {
    "id": "weather-report-game",
    "texts": {
      "de": "Spielt Wetterbericht: Eine Person ist Reporter und beschreibt das Wetter so, als wäre es eine spannende Nachrichtensendung.",
      "en": "Play weather report: one person is the reporter and describes the weather as if it were breaking news.",
      "da": "Leg vejrudsendelse: Én er reporter og beskriver vejret, som om det var en vigtig nyhedsudsendelse."
    }
  },
  {
    "id": "shadow-shapes",
    "texts": {
      "de": "Spielt mit euren Schatten: Könnt ihr Tiere, Buchstaben oder lustige Figuren nur mit euren Schatten formen?",
      "en": "Play with your shadows: can you make animals, letters or funny shapes using only your shadows?",
      "da": "Leg med jeres skygger: Kan I lave dyr, bogstaver eller sjove figurer kun med jeres skygger?"
    }
  },
  {
    "id": "kindness-missions",
    "texts": {
      "de": "Denkt euch kleine Freundlichkeitsaufgaben aus: Eine Person lächelt drei Menschen an, eine andere sagt ganz bewusst „Danke“.",
      "en": "Think of little acts of kindness: one person smiles at three people, another takes a moment to say a heartfelt “thank you”.",
      "da": "Find på små venlige handlinger: Én smiler til tre mennesker, en anden tager sig tid til at sige et oprigtigt »tak«."
    }
  },
  {
    "id": "backpack-oracle",
    "texts": {
      "de": "Spielt Rucksack-Orakel: Jede Person zieht einen Gegenstand aus dem Rucksack und erzählt, warum er heute wichtig war oder noch wichtig werden könnte.",
      "en": "Play backpack oracle: each person takes an item from the backpack and explains why it mattered today or might come in useful later.",
      "da": "Leg rygsækorakel: Hver person tager en ting op af rygsækken og fortæller, hvorfor den var vigtig i dag eller kan blive nyttig senere."
    }
  },
  {
    "id": "three-sounds-memory",
    "texts": {
      "de": "Merkt euch drei Geräusche dieses Ortes und ahmt sie später am Tag noch einmal gemeinsam nach.",
      "en": "Choose three sounds from this place to remember, then try imitating them together later in the day.",
      "da": "Saml tre lyde fra dette sted, som I gerne vil huske, og efterlign dem sammen senere på dagen."
    }
  },
  {
    "id": "slow-motion-race",
    "texts": {
      "de": "Macht ein Zeitlupen-Rennen: Wer kann am langsamsten bis zu einem vereinbarten Punkt gehen, ohne stehenzubleiben?",
      "en": "Do a slow-motion race: who can walk to an agreed point the slowest without stopping?",
      "da": "Gå om kap i langsom gengivelse: Hvem kan gå langsomst hen til et aftalt punkt uden at stoppe?"
    }
  },
  {
    "id": "tiny-museum",
    "texts": {
      "de": "Eröffnet ein Mini-Museum: Jedes Kind sucht einen Fund (Stein, Blatt, Ticket) und erklärt, warum er in die Ausstellung kommt.",
      "en": "Open a tiny museum: each child finds one object (stone, leaf, ticket) and explains why it belongs in the exhibition.",
      "da": "Åbn et mini-museum: Hvert barn finder en ting (sten, blad, billet) og forklarer, hvorfor den skal med i udstillingen."
    }
  },
  {
    "id": "feeling-check-in-weather",
    "texts": {
      "de": "Beschreibt eure Gefühle wie das Wetter: „In mir ist gerade Sonnenschein, leichter Regen oder Wind.“ Hört einander zu, ohne zu werten.",
      "en": "Describe your feelings as weather: “Inside, I feel sunny, rainy or windy.” Listen to one another without judging.",
      "da": "Beskriv jeres følelser som vejr: »Indeni er der sol, let regn eller blæst.« Lyt til hinanden uden at dømme."
    }
  },
  {
    "id": "future-self-message",
    "texts": {
      "de": "Sprecht eine kurze Botschaft an euer Zukunfts-Ich: Was soll es sich von diesem Tag merken?",
      "en": "Say a short message to your future self: what would you like to remember about today?",
      "da": "Sig en kort besked til jeres fremtidige jeg: Hvad skal det huske fra denne dag?"
    }
  },
  {
    "id": "tilla-route-name",
    "texts": {
      "de": "Gebt eurer heutigen Route einen Namen, so als wäre sie ein offizieller Tilla-Weg – wie würde er heißen?",
      "en": "Give today’s route a name as if it were an official Tilla trail – what would it be called?",
      "da": "Giv dagens rute et navn, som om det var en officiel Tilla-sti – hvad skulle den hedde?"
    }
  }
];
let playIdeas = FALLBACK_PLAY_IDEAS;
let playIdeasLoaded = false;

/** Index der zuletzt ausgegebenen Spielidee (zur Entdopplung). */
let lastPlayIdeaIndex = -1;

/* --------------------------------------
 * Helpers
 * ----------------------------------- */

/**
 * JSON-Parsing mit Fallback.
 * @template T
 * @param {string|null} raw
 * @param {T} fallback
 * @returns {T}
 */
function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed === "object") {
      return /** @type {T} */ (parsed);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Normalisiert eine Sprache auf "de", "en" oder "da".
 * Alles außer "en" und "da" wird bewusst auf "de" gefaltet.
 * @param {string | null | undefined} lang
 * @returns {LangCode}
 */
function normalizeLang(lang) {
  if (!lang) return "de";

  const v = String(lang).toLowerCase();

  if (v.startsWith("en")) return "en";
  if (v === "da" || v.startsWith("da") || v === "dk" || v.startsWith("dk")) {
    return "da";
  }

  return "de";
}

/**
 * Sprache aus localStorage holen (falls gültig).
 * @returns {LangCode | null}
 */
function getStoredLang() {
  try {
    if (typeof localStorage === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_LANG_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return /** @type {LangCode} */ (stored);
    }
  } catch {
    // Storage ist optional – Fallback greift unten
  }
  return null;
}

/**
 * Sprache aus dem Browser ableiten.
 * Nutzt `navigator.languages` falls vorhanden, sonst `navigator.language`.
 * @returns {LangCode | null}
 */
function detectBrowserLang() {
  if (typeof navigator === "undefined") return null;

  const candidates = [];

  if (Array.isArray(navigator.languages)) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }

  for (const value of candidates) {
    if (!value) continue;
    const candidate = String(value).toLowerCase().split(/[-_]/)[0];
    if (!["de", "en", "da", "dk"].includes(candidate)) continue;
    const code = normalizeLang(candidate);
    if (SUPPORTED_LANGS.includes(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Interner Setter inkl. Persistenz & lang-Attribut auf <html>.
 * @param {LangCode} lang
 */
function setLangInternal(lang) {
  currentLang = normalizeLang(lang || DEFAULT_LANG);

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_LANG_KEY, currentLang);
    }
  } catch {
    // Wenn Storage nicht verfügbar ist, ist das kein Beinbruch.
  }

  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("lang", currentLang);
  }
}

/* --------------------------------------
 * Laden von Übersetzungen & Spielideen
 * ----------------------------------- */

/**
 * Lädt die JSON-Übersetzungen für eine Sprache (lazy).
 * Erwartet Datei: data/i18n/<lang>.json
 * @param {LangCode} lang
 */
async function loadMessagesForLang(lang) {
  const target = normalizeLang(lang);

  // Bereits geladen?
  if (loadedLanguages.has(target)) return;

  try {
    const json = await fetchJsonWithTimeout(`data/i18n/${target}.json?v=20261106-app-feinschliff`, 8000);
    if (json && typeof json === "object" && !Array.isArray(json)) {
      const flat = {};
      const flatten = (value, prefix = "") => {
        for (const [key, item] of Object.entries(value)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof item === "string") flat[path] = item;
          else if (item && typeof item === "object" && !Array.isArray(item)) flatten(item, path);
        }
      };
      flatten(json);
      messagesByLang[target] = { ...FALLBACK_MESSAGES[target], ...flat };
      loadedLanguages.add(target);
    } else {
      console.warn(
        "[i18n] Unerwartetes Format für Sprachdatei:",
        target,
        json
      );
      messagesByLang[target] = { ...FALLBACK_MESSAGES[target] };
    }
  } catch (err) {
    console.error("[i18n] Fehler beim Laden der Sprache", target, err);
    // Keep complete bundled translations. Failed requests may be retried by init().
    messagesByLang[target] = { ...FALLBACK_MESSAGES[target] };
  }
}

/**
 * Lädt Spielideen aus data/play-ideas.json.
 * Struktur (aktuell):
 * [{ id, texts: { de, en, da }, ... }, …]
 */
async function loadPlayIdeas() {
  if (playIdeasLoaded) return;

  try {
    const json = await fetchJsonWithTimeout("data/play-ideas.json", 8000);
    if (Array.isArray(json)) {
      const previousId = playIdeas[lastPlayIdeaIndex]?.id;
      playIdeas = json.length ? json : FALLBACK_PLAY_IDEAS;
      lastPlayIdeaIndex = previousId ? playIdeas.findIndex(idea => idea.id === previousId) : -1;
      playIdeasLoaded = true;
    } else {
      console.warn("[i18n] play-ideas.json ist kein Array.");
      playIdeas = FALLBACK_PLAY_IDEAS;
    }
  } catch (err) {
    console.error("[i18n] Fehler beim Laden der Spielideen:", err);
    playIdeas = FALLBACK_PLAY_IDEAS;
  }
}

/* --------------------------------------
 * Public API
 * ----------------------------------- */

/**
 * Initialisiert i18n:
 *  - lädt de/en/da Übersetzungen
 *  - lädt Spielideen
 *  - bestimmt Startsprache (lang-Param -> localStorage -> Browser -> de)
 *  - setzt <html lang="…">
 *  - aktualisiert DOM (data-i18n / data-i18n-placeholder)
 *
 * @param {LangCode} [lang] – optionaler Override
 * @returns {Promise<void>}
 */
async function init(lang) {
  const stored = getStoredLang();
  const browser = detectBrowserLang();
  const pathLang = typeof location !== "undefined" ? location.pathname.match(/\/(en|da)\/(?:index\.html)?$/)?.[1] : null;
  const target = normalizeLang(lang || pathLang || stored || browser || DEFAULT_LANG);

  // Complete bundled translations make the UI usable immediately.
  setLangInternal(target);
  applyTranslations(typeof document !== "undefined" ? document : undefined);

  // Refresh in parallel; do not reset a language chosen while loading.
  await Promise.all([
    loadMessagesForLang("de"),
    loadMessagesForLang("en"),
    loadMessagesForLang("da"),
    loadPlayIdeas()
  ]);

}

/**
 * Sprache wechseln (de/en/da) und DOM aktualisieren.
 * @param {LangCode} lang
 */
function setLanguage(lang) {
  const normalized = normalizeLang(lang);


  setLangInternal(normalized);
  applyTranslations(typeof document !== "undefined" ? document : undefined);
}

/**
 * Aktuelle Sprache holen.
 * @returns {LangCode}
 */
function getLanguage() {
  return currentLang;
}

/**
 * Übersetzungsfunktion.
 * Nutzt die aktuell gesetzte Sprache.
 *
 * @param {string} key
 * @param {string} [fallback]
 * @returns {string}
 */
function t(key, fallback) {
  const table = messagesByLang[currentLang] || {};
  // nullish coalescing: erlaubt explizit leere Strings
  const value = table[key] ?? fallback ?? key;
  return typeof value === "string" ? value : (fallback ?? key);
}

/**
 * Texte im DOM updaten:
 *  - data-i18n → textContent
 *  - data-i18n-placeholder → placeholder
 *
 * @param {ParentNode} [root=document]
 */
function applyTranslations(root = typeof document !== "undefined" ? document : null) {
  if (!root || typeof root.querySelectorAll !== "function") return;

  // Inhalt (Text)
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const value = t(key);
    if (value != null && value !== key) setTextWithHearts(el, value);
  });

  for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
    root.querySelectorAll(`[data-i18n-${attribute}]`).forEach((el) => {
      const key = el.getAttribute(`data-i18n-${attribute}`);
      const value = t(key, el.getAttribute(attribute) || "");
      el.setAttribute(attribute, value);
    });
  }

  // Placeholder
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    const value = t(key);
    if (value != null) el.setAttribute("placeholder", value);
  });
}

/**
 * Liefert eine zufällige Spielidee in der aktuellen Sprache.
 * Unterstützt sowohl:
 *   { texts: { de, en, da } }
 * als auch das ältere Schema:
 *   { de, en, da }
 * Versucht, nicht zweimal dieselbe Idee direkt hintereinander zu liefern.
 *
 * @returns {string}
 */
function getRandomPlayIdea() {
  if (!playIdeas.length) return "";

  let idx;
  if (playIdeas.length === 1) {
    idx = 0;
  } else {
    let tries = 0;
    do {
      idx = Math.floor(Math.random() * playIdeas.length);
      tries++;
    } while (idx === lastPlayIdeaIndex && tries < 5);
  }

  lastPlayIdeaIndex = idx;
  const idea = playIdeas[idx];
  if (!idea || typeof idea !== "object") return "";

  // Neues Schema: idea.texts.{de,en,da}, sonst flach {de,en,da}
  const texts =
    (idea.texts && typeof idea.texts === "object" ? idea.texts : null) || idea;

  /** @type {Array<LangCode>} */
  const langOrder = [currentLang, "de", "en", "da"];

  for (const code of langOrder) {
    if (texts[code]) {
      return texts[code];
    }
  }

  return "";
}

/* --------------------------------------
 * Globales Objekt + ES-Module Export
 * ----------------------------------- */

/**
 * @typedef {Object} I18nApi
 * @property {(lang?: LangCode) => Promise<void>} init
 * @property {(lang: LangCode) => void} setLanguage
 * @property {() => LangCode} getLanguage
 * @property {(key: string, fallback?: string) => string} t
 * @property {(root?: ParentNode) => void} applyTranslations
 * @property {() => string} getRandomPlayIdea
 */

/** @type {I18nApi} */
const I18N = {
  init,
  setLanguage,
  getLanguage,
  t,
  applyTranslations,
  getRandomPlayIdea
};

// Für app.js (nutzt window.I18N)
if (typeof window !== "undefined") {
  window.I18N = I18N;
}

// ES-Module-Exports (falls du direkt importieren willst)
export {
  init as initI18n,
  setLanguage,
  getLanguage,
  t,
  applyTranslations,
  getRandomPlayIdea,
  I18N
};

export function getCurrentPlayIdea() {
  const idea = playIdeas[lastPlayIdeaIndex];
  const texts = idea?.texts || idea;
  return texts?.[currentLang] || "";
}

export default I18N;