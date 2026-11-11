// V5 Premium-Audit – offline / deterministic; no third-party network access.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const css=read('css/fsm-v5-cohesion-final.css');
const app=read('js/app.js');
const calendar=read('js/features/gemeinsam-erleben-rc.js');
const worker=read('service-worker.js');
const version=worker.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
assert(version, 'Missing service worker release');
for (const page of ['index.html','en/index.html','da/index.html']) {
  const source=read(page);
  assert(source.includes(`css/fsm-v5-cohesion-final.css?v=${version}`),`Polish stylesheet missing on ${page}`);
}
assert(worker.includes('"css/fsm-v5-cohesion-final.css"'),'Offline manifest missing new CSS');
assert(worker.includes('"css/fsm-v5-cohesion-final.css":'),'Missing cohesion integrity hash');
assert(css.includes('--fsm-c5-shadow-primary') && css.includes('--fsm-c5-shadow-secondary'),'Shadow hierarchy removed');
assert(css.includes('#filter-modal .category-explorer__worlds'),'Theme wrap handling removed');
assert(css.includes('fsm-compact-view') && app.includes('fsm-list-view-toggle'),'Compact view controls are missing');
assert(app.includes('toggle.setAttribute("aria-pressed", String(compact))'),'Compact view accessibility missing');
for (const label of ['goToToday:"Zu heute"','goToToday:"Go to today"','goToToday:"Gå til i dag"'])
  assert(calendar.includes(label),`Calendar shortcut label missing: ${label}`);
assert(calendar.includes('state.day===today&&state.tab==="day"'),'Today must not label a different selected date');
const {execFileSync}=await import('node:child_process');
execFileSync(process.execPath,['--check',path.join(root,'js/app.js')]);
execFileSync(process.execPath,['--check',path.join(root,'js/features/gemeinsam-erleben-rc.js')]);
console.log('Premium cohesion contract passed: 3 languages, release, compact spot list, date shortcut, selective shadows.');
