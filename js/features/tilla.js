// js/features/tilla.js
// ------------------------------------------------------
// Tilla – eure Schildkröten-Begleiterin für Familien-Abenteuer 🐢
//
// Integration (in app.js):
//
//   import { TillaCompanion } from "./features/tilla.js";
//
//   const tilla = new TillaCompanion({
//     getText: (key) => t(key)
//   });
//
// Öffentliche API:
//  - onLanguageChanged()
//  - setTravelMode(mode)
//  - onPlusActivated()
//  - onDaylogSaved(memoryCount)
//  - setMemoryCount(memoryCount)
//  - onFavoriteAdded()
//  - onFavoriteRemoved()
//  - onNoSpotsFound()
//  - onSpotsFound()
//  - onFiltersUpdated(context)
//  - onCompassApplied(context)
//  - showPlayIdea(text)
//  - destroy()
//
// Erinnerungszettel:
//  - Beim Speichern wird die kurze Animation ausgelöst.
//  - Solange Erinnerungen vorhanden sind, bleibt er sichtbar.
//  - Beim Laden setzt app.js die vorhandene Erinnerungsanzahl.
//  - Nach dem Löschen setzt app.js die verbleibende Anzahl.
// ------------------------------------------------------

"use strict";

import { setTextWithHearts } from "../utils/dom.js?v=20261010-unified-4";

/**
 * Fallback-Texte, falls getText() nichts liefert
 * oder noch nicht verbunden ist.
 *
 * Struktur:
 * FALLBACK_TEXTS[lang][key] = string | string[]
 */
