// FSM V5 offline update regressions: isolated scope, small atomic shell,
// network-first assets, integrity checks, version channel, offline fallback.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base='https://example.test/Family-Spots-Map-V5/';
const code=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const version=code.match(/const CACHE_VERSION = "([^"]+)"/)?.[1];
const prefix='fsm-v5-_Family_Spots_Map_V5_-';
function harness({fail=null,bad=null}={}){
 const listeners=new Map(),maps=new Map(),waits=[];
 const caches={
  async open(name){if(!maps.has(name))maps.set(name,new Map());const map=maps.get(name);return {
   async put(key,response){map.set(String(key),response.clone())},
   async match(key){return map.get(String(key))?.clone()}
  }},
  async keys(){return [...maps.keys()]},async delete(name){return maps.delete(name)}
 };
 const fetch=async req=>{
  const url=new URL(typeof req==='string'?req:req.url,base);
  if(!url.href.startsWith(base)) throw Error('Request outside V5 scope '+url.href);
  let rel=url.pathname.slice(new URL(base).pathname.length);
  if(!rel||rel.endsWith('/'))rel+='index.html';
  if(rel===fail)return new Response('Missing',{status:404});
  const content=rel===bad?Buffer.from('Tampered source'):fs.readFileSync(path.join(root,rel));
  const type=rel.endsWith('.json')||rel.endsWith('.webmanifest')?'application/json':rel.endsWith('.html')?'text/html':'application/octet-stream';
  return new Response(content,{status:200,headers:{'Content-Type':type}});
 };
 const self={location:{href:base},clients:{claim:async()=>{}},skipWaiting:async()=>{ctx.skipped=true},addEventListener:(event,callback)=>listeners.set(event,callback)};
 const ctx=vm.createContext({self,URL,Response,Uint8Array,DataView,Map,Set,Array,JSON,Promise,AbortController,setTimeout,clearTimeout,crypto:webcrypto,caches,fetch,console});
 vm.runInContext(code,ctx,{filename:'service-worker.js'});
 const shell=vm.runInContext('INSTALL_SHELL',ctx);
 async function invoke(type,props={}){
  let result,body;
  listeners.get(type)({
   waitUntil(p){waits.push(p)},respondWith(p){body=p},...props
  });
  result=waits.splice(0,1)[0];
  if(result)await result;
  if(body)return await body;
 }
 return {invoke,ctx,caches,maps,listeners,shell};
}
let successes=0,failures=0;
async function test(name,callback){try{await callback();console.log('PASS',name);successes++;}catch(e){console.error('FAIL',name,e);failures++;}}
await test('five-file install activates and retains no mass asset preload',async()=>{
 const t=harness();await t.invoke('install');assert.equal(t.ctx.skipped,true);assert.equal(t.shell.length,5);assert.equal([...t.maps.values()][0].size,5);
});
await test('missing optional spot photo cannot block installation',async()=>{
 const t=harness({fail:'assets/spots/windheimstrasse/0769.webp'});await t.invoke('install');assert.equal(t.ctx.skipped,true);
});
await test('missing mandatory index rejects without disturbing old V5 cache',async()=>{
 const t=harness({fail:'index.html'});t.maps.set(prefix+'old',new Map([['old','preserved']]));await assert.rejects(t.invoke('install'));assert.ok(t.maps.has(prefix+'old'));assert.equal(t.ctx.skipped,undefined);
});
await test('damaged index fails checksum before new release activation',async()=>{
 const t=harness({bad:'index.html'});await assert.rejects(t.invoke('install'),/does not match/);assert.equal(t.ctx.skipped,undefined);
});
await test('one previous V5 cache kept, V4 caches untouched',async()=>{
 const t=harness();t.maps.set(prefix+'older',new Map());t.maps.set(prefix+'old',new Map());t.maps.set('family-spots-map-old-v4',new Map());await t.invoke('install');await t.invoke('activate');assert.ok(t.maps.has('family-spots-map-old-v4'));assert.ok(t.maps.has(prefix+'old'));assert.ok(!t.maps.has(prefix+'older'));
});
await test('version is accessible through message port',async()=>{
 const t=harness();let value;t.listeners.get('message')({data:{type:'GET_VERSION'},ports:[{postMessage:x=>{value=x}}]});assert.equal(value.version,version);
});
await test('new app asset is fetched from network and stored for offline',async()=>{
 const t=harness();await t.invoke('install');const req={method:'GET',mode:'no-cors',url:base+'js/app.js'};
 const res=await t.invoke('fetch',{request:req});assert.equal(res.status,200);
 const cached=await(await t.caches.open(prefix+version)).match(base+'js/app.js');assert.ok(cached);
});
await test('broken new app asset falls back to cached matching release',async()=>{
 const t=harness({bad:'js/app.js'});await t.invoke('install');const req={method:'GET',mode:'cors',url:base+'js/app.js'};
 const cache=await t.caches.open(prefix+version);const content=fs.readFileSync(path.join(root,'js/app.js'));await cache.put(base+'js/app.js',new Response(content));
 const res=await t.invoke('fetch',{request:req});assert.equal((await res.text()).slice(0,30),content.toString().slice(0,30));
});
await test('version receipt is always bypassed and never cached',async()=>{
 const t=harness();const response=await t.invoke('fetch',{request:{method:'GET',url:base+'release-info.json',mode:'cors'}});assert.equal(response,undefined);
});
console.log(`${successes}/${successes+failures} service-worker tests passed.`);
if(failures)process.exitCode=1;
