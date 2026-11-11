// Category regression checks. No network access and no mutation of source data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORLDS,PLACE_TYPES,FACETS,getPlaceTypes,getWorlds,getPlaceTypeWorlds,facetValue,matchesCategoryProfile,isExpiredEvent,hasReviewedCategoryProfile,placeTypeLabels} from '../js/categories.js';
const root=new URL('../',import.meta.url);
const spots=JSON.parse(fs.readFileSync(new URL('data/spots.json',root)));
const labels=JSON.parse(fs.readFileSync(new URL('data/i18n/de.json',root))).domain.categories;
assert.equal(WORLDS.filter(x=>!x.auxiliary).length,8);
assert.equal(PLACE_TYPES.filter(x=>!['services','events'].includes(x.world)).length,54);
assert.equal(new Set(PLACE_TYPES.map(x=>x.id)).size,PLACE_TYPES.length);
for(const item of [...WORLDS,...PLACE_TYPES,...FACETS])for(const lang of ['de','en','da'])assert.ok(item.label[lang]?.trim(),`${item.id}: ${lang}`);
const aliases=new Set();for(const type of PLACE_TYPES){assert.ok(WORLDS.some(x=>x.id===type.world));for(const alias of type.aliases){assert.ok(!aliases.has(alias),'Duplicate alias: '+alias);aliases.add(alias);}}
for(const slug of Object.keys(labels))assert.ok(!getPlaceTypes({categories:[slug]})[0].startsWith('legacy:'),'Unmapped saved category: '+slug);
for(const spot of spots){assert.ok(getPlaceTypes(spot).length,spot.id);assert.ok(!getWorlds(spot).includes('other'),'Unmapped existing spot: '+spot.id);assert.ok(matchesCategoryProfile(spot), 'Default unexpectedly hides: '+spot.id);}
const sample={id:'sample',categories:['zoo','pumptrack']};const snapshot=JSON.stringify(sample);
assert.equal(matchesCategoryProfile(sample,{types:new Set(['zoo','skatepark'])}),true,'Types must use OR');
assert.equal(matchesCategoryProfile(sample,{types:new Set(['skatepark'])}),false);
assert.equal(matchesCategoryProfile(sample,{world:'animals'}),true);
assert.equal(matchesCategoryProfile(sample,{world:'water'}),false);
// Water playgrounds are both active play locations and water experiences.
// The dual membership must not change the original stored slug or access.
const waterPlay={categories:['wasserspielplatz']};
assert.deepEqual(getPlaceTypeWorlds('water-playground'),['play','water']);
assert.deepEqual(getWorlds(waterPlay),['play','water']);
assert.equal(matchesCategoryProfile(waterPlay,{world:'play'}),true);
assert.equal(matchesCategoryProfile(waterPlay,{world:'water'}),true);
assert.equal(matchesCategoryProfile(waterPlay,{world:'animals'}),false);
assert.deepEqual(waterPlay.categories,['wasserspielplatz']);
const waterSpots=spots.filter(s=>getWorlds(s).includes('water'));
assert.equal(waterSpots.length,7,'The current catalog contains 3 bathing places and 4 water-playground spots');
assert.equal(spots.filter(s=>getWorlds(s).includes('play')).length,101,'The current catalog contains 101 spots in Play');

