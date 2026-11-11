  // Family Spots Map: vollständige Offline-Grundfunktion, ohne Kartenkachel-Downloads.
const CACHE_VERSION = "20261112-review-v5";
const ROOT = new URL("./", self.location.href);
const CACHE_PREFIX = "fsm-v5-" + ROOT.pathname.replace(/[^a-z0-9]/gi, "_") + "-";
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const ASSETS = [
  "js/features/diary-premium.js",
  "css/diary-premium-v5.css",
  "assets/design/diary-approved-landscape-v5.webp",
  "assets/design/diary-approved-polaroids-v5.webp",
  "assets/design/diary-approved-flora-v5.webp",

  "js/ui/stroebeck-track.js",
  "js/ui/filsoe-tour.js",
  "assets/spots/filsoe/ellipse.webp",
  "js/ui/cycle-tours.js",
  "js/ui/tourenwelt.js",
  "css/tourenwelt.css",
  "css/fsm-touren-reference.css",
  "css/fsm-spot-unity.css",
  "css/fsm-v5-cohesion-final.css",
  "data/tours.json",
  "css/cycle-tours.css",
  "js/filter-model.js",
  "js/ui/filter-results.js",
  "js/ui/filter-summary.js",
  "js/categories.js",
  "js/ui/category-explorer.js",
  "js/ui/category-icons.js",
  "css/categories.css",
  "js/app.js",
  "js/ui/filter-select.js",
  "js/config.js",
  "js/data.js",
  "js/data/dataLoader.js",
  "js/features/plus.js",
  "js/features/personal-storage.js",
  "js/features/calendar-backup.js",
  "js/features/personal-backup.js",
  "js/features/daylog-drafts.js",
  "js/features/daylog-photos.js",
  "js/features/memory-images.js",
  "js/features/backup-zip.js",
  "js/features/tilla.js",
  "js/filters.js",
  "js/filters/apply.js",
  "js/filters/index.js",
  "js/filters/logic.js",
  "js/filters/normalize.js",
  "js/filters/tags.js",
  "js/i18n.js",
  "js/map.js",
  "js/ui/map-spots.js",
  "js/ui/map-fullscreen.js",
  "js/ui/map-toolbar.js",
  "js/ui/home-navigation.js",
  "js/router.js",
  "js/storage.js",
  "js/sw-register.js",
  "js/toast.js",
  "js/ui/language.js",
  "js/ui/menu.js",
  "js/ui/modal.js",
  "js/ui/spot-details.js",
  "js/features/community-play.js",
  "js/ui/skip-to-spots.js",
  "js/utils/dom.js",
  "./",
  "index.html",
  "en/index.html",
  "da/index.html",
  "offline.html",
  "manifest.webmanifest",
  "css/styles.css",
  "css/map-spots.css",
  "css/fsm-home-navigation-84.css",
  "css/main-header-v90.css",
  "css/fsm-map-dock-v901.css",
  "css/fsm-premium-polish-v902.css",
  "css/fsm-header-final-v907.css",
  "css/fsm-proportion-target-v917.css",
  "css/fsm-landscape-space-v918.css",
  "assets/design/main-header-leaves-v90.webp",
  "assets/design/main-header-leaves-bottom-v90.webp",
  "assets/design/main-header-landscape-v90.webp",
  "assets/design/main-header-landscape-reference-v909.webp",
  "css/community-play.css",
  "css/theme.css",
  "css/base.css",
  "css/utilities.css",
  "css/components.css",
  "css/badges.css",
  "vendor/leaflet/leaflet.css",
  "vendor/leaflet/leaflet.js",
  "vendor/markercluster/MarkerCluster.Default.css",
  "vendor/markercluster/MarkerCluster.css",
  "vendor/markercluster/leaflet.markercluster.js",
  "assets/flags/flag-de.svg",
  "assets/flags/flag-gb.svg",
  "assets/flags/flag-dk.svg",
  "assets/icons/fsm-home-v845-192.png",
  "assets/icons/fsm-home-v845-512.png",
  "assets/icons/fsm-home-v845-apple-180.png",
  "assets/tilla/tilla-hero.png",
  "assets/tilla/tilla-watercolor.png",
  "assets/spots/vejlby-klit/uebersicht.webp",
  "assets/spots/vejlby-klit/toiletten.webp",
  "assets/spots/vejlby-klit/muell-picknick.webp",
  "assets/spots/vejlby-klit/strandzugang.webp",
  "assets/spots/vejlby-klit/abendstimmung.webp",
  "data/spots.json",
  "data/i18n/de.json",
  "data/i18n/en.json",
  "data/i18n/da.json",
  "data/play-ideas.json",
  "data/partners.json",
  "assets/spots/bovbjerg-fyr/leuchtturm-pony.jpeg",
  "assets/spots/bovbjerg-fyr/strandtreppe.jpeg",
  "assets/spots/bovbjerg-fyr/holzspiel.jpeg",
  "assets/spots/bovbjerg-fyr/steilkueste.jpeg",
  "assets/spots/bovbjerg-fyr/pony-nahaufnahme.jpeg",
  "css/diary.css",
  "js/features/diary-view.js",
  "assets/spots/neerlandiavej/kletterturm-rutsche.jpeg",
  "assets/spots/neerlandiavej/spielplatz-ueberblick.jpeg",
  "assets/spots/barendsvej/klettergeruest-schaukeln.jpeg",
  "assets/spots/felto-filzwelt-soltau/backsteinfassade-eingang.jpeg",
  "assets/spots/skatepark-lemvig/rampen-am-hafen.jpeg",
  "assets/spots/skatepark-lemvig/kurven-blick-aufs-wasser.jpeg",
  "assets/spots/skatepark-lemvig/basketballflaeche.jpeg",
  "assets/spots/skatepark-lemvig/rampe-gegenlicht.jpeg",
  "assets/spots/skatepark-springe/anlage-ueberblick.jpeg",
  "assets/spots/skatepark-springe/rampen-zweite-perspektive.jpeg",
  "assets/spots/strandvejen-vrist/bahnuebergang-abendsonne.jpeg",
  "assets/spots/strandvejen-vrist/wohnmobil-abendsonne.jpeg",
  "assets/spots/felto-filzwelt-soltau/fassade-sitzplaetze.jpeg",
  "assets/spots/wow-park-skjern/fotorahmen-baumhaeuser.jpeg",
  "assets/spots/wow-park-skjern/haengebruecke.jpeg",
  "assets/spots/wow-park-skjern/baumhaus-rutsche.jpeg",
  "assets/spots/wow-park-skjern/baumhaus-netzbruecken.jpeg",
  "assets/spots/wow-park-skjern/kletterwand.jpeg",
  "css/interface.css",
  "css/fsm-ui-finish-70.css",
  "css/fsm-ui-finish-71.css",
  "css/filter-showcase-78.css",
  "css/fsm-ui-consistency.css",
  "css/fsm-design-system-83.css",
  "js/features/gemeinsam-erleben-rc.js",
  "css/gemeinsam-erleben-rc.css",
  "css/fsm-details-v43.css",
  "css/fsm-orange-actions-v41.css",
  "css/fsm-cohesion-v34.css",
  "css/fsm-about-premium-v4.css",
  "assets/spots/grundschule-rethen/IMG_0412.jpeg",
  "assets/spots/grundschule-rethen/IMG_0414.jpeg",
  "assets/spots/schachplatz-stroebeck/schachplatz.webp",
  "assets/spots/windheimstrasse/0769.webp",
  "assets/spots/windheimstrasse/0776.webp",
  "assets/spots/windheimstrasse/0777.webp",
  "assets/spots/windheimstrasse/pagalino-milpa.webp",
  "assets/spots/zinnober/IMG_0716.jpeg",
  "assets/spots/zinnober/IMG_0717.jpeg",
  "assets/spots/zinnober/IMG_0721.jpeg",
  "assets/spots/zinnober/IMG_0727.jpeg",
  "assets/spots/zinnober/IMG_0750.jpeg",
  "css/fsm-navigation-system.css",
  "js/ui/navigation-spec.js",
  "js/ui/navigation-icons.js"
];
// Spot photographs are optional offline content, not prerequisites for installing a release.
// Missing photos must never hold back a security or functionality fix.
const CORE_ASSETS = ASSETS.filter(path => !path.startsWith("assets/spots/"));
const OPTIONAL_ASSETS = ASSETS.filter(path => path.startsWith("assets/spots/"));
const REQUIRED = new Set(ASSETS.map(path => new URL(path, ROOT).href));
const OPTIONAL_URLS = new Set(OPTIONAL_ASSETS.map(path => new URL(path, ROOT).href));
function cacheKey(value) {
  const url = new URL(typeof value === "string" ? value : value.url, ROOT);
  url.search = "";
  url.hash = "";
  return url.href;
}
async function fetchFresh(request, timeout = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(request, {cache: "no-store", signal: controller.signal});
    // Reading a clone keeps the original Response/URL while covering the entire transfer.
    await response.clone().arrayBuffer();
    return response;
  }
  finally { clearTimeout(timer); }
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
async function validateData(response, url) {
  const data = await response.clone().json();
  const relative = new URL(url, ROOT).pathname.slice(ROOT.pathname.length);
  if (relative === "data/spots.json") {
    const spots = Array.isArray(data) ? data : data?.spots;
    if (!Array.isArray(spots) || spots.some(spot => !isRecord(spot))) throw new Error("Invalid spot data");
  } else if (relative === "data/partners.json") {
    const codes = Array.isArray(data) ? data : data?.codes;
    if (!Array.isArray(codes) || codes.some(code => !isRecord(code))) throw new Error("Invalid partner data");
  } else if (relative === "data/tours.json") {
    if (!isRecord(data) || data.schemaVersion !== 1 || !Array.isArray(data.tours) ||
        data.tours.some(tour => !isRecord(tour) || typeof tour.id !== "string" ||
          typeof tour.country !== "string" || !isRecord(tour.title) ||
          !Number.isFinite(tour.lengthKm))) throw new Error("Invalid tours catalogue");
  } else if (relative === "data/play-ideas.json") {
    if (!Array.isArray(data) || data.some(idea => !isRecord(idea))) throw new Error("Invalid play ideas");
  } else if (relative.startsWith("data/i18n/")) {
    if (!isRecord(data) || Object.keys(data).length === 0) throw new Error("Invalid translation data");
  }
}
async function validateImage(response, url) {
  const relative = new URL(url, ROOT).pathname.slice(ROOT.pathname.length);
  const size = {"assets/icons/fsm-home-v845-192.png": 192, "assets/icons/fsm-home-v845-512.png": 512, "assets/icons/fsm-home-v845-apple-180.png": 180}[relative];
  if (!size) return;
  const bytes = new Uint8Array(await response.clone().arrayBuffer());
  const signature = [137,80,78,71,13,10,26,10];
  if (bytes.length < 33 || signature.some((byte, index) => bytes[index] !== byte)) throw new Error(`Invalid app icon: ${relative}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(8) !== 13 || view.getUint32(12) !== 0x49484452 || view.getUint32(16) !== size || view.getUint32(20) !== size) throw new Error(`Invalid app icon dimensions: ${relative}`);
}
const RELEASE_HASHES = {
  "css/fsm-touren-reference.css": "cdaa7869bca72de445576bee1f0fc0f3af390a023045868cb3012f78578bb36a",
  "data/tours.json": "d98ad4d6fdddaca220147f3ee113e185010783e1db8840d3f05706db2e51b7de",
  "css/tourenwelt.css": "3345cd916a6bba4675e993b83c8a122bdd2e91a7da3ad262933d9026bdf0744a",
  "js/ui/tourenwelt.js": "d537a76d5f7257971affeb5e5a392e118cf7f89af5dd05648931f5ef1ada05be",
  "js/ui/stroebeck-track.js": "1745660b3a7bc8c09fdb711ba0f0d3b015cf4d03094cc82f06ba5e84c0888a30",
  "js/ui/cycle-tours.js": "25488ab717a1e2c541fa693403a8f63b9d13f54a167b382f6cff442f51f7387c",
  "css/cycle-tours.css": "99c0527378199284d3dc218e8cba9a0b272e83d38b1023a9fcc0038145c4a1f7",
  "css/fsm-design-system-83.css": "7d7c21c75a85ee14990749fdcf7428b9f52fe0b81a5651acb13f6045a0192b71",
  "js/ui/category-icons.js": "fcc00a121936e579b1590bb23f31854f3bfc7fd305e1c6aca8fb3d0fda42d6c7",
  "css/fsm-ui-consistency.css": "d61d241858bb534acb07a5b17c9225eed32a79f37b98740dff963a3779a42b1d",
  "css/filter-showcase-78.css": "b81f3217fd6a866091e10ecfc61cbf002d60fe6f2b559acfdd28a08b640732ea",
  "css/fsm-ui-finish-70.css": "0d8ced6350a96ec61d98195d5feae32ec04c51ae8cc97a43aba7a27d4f1eab5e",
  "js/ui/filter-summary.js": "b7e0155c909fc50a9124ddff2efde40d4ea91f59038d0afd211642053a0699ff",
  "js/ui/map-toolbar.js": "68b7a10d18c37eef4e4c0d4491b2d895fa1df39268e84f0fb4a93c7aaf694821",
  "css/theme.css": "1623d0ad94b1d92ba65f2777356dfab47f75d78004e82bc080cd40450fa59a2d",
  "js/filter-model.js": "1eaee4ef7c57398042071867e1444c18e3c63370174d788f6e5b563123962c2f",
  "css/map-spots.css": "fc811f5faf3a652126a6f8fbc25b8de0501144a43eff5b7e5171cd1f45207923",
  "da/index.html": "b321087a082e94c2ab0aa02770baa673a7fd9505d9846a749454aa5fb2c20e1f",
  "data/i18n/da.json": "951da56127bece47feacd0b14f36bce865da645f7125ea49664d4766c1e61e41",
  "data/i18n/de.json": "db4a3703a47a36c9b3e0735da710e20f17e2b8c8fc041a60ba7ad0a7b9ad29ce",
  "data/i18n/en.json": "48e6dc58647ab76a07b38360bbd3d704e3058fbdda9c0cdb60f0e8441ed0a9b6",
  "data/play-ideas.json": "c18f791a6f9bc6490e5414f7ea4ba3e5735ef597d70235e93530f0ee1ba7dc07",
  "data/spots.json": "c6557b4998710233813d58617b15b459a419ae6f1dda9af7f1100608708d206a",
  "en/index.html": "2fe7c164078c9c5b92fb8fcb827f06836583b0bb35fe64bb8d47935fc45b3fd8",
  "index.html": "e9f9bee9ffef26e2e8a894ca82250bd8e04d75631ddb3a89dd8d4182623dc218",
  "js/app.js": "b99d13b70e1f0024e93215a9440883f5da1b5ddbd2305be32a380aa8c8136169",
  "js/config.js": "d5b73ee24a85bc392458fa33a8167c9a1749d467b6f3e8fea804a8d7099fa48a",
  "js/features/personal-backup.js": "e1019180ef2046c93ee0ae7c2a9fcedec9af1375496a811f50bf81afaca61e86",
  "js/features/personal-storage.js": "32876282f17c01fcd46b08b7e8caed4e54aaa5b77052ed725fdc9b5b1b4e1f8b",
  "js/features/tilla.js": "0f6b03a39a5c05f68e24159c09ab4339074d6d1ab388452f13424b873b9496e3",
  "js/i18n.js": "16488d8e1e10270b4b9f40b2a151b52fc0edf1865fe90dee2dfbd40188d2b585",
  "js/map.js": "05c18b7c540fe21e71a876e5d454d4b30266d19bc75b06a3d442c42d7155477e",
  "js/ui/menu.js": "87a9bd34bd2cd9a2e4510629c69932541e911522df89c322544aae0bb46e7311",
  "js/ui/spot-details.js": "76149c3cdfc07535509985b3fa1dca4cf2965709458f6d976b1d4d3b6f3b2a6b",
  "offline.html": "e3b8b124835d55406742d8fcf922f5e76d4ee2d6dac9577430fa716b83c08b6f",
  "assets/spots/bovbjerg-fyr/leuchtturm-pony.jpeg": "dedd90020fb6c6d61fbf7106f5fc5fbe0841b0e8e5fe48492dbc7261010b84aa",
  "assets/spots/bovbjerg-fyr/strandtreppe.jpeg": "1996690336f41ac45960ed55918c8df95984912a839acbe0a289d80ec3626390",
  "assets/spots/bovbjerg-fyr/holzspiel.jpeg": "bc2d6e5273ea77bdcb138d40f77e594050e72075b0c59480617599f7ce141428",
  "assets/spots/bovbjerg-fyr/pony-nahaufnahme.jpeg": "c4e824f10705788a727e2606f64f5b3bc18b2c851092cf2ce9470bf79f7ac937",
  "assets/spots/bovbjerg-fyr/steilkueste.jpeg": "e46330a1c3a585251620171acf2cedff3b85ba786cbd5158de909590ddc76cfa",
  "js/features/plus.js": "c03a11ef480417385ef23a29048ba319b3caf01cbf7ef1a5a62c63322a9259fa",
  "js/storage.js": "0f469c7f823a2e0827284b83be22636a64774fe6cc7679728742fe703edfa961",
  "js/features/daylog-photos.js": "a50fe7c7a6b2f0abcbb7ec234e3df643fa2d67a0a9bb99d9424484f628fdc1e7",
  "js/features/memory-images.js": "f986395cca434c008b3363e8ae076948ddcbecea952c94cc311a40f02f312143",
  "js/features/backup-zip.js": "c9ece03d64d8a27e9ae534cd86c3e4e5028a71e815e702d50524b44ae8bbafbe",
  "js/sw-register.js": "92bb6d9e4a18283513e468468b2510f1adadf4dba49a5f4b1b5478237ae4e4bb",
  "css/components.css": "e4894ef86aad2df5eef59795905b532bf79f7aa1cec0277a58221a5fd4557cfc",
  "css/diary.css": "7014ce6ae8934e09b58fc8d0c7906dffd1fa85a67698368e5d8b4c0842790d9f",
  "js/features/diary-view.js": "caa3f074a171135743f7876a2c3e5bf7c4b16cc7959ede0555538131423502b6",
  "js/router.js": "1063d84d4a762687b5e41262ad7ba5becce1dcdf4208e32d0defd345c2f67df2",
  "js/ui/filter-select.js": "3710bbcfbd3ca6a6b6095bec6e526df17eb0dac98695211477047fdc1e29e2c1",
  "assets/spots/neerlandiavej/kletterturm-rutsche.jpeg": "099193f4efe8bb7e84dab69524d9b985db7b8556b4b7fc32cd93b0f10e8c9a14",
  "assets/spots/neerlandiavej/spielplatz-ueberblick.jpeg": "c880caa15b73ecaea4225bc691d19f8457fe0fcea691631cb4682c602fe82346",
  "assets/spots/barendsvej/klettergeruest-schaukeln.jpeg": "07764f48e966b7669ad278f0988717819d73f22694f746469513ca5dea994021",
  "assets/spots/felto-filzwelt-soltau/backsteinfassade-eingang.jpeg": "90a3575cc19b3b0d39444b5dbadec6593b58c5ca82a9cc5e26bab60a8da58262",
  "assets/spots/skatepark-lemvig/rampen-am-hafen.jpeg": "6aa1f834749ddc387525ce8bed3fe4af1c6dcaa1e3eb647d0c2ef0a1d58c7d2d",
  "assets/spots/skatepark-lemvig/kurven-blick-aufs-wasser.jpeg": "1daf9603aeaa2db59679813b0c40880c0bec727e6f513c980ed5454f65408cf7",
  "assets/spots/skatepark-lemvig/basketballflaeche.jpeg": "de6f37750d5424e333cc0cf10509ab436a175a6c86b00e552961866f2f6b45e8",
  "assets/spots/skatepark-lemvig/rampe-gegenlicht.jpeg": "890cbbe86c7a9906de4b6b16192a09907328dafea5daba84bbe422aa49d55603",
  "assets/spots/skatepark-springe/anlage-ueberblick.jpeg": "c1054e6f29c680e206e4db94fee98a5fc9ed3bb04ca78c66f333847eea9549c8",
  "assets/spots/skatepark-springe/rampen-zweite-perspektive.jpeg": "778c7426daed76365f05d8ec2056ba7a53adc3c262d5ddd6eafb83e6b14f8c18",
  "js/utils/dom.js": "246bc8a844710c41935deb1e9c4ef1ff5083af3bc9b2952983526d6ae0cd4432",
  "css/badges.css": "368e7f67b004d7ee8a5f030312260aba6aad2a1e93d8c4235bc0cacca808f15b",
  "js/filters/tags.js": "fbea5599ad6503ccb8a2bb1da9a7d46a3d1bf5ce27afe46c8f1f280ac2ada923",
  "js/filters/logic.js": "775816b277bf8e393bc942f5782e335f038ccbaa5f01514f6e9410db085fc50f",
  "css/styles.css": "8601c7166da06a60a3a97459c9eb63169f9bf5f8691ca8b9e4be12d6bf1db938",
  "js/ui/map-fullscreen.js": "a7ab652087277cbb5bdb53fb2265eedf264605aa93736343e7f28dfffac63161",
  "js/categories.js": "194787250b762a5f26f62b765bd39596f8c9da7d2a72dbdc067a3c195db63dd6",
  "js/ui/category-explorer.js": "bd30833878af0ee06336a5a154d2b0668ddd55ceaf18850b0ba121ce55b82e8d",
  "css/categories.css": "07ca5cfa691f69421f55668be6969bb7520451867aea2e94aeab5b68894d164e",
  "js/ui/filter-results.js": "c93fa5155dce5dff2d42f73fdb6ba3c6012136549ecd355884ca1d252dddafae",
  "css/interface.css": "a91ccdc16e91afe89b528dfaf3efb31f85a2bf42aa1bddc6e1b8260c637594ed",
  "css/fsm-ui-finish-71.css": "5f786de619f9719981fcad413dcb5f405799491a58c8bf445a57d9b9202ecb8a",
  "css/fsm-home-navigation-84.css": "a74aaf3aa8235adeb72e9691861cc73f791733a924225c23a963bc689f43ab87",
  "js/ui/home-navigation.js": "82ef1541a0e64e6db6078cc32303c3fe7a81e95ae064f1175b6f5aeb675514fa",
  "css/main-header-v90.css": "ad40002b9402a8da8423be8352dbb9baf145eb3df9cae8523133b18023f56d8f",
  "css/fsm-map-dock-v901.css": "515deb7488c673f23e7a59b27a4f4587894b0e00de65b73a2d3997d4d9956013",
  "css/fsm-premium-polish-v902.css": "cd52545ffd22c3d0bf1116a7ce1af2d350a17fa4daf8a9051ae6aec092809f91",
  "css/fsm-header-final-v907.css": "71976a545acfc066d9b1d48297b1655d8890f6159950c4c209eaa88a2d99966a",
  "css/fsm-proportion-target-v917.css": "27be709373439c80440694ddc6becc1cbf15846b0007294ee10e122e38bb9593",
  "css/fsm-landscape-space-v918.css": "6a75a8bdaaa3f0caf62b0cfc2b0b51d2cac57a9f1d652b4dce380c64188e1886",
  "assets/design/main-header-leaves-v90.webp": "fe0eb90577732eb6049673816dfdf6c76d6f1290b5f6f247cf916a3fb00c7f36",
  "assets/design/main-header-leaves-bottom-v90.webp": "03fc3b10f71d83ae49bc9f9d0f690117d8b51d7d49f80d363ab452f82746f097",
  "assets/design/main-header-landscape-v90.webp": "005ea07d4960c6d02af287ae33e5ce3adecc61fd2f07bd66127c0a322a8f2a6e",
  "assets/design/main-header-landscape-reference-v909.webp": "fbbf163b76db5abe6a7a11384af5658d9546c8ae5533cd421d4070b923c0d561",
  "css/community-play.css": "8202d043e596ffa0de47c84a79d12695d1a0129013aae3152386fcf29ef009d5",
  "js/ui/filsoe-tour.js": "172e29ad77325a8c4cfa8e0548c99a91106f8669c3ae83dbd27d073406bb5c91",
  "assets/spots/filsoe/ellipse.webp": "5c362b84cd83558748f5417a71b91aac39935a028a85d57470f890d1d179ea46",
  "js/features/gemeinsam-erleben-rc.js": "7fb1422db5af6e9de9bd629803b9950f1c17b0c5e0492c6577d177fdd0979a93",
  "js/features/community-play.js": "594880fde127b94ad781b63fc08d234776a0eb63d1b9f1f5e2d5835b14b16a2e",
  "css/fsm-orange-actions-v41.css": "f040b7af13c26c3b9ccd5f80671e7a46688d0a4fcff7a5f768cac7ed9fa892b6",
  "css/fsm-details-v43.css": "42c4149cc7b9c16beaab51e20ea6baa7a31349bff97ea3ca0789a7d698866751",
  "css/gemeinsam-erleben-rc.css": "548565acfb6c6b8d3ff811c2f347e98bddeb049bf95e830eb9075ea521d8d7bb",
  "css/fsm-cohesion-v34.css": "4f5ccce83011a5657d3610e7cc02df5d43e2375246911624629d13243cef3303",
  "js/features/calendar-backup.js": "abedcb203b00ece33fcde80069fc1af5e328892f625d15edbe5818781696a359",
  "css/fsm-v5-cohesion-final.css": "3677ecb35afd00ce228aa4900c5eddf2926af10874f0f1d2ce970c3ea423f173",
  "css/fsm-spot-unity.css": "66c5306f9b140946cc5a84e406c96d6c822eb6fba47d410b5958813f895eaefc",
  "css/fsm-navigation-system.css": "59fd05cfb6e5f0a60d5b8e05bd83927ff26ea8483bb6fe9aaeaaa2572d547ff9",
  "js/ui/navigation-spec.js": "85673b3c4a88e9adddb6fa7620ecef4e692d298355e88d791561232c30ef6f58",
  "js/ui/navigation-icons.js": "705ae6187dbe3faada235b49bdb678097f69afb671e2c4d0e63f69701d605629"
};
async function validateMapPresentation(response, url) {
  const relative = new URL(url, ROOT).pathname.slice(ROOT.pathname.length);
  const expected = RELEASE_HASHES[relative];
  if (!expected) return;
  const digest = await crypto.subtle.digest("SHA-256", await response.clone().arrayBuffer());
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== expected) throw new Error(`File does not match this update: ${relative}`);
}
// Short, atomic installation: a rare spot image or a secondary asset can no
// longer prevent the release from activating on iOS Safari.
const INSTALL_SHELL = ["index.html", "en/index.html", "da/index.html", "offline.html", "manifest.webmanifest"];
const DOCUMENT_PAGES = new Set(["index.html", "en/index.html", "da/index.html", "offline.html"]);

async function checkedNetwork(request, path, timeout = 9000) {
  const response = await fetchFresh(request, timeout);
  if (!response.ok) return response;
  if (path.endsWith(".json") && (path.startsWith("data/") || path === "manifest.webmanifest")) {
    if (path !== "manifest.webmanifest") await validateData(response, new URL(path, ROOT).href);
  }
  await validateMapPresentation(response, new URL(path, ROOT).href);
  return response;
}

async function cacheBestEffort(cache, key, response) {
  try { await cache.put(key, response.clone()); } catch (error) {
    // Private browsing / storage pressure should never block an online page.
    console.info("[FSM] Optional offline cache skipped", error?.message || error);
  }
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      // The five small navigation files are the ONLY installation prerequisites.
      // A failed or incomplete shell preserves the preceding active worker.
      await Promise.all(INSTALL_SHELL.map(async path => {
        const key = new URL(path, ROOT).href;
        const response = await checkedNetwork(key, path, 18000);
        if (!response.ok) throw new Error(`Required app shell unavailable: ${path}`);
        await cache.put(key, response);
      }));
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    // Never touch previous repositories' caches: the scope is part of PREFIX.
    const previous = (await caches.keys()).filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
    // Retain one preceding release for best-effort offline recovery.
    for (const old of previous.slice(0, -1)) await caches.delete(old);
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_VERSION" && event.ports?.[0]) {
    event.ports[0].postMessage({version:CACHE_VERSION});
  }
});

function relativePath(url) {
  const rel = url.pathname.slice(ROOT.pathname.length);
  // Directory pages must resolve to their associated HTML document.
  if (!rel || rel.endsWith("/")) return rel + "index.html";
  return rel;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const path = relativePath(url);
  // Read latest release receipt from the network, never the service-worker cache.
  if (path === "release-info.json") return;
  const key = new URL(path, ROOT).href;
  const isPage = request.mode === "navigate";
  const isCorePage = DOCUMENT_PAGES.has(path);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Online first for ALL local resources, including CSS imports and JS modules.
    // That prevents a browser from displaying older JavaScript after a fresh push.
    try {
      const response = await checkedNetwork(request, path, isPage ? 7000 : 10000);
      if (response.ok) {
        await cacheBestEffort(cache, key, response);
        return response;
      }
      // HTTP 404/503 should not overwrite a previously valid offline copy.
      return await cache.match(key) || response;
    } catch (error) {
      const cached = await cache.match(key);
      if (cached) return cached;
      if (isPage) {
        return await cache.match(new URL("offline.html", ROOT).href) ||
          new Response("Offline", {status:503, headers:{"Content-Type":"text/plain"}});
      }
      if (path.endsWith(".json")) {
        return new Response(JSON.stringify({error:"offline_not_cached"}), {
          status:503, headers:{"Content-Type":"application/json"}
        });
      }
      return new Response("Resource unavailable offline", {status:503});
    }
  })());
});
