// Historischer Test für Kalender-RC. Für aktuelle Releases gilt tools/check-project.mjs.
// V89 preserves the independent private-calendar RC and all its assertions.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read = f => fs.readFileSync(path.join(root,f),'utf8');
let failures=0;
function check(cond,msg){if(!cond){console.error('FAIL:',msg);failures++}}
const js=read('js/features/gemeinsam-erleben-rc.js');
const css=read('css/gemeinsam-erleben-rc.css');
check(!js.includes('currentLang'),'Never read app.js private currentLang');
check(!js.includes('initGemeinsamErleben'),'No tightly coupled app startup');
check(js.includes('localStorage') && js.includes('private:true'),'Local private drafts');
check(!js.includes('fetch("https://'),'No external account endpoints');
check(js.includes('fsm:before-spot-details'),'Connect to existing spot detail event');
check(js.includes('event.target')||js.includes('e.target'),'Interaction delegated');
check(css.includes('#fse-overlay'),'Scoped CSS');
const sw=read('service-worker.js');
const version = sw.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
check(!!version && /^20261103-v(?:88|89)-/.test(version),"New cache version");
for(const p of ['index.html','en/index.html','da/index.html']){
 const html=read(p);
 check(html.includes(`css/gemeinsam-erleben-rc.css?v=${version}`),`${p}: RC CSS loaded`);
 check(html.includes(`js/features/gemeinsam-erleben-rc.js?v=${version}`),`${p}: RC JS loaded`);
 check(!html.includes('gemeinsam-erleben-v86'),`${p}: no broken V86 script`);
}
const spots=JSON.parse(read('data/spots.json'));
check(spots.length===164,'Spot count exactly 164');
console.log(`V88 RC checks: ${failures} failures · ${spots.length} spots · 3 languages`);
if(failures)process.exitCode=1;
