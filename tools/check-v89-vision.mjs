// Historischer Test für V89. Für aktuelle Releases gilt tools/check-project.mjs.
// Family Spots Map V89 – test branch design/feature handoff contract.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const sw=read('service-worker.js');
const cache=sw.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
let count=0;
function assert(ok,label){if(!ok){count++;console.error(`FEHLER: ${label}`);} }
assert(cache?.startsWith('20261103-v89-vision-test-'),'V89 Cache-Version');
const linked=['css/fsm-v89-vision.css','js/features/fsm-v89-vision.js'];
for(const loc of ['index.html','en/index.html','da/index.html']) {
 const html=read(loc);
 for(const asset of linked)assert(html.includes(`${asset}?v=${cache}`),`${loc}: ${asset} eingebunden`);
 for(const id of ['view-map','view-diary','tilla-section','map','diary-new-memory'])assert(html.includes(`id="${id}"`),`${loc}: Originalelement ${id}`);
}
for(const p of ['assets/ui/fsm-v89-vision-hills.webp','assets/ui/fsm-v89-approved-heart-mask.png',...linked])assert(exists(p),`${p} vorhanden`);
const nav=read('js/ui/home-navigation.js');
assert(nav.includes('"community", "diary"')&&nav.includes('"map", "filters", "spots", "plus"'),'Sechs Navigationseinträge');
assert(nav.includes('sheet.append(nav)')&&nav.includes('document.body.append(nav)'),'Originalnavigation bewegt sich in den Dialog und zurück');
assert(nav.includes('btn-community-preview')&&nav.includes('fsm:fullscreen-action'),'Bestehende Community- und Tagebuchnavigation');
const js=read('js/features/fsm-v89-vision.js');
assert(js.includes('#diary-new-memory')&&js.includes('#fse-menu-open'),'Originales Tagebuch und privater Kalender angebunden');
assert(js.includes('Konzeptvorschau')&&!js.includes('3 Familien sind dabei'),'Keine erfundenen veröffentlichten Teilnehmer');
assert(js.includes('de:{')&&js.includes('en:{')&&js.includes('da:{'),'Neue Texte in DE/EN/DA');
const css=read('css/fsm-v89-vision.css');
assert(css.includes('fsm-v89-approved-heart-mask.png')&&css.includes('fsm-v89-vision-hills.webp'),'Verbindliches Hand-Herz und Landschaft verwendet');
assert(css.includes('html.fsm-v89-ready'),'Styles nur bei aktiver Vision');
const spots=JSON.parse(read('data/spots.json'));
assert(spots.length===164,'164 echte Spots bleiben bestehen');
console.log(`V89 – ${count ? 'NICHT BESTANDEN' : 'BESTANDEN'}: ${spots.length} Spots, 3 Sprachen, 6 Navigationseinträge, vorhandene Tagebuch-/Kalenderfunktionen. ${count} Fehler.`);
if(count)process.exitCode=1;
