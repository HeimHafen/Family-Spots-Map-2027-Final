// Guard the exact host, repository and personal-data isolation assumptions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootUrl='https://heimhafen.github.io/Family-Spots-Map-V5/';
for(const language of ['', 'en/', 'da/']){
 const html=fs.readFileSync(path.join(root,language,'index.html'),'utf8');
 assert(html.includes(`href="${rootUrl}${language}"`), `canonical link wrong for ${language||'de'}`);
 assert(!html.includes('https://heimhafen.github.io/Family-Spots-Map/'),'Accidental old canonical URL');
 assert(html.includes('<meta name="color-scheme" content="light"'),'Light-only scheme missing');
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.scope,'./');assert.equal(manifest.id,'./');
const release=JSON.parse(fs.readFileSync(path.join(root,'release-info.json'),'utf8'));
assert.equal(release.repository,'HeimHafen/Family-Spots-Map-V5');
assert(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes(`${rootUrl}sitemap.xml`));
assert(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes(`${rootUrl}da/`));
const ids=JSON.parse(fs.readFileSync(path.join(root,'data/spots.json'),'utf8'));
const wind=ids.find(item=>item.id==='bolzplaetze_windheimstrasse_hannover');
assert(wind,'Latest Windheimstraße spot missing');
assert(wind.related_spot_ids.includes('skatepark_windheimstrasse_hannover'),'Near-by skatepark missing');
assert(wind.related_spot_ids.includes('pagalino_linden_nord'),'Near-by Palettengarten missing');
const tourData=JSON.parse(fs.readFileSync(path.join(root,'data/tours.json'),'utf8'));
assert(Array.isArray(tourData.tours)&&tourData.tours.length,'Family tours missing');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('Treffen') || fs.readFileSync(path.join(root,'js/features/community-play.js'),'utf8').includes('Treffen'),'Community module missing');
assert(fs.existsSync(path.join(root,'js/features/diary-view.js')),'Mein Tag functionality missing');
console.log(`FSM V5 scope passed: ${ids.length} spots, ${tourData.tours.length} tours, Windheimstraße and neighbors, 3 correct entry URLs.`);