const FALLBACK_TEXTS = Object.freeze({
  de: {
    turtle_intro_1: [
      "Hallo, ich bin Tilla – eure kleine Schildkröten-Begleiterin für Familien-Abenteuer.",
      "Ich bin Tilla. Mit mir wird eure Karte zu einer Schatzkarte voller Familienmomente."
    ],
    turtle_intro_2: [
      "Gerade finde ich keinen passenden Spot. Vielleicht passt heute ein Spaziergang ganz in der Nähe – oder ihr dreht den Radius ein Stück weiter auf. 🐢",
      "Mit diesen Filtern ist die Karte gerade leer. Probiert einen größeren Radius oder eine andere Kategorie – irgendwo wartet ein guter Ort auf euch. 🐢"
    ],
    turtle_after_daylog_save: [
      "Schön, dass ihr euren Tag festhaltet. Aus kleinen Momenten werden wertvolle Erinnerungen. {heart}",
      "Ein kleiner Moment von heute kann morgen eine wertvolle Erinnerung sein. {heart}"
    ],
    turtle_after_fav_added: [
      "Diesen Ort merkt ihr euch – eine kleine Perle auf eurer Familienkarte. ⭐",
      "Gut gewählt! Dieser Spot ist jetzt Teil eurer persönlichen Schatzkarte. ⭐"
    ],
    turtle_after_fav_removed: [
      "Alles gut – manchmal passen Orte nur zu bestimmten Phasen. Ich helfe euch, neue zu finden. 🐢",
      "Manche Spots dürfen gehen, damit Platz für neue Highlights ist. Wir finden gemeinsam frische Lieblingsorte. 🐢"
    ],
    turtle_trip_mode: [
      "Ihr seid unterwegs – ich halte Ausschau nach guten Zwischenstopps für euch. 🚐",
      "Roadtrip-Tag? Dann suchen wir jetzt nach Orten zum Toben, Auftanken und Durchatmen. 🚐"
    ],
    turtle_everyday_mode: [
      "Alltag darf auch leicht sein. Lass uns schauen, was in eurer Nähe ein Lächeln zaubert. 🌿",
      "Vielleicht reicht heute ein kleiner Ausflug um die Ecke. Ich zeige euch, was in eurer Nähe guttut. 🌿"
    ],
    turtle_plus_activated: [
      "Family Spots Plus ist aktiv – jetzt entdecke ich auch Rastplätze, Stellplätze und Camping-Spots für euch. ✨",
      "Plus ist an Bord! Ab jetzt achte ich extra auf Spots für WoMo, Camping und große Abenteuer. ✨"
    ],
    turtle_compass_everyday: [
      "Ich habe den Radius auf eure Alltagslaune eingestellt – wir bleiben in eurer Nähe. 🌿",
      "Kompass sagt: Heute reicht ein kleines Abenteuer in eurer Umgebung – schaut mal, was ich gefunden habe."
    ],
    turtle_compass_trip: [
      "Kompass ist gesetzt – ich schaue jetzt in einem größeren Radius nach Zwischenstopps für eure Tour. 🚐",
      "Für euren Unterwegs-Tag habe ich den Radius großzügig gestellt. Wir suchen nach guten Pausenplätzen für euch. 🚐"
    ]
  },

  en: {
    turtle_intro_1: [
      "Hi, I’m Tilla – your little turtle companion for family adventures.",
      "I’m Tilla. Together we’ll turn this map into a treasure map of family moments."
    ],
    turtle_intro_2: [
      "I can’t find a matching spot right now. Maybe a short walk nearby is just right today – or try a wider radius. 🐢",
      "No spots match these filters. Try a wider radius or a different category – there’s a lovely place out there for you. 🐢"
    ],
    turtle_after_daylog_save: [
      "It’s lovely that you’re capturing your day. Little moments can become treasured memories. {heart}",
      "Today’s little moment can become tomorrow’s treasured memory. {heart}"
    ],
    turtle_after_fav_added: [
      "You’ve saved this place – a small gem on your family map. ⭐",
      "Great choice! This spot is now part of your personal treasure map. ⭐"
    ],
    turtle_after_fav_removed: [
      "That’s fine – a place may not always be right for your family. I’ll help you find new favourites. 🐢",
      "There’s always room for new discoveries. We’ll find new favourites together. 🐢"
    ],
    turtle_trip_mode: [
      "You’re on the road – I’ll watch out for good stopovers for you. 🚐",
      "Road trip day? Let’s look for places to play, recharge and breathe deeply. 🚐"
    ],
    turtle_everyday_mode: [
      "Everyday life can feel light, too. Let’s see what nearby spot can bring a smile today. 🌿",
      "Maybe a short trip around the corner is just right today. I’ll help you find somewhere lovely nearby. 🌿"
    ],
    turtle_plus_activated: [
      "Family Spots Plus is active – I can now show you rest areas, motorhome stops and campsites too. ✨",
      "Plus is on board! I’ll keep an eye out for motorhome stops, campsites and bigger adventures. ✨"
    ],
    turtle_compass_everyday: [
      "I’ve set the radius to match your everyday mood – we’ll stay close to home. 🌿",
      "Compass says: today a small nearby adventure is enough – let’s see what I’ve found for you."
    ],
    turtle_compass_trip: [
      "Compass set – I’m now looking in a wider radius for good stopovers on your trip. 🚐",
      "I’ve widened the radius for your day on the road. Let’s find some lovely places to stop and recharge. 🚐"
    ]
  },
  da: {
    "turtle_intro_1": [
        "Hej, jeg er Tilla – jeres lille skildpadde og ledsager på familieeventyr.",
        "Jeg er Tilla. Sammen gør vi kortet til et skattekort fyldt med familieminder."
    ],
    "turtle_intro_2": [
        "Lige nu kan jeg ikke finde et passende spot. Måske passer en lille gåtur i nærheden i dag – eller I kan øge radius lidt. 🐢",
        "Med disse filtre er kortet tomt. Prøv en større radius eller en anden kategori – et godt sted venter på jer. 🐢"
    ],
    "turtle_after_daylog_save": [
        "Dejligt, at I gemmer jeres dag. Små øjeblikke kan blive til kære minder. {heart}",
        "Et lille øjeblik i dag kan blive et kært minde i morgen. {heart}"
    ],
    "turtle_after_fav_added": [
        "I har gemt dette sted – en lille perle på jeres familiekort. ⭐",
        "Godt valg! Dette spot er nu en del af jeres personlige skattekort. ⭐"
    ],
    "turtle_after_fav_removed": [
        "Helt i orden – nogle steder passer kun i en periode. Jeg hjælper jer med at finde nye. 🐢",
        "Nogle spots giver plads til nye oplevelser. Vi finder nye favoritter sammen. 🐢"
    ],
    "turtle_trip_mode": [
        "I er på vej – jeg holder øje med gode stop til jer. 🚐",
        "En dag på farten? Lad os finde steder til leg, nye kræfter og en rolig pause. 🚐"
    ],
    "turtle_everyday_mode": [
        "Hverdagen må også gerne være let. Lad os se, hvad der kan bringe et smil frem i nærheden. 🌿",
        "Måske er en lille tur lige om hjørnet nok i dag. Jeg viser jer gode steder tæt på. 🌿"
    ],
    "turtle_plus_activated": [
        "Family Spots Plus er aktiv – nu finder jeg også rastepladser, autocamperpladser og campingsteder til jer. ✨",
        "Plus er med på turen! Nu holder jeg ekstra øje med spots til autocampere, camping og store eventyr. ✨"
    ],
    "turtle_compass_everyday": [
        "Jeg har tilpasset radius til jeres hverdag – vi holder os i nærheden. 🌿",
        "Kompasset siger: I dag er et lille eventyr tæt på nok – se, hvad jeg har fundet."
    ],
    "turtle_compass_trip": [
        "Kompasset er indstillet – jeg søger nu i en større radius efter gode stop på jeres tur. 🚐",
        "Til jeres dag på farten har jeg øget radius. Vi leder efter gode steder til en pause. 🚐"
    ]
}
});

