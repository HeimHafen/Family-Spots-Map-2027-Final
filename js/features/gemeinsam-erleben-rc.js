// Family Spots Map V34 · Private calendar, integrated with map and diary.
// Public registration remains disabled; drafts stay only on this device.
// Keep the existing storage key for compatibility with older private drafts.
import { createModalController } from "../ui/modal.js";
import { NAV_ORDER, navCopy } from "../ui/navigation-spec.js";
import { navigationIconHtml } from "../ui/navigation-icons.js";

const STORAGE_KEY = "fsm-together-rc-private-v1";
const LOCK_ICON = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5 7V5a3 3 0 0 1 6 0v2m-3 3v1"/></svg>';
const CATEGORY = ["all", "camping", "sport", "nature", "family"];
const SYMBOL = { camping:"⛺", sport:"⚽", nature:"🌿", family:"💚" };
const T = {
 de: {
  name:"Gemeinsam erleben",
  menu:"Gemeinsam erleben · Kalender", eyebrow:"Family Spots Map",
  close:"Schließen", new:"Ausflug planen", calendar:"Kalender", upcoming:"Kommende Termine", today:"Heute", goToToday:"Zu heute", monthToggle:"Monatsübersicht ein- oder ausblenden", previousWeek:"Vorherige Woche", nextWeek:"Nächste Woche",
  dayNames:["Mo","Di","Mi","Do","Fr","Sa","So"], monthFormat:"de-DE", filters:"Aktivitäten", all:"Alle Aktivitäten", camping:"Camping", sport:"Spiel & Sport", nature:"Natur & Bewegung", family:"Familienzeit",
  noEvents:"Keine Ausflüge für diese Auswahl", noEventsNote:"Deine privaten Pläne erscheinen hier.",
  private:"Nur auf diesem Gerät", storageError:"Speichern nicht möglich. Bitte prüfe den verfügbaren Gerätespeicher.", repeat:"Jährlich",
  spotTitle:"Gemeinsam erleben", spotNote:"Ausflüge planen, gemeinsam losziehen und draußen Neues entdecken.", atSpot:"Für diesen Spot planen", spotFallback:"Spot auswählen", allSpots:"Alle Spots", eventDay:"Termine am", eventCount: count => `${count} ${count === 1 ? "Ausflug" : "Ausflüge"}`, draftForm:"Ausflug planen",
  eventTitle:"Titel des Ausflugs", titlePlaceholder:"z. B. Picknick am See", eventType:"Aktivität", date:"Datum", time:"Beginn", spot:"Treffpunkt", note:"Notiz (optional)", notePlaceholder:"Was möchtet ihr festhalten?", yearly:"Jährlich wiederholen", save:"Privat speichern", cancel:"Zurück", edit:"Bearbeiten", remove:"Löschen", export:"Kalenderdatei exportieren", saved:"Ausflug gespeichert.", invalid:"Bitte alle Pflichtfelder ausfüllen.", unavailable:"Spots konnten nicht geladen werden. Bitte erneut versuchen.", privacy:"Bleibt auf diesem Gerät. Zum Sichern als Kalenderdatei exportieren.", preview:"Privater Ausflugskalender", noSpots:"Keine Spots verfügbar", location:"Ort", selectedDay:"Ausgewählter Tag", more:"Weiter", addTo:"Als Kalendereintrag speichern", confirmDelete:"Diesen Ausflug löschen?"
 },
 en: {
  name:"Experience together", menu:"Experience together · Calendar", eyebrow:"Family Spots Map", close:"Close", new:"Plan an outing", calendar:"Calendar", upcoming:"Upcoming outings", today:"Today", goToToday:"Go to today", monthToggle:"Toggle month view", previousWeek:"Previous week", nextWeek:"Next week", dayNames:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], monthFormat:"en-GB", filters:"Activities", all:"All activities", camping:"Camping", sport:"Play & sport", nature:"Nature & movement", family:"Family time", noEvents:"No outings match this selection", noEventsNote:"Your private plans will appear here.", private:"On this device only", storageError:"Unable to save. Check available device storage.", repeat:"Yearly", spotTitle:"Experience together", spotNote:"Plan outings and make the most of your time together outdoors.", atSpot:"Plan at this spot", spotFallback:"Choose a spot", allSpots:"All spots", eventDay:"Events on", eventCount: count => `${count} ${count === 1 ? "outing" : "outings"}`, draftForm:"Plan an outing", eventTitle:"Outing title", titlePlaceholder:"e.g. Picnic by the lake", eventType:"Activity", date:"Date", time:"Start time", spot:"Meeting point", note:"Note (optional)", notePlaceholder:"What would you like to remember?", yearly:"Repeat yearly", save:"Save privately", cancel:"Back", edit:"Edit", remove:"Delete", export:"Export calendar file", saved:"Outing saved.", invalid:"Complete the required fields.", unavailable:"Unable to load spots. Please retry.", privacy:"Stays on this device. Export a calendar file to keep a copy.", preview:"Private outing calendar", noSpots:"No spots available", location:"Location", selectedDay:"Selected day", more:"Next", addTo:"Save to calendar", confirmDelete:"Delete this outing?"
 },
 da: {
  name:"Oplev sammen", menu:"Oplev sammen · Kalender", eyebrow:"Family Spots Map", close:"Luk", new:"Planlæg en tur", calendar:"Kalender", upcoming:"Kommende ture", today:"I dag", goToToday:"Gå til i dag", monthToggle:"Vis eller skjul måned", previousWeek:"Forrige uge", nextWeek:"Næste uge", dayNames:["Man","Tir","Ons","Tor","Fre","Lør","Søn"], monthFormat:"da-DK", filters:"Aktiviteter", all:"Alle aktiviteter", camping:"Camping", sport:"Leg og sport", nature:"Natur og bevægelse", family:"Familietid", noEvents:"Ingen ture passer til det valgte filter", noEventsNote:"Jeres private planer vises her.", private:"Kun på denne enhed", storageError:"Kunne ikke gemme. Kontroller ledig lagerplads på enheden.", repeat:"Årligt", spotTitle:"Oplev sammen", spotNote:"Planlæg en tur, kom af sted, og oplev noget nyt sammen.", atSpot:"Planlæg ved dette sted", spotFallback:"Vælg et sted", allSpots:"Alle steder", eventDay:"Arrangementer den", eventCount: count => `${count} ${count === 1 ? "tur" : "ture"}`, draftForm:"Planlæg en tur", eventTitle:"Turens titel", titlePlaceholder:"Fx picnic ved søen", eventType:"Aktivitet", date:"Dato", time:"Starttid", spot:"Mødested", note:"Note (valgfri)", notePlaceholder:"Hvad vil I gerne huske?", yearly:"Gentag hvert år", save:"Gem privat", cancel:"Tilbage", edit:"Rediger", remove:"Slet", export:"Eksportér kalenderfil", saved:"Turen er gemt.", invalid:"Udfyld de obligatoriske felter.", unavailable:"Steder kunne ikke indlæses. Prøv igen.", privacy:"Gemmes på denne enhed. Eksportér en kalenderfil for at gemme en kopi.", preview:"Privat turkalender", noSpots:"Ingen steder tilgængelige", location:"Sted", selectedDay:"Valgt dag", more:"Næste", addTo:"Gem i kalender", confirmDelete:"Vil I slette denne tur?"
 }
};

