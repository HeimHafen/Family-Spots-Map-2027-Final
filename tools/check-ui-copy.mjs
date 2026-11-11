// Protect the public Plus copy from promises that contradict owner-only mode.
// This runs in CI; no external services or browser access required.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const pages = ['index.html', 'en/index.html', 'da/index.html'];
const labels = {
  de: 'Zugangscode eingeben:',
  en: 'Enter an access code:',
  da: 'Indtast adgangskode:'
};
const status = {
  de: 'Spots Plus ist derzeit nicht freigeschaltet.',
  en: 'Spots Plus is not currently unlocked.',
  da: 'Spots Plus er ikke aktiveret.'
};
const notes = {
  de: 'Derzeit sind Zusatzfunktionen nur über einen Entwicklerzugang freigeschaltet.',
  en: 'Extra features are currently available only with a developer access code.',
  da: 'Ekstra funktioner er i øjeblikket kun tilgængelige med en udvikleradgangskode.'
};
const invalidPromos = /90\s*(?:Tage|dage|days)|Gratis familietest|Kostenloser Familientest|Free family test|free for 90 days|Test- oder Partnercode eingeben|test or partner code|test- eller partnerkode/i;
for (const page of pages) {
  const html = read(page);
  assert.doesNotMatch(html, invalidPromos, `Old Plus promise in ${page}`);
  for (const lang of Object.keys(labels)) {
    assert.ok(html.includes(labels[lang]), `Missing ${lang} access label: ${page}`);
    assert.ok(html.includes(notes[lang]), `Missing ${lang} access conditions: ${page}`);
  }
  const lang = page === 'index.html' ? 'de' : page.slice(0, 2);
  assert.ok(html.includes(status[lang]), `Initial ${lang} Plus status absent: ${page}`);
}
for (const lang of Object.keys(labels)) {
  const dict = JSON.parse(read(`data/i18n/${lang}.json`));
  assert.equal(dict.plus_status_inactive, status[lang]);
  assert.ok(/code|Kode|Zugang/i.test(dict.plus_code_empty));
}
// The stored public access code list must remain owner-only.
const partners = JSON.parse(read('data/partners.json'));
assert.equal(partners.codes?.length, 1);
assert.equal(partners.codes[0].source, 'development_owner');
assert.ok(partners.codes[0].codeSha256 && !partners.codes[0].code);
console.log('Plus UI consistency passed: truthful DE/EN/DA messaging and owner-only access.');