/**
 * Ermittelt die aktive Sprache.
 * - bevorzugt I18N.getLanguage()
 * - fällt auf <html lang="…"> zurück
 * - bestehender Fallback: nicht unterstützte Sprachen → "de"
 *
 * @returns {"de"|"en"|"da"}
 */
function getActiveLang() {
  try {
    if (
      typeof window !== "undefined" &&
      window.I18N &&
      typeof window.I18N.getLanguage === "function"
    ) {
      const lang = String(
        window.I18N.getLanguage() || ""
      ).toLowerCase();

      if (lang.startsWith("en")) return "en";
      if (lang.startsWith("da")) return "da";
      return "de";
    }
  } catch {
    // ignore
  }

  if (
    typeof document !== "undefined" &&
    document.documentElement
  ) {
    const langAttr = (
      document.documentElement.lang || "de"
    ).toLowerCase();

    if (langAttr.startsWith("en")) return "en";
    if (langAttr.startsWith("da")) return "da";
  }

  return "de";
}

/**
 * @typedef {"intro"
 *         |"everyday"
 *         |"trip"
 *         |"plus"
 *         |"daylog"
 *         |"fav-added"
 *         |"fav-removed"
 *         |"no-spots"
 *         |"play-idea"} TillaState
 *
 * @typedef {"everyday"|"trip"} TravelMode
 */

/**
 * TillaCompanion
 *
 * Steuert die Texte im Tilla-Sidebar-Widget
 * und den Erinnerungszettel am Brustbeutel.
 *
 * Optionen:
 * - getText(key): optionaler Übersetzer
 */
