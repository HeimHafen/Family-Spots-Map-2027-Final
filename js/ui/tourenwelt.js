import { NAV_ORDER, navCopy } from "./navigation-spec.js";
import { navigationIconHtml } from "./navigation-icons.js";
// Family Spots Map — Tourenwelt, V4.6.1 test integration.
// Genuine discovery, geographic filtering, local favourites and planning drafts.
// Navigation/route computation are NOT implemented or simulated.
const LOCALES = {
  de: {
    title:'Radtouren & Bikepacking',sub:'Gemeinsam unterwegs. Neues entdecken.',discover:'Entdecken',plan:'Planen',mine:'Meine Touren',close:'Schließen',
    kicker:'Touren entdecken',heading:'Findet euren nächsten Weg.',lead:'Eure Region, eure Wünsche – passende Touren statt langer Listen.',
    search:'Ort, Region oder Tour suchen …',filters:'Filter',filterTitle:'Touren filtern',tourSing:'Tour gefunden',tourPlur:'Touren gefunden',list:'Liste',map:'Karte',
    selectCountry:'Land',region:'Bundesland oder Region',allStates:'Alle Bundesländer',allRegions:'Alle Regionen',tourKind:'Tourenart',family:'Familienradtouren',bike:'Bikepacking',
    length:'Streckenlänge',all:'Alle',upto30:'Bis 25 km',between:'25–50 km',above:'Über 50 km',resultsFor:'Ergebnisse',startpoint:'Startpunkt',along:'Streckenverlauf',
    showTours:'Touren anzeigen',noVerified:'Nur hinterlegte Touren im gewählten Gebiet berücksichtigt.',emptyTitle:'Hier gibt es noch keine passenden Touren.',empty:'Versucht eine andere Region, Tourenart oder Streckenlänge.',reset:'Filter zurücksetzen',
    details:'Tour ansehen',remember:'Merken',unremember:'Gemerkt',routeMap:'Tourenkarte',mapNotYet:'Die geografische Kartenansicht folgt. Öffnet eine Tour für die vorhandene Streckenskizze.',
    planKicker:'Selbst planen · erster Ausbau',planHeading:'Eure Tour. Euer Abenteuer.',planLead:'Sammelt eure Streckenideen – die echte Routenberechnung und Navigation folgen in einer späteren Version.',
    begin:'Startort',destination:'Zielort',beginHint:'Stadt oder Startpunkt',destinationHint:'Ziel auswählen',loop:'Rundtour',pointToPoint:'Start → Ziel',wanted:'Wunschlänge',saveDraft:'Entwurf privat speichern',draftSaved:'Entwurf auf diesem Gerät gespeichert.',noRoute:'Noch keine Routenberechnung oder Navigation. Der Entwurf enthält nur eure Angaben.',
    savedKicker:'Privat auf diesem Gerät',savedHeading:'Eure Wege an einem Ort.',savedLead:'Gemerkte Touren und persönliche Planungsideen bleiben in diesem Browser gespeichert.',favourites:'Gemerkt',drafts:'Entwürfe',noSaved:'Noch keine Touren gemerkt.',noDrafts:'Noch keine Entwürfe gespeichert.',edit:'Bearbeiten',delete:'Löschen',returnToDiscover:'Touren entdecken',
    source:'Bildquelle',privateNote:'Nur auf diesem Gerät gespeichert – kein Konto und keine automatische Synchronisation.',loading:'Touren werden geladen …',error:'Tourendaten konnten nicht geladen werden.',retry:'Erneut versuchen',back:'Zur Karte',noLocation:'Bitte einen Startort eingeben.',confirmDelete:'Diesen Entwurf wirklich löschen?',routePreview:'Vorhandene Streckenskizze in den Tourendetails ansehen',
    navigationLabels:['Karte','Filter','Spots','Mein Tag','Spots Plus'],countryDE:'Deutschland',countryDK:'Dänemark',roundtour:'Rundtour'
  },
  en: {
    title:'Cycle tours & bikepacking',sub:'Explore together. Discover new places.',discover:'Explore',plan:'Plan',mine:'My tours',close:'Close',
    kicker:'Find tours',heading:'Find your next ride.',lead:'Your region and your preferences, without endless scrolling.',search:'Search place, region or route …',filters:'Filters',filterTitle:'Filter tours',tourSing:'tour found',tourPlur:'tours found',list:'List',map:'Map',
    selectCountry:'Country',region:'State or region',allStates:'All states',allRegions:'All regions',tourKind:'Tour type',family:'Family rides',bike:'Bikepacking',length:'Distance',all:'Any',upto30:'Up to 25 km',between:'25–50 km',above:'Over 50 km',resultsFor:'Match by',startpoint:'Starting area',along:'Route regions',showTours:'Show tours',noVerified:'Only recorded tour information is used.',emptyTitle:'No matching tours yet.',empty:'Try another region, tour type or distance.',reset:'Reset filters',details:'View tour',remember:'Save',unremember:'Saved',routeMap:'Tour map',mapNotYet:'A geographic map is planned. Open a tour to see its current route sketch.',
    planKicker:'Plan a ride · early version',planHeading:'Your ride. Your adventure.',planLead:'Save ideas now. Route calculation and navigation will be added later.',begin:'Starting place',destination:'Destination',beginHint:'Town or starting point',destinationHint:'Choose destination',loop:'Round trip',pointToPoint:'Point to point',wanted:'Preferred length',saveDraft:'Save private draft',draftSaved:'Draft saved on this device.',noRoute:'No routing or navigation yet. This draft only saves your input.',savedKicker:'Private on this device',savedHeading:'Your rides in one place.',savedLead:'Saved tours and private drafts stay in this browser.',favourites:'Saved',drafts:'Drafts',noSaved:'No saved tours yet.',noDrafts:'No saved drafts yet.',edit:'Edit',delete:'Delete',returnToDiscover:'Find tours',source:'Image credit',privateNote:'Stored only on this device – no account or automatic sync.',loading:'Loading tours …',error:'Tour data could not be loaded.',retry:'Try again',back:'Back to map',noLocation:'Enter a starting place.',confirmDelete:'Delete this draft?',routePreview:'View the existing route sketch in tour details',navigationLabels:['Map','Filters','Spots','My day','Spots Plus'],countryDE:'Germany',countryDK:'Denmark',roundtour:'Loop'
  },
  da: {
    title:'Cykelture & bikepacking',sub:'Sammen på tur. Oplev nyt.',discover:'Udforsk',plan:'Planlæg',mine:'Mine ture',close:'Luk',
    kicker:'Find cykelture',heading:'Find jeres næste tur.',lead:'Jeres område og ønsker – uden lange lister.',search:'Søg sted, region eller rute …',filters:'Filtre',filterTitle:'Filtrér ture',tourSing:'tur fundet',tourPlur:'ture fundet',list:'Liste',map:'Kort',selectCountry:'Land',region:'Delstat eller region',allStates:'Alle delstater',allRegions:'Alle regioner',tourKind:'Turtype',family:'Familietur',bike:'Bikepacking',length:'Længde',all:'Alle',upto30:'Op til 25 km',between:'25–50 km',above:'Over 50 km',resultsFor:'Find efter',startpoint:'Startområde',along:'Ruteområder',showTours:'Vis ture',noVerified:'Kun registrerede oplysninger bruges.',emptyTitle:'Ingen passende ture endnu.',empty:'Prøv en anden region, turtype eller længde.',reset:'Nulstil filtre',details:'Se tur',remember:'Gem',unremember:'Gemt',routeMap:'Turkort',mapNotYet:'Geografisk kort kommer senere. Åbn en tur for at se den eksisterende ruteskitse.',
    planKicker:'Planlæg · første version',planHeading:'Jeres tur. Jeres eventyr.',planLead:'Gem ideer nu. Ruteberegning og navigation kommer senere.',begin:'Startsted',destination:'Mål',beginHint:'By eller startpunkt',destinationHint:'Vælg mål',loop:'Rundtur',pointToPoint:'Start → mål',wanted:'Ønsket længde',saveDraft:'Gem privat udkast',draftSaved:'Udkast gemt på denne enhed.',noRoute:'Ingen ruteberegning eller navigation endnu. Kun indtastningerne gemmes.',savedKicker:'Privat på denne enhed',savedHeading:'Jeres ture samlet.',savedLead:'Gemte ture og udkast bliver i denne browser.',favourites:'Gemte',drafts:'Udkast',noSaved:'Ingen gemte ture endnu.',noDrafts:'Ingen udkast endnu.',edit:'Redigér',delete:'Slet',returnToDiscover:'Find ture',source:'Billedkilde',privateNote:'Gemmes kun på denne enhed – ingen automatisk synkronisering.',loading:'Indlæser ture …',error:'Kunne ikke hente turdata.',retry:'Prøv igen',back:'Tilbage til kort',noLocation:'Angiv et startsted.',confirmDelete:'Vil du slette dette udkast?',routePreview:'Se ruteskitsen i turdetaljer',navigationLabels:['Kort','Filtre','Spots','Min dag','Spots Plus'],countryDE:'Tyskland',countryDK:'Danmark',roundtour:'Rundtur'
  }
};
const DE_STATES=['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'];
const DK_REGIONS=['Hovedstaden','Midtjylland','Nordjylland','Sjælland','Syddanmark'];
const draw = {
  sliders:'<path d="M3 5h18M3 12h18M3 19h18"/><circle cx="9" cy="5" r="2.5" fill="#fffaf1"/><circle cx="16" cy="12" r="2.5" fill="#fffaf1"/><circle cx="10" cy="19" r="2.5" fill="#fffaf1"/>',mountains:'<path d="m2 19 6.5-10 6.5 10M9.8 14 15 6l7 13"/>',backpack:'<rect x="5" y="7" width="14" height="15" rx="3"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 15h6M5 12H3v7M19 12h2v7"/>',heartFill:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" fill="#7fa825"/>',crown:'<path d="M3 8l5 4 2-6 3 5 2-8 2 8 3-5 2 6 4-4-3 13H6z" fill="currentColor"/>',x:'<path d="M6 6 18 18M18 6 6 18"/>',search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',filter:'<path d="M3 5h18l-7 8v7l-4-2v-5z"/>',bike:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 4-8 5 8H5m9 0 3-10h2M7 9h5"/>',route:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h9a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9"/>',bookmark:'<path d="M6 3h12v19l-6-4-6 4z"/>',check:'<path d="m4 12 5 5L20 6"/>',chev:'<path d="m8 4 8 8-8 8"/>',back:'<path d="m14 4-8 8 8 8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',trash:'<path d="M3 6h18m-14 0 1 15h8l1-15M9 6V4h6v2"/>',list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".7"/><circle cx="4" cy="12" r=".7"/><circle cx="4" cy="18" r=".7"/>',map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16"/>',heart:'<path d="M20 8c0 5-8 11-8 11S4 13 4 8a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3Z"/>',plus:'<path d="M12 5v14M5 12h14"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${draw[name] || draw.pin}</svg>`;
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
const FAV_KEY='fsm-tourenwelt-v1-favourites';
const DRAFT_KEY='fsm-tourenwelt-v1-drafts';
const load = (key,initial)=>{try{const a=JSON.parse(localStorage.getItem(key));return Array.isArray(a)?a:initial}catch{return initial}};
const store = (key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));return true}catch{return false}};

