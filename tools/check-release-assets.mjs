import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read = file=>fs.readFileSync(path.join(root,file),'utf8');
let resources=0;
function existsFile(file, context) {
  const absolute=path.resolve(root,file);
  assert.ok(absolute.startsWith(root+path.sep),`${context}: unsafe path ${file}`);
  assert.ok(fs.statSync(absolute,{throwIfNoEntry:false})?.isFile(),`${context}: missing ${file}`);
  resources++;
}
const urlLike=/^(?:[a-z][\w+.-]*:|\/\/|#|data:)/i;
for(const lang of ['','en/','da/']) {
  const html=read(lang+'index.html');
  const base=(html.match(/<base\s+href="([^"]+)"/i)||[])[1];
  const prefix=base==='../'?'':lang;
  for (const tag of html.match(/<(?:link|script|img|source)\b[^>]*>/gi)||[]) {
    if(tag.startsWith('<link') && !/\brel="(?:stylesheet|manifest|icon|apple-touch-icon)"/.test(tag))continue;
    const value=(tag.match(/\b(?:href|src)="([^"]+)"/i)||[])[1];
    if(!value||urlLike.test(value))continue;
    const clean=value.split(/[?#]/)[0];
    if (!clean) continue;
    existsFile(path.posix.normalize(prefix+clean),'HTML '+(lang||'de'));
  }
}
function walk(d, callback) { for(const item of fs.readdirSync(path.join(root,d),{withFileTypes:true})) {
 const p=path.posix.join(d,item.name);if(item.isDirectory())walk(p,callback);else callback(p);
}}
walk('css',file=>{
 if(!file.endsWith('.css'))return;
 const content=read(file);
 for (const match of content.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
   const value=match[1].trim(); if(urlLike.test(value))continue;
   existsFile(path.posix.normalize(path.posix.join(path.posix.dirname(file),value.split(/[?#]/)[0])),file);
 }
});
walk('vendor',file=>{
 if(!file.endsWith('.css'))return;
 for (const match of read(file).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
  const value=match[1].trim();if(urlLike.test(value))continue;
  existsFile(path.posix.normalize(path.posix.join(path.posix.dirname(file),value.split(/[?#]/)[0])),file);
 }
});
for(const item of JSON.parse(read('data/spots.json'))) {
 for(const photo of item.photos||[]) {
  if(typeof photo.src==='string'&&!urlLike.test(photo.src))existsFile(photo.src,item.id);
  assert.ok(Number.isInteger(photo.width)&&photo.width>0&&Number.isInteger(photo.height)&&photo.height>0,
    `Missing photo dimensions: ${item.id}: ${photo.src}`);
 }
}
for(const icon of JSON.parse(read('manifest.webmanifest')).icons)existsFile(icon.src,'manifest icon');
for(const file of ['.github/workflows/deploy.yml','service-worker.js','tools/prepare-release.mjs','js/sw-register.js','release-info.json'])existsFile(file,'release');
const serviceWorkerVersion=read('service-worker.js').match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
const receipt=JSON.parse(read('release-info.json'));
assert.ok(serviceWorkerVersion && receipt.release===serviceWorkerVersion,
  `Release receipt mismatch: ${receipt.release} / ${serviceWorkerVersion}`);
console.log(`Asset audit passed: ${resources} paths found; all 3 language entries, CSS references, spot photos and PWA icons.`);
