// Route 406: Varde Kommune via GeoDanmark / GeoFA (CC BY 4.0).
export const filsoe = {
  photo: "assets/spots/filsoe/ellipse.webp",
  photoSource: "https://commons.wikimedia.org/wiki/File:%22Ellipsis%22_at_lake_Fils%C3%B8.jpg",
  source: "https://pulsenivest.dk/tur/panoramarute-nr-406-21-km-d58022e4",
  gpx: "https://geofa.geodanmark.dk/extensions/fkgupload/api/gpx/line/d58022e4-fe61-11eb-baa9-06d09fa510f4",
  copy: {
    de: ["Mit dem Rad über den Filsø", "Ca. 21 km · Rundtour", "Über den Damm, durch die Dünenplantage und zurück zum See.", "Mittelschwer", "Wind auf dem Damm, Schotter und steilere Abschnitte im Wald. Für Familien mit Erfahrung auf längeren Strecken.", "GPX herunterladen", "Panoramaroute 406 ansehen"],
    en: ["Cycle across Filsø", "Approx. 21 km · Loop", "Across the causeway, through the dune plantation and back to the lake.", "Moderate", "Wind on the causeway, gravel and steeper forest sections. For families used to longer rides.", "Download GPX", "View Panorama Route 406"],
    da: ["På cykel over Filsø", "Ca. 21 km · Rundtur", "Over dæmningen, gennem klitplantagen og tilbage til søen.", "Middel", "Vind på dæmningen, grus og stejlere strækninger i skoven. For familier, der er vant til længere cykelture.", "Hent GPX", "Se Panoramarute 406"],
  },
  stops: [
    { title: "Filsø-Ellipsen", icon: "pin", url: "https://www.dof.dk/oplev-fuglene/fuglesteder/jylland/filso", text: {
      de: "Aussichtssteg und Vogelbeobachtung · Picknickbänke und WC am Naturraum",
      en: "Viewing bridge and birdwatching · picnic benches and toilets at the visitor centre",
      da: "Udsigtsbro og fuglekig · borde, bænke og toilet ved naturrummet",
    } },
    { title: "Blåbjergstenen", icon: "hills", url: "https://www.visitvesterhavet.de/nordsee/nordseeurlaub/blabjerg-stenen-gdk602681", text: {
      de: "Aussicht von der Düne · 64 m über dem Meeresspiegel",
      en: "View from the dune · 64 m above sea level",
      da: "Udsigt fra klitten · 64 m over havet",
    } },
    { title: "Henne Strand", icon: "leaf", url: "https://www.geus.dk/udforsk-geologien/ture-i-naturen/geologiske-naturperler/syddanmark/henne-strand/", text: {
      de: "Optionaler Abstecher · Sandstrand und Einkehr im Ort",
      en: "Optional detour · sandy beach and cafés in the village",
      da: "Valgfri afstikker · sandstrand og caféer i byen",
    } },
  ],
};

