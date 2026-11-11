const LOCAL_IMAGE = /^assets\/spots\/[a-z0-9/_-]+\.(?:webp|png|jpe?g)$/i;
const L = {
 de:{ intro:'Treffpunkt für Bewegung, spontane Spiele und neue Begegnungen.',mission:'Menschen bewegen & verbinden', heading:'Treffen & Spiele',details:'Details',information:'So funktioniert’s',info:'Hier können künftig geprüfte, begleitete Spieltreffen erscheinen. Termine und Zusagen werden erst angezeigt, wenn ein verantwortlicher Veranstalter sie bestätigt hat. Es gibt keine öffentlichen Kinderprofile oder direkten Nachrichten zwischen Minderjährigen.',close:'Schließen',plan:'Diesen Ort privat planen',},
 en:{intro:'A place for movement, spontaneous games and new connections.',mission:'Move & connect people',heading:'Meetups & games',details:'Details',information:'How it works',info:'Verified, supervised meetups can appear here in the future. Dates and attendance figures are shown only once a responsible organiser has confirmed them. No public profiles for children or direct messaging between minors.',close:'Close',plan:'Plan a private outing here',},
 da:{intro:'Et sted for bevægelse, spontane spil og nye bekendtskaber.',mission:'Få mennesker i bevægelse & sammen',heading:'Møder og spil',details:'Detaljer',information:'Sådan fungerer det',info:'Godkendte, ledsagede arrangementer kan vises her fremover. Datoer og tilmeldinger vises først, når en ansvarlig arrangør har bekræftet dem. Ingen offentlige børneprofiler eller direkte beskeder mellem mindreårige.',close:'Luk',plan:'Planlæg en privat tur her',}
};
function el(name, cls, content) {
 const node = document.createElement(name);
 if (cls) node.className = cls;
 if (content !== undefined) node.textContent = content;
 return node;
}
function icon(type) {
 const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 const shapes={people:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],football:['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20','M9.5 8.5 14.5 8.5 16 13 12 16 8 13Z','M7 3l2.5 5.5','M17 3l-2.5 5.5','M3 11l5 2','M21 11l-5 2'],calendar:['M8 2v4','M16 2v4','M3 10h18','M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2'],close:['M6 6l12 12','M18 6 6 18'],location:['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0','M12 10a2 2 0 1 0 0 .01']};
 for (const d of shapes[type]||[]) {const q=document.createElementNS(svg.namespaceURI,'path');q.setAttribute('d',d);svg.append(q);} return svg;
}
const safePath = value => typeof value==='string' && LOCAL_IMAGE.test(value) && !value.includes('..') ? value : null;
export function initCommunityPlay({getLanguage, closeMenu}={}) {
 const lang=()=>['de','en','da'].includes(getLanguage?.())?getLanguage():'de';
 let lastFocus=null,overlay=null,lockScroll='',escapeListener=null;
 let dockedNav=null,navParent=null,navNext=null;
 const navAction=()=>close();
 const close=()=>{
  if(!overlay)return;
  if (dockedNav && navParent) {
    dockedNav.removeEventListener('click',navAction,true);
    navParent.insertBefore(dockedNav,navNext?.parentNode===navParent?navNext:null);
  }
  dockedNav=null;navParent=null;navNext=null;
  overlay.remove();overlay=null;document.body.classList.remove('fsm-community-open');document.body.style.overflow=lockScroll;
  document.removeEventListener('keydown',escapeListener,true);escapeListener=null;
  const target=lastFocus?.getClientRects?.().length?lastFocus:document.getElementById('menu-toggle');if(target?.isConnected)target.focus({preventScroll:true});
 };
 function makeAction(name, cls, onClick){const b=el('button',cls,name);b.type='button';b.addEventListener('click',onClick);return b;}
 function open(spot){
  if(spot?.community?.enabled!==true)return;
  if(overlay)close();
  const tr=L[lang()];
  lastFocus=document.activeElement;closeMenu?.();
  lockScroll=document.body.style.overflow;document.body.style.overflow='hidden';document.body.classList.add('fsm-community-open');
  overlay=el('div','fsm-community-overlay');overlay.id='fsm-community-overlay';
  const mask=el('div','fsm-community-shade');mask.addEventListener('click',close);overlay.append(mask);
  const sheet=el('section','fsm-community-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','fsm-community-heading');
  sheet.append(el('div','fsm-community-handle'));
  const header=el('header','fsm-community-header');
  const titles=el('div','fsm-community-titles');
  const h=el('h2','fsm-community-title',tr.heading);h.id='fsm-community-heading';
  const area=el('p','fsm-community-location');area.textContent=spot['title_'+lang()]||spot.title||spot.name||'';
  titles.append(h,area);
  const x=makeAction('', 'fsm-community-close',close);x.append(icon('close'));x.setAttribute('aria-label',tr.close);
  header.append(titles,x);sheet.append(header);
  const body=el('div','fsm-community-body');
  const imgPath=safePath(spot.community.image);
  if(imgPath){const hero=el('img','fsm-community-photo');hero.alt=h.textContent;hero.src=imgPath;hero.loading='eager';hero.width=1400;hero.height=760;body.append(hero);}
  const events=el('div','fsm-community-events');
  const real=Array.isArray(spot?.community?.events)?spot.community.events.filter(e=>e?.status==='published'&&e?.approved===true&&e?.organiser_verified===true&&typeof e?.title==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e?.date||'')):[];
  if(real.length){
   const eh=el('h3','fsm-community-events-heading');eh.append(icon('calendar'),document.createTextNode(tr.heading));events.append(eh);
   for(const event of real.slice(0,4)) {
    const row=el('div','fsm-community-event');const ico=el('span','fsm-community-event-icon');ico.append(icon('calendar'));
    const content=el('div','fsm-community-event-copy');content.append(el('strong','',event.title));
    const d=el('span','',event.date+(event.time?' · '+event.time:''));content.append(d);row.append(ico,content);events.append(row);
   }
  }else{
   const status=el('div','fsm-community-empty');
   const copy=el('div','fsm-community-empty-copy');
   copy.append(el('p','fsm-community-demo-note',{
    de:'Derzeit keine bestätigten Termine',en:'No confirmed upcoming meetups',da:'Ingen bekræftede kommende aftaler'
   }[lang()]));
   status.append(icon('calendar'),copy);events.append(status);
  }
  body.append(events);
  const plan=makeAction(tr.plan,'fsm-community-plan',()=>{
    const spotId=String(spot.id || '');
    close();
    document.dispatchEvent(new CustomEvent('fsm:plan-spot',{detail:{spotId}}));
  });
  plan.prepend(icon('calendar'));
  body.append(plan);
  const detailsPanel=el('details','category-explorer__rules');
  detailsPanel.append(el('summary','',tr.information),el('p','',tr.info));
  body.append(detailsPanel);sheet.append(body);
  // Reuse the ORIGINAL five-button navigation inside the dialog. No copy,
  // duplicate handlers or state: it returns to its original place on close.
  const originalNav=document.getElementById('fsm-home-nav');
  if (originalNav && originalNav.parentNode) {
    dockedNav=originalNav;navParent=originalNav.parentNode;navNext=originalNav.nextSibling;
    originalNav.addEventListener('click',navAction,true);
    sheet.append(originalNav);
  }
  overlay.append(sheet);document.body.append(overlay);
  escapeListener=e=>{if(!overlay)return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const focusable=[...sheet.querySelectorAll('button:not([disabled]), summary')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  document.addEventListener('keydown',escapeListener,true);
  x.focus({preventScroll:true});
 }
 document.addEventListener('fsm:community-open',event=>{if(event.detail?.spot?.community?.enabled===true)open(event.detail.spot);});
 return {open,close};
}
