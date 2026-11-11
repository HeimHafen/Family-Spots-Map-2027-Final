// tools/upgrade-spots.js (CommonJS-Version)

const fs = require("fs");

const INPUT = "data/spots.json";
const OUTPUT = "data/spots.upgraded.json";

function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function saveJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}

function isWildpark(cat) {
  return cat === "wildpark";
}
function isZoo(cat) {
  return cat === "zoo";
}
function isFreizeitpark(cat) {
  return cat === "freizeitpark";
}
function isSpielplatz(cat) {
  return (
    cat === "spielplatz" ||
    cat === "abenteuerspielplatz" ||
    cat === "waldspielplatz"
  );
}
function isPumptrack(cat) {
  return cat === "pumptrack";
}
function isSkatepark(cat) {
  return cat === "skatepark";
}
function isKinderMuseum(cat) {
  return cat === "kinder_museum" || cat === "kinder-museum";
}

function buildGenericSummaryDe(spot, primary) {
  const title = spot.title;
  const city = spot.city || "";
  if (isWildpark(primary)) {
    return `${title} ist ein familienfreundlicher Wildpark in ${
      city || "der Region"
    } – mit Tieren in naturnahen Gehegen und viel Platz für einen Ausflug ins Grüne.`;
  }
  if (isZoo(primary)) {
    return `${title} ist ein großer Zoo in ${
      city || "der Region"
    } – mit vielen Tierarten, Themenbereichen und genug Programm für mehrere Stunden.`;
  }
  if (isFreizeitpark(primary)) {
    return `${title} ist ein Freizeitpark in ${
      city || "der Region"
    } – mit Achterbahnen, Familienattraktionen und viel Action für einen ganzen Tag.`;
  }
  if (isSpielplatz(primary)) {
    return `${title} ist ein familienfreundlicher Spielplatz in ${
      city || "der Region"
    } – mit unterschiedlichen Spielbereichen für Kinder.`;
  }
  if (isPumptrack(primary)) {
    return `${title} bietet einen Pumptrack in ${
      city || "der Region"
    } – ideal für Bikes und Scooter mit Lust auf Wellen und Kurven.`;
  }
  if (isSkatepark(primary)) {
    return `${title} ist ein Skatepark in ${
      city || "der Region"
    } – mit Flächen und Rampen für Boards, Scooter und BMX.`;
  }
  if (isKinderMuseum(primary)) {
    return `${title} ist ein Kinder- und Familienmuseum in ${
      city || "der Region"
    } – zum Entdecken, Anfassen und Ausprobieren.`;
  }
  return `${title} ist ein familienfreundlicher Spot in ${
    city || "der Region"
  }.`;
}

function buildGenericSummaryEn(spot, primary) {
  const title = spot.title;
  const city = spot.city || "";
  if (isWildpark(primary)) {
    return `${title} is a family-friendly wildlife park in ${
      city || "the region"
    } with animals in natural enclosures and plenty of space for a day out.`;
  }
  if (isZoo(primary)) {
    return `${title} is a large zoo in ${
      city || "the region"
    } with many species, themed areas and enough to explore for several hours.`;
  }
  if (isFreizeitpark(primary)) {
    return `${title} is a theme park in ${
      city || "the region"
    } with coasters, family rides and lots of action for a full day.`;
  }
  if (isSpielplatz(primary)) {
    return `${title} is a family-friendly playground in ${
      city || "the region"
    } with different play areas for kids.`;
  }
  if (isPumptrack(primary)) {
    return `${title} offers a pump track in ${
      city || "the region"
    }, ideal for bikes and scooters that love waves and turns.`;
  }
  if (isSkatepark(primary)) {
    return `${title} is a skate park in ${
      city || "the region"
    } with areas and ramps for boards, scooters and BMX.`;
  }
  if (isKinderMuseum(primary)) {
    return `${title} is a children’s and family museum in ${
      city || "the region"
    } for discovering, touching and trying things out.`;
  }
  return `${title} is a family-friendly spot in ${city || "the region"}.`;
}

function upgradeSpot(spot) {
  const s = { ...spot };
  const primary =
    Array.isArray(s.categories) && s.categories.length
      ? s.categories[0]
      : null;

  // summary_de
  if (!s.summary_de) {
    if (s.poetry) {
      s.summary_de = s.poetry;
    } else {
      s.summary_de = buildGenericSummaryDe(s, primary);
    }
  }

  // summary_en
  if (!s.summary_en) {
    if (s.poetry_en) {
      s.summary_en = s.poetry_en;
    } else {
      s.summary_en = buildGenericSummaryEn(s, primary);
    }
  }

  return s;
}

function main() {
  const data = loadJson(INPUT);
  const upgraded = {
    ...data,
    spots: (data.spots || []).map(upgradeSpot),
  };
  saveJson(OUTPUT, upgraded);
  console.log(`✅ Upgraded spots written to ${OUTPUT}`);
}

main();