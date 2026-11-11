// Dependency-free backup regressions; executed by the publication gate.
import assert from 'node:assert/strict';
import { writeZip, readZip, MAX_MANIFEST_BYTES } from '../js/features/backup-zip.js';
import { parseBackup, importPersonalFiles } from '../js/features/personal-backup.js';
import { validatedPrivateCalendar, mergePrivateCalendars } from '../js/features/calendar-backup.js';
const base = { format: 'family-spots-personal-backup', version: 2, favorites: ['spot-a'], entries: [{ id: 'memory-a', text: 'ü'.repeat(100001), ts: 1 }] };
const manifest = JSON.stringify(base);
assert.equal(parseBackup(manifest, 2).entries[0].text, base.entries[0].text);
assert.equal(parseBackup(JSON.stringify({...base, version: 1})).entries.length, 1);
assert.throws(() => parseBackup(JSON.stringify({...base, entries: [{...base.entries[0], photos: ['bad-id']}]}), 2));
assert.throws(() => parseBackup('x'.repeat(MAX_MANIFEST_BYTES + 1), 2));
const zip = await writeZip([{ name: 'manifest.json', blob: new Blob([manifest]) }]);
assert.equal(await (await readZip(zip)).get('manifest.json').text(), manifest);
// The reader must not copy the complete archive in a single ArrayBuffer.
class SlicedOnlyBlob extends Blob { arrayBuffer() { throw new Error('whole_archive_copy'); } }
assert.equal((await readZip(new SlicedOnlyBlob([zip]))).size, 1);
const bytes = new Uint8Array(await zip.arrayBuffer()); bytes[50] ^= 1;
await assert.rejects(readZip(new Blob([bytes])), { code: 'invalid_backup' });
await assert.rejects(readZip(zip.slice(0, zip.size - 1)), { code: 'invalid_backup' });
await assert.rejects(writeZip([{name: '../outside.jpg', blob: new Blob(['bad'])}]), {code: 'invalid_backup'});
const bundle = { id: '12345678-1234-1234-1234-123456789abc', index: 1, total: 2 };
const part = await writeZip([{name: 'manifest.json', blob: new Blob([JSON.stringify({...base, bundle})])}]);
await assert.rejects(importPersonalFiles([part]), {code: 'incomplete_backup'});
await assert.rejects(importPersonalFiles([part, part]), {code: 'incomplete_backup'});
const other = await writeZip([{name: 'manifest.json', blob: new Blob([JSON.stringify({...base, bundle: {...bundle, id: '12345678-1234-1234-1234-123456789def', index: 2}})])}]);
await assert.rejects(importPersonalFiles([part, other]), {code: 'incomplete_backup'});
await assert.rejects(importPersonalFiles([zip], () => false), {code: 'draft'});
console.log('Backup regressions: long texts, legacy JSON, sliced ZIP reads, corruption and multipart guards passed.');

// Backward-compatible V3 archives also carry private plans without touching Plus rights.
const outing = { id:'private-1', title:'Ausflug am See', category:'family', date:'2026-11-08', time:'10:30', spotId:'spot-a', spotName:'See', note:'Packliste', yearly:false };
const v3 = {...base, version:3, calendar:[outing]};
assert.deepEqual(parseBackup(JSON.stringify(v3), 3).calendar, [outing]);
assert.deepEqual(parseBackup(JSON.stringify({...v3, calendar:[]}), 3).calendar, []);
assert.throws(() => parseBackup(JSON.stringify({...v3, calendar:[{...outing,date:'2026-02-30'}]}), 3));
assert.throws(() => parseBackup(JSON.stringify({...v3, calendar:[outing,outing]}), 3));
assert.throws(() => parseBackup(JSON.stringify({...v3, calendar:undefined}), 3));
const merged1 = mergePrivateCalendars([], [outing]);
assert.equal(merged1.added, 1);
assert.equal(mergePrivateCalendars(merged1.plans, [outing]).added, 0);
const altered = {...outing, title:'Anderer Termin'};
const merged2 = mergePrivateCalendars([outing], [altered]);
assert.equal(merged2.added, 1);
assert.equal(merged2.conflicts, 1);
assert.notEqual(merged2.plans[0].id, merged2.plans[1].id);
assert.throws(() => validatedPrivateCalendar(Array.from({length:301},(_,i)=>({...outing, id:'event-'+i}))));
const photoId = 'a'.repeat(64);
assert.deepEqual(parseBackup(JSON.stringify({...v3,entries:[{id:'photo-memory',text:'',ts:1,photos:[photoId]}]}),3).entries[0].photos,[photoId]);
const zippedV3 = await writeZip([{name:'manifest.json', blob:new Blob([JSON.stringify(v3)])}]);
assert.equal(parseBackup(await (await readZip(zippedV3)).get('manifest.json').text(),3).calendar.length,1);
console.log('Calendar-backup regressions: V1/V2/V3, imported duplicates, conflict preservation, invalid dates, photo-only memories and capacity passed.');
