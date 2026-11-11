// Owner-only development build contract (local UI gating, not security against JS tampering).
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const entries=JSON.parse(fs.readFileSync(path.join(root,'data/partners.json'),'utf8')).codes;
assert.equal(entries.length,1,'Only one developer verifier must be shipped');
const retiredCodes=JSON.parse(fs.readFileSync(path.join(root,'data/codes.json'),'utf8'));
assert.deepEqual(retiredCodes.codes, [], 'Retired campaign code list must be empty');

assert.equal(entries[0].source,'development_owner');
assert.equal(entries[0].permanent,true);
assert.equal(entries[0].enabled,true);
assert.match(entries[0].codeSha256,/^[a-f0-9]{64}$/);
assert.equal(Object.hasOwn(entries[0],'code'),false,'No plaintext access code in the public JSON');
assert.match(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),/export const DEV_FORCE_PLUS = false;/);
const store = new Map();
globalThis.localStorage={ getItem:key=>store.get(key)??null,
  setItem:(key,value)=>store.set(key,String(value)), removeItem:key=>store.delete(key) };
const {getPlusStatus,hasAddon}=await import('../js/features/plus.js');
const {loadPlusActive}=await import('../js/storage.js');
for(const source of ['partner','campaign','family_test','testing','manual_toggle']) {
  store.set('fs_plus_active',JSON.stringify({active:true,source,plan:'family_plus'}));
  assert.equal(getPlusStatus().active,false,`Old ${source} status must not unlock Plus`);
  assert.equal(loadPlusActive(),false);
}
store.set('fs_plus_active',JSON.stringify({active:true,source:'development_owner',plan:'family_plus'}));
assert.equal(getPlusStatus().active,true);
assert.equal(hasAddon('addon_water'),true);
store.set('fs_plus_active',JSON.stringify({active:true,grantVersion:1,grants:[
  {source:'partner',active:true,expiresAt:'2099-01-01T00:00:00Z'}]}));
assert.equal(getPlusStatus().active,false);
store.set('fs_plus_active',JSON.stringify({active:true,grantVersion:1,grants:[
  {source:'development_owner',active:true,expiresAt:null}]}));
assert.equal(getPlusStatus().active,true);
console.log('Plus owner-only checks passed: public code hygiene, default off, legacy partner denial and owner compatibility.');
