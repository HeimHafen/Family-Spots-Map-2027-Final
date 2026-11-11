// FSM V5: Verify the compact shell, scope isolation and safe update checking.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sw=read('service-worker.js'), register=read('js/sw-register.js');
const assets=JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\n\]);/)[1]);
const shell=JSON.parse(sw.match(/const INSTALL_SHELL = (\[[^\n]+\]);/)[1]);
assert.equal(assets.length,new Set(assets).size, 'Duplicate cached resource');
assert(shell.length>=3 && shell.length<=8, 'Shell must be small enough for mobile install');
assert(shell.every(name=>fs.existsSync(path.join(root,name))), 'Missing shell resource');
assert(shell.every(name=>name.endsWith('.html')||name.endsWith('.webmanifest')),'Unexpected blocking large asset');
assert(sw.includes('await self.skipWaiting()'),'New worker must activate');
assert(sw.includes('await self.clients.claim()'),'New worker must take control');
assert(sw.includes('ROOT.pathname.replace'),'Separate repositories must have separate caches');
assert(sw.includes('if (path === "release-info.json") return;'),'Release receipt must not be cached');
assert(sw.includes('request.mode === "navigate"'),'Navigation should be handled');
assert(sw.includes('const response = await checkedNetwork(request, path'),'Use network-first local assets');
assert(register.includes('release-info.json'),'Update detection needs a release receipt');
assert(register.includes('if (hasDraft())'),'Protect personal drafts');
assert(register.includes('controllerchange'),'Refresh controlled clients on new version');
assert(register.includes('registration.update()'),'Check for updates on re-entry');
const version=sw.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
assert(version,'Missing release marker');
for(const name of ['index.html','en/index.html','da/index.html']){
 const source=read(name);
 assert(source.includes(`js/app.js?v=${version}`), name+' app release mismatch');
 assert(source.includes(`css/styles.css?v=${version}`), name+' CSS release mismatch');
 assert(source.includes(`js/sw-register.js?v=${version}`), name+' update registration mismatch');
}
console.log(`FSM V5 update contract passed: ${shell.length} installation files, ${assets.length} declared offline resources, 3 languages.`);
