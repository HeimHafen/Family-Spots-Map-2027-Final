// Category presentation layer. Original spot IDs, slugs and access rules remain authoritative.
export const WORLDS = [
  {
    "id": "play",
    "label": {
      "de": "Spielen & Bewegung",
      "en": "Play & movement",
      "da": "Leg & bevægelse"
    }
  },
  {
    "id": "animals",
    "label": {
      "de": "Tiere & Bauernhöfe",
      "en": "Animals & farms",
      "da": "Dyr & gårde"
    }
  },
  {
    "id": "nature",
    "label": {
      "de": "Natur & Entdecken",
      "en": "Nature & discovery",
      "da": "Natur & opdagelser"
    }
  },
  {
    "id": "water",
    "label": {
      "de": "Baden & Wasserspiel",
      "en": "Swimming & water play",
      "da": "Badning og vandleg"
    }
  },
  {
    "id": "adventure",
    "label": {
      "de": "Abenteuer & Freizeit",
      "en": "Adventure & leisure",
      "da": "Eventyr & fritid"
    }
  },
  {
    "id": "culture",
    "label": {
      "de": "Kultur & Lernen",
      "en": "Culture & learning",
      "da": "Kultur & læring"
    }
  },
  {
    "id": "pause",
    "label": {
      "de": "Essen & Pause",
      "en": "Food & breaks",
      "da": "Mad & pauser"
    }
  },
  {
    "id": "travel",
    "label": {
      "de": "Camping & Unterwegs",
      "en": "Camping & travel",
      "da": "Camping & på tur"
    }
  },
  {
    "id": "services",
    "label": {
      "de": "Versorgung & Rast",
      "en": "Facilities & rest stops",
      "da": "Faciliteter & rastepladser"
    },
    "auxiliary": true
  },
  {
    "id": "events",
    "label": {
      "de": "Veranstaltungen",
      "en": "Events",
      "da": "Arrangementer"
    },
    "auxiliary": true
  }
];
export const PLACE_TYPES = [
{
  "id": "nature-center",
  "world": "nature",
  "label": {
    "de": "Naturzentrum & Mitmachstation",
    "en": "Nature centre & discovery station",
    "da": "Naturcenter & oplevelsesstation"
  },
  "aliases": [
    "naturzentrum",
    "natur-mitmachstation"
  ]
},
{
  "id": "adventure-farm",
  "world": "animals",
  "label": {
    "de": "Erlebnishof",
    "en": "Adventure farm",
    "da": "Oplevelsesgård"
  },
  "aliases": [
    "erlebnishof"
  ]
},
{
  "id": "swingolf",
  "world": "adventure",
  "label": {
    "de": "SwinGolf",
    "en": "Swin golf",
    "da": "Swin golf"
  },
  "aliases": [
    "swingolf"
  ]
},
  {
    "id": "playground",
    "world": "play",
    "label": {
      "de": "Spielplatz",
      "en": "Playground",
      "da": "Legeplads"
    },
    "aliases": [
      "spielplatz",
      "barrierefreier-spielplatz",
      "toddler-barfuss-motorik",
      "ueberdachter-spielplatz"
    ]
  },
  {
    "id": "adventure-playground",
    "world": "play",
    "label": {
      "de": "Abenteuerspielplatz",
      "en": "Adventure playground",
      "da": "Eventyrlegeplads"
    },
    "aliases": [
      "abenteuerspielplatz"
    ]
  },
  {
    "id": "indoor-playground",
    "world": "play",
    "label": {
      "de": "Indoor-Spielplatz",
      "en": "Indoor playground",
      "da": "Indendørs legeplads"
    },
    "aliases": [
      "indoor-spielplatz"
    ]
  },
  {
    "id": "forest-playground",
    "world": "play",
    "label": {
      "de": "Waldspielplatz",
      "en": "Forest playground",
      "da": "Skovlegeplads"
    },
    "aliases": [
      "waldspielplatz"
    ]
  },
  {
    "id": "water-playground",
    "world": "play",
    "label": {
      "de": "Wasserspielplatz",
      "en": "Water playground",
      "da": "Vandlegeplads"
    },
    "aliases": [
      "wasserspielplatz"
    ]
  },
  {
    "id": "activity-park",
    "world": "play",
    "label": {
      "de": "Bewegungspark",
      "en": "Activity park",
      "da": "Bevægelsespark"
    },
    "aliases": [
      "bewegungspark"
    ]
  },
  {
    "id": "multisport",
    "world": "play",
    "label": {
      "de": "Multisportplatz",
      "en": "Multi-sport court",
      "da": "Multibane"
    },
    "aliases": [
      "multifunktionsfeld"
    ]
  },
  {
    "id": "football",
    "world": "play",
    "label": {
      "de": "Bolzplatz",
      "en": "Football pitch",
      "da": "Fodboldbane"
    },
    "aliases": [
      "bolzplatz"
    ]
  },
  {
    "id": "pumptrack",
    "world": "play",
    "label": {
      "de": "Pumptrack",
      "en": "Pumptrack",
      "da": "Pumptrack"
    },
    "aliases": [
      "pumptrack"
    ]
  },
  {
    "id": "skatepark",
    "world": "play",
    "label": {
      "de": "Skatepark",
      "en": "Skatepark",
      "da": "Skatepark"
    },
    "aliases": [
      "skatepark"
    ]
  },
  {
    "id": "traffic",
    "world": "play",
    "label": {
      "de": "Verkehrsübungsplatz",
      "en": "Traffic practice park",
      "da": "Trafiklegeplads"
    },
    "aliases": [
      "verkehrsgarten"
    ]
  },
  {
    "id": "dirtbike",
    "world": "play",
    "label": {
      "de": "Dirtbike-Anlage",
      "en": "Dirtbike track",
      "da": "Dirtbikebane"
    },
    "aliases": [
      "dirtbike-track"
    ]
  },
  {
    "id": "basketball",
    "world": "play",
    "label": {
      "de": "Basketballplatz",
      "en": "Basketball court",
      "da": "Basketballbane"
    },
    "aliases": [
      "streetball-platz"
    ]
  },
  {
    "id": "zoo",
    "world": "animals",
    "label": {
      "de": "Zoo & Tierpark",
      "en": "Zoo & animal park",
      "da": "Zoo & dyrepark"
    },
    "aliases": [
      "zoo",
      "tierpark"
    ]
  },
  {
    "id": "wildpark",
    "world": "animals",
    "label": {
      "de": "Wildpark",
      "en": "Wildlife park",
      "da": "Vildtpark"
    },
    "aliases": [
      "wildpark"
    ]
  },
  {
    "id": "farm",
    "world": "animals",
    "label": {
      "de": "Besuchsbauernhof",
      "en": "Visitor farm",
      "da": "Besøgsgård"
    },
    "aliases": [
      "bauernhof"
    ]
  },
  {
    "id": "aquarium",
    "world": "animals",
    "label": {
      "de": "Aquarium",
      "en": "Aquarium",
      "da": "Akvarium"
    },
    "aliases": [
      "aquarium"
    ]
  },
  {
    "id": "community-garden",
    "world": "nature",
    "label": {"de": "Mitmachgärten", "en": "Community gardens", "da": "Fælleshaver"},
    "aliases": ["mitmachgarten"]
  },
  {
    "id": "nature-trail",
    "world": "nature",
    "label": {
      "de": "Naturerlebnispfad",
      "en": "Nature discovery trail",
      "da": "Naturoplevelsessti"
    },
    "aliases": [
      "naturerlebnispfad",
      "walderlebnisroute",
      "klangpfad"
    ]
  },
  {
    "id": "cave",
    "world": "nature",
    "label": {
      "de": "Höhle / Felsenerlebnis",
      "en": "Cave / rock discovery",
      "da": "Hule / klippeoplevelse"
    },
    "aliases": [
      "hoehle"
    ]
  },
  {
    "id": "rock-trail",
    "world": "nature",
    "label": {
      "de": "Felsenweg",
      "en": "Rock trail",
      "da": "Klippesti"
    },
    "aliases": [
      "felsenwanderung"
    ]
  },
  {
    "id": "viewpoint",
    "world": "nature",
    "label": {
      "de": "Aussichtspunkt",
      "en": "Viewpoint",
      "da": "Udsigtspunkt"
    },
    "aliases": [
      "aussichtspunkt",
      "natur-aussichtspunkt"
    ]
  },
  {
    "id": "treehouse",
    "world": "nature",
    "label": {
      "de": "Baumhaus & Entdeckerhütte",
      "en": "Treehouse & discovery hut",
      "da": "Træhus & opdagelseshytte"
    },
    "aliases": [
      "baumhaus"
    ]
  },
  {
    "id": "quiet-nature",
    "world": "nature",
    "label": {
      "de": "Natur-Ruheplatz",
      "en": "Quiet nature spot",
      "da": "Roligt natursted"
    },
    "aliases": [
      "waldbaden-ort"
    ]
  },
  {
    "id": "walk",
    "world": "nature",
    "label": {
      "de": "Familienwanderweg",
      "en": "Family walking trail",
      "da": "Familievandrerute"
    },
    "aliases": [
      "wanderweg",
      "wanderweg-kinderwagen"
    ]
  },
  {
    "id": "cycle",
    "world": "nature",
    "label": {
      "de": "Familienradroute",
      "en": "Family cycle route",
      "da": "Familiecykelrute"
    },
    "aliases": [
      "radweg-family"
    ]
  },
  {
    "id": "park",
    "world": "nature",
    "label": {
      "de": "Park & Garten",
      "en": "Park & garden",
      "da": "Park & have"
    },
    "aliases": [
      "park-garten"
    ]
  },
  {
    "id": "barefoot",
    "world": "nature",
    "label": {
      "de": "Barfußpfad",
      "en": "Barefoot trail",
      "da": "Barfodssti"
    },
    "aliases": [
      "barfusspfad"
    ]
  },
  {
    "id": "pool",
    "world": "water",
    "label": {
      "de": "Schwimmbad",
      "en": "Swimming pool",
      "da": "Svømmebad"
    },
    "aliases": [
      "schwimmbad"
    ]
  },
  {
    "id": "lake",
    "world": "water",
    "label": {
      "de": "Badesee",
      "en": "Bathing lake",
      "da": "Badesø"
    },
    "aliases": [
      "badesee"
    ]
  },
  {
    "id": "beach",
    "world": "water",
    "label": {
      "de": "Strand",
      "en": "Beach",
      "da": "Strand"
    },
    "aliases": [
      "strand"
    ]
  },
  {
    "id": "ice",
    "world": "adventure",
    "label": {
      "de": "Eisbahn",
      "en": "Ice rink",
      "da": "Skøjtebane"
    },
    "aliases": [
      "eisbahn"
    ]
  },
  {
    "id": "sled",
    "world": "adventure",
    "label": {
      "de": "Rodelhang",
      "en": "Sledding hill",
      "da": "Kælkebakke"
    },
    "aliases": [
      "rodelhuegel"
    ]
  },
  {
    "id": "themepark",
    "world": "adventure",
    "label": {
      "de": "Freizeitpark",
      "en": "Theme park",
      "da": "Forlystelsespark"
    },
    "aliases": [
      "freizeitpark"
    ]
  },
  {
    "id": "trampoline",
    "world": "adventure",
    "label": {
      "de": "Trampolinpark",
      "en": "Trampoline park",
      "da": "Trampolinpark"
    },
    "aliases": [
      "trampolinpark"
    ]
  },
  {
    "id": "climbing-indoor",
    "world": "adventure",
    "label": {
      "de": "Kletterhalle",
      "en": "Climbing gym",
      "da": "Klatrehal"
    },
    "aliases": [
      "kletterhalle"
    ]
  },
  {
    "id": "climbing-outdoor",
    "world": "adventure",
    "label": {
      "de": "Outdoor-Kletteranlage",
      "en": "Outdoor climbing area",
      "da": "Udendørs klatreanlæg"
    },
    "aliases": [
      "kletteranlage-outdoor"
    ]
  },
  {
    "id": "ropes",
    "world": "adventure",
    "label": {
      "de": "Kletterwald & Hochseilgarten",
      "en": "Forest & high ropes course",
      "da": "Klatreskov & højrebsbane"
    },
    "aliases": [
      "kletterwald-hochseilgarten"
    ]
  },
  {
    "id": "boulder",
    "world": "adventure",
    "label": {
      "de": "Boulderanlage",
      "en": "Bouldering area",
      "da": "Boulderanlæg"
    },
    "aliases": [
      "boulderpark"
    ]
  },
  {
    "id": "minigolf",
    "world": "adventure",
    "label": {
      "de": "Minigolf",
      "en": "Minigolf",
      "da": "Minigolf"
    },
    "aliases": [
      "minigolf"
    ]
  },
  {
    "id": "maze",
    "world": "adventure",
    "label": {
      "de": "Labyrinth & Irrgarten",
      "en": "Labyrinth & maze",
      "da": "Labyrint"
    },
    "aliases": [
      "labyrinth"
    ]
  },
  {
    "id": "openair-museum",
    "world": "culture",
    "label": {
      "de": "Freilichtmuseum",
      "en": "Open-air museum",
      "da": "Frilandsmuseum"
    },
    "aliases": [
      "freilichtmuseum"
    ]
  },
  {
    "id": "museum",
    "world": "culture",
    "label": {
      "de": "Museum",
      "en": "Museum",
      "da": "Museum"
    },
    "aliases": [
      "museum",
      "museum-kinder",
      "kinder-museum"
    ]
  },
  {
    "id": "library",
    "world": "culture",
    "label": {
      "de": "Bibliothek",
      "en": "Library",
      "da": "Bibliotek"
    },
    "aliases": [
      "bibliothek"
    ]
  },
  {
    "id": "historic",
    "world": "culture",
    "label": {
      "de": "Historischer Ort",
      "en": "Historic site",
      "da": "Historisk sted"
    },
    "aliases": [
      "historischer-ort"
    ]
  },
  {
    "id": "cafe",
    "world": "pause",
    "label": {
      "de": "Café",
      "en": "Café",
      "da": "Café"
    },
    "aliases": [
      "familiencafe",
      "kinder-familiencafe"
    ]
  },
  {
    "id": "restaurant",
    "world": "pause",
    "label": {
      "de": "Restaurant",
      "en": "Restaurant",
      "da": "Restaurant"
    },
    "aliases": [
      "familien-restaurant"
    ]
  },
  {
    "id": "picnic",
    "world": "pause",
    "label": {
      "de": "Picknickplatz",
      "en": "Picnic spot",
      "da": "Picnicsted"
    },
    "aliases": [
      "picknickwiese"
    ]
  },
  {
    "id": "motorhome",
    "world": "travel",
    "label": {
      "de": "Wohnmobil-Stopp",
      "en": "Motorhome stop",
      "da": "Autocamperstop"
    },
    "aliases": [
      "wohnmobil-parkplatz",
      "stellplatz-spielplatz-naehe-kostenlos"
    ]
  },
  {
    "id": "camping",
    "world": "travel",
    "label": {
      "de": "Campingplatz",
      "en": "Campsite",
      "da": "Campingplads"
    },
    "aliases": [
      "campingplatz-familien"
    ]
  },
  {
    "id": "cycle-stop",
    "world": "travel",
    "label": {
      "de": "Radreise-Übernachtungsplatz",
      "en": "Cycle touring overnight stop",
      "da": "Overnatningssted på cykelturen"
    },
    "aliases": [
      "bikepacking-spot"
    ]
  },
  {
    "id": "toilet",
    "world": "services",
    "label": {
      "de": "Toilette",
      "en": "Toilet",
      "da": "Toilet"
    },
    "aliases": [
      "oeffentliche-toilette"
    ]
  },
  {
    "id": "changing",
    "world": "services",
    "label": {
      "de": "Wickelmöglichkeit",
      "en": "Baby changing facility",
      "da": "Pusleplads"
    },
    "aliases": [
      "wickelraum"
    ]
  },
  {
    "id": "rv-service",
    "world": "services",
    "label": {
      "de": "Wohnmobil-Service",
      "en": "Motorhome service point",
      "da": "Autocamperservice"
    },
    "aliases": [
      "wohnmobil-service-station"
    ]
  },
  {
    "id": "rest-stop",
    "world": "services",
    "label": {
      "de": "Rastplatz",
      "en": "Rest area",
      "da": "Rasteplads"
    },
    "aliases": [
      "rastplatz-spielplatz-dusche"
    ]
  },
  {
    "id": "event",
    "world": "events",
    "label": {
      "de": "Familienveranstaltung",
      "en": "Family event",
      "da": "Familiearrangement"
    },
    "aliases": [
      "familien-event"
    ]
  }
];
export const FACETS = [
 {id:'free',label:{de:'Eintritt kostenlos',en:'Free admission',da:'Gratis adgang'}},
 {id:'indoor',label:{de:'Drinnen',en:'Indoors',da:'Indendørs'}},
 {id:'outdoor',label:{de:'Draußen',en:'Outdoors',da:'Udendørs'}},
 {id:'toilet',label:{de:'Toilette vor Ort',en:'Toilet on site',da:'Toilet på stedet'}},
 {id:'shade',label:{de:'Schattenplätze',en:'Shaded areas',da:'Skyggepladser'}},
 {id:'changing',label:{de:'Wickelmöglichkeit',en:'Baby changing',da:'Pusleplads'}},
 {id:'covered',label:{de:'Überdachter Spielbereich',en:'Covered play area',da:'Overdækket legeområde'}},
 {id:'step_free_path',label:{de:'Stufenloser Zugang',en:'Step-free access',da:'Trinfri adgang'}},
 {id:'stroller_surface',label:{de:'Weg für Kinderwagen geeignet',en:'Pushchair-friendly path',da:'Barnevognsvenlig sti'}}
];
function validDate(value) {
 if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const time=Date.parse(value);return Number.isFinite(time) && new Date(time).toISOString().slice(0,10)===value;
}
function validSource(value) {
 try {const url=new URL(value);return ['http:','https:'].includes(url.protocol) && !!url.hostname;} catch {return false;}
}
const normalize = value => String(value || '').trim().toLowerCase().replaceAll('_','-');
const byAlias = new Map(PLACE_TYPES.flatMap(type => type.aliases.map(alias => [normalize(alias),type.id])));
const byId = new Map(PLACE_TYPES.map(type => [type.id,type]));
export function labelOf(item,lang='de') { return item?.label?.[lang] || item?.label?.de || item?.id || ''; }
export function originalCategories(spot) {
 return [...new Set([...(Array.isArray(spot.categories)?spot.categories:[]),spot.category,spot.categorySlug,spot.type].filter(x=>typeof x==='string' && x.trim()).map(normalize))];
}
export function hasReviewedCategoryProfile(spot) {
 const profile=spot?.category_profile;
 return !!(profile && profile.schema_version===1 && profile.status==='source_supported'
   && validDate(profile.checked_at) && Date.parse(profile.checked_at)<=Date.now()
   && Array.isArray(profile.source_urls) && profile.source_urls.length
   && profile.source_urls.every(validSource)
   && Array.isArray(profile.place_types) && profile.place_types.length
   && new Set(profile.place_types).size===profile.place_types.length
   && profile.place_types.every(id=>byId.has(id)));
}
export function placeTypeLabels(spot,lang='de') {
 return getPlaceTypes(spot).map(id=>byId.has(id)?labelOf(byId.get(id),lang):id.slice(7).replaceAll('-',' '));
}
export function getPlaceTypes(spot) {
 // Reviewed presentation profiles preserve original slugs and therefore existing access rules.
 if (hasReviewedCategoryProfile(spot)) return [...spot.category_profile.place_types];
 return [...new Set(originalCategories(spot).map(slug=>byAlias.get(slug) || 'legacy:'+slug))];
}
// A place type may legitimately belong to more than one discovery theme.
// These are presentation memberships only: never rewrite stored category slugs,
// category evidence or Plus/add-on access rules.
const ADDITIONAL_TYPE_WORLDS = Object.freeze({
  'water-playground': Object.freeze(['water'])
});
export function getPlaceTypeWorlds(id) {
  const primary=byId.get(id)?.world || 'other';
  return [...new Set([primary,...(ADDITIONAL_TYPE_WORLDS[id] || [])])];
}
export function getWorlds(spot) {
  return [...new Set(getPlaceTypes(spot).flatMap(getPlaceTypeWorlds))];
}
export function isExpiredEvent(spot, now=Date.now()) {
 if (!getWorlds(spot).includes('events')) return false;
 const end=spot.event?.end_at;
 // Timed event expiry needs an explicit timestamp with timezone. Missing dates remain visible.
 if (typeof end!=='string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(end) || !validDate(end.slice(0,10))) return false;
 const time=Date.parse(end);return Number.isFinite(time) && time<=now;
}
export function facetValue(spot,id) {
 const entry=spot.family_facilities?.[id];
 if (entry && ['yes','no','unknown'].includes(entry.value)) {
   if(entry.value==='unknown') return 'unknown';
   const dated=validDate(entry.checked_at) && Date.parse(entry.checked_at)<=Date.now();
   const sources=Array.isArray(entry.source_urls) && entry.source_urls.some(validSource);
   if(dated && (sources || entry.evidence==='owner_visit')) return entry.value;
 }
 // No inference from marketing text, free parking, photos, or unverified tags.
 const slugs=originalCategories(spot);
 const implicitIndoor=['indoor-spielplatz','kletterhalle','trampolinpark'];
 const implicitOutdoor=['waldspielplatz','wasserspielplatz','pumptrack','skatepark','dirtbike-track','streetball-platz','bolzplatz','naturerlebnispfad','walderlebnisroute','park-garten','natur-aussichtspunkt','aussichtspunkt','radweg-family','wanderweg','wanderweg-kinderwagen','strand','badesee'];
 if(id==='indoor' && slugs.some(x=>implicitIndoor.includes(x)))return 'yes';
 if(id==='outdoor' && slugs.some(x=>implicitOutdoor.includes(x)))return 'yes';
 return 'unknown';
}
export function matchesCategoryProfile(spot,state={},now=Date.now()) {
 state=state || {};
 if(isExpiredEvent(spot,now))return false;
 if(state.world && !getWorlds(spot).includes(state.world))return false;
 const selected=Array.from(state.types || []);
 if(selected.length && !getPlaceTypes(spot).some(id=>selected.includes(id)))return false;
 const facets=Array.from(state.facets || []);
 const setting=facets.filter(id=>id==='indoor'||id==='outdoor');
 if(setting.length && !setting.some(id=>facetValue(spot,id)==='yes'))return false;
 return facets.filter(id=>id!=='indoor'&&id!=='outdoor').every(id=>facetValue(spot,id)==='yes');
}
export function hasCategorySelection(state) {return !!(state?.world || Array.from(state?.types || []).length || Array.from(state?.facets || []).length);}
