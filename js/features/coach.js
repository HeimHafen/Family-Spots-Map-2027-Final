// js/features/coach.js
// Familien-Kompass / Mini-Life-Coach

import { getLanguageInfo } from "../../utils/lang.js";

const RADIUS_LEVELS_KM = [5, 15, 30, 60, null];

const RADIUS_DESCRIPTIONS = [
  {
    max: 6,
    de: "ganz in eurer Nähe, perfekt für ein kleines Micro-Abenteuer",
    da: "helt tæt på jer, perfekt til et lille mikroeventyr",
    en: "very close by, perfect for a small micro-adventure"
  },
  {
    max: 20,
    de: "im bequemen Umkreis, gut für Alltag und kurze Ausflüge",
    da: "i behagelig afstand, godt til hverdagen og korte ture",
    en: "in a comfortable radius, great for everyday and short trips"
  },
  {
    max: 40,
    de: "mit etwas Fahrtzeit – ideal für einen halben Tag",
    da: "med lidt køretid – ideelt til en halv dag",
    en: "with a bit of travel – ideal for a half-day adventure"
  },
  {
    max: Infinity,
    de: "etwas weiter weg – ein Ausflug, der sich für einen ganzen Tag lohnt",
    da: "lidt længere væk – en tur, der er værd at bruge en hel dag på",
    en: "a bit further away – a trip that’s worth a full day"
  }
];

function describeRadius(radiusIndex) {
  const { isDe, isDa } = getLanguageInfo();
  const radiusKm = RADIUS_LEVELS_KM[radiusIndex] ?? null;

  if (radiusKm === null) {
    return isDe
      ? "ohne Radiusbegrenzung – ihr könnt auch große Abenteuer anschauen"
      : isDa
      ? "uden radiusbegrænsning – I kan også kigge på de store eventyr"
      : "without radius limit – you can also explore bigger adventures";
  }

  const desc = RADIUS_DESCRIPTIONS.find((r) => radiusKm <= r.max);
  return isDe ? desc.de : isDa ? desc.da : desc.en;
}

