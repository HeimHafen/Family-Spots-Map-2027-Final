/* Family Spots Map V89 – test-only visual enhancement.
 * No replacement of the Leaflet map, filtering engine, diary storage, authentication,
 * private-calendar data or community safeguarding. Links delegate to existing modules.
 */
const COPY={
 de:{diary:'Mein Tag',diaryDescription:'Dein persönlicher Bereich für Planung, Erinnerungen und eure Familienabenteuer.',today:'Heute',planned:'Geplant',experienced:'Erlebt',favorites:'Favoriten',prompt:'Eure heutigen Momente festhalten',promptDescription:'Fotos, Notizen und kleine Erinnerungen sammeln.',meet:'Treffen & Spielen',meetIntro:'Gemeinsam draußen sein, spielen, neue Familien kennenlernen und unvergessliche Momente erleben.',create:'Treffen planen',find:'Treffen finden',near:'Spielpartner in der Nähe',meetingNote:'Konzeptvorschau: Noch keine öffentlich bestätigten Treffen. Private Planungen sind bereits im Kalender möglich.',filterTitle:'Eure Abenteuer finden',filterDescription:'Wählt die Orte und Eigenschaften, die zu eurem gemeinsamen Tag passen.',spotsTitle:'Orte entdecken',spotsDescription:'Echte Spots aus eurer Karte. Fotos und Informationen erscheinen, soweit sie vorliegen.',plusTitle:'Mehr Möglichkeiten für eure Abenteuer',plusDescription:'Vorschau auf mögliche Zusatzfunktionen. Abonnements und Preise stehen noch nicht fest.',perks:[['✨','Besondere Entdeckungen','Sorgfältig ausgewählte Familienziele'],['📅','Gemeinsam planen','Ideen für eure nächsten Familientage'],['💚','Lieblingsorte','Spots und Erinnerungen wiederfinden'],['⬇','Offline unterwegs','Vorhandene Offline-Funktionen nutzen']]},
 en:{diary:'My day',diaryDescription:'Your private space for planning and collecting family memories.',today:'Today',planned:'Planned',experienced:'Memories',favorites:'Favourites',prompt:'Capture today’s moments',promptDescription:'Collect photos, notes and small memories.',meet:'Meet & play',meetIntro:'Spend time outdoors, play together, meet other families and make shared memories.',create:'Plan a meetup',find:'Discover meetups',near:'Play together nearby',meetingNote:'Concept preview: no verified public events yet. Private plans are available in the calendar.',filterTitle:'Find your adventure',filterDescription:'Choose places and facilities that suit your day together.',spotsTitle:'Explore places',spotsDescription:'Real spots from your map. Photos and details appear where available.',plusTitle:'More ways to explore',plusDescription:'Preview of potential extras. Subscriptions and prices are not final.',perks:[['✨','Special discoveries','Carefully selected family places'],['📅','Plan together','Ideas for your next family day'],['💚','Favourite places','Find spots and memories again'],['⬇','Offline on the go','Use available offline features']]},
 da:{diary:'Min dag',diaryDescription:'Jeres private sted til planlægning og familieminder.',today:'I dag',planned:'Planlagt',experienced:'Oplevet',favorites:'Favoritter',prompt:'Gem dagens øjeblikke',promptDescription:'Saml billeder, noter og små minder.',meet:'Mødes & lege',meetIntro:'Vær sammen udenfor, leg, mød andre familier og skab minder.',create:'Planlæg et møde',find:'Find møder',near:'Leg sammen i nærheden',meetingNote:'Konceptvisning: Ingen offentligt godkendte møder endnu. Privat planlægning findes i kalenderen.',filterTitle:'Find jeres eventyr',filterDescription:'Vælg de steder og muligheder, der passer til jeres dag.',spotsTitle:'Udforsk steder',spotsDescription:'Rigtige spots fra jeres kort. Fotos og oplysninger vises, når de findes.',plusTitle:'Flere muligheder',plusDescription:'Forhåndsvisning af kommende muligheder. Abonnementer og priser er ikke fastlagt.',perks:[['✨','Særlige opdagelser','Håndplukkede steder for familier'],['📅','Planlæg sammen','Idéer til jeres familiedage'],['💚','Favoritsteder','Find steder og minder igen'],['⬇','Offline på tur','Brug de eksisterende offlinefunktioner']]}
};
const lang=()=>COPY[document.documentElement.lang?.slice(0,2)]||COPY.de;
const make=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
function openCalendar(){ document.querySelector('#fse-menu-open')?.click(); }
function switchMap(){document.dispatchEvent(new CustomEvent('fsm:fullscreen-action',{detail:{action:'spots'}}));}
function initialize(){
  if(!document.querySelector('#fsm-home-nav')||!document.querySelector('#tilla-section'))return false;
  if(document.documentElement.classList.contains('fsm-v89-ready'))return true;
  // Keep the original menu button and its event handlers, just relocate it to Tilla.
  const menu=document.querySelector('#menu-toggle');const title=document.querySelector('#tilla-section>.sidebar-section-header');
  if(menu&&title)title.append(menu);
  const header=document.querySelector('.app-header');
  const scenery=make('div','fsm-v89-landscape');scenery.setAttribute('aria-hidden','true');
  header?.append(scenery);
  const diary=document.querySelector('#view-diary');
  if(diary){
    const hero=make('section','fsm-v89-diary-hero');
    const tilla=make('img');tilla.src='assets/tilla/tilla-watercolor.png';tilla.alt='';tilla.loading='lazy';
    const copy=make('div'); const heading=make('h2');const paragraph=make('p');
    copy.append(heading,paragraph);hero.append(tilla,copy);
    const tabs=make('nav','fsm-v89-diary-tabs');tabs.setAttribute('aria-label','Mein Tag');
    const actions={
      today:()=>document.querySelector('#diary-new-memory')?.click(),
      planned:openCalendar,
      experienced:()=>document.querySelector('#daylog-list')?.scrollIntoView({behavior:'smooth',block:'start'}),
      favorites:()=>{document.querySelector('#diary-return-map')?.click();document.querySelector('#btn-open-favorites')?.click();}
    };
    for (const [name,symbol] of [['today','▣'],['planned','▢'],['experienced','▧'],['favorites','♡']]){
      const button=make('button');button.type='button';button.dataset.v89DiaryAction=name;
      button.append(make('span','',symbol),document.createTextNode(' '));button.addEventListener('click',actions[name]);tabs.append(button);
    }
    const prompt=make('section','fsm-v89-memory-prompt');
    const art=make('img');art.src='assets/tilla/tilla-heart.png';art.alt='';art.loading='lazy';
    const promptContent=make('div');const promptTitle=make('strong');const promptDescription=make('p');promptContent.append(promptTitle,promptDescription);
    const plus=make('button','', '+');plus.type='button';plus.setAttribute('aria-label','Erinnerung festhalten');plus.addEventListener('click',()=>document.querySelector('#diary-new-memory')?.click());
    prompt.append(art,promptContent,plus);
    const navigation=diary.querySelector('.diary-navigation');navigation?.after(hero,tabs,prompt);
    function translateDiary(){const t=lang();heading.textContent=t.diary;paragraph.textContent=t.diaryDescription;promptTitle.textContent=t.prompt;promptDescription.textContent=t.promptDescription;plus.setAttribute('aria-label',t.prompt);for(const b of tabs.querySelectorAll('button')){b.lastChild.textContent=' '+t[b.dataset.v89DiaryAction];b.setAttribute('aria-current',String(b.dataset.v89DiaryAction==='today'));}}
    translateDiary();new MutationObserver(translateDiary).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  // The original Spots/Filter/Plus panels remain authoritative. Only add a heading
  // and optional explanatory feature list inside the same native dialog.
  const sheet=document.getElementById('fsm-home-sheet');
  if(sheet){
    const content=sheet.querySelector('.fsm-home-sheet__content');
    let lastKey='';
    const render=()=>{
      const key=content?.querySelector('#filter-section')?'filters':content?.querySelector('.sidebar-section--grow')?'spots':content?.querySelector('#plus-section')?'plus':'';
      if(key===lastKey&&key!== '')return;lastKey=key;
      sheet.querySelectorAll('.fsm-v89-sheet-hero,.fsm-v89-benefits').forEach(n=>n.remove());
      if(!key)return;
      const t=lang();const hero=make('section','fsm-v89-sheet-hero');
      const strong=make('strong','',key==='filters'?t.filterTitle:key==='spots'?t.spotsTitle:t.plusTitle);
      hero.append(strong,make('p','',key==='filters'?t.filterDescription:key==='spots'?t.spotsDescription:t.plusDescription));
      content.prepend(hero);
      if(key==='plus'){
        const grid=make('div','fsm-v89-benefits');for(const [emoji,title,note] of t.perks){const row=make('div','fsm-v89-benefit');const ico=make('span','fsm-v89-benefit-icon',emoji);const txt=make('div');txt.append(make('b','',title),make('small','',note));row.append(ico,txt);grid.append(row);}hero.after(grid);
      }
    };
    const ob=new MutationObserver(()=>queueMicrotask(render));ob.observe(content,{childList:true,subtree:false});
  }
  // Community sheet remains the existing safe preview, with a prominent route
  // to the *private* calendar rather than a non-existent public registration.
  const observeCommunity=new MutationObserver(()=>{
    const overlay=document.querySelector('#fsm-community-overlay');const sheet=overlay?.querySelector('.fsm-community-sheet');
    if(!sheet||sheet.querySelector('.fsm-v89-community-intro'))return;
    const t=lang();const intro=make('div','fsm-v89-community-intro');
    const head=make('div','fsm-v89-community-hero');const tilla=make('img');tilla.src='assets/tilla/tilla-watercolor.png';tilla.alt='';
    const copy=make('div');copy.append(make('h2','',t.meet),make('p','',t.meetIntro));head.append(tilla,copy);
    const tabs=make('div','fsm-v89-community-tabs');
    const actions=[[t.create,'▣',()=>{sheet.querySelector('.fsm-community-close')?.click();openCalendar();}],[t.find,'♧',()=>sheet.querySelector('.fsm-community-events')?.scrollIntoView({behavior:'smooth',block:'start'})],[t.near,'⌖',()=>sheet.querySelector('.fsm-community-events')?.scrollIntoView({behavior:'smooth',block:'start'})]];
    for(const [label,ico,fn] of actions){const b=make('button');b.type='button';b.append(make('span','',ico),document.createTextNode(label));b.addEventListener('click',fn);tabs.append(b);}
    intro.append(head,tabs,make('p','fsm-v89-community-warning',t.meetingNote));sheet.prepend(intro);
  });
  observeCommunity.observe(document.body,{childList:true,subtree:true});
  document.documentElement.classList.add('fsm-v89-ready');
  return true;
}
function boot(){let tries=0;const tick=()=>{if(initialize())return;if(++tries<160)requestAnimationFrame(tick);};tick();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
