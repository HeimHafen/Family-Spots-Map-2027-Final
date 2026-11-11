// FSM V5: Non-destructive component-design contract.
// This protects the agreed button hierarchy and thin, undecorated close X.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const cohesion=read('css/fsm-v5-cohesion-final.css');
const tour=read('css/fsm-touren-reference.css');
const nav=read('css/fsm-navigation-system.css');
const details=read('css/fsm-details-v43.css');
assert(cohesion.includes('--fsm-c5-touch-target: 44px'),'Shared touch target missing');
assert(cohesion.includes('--fsm-c5-action-radius: 14px'),'Shared radius missing');
for(const selector of ['#filter-modal #filter-modal-apply','#spot-detail > .spot-community-open','#fse-overlay .fse-cta','.fsm-tourenwelt .tw-orange'])
  assert(cohesion.includes(selector),`Primary component missing: ${selector}`);
for(const selector of ['#filter-modal #filter-modal-reset','#spot-detail > .spot-private-plan','#spot-detail .spot-gallery__summary'])
  assert(cohesion.includes(selector),`Secondary component missing: ${selector}`);
assert(cohesion.includes('var(--fsm-c5-shadow-primary)'),'Primary shadow missing');
assert(cohesion.includes('var(--fsm-c5-shadow-secondary)'),'Secondary shadow missing');
assert(tour.includes('.fsm-tourenfilter .tw-close::before{content:none;display:none;}'),'Old tour-filter close bubble must remain removed');
assert(details.includes('#spot-detail .spot-details-actions > .spot-details-close'),'Detail close control missing');
assert(nav.includes('--fsm-nav-height: 44px'),'Navigation height changed');
assert(nav.includes('color: var(--fsm-nav-text) !important'),'Navigation labels changed');
for(const page of ['index.html','en/index.html','da/index.html']) {
 const html=read(page);
 assert(html.includes('css/fsm-v5-cohesion-final.css?v='),`Component stylesheet not loaded: ${page}`);
 assert(html.includes('css/fsm-touren-reference.css?v='),`Tour components not loaded: ${page}`);
}
console.log('FSM component contract PASS: dialog X, primary/secondary actions, cards, navigation untouched.');
