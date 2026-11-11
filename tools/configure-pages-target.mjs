import { readFileSync, writeFileSync } from 'node:fs';

const repository = process.env.GITHUB_REPOSITORY;
if (!repository || !process.env.FSM_PAGES_URL) {
  throw new Error('GitHub repository and Pages URL are required.');
}
const pagesUrl = new URL(process.env.FSM_PAGES_URL);
if (pagesUrl.protocol !== 'https:') throw new Error('GitHub Pages URL must use HTTPS.');
const base = pagesUrl.href.replace(/\/$/, '') + '/';
const originalBase = 'https://heimhafen.github.io/Family-Spots-Map-V5/';
const originalRepo = 'HeimHafen/Family-Spots-Map-V5';

for (const file of [
  'index.html', 'en/index.html', 'da/index.html',
  'robots.txt', 'sitemap.xml', 'release-info.json',
  'tools/check-hosting.mjs', 'tools/check-project.mjs', 'tools/check-v5-scope.mjs',
]) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replaceAll(originalBase, base).replaceAll(originalRepo, repository);
  if (original !== updated) writeFileSync(file, updated);
}
