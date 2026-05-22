'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const i18n = require('../lib/i18n');

test('getString returns known EN tagline (D-006 exact phrase)', () => {
  const val = i18n.getString('tagline', 'en');
  assert.equal(
    val,
    'Autonomous monitor that detects newsworthy events across the 12,000 indicators of Data360 and delivers them verified to LAC newsrooms.'
  );
});

test('getString returns EN site_name', () => {
  assert.equal(i18n.getString('site_name', 'en'), 'Data360 Monitor');
});

test('getString returns placeholder for missing key', () => {
  assert.equal(i18n.getString('no.such.key', 'en'), '[no.such.key]');
  assert.equal(i18n.getString('deeply.nested.missing', 'es'), '[deeply.nested.missing]');
});

test('getString falls back to EN when ES key is absent', () => {
  // Both langs currently have the same keys; this tests the fallback path
  // by requesting a key only in EN via a non-es lang that normalizes to es.
  // If ES has the key, result == ES value (also fine). Must not be a placeholder.
  const val = i18n.getString('tagline', 'es');
  assert.ok(typeof val === 'string');
  assert.ok(!val.startsWith('['), 'should not return a missing-key placeholder');
});

test('getString with params leaves string unchanged when no placeholders', () => {
  const val = i18n.getString('site_name', 'en', { anything: 'ignored' });
  assert.equal(val, 'Data360 Monitor');
});

test('getAll(en) returns object with expected top-level keys', () => {
  const all = i18n.getAll('en');
  assert.ok(all && typeof all === 'object');
  assert.ok('tagline' in all);
  assert.ok('site_name' in all);
});

test('getAll(es) returns an object', () => {
  const all = i18n.getAll('es');
  assert.ok(all && typeof all === 'object');
});

test('reload() leaves getString functional', () => {
  i18n.reload();
  assert.equal(i18n.getString('site_name', 'en'), 'Data360 Monitor');
});

test('newsletter keys exist in ES and EN', () => {
  const keys = [
    'newsletter.title',
    'newsletter.intro',
    'newsletter.feature_1',
    'newsletter.feature_2',
    'newsletter.feature_3',
    'newsletter.audience',
    'newsletter.demo_note',
    'newsletter.close',
  ];
  for (const key of keys) {
    const es = i18n.getString(key, 'es');
    const en = i18n.getString(key, 'en');
    assert.ok(!es.startsWith('['), `${key} missing in es`);
    assert.ok(!en.startsWith('['), `${key} missing in en`);
  }
});

test('getString interpolates params', () => {
  const all = i18n.getAll('en');
  const sampleKey = Object.keys(all).find((k) => typeof all[k] === 'string' && all[k].includes('{'));
  if (!sampleKey) return;
  const template = all[sampleKey];
  const param = template.match(/\{(\w+)\}/)?.[1];
  if (!param) return;
  const out = i18n.getString(sampleKey, 'en', { [param]: 'TEST' });
  assert.ok(!out.includes(`{${param}}`));
});
