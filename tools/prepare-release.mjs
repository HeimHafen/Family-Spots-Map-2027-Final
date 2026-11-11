// Prepare one coordinated offline release without changing design or source data.
// Usage: node tools/prepare-release.mjs 20261022-quality-47
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2];
const validVersion = value => typeof value === 'string' && value.length <= 80 && /^\d{8}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
if (process.argv.length !== 3 || !validVersion(version)) {
  console.error('Usage: node tools/prepare-release.mjs YYYYMMDD-name-number');
  process.exit(1);
}

const originals = new Map(), staged = new Map();
function read(name) {
  const absolute = path.resolve(root, name);
  if (!absolute.startsWith(root + path.sep)) throw new Error(`Unsafe path: ${name}`);
  if (!originals.has(name)) originals.set(name, fs.readFileSync(absolute, 'utf8'));
  return staged.get(name) ?? originals.get(name);
}
const names = ['index.html', 'en/index.html', 'da/index.html', 'css/styles.css', 'js/app.js', 'js/map.js', 'service-worker.js', 'release-info.json'];
const written = [];
try {
  const worker = read('service-worker.js');
  const current = worker.match(/const CACHE_VERSION = "([^"]+)";/)?.[1];
  if (!validVersion(current)) throw new Error('Current release version is missing or invalid.');
  const assetsMatch = worker.match(/const ASSETS = (\[[\s\S]*?\n\]);/);
  const hashesMatch = worker.match(/const RELEASE_HASHES = (\{[\s\S]*?\n\});/);
  if (!assetsMatch || !hashesMatch) throw new Error('Offline asset list or checksum table is missing.');
  const assets = JSON.parse(assetsMatch[1]);
  const hashes = JSON.parse(hashesMatch[1]);
  if (!Array.isArray(assets) || !hashes || Array.isArray(hashes) || typeof hashes !== 'object') throw new Error('Invalid release metadata.');
  // Check every dependency before writing anything. Do not silently add or remove
  // offline assets: choosing which images work offline is a separate decision.
  for (const name of assets) {
    if (typeof name !== 'string') throw new Error('Invalid offline path.');
    const absolute = path.resolve(root, name === './' ? 'index.html' : name);
    if (!absolute.startsWith(root + path.sep) || !fs.statSync(absolute).isFile()) throw new Error(`Missing or unsafe offline asset: ${name}`);
  }
  for (const name of names) {
    const source = read(name);
    if (!source.includes(current)) throw new Error(`Release reference missing in ${name}.`);
    staged.set(name, source.replaceAll(current, version));
  }
  for (const name of Object.keys(hashes)) {
    if (!assets.includes(name) || name === 'service-worker.js') throw new Error(`Invalid checksum target: ${name}`);
    const absolute = path.resolve(root, name);
    if (!absolute.startsWith(root + path.sep)) throw new Error(`Unsafe checksum path: ${name}`);
    const bytes = staged.has(name) ? Buffer.from(staged.get(name), 'utf8') : fs.readFileSync(absolute);
    hashes[name] = createHash('sha256').update(bytes).digest('hex');
  }
  const oldTable = read('service-worker.js').match(/const RELEASE_HASHES = (\{[\s\S]*?\n\});/)?.[0];
  staged.set('service-worker.js', read('service-worker.js').replace(oldTable, `const RELEASE_HASHES = ${JSON.stringify(hashes, null, 2)};`));
  for (const [name, source] of staged) {
    if (source === originals.get(name)) continue;
    written.push(name);
    fs.writeFileSync(path.join(root, name), source);
  }
  console.log(`Release ${version} prepared (${written.length} files updated).`);
  console.log('Next: node tools/check-project.mjs. Publish all changed files together only after it passes.');
} catch (error) {
  // Restore completed/partly written files if a normal filesystem write fails.
  for (const name of written.reverse()) {
    try { fs.writeFileSync(path.join(root, name), originals.get(name)); }
    catch (rollback) { console.error(`Could not restore ${name}: ${rollback.message}`); }
  }
  console.error(`Release preparation failed: ${error.message}`);
  process.exitCode = 1;
}
