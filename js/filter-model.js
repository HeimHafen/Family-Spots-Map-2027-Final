// Pure selection model. Access, search and radius are applied by the caller first.
import { WORLDS, PLACE_TYPES, FACETS, getPlaceTypes, getWorlds, matchesCategoryProfile } from './categories.js';
export const SHORTCUTS = {
 relaxed: {world:'nature', types:[]}, action:{world:'play', types:[]},
 animals:{world:'animals', types:[]},
 water:{world:'water', types:[]}
};
export function selectShortcut(state, id) {
 const preset=SHORTCUTS[id];if(!preset)return;
 const same=shortcutIsSelected(state,id);
 state.world=same?'':preset.world;state.types=new Set(same?[]:preset.types);
}
export function shortcutIsSelected(state,id) {
 const preset=SHORTCUTS[id];if(!preset)return false;
 const types=new Set(state?.types||[]);
 return (state?.world||'')===preset.world && types.size===preset.types.length && preset.types.every(x=>types.has(x));
}
export function evaluateSelection(spots, state={}, now=Date.now()) {
 state=state || {};
 const source=Array.isArray(spots)?spots:[];
 const current={world:state.world||'',types:new Set(state.types||[]),facets:new Set(state.facets||[])};
 const matching=choice=>source.filter(spot=>matchesCategoryProfile(spot,choice,now));
 const selected=matching(current), worlds=new Map(),types=new Map(),facets=new Map();
 const rawWorlds=new Map(),rawTypes=new Map(), inc=(map,id)=>map.set(id,(map.get(id)||0)+1);
 source.forEach(spot=>{getWorlds(spot).forEach(x=>inc(rawWorlds,x));getPlaceTypes(spot).forEach(x=>inc(rawTypes,x));});
 for(const id of new Set([...WORLDS.map(x=>x.id),...rawWorlds.keys(),current.world].filter(Boolean)))worlds.set(id,matching({...current,world:id,types:new Set()}).length);
 worlds.set('',matching({...current,world:'',types:new Set()}).length);
 for(const id of new Set([...PLACE_TYPES.map(x=>x.id),...rawTypes.keys(),...current.types])){
  const next=new Set(current.types);
  if (!next.delete(id)) next.add(id);
  types.set(id,matching({...current,types:next}).length);
 }
 for(const {id} of FACETS){const next=new Set(current.facets);next.add(id);facets.set(id,matching({...current,facets:next}).length);}
 // Suggest only changes that demonstrably recover results, preserving all other conditions.
 const recovery=[];
 if(!selected.length)for(const id of current.facets){const next=new Set(current.facets);next.delete(id);const count=matching({...current,facets:next}).length;if(count)recovery.push({kind:'facet',id,count});}
 return {spots:selected,worlds,types,facets,rawWorlds,rawTypes,recovery};
}

// Shared names avoid a shortcut saying one thing and its selection summary another.
export function shortcutLabel(id, lang='de') {
 const preset=SHORTCUTS[id];
 if(!preset)return '';
 const item=WORLDS.find(world=>world.id===preset.world);
 return item?.label?.[lang] || item?.label?.de || '';
}
export function describeCategorySelection(state={}, lang='de') {
 state=state || {};
 const language=['de','en','da'].includes(lang)?lang:'de';
 const or={de:' oder ',en:' or ',da:' eller '}[language];
 const and={de:' und ',en:' and ',da:' og '}[language];
 const name=item=>item?.label?.[language] || item?.label?.de || item?.id || '';
 const types=[...new Set(state.types || [])], facets=[...new Set(state.facets || [])];
 const parts=[];
 if(shortcutIsSelected(state,'water'))parts.push(shortcutLabel('water',language));
 else {
   if(state.world)parts.push(name(WORLDS.find(x=>x.id===state.world)||{id:state.world}));
   if(types.length)parts.push(types.map(id=>name(PLACE_TYPES.find(x=>x.id===id)||{id:id.replace(/^legacy:/,'').replaceAll('-',' ')})).join(or));
 }
 const settings=facets.filter(id=>id==='indoor'||id==='outdoor');
 if(settings.length)parts.push(settings.map(id=>name(FACETS.find(x=>x.id===id))).join(or));
 const requirements=facets.filter(id=>id!=='indoor'&&id!=='outdoor');
 if(requirements.length)parts.push(requirements.map(id=>name(FACETS.find(x=>x.id===id)||{id})).join(and));
 return parts;
}