const clean = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseISO = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return null; const d = new Date(+m[1],+m[2]-1,+m[3]); return iso(d) === s ? d : null; };
const monthShift = (date,n) => new Date(date.getFullYear(),date.getMonth()+n,1);
const formatDay = (date,lang) => new Intl.DateTimeFormat(T[lang].monthFormat,{weekday:"long",day:"numeric",month:"long"}).format(date);
const locDate = (date,lang) => new Intl.DateTimeFormat(T[lang].monthFormat,{day:"numeric",month:"short"}).format(date);
const mode = () => { const l = document.documentElement.lang?.slice(0,2); return T[l] ? l : /\/da\//.test(location.pathname) ? "da" : /\/en\//.test(location.pathname) ? "en" : "de"; };

let spots = [], spotsPromise = null;
async function loadSpots() {
 if (spotsPromise) return spotsPromise;
 spotsPromise = fetch(new URL("../../data/spots.json",import.meta.url),{cache:"default"}).then(r=>{if(!r.ok)throw Error("spots unavailable");return r.json()}).then(list=>{if(!Array.isArray(list))throw Error("invalid spots");spots=list.filter(s=>s&&typeof s.id==="string"&&typeof s.lat==="number"&&typeof s.lon==="number");return spots}).catch(e=>{spotsPromise=null;throw e});
 return spotsPromise;
}
function getSpotTitle(s,lang) {return String(s?.[`title_${lang}`] || s?.title_de || s?.title || s?.id || "");}
function readDrafts(){ try { const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(raw) ? raw.filter(v=>v&&typeof v.id==="string"&&typeof v.title==="string"&&v.title.length<150&&parseISO(v.date)&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v.time||"")&&["camping","sport","nature","family"].includes(v.category)).slice(0,300):[];}catch{return [];}}
function storeDrafts(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));return true;}catch{return false;}}
const state = {open:false, month:monthShift(new Date(),0), day:iso(new Date()), tab:"day", cat:"all", expandedMonth:false, form:false, editing:null, spot:null, previousFocus:null, drafts:readDrafts()};
function occurrences(){
 const out=[]; const today=new Date();
 for(const e of state.drafts){
  const base=parseISO(e.date);if(!base)continue;
  out.push({...e,private:true});
  if(!e.yearly)continue;
  for(let y=Math.max(base.getFullYear()+1,today.getFullYear()-1);y<=today.getFullYear()+5;y++) {
   const yr = new Date(y,base.getMonth(),base.getDate());
   if(yr.getMonth()!==base.getMonth()) continue;
   out.push({...e,date:iso(yr),occurrence:true,private:true});
  }
 }
 return out.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
function matching(){let e=occurrences();if(state.cat!=="all")e=e.filter(x=>x.category===state.cat);if(state.spot)e=e.filter(x=>x.spotId===state.spot);return e;}

const ICONS = {
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15l2.5 2.5L16 13"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
 filter:'<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
 down:'<path d="m5 9 7 7 7-7"/>',
 left:'<path d="m15 5-7 7 7 7"/>',
 right:'<path d="m9 5 7 7-7 7"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',
 pencil:'<path d="m4 17-1 4 4-1L19 8l-4-4L4 17ZM13 6l4 4"/>',
 download:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M12 12v6m-3-3 3 3 3-3"/>',
 bell:'<path d="M6 17V10a6 6 0 0 1 12 0v7l2 2H4l2-2ZM10 21h4"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
 leaf:'<path d="M20 4C10 4 5 8 5 15a5 5 0 0 0 5 5c7 0 10-7 10-16ZM5 20l9-10"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 map:'<path d="M3 5 9 3l6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16"/>',
 crown:'<path d="m2 7 5 5 5-8 5 8 5-5-2 12H4L2 7ZM4 22h16"/>',
 close:'<path d="M6 6 18 18M18 6 6 18"/>',
 heart:'<path d="M20.7 5.1a5.4 5.4 0 0 0-7.7 0L12 6.2l-1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.7-8.2a5.4 5.4 0 0 0 0-7.7Z"/>',
};
ICONS.filters=ICONS.filter;
ICONS.spots=ICONS.pin;
ICONS.plus=ICONS.crown;
ICONS.diary=ICONS.heart;
const LEAF_SPRIG = `<svg viewBox="0 0 36 48" aria-hidden="true" focusable="false"><path d="M6 45C14 31 17 20 30 4" fill="none" stroke="#769346" stroke-width="1.5"/><path d="M12 34C0 33 1 21 2 19c10 1 15 9 10 15ZM20 21C9 17 11 8 13 5c10 2 13 10 7 16ZM25 14C24 5 31 3 34 3c2 9-2 13-9 11Z" fill="#91ad4f"/><path d="M16 29C23 24 30 27 33 30c-5 9-14 8-17-1Z" fill="#6f9347"/></svg>`;
const icon = (key, cls="") => `<svg class="fse-svg ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[key]}</svg>`;
const startOfWeek = date => {const d=new Date(date.getFullYear(), date.getMonth(), date.getDate());d.setDate(d.getDate()-(d.getDay()+6)%7);return d;};
const addDays = (date,days) => { const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());d.setDate(d.getDate()+days);return d;};