assert.equal(facetValue({tags:['free','toilet'],summary_de:'kostenlos mit Toilette'},'free'),'unknown');
assert.equal(facetValue({categories:['stellplatz-spielplatz-naehe-kostenlos'],tags:['free']},'free'),'unknown','Free parking must not imply free admission');
const evidence=value=>({value,checked_at:'2026-10-20',source_urls:['https://example.org/operator']});
const enriched={...sample,family_facilities:{free:evidence('yes'),toilet:evidence('yes'),shade:evidence('no')}};
assert.equal(matchesCategoryProfile(enriched,{facets:new Set(['free','toilet'])}),true);
assert.equal(matchesCategoryProfile(enriched,{facets:new Set(['free','shade'])}),false,'Facilities must use AND');
assert.equal(matchesCategoryProfile(sample,{facets:new Set(['toilet'])}),false,'Unknown must not match');
assert.equal(facetValue({family_facilities:{free:{value:'yes'}}},'free'),'unknown','Evidence required');
assert.equal(facetValue({family_facilities:{free:{value:'yes',checked_at:'2099-01-01',source_urls:['https://example.org']}}},'free'),'unknown','Future dates invalid');
assert.equal(facetValue({categories:['indoor_spielplatz']},'indoor'),'yes');
assert.equal(facetValue({categories:['barrierefreier_spielplatz']},'toilet'),'unknown');
assert.equal(getPlaceTypes({category:'unknown_new_type'})[0],'legacy:unknown-new-type','Unknown types stay discoverable');
assert.equal(getPlaceTypes({categories:['toddler_barfuss_motorik'],category_profile:{schema_version:1,status:'source_supported',checked_at:'2026-10-20',source_urls:['https://example.org/operator'],place_types:['barefoot']}})[0],'barefoot');
assert.equal(isExpiredEvent({categories:['familien_event'],event:{end_at:'2020-01-01T12:00:00Z'}}),true);
assert.equal(isExpiredEvent({categories:['familien_event'],event:{end_at:'2020-01-01'}}),false,'Ambiguous dates must not hide an event');
assert.equal(JSON.stringify(sample),snapshot,'Resolver must not mutate source');
console.log(`Categories: 8 worlds, 54 place types, 4 facility/rest types, events; ${Object.keys(labels).length} saved labels mapped, ${spots.length} spots covered. OR/AND, evidence, legacy, expiry and immutability checks passed.`);
// Strict evidence/time parsing: invalid records must never enable a facility or hide an event.
assert.equal(facetValue({family_facilities:{toilet:{value:'yes',checked_at:'2026-02-31',source_urls:['https://example.org']}}},'toilet'),'unknown');
assert.equal(facetValue({family_facilities:{toilet:{value:'yes',checked_at:'2026-10-20',source_urls:['https:// ']}}},'toilet'),'unknown');
assert.equal(isExpiredEvent({categories:['familien_event'],event:{end_at:'2025-02-31T12:00:00Z'}}),false);
assert.equal(isExpiredEvent({categories:['familien_event'],event:{end_at:'2025-01-01T25:00:00Z'}}),false);
assert.equal(matchesCategoryProfile(sample,null),true);
console.log('Strict source URLs, calendar dates, event times and nullable filter state passed.');

// A presentation override must never silently accept incomplete or invalid evidence.
const profile={schema_version:1,status:'source_supported',checked_at:'2026-10-20',source_urls:['https://example.org/operator'],place_types:['nature-center']};
for(const patch of [{checked_at:'2099-01-01'},{checked_at:'2026-02-31'},{source_urls:[]},{source_urls:['javascript:alert(1)']},{place_types:['missing']},{place_types:['nature-center','nature-center']},{schema_version:2},{status:'pending'}]) {
 const spot={categories:['spielplatz'],category_profile:{...profile,...patch}};
 assert.equal(hasReviewedCategoryProfile(spot),false);
 assert.deepEqual(getPlaceTypes(spot),['playground'],'Invalid profiles must fall back to original categories');
}
const byId=new Map(spots.map(spot=>[spot.id,spot]));
for(const spot of spots.filter(spot=>spot.category_profile))assert.ok(hasReviewedCategoryProfile(spot),spot.id+': invalid category evidence');
assert.deepEqual(getPlaceTypes(byId.get('asp_hannover_welfengarten')),['playground']);
assert.deepEqual(getPlaceTypes(byId.get('spielpark_wakitu_hannover')),['forest-playground']);
assert.ok(getPlaceTypes(byId.get('waldstation_eilenriede_hannover')).includes('nature-center'));
assert.ok(getWorlds(byId.get('erlebnishof_lahmann_otze')).includes('adventure'));
assert.ok(!getPlaceTypes(byId.get('erlebnishof_lahmann_otze')).includes('minigolf'));
for(const lang of ['de','en','da'])assert.ok(placeTypeLabels(byId.get('waldstation_eilenriede_hannover'),lang).every(label=>label.trim()));
console.log('Reviewed category overrides: evidence, fallback, multilingual labels and four real-place assignments passed.');
