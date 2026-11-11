// Dependency-free checks for the published application. Fails the GitHub job on errors.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const fail = text => { console.error(text); failures++; };
const read = name => fs.readFileSync(path.join(root, name), "utf8");
function files(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const appPages = ["index.html", "en/index.html", "da/index.html", "offline.html", "experimente/55-grad/index.html"];
for (const name of appPages) {
  if (!/<meta name="color-scheme" content="light"/.test(read(name)))
    fail(`Light color scheme required: ${name}`);
}
const alternateScheme = /prefers-color-scheme|color-scheme\s*:\s*(?:only\s+)?dark|data-theme\s*=\s*["']?dark|initEveningMode|(?:css\/evening\.css|evening-mode\.js)|DARK_STYLE|(?:fsm-evening|theme-toggle)/i;
for (const name of [...appPages, ...files("css"), ...files("js"), ...files("src"), ...files("experimente"), "init.js", "service-worker.js"]) {
  if (/\.(?:css|js|html)$/.test(name) && alternateScheme.test(read(name))) fail(`Alternate color scheme found: ${name}`);
}
for (const name of [...files("js"), ...files("src"), ...files("tools"), ...files("utils"), "init.js", "service-worker.js"]) {
  if (!/\.(?:m?js)$/.test(name)) continue;
  const result = spawnSync(process.execPath, ["--input-type=module", "--check"], { input: read(name), encoding: "utf8" });
  if (result.status !== 0) fail(`${name}: ${result.stderr}`);
}
for (const name of [...files("data"), ".eslintrc.json", "htmlhint.json", "manifest.webmanifest"]) {
  if (!/\.(?:json|webmanifest)$/.test(name)) continue;
  try { JSON.parse(read(name)); } catch (error) { fail(`${name}: ${error.message}`); }
}
if (failures) { console.error(`Project check stopped: ${failures} syntax/JSON errors. Nothing can be published.`); process.exit(1); }
for (const name of ["index.html", "en/index.html", "da/index.html", "offline.html"]) {
  const html = read(name);
  const htmlIds = new Set();
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    if (htmlIds.has(match[1])) fail(`Duplicate HTML id: ${name}: ${match[1]}`);
    htmlIds.add(match[1]);
  }
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(match[1]) || /application\/ld\+json/.test(match[1])) continue;
    const module = /type=["']module["']/.test(match[1]);
    const result = spawnSync(process.execPath, module ? ["--input-type=module", "--check"] : ["--check"], { input: match[2], encoding: "utf8" });
    if (result.status !== 0) fail(`Inline script in ${name}: ${result.stderr}`);
  }
  if (name !== "offline.html") {
    const spotToggle = html.match(/id="btn-toggle-spots"[\s\S]*?<\/button>/)?.[0];
    for (const state of ["show", "hide"]) {
      const label = spotToggle?.match(new RegExp(`<span\\b[^>]*data-state="${state}"[^>]*>`))?.[0];
      for (const lang of ["de", "en", "da"]) {
        if (!label?.includes(`data-i18n-${lang}=`)) fail(`Missing list-toggle translation: ${name}: ${state}/${lang}`);
      }
    }
    for (const id of ["filter-radius-max-label", "filter-radius-description", "filter-summary", "plus-status-text", "tilla-sidebar-text", "header-tagline"]) {
      const tag = [...html.matchAll(/<[^>]+>/g)].map(match => match[0]).find(tag => tag.includes(`id="${id}"`));
      if (!tag) fail(`Missing dynamic element: ${name}: ${id}`);
      else if (/\bdata-i18n(?:-(?:de|en|da))?\s*=/.test(tag)) fail(`Static translation overwrites dynamic text: ${name}: ${id}`);
    }
  }
}
function flatten(object, prefix = "", result = {}) {
  for (const [key, value] of Object.entries(object)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") result[name] = value;
    else if (value && !Array.isArray(value) && typeof value === "object") flatten(value, name, result);
  }
  return result;
}
const translations = Object.fromEntries(["de", "en", "da"].map(lang => [lang, flatten(JSON.parse(read(`data/i18n/${lang}.json`)))]));
const allKeys = new Set(Object.values(translations).flatMap(table => Object.keys(table)));
for (const [lang, table] of Object.entries(translations)) {
  for (const key of allKeys) if (!table[key]?.trim()) fail(`Translation ${lang} missing: ${key}`);
}
// Check the built-in fallback against all three source dictionaries.
const fallbackMatch = read("js/i18n.js").match(/const FALLBACK_MESSAGES = (\{[\s\S]*?\n\});/);
if (!fallbackMatch) fail("Bundled language fallback is missing");
else {
  const fallback = JSON.parse(fallbackMatch[1]);
  for (const lang of ["de", "en", "da"]) {
    for (const key of allKeys) if (fallback[lang]?.[key] !== translations[lang][key]) fail(`Bundled translation ${lang} out of date: ${key}`);
    for (const key of Object.keys(fallback[lang] || {})) if (!(key in translations[lang])) fail(`Obsolete bundled translation ${lang}: ${key}`);
  }
}
// Historical modules are not loaded by the app, but must not retain broken imports.
for (const name of [...files("js"), ...files("src"), ...files("utils"), "init.js"]) {
  if (!name.endsWith(".js")) continue;
  const source = read(name).replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  for (const match of source.matchAll(/(?:import|export)\s+(?:[^;]*?\s+from\s+)?["'](\.[^"']+)["']/g)) {
    const target = path.resolve(root, path.dirname(name), match[1].split("?")[0]);
    if (!fs.existsSync(target)) fail(`Broken module dependency: ${name} -> ${match[1]}`);
  }
}
const playFallbackMatch = read("js/i18n.js").match(/const FALLBACK_PLAY_IDEAS = (\[[\s\S]*?\n\]);/);
const expectedIdeas = JSON.parse(read("data/play-ideas.json")).map(idea => ({id: idea.id, texts: idea.texts || Object.fromEntries(["de", "en", "da"].filter(lang => lang in idea).map(lang => [lang, idea[lang]]))}));
if (!playFallbackMatch || JSON.stringify(JSON.parse(playFallbackMatch[1])) !== JSON.stringify(expectedIdeas)) fail("Bundled play ideas do not match the source data");
for (const name of ["index.html", "en/index.html", "da/index.html"]) {
  const image = read(name).match(/property="og:image"\s+content="([^"]+)"/)?.[1];
  const prefix = "https://heimhafen.github.io/Family-Spots-Map-V5/";
  if (!image?.startsWith(prefix) || !fs.existsSync(path.join(root, image.slice(prefix.length)))) fail(`Missing sharing image: ${name}`);
}
const expectedSitemap = ["https://heimhafen.github.io/Family-Spots-Map-V5/", "https://heimhafen.github.io/Family-Spots-Map-V5/en/", "https://heimhafen.github.io/Family-Spots-Map-V5/da/"];
const actualSitemap = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (JSON.stringify(actualSitemap) !== JSON.stringify(expectedSitemap)) fail("Sitemap must contain the three current entry points");
if (!read("robots.txt").includes("Sitemap: https://heimhafen.github.io/Family-Spots-Map-V5/sitemap.xml")) fail("Robots sitemap URL is incorrect");
const reached = new Set();
function checkModule(name) {
  if (reached.has(name)) return;
  reached.add(name);
  const source = read(name).replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  for (const match of source.matchAll(/(?:import|export)\s+(?:[^;]*?\s+from\s+)?["'](\.[^"']+)["']/g)) {
    const target = path.resolve(root, path.dirname(name), match[1].split("?")[0]);
    if (!fs.existsSync(target)) fail(`Missing module: ${name} -> ${match[1]}`);
    else checkModule(path.relative(root, target));
  }
}
for (const entry of ["js/app.js", "js/sw-register.js"]) checkModule(entry);
const assetsMatch = read("service-worker.js").match(/const ASSETS = (\[[\s\S]*?\]);/);
const assets = vm.runInNewContext(assetsMatch[1]);
// Stop publication when only part of a coordinated release was uploaded.
const hashMatch = read("service-worker.js").match(/const RELEASE_HASHES = (\{[\s\S]*?\n\});/);
if (!hashMatch) fail("Release checksums are missing from the service worker");
else {
  let hashes;
  try { hashes = JSON.parse(hashMatch[1]); } catch { fail("Invalid release checksum table"); }
  for (const [name, expected] of Object.entries(hashes || {})) {
    if (!assets.includes(name)) { fail(`Checksum refers to a non-cached asset: ${name}`); continue; }
    if (!/^[a-f0-9]{64}$/.test(expected)) { fail(`Invalid release checksum: ${name}`); continue; }
    if (!fs.existsSync(path.join(root, name))) { fail(`Missing release file: ${name}`); continue; }
    const actual = createHash("sha256").update(fs.readFileSync(path.join(root, name))).digest("hex");
    if (actual !== expected) fail(`Release checksum mismatch: ${name}. Upload the matching file and service-worker.js together.`);
  }
}