export class TillaCompanion {
  /**
   * @param {{ getText?: (key: string) => string }} [options]
   */
  constructor(options = {}) {
    /**
     * Optionaler Übersetzungs-Callback.
     * @type {((key: string) => string) | null}
     */
    this.getText =
      typeof options.getText === "function"
        ? options.getText
        : null;

    /**
     * Ziel-Element für Tilla-Text.
     * @type {HTMLElement | null}
     */
    this.textEl =
      typeof document !== "undefined"
        ? document.getElementById("tilla-sidebar-text")
        : null;

    /** @type {TillaState} */
    this.state = "intro";

    /** @type {TravelMode | null} */
    this.travelMode = "everyday";

    /** Timestamp der letzten Interaktion. */
    this.lastInteraction = Date.now();

    /**
     * Letzte Textvariante pro Key.
     * @type {Record<string, number>}
     * @private
     */
    this._lastVariantIndex = {};

    /**
     * Dekorativer Erinnerungszettel.
     * @type {HTMLElement | null}
     */
    this.memoryNoteEl =
      typeof document !== "undefined"
        ? document.getElementById("tilla-memory-note")
        : null;

    /**
     * Anzahl der vorhandenen Erinnerungen.
     * app.js hält diesen Wert aktuell.
     */
    this.memoryCount = 0;

    /** @private */
    this._memoryAnimationTimer = null;

    /** @private */
    this._onMemoryAnimationEnd = (event) => {
      if (
        event.target === this.memoryNoteEl &&
        ["tilla-store-memory", "tilla-watercolor-note"].includes(event.animationName)
      ) {
        this._stopMemoryAnimation();
      }
    };

    this.memoryNoteEl?.addEventListener(
      "animationend",
      this._onMemoryAnimationEnd
    );

    // Bis app.js die gespeicherte Anzahl übergibt, bleibt er verborgen.
    this.setMemoryCount(0);

    if (!this.textEl) {
      console.warn(
        "[Tilla] Element mit ID #tilla-sidebar-text wurde nicht gefunden. Tilla bleibt still."
      );
      return;
    }

    this._renderState();
  }

  /**
   * Rendert den aktuellen Zustand nach einem Sprachwechsel neu.
   */
  onLanguageChanged() {
    if (!this.textEl) return;
    this._renderState();
  }

  /**
   * Setzt den Reisemodus.
   * - "everyday": Alltagsmodus
   * - "trip": Unterwegs / Roadtrip
   * - null/undefined: zurück zum Intro
   *
   * @param {TravelMode | null | undefined} mode
   */
  setTravelMode(mode) {
    if (!this.textEl) return;

    if (mode == null) {
      this.travelMode = null;
      this.state = "intro";
      this.lastInteraction = Date.now();
      this._renderState();
      return;
    }

    if (mode !== "everyday" && mode !== "trip") {
      return;
    }

    this.travelMode = mode;
    this.lastInteraction = Date.now();
    this.state = mode;
    this._renderState();
  }

  /**
   * Wird aufgerufen, wenn Plus aktiviert wurde.
   */
  onPlusActivated() {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();
    this.state = "plus";
    this._renderState();
  }

  /**
   * Wird nach dem Speichern einer Erinnerung aufgerufen.
   *
   * Optional übergibt app.js die aktuelle Gesamtanzahl.
   * Der bisherige Aufruf ohne Argument bleibt kompatibel.
   *
   * @param {number} [memoryCount]
   */
  onDaylogSaved(memoryCount) {
    const count = Number.isFinite(memoryCount)
      ? memoryCount
      : Math.max(1, this.memoryCount);

    this.setMemoryCount(count);
    this._animateMemoryNote();

    if (!this.textEl) return;

    this.lastInteraction = Date.now();
    this.state = "daylog";
    this._renderState();
  }

  /**
   * Aktualisiert die Sichtbarkeit des Zettels.
   *
   * Diese Methode startet keine Animation und ändert
   * Tillas Text nicht.
   *
   * app.js ruft sie beim Laden und nach dem Löschen auf.
   *
   * @param {number} memoryCount
   */
  setMemoryCount(memoryCount) {
    this.memoryCount = Number.isFinite(memoryCount)
      ? Math.max(0, Math.floor(memoryCount))
      : 0;

    if (!this.memoryNoteEl) return;

    const hasMemories = this.memoryCount > 0;

    if (!hasMemories) {
      this._stopMemoryAnimation();
    }

    this.memoryNoteEl.hidden = !hasMemories;
  }

