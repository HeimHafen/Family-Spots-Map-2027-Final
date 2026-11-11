// Hosting parity: the same static release must work at the root of a Cloudflare
// preview AND in the /Family-Spots-Map-V5/ subdirectory used by GitHub Pages.
// No network requests are made. This is an additional publication guard.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['', 'en/', 'da/'];
const deployments = [
  'https://preview.example/',
  'https://heimhafen.github.io/Family-Spots-Map-V5/'
];
const manifest = JSON.parse(read('manifest.webmanifest'));
let resources = 0;
function tags(html) { return [...html.matchAll(/<(?:link|script|img|source)\b[^>]*>/gi)].map(match => match[0]); }
function attr(tag, name) { return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1] ?? null; }
function checkFile(url, siteRoot, context) {
  assert.equal(url.origin, siteRoot.origin, `${context}: wrong origin: ${url.href}`);
  assert.ok(url.pathname.startsWith(siteRoot.pathname), `${context}: escaped hosting prefix: ${url.href}`);
  const relative = decodeURIComponent(url.pathname.slice(siteRoot.pathname.length));
  const candidate = path.resolve(root, relative);
  assert.ok(candidate.startsWith(root + path.sep), `${context}: unsafe path: ${relative}`);
  assert.ok(fs.statSync(candidate, { throwIfNoEntry: false })?.isFile(), `${context}: missing resource: ${relative}`);
  resources++;
}
for (const site of deployments) {
  const siteRoot = new URL(site);
  for (const suffix of pages) {
    const html = read(`${suffix}index.html`);
    const page = new URL(suffix, siteRoot);
    const baseTag = html.match(/<base\b[^>]*>/i)?.[0];
    const documentBase = baseTag ? new URL(attr(baseTag, 'href'), page) : page;
    assert.equal(documentBase.href, siteRoot.href, `Unexpected base URL for ${suffix || 'de'} on ${site}`);
    const manifestLinks = tags(html).filter(tag => tag.startsWith('<link') && /\brel\s*=\s*["']manifest["']/i.test(tag));
    assert.equal(manifestLinks.length, 1, `Exactly one manifest required: ${suffix || 'de'}`);
    const manifestURL = new URL(attr(manifestLinks[0], 'href'), documentBase);
    assert.equal(manifestURL.href, new URL('manifest.webmanifest', siteRoot).href, `Wrong manifest URL for ${suffix || 'de'} on ${site}`);
    checkFile(manifestURL, siteRoot, 'PWA manifest');
    for (const tag of tags(html)) {
      if (tag === manifestLinks[0]) continue;
      const link = tag.startsWith('<link');
      if (link && !/(?:stylesheet|icon|apple-touch-icon)/.test(attr(tag, 'rel') || '')) continue;
      const ref = attr(tag, link ? 'href' : 'src');
      if (!ref || /^(?:https?:|data:|mailto:|#)/i.test(ref)) continue;
      checkFile(new URL(ref, documentBase), siteRoot, `${suffix || 'de'} ${tag.slice(0, 30)}`);
    }
    // The registration URL is interpreted against the document's base URL.
    const swRegistration = read('js/sw-register.js').match(/serviceWorker\.register\(["']([^"']+)["']/)?.[1];
    assert.ok(swRegistration, 'Service worker registration URL is missing');
    assert.equal(new URL(swRegistration, documentBase).href, new URL('service-worker.js', siteRoot).href, `Service worker scope misplaced for ${suffix || 'de'}`);
  }
  const manifestURL = new URL('manifest.webmanifest', siteRoot);
  for (const item of manifest.icons) checkFile(new URL(item.src, manifestURL), siteRoot, 'PWA icon');
  assert.equal(new URL(manifest.start_url, manifestURL).pathname, siteRoot.pathname, 'Wrong installed PWA start path');
  assert.equal(new URL(manifest.scope, manifestURL).pathname, siteRoot.pathname, 'Wrong PWA scope');
}
console.log(`Hosting parity passed: Cloudflare root and GitHub Pages subdirectory, 3 languages, PWA + ${resources} local resource checks.`);