// Release features must also be integrated in the direct language entry pages.
const release = read("service-worker.js").match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
for (const name of ["index.html", "en/index.html", "da/index.html"]) {
  const html = read(name);
  for (const fragment of [
    `css/styles.css?v=${release}`,
    `./js/app.js?v=${release}`,
    'class="tilla-watercolor-canvas"',
    'src="assets/tilla/tilla-watercolor.png"'
  ]) if (!html.includes(fragment)) fail(`Incomplete release integration: ${name}: ${fragment}`);
  if (html.includes('data-onboarding-hint') || html.includes('fsm_onboarding_hint_dismissed')) fail(`Deprecated onboarding hint remains in ${name}`);
  if (!/id="tilla-memory-note"[\s\S]*?\bhidden\b[\s\S]*?>/.test(html)) fail(`Memory note must start hidden: ${name}`);
}
if (!read("css/styles.css").includes(`./map-spots.css?v=${release}`)) fail("Map styles use a different release version");
if (!read("js/map.js").includes(`./ui/map-spots.js?v=${release}`)) fail("Map presentation uses a different release version");
if (!read("js/app.js").includes(`./map.js?v=${release}`)) fail("Map module uses a different release version");
if (/[\u00c3\u00c2]|\u00e2[\u0080-\u00bf]|\ufffd/.test(read("js/ui/map-spots.js"))) fail("Broken UTF-8 characters in map presentation");
for (const name of ["data/partners.json", "data/spots.json", "data/i18n/de.json", "data/i18n/en.json", "data/i18n/da.json"]) {
  if (/[\u00c3\u00c2\u00e2][\u0080-\u00bf]|\ufffd/.test(read(name))) fail(`Broken UTF-8 display text: ${name}`);
}
for (const name of reached) if (!assets.includes(name)) fail(`Module not available offline: ${name}`);
for (const name of assets) if (name !== "./" && !fs.existsSync(path.join(root, name))) fail(`Missing offline asset: ${name}`);
const manifest = JSON.parse(read("manifest.webmanifest"));
for (const item of [...manifest.icons, ...(manifest.screenshots || [])]) {
  const imagePath = path.join(root, item.src);
  if (!fs.existsSync(imagePath)) { fail(`Missing manifest image: ${item.src}`); continue; }
  if (item.type === "image/png" || item.src.endsWith(".png")) {
    const bytes = fs.readFileSync(imagePath);
    if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.toString("ascii", 12, 16) !== "IHDR") {
      fail(`Invalid PNG image: ${item.src}`);
      continue;
    }
    const actual = `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
    if (item.sizes && !item.sizes.split(/\s+/).includes(actual)) fail(`Wrong manifest image dimensions: ${item.src}: ${actual}`);
  }
}
const payload = JSON.parse(read("data/spots.json"));
const spots = Array.isArray(payload) ? payload : payload?.spots;
if (!Array.isArray(spots)) { fail("Spot data must contain an array"); process.exit(1); }
const ids = new Set();
for (const spot of spots) {
  if (!spot || typeof spot !== "object" || Array.isArray(spot)) { fail("Invalid spot record"); continue; }
  const id = (typeof spot.id === "string" && spot.id.trim()) || (typeof spot.id === "number" && Number.isFinite(spot.id) ? String(spot.id) : "");
  if (!id || ids.has(id)) fail(`Missing or duplicate spot id: ${spot.id}`);
  ids.add(id);
  const lat = Number(spot.lat ?? spot.location?.lat), lng = Number(spot.lng ?? spot.lon ?? spot.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) fail(`Invalid coordinates: ${spot.id}`);
  for (const lang of ["de", "en", "da"]) if (!spot[`summary_${lang}`]?.trim()) fail(`Missing summary ${lang}: ${spot.id}`);
}
for (const idea of JSON.parse(read("data/play-ideas.json"))) for (const lang of ["de", "en", "da"]) if (!(idea.texts?.[lang] || idea[lang])?.trim()) fail(`Missing play idea ${lang}: ${idea.id}`);
// V34 integration contract: a private planner, never accidental public registration.
for (const entry of ["index.html", "en/index.html", "da/index.html"]) {
  const html = read(entry);
  for (const asset of ["css/gemeinsam-erleben-rc.css", "css/fsm-cohesion-v34.css"])
    if (!html.includes(asset)) fail(`${entry}: missing coordinated style ${asset}`);
}
for (const module of ["js/features/gemeinsam-erleben-rc.js", "css/gemeinsam-erleben-rc.css", "css/fsm-cohesion-v34.css"])
  if (!assets.includes(module)) fail(`Offline missing V34 module: ${module}`);
if (!/initPrivateCalendar\(\{\s*closeMenu\b/.test(read("js/app.js"))) fail("Broken private planning integration: js/app.js");
for (const file of ["js/ui/spot-details.js", "js/features/community-play.js", "js/features/gemeinsam-erleben-rc.js"]) {
  if (!read(file).includes("fsm:plan-spot"))
    fail(`Broken private planning integration: ${file}`);
}
const uniqueSpotImages = [...new Set(spots.flatMap(spot => [...JSON.stringify(spot).matchAll(/assets\/spots\/[\w./-]+\.(?:webp|png|jpe?g)/g)].map(match => match[0])))];
for (const image of uniqueSpotImages) if (!assets.includes(image)) fail(`Spot image missing offline: ${image}`);

console.log(`${spots.length} spots, ${allKeys.size} translation keys per language, ${assets.length} offline assets. ${failures} errors.`);
process.exitCode = failures ? 1 : 0;

// Keep backup compatibility and corruption guards in the publication gate.
await import('./check-backups.mjs');

// Prevent accidental re-publication of partner/test codes or dev-force mode.
await import('./check-plus-owner.mjs');

// Keep the multilingual content and evidence contract in the publication gate.
await import('./check-content.mjs');

// Category compatibility and evidence rules are part of the publication gate.
await import("./check-categories.mjs");

// Keep result count and action states in the publication gate.
await import('./check-results.mjs');

// Keep names, filter descriptions and predictive counts in the publication gate.
await import('./check-filter-contract.mjs');

// The same build must work both on Cloudflare previews and GitHub Pages.
await import('./check-hosting.mjs');

// All public Plus explanations must match the actual test-only entitlement.
await import("./check-ui-copy.mjs");