export function buildCompassMessage(filters, extras = {}) {
  const { isDe, isDa } = getLanguageInfo();

  if (!filters) {
    return isDe
      ? "Der Familien-Kompass hilft euch, aus allen Spots die zu eurer Energie und eurem Alltag passenden Abenteuer zu finden."
      : isDa
      ? "Familiekompasset hjælper jer med at finde de oplevelser, der passer til jeres energi og jeres hverdag."
      : "The family compass helps you find adventures that match your energy and everyday rhythm.";
  }

  const {
    mood,
    travelMode,
    ageGroup = "all",
    radiusIndex = 4,
    favoritesOnly
  } = filters;

  const {
    filteredCount = 0,
    favoritesCount = 0
  } = extras;

  const parts = [];

  const T = (de, da, en) => (isDe ? de : isDa ? da : en);

  const moodMap = {
    relaxed: T(
      "Heute passt ein eher entspannter Spot: viel Luft zum Durchatmen, genug Platz für alle und kein Leistungsdruck.",
      "I dag passer et mere afslappet sted: god plads til at trække vejret, plads til alle og uden præstationspres.",
      "Today calls for a relaxed spot: space to breathe, enough room for everyone and no pressure to perform."
    ),
    action: T(
      "Ihr habt Lust auf Action: Orte mit Bewegung, Klettern und ordentlich Auspowern stehen im Vordergrund.",
      "I har lyst til action: steder med bevægelse, klatring og mulighed for at få brugt en masse energi er i fokus.",
      "You’re in the mood for action: places with movement, climbing and plenty of energy are in focus."
    ),
    water: T(
      "Etwas mit Wasser wäre heute schön: Matschhosen erlaubt, nasse Haare ausdrücklich erwünscht.",
      "Noget med vand ville være dejligt i dag: mudrede bukser er tilladt, våde hårstrå er direkte ønsket.",
      "Something with water sounds great today: muddy trousers allowed, wet hair encouraged."
    ),
    animals: T(
      "Heute dürfen Tiere eine Rolle spielen: vom kleinen Bauernhof bis zum großen Wildpark.",
      "I dag må dyr gerne spille hovedrollen: fra lille bondegård til stor vildtpark.",
      "Today animals should be part of the day: from small farms to large wildlife parks."
    )
  };

  if (mood && moodMap[mood]) parts.push(moodMap[mood]);

  const travelMap = {
    everyday: T(
      "Der Kompass sucht Spots, die gut in euren Alltag passen – auch nach Arbeit oder Kita noch machbar.",
      "Kompasset søger spots, der passer godt ind i hverdagen – også noget, der kan lade sig gøre efter arbejde eller institution.",
      "The compass looks for spots that fit easily into everyday life – also doable after work or daycare."
    ),
    trip: T(
      "Ihr seid unterwegs: Die Vorschläge passen zu Touren mit Auto, Camper oder Bahn und dürfen auch mal etwas weiter weg liegen.",
      "I er på tur: Forslagene passer til ture med bil, camper eller tog og må gerne ligge lidt længere væk.",
      "You’re on the road: suggestions are chosen for trips by car, camper or train and can be a little further away."
    )
  };

  if (travelMode && travelMap[travelMode]) parts.push(travelMap[travelMode]);

  const ageMap = {
    "0-3": T(
      "Der Fokus liegt auf den Kleinsten – kurze Wege, sichere Ecken zum Ankommen und Orte, an denen niemand komisch schaut, wenn es mal laut wird.",
      "Fokus er på de allermindste – korte afstande, trygge hjørner at lande i og steder, hvor ingen ser skævt til, hvis det bliver lidt højt.",
      "The focus is on the littlest ones – short distances, safe corners to arrive and places where nobody minds if it gets loud."
    ),
    "4-9": T(
      "Ideal für neugierige Entdecker:innen: genug zu klettern, rennen und ausprobieren – ohne dass es gleich zu viel wird.",
      "Ideelt til nysgerrige opdagere: nok at klatre på, løbe og prøve af – uden at det bliver for meget.",
      "Ideal for curious explorers: enough to climb, run and try out – without it becoming overwhelming."
    ),
    "10+": T(
      "Eure Großen wollen mitbestimmen: Der Kompass bevorzugt Spots, die sich auch für größere Kinder spannend anfühlen.",
      "De store vil også have indflydelse: Kompasset prioriterer spots, der også føles spændende for større børn.",
      "Your older kids want a say: the compass prefers spots that also feel exciting for bigger kids."
    )
  };

  if (ageMap[ageGroup]) parts.push(ageMap[ageGroup]);

  parts.push(
    T("Der Radius ist gerade so eingestellt: ", "Lige nu er radius indstillet sådan her: ", "Your radius is set like this: ") +
    describeRadius(radiusIndex)
  );

  if (favoritesOnly && favoritesCount > 0) {
    parts.push(
      T(
        `Aktuell seht ihr nur eure Lieblingsspots – ${filteredCount} davon passen gerade zu euren Filtern.`,
        `Lige nu ser I kun jeres yndlingsspots – ${filteredCount} af dem passer til jeres nuværende filtre.`,
        `Right now you only see your favourite spots – ${filteredCount} of them match your filters.`
      )
    );
  } else if (filteredCount === 0) {
    parts.push(
      T(
        "Mit dieser Kombination gibt es gerade keinen passenden Spot. Vielleicht hilft es, Radius oder Stimmung etwas weiter zu fassen.",
        "Med den her kombination er der ingen passende spots lige nu. Måske hjælper det at gøre radius eller humør lidt bredere.",
        "With this combination there are no matching spots right now. Try relaxing radius or mood a little."
      )
    );
  } else if (filteredCount === 1) {
    parts.push(
      T(
        "Aktuell passt genau ein Spot besonders gut zu euch – manchmal reicht genau das für einen richtig guten Tag.",
        "Lige nu passer ét spot særligt godt til jer – nogle gange er det præcis dét, der skal til for en virkelig god dag.",
        "Right now exactly one spot fits you really well – sometimes that’s all you need for a really good day."
      )
    );
  } else {
    parts.push(
      T(
        `Insgesamt passen gerade ${filteredCount} Spots gut zu euren Einstellungen – oben in der Liste starten die besten Matches.`,
        `I alt passer ${filteredCount} spots godt til jeres indstillinger lige nu – de bedste matches ligger øverst på listen.`,
        `In total, ${filteredCount} spots currently fit your settings well – the best matches start at the top of the list.`
      )
    );
  }

  return parts.join(" ");
}

export function updateCompassMessage(filters, extras = {}) {
  const section = document.getElementById("compass-section");
  if (!section) return;

  let messageEl = document.getElementById("compass-message");
  if (!messageEl) {
    messageEl = document.createElement("p");
    messageEl.id = "compass-message";
    messageEl.className = "compass-message";

    const helper = document.getElementById("compass-helper");
    if (helper?.parentElement === section) {
      helper.insertAdjacentElement("afterend", messageEl);
    } else {
      section.appendChild(messageEl);
    }
  }

  messageEl.textContent = buildCompassMessage(filters, extras);
}