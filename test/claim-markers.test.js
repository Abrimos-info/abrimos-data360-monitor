'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeClaimMarkerText,
  findClaimToken,
  markerDisplayText,
  claimValuesMatch,
} = require('../lib/claim-markers');
const { renderClaimMarkers } = require('../lib/alert-display');

test('normalizeClaimMarkerText collapses whitespace inside markers', () => {
  const raw = 'valor {{claim:c48\n14279bf879a62|0,559\n101}} fin';
  const out = normalizeClaimMarkerText(raw);
  assert.equal(out, 'valor {{claim:c4814279bf879a62|0,559101}} fin');
});

test('findClaimToken disambiguates duplicate claim_id by fallback value', () => {
  const tokens = [
    { claim_id: 'abc', value: '0.559101', pcn_status: 'rejected' },
    { claim_id: 'abc', value: '0.591142', pcn_status: 'rejected' },
  ];
  assert.equal(findClaimToken(tokens, 'abc', '0.559').value, '0.559101');
  assert.equal(findClaimToken(tokens, 'abc', '0.591').value, '0.591142');
});

test('markerDisplayText prefers marker fallback over token display', () => {
  const token = { claim_id: 'abc', value: '0.559101', display_es: '0,56' };
  assert.equal(markerDisplayText('0,591', token, 'es'), '0,591');
});

test('renderClaimMarkers resolves each marker value independently', () => {
  const alert = {
    claim_tokens: [
      { claim_id: 'abc', value: '0.559101', display_es: '0,56' },
      { claim_id: 'abc', value: '0.591142', display_es: '0,56' },
    ],
  };
  const text = 'de {{claim:abc|0,559}} respecto al {{claim:abc|0,591}} de 2024';
  const out = renderClaimMarkers(text, alert, 'es');
  assert.match(out, /0,559/);
  assert.match(out, /0,591/);
  assert.doesNotMatch(out, /\{\{claim:/);
});

test('claimValuesMatch accepts locale decimal variants', () => {
  assert.equal(claimValuesMatch('0,559101', '0.559101'), true);
  assert.equal(claimValuesMatch('5,4 %', '5.4'), true);
});