let overlay, body, footer, modal, dock;
let previousBodyOverflow = null;
export function initPrivateCalendar({ closeMenu, captureMemory } = {}) {
 if(document.getElementById("fse-overlay"))return;
 const menuList=document.querySelector(".app-menu-list");
 if(!menuList)return;
 const button=document.createElement("button");button.type="button";button.id="fse-menu-open";button.className="app-menu-item fse-launch";button.setAttribute("aria-haspopup","dialog");
 button.innerHTML=`<span class="app-menu-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M8 15l2.5 2.5L16 13"/></svg></span><span class="app-menu-item-label"></span>`;
 button.querySelector(".app-menu-item-label").textContent=T[mode()].menu;
 menuList.querySelector("#btn-open-favorites")?.after(button);
 if(!button.isConnected)menuList.prepend(button);
 button.addEventListener("click",()=>{closeMenu?.();open();});
 overlay=document.createElement("div");overlay.id="fse-overlay";overlay.hidden=true;overlay.innerHTML=`<section class="fse-shell" role="dialog" aria-modal="true" aria-labelledby="fse-title"><header class="fse-header"><div class="fse-brand"><img src="assets/flags/flag-de.svg" alt="" class="fse-flag"><span id="fse-eyebrow">Family Spots Map</span><img src="assets/flags/flag-dk.svg" alt="" class="fse-flag"></div><button type="button" class="fse-icon-btn" data-fse="close" aria-label="Close">${icon("close")}</button><h2 id="fse-title"></h2><span class="fse-preview-badge" id="fse-preview-badge"></span><div class="fse-landscape" aria-hidden="true"></div></header><div class="fse-body" id="fse-body"></div><footer class="fse-footer" id="fse-footer"></footer><nav class="fse-dock" aria-label="Navigation">${NAV_ORDER.map(n=>`<button type="button" data-fse="nav" data-nav="${n}" class="fse-dock-item${n==="map"?" fse-dock-item--map":""}">${navigationIconHtml(n, {calendar:true})}<span class="fse-dock-label"></span></button>`).join("")}</nav></section>`;
 document.body.append(overlay);modal=createModalController(overlay);body=overlay.querySelector("#fse-body");footer=overlay.querySelector("#fse-footer");dock=overlay.querySelector(".fse-dock");
 overlay.addEventListener("click",delegate);
 overlay.addEventListener("change",change);
 overlay.addEventListener("submit",submit);
 overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
 document.addEventListener("keydown", e=>{if(!state.open)return;if(e.key==="Escape"){e.preventDefault();close();}});
 
 document.addEventListener("fsm:plan-spot", e=>{open(typeof e.detail?.spotId === "string" ? e.detail.spotId : null);});
 new MutationObserver(() => { button.querySelector(".app-menu-item-label").textContent=T[mode()].menu; }).observe(document.documentElement, {attributes:true, attributeFilter:["lang"]});
 overlay.addEventListener("click", event => {
  const action = event.target.closest("[data-fse-memory]");
  const plan = action && state.drafts.find(entry => entry.id === action.dataset.fseMemory);
  if (plan) { close(); captureMemory?.(plan.title); }
 });
}
async function open(spotId = null) {
 if (!overlay || state.open) return;
 state.open = true;
 state.form = false;
 state.editing = null;
 state.spot = spotId;
 state.drafts = readDrafts();
 state.day = iso(new Date());
 state.month = monthShift(new Date(), 0);
 state.tab = "day";
 state.cat = "all";
 state.expandedMonth = false;
 previousBodyOverflow = document.body.style.overflow;
 document.body.style.overflow = "hidden";
 overlay.hidden = false;
 document.body.classList.add("fse-open");
 render();
 modal.activate({initialFocus: overlay.querySelector("[data-fse=close]")});

 // Show a normal calendar until spot data are ready; never replace a form in use.
 try {
  await loadSpots();
  if (!state.open || state.spot !== spotId || state.form) return;
  if (spotId && spots.some(spot => spot.id === spotId)) {
   state.form = true;
   render();
   body.querySelector("[name=title]")?.focus({preventScroll:true});
  } else {
   render();
  }
 } catch { /* General calendar and existing plans remain available. */ }
}
function close() {
 if (!state.open) return;
 state.open = false;
 state.form = false;
 state.spot = null;
 body.replaceChildren();
 overlay.hidden = true;
 document.body.classList.remove("fse-open");
 document.body.style.overflow = previousBodyOverflow || "";
 modal.deactivate();
}
function render(){
 if(!state.open)return;
 const lang=mode(),t=T[lang];
 overlay.querySelector("#fse-eyebrow").textContent=t.eyebrow;
 overlay.querySelector("#fse-title").textContent=t.name;
 overlay.querySelector("#fse-preview-badge").innerHTML=LOCK_ICON+clean(t.preview);
 dock.setAttribute("aria-label",navCopy(lang).nav);
 dock.querySelectorAll("[data-nav]").forEach(button => {button.querySelector(".fse-dock-label").textContent=navCopy(lang)[button.dataset.nav];});
 overlay.querySelector("[data-fse=close]").setAttribute("aria-label",t.close);
 const active = document.activeElement;
 const action = overlay.contains(active) ? active.dataset.fse : null;
 if(state.form){renderForm(t,lang);}else{renderCalendar(t,lang);}
 if (action && !active.isConnected) {
  const selector = `[data-fse="${CSS.escape(action)}"]`;
  const replacement = [...overlay.querySelectorAll(selector)].find(node =>
   node.dataset.date === active.dataset.date && node.dataset.tab === active.dataset.tab && node.dataset.id === active.dataset.id);
  (replacement || overlay.querySelector("[data-fse=close]"))?.focus({preventScroll:true});
 }
}
function renderCalendar(t,lang){
 const selected = parseISO(state.day) || new Date();
 const today = iso(new Date());
 const firstDay = startOfWeek(selected);
 const month = new Date(state.month.getFullYear(),state.month.getMonth(),1);
 const title = new Intl.DateTimeFormat(t.monthFormat,{month:"long",year:"numeric"}).format(month);
 const events = matching();
 const dateCell = day => {
  const d = iso(day), dayEvents = events.filter(x => x.date===d);
  const cls = ["fse-day", d===today?"fse-day--today":"", d===state.day?"fse-day--chosen":"",dayEvents.length?"fse-day--has":""].filter(Boolean).join(" ");
  return `<button type="button" class="${cls}" data-fse="day" data-date="${d}" aria-pressed="${d===state.day}" ${d===today?'aria-current="date"':''} aria-label="${clean(formatDay(day,lang))}${dayEvents.length?` · ${clean(t.eventCount(dayEvents.length))}`:""}"><span class="fse-day-weekday">${clean(t.dayNames[(day.getDay()+6)%7])}</span><span class="fse-day-number">${day.getDate()}</span></button>`;
 };
 const week = Array.from({length:7},(_,i) => dateCell(addDays(firstDay,i))).join("");
 let monthGrid="";
 if (state.expandedMonth) {
  const offset=(month.getDay()+6)%7;
  const daysInMonth=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const weeks=Math.ceil((offset+daysInMonth)/7);
  const rows=Array.from({length:weeks*7},(_,i)=>{
   const d=addDays(month,i-offset),outside=d.getMonth()!==month.getMonth();
   return outside?'<span class="fse-month-empty" aria-hidden="true"></span>':dateCell(d);
  }).join("");
  monthGrid=`<div class="fse-month-weekdays">${t.dayNames.map(n=>`<span>${clean(n)}</span>`).join("")}</div><div class="fse-month-grid">${rows}</div>`;
 }
 const shown=events.filter(e=>state.tab==="upcoming"?e.date>=today:e.date===state.day).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 body.innerHTML=`<div class="fse-week-card"><div class="fse-week-tools"><button type="button" class="fse-week-arrow" data-fse="prev" aria-label="${clean(t.previousWeek)}">${icon("left")}</button><button type="button" class="fse-month-label" data-fse="monthview" aria-expanded="${state.expandedMonth}" aria-label="${clean(t.monthToggle)}">${clean(title)} ${icon("down")}</button><button type="button" class="fse-week-arrow" data-fse="next" aria-label="${clean(t.nextWeek)}">${icon("right")}</button></div><div class="fse-week-grid">${week}</div>${monthGrid}</div><div class="fse-controls" role="group"><button type="button" class="fse-toggle" data-fse="tab" data-tab="day" aria-pressed="${state.tab==="day"}">${icon("calendar")}<span>${clean(t.calendar)}</span></button><button type="button" class="fse-toggle" data-fse="tab" data-tab="upcoming" aria-pressed="${state.tab==="upcoming"}">${icon("list")}<span>${clean(t.upcoming)}</span></button></div><div class="fse-section-heading"><h3>${state.tab==="upcoming"?clean(t.upcoming):clean(formatDay(selected,lang))}</h3><button type="button" class="fse-link" data-fse="now" aria-label="${clean(state.day===today&&state.tab==="day"?t.today:t.goToToday)}">${icon("calendar")}<span>${clean(state.day===today&&state.tab==="day"?t.today:t.goToToday)}</span></button></div><div class="fse-select-row">${icon("filter")}<label class="sr-only" for="fse-filter">${clean(t.filters)}</label><select id="fse-filter" class="fse-select" data-fse="category">${CATEGORY.map(c=>`<option value="${c}" ${state.cat===c?"selected":""}>${clean(t[c])}</option>`).join("")}</select>${icon("down")}</div><div class="fse-event-list">${shown.length?shown.map(e=>eventCard(e,t,lang)).join(""):`<div class="fse-empty"><strong>${clean(t.noEvents)}</strong>${clean(t.noEventsNote)}</div>`}</div><p class="fse-storage-status" role="status"></p>`;
 footer.innerHTML=`<span class="fse-footer-leaf fse-footer-leaf--left" aria-hidden="true">${LEAF_SPRIG}</span><button type="button" class="fse-cta" data-fse="form">${icon("calendar")}<span>${clean(t.new)}</span></button><span class="fse-footer-leaf fse-footer-leaf--right" aria-hidden="true">${LEAF_SPRIG}</span>`;
}
function eventCard(e,t,lang){
 const memoryLabel={de:"Erinnerung festhalten",en:"Capture a memory",da:"Gem et minde"}[lang];
 const spot=spots.find(s=>s.id===e.spotId),name=spot?getSpotTitle(spot,lang):(e.spotName||"");
 const actionShort={de:{edit:"Bearbeiten",ics:"Exportieren",memory:"Erinnerung",delete:"Löschen"},en:{edit:"Edit",ics:"Export",memory:"Memory",delete:"Delete"},da:{edit:"Rediger",ics:"Eksportér",memory:"Minde",delete:"Slet"}};
 const label=(action,iconName,text,id)=>`<button type="button" class="fse-mini fse-mini--${action}" aria-label="${clean(text)}" ${action==="memory"?`data-fse-memory="${clean(id)}"`:`data-fse="${action}" data-id="${clean(id)}"`}>${icon(iconName)}<span>${clean(actionShort[lang]?.[action]||text)}</span></button>`;
 const meta=`<span class="fse-event-meta"><span>${icon("calendar")}${clean(locDate(parseISO(e.date),lang))}</span><span>${icon("clock")}${clean(e.time)}</span>${name?`<span>${icon("pin")}${clean(name)}</span>`:""}</span>`;
 const detailsLabel={de:"Termindetails",en:"Outing details",da:"Turoplysninger"}[lang];
 return `<article class="fse-event"><details class="fse-event-details"><summary class="fse-event-primary"><span class="fse-event-symbol" aria-hidden="true">${icon("heart")}</span><span class="fse-event-content"><strong>${clean(e.title)}</strong>${meta}</span>${icon("down")}</summary><div class="fse-event-expanded"><strong>${clean(detailsLabel)}</strong>${e.note?`<p class="fse-event-note">${clean(e.note)}</p>`:""}<div class="fse-event-badges"><span class="fse-tag fse-tag--private">${icon("leaf")}${clean(t.private)}</span>${e.yearly?`<span class="fse-tag">${clean(t.repeat)}</span>`:""}</div></div></details>${e.private&&!e.occurrence?`<div class="fse-event-actions">${label("edit","pencil",t.edit,e.id)}${label("ics","download",t.export,e.id)}${label("memory","bell",memoryLabel,e.id)}${label("delete","trash",t.remove,e.id)}</div>`:""}</article>`;
}
function renderForm(t,lang){const draft=state.drafts.find(x=>x.id===state.editing);const selected=draft?.spotId||state.spot||"";const spotOptions=spots.map(s=>({id:s.id,name:getSpotTitle(s,lang)})).sort((a,b)=>a.name.localeCompare(b.name,lang));const d=draft?.date||(state.day||iso(new Date()));const cat=draft?.category||"family";
 body.innerHTML=`<div class="fse-form"><h3>${clean(t.draftForm)}</h3><form id="fse-draft-form"><label class="fse-field">${clean(t.eventTitle)}<input name="title" maxlength="90" placeholder="${clean(t.titlePlaceholder)}" value="${clean(draft?.title||"")}" required autocomplete="off"></label><label class="fse-field">${clean(t.eventType)}<select name="category" required>${CATEGORY.filter(c=>c!=="all").map(c=>`<option value="${c}" ${cat===c?"selected":""}>${clean(t[c])}</option>`).join("")}</select></label><div class="fse-form-row"><label class="fse-field">${clean(t.date)}<span class="fse-native-field"><input name="date" type="date" value="${clean(d)}" required></span></label><label class="fse-field">${clean(t.time)}<span class="fse-native-field"><input name="time" type="time" value="${clean(draft?.time||"15:30")}" required></span></label></div><label class="fse-field">${clean(t.spot)}<select name="spotId"><option value="">${clean(spots.length?t.spotFallback:t.noSpots)}</option>${spotOptions.map(s=>`<option value="${clean(s.id)}" ${selected===s.id?"selected":""}>${clean(s.name)}</option>`).join("")}</select></label><label class="fse-field">${clean(t.note)}<textarea name="note" maxlength="360" placeholder="${clean(t.notePlaceholder)}">${clean(draft?.note||"")}</textarea></label><label class="fse-check"><input name="yearly" type="checkbox" ${draft?.yearly?"checked":""}><span>${clean(t.yearly)}</span></label><div class="fse-form-actions"><button type="button" class="fse-cancel" data-fse="cancel">${clean(t.cancel)}</button><button type="submit" class="fse-save">${clean(t.save)}</button></div><p class="fse-status" role="status" id="fse-status"></p></form></div>`;
 footer.innerHTML=`<span class="fse-footer-note">${LOCK_ICON}<span>${clean(t.privacy)}</span></span>`;
}
async function openForm(id = null) {
 const selectedDay = state.day;
 state.editing = id;
 state.form = true;
 render();
 body.scrollTop = 0;
 body.querySelector("[name=title]")?.focus({preventScroll:true});
 const select = body.querySelector("[name=spotId]");
 if (spots.length || !select) return;
 try {
  const list = await loadSpots();
  if (!select.isConnected || state.day !== selectedDay) return;
  const lang = mode();
  const selected = state.drafts.find(entry => entry.id === id)?.spotId || state.spot || "";
  select.options[0].textContent = T[lang].spotFallback;
  for (const spot of [...list].sort((a,b) => getSpotTitle(a,lang).localeCompare(getSpotTitle(b,lang),lang))) {
   select.add(new Option(getSpotTitle(spot,lang),spot.id,false,spot.id === selected));
  }
 } catch { /* An outing can still be saved without a selected spot. */ }
}
function delegate(e){const btn=e.target.closest("[data-fse]");if(!btn)return;const action=btn.dataset.fse;
 if(action==="close")return close();
 if(action==="nav"){
  const destination=btn.dataset.nav;
  if(!["map","filters","spots","plus","diary"].includes(destination))return;
  close();
  requestAnimationFrame(()=>document.querySelector(`[data-fsm-home-action="${destination}"]`)?.click());
  return;
 }
 if(action==="monthview"){state.expandedMonth=!state.expandedMonth;render();return;}
 if(action==="prev"||action==="next"){const delta=action==="prev"?-1:1;const date=state.expandedMonth?monthShift(state.month,delta):addDays(parseISO(state.day)||new Date(),delta*7);state.day=iso(date);state.month=monthShift(date,0);render();return;}
 if(action==="now"){state.month=monthShift(new Date(),0);state.day=iso(new Date());state.tab="day";state.expandedMonth=false;render();return;}
 if(action==="day"){state.day=btn.dataset.date;state.month=monthShift(parseISO(state.day),0);state.tab="day";state.expandedMonth=false;render();return;}
 if(action==="tab"){state.tab=btn.dataset.tab;render();return;}
 if(action==="form"){openForm();return;}
 if(action==="cancel"){state.form=false;state.editing=null;render();return;}
 if(action==="edit"){openForm(btn.dataset.id);return;}
 if(action==="delete"){if(!confirm(T[mode()].confirmDelete))return;const next=readDrafts().filter(x=>x.id!==btn.dataset.id);if(!storeDrafts(next)){body.querySelector(".fse-storage-status").textContent=T[mode()].storageError;return;}state.drafts=next;render();return;}
 if(action==="ics"){const ev=state.drafts.find(x=>x.id===btn.dataset.id);if(ev)exportICS(ev);return;}
}
function change(e){if(e.target.dataset.fse==="category"){state.cat=CATEGORY.includes(e.target.value)?e.target.value:"all";render();}}
function submit(e){if(e.target.id!=="fse-draft-form")return;e.preventDefault();const data=new FormData(e.target),title=String(data.get("title")||"").trim(),date=String(data.get("date")||""),time=String(data.get("time")||""),category=data.get("category"),spotId=String(data.get("spotId")||"");
 if(!title||title.length>90||!parseISO(date)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)||!CATEGORY.slice(1).includes(category)||spotId&&!spots.some(s=>s.id===spotId)){e.target.querySelector("#fse-status").textContent=T[mode()].invalid;return;}
 const draft={id:state.editing||(`private-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),title,category,date,time,spotId,spotName:spotId ? getSpotTitle(spots.find(spot=>spot.id===spotId),mode()) : "",note:String(data.get("note")||"").trim().slice(0,360),yearly:data.get("yearly")==="on"};
 const next=readDrafts().filter(x=>x.id!==draft.id).concat(draft);
 if(next.length>300){e.target.querySelector("#fse-status").textContent=({de:"Maximal 300 Pläne. Lösche zuerst einen alten Plan.",en:"Up to 300 plans. Delete an old plan first.",da:"Op til 300 planer. Slet først en gammel plan."})[mode()];return;}
 if(!storeDrafts(next)){e.target.querySelector("#fse-status").textContent=T[mode()].storageError;return;}
 state.drafts=next;state.form=false;state.editing=null;if(state.spot!==spotId)state.spot=null;state.month=monthShift(parseISO(date),0);state.day=date;state.tab="day";state.cat="all";render();body.scrollTop=0;
}
// Fold at 75 UTF-8 octets, including the space on continuation lines.
const calendarEncoder = new TextEncoder();
function foldCalendarLine(line) {
 const parts = [];
 let part = "", bytes = 0;
 for (const character of line) {
  const size = calendarEncoder.encode(character).length;
  if (bytes + size > 75) {
   parts.push(part);
   part = " ";
   bytes = 1;
  }
  part += character;
  bytes += size;
 }
 return [...parts, part].join("\r\n");
}
function exportICS(e){
 const date=e.date.replace(/-/g,"");const start=e.time.replace(":","")+"00";const endDate=new Date(`${e.date}T${e.time}:00`);endDate.setHours(endDate.getHours()+1);const end=`${String(endDate.getHours()).padStart(2,"0")}${String(endDate.getMinutes()).padStart(2,"0")}00`;const endDay=iso(endDate).replace(/-/g,"");
 const esc=s=>String(s||"").replace(/\\/g,"\\\\").replace(/\r\n|[\r\n]/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
 const spot=spots.find(s=>s.id===e.spotId);
 const props=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Family Spots Map//Private meetup drafts//DE","BEGIN:VEVENT",`UID:${e.id}@family-spots-map.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"")}`,`DTSTART:${date}T${start}`,`DTEND:${endDay}T${end}`,`SUMMARY:${esc(e.title)}`,`DESCRIPTION:${esc(e.note)}`,`LOCATION:${esc(spot?getSpotTitle(spot,mode()):e.spotName)}`,...(e.yearly?["RRULE:FREQ=YEARLY"]:[]),"END:VEVENT","END:VCALENDAR"];
 const blob=new Blob([props.map(foldCalendarLine).join("\r\n")+"\r\n"],{type:"text/calendar;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`Family-Spots-Map-${e.date}.ics`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

