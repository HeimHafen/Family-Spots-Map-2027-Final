// Cross-check the presentation contract against the actual category evaluator.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSelection, selectShortcut, shortcutIsSelected, shortcutLabel, describeCategorySelection } from '../js/filter-model.js';
import { matchesCategoryProfile, WORLDS, PLACE_TYPES, FACETS } from '../js/categories.js';
import { describeFilters } from '../js/ui/filter-summary.js';
const data=JSON.parse(fs.readFileSync(new URL('../data/spots.json',import.meta.url)));
let checks=0;
const equal=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
for(const lang of ['de','en','da']) {
 for(const id of ['relaxed','action','animals','water']) {
  const state={world:'',types:new Set(),facets:new Set()};
  selectShortcut(state,id);
  equal(describeCategorySelection(state,lang)[0],shortcutLabel(id,lang),'Quick choice and selection must use the same name');
  equal(shortcutIsSelected(state,id),true);
  selectShortcut(state,id);
  equal(describeCategorySelection(state,lang),[],'Clicking the same quick choice clears its topic');
 }
 const settings=describeCategorySelection({facets:['indoor','outdoor']},lang).join(' · ');
 equal(settings.includes({de:' oder ',en:' or ',da:' eller '}[lang]),true,'Settings OR must be visible');
 const requirements=describeCategorySelection({facets:['toilet','shade']},lang).join(' · ');
 equal(requirements.includes({de:' und ',en:' and ',da:' og '}[lang]),true,'Requirements AND must be visible');
 const types=describeCategorySelection({types:['playground','forest-playground']},lang).join(' · ');
 equal(types.includes({de:' oder ',en:' or ',da:' eller '}[lang]),true,'Place-type OR must be visible');
 const missing=describeFilters({radiusKm:5,hasLocation:false},lang).join(' · ');
 equal(missing.includes({de:'noch nicht aktiv',en:'not active yet',da:'endnu ikke aktiv'}[lang]),true,'A requested radius is not an effective radius without location');
 const active=describeFilters({radiusKm:5,hasLocation:true},lang).join(' · ');
 equal(active.includes({de:'Luftlinie',en:'straight-line',da:'fugleflugtslinje'}[lang]),true);
 equal(describeFilters({radiusKm:Infinity},lang),[]);
 const detailed=describeFilters({search:'Hannover',legacyCategory:'Legacy',age:'Age',travel:'Bike',tags:['A','B'],favorites:true,verified:true,big:true},lang);
 equal(detailed.length,8,'All active legacy/other conditions remain visible');
}
equal(evaluateSelection(data,null).spots.length,data.length,'Null is an empty selection');
let seed=63;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const sample=(a,n)=>a.filter(()=>random()<n);
for(let i=0;i<120;i++){
 const state={world:random()<.55?WORLDS[Math.floor(random()*WORLDS.length)].id:'',types:new Set(sample(PLACE_TYPES.map(x=>x.id),.04)),facets:new Set(sample(FACETS.map(x=>x.id),.15))};
 const before=JSON.stringify({world:state.world,types:[...state.types],facets:[...state.facets]});
 const model=evaluateSelection(data,state);
 const ids=spots=>spots.map(x=>x.id).sort();
 equal(ids(model.spots),ids(data.filter(s=>matchesCategoryProfile(s,state))),'Evaluated results match category predicate');
 for(const world of ['',...WORLDS.map(x=>x.id)])equal(model.worlds.get(world),data.filter(s=>matchesCategoryProfile(s,{...state,world,types:new Set()})).length,'World counts predict actual replacement');
 for(const id of ['playground','forest-playground','lake']){
  const types=new Set(state.types);
  if(!types.delete(id))types.add(id);
  equal(model.types.get(id),data.filter(s=>matchesCategoryProfile(s,{...state,types})).length,'OR-type counts predict adding and removing types');
 }
 for(const id of ['free','indoor','outdoor','toilet'])equal(model.facets.get(id),data.filter(s=>matchesCategoryProfile(s,{...state,facets:new Set([...state.facets,id])})).length,'Facet counts predict actual addition');
 equal(JSON.stringify({world:state.world,types:[...state.types],facets:[...state.facets]}),before,'Evaluation must not change selection');
}
console.log(`Filter contract: ${checks} assertions passed; DE/EN/DA labels, OR/AND descriptions, active/inactive radius, 120 deterministic combinations and predictive counts.`);
