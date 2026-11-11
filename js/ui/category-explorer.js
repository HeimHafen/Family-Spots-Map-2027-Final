import { evaluateSelection, describeCategorySelection } from '../filter-model.js';
import { WORLDS, PLACE_TYPES, FACETS, labelOf, getPlaceTypes, getWorlds, getPlaceTypeWorlds, facetValue, hasCategorySelection } from '../categories.js';
import { categoryIcon } from './category-icons.js';

const COPY={
 de:{rules:'Eintritt kostenlos zeigt nur belegte Angaben. Unbekannte Eintrittskosten und kostenloses Parken zählen nicht als kostenloser Eintritt. Ortsarten: entweder oder. Drinnen und Draußen: entweder oder. Andere Ausstattungen müssen alle vorhanden sein. Bei Ortsarten zeigen die Zahlen die Treffer nach dem Antippen. Bei Ausstattung zeigen sie die Treffer nach dem Hinzufügen oder, falls bereits gewählt, die aktuelle Zahl.',title:'Was möchtet ihr erleben?',all:'Alle Themen',types:'Genauer auswählen',typeHelp:'Wählt eine oder mehrere Ortsarten. Die Zahl zeigt, wie viele Spots nach dem An- oder Abwählen insgesamt übrig bleiben.',helper:'Wählt ein Thema und verfeinert die Auswahl. So findet ihr genau die Spots, die zu euch passen.',theme:'THEMA AUSWÄHLEN',selected:'ausgewählt',allRefined:'Ortsarten oder Ausstattungsmerkmale schränken die Ergebnisse weiterhin ein',facets:'Ausstattung',more:'Weitere Ausstattung',extras:'Praktisch unterwegs',pending:'Angaben folgen',none:'Keine bestätigten Treffer',empty:'Hier sind noch keine zugänglichen Spots eingetragen.',clear:'Auswahl zurücksetzen',remove:'Entfernen',results:'Treffer',selection:'Eure Auswahl',other:'Weitere Ortsarten',loading:'Spots werden geladen …',error:'Spots konnten nicht geladen werden.'},
 en:{rules:'Free admission includes confirmed records only; unknown costs and free parking do not count as free admission. Place types: either option. Indoors and outdoors: either option. All other selected facilities are required. Place-type counts show the total after tapping. Facility counts show the total after adding, or the current total when selected.',title:'What would you like to explore?',all:'All themes',types:'Narrow your choice',typeHelp:'Choose one or more place types. The number shows the total after selecting or deselecting a type.',helper:'Choose a theme and refine your selection to find the spots that suit you.',theme:'CHOOSE A THEME',selected:'selected',allRefined:'Selected place types or facilities still narrow your results',facets:'Facilities',more:'More facilities',extras:'Useful on your trip',pending:'Details pending',none:'No confirmed matches',empty:'No accessible spots have been added here yet.',clear:'Reset selection',remove:'Remove',results:'results',selection:'Your selection',other:'Other place types',loading:'Loading spots …',error:'Could not load spots.'},
 da:{rules:'Gratis adgang kræver bekræftede oplysninger; ukendte priser og gratis parkering tæller ikke. Stedtyper: enten eller. Indendørs og udendørs: enten eller. Alle andre valgte faciliteter kræves. Tal ved stedtyper viser antallet efter et tryk. Tal ved faciliteter viser antallet efter tilvalg eller det aktuelle antal, hvis de allerede er valgt.',title:'Hvad vil I opleve?',all:'Alle temaer',types:'Afgræns dit valg',typeHelp:'Vælg en eller flere stedtyper. Tallet viser, hvor mange steder I får i alt efter til- eller fravalg.',helper:'Vælg et tema, og afgræns valget for at finde de steder, der passer til jer.',theme:'VÆLG ET TEMA',selected:'valgt',allRefined:'Valgte stedtyper eller faciliteter begrænser stadig resultatet',facets:'Faciliteter',more:'Flere faciliteter',extras:'Praktisk på tur',pending:'Oplysninger følger',none:'Ingen bekræftede match',empty:'Der er endnu ingen tilgængelige spots her.',clear:'Nulstil valg',remove:'Fjern',results:'resultater',selection:'Jeres valg',other:'Andre stedtyper',loading:'Indlæser spots …',error:'Spots kunne ikke indlæses.'}
};
const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
export function createCategoryExplorer({mount,getLang,onChange}) {
 if(!mount)return null;
 const state={world:'',types:new Set(),facets:new Set()};
 let allSpots=[],lang='',catalogSignature='',selectionSignature='',typeSignature='',model=null,counts={worlds:new Map(),types:new Map(),facets:new Map(),knownFacets:new Map()},resultCount=0,loadState='loading';
 let countEl,selectionEl,typeBox,worldButtons,facetInputs;
 const copy=()=>COPY[getLang()] || COPY.de;
 function focusKey() {return mount.contains(document.activeElement)?document.activeElement?.dataset?.categoryFocus:null;}
 function restoreFocus(key) {
   if(key==null)return;
   const target=[...mount.querySelectorAll('[data-category-focus]')].find(el=>el.dataset.categoryFocus===key && !el.disabled);
   (target || worldButtons.get(''))?.focus({preventScroll:true});
 }
 // Featured order follows the approved filter layout, all remaining types stay discoverable.
 const FEATURED_TYPES=['nature-center','nature-trail','viewpoint','walk','park','adventure-farm','swingolf','playground','adventure-playground','indoor-playground'];
 const typeList=()=>{
   const legacy=[...new Set([...allSpots.flatMap(getPlaceTypes),...state.types].filter(id=>id.startsWith('legacy:')))];
   return [...PLACE_TYPES,...legacy.map(id=>({id,world:'other',label:{de:id.slice(7).replaceAll('-',' '),en:id.slice(7).replaceAll('-',' '),da:id.slice(7).replaceAll('-',' ')}}))]
     .sort((a,b)=>{
       const aIndex=FEATURED_TYPES.indexOf(a.id),bIndex=FEATURED_TYPES.indexOf(b.id);
       if(aIndex>=0||bIndex>=0)return (aIndex<0?999:aIndex)-(bIndex<0?999:bIndex);
       return 0;
     });
 };
 function changed(){model=evaluateSelection(allSpots,state);renderTypes();refresh();onChange();}
 function toggle(set,id){set.has(id)?set.delete(id):set.add(id);changed();}
 function button(text,action){const el=make('button',text,'category-explorer__chip');el.type='button';el.addEventListener('click',action);return el;}
 // Separate the name from its count without changing filter semantics or accessible labels.
 function paintOption(target,name,n,note=''){
   let label=target.querySelector(':scope > .category-explorer__name');
   let count=target.querySelector(':scope > .category-explorer__count');
   if(!label||!count){
     label=make('span','','category-explorer__name');
     count=make('span','','category-explorer__count');count.setAttribute('aria-hidden','true');
     const icon=categoryIcon(target.dataset.categoryIcon || 'other');
     target.replaceChildren(icon,label,count);
   }
   label.textContent=name;count.textContent=String(n);
   const accessible=name+' ('+n+')'+(note?' · '+note:'');
   if(target.tagName==='BUTTON')target.setAttribute('aria-label',accessible);
   else target.previousElementSibling?.setAttribute('aria-label',accessible);
 }
 function paintCount(){countEl.textContent=loadState==='loading'?copy().loading:loadState==='error'?copy().error:`${resultCount} ${copy().results}`;}
 function refresh(){
   if(!countEl)return;
   paintCount();
   const selectedCount=typeBox?.querySelector('.category-explorer__selected-count');
   if(selectedCount)selectedCount.textContent=state.types.size+' '+copy().selected;
   for(const [id,btn] of worldButtons){const count=id?counts.worlds.get(id)||0:allSpots.length;btn.setAttribute('aria-pressed',String(state.world===id));btn.dataset.refined=String(!id && (state.types.size>0 || state.facets.size>0));paintOption(btn,id?labelOf(WORLDS.find(x=>x.id===id)||{label:{de:copy().other}},getLang()):copy().all,model?.worlds.get(id)||0);if(!id && btn.dataset.refined==='true'){btn.setAttribute('aria-label',(btn.getAttribute('aria-label')||copy().all)+' · '+copy().allRefined);btn.title=copy().all+' · '+copy().allRefined;}else if(!id){btn.title=copy().all;}btn.disabled=!!id && !(model?.worlds.get(id)||0) && state.world!==id;btn.hidden=!!id && (WORLDS.find(x=>x.id===id)?.auxiliary || id==='other') && !count && state.world!==id;}
   for(const [id,input] of facetInputs){const n=model?.facets.get(id)||0;input.checked=state.facets.has(id);input.disabled=!n && !input.checked;input.closest('label').hidden=!(counts.facets.get(id)||0) && !input.checked;paintOption(input.nextElementSibling,labelOf(FACETS.find(x=>x.id===id),getLang()),n,n?'':counts.knownFacets.get(id)?copy().none:copy().pending);}
   for(const input of typeBox?.querySelectorAll('input')||[]){const item=typeList().find(x=>x.id===input.value);const n=model?.types.get(input.value)||0;input.checked=state.types.has(input.value);input.disabled=!n&&!input.checked;paintOption(input.nextElementSibling,labelOf(item,getLang()),n);}
   const facetSection=mount.querySelector('[data-facet-section]');
   if(facetSection)facetSection.hidden=![...facetInputs.values()].some(input=>!input.closest('label').hidden);
   const moreSection=mount.querySelector('.category-explorer__more');
   if(moreSection)moreSection.hidden=![...moreSection.querySelectorAll('label')].some(label=>!label.hidden);
   const extrasSection=mount.querySelector('.category-explorer__extras');
   if(extrasSection)extrasSection.hidden=![...extrasSection.querySelectorAll('button')].some(button=>!button.hidden);
   const nextSelection=JSON.stringify([getLang(),state.world,[...state.types],[...state.facets]]);
   if(nextSelection===selectionSignature)return;
   selectionSignature=nextSelection;
   const focusedIndex=selectionEl.contains(document.activeElement)?[...selectionEl.children].indexOf(document.activeElement):-1;
   selectionEl.replaceChildren();selectionEl.hidden=!hasCategorySelection(state);
   if(state.world && !state.types.size){const world=WORLDS.find(x=>x.id===state.world);const b=button(labelOf(world||{label:{de:copy().other}},getLang())+' ×',()=>{state.world='';state.types.clear();render();restoreFocus('world:');onChange();});b.setAttribute('aria-label',copy().remove+': '+labelOf(world,getLang()));selectionEl.append(b);}
   for(const [kind,set,list] of [['type',state.types,typeList()],['facet',state.facets,FACETS]])for(const id of set){const item=list.find(x=>x.id===id);const name=labelOf(item,getLang());const b=button(name+' ×',()=>toggle(set,id));b.setAttribute('aria-label',copy().remove+': '+name);b.dataset.selectionKind=kind;b.dataset.categoryFocus=`remove:${kind}:${id}`;selectionEl.append(b);}
   if(focusedIndex>=0)(selectionEl.children[Math.min(focusedIndex,selectionEl.children.length-1)] || worldButtons.get(''))?.focus({preventScroll:true});
 }
 function renderTypes(){
   if(!typeBox)return;
   const focused=focusKey();
   const hadTypeFocus=typeBox.contains(document.activeElement);
   typeBox.replaceChildren();
   // Always show actual available place types, including under "All themes".
   // Selecting a theme narrows the list; selecting types never hides the controls.
   typeBox.hidden=false;
   const typeLegend=make('legend',copy().types);const selectedCount=make('span','','category-explorer__selected-count');selectedCount.setAttribute('aria-live','polite');selectedCount.textContent=state.types.size+' '+copy().selected;typeLegend.append(selectedCount);typeBox.append(typeLegend);typeBox.append(make('p',copy().typeHelp,'category-explorer__type-help'));
   const list=typeList().filter(x=>(!state.world || getPlaceTypeWorlds(x.id).includes(state.world) || state.types.has(x.id)) && ((counts.types.get(x.id)||0)>0 || state.types.has(x.id)));
   if(!list.length){typeBox.append(make('p',copy().empty,'filter-group-helper'));return;}
   const row=make('div','','category-explorer__types');typeBox.append(row);
   for(const item of list){const wrap=make('label','','category-explorer__choice');const input=make('input');input.type='checkbox';input.name='place-types';input.value=item.id;input.dataset.categoryFocus='type:'+item.id;input.checked=state.types.has(item.id);input.disabled=!(model?.types.get(item.id)||0) && !input.checked;input.addEventListener('change',()=>{if(input.checked)state.types.add(item.id);else state.types.delete(item.id);model=evaluateSelection(allSpots,state);refresh();onChange();});const display=make('span','','category-explorer__choice-display');
     display.dataset.categoryIcon=item.id;
     wrap.dataset.world=item.world || 'other';
     wrap.append(input,display);
     paintOption(display,labelOf(item,getLang()),model?.types.get(item.id)||0);
     row.append(wrap);}
   if(hadTypeFocus)restoreFocus(focused);
 }
 function render(){
   const focused=focusKey();
   const rulesWasOpen=mount.querySelector('.category-explorer__rules')?.open;
   const extrasWasOpen=mount.querySelector('.category-explorer__extras')?.open;
   const moreWasOpen=mount.querySelector('.category-explorer__more')?.open;
   selectionSignature='';
   lang=getLang();mount.replaceChildren();mount.className='category-explorer';worldButtons=new Map();facetInputs=new Map();
   const title=make('h3',copy().title);title.id='category-explorer-title';mount.setAttribute('aria-labelledby',title.id);mount.append(title);
   const helper=make('p',copy().helper,'filter-group-helper');helper.id='category-explorer-help';mount.append(helper);
   const rules=make('details','','category-explorer__rules');rules.open=!!rulesWasOpen;rules.append(make('summary',getLang()==='en'?'How filters work':getLang()==='da'?'Sådan virker filtrene':'So funktionieren die Filter'),make('p',copy().rules,'filter-group-helper'));mount.append(rules);
   const themeHeading=make('h4',copy().theme,'category-explorer__theme-heading');themeHeading.id='category-explorer-theme-heading';mount.append(themeHeading);
   const worlds=make('div','','category-explorer__worlds');worlds.setAttribute('role','group');worlds.setAttribute('aria-labelledby',themeHeading.id);mount.append(worlds);
   function addWorld(item,target){const id=item?.id||'';const b=button('',()=>{state.world=id;state.types.clear();model=evaluateSelection(allSpots,state);render();onChange();});b.dataset.categoryIcon=id || 'all';b.dataset.world=id;b.dataset.categoryFocus='world:'+id;b.setAttribute('aria-describedby',helper.id);worldButtons.set(id,b);target.append(b);}
   addWorld(null,worlds);WORLDS.filter(x=>!x.auxiliary).forEach(x=>addWorld(x,worlds));
   const extras=make('details');extras.className='category-explorer__extras';extras.open=!!extrasWasOpen || ['services','events','other'].includes(state.world);extras.append(make('summary',copy().extras));const extraRow=make('div','','category-explorer__worlds');extraRow.setAttribute('role','group');extraRow.setAttribute('aria-label',copy().extras);extras.append(extraRow);WORLDS.filter(x=>x.auxiliary).forEach(x=>addWorld(x,extraRow));if(typeList().some(x=>x.world==='other'))addWorld({id:'other'},extraRow);mount.append(extras);
   typeBox=make('fieldset','','category-explorer__fieldset');mount.append(typeBox);renderTypes();
   const facets=make('fieldset','','category-explorer__fieldset');facets.dataset.facetSection='';facets.append(make('legend',copy().facets));const quick=make('div','','category-explorer__types');facets.append(quick);
   const more=make('details');more.className='category-explorer__more';more.open=!!moreWasOpen;more.append(make('summary',copy().more));const moreRow=make('div','','category-explorer__types');more.append(moreRow);
   FACETS.forEach((item,i)=>{const wrap=make('label','','category-explorer__choice');const input=make('input');input.type='checkbox';input.name='category-facilities';input.value=item.id;input.dataset.categoryFocus='facet:'+item.id;input.addEventListener('change',()=>{input.checked?state.facets.add(item.id):state.facets.delete(item.id);model=evaluateSelection(allSpots,state);refresh();onChange();});const display=make('span','','category-explorer__choice-display');display.dataset.categoryIcon=item.id;wrap.append(input,display);(i<4?quick:moreRow).append(wrap);facetInputs.set(item.id,input);});facets.append(more);mount.append(facets);
   selectionEl=make('div','','category-explorer__selection');selectionEl.setAttribute('role','group');selectionEl.setAttribute('aria-label',copy().selection);mount.append(selectionEl);
   // One result action and one reset live in the fixed dialog footer.
   countEl=make('span');countEl.hidden=true;mount.append(countEl);refresh();
   restoreFocus(focused);
 }
 const api={state,
   sync(spots,total,status='ready',evaluation=null){
     model=evaluation||evaluateSelection(spots,state);
     const next=JSON.stringify(spots.map(spot=>[spot.id,getPlaceTypes(spot),FACETS.map(f=>facetValue(spot,f.id))]));allSpots=spots;resultCount=total;loadState=status;
     counts={worlds:new Map(),types:new Map(),facets:new Map(),knownFacets:new Map()};
     const inc=(map,key)=>map.set(key,(map.get(key)||0)+1);
     for(const spot of spots){getWorlds(spot).forEach(id=>inc(counts.worlds,id));getPlaceTypes(spot).forEach(id=>inc(counts.types,id));FACETS.forEach(x=>{const value=facetValue(spot,x.id);if(value==='yes')inc(counts.facets,x.id);if(value!=='unknown')inc(counts.knownFacets,x.id);});}
     const rebuild=lang!==getLang() || catalogSignature!==next;catalogSignature=next;
     const nextTypes=JSON.stringify([state.world,state.world?'':[...state.types]]);
     if(rebuild)render();else {if(typeSignature!==nextTypes)renderTypes();refresh();}
     typeSignature=nextTypes;
   },
   reset(){state.world='';state.types.clear();state.facets.clear();render();},
   summary(){return describeCategorySelection(state,getLang());}
 };
 render();return api;
}
