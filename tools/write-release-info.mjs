// Produce an uncached deployment receipt. It lives outside the service-worker
// manifest and helps distinguish the published GitHub version from Safari's cache.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target=path.join(root,'_site','release-info.json');
if(!fs.existsSync(path.dirname(target)))throw Error('Missing staged GitHub Pages output');
const source=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const version=source.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
if(!version)throw Error('Service worker lacks release version');
const receipt={application:'Family Spots Map V5',repository:process.env.GITHUB_REPOSITORY||'HeimHafen/Family-Spots-Map-V5',release:version,commit:process.env.GITHUB_SHA||'local-test',builtAt:new Date().toISOString()};
fs.writeFileSync(target,JSON.stringify(receipt,null,2)+'\n');
console.log(`Published release receipt: ${version}`);
