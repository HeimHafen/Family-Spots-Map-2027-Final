import { createNavigationIcon } from "../ui/navigation-icons.js";
/* Family Spots Map V5 — approved Mein Tag presentation layer.
   The existing diary renderer, IndexedDB photo manager and backup logic remain authoritative.
   No demo memories are inserted. The existing FSM heart and navigation are reused. */
const ICON = {
  back: '<path d="m15 18-6-6 6-6"/>',
  edit: '<path d="m16 4 4 4-11 11-5 1 1-5L16 4Zm-2 2 4 4"/>',
  bin: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>'
};
const COPY = {
  de:{intro:"Unsere gemeinsamen Erinnerungen",list:"Unsere Erinnerungen",all:"Alle anzeigen",empty:"Hier beginnt eure Erinnerungssammlung",emptyDetail:"Ein Foto, ein besonderer Ort oder ein kleiner Moment, den ihr bewahren möchtet.",back:"Mein Tag",edit:"Bearbeiten",delete:"Löschen",previous:"Vorheriges Foto",next:"Nächstes Foto",noPhoto:"Erinnerung ohne Foto",map:"Zur Karte",private:"Privat gespeichert",memory:"Erinnerung",camera:"Foto auswählen",details:"Erinnerung ansehen"},
  en:{intro:"Our shared memories",list:"Our memories",all:"View all",empty:"Your memory collection starts here",emptyDetail:"A photograph, a special place or a moment you want to remember.",back:"My day",edit:"Edit",delete:"Delete",previous:"Previous photo",next:"Next photo",noPhoto:"Memory without a photo",map:"Back to map",private:"Saved privately",memory:"Memory",camera:"Choose photos",details:"View memory"},
  da:{intro:"Vores fælles minder",list:"Vores minder",all:"Se alle",empty:"Her begynder jeres samling af minder",emptyDetail:"Et billede, et særligt sted eller et lille øjeblik, I vil gemme.",back:"Min dag",edit:"Rediger",delete:"Slet",previous:"Forrige billede",next:"Næste billede",noPhoto:"Minde uden billede",map:"Tilbage til kortet",private:"Gemt privat",memory:"Minde",camera:"Vælg billeder",details:"Se minde"}
};
const i18n=()=>COPY[document.documentElement.lang?.slice(0,2)]||COPY.de;
function node(tag,className='',text='') { const element=document.createElement(tag); if(className)element.className=className;if(text)element.textContent=text;return element; }
function icon(name) { const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.innerHTML=ICON[name];return svg; }
function button(className,name) {const btn=node('button',className);btn.type='button';if(name)btn.append(icon(name));return btn;}
export function initDiaryPremium() {
  const view=document.getElementById('view-diary'), list=document.getElementById('daylog-list'), title=document.getElementById('diary-title');
  if(!view||!list||!title||view.dataset.fsmPremium==='1')return;
  view.dataset.fsmPremium='1';
  // The page header uses the project's own landscape/Tilla assets and does not touch the map header.
  const hero=node('header','fsm-diary-hero');
  const brand=node('div','fsm-diary-brand');brand.append(node('span','', '🇩🇪 '),node('strong','', 'Family Spots Map'),node('span','', ' 🇩🇰'));
  const heading=node('h2','', 'Gemeinsam erleben');
  const scenery=node('div','fsm-diary-scenery');scenery.setAttribute('aria-hidden','true');
  // The approved landscape crop contains Tilla already; avoid a second turtle or design deviation.
  hero.append(brand,heading,scenery);
  view.prepend(hero);
  const contentTitle=node('div','fsm-diary-section-head');const contentHeading=node('h2');
  const all=button('fsm-diary-see-all','right');all.setAttribute('aria-expanded','false');all.querySelector('svg')?.setAttribute('aria-hidden','true');contentTitle.append(contentHeading,all);
  view.querySelector('#daylog-section')?.before(contentTitle);
  const emptyTitle=node('strong','fsm-diary-empty-title');const emptyDesc=node('span','fsm-diary-empty-desc');
  document.getElementById('diary-empty')?.replaceChildren(emptyTitle,emptyDesc);
  // A second standalone heart is never drawn: the approved existing FSM SVG is the only source.
  const detail=node('section','fsm-diary-detail');detail.hidden=true;detail.setAttribute('aria-label',i18n().details);
  const detailNav=node('div','fsm-diary-detail-nav'),returnButton=button('fsm-diary-return','back');
  const detailActions=node('div','fsm-diary-detail-actions'),edit=button('fsm-diary-detail-edit','edit'),del=button('fsm-diary-detail-delete','bin');
  detailNav.append(returnButton,detailActions);detailActions.append(edit,del);
  const photoFrame=node('div','fsm-diary-photo-frame');
  const photo=node('img','fsm-diary-detail-photo');photo.alt='';photo.decoding='async';
  const prev=button('fsm-diary-photo-prev','left'),next=button('fsm-diary-photo-next','right'),counter=node('span','fsm-diary-photo-count');
  photoFrame.append(photo,prev,next,counter);
  const thumbs=node('div','fsm-diary-photo-thumbs');
  const article=node('article','fsm-diary-detail-card'),detailTitle=node('h2'),detailDate=node('p','fsm-diary-detail-date'),detailText=node('p','fsm-diary-detail-copy'),privacy=node('span','fsm-diary-privacy');
  article.append(detailTitle,detailDate,detailText,privacy);
  const backToMap=button('fsm-diary-to-map','calendar');
  detail.append(detailNav,photoFrame,thumbs,article,backToMap);
  view.append(detail);
  let current=null,images=[],index=0,returnFocus=null;
  const hideDetail=(focus=true)=>{detail.hidden=true;view.classList.remove('fsm-diary-in-detail');current=null;images=[];if(focus&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;};
  const updatePhoto=()=>{
    if(!images.length){photo.removeAttribute('src');photoFrame.classList.add('fsm-diary-no-photo');prev.hidden=next.hidden=counter.hidden=true;return;}
    photoFrame.classList.remove('fsm-diary-no-photo');photo.src=images[index].src;photo.alt=images[index].alt||i18n().memory;
    counter.textContent=`${index+1} / ${images.length}`;prev.hidden=next.hidden=images.length<2;counter.hidden=false;
    [...thumbs.children].forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));
  };
  const selectPhoto=n=>{if(!images.length)return;index=(n+images.length)%images.length;updatePhoto();};
  const openEntry=(entry,trigger)=>{
    if(entry.querySelector('.daylog-entry-editor')||entry.querySelector('.daylog-entry-input'))return;
    current=entry;returnFocus=trigger;
    const source=entry.querySelector('.daylog-entry-text')?.textContent?.trim()||'';
    const first=(source.split(/[\n.!?]/)[0]||'').trim();
    detailTitle.textContent=first.slice(0,90)||i18n().memory;
    detailDate.textContent=entry.querySelector('.daylog-entry-date')?.textContent||'';
    detailText.textContent=source;
    images=[...entry.querySelectorAll('.memory-photo-gallery .memory-photo-tile img')].filter(img=>img.src && !img.src.endsWith('/undefined'));
    thumbs.replaceChildren();index=0;
    images.forEach((img,i)=>{const t=button('fsm-diary-thumb');const copied=node('img');copied.src=img.src;copied.alt=img.alt||'';t.append(copied);t.addEventListener('click',()=>selectPhoto(i));thumbs.append(t);});
    thumbs.hidden=!images.length;photoFrame.hidden=!images.length;
    if(images.length) updatePhoto();
    detail.hidden=false;view.classList.add('fsm-diary-in-detail');window.scrollTo({top:0,behavior:'instant'});returnButton.focus({preventScroll:true});
  };
  const decorate=()=>{
    for(const entry of list.querySelectorAll('.daylog-entry')){
      if(entry.querySelector('.fsm-diary-card-open'))continue;
      if(entry.querySelector('.daylog-entry-editor,.daylog-entry-input'))continue;
      const text=entry.querySelector('.daylog-entry-text')?.textContent?.trim()||'';
      const first=(text.split(/[\n.!?]/)[0]||'').trim();
      const cover=button('fsm-diary-card-open');const copy=node('span','fsm-diary-card-copy');
      const caption=node('strong','',first.slice(0,38)||i18n().memory);
      const date=node('small','',entry.querySelector('.daylog-entry-date')?.textContent||'');
      copy.append(caption,date);cover.append(copy);cover.setAttribute('aria-label',`${i18n().details}: ${caption.textContent}`);
      cover.addEventListener('click',()=>openEntry(entry,cover));entry.append(cover);
      const heart=createNavigationIcon('diary');heart.classList.add('fsm-diary-card-heart');heart.setAttribute('aria-hidden','true');entry.append(heart);
    }
    all.hidden = list.querySelectorAll('.daylog-entry:not(:has(.daylog-entry-editor))').length===0;
    if(current&&!current.isConnected)hideDetail(false);
  };
  let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate();});});
  observer.observe(list,{childList:true,subtree:false});decorate();
  // Avoid accumulating duplicate text nodes when switching languages.
  const textSlot=(element,cls)=>{const span=node('span',cls);element.append(span);return span;};
  const allLabel=textSlot(all,'fsm-diary-all-label');const backLabel=textSlot(returnButton,'fsm-diary-back-label');const mapLabel=textSlot(backToMap,'fsm-diary-map-label');
  const localize=()=>{const t=i18n();heading.textContent=({de:'Gemeinsam erleben',en:'Experience together',da:'Oplev sammen'})[document.documentElement.lang?.slice(0,2)]||'Gemeinsam erleben';contentHeading.textContent=t.list;allLabel.textContent=t.all;emptyTitle.textContent=t.empty;emptyDesc.textContent=t.emptyDetail;backLabel.textContent=t.back;edit.setAttribute('aria-label',t.edit);del.setAttribute('aria-label',t.delete);prev.setAttribute('aria-label',t.previous);next.setAttribute('aria-label',t.next);mapLabel.textContent=t.map;privacy.textContent=t.private;detail.setAttribute('aria-label',t.details);};
  localize();new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  returnButton.addEventListener('click',()=>hideDetail());
  backToMap.addEventListener('click',()=>{hideDetail(false);document.getElementById('diary-return-map')?.click();});
  edit.addEventListener('click',()=>{const target=current?.querySelector('[data-daylog-action="edit"]');hideDetail(false);target?.click();});
  del.addEventListener('click',()=>{const target=current?.querySelector('[data-daylog-action="delete"]');hideDetail(false);target?.click();});
  prev.addEventListener('click',()=>selectPhoto(index-1));next.addEventListener('click',()=>selectPhoto(index+1));
  all.addEventListener('click',()=>{list.classList.toggle('fsm-diary-expanded');all.setAttribute('aria-expanded',String(list.classList.contains('fsm-diary-expanded')));list.scrollIntoView({block:'nearest',behavior:'smooth'});});
  // Reuse the original map-nav click target; do not create or restyle the global navigation.
  document.addEventListener('click',event=>{
    if(document.body.dataset.appView!=='diary')return;
    const nav=event.target.closest?.('#fsm-home-nav [data-fsm-home-action="map"]');
    if(nav){event.preventDefault();event.stopImmediatePropagation();hideDetail(false);document.getElementById('diary-return-map')?.click();}
  },true);
  window.addEventListener('popstate',()=>{if(!detail.hidden)hideDetail(false);});
  const create=document.getElementById('diary-new-memory');create?.addEventListener('click',()=>{if(!detail.hidden)hideDetail(false);});
}