  /**
   * Startet die kurze Speicherbewegung.
   *
   * Bei reduzierter Bewegung erscheint nur der ruhige Zettel.
   *
   * @private
   */
  _animateMemoryNote() {
    const note = this.memoryNoteEl;

    if (!note || this.memoryCount === 0) return;

    this._stopMemoryAnimation();
    note.hidden = false;

    try {
      if (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
      ) {
        return;
      }
    } catch {
      // Ohne matchMedia funktioniert die normale Animation weiterhin.
    }

    // Neustart auch bei unmittelbar aufeinanderfolgenden Speicherungen.
    void note.offsetWidth;
    note.classList.add("is-storing");

    // Fallback, falls animationend ausbleibt.
    this._memoryAnimationTimer = setTimeout(() => {
      this._stopMemoryAnimation();
    }, 1500);
  }

  /**
   * Entfernt den Animationszustand.
   *
   * Der Zettel bleibt bei vorhandenen Erinnerungen
   * über seinen normalen CSS-Zustand sichtbar.
   *
   * @private
   */
  _stopMemoryAnimation() {
    if (this._memoryAnimationTimer !== null) {
      clearTimeout(this._memoryAnimationTimer);
      this._memoryAnimationTimer = null;
    }

    this.memoryNoteEl?.classList.remove("is-storing");
  }

  /**
   * Entfernt Listener und Timer, falls die Instanz ersetzt wird.
   */
  destroy() {
    this._stopMemoryAnimation();

    this.memoryNoteEl?.removeEventListener(
      "animationend",
      this._onMemoryAnimationEnd
    );
  }

  /**
   * Wird aufgerufen, wenn ein Spot als Favorit markiert wurde.
   */
  onFavoriteAdded() {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();
    this.state = "fav-added";
    this._renderState();
  }

  /**
   * Wird aufgerufen, wenn ein Spot aus den Favoriten entfernt wurde.
   */
  onFavoriteRemoved() {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();
    this.state = "fav-removed";
    this._renderState();
  }

  /**
   * Synchronisiert bestätigte Filterergebnisse mit Tillas Zustand.
   * @param {{status?: string, filteredSpotsCount?: number}} context
   */
  onFiltersUpdated({ status = "ready", filteredSpotsCount } = {}) {
    // Loading failures and pending requests do not mean that filters found zero.
    if (status !== "ready") {
      if (this.state === "no-spots") {
        this.state = "intro";
        this._renderState();
      }
      return;
    }
    if (!Number.isInteger(filteredSpotsCount) || filteredSpotsCount < 0) return;
    if (filteredSpotsCount === 0) {
      if (this.state !== "no-spots") this.onNoSpotsFound();
    } else if (this.state === "no-spots") {
      this.onSpotsFound();
    }
    // Positive background refreshes retain play ideas and interaction feedback.
  }

  /** Wird nur bei tatsächlich leeren, fertig geladenen Ergebnissen aufgerufen. */
  onNoSpotsFound() {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();
    this.state = "no-spots";
    this._renderState();
  }

  /**
   * Wird aufgerufen, wenn wieder Spots gefunden werden.
   */
  onSpotsFound() {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();

    if (this.travelMode === "trip") {
      this.state = "trip";
    } else if (this.travelMode === "everyday") {
      this.state = "everyday";
    } else {
      this.state = "intro";
    }

    this._renderState();
  }

  /**
   * Wird aufgerufen, wenn der Kompass angewendet wurde.
   *
   * @param {{
   *   travelMode?: TravelMode | null,
   *   radiusStep?: number
   * }} [context]
   */
  onCompassApplied(context = {}) {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();

    const mode = context.travelMode ?? this.travelMode;

    const key =
      mode === "trip"
        ? "turtle_compass_trip"
        : "turtle_compass_everyday";

    const text = this._t(key);
    setTextWithHearts(this.textEl, text);

    if (mode === "trip") {
      this.state = "trip";
      this.travelMode = "trip";
    } else if (mode === "everyday" || mode == null) {
      this.state = "everyday";

      if (mode) {
        this.travelMode = mode;
      }
    }
  }

