'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadStaticCopy } = require('../lib/static-copy');

const COPY_DIR = path.join(__dirname, '..', 'config', 'copy');
const PAGES = ['metodologia', 'privacidad', 'terminos', 'uso'];

test('static copy files exist for ES and EN', () => {
  for (const page of PAGES) {
    for (const lang of ['es', 'en']) {
      const fp = path.join(COPY_DIR, `${page}.${lang}.json`);
      assert.ok(fs.existsSync(fp), `${fp} missing`);
    }
  }
});

test('loadStaticCopy returns structured content', () => {
  for (const page of PAGES) {
    const es = loadStaticCopy(page, 'es');
    const en = loadStaticCopy(page, 'en');
    assert.ok(es && es.title, `${page}.es title`);
    assert.ok(en && en.title, `${page}.en title`);
    assert.ok(Array.isArray(es.blocks) && es.blocks.length > 3, `${page}.es blocks`);
    assert.ok(Array.isArray(en.blocks) && en.blocks.length > 3, `${page}.en blocks`);
  }
});

test('metodologia includes Q validation tables', () => {
  const es = loadStaticCopy('metodologia', 'es');
  const tables = es.blocks.filter((b) => b.type === 'table');
  assert.ok(tables.length >= 2, 'expected Q1-Q7 and Q1-Q12 tables');
  assert.ok(es.blocks.some((b) => b.type === 'h2' && b.text.includes('Capa 1')));
});

test('privacidad includes rights and contact sections', () => {
  const es = loadStaticCopy('privacidad', 'es');
  const headings = es.blocks.filter((b) => b.type === 'h2').map((b) => b.text);
  assert.ok(headings.includes('Tus derechos'));
  assert.ok(headings.includes('Responsable'));
});

test('strings ES and EN share the same keys', () => {
  const es = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'strings.es.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'strings.en.json'), 'utf8'));
  const esKeys = Object.keys(es).sort();
  const enKeys = Object.keys(en).sort();
  assert.deepEqual(esKeys, enKeys, 'ES/EN key mismatch');
});