export function initTourenwelt({ getLanguage, closeMenu, openLegacyTour }) {
  const trigger=document.getElementById('btn-cycle-tours');
  if(!trigger)return null;
  const lang=()=>['de','en','da'].includes(getLanguage())?getLanguage():'de';
  const txt=()=>LOCALES[lang()];
  const model={tab:'discover',country:'DE',region:'all',kind:'family',length:'all',match:'start',query:'',view:'list',round:true, distance:25,start:'',end:'',draftId:null};
  let tours=null, fav=load(FAV_KEY,[]), drafts=load(DRAFT_KEY,[]), message='';
  const dlg=document.createElement('dialog');dlg.className='fsm-tourenwelt';dlg.setAttribute('aria-label','Family Spots Map');document.body.append(dlg);
  const filterDlg=document.createElement('dialog');filterDlg.className='fsm-tourenfilter';document.body.append(filterDlg);
  const localized=(o)=>o?.[lang()]||o?.de||'';
  const countryName=code=>code==='DK'?txt().countryDK:txt().countryDE;
  const regions=()=>model.country==='DK'?DK_REGIONS:DE_STATES;
  const selectedRegion=()=>model.region==='all'?countryName(model.country):model.region;
  const currentTours=()=>{
    if(!tours)return [];
    const search=fold(model.query.trim());
    return tours.filter(t=>t.country===model.country && t.kind===model.kind)
      .filter(t=>model.region==='all'||(model.match==='route'?(t.regions||[]).includes(model.region):t.state===model.region))
      .filter(t=>model.length==='all'||(model.length==='short'?t.lengthKm<=25:model.length==='medium'?t.lengthKm>25&&t.lengthKm<=50:t.lengthKm>50))
      .filter(t=>!search||fold([localized(t.title),localized(t.description),t.place,t.state,t.country,...(t.searchTerms||[])].join(' ')).includes(search));
  };
  async function fetchTours(){
    try{
      const response=await fetch('data/tours.json',{cache:'no-store'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const parsed=await response.json();
      if(parsed.schemaVersion!==1||!Array.isArray(parsed.tours)||parsed.tours.some(t=>!t.id||!t.title||!t.country||!Number.isFinite(t.lengthKm)))throw Error('Invalid tour catalogue');
      tours=parsed.tours;
    }catch(error){console.warn('[FSM tourenwelt] catalogue',error);tours=null;}
  }
  const btn=(label,action,cls='',name='')=>`<button type="button" class="${cls}" data-action="${action}">${name?svg(name):''}${label}</button>`;
  const footer=()=>{
    const labels=navCopy(lang());
    return `<nav class="tw-dock" aria-label="${esc(labels.nav)}">${NAV_ORDER.map((name)=>
      `<button type="button" data-nav="${name}" ${name==='map'?'aria-current="page"':''}>${navigationIconHtml(name)}<span>${esc(labels[name])}</span></button>`
    ).join('')}</nav>`;
  };
  const shell=()=>{
    const t=txt();
    return `<div class="tw-shell"><header class="tw-header">
      <img class="tw-leaves" src="assets/design/main-header-leaves-v90.webp" alt="" />
      <div class="tw-name"><img src="assets/flags/flag-de.svg" alt=""/>Family Spots Map<img src="assets/flags/flag-dk.svg" alt=""/></div>
      ${btn('', 'close','tw-close','x')}
      <h1 id="tw-title">${t.title}</h1><p>${t.sub}</p>
      <div class="tw-landscape" aria-hidden="true"></div>
    </header><main class="tw-main"><div class="tw-tabs" role="tablist" aria-label="${t.title}">
      ${[['discover',t.discover,'search'],['plan',t.plan,'route'],['mine',t.mine,'bookmark']].map(([tab,label,ico])=>`<button type="button" role="tab" aria-selected="${model.tab===tab}" data-tab="${tab}">${svg(ico)}${label}</button>`).join('')}
    </div><div class="tw-content" id="tw-content" tabindex="-1"></div></main>${footer()}</div>`;
  };
  function card(tour){
    const t=txt(),saved=fav.includes(tour.id),name=esc(localized(tour.title));
    return `<article class="tw-card" data-tour="${esc(tour.id)}"><button type="button" class="tw-card-main" data-detail="${esc(tour.id)}"><img loading="lazy" src="${esc(tour.photo)}" alt="" width="170" height="170"/><span class="tw-card-copy"><strong>${name}</strong><small>${esc(tour.lengthKm)} km · ${esc(t.roundtour)}</small><small>${svg('pin')}${esc(tour.place)}</small><span class="tw-card-desc">${esc(localized(tour.description))}</span></span>${svg('chev')}</button><div class="tw-card-bottom"><small>${esc(tour.credit)}</small><button type="button" data-favourite="${esc(tour.id)}" aria-pressed="${saved}">${svg('bookmark')}${saved?t.unremember:t.remember}</button></div></article>`;
  }
  function results(){
    const t=txt();
    if(tours===null)return `<div class="tw-empty" role="alert"><h3>${t.error}</h3>${btn(t.retry,'retry','tw-soft')}</div>`;
    const found=currentTours();
    if(model.view==='map')return `<div class="tw-empty"><h3>${t.routeMap}</h3><p>${t.mapNotYet}</p>${found.map(tour=>`<button class="tw-map-tour" data-detail="${esc(tour.id)}">${svg('route')}${esc(localized(tour.title))}${svg('chev')}</button>`).join('')||`<p>${t.empty}</p>`}</div>`;
    if(!found.length)return `<div class="tw-empty">${svg('pin')}<h3>${t.emptyTitle}</h3><p>${t.empty}</p>${btn(t.reset,'reset','tw-soft')}</div>`;
    return found.map(card).join('');
  }
  function discover(){const t=txt(),found=currentTours();return `<div class="tw-kicker">${t.kicker}</div><h2>${t.heading}</h2><p class="tw-lead">${t.lead}</p><label class="tw-search">${svg('search')}<input type="search" value="${esc(model.query)}" name="tour-search" placeholder="${t.search}" aria-label="${t.search}" autocomplete="off"/></label><div class="tw-quick">${btn(esc(selectedRegion()),'filter','tw-quick-btn', 'pin')}<button type="button" class="tw-quick-btn" data-action="select-family" aria-pressed="${model.kind==='family'}">${svg('bike')}${esc(t.family)}</button>${btn(t.filters,'filter','tw-quick-btn','filter')}</div><div class="tw-results-head"><span><strong id="tw-count">${found.length} ${found.length===1?t.tourSing:t.tourPlur}</strong><small id="tw-location">${esc(selectedRegion())}</small></span><div class="tw-listmap"><button type="button" data-view="list" aria-pressed="${model.view==='list'}">${svg('list')}${t.list}</button><button type="button" data-view="map" aria-pressed="${model.view==='map'}">${svg('map')}${t.map}</button></div></div><div id="tw-results">${results()}</div>`}
  function plan(){const t=txt();return `<div class="tw-kicker">${t.planKicker}</div><h2>${t.planHeading}</h2><p class="tw-lead">${t.planLead}</p><form class="tw-plan-form" id="tw-plan-form"><label>${t.begin}<span class="tw-input">${svg('pin')}<input name="start" value="${esc(model.start)}" placeholder="${t.beginHint}" required/></span></label><label>${t.destination}<span class="tw-input">${svg('pin')}<input name="end" value="${esc(model.end)}" placeholder="${t.destinationHint}" ${model.round?'disabled':''}/></span></label><div class="tw-choice" role="group" aria-label="${t.tourKind}"><button type="button" data-round="true" aria-pressed="${model.round}">${t.loop}</button><button type="button" data-round="false" aria-pressed="${!model.round}">${t.pointToPoint}</button></div><label>${t.wanted}<strong class="tw-distance" id="tw-distance-label">${model.distance} km</strong><input name="distance" type="range" min="5" max="150" step="5" value="${model.distance}"/></label><p class="tw-notice">${t.noRoute}</p><button class="tw-orange" type="submit">${svg('bookmark')}${t.saveDraft}</button><p role="status" class="tw-feedback" aria-live="polite">${esc(message)}</p></form>`;}
  function mine(){const t=txt(),saved=(tours||[]).filter(x=>fav.includes(x.id));return `<div class="tw-kicker">${t.savedKicker}</div><h2>${t.savedHeading}</h2><p class="tw-lead">${t.savedLead}</p><div class="tw-stat"><span><strong>${saved.length}</strong>${t.favourites}</span><span><strong>${drafts.length}</strong>${t.drafts}</span></div><h3>${t.favourites}</h3>${saved.length?saved.map(card).join(''):`<div class="tw-empty"><p>${t.noSaved}</p>${btn(t.returnToDiscover,'discover','tw-soft')}</div>`}<h3>${t.drafts}</h3>${drafts.length?drafts.map(d=>`<article class="tw-draft"><div><strong>${esc(d.start)}${d.round?' · '+t.loop:' → '+esc(d.end)}</strong><small>${d.distance} km · ${new Date(d.savedAt).toLocaleDateString(lang()==='de'?'de-DE':lang()==='da'?'da-DK':'en-GB')}</small></div><div>${btn(t.edit,'edit-draft:'+esc(d.id),'tw-soft')}${btn(t.delete,'delete-draft:'+esc(d.id),'tw-soft','trash')}</div></article>`).join(''):`<div class="tw-empty"><p>${t.noDrafts}</p></div>`}<p class="tw-privacy">${t.privateNote}</p>`;}
  function render(keepScroll=false){
    const prior=keepScroll?dlg.querySelector('.tw-main')?.scrollTop:0;
    dlg.innerHTML=shell();
    dlg.querySelector('#tw-content').innerHTML=model.tab==='discover'?discover():model.tab==='plan'?plan():mine();
    if(keepScroll)dlg.querySelector('.tw-main').scrollTop=prior||0;
  }
  function refreshSearch(){const t=txt(),f=currentTours();dlg.querySelector('#tw-count').textContent=`${f.length} ${f.length===1?t.tourSing:t.tourPlur}`;dlg.querySelector('#tw-results').innerHTML=results();}
  function filterHtml(){
    const t=txt(),options=model.country==='DE'?DE_STATES:DK_REGIONS;
    const optionsHtml=`<option value="all">${model.country==='DE'?t.allStates:t.allRegions}</option>${options.map(r=>`<option value="${esc(r)}" ${model.region===r?'selected':''}>${esc(r)}</option>`).join('')}`;
    const buttons=(attr,items,selected)=>items.map(([value,label,icon])=>`<button type="button" data-${attr}="${value}" aria-pressed="${value===selected}">${icon?svg(icon):''}<span>${esc(label)}</span></button>`).join('');
    return `<div class="tw-filter-card">
      <img class="tw-filter-leaves" src="assets/design/main-header-leaves-v90.webp" alt="" aria-hidden="true"/>
      <div class="tw-filter-head"><h2 id="tw-filter-title" tabindex="-1">${t.filterTitle}</h2>${btn('', 'close-filter','tw-close','x')}</div>
      <p class="tw-filter-lead">${t.sub}</p>
      <div class="tw-filter-fields">
        <label class="tw-select">${t.selectCountry}<select id="tw-country"><option value="DE" ${model.country==='DE'?'selected':''}>${t.countryDE}</option><option value="DK" ${model.country==='DK'?'selected':''}>${t.countryDK}</option></select></label>
        <label class="tw-select">${t.region}<select id="tw-region">${optionsHtml}</select></label>
        <div class="tw-group"><span>${t.tourKind}</span><div class="tw-options tw-two">${buttons('kind',[['family',t.family,'bike'],['bike',t.bike,'backpack']],model.kind)}</div></div>
        <div class="tw-group"><span>${t.length}</span><div class="tw-options tw-four">${buttons('length',[['all',t.all,'mountains'],['short',t.upto30,'bike'],['medium',t.between,'bike'],['long',t.above,'mountains']],model.length)}</div></div>
        <div class="tw-group"><span>${t.resultsFor}</span><div class="tw-options tw-two">${buttons('match',[['start',t.startpoint,'pin'],['route',t.along,'route']],model.match)}</div></div>
        <button type="button" data-action="apply-filter" class="tw-orange">${esc(t.showTours)}</button>
        <p class="tw-filter-foot">${t.noVerified}</p>
      </div>
    </div>${footer()}`;
  }
  function openFilters(){filterDlg.innerHTML=filterHtml();filterDlg.showModal();filterDlg.querySelector('#tw-filter-title')?.focus({preventScroll:true});}
  function closeFilters(){if(filterDlg.open)filterDlg.close();}
  function toggleFavourite(id){if(!tours?.some(t=>t.id===id))return;fav=fav.includes(id)?fav.filter(x=>x!==id):[...fav,id];store(FAV_KEY,fav);render(true);}
  function saveDraft(){const f=dlg.querySelector('#tw-plan-form');const start=f?.elements?.start?.value.trim()||'';const end=model.round?'':f?.elements?.end?.value.trim()||'';
    if(!start||(!model.round&&!end)){message=txt().noLocation;render(true);return;}
    model.start=start;model.end=end;
    const id=model.draftId||`draft-${Date.now()}`;
    drafts=[...drafts.filter(d=>d.id!==id),{id,start,end,round:model.round,distance:model.distance,savedAt:new Date().toISOString()}];
    if(!store(DRAFT_KEY,drafts)){message=txt().error;render(true);return;}
    model.draftId=id;message=txt().draftSaved;render(true);
  }
  function close(){closeFilters();if(dlg.open)dlg.close();}
  function switchTab(t){model.tab=t;message='';render();dlg.querySelector('#tw-content')?.focus({preventScroll:true});}
  function open(){closeMenu();model.tab='discover';message='';render();dlg.showModal();dlg.querySelector('#tw-title')?.setAttribute('tabindex','-1');dlg.querySelector('#tw-title')?.focus({preventScroll:true});if(!tours){fetchTours().then(()=>{if(dlg.open)render();});}}
  trigger.addEventListener('click',open);
  dlg.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){switchTab(b.dataset.tab);return;}
    if(b.dataset.nav){const name=b.dataset.nav;close();queueMicrotask(()=>document.querySelector(`#fsm-home-nav [data-fsm-home-action="${name}"]`)?.click());return;}
    if(b.dataset.detail){const tour=tours?.find(t=>t.id===b.dataset.detail);if(tour){close();openLegacyTour(tour.country);}return;}
    if(b.dataset.favourite){toggleFavourite(b.dataset.favourite);return;}
    if(b.dataset.view){model.view=b.dataset.view;render(true);return;}
    if(b.dataset.round){model.round=b.dataset.round==='true';const form=dlg.querySelector('#tw-plan-form');if(form){model.start=form.elements.start.value;model.end=form.elements.end.value;}render(true);return;}
    if(b.dataset.action==='close'){close();return;}
    if(b.dataset.action==='select-family'){model.kind='family';render(true);return;}
    if(b.dataset.action==='filter'){openFilters();return;}
    if(b.dataset.action==='retry'){fetchTours().then(()=>{if(dlg.open)render(true);});return;}
    if(b.dataset.action==='reset'){model.country='DE';model.region='all';model.kind='family';model.length='all';model.match='start';model.query='';model.view='list';render(true);return;}
    if(b.dataset.action==='discover'){switchTab('discover');return;}
    if(b.dataset.action?.startsWith('edit-draft:')){const d=drafts.find(x=>x.id===b.dataset.action.slice(11));if(d){Object.assign(model,{start:d.start,end:d.end,round:d.round,distance:d.distance,draftId:d.id});switchTab('plan');}return;}
    if(b.dataset.action?.startsWith('delete-draft:')){const id=b.dataset.action.slice(13);if(window.confirm(txt().confirmDelete)){drafts=drafts.filter(x=>x.id!==id);store(DRAFT_KEY,drafts);render(true);}return;}
  });
  dlg.addEventListener('input',e=>{
    if(e.target.name==='tour-search'){model.query=e.target.value;refreshSearch();}
    if(e.target.name==='start')model.start=e.target.value;
    if(e.target.name==='end')model.end=e.target.value;
    if(e.target.name==='distance'){model.distance=Number(e.target.value);dlg.querySelector('#tw-distance-label').textContent=model.distance+' km';}
  });
  dlg.addEventListener('submit',e=>{if(e.target.id==='tw-plan-form'){e.preventDefault();saveDraft();}});
  filterDlg.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.nav){const name=b.dataset.nav;close();queueMicrotask(()=>document.querySelector(`#fsm-home-nav [data-fsm-home-action="${name}"]`)?.click());return;}
    if(b.dataset.action==='close-filter'){closeFilters();return;}
    if(b.dataset.action==='apply-filter'){
      model.country=filterDlg.querySelector('#tw-country').value;
      model.region=filterDlg.querySelector('#tw-region').value;
      for(const item of ['kind','length','match']){const chosen=filterDlg.querySelector(`[data-${item}][aria-pressed="true"]`);if(chosen)model[item]=chosen.dataset[item];}
      model.view='list';model.tab='discover';closeFilters();render();return;
    }
    for(const group of ['kind','length','match'])if(b.hasAttribute('data-'+group)){
      filterDlg.querySelectorAll(`[data-${group}]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));return;
    }
  });
  filterDlg.addEventListener('change',e=>{if(e.target.id!=='tw-country')return;const options=e.target.value==='DE'?DE_STATES:DK_REGIONS,t=txt();filterDlg.querySelector('#tw-region').innerHTML=`<option value="all">${e.target.value==='DE'?t.allStates:t.allRegions}</option>${options.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('')}`;});
  filterDlg.addEventListener('click',e=>{if(e.target===filterDlg)closeFilters();});
  return {open,close};
}
