// Content-contract checks shared by local review and publication.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const spots=JSON.parse(read('data/spots.json'));
const config=read('js/config.js');
const literal=name=>vm.runInNewContext('('+config.match(new RegExp(`export const ${name} = (\\{[\\s\\S]*?\\n\\});`))[1]+')');
const tables=['DE','EN','DA'].map(lang=>literal('CATEGORY_LABELS_'+lang));
const tags=literal('CATEGORY_TAGS');
let errors=0;let translatedSections=0;
const fail=message=>{console.error('Content: '+message);errors++;};
const ids=new Set(spots.map(s=>s.id));
const sectionKeys=['suitability','duration','arrival','admission','hours','comfort','food','accessibility','tips'];
if(ids.size!==spots.length)fail('Spot IDs must be unique to preserve favourites and links');
const validDate=date=>typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date));
for(const s of spots){
 const visibleCopy=JSON.stringify([s.summary_de,s.summary_en,s.summary_da,s.visit_overview,s.visit_details]);
 if(/Projektgründer|project founder|projektets grundlægger|persönlich empfohlen|personally recommended|personligt anbefalet/i.test(visibleCopy))fail(`${s.id}: personal endorsements are not part of neutral place information`);
 const sections=s.visit_details?.sections||{};
 if(s.visit_details?.schema_version!==1||Object.keys(sections).length!==sectionKeys.length||sectionKeys.some(key=>!Array.isArray(sections[key]?.items)))fail(`${s.id}: incomplete visit-planning structure`);
 const info=s.visitor_information;
 if(!info||!Array.isArray(info.confirmed_topics)||!Array.isArray(info.unconfirmed_topics))fail(`${s.id}: missing evidence scope`);
 else for(const key of info.confirmed_topics){
  if(!sectionKeys.includes(key)||info.unconfirmed_topics.includes(key)||!sections[key]?.items?.some(item=>!['not_confirmed','unconfirmed','estimate','editorial_recommendation','editorial_advice'].includes(item.status)))fail(`${s.id}: confirmed topic lacks supporting information: ${key}`);
 }
 for(const lang of ['de','en','da']){
  for(const key of ['title','summary','visit_label'])if(typeof s[`${key}_${lang}`]!=='string'||!s[`${key}_${lang}`].trim())fail(`${s.id}: missing ${key}/${lang}`);
  if(!Array.isArray(s[`tags_${lang}`])||s[`tags_${lang}`].some(t=>typeof t!=='string'||!t.trim()))fail(`${s.id}: invalid display tags/${lang}`);
 }
 for(const category of s.categories||[])for(let i=0;i<3;i++)if(!tables[i][category])fail(`${s.id}: unknown category ${category} in language ${i}`);
 if(s.parking_information?.status==='location_unconfirmed'&&s.quality_review_status!=='location_assignment_unconfirmed')fail(`${s.id}: unconfirmed location lacks route guard metadata`);
 if(s.quality_review_status==='location_assignment_unconfirmed'&&s.verified)fail(`${s.id}: unresolved location cannot be verified`);
 if((s.photos||[]).some(p=>p.kind==='ai_test'))fail(`${s.id}: test imagery must not appear in the public gallery`);
 const parking=s.parking_information;
 const statuses=['unknown','location_unconfirmed','source_supported','existing_partial','mixed','booking_required'];
 if(parking?.schema_version!==1||!statuses.includes(parking.status))fail(`${s.id}: invalid parking information`);
 if(parking){
  if(parking.checked_at&&!validDate(parking.checked_at))fail(`${s.id}: invalid parking date`);
  if(parking.status==='source_supported'&&(!parking.source_urls?.length||!validDate(parking.checked_at)))fail(`${s.id}: checked parking lacks source/date`);
  if(['unknown','location_unconfirmed'].includes(parking.status)&&(parking.navigation||parking.alternatives?.length||Object.keys(parking.facts||{}).length))fail(`${s.id}: unconfirmed parking must not have a navigation recommendation`);
  for(const [key,text]of Object.entries(parking.facts||{})){
   if(!['location','cost','walk','vehicle','note'].includes(key))fail(`${s.id}: unknown parking fact ${key}`);
   for(const lang of ['de','en','da'])if(typeof text[lang]!=='string'||!text[lang].trim())fail(`${s.id}: missing parking ${key}/${lang}`);
  }
  for(const url of parking.source_urls||[])if(!/^https:\/\//.test(url))fail(`${s.id}: unsafe parking source`);
  for(const n of parking.alternatives||[]){
   if(n.kind!=='search'||typeof n.query!=='string'||!n.query.trim()||n.query.length>240)fail(`${s.id}: invalid alternative parking search`);
   for(const lang of ['de','en','da'])if(!n.label?.[lang]?.trim())fail(`${s.id}: missing alternative parking label/${lang}`);
  }
  const n=parking.navigation;
  if(n){
   if(n.kind==='search'){if(typeof n.query!=='string'||!n.query.trim()||n.query.length>240)fail(`${s.id}: invalid parking search`);}
   else if(n.kind==='coordinates'){if(!Number.isFinite(n.lat)||Math.abs(n.lat)>90||!Number.isFinite(n.lon)||Math.abs(n.lon)>180)fail(`${s.id}: invalid parking coordinates`);}
   else fail(`${s.id}: invalid parking navigation kind`);
  }
 }
 if(s.source_checked_at&&!validDate(s.source_checked_at))fail(`${s.id}: invalid source date`);
 if(s.verified&&!s.visitor_information?.confirmed_topics?.length)fail(`${s.id}: check badge has no documented confirmed topic`);
 for(const other of [...(s.related_spot_ids||[]),...(s.same_place_as?[s.same_place_as]:[])])if(other===s.id||!ids.has(other))fail(`${s.id}: broken place reference ${other}`);
 for(const [section,field]of Object.entries(s.visit_details?.sections||{}))for(const item of field.items||[]){
  if(item.status==='source_supported'&&(!item.source_urls?.length||!validDate(item.checked_at)))fail(`${s.id}: source-supported ${section} lacks evidence/date`);
  for(const lang of ['de','en','da'])if(typeof item.text?.[lang]!=='string'||!item.text[lang].trim())fail(`${s.id}: missing ${section}/${lang}`);
  translatedSections++;
  if(item.checked_at&&!validDate(item.checked_at))fail(`${s.id}: invalid date in ${section}`);
  for(const u of item.source_urls||[])if(!/^https:\/\//.test(u))fail(`${s.id}: unsafe source in ${section}`);
 }
 if((s.tags||[]).some(t=>t==='Wasserspiel'||t==='Saisonale Wasserspiele')&&!(s.tags||[]).includes('water'))fail(`${s.id}: water feature missing from language-neutral filter data`);
 for(const photo of s.photos||[])for(const lang of ['de','en','da'])if(!photo.alt?.[lang]?.trim()||!photo.caption?.[lang]?.trim())fail(`${s.id}: incomplete photo text/${lang}`);
}
for(const c of ['zoo','tierpark','bauernhof'])for(const tag of ['stroller-friendly','wheelchair','accessible','petting-zoo'])if(tags[c]?.includes(tag))fail(`${c}: generic category promises ${tag}`);
if(tags['stellplatz-spielplatz-naehe-kostenlos']?.includes('overnight'))fail('Free parking cannot imply overnight permission');
const access=vm.runInNewContext('('+config.match(/export const CATEGORY_ACCESS = Object.freeze\((\{[\s\S]*?\n\})\);/)[1]+')');
if(access.perCategory.wasserspielplatz?.level!=='free')fail('Public water playgrounds must remain freely visible');
console.log(`Content contract: ${spots.length} records, ${translatedSections} trilingual information items, ${errors} errors.`);
if(errors)process.exitCode=1;