// Projected GPX points for the schematic view. Adjacent identical pixels are merged.
const outlinePoints = "263,222 262,222 262,223 263,223 264,223 282,226 286,226 287,227 289,227 291,227 301,227 302,227 303,227 305,227 317,223 358,211 360,211 361,211 362,210 363,209 364,200 364,199 365,199 364,198 363,198 364,188 364,180 364,179 363,176 363,175 363,174 363,173 364,173 367,171 370,169 385,161 397,156 398,155 399,154 403,149 404,148 404,147 404,146 404,145 402,140 399,132 399,131 399,130 400,130 399,129 394,127 391,126 389,126 387,125 384,124 382,124 378,124 361,122 360,122 359,122 357,122 348,122 344,122 341,121 340,121 338,121 337,121 334,121 329,121 328,121 329,120 329,118 329,112 330,108 330,105 330,100 331,99 331,97 331,96 331,95 331,94 331,93 329,89 328,88 328,87 327,85 324,79 307,79 305,79 304,80 303,80 295,82 294,82 282,85 279,86 270,89 269,88 269,87 268,79 268,67 268,66 268,64 268,62 268,59 267,59 265,57 264,57 260,56 259,56 258,56 258,55 255,54 254,53 252,52 251,51 250,51 249,51 248,50 245,50 243,50 240,48 238,48 237,48 236,48 234,47 234,46 235,46 235,45 236,45 236,44 236,43 234,42 234,41 235,40 236,40 237,40 238,39 239,39 240,38 242,36 239,36 236,36 235,36 233,36 232,36 229,36 227,35 225,35 223,34 221,34 220,34 216,34 215,34 214,34 213,34 211,34 208,33 205,32 203,32 202,32 200,33 199,33 195,34 188,35 187,35 184,36 183,36 181,36 180,37 179,37 178,37 176,38 175,38 174,39 172,40 171,40 169,41 168,41 166,43 165,44 164,44 162,49 161,50 161,51 161,54 161,59 160,59 160,61 156,67 156,68 157,70 158,72 159,74 159,75 159,76 158,77 158,78 157,78 156,80 156,81 155,81 155,83 155,84 155,85 154,87 154,88 154,89 154,90 153,91 153,92 153,94 152,95 152,96 152,98 151,99 151,100 151,101 150,102 150,103 148,103 146,102 145,102 144,102 142,102 141,102 139,101 137,101 136,101 135,101 134,101 133,101 132,101 131,101 130,101 129,101 128,101 127,101 126,101 125,102 123,102 122,103 119,102 119,103 115,108 112,114 110,116 109,117 109,119 108,122 107,127 106,128 106,129 106,130 105,132 105,133 104,134 104,135 98,144 97,145 97,146 89,178 88,183 87,184 87,185 86,187 85,188 84,189 81,193 82,193 83,194 85,195 86,196 88,197 90,198 92,199 94,200 94,201 96,201 98,201 100,201 99,203 98,203 93,207 93,208 94,208 95,208 96,209 110,212 118,214 137,218 155,221 167,223 172,224 176,225 181,226 194,228 206,230 208,230 209,231 212,231 216,232 218,232 220,232 221,233 222,233 223,233 224,233 225,233 257,224 259,223 261,223 262,223 263,223";

export function filsoeSketch(label) {
  return `<figure class="cycle-map-frame">
    <figcaption>${label}</figcaption>
    <svg class="cycle-map cycle-filsoe-sketch" viewBox="0 0 480 240" role="img" aria-label="${label} · Filsø-Ellipsen · Blåbjergstenen">
      <path class="cycle-sketch-green" d="M0 58Q35 43 71 64T155 64Q169 83 139 103T69 110Q34 102 0 128ZM176 0H366Q393 32 358 54T308 75Q274 84 247 64T176 58Q145 32 176 0ZM480 54V155Q450 156 439 139T453 96ZM0 240V173Q32 161 53 181T83 215Q89 233 123 240ZM480 189V240H310Q337 214 375 223T431 203Q450 184 480 189Z"/>
      <path class="cycle-filsoe-water" d="M130 185Q163 174 185 178T229 175Q250 181 260 197T287 221Q263 237 229 223T177 219Q145 213 130 185ZM151 143Q181 122 209 128T246 147Q257 152 245 166T204 166Q177 163 151 173Q135 162 151 143Z"/>
      <polyline transform="translate(0 29) scale(1 .85)" points="${outlinePoints}"/>
      <g transform="translate(104 200)">
        <circle r="11"/><text class="cycle-filsoe-number">1</text><text x="15" y="4">Filsø-Ellipsen</text>
      </g>
      <g transform="translate(230 68)">
        <circle r="11"/><text class="cycle-filsoe-number">2</text><text x="15" y="4">Blåbjergstenen</text>
      </g>
    </svg>
  </figure>`;
}
