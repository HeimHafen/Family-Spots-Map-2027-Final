// Deliberately uncompressed ZIP: JPEGs are already compressed. The strict reader
// accepts archives from this app, bounds every record and checks every CRC.
export const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
export const MAX_MANIFEST_BYTES = 16 * 1024 * 1024;
const encoder = new TextEncoder(), decoder = new TextDecoder("utf-8", { fatal: true });
const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
function crc(bytes) { let c = 0xffffffff; for (const n of bytes) c = table[(c ^ n) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
const invalid = () => { const e = new Error("invalid_backup"); e.code = "invalid_backup"; return e; };
const safeName = name => name === "manifest.json" || /^photos\/[a-f0-9]{64}\.jpg$/.test(name);
export async function writeZip(files) {
  if (!Array.isArray(files) || !files.length || files.length > 60001) throw invalid();
  const local = [], central = [], names = new Set(); let offset = 0, centralSize = 0;
  for (const { name, blob } of files) {
    if (!safeName(name) || names.has(name) || !(blob instanceof Blob) || offset + blob.size + 256 > MAX_ARCHIVE_BYTES) throw invalid();
    names.add(name);
    const bytes = new Uint8Array(await blob.arrayBuffer()), filename = encoder.encode(name), checksum = crc(bytes);
    const a = new Uint8Array(30 + filename.length), av = new DataView(a.buffer);
    av.setUint32(0, 0x04034b50, true); av.setUint16(4, 20, true); av.setUint16(6, 0x800, true); av.setUint16(12, 33, true);
    av.setUint32(14, checksum, true); av.setUint32(18, bytes.length, true); av.setUint32(22, bytes.length, true); av.setUint16(26, filename.length, true); a.set(filename, 30);
    const b = new Uint8Array(46 + filename.length), bv = new DataView(b.buffer);
    bv.setUint32(0, 0x02014b50, true); bv.setUint16(4, 20, true); bv.setUint16(6, 20, true); bv.setUint16(8, 0x800, true); bv.setUint16(14, 33, true);
    bv.setUint32(16, checksum, true); bv.setUint32(20, bytes.length, true); bv.setUint32(24, bytes.length, true); bv.setUint16(28, filename.length, true); bv.setUint32(42, offset, true); b.set(filename, 46);
    local.push(a, blob); central.push(b); offset += a.length + bytes.length; centralSize += b.length;
  }
  const end = new Uint8Array(22), view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true); view.setUint16(8, files.length, true); view.setUint16(10, files.length, true); view.setUint32(12, centralSize, true); view.setUint32(16, offset, true);
  if (offset + centralSize + 22 > MAX_ARCHIVE_BYTES) throw invalid();
  return new Blob([...local, ...central, end], { type: "application/zip" });
}
// Read bounded records and Blob slices instead of copying the entire archive
// into one ArrayBuffer (important when restoring photos on mobile devices).
export async function readZip(blob) {
  if (!(blob instanceof Blob) || blob.size < 22 || blob.size > MAX_ARCHIVE_BYTES) throw invalid();
  try {
    const end = blob.size - 22;
    const footer = new DataView(await blob.slice(end).arrayBuffer());
    if (footer.getUint32(0, true) !== 0x06054b50 || footer.getUint16(4, true) || footer.getUint16(6, true) || footer.getUint16(20, true) || footer.getUint16(8, true) !== footer.getUint16(10, true)) throw invalid();
    const count = footer.getUint16(8, true), start = footer.getUint32(16, true), centralSize = footer.getUint32(12, true);
    if (!count || count > 60001 || start + centralSize !== end || centralSize > count * 128) throw invalid();
    const bytes = new Uint8Array(await blob.slice(start, end).arrayBuffer());
    const view = new DataView(bytes.buffer);
    const u16 = p => view.getUint16(p, true), u32 = p => view.getUint32(p, true);
    const files = new Map(); let p = 0, localEnd = 0;
    for (let i = 0; i < count; i++) {
      if (p + 46 > bytes.length || u32(p) !== 0x02014b50 || u16(p + 8) !== 0x800 || u16(p + 10) || u16(p + 30) || u16(p + 32) || u16(p + 34) || u16(p + 36) || u32(p + 38)) throw invalid();
      const length = u16(p + 28), size = u32(p + 24), checksum = u32(p + 16), offset = u32(p + 42);
      if (p + 46 + length > bytes.length || size !== u32(p + 20) || offset !== localEnd || offset + 30 + length > start) throw invalid();
      const name = decoder.decode(bytes.subarray(p + 46, p + 46 + length));
      if (!safeName(name) || files.has(name) || (name === "manifest.json" ? size > MAX_MANIFEST_BYTES : size > 1024 * 1024)) throw invalid();
      const header = new Uint8Array(await blob.slice(offset, offset + 30 + length).arrayBuffer()), local = new DataView(header.buffer);
      if (local.getUint32(0, true) !== 0x04034b50 || local.getUint16(6, true) !== 0x800 || local.getUint16(8, true) || local.getUint32(14, true) !== checksum || local.getUint32(18, true) !== size || local.getUint32(22, true) !== size || local.getUint16(26, true) !== length || local.getUint16(28, true)) throw invalid();
      const from = offset + 30 + length, to = from + size;
      if (to > start || decoder.decode(header.subarray(30)) !== name) throw invalid();
      const file = blob.slice(from, to, name === "manifest.json" ? "application/json" : "image/jpeg");
      if (crc(new Uint8Array(await file.arrayBuffer())) !== checksum) throw invalid();
      files.set(name, file);
      localEnd = to; p += 46 + length;
    }
    if (p !== bytes.length || localEnd !== start || !files.has("manifest.json")) throw invalid();
    return files;
  } catch { throw invalid(); }
}