  /**
   * Zeigt eine Spielidee direkt im Tilla-Panel.
   *
   * @param {string} text
   */
  showPlayIdea(text) {
    if (!this.textEl) return;

    this.lastInteraction = Date.now();
    this.state = "play-idea";
    setTextWithHearts(this.textEl, text);
  }

  /**
   * Interne Übersetzungsfunktion:
   * 1. Übersetzungs-Callback
   * 2. Statische Fallback-Texte
   *
   * @param {string} key
   * @returns {string}
   * @private
   */
  _t(key) {
    if (this.getText) {
      try {
        const value = this.getText(key);

        if (
          typeof value === "string" &&
          value.trim() !== "" &&
          value !== key
        ) {
          return value;
        }
      } catch (err) {
        console.warn(
          "[Tilla] Fehler beim getText-Aufruf:",
          err
        );
      }
    }

    const lang = getActiveLang();
    const bundle = FALLBACK_TEXTS[lang] || FALLBACK_TEXTS.de;
    const entry = bundle[key];

    if (Array.isArray(entry) && entry.length > 0) {
      return this._pickVariant(key, entry);
    }

    if (typeof entry === "string") {
      return entry;
    }

    return key;
  }

  /**
   * Vermeidet nach Möglichkeit direkte Textwiederholungen.
   *
   * @param {string} key
   * @param {string[]} variants
   * @returns {string}
   * @private
   */
  _pickVariant(key, variants) {
    if (!Array.isArray(variants) || variants.length === 0) {
      return "";
    }

    const lastIndex = this._lastVariantIndex[key];
    let index;

    if (variants.length === 1) {
      index = 0;
    } else {
      do {
        index = Math.floor(Math.random() * variants.length);
      } while (index === lastIndex);
    }

    this._lastVariantIndex[key] = index;
    return variants[index];
  }

  /**
   * Rendert den aktuellen Textzustand.
   *
   * Eine aktive Spielidee wird hier nicht überschrieben.
   * Der Erinnerungszettel wird unabhängig davon gesteuert.
   *
   * @private
   */
  _renderState() {
    if (!this.textEl) return;

    if (this.state === "play-idea") {
      return;
    }

    let text = "";

    switch (this.state) {
      case "intro": {
        const intro = this._t("turtle_intro_1");

        if (this.travelMode === "trip") {
          text = `${intro} ${this._t("turtle_trip_mode")}`;
        } else if (this.travelMode === "everyday") {
          text = `${intro} ${this._t("turtle_everyday_mode")}`;
        } else {
          text = intro;
        }

        break;
      }

      case "everyday": {
        text = this._t("turtle_everyday_mode");
        break;
      }

      case "trip": {
        text = this._t("turtle_trip_mode");
        break;
      }

      case "plus": {
        text = this._t("turtle_plus_activated");
        break;
      }

      case "daylog": {
        text = this._t("turtle_after_daylog_save");
        break;
      }

      case "fav-added": {
        text = this._t("turtle_after_fav_added");
        break;
      }

      case "fav-removed": {
        text = this._t("turtle_after_fav_removed");
        break;
      }

      case "no-spots": {
        text = this._t("turtle_intro_2");
        break;
      }

      default: {
        const intro = this._t("turtle_intro_1");

        if (this.travelMode === "trip") {
          text = `${intro} ${this._t("turtle_trip_mode")}`;
        } else if (this.travelMode === "everyday") {
          text = `${intro} ${this._t("turtle_everyday_mode")}`;
        } else {
          text = intro;
        }
      }
    }

    // Tilla already has an illustration. Keep status copy independent of emoji fonts.
    setTextWithHearts(this.textEl, text.replace(/ +[🐢🌿🚐⭐✨]/gu, ""));
  }
}
