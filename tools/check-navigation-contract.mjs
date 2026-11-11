// V5: CI regression check for the shared five-target navigation contract.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const names=['map','filters','spots','diary','plus'];
const spec=read('js/ui/navigation-spec.js');
assert(spec.includes('Object.freeze(["map", "filters", "spots", "diary", "plus"])'),'Navigation order must remain canonical');
for (const key of names) assert(spec.includes(`${key}:`),'Missing translated navigation destination: '+key);
const legacyMapDock=read('css/fsm-map-dock-v901.css');
// Regression: a former V90 visual replacement hid the canonical orange Spots SVG
// and drew a pseudo-element using the dark text color. The icon must have
// exactly one source of truth; reintroducing either rule is a release blocker.
assert(!/\[data-fsm-home-action=["']spots["']\]\s*>\s*svg\s*\{\s*display\s*:\s*none/i.test(legacyMapDock),
  'Legacy map dock must not hide the canonical Spots SVG');
assert(!/\[data-fsm-home-action=["']spots["']\]::before/i.test(legacyMapDock),
  'Legacy map dock must not overlay a pseudo Spots pin');
const css=read('css/fsm-navigation-system.css');
assert(css.includes('[data-nav="map"]'),'Map needs an orange contract');
assert(css.includes('[data-nav="diary"]'),'Diary needs a green icon');
assert(css.includes('[data-nav="plus"]'),'Plus must stay far right');
assert(css.includes('background: transparent !important'),'No active background tile');
assert(css.includes('--fsm-nav-height: 44px'),'Navigation height token must be 44 px');
assert(css.includes('height: 44px !important'),'Navigation/tab targets must have fixed height');
assert(css.includes('min-height: 44px !important') && css.includes('max-height: 44px !important'),'Navigation height must not fluctuate');
assert(css.includes('color: var(--fsm-nav-text) !important'),'All navigation labels must use Family Spots Map brown');
assert(!css.includes('[data-nav="map"] :is(.fsm-nav-icon,.fsm-home-nav__label'),'Map label must never inherit orange icon color');
for (const file of ['js/ui/home-navigation.js','js/ui/map-toolbar.js','js/ui/tourenwelt.js','js/features/gemeinsam-erleben-rc.js']) {
  const text=read(file);
  assert(text.includes('NAV_ORDER'),file+': must import shared navigation order');
  assert(text.includes('navigation-spec.js'),file+': must import common spec');
  assert(!text.includes('["map", "filters", "spots", "diary", "plus"]')&&!text.includes('["map","filters","spots","diary","plus"]'),file+': duplicated inline order');
}
for (const file of ['js/ui/home-navigation.js','js/ui/tourenwelt.js','js/features/gemeinsam-erleben-rc.js']) {
  assert(read(file).includes('navigation-icons.js'),file+': shared SVG missing');
}
const worker=read('service-worker.js');
const version=worker.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
assert(version,'Missing version');
const assets=JSON.parse(worker.match(/const ASSETS = (\[[\s\S]*?\n\]);/)?.[1]||'null');
const hashes=JSON.parse(worker.match(/const RELEASE_HASHES = (\{[\s\S]*?\n\});/)?.[1]||'null');
for (const file of ['css/fsm-navigation-system.css','js/ui/navigation-spec.js','js/ui/navigation-icons.js','css/fsm-spot-unity.css']) {
  assert(assets.includes(file),file+': not offline-cached');
  const hash=createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
  assert.equal(hashes[file],hash,file+': release SHA mismatch');
}
for (const name of ['index.html','en/index.html','da/index.html']) {
  const page=read(name);
  assert(page.includes(`css/fsm-navigation-system.css?v=${version}`),name+': wrong CSS version');
  const links=[...page.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(x=>x[1]);
  assert(links.at(-1)?.startsWith('css/fsm-navigation-system.css?'),name+': nav system must load LAST');
}
console.log(`Navigation contract passed: ${names.join(' → ')}, 4 surfaces, 3 languages, 4 hashed assets.`);
