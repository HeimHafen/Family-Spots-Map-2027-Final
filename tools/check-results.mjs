import assert from 'node:assert/strict';
import { resultsCopy } from '../js/ui/filter-results.js';
for (const lang of ['de','en','da']) {
  for (const count of [0,1,3,135]) {
    const copy=resultsCopy(count,lang);
    assert.ok(copy.action.includes(String(count)));
    assert.ok(copy.summary.includes(String(count)));
    assert.equal(copy.disabled,false);
  }
  for (const status of ['idle','loading']) assert.equal(resultsCopy(3,lang,status).disabled,true);
  assert.notEqual(resultsCopy(3,lang,'error').summary,resultsCopy(3,lang).summary);
}
assert.equal(resultsCopy(1).summary,'1 passender Spot');
assert.equal(resultsCopy(3).action,'3 Spots ansehen');
assert.equal(resultsCopy(1,'en').action,'View 1 spot');
assert.equal(resultsCopy(1,'da').action,'Vis 1 spot');
for (const n of [NaN,Infinity,-1]) assert.equal(resultsCopy(n).action,'0 Spots ansehen');
assert.equal(resultsCopy(3.9).action,'3 Spots ansehen');
assert.deepEqual(resultsCopy(3,'unknown'),resultsCopy(3,'de'));
console.log('Result actions: multilingual counts, singular/plural, loading and invalid counts passed.');

// Shared selection semantics and predictive option counts.
const { evaluateSelection, selectShortcut, shortcutIsSelected } = await import('../js/filter-model.js');
const { matchesCategoryProfile } = await import('../js/categories.js');
const facility = value => ({value,checked_at:'2026-01-01',evidence:'owner_visit'});
const fixture = [
 {id:'inside',categories:['indoor-spielplatz'],family_facilities:{toilet:facility('yes')}},
 {id:'outside',categories:['waldspielplatz'],family_facilities:{shade:facility('yes')}},
 {id:'camp',categories:['campingplatz-familien'],family_facilities:{outdoor:facility('yes'),toilet:facility('yes')}},
 {id:'unknown',categories:['spielplatz']}
];
assert.equal(matchesCategoryProfile(fixture[0],{facets:['indoor','outdoor']}),true);
assert.equal(matchesCategoryProfile(fixture[1],{facets:['indoor','outdoor']}),true);
assert.equal(matchesCategoryProfile(fixture[3],{facets:['indoor','outdoor']}),false);
assert.equal(matchesCategoryProfile(fixture[0],{facets:['indoor','outdoor','toilet']}),true);
assert.equal(matchesCategoryProfile(fixture[1],{facets:['indoor','outdoor','toilet']}),false);
const state={world:'play',types:new Set(['indoor-playground']),facets:new Set()};
const evaluation=evaluateSelection(fixture,state);
assert.equal(evaluation.types.get('forest-playground'),2,'Adding an OR type predicts the union, without duplicates');
assert.equal(evaluation.types.get('indoor-playground'),3,'Removing the last type restores all places in the theme');
assert.equal(evaluation.facets.get('toilet'),1);
assert.equal(evaluation.facets.get('shade'),0);
const failed=evaluateSelection(fixture,{world:'play',facets:['toilet','shade']});
assert.equal(failed.spots.length,0);
assert.ok(failed.recovery.some(x=>x.id==='shade'&&x.count===1));
assert.equal(state.types.size,1,'Evaluation does not mutate selection');
const shortcut={world:'travel',types:new Set(['camping']),facets:new Set(['toilet'])};
selectShortcut(shortcut,'water');assert.ok(shortcutIsSelected(shortcut,'water'));
assert.equal(shortcut.world,'water');assert.equal(shortcut.types.size,0);assert.ok(shortcut.facets.has('toilet'));
selectShortcut(shortcut,'water');assert.equal(shortcut.types.size,0);assert.equal(shortcut.world,'');
assert.equal(evaluateSelection(fixture,{types:['indoor-playground','forest-playground']}).spots.length,2);
console.log('Shared selection: OR settings/types, AND requirements, predictive counts, recovery, shortcuts and immutability passed.');
