'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  annotateClaimToken,
  annotateNoticiaClaims,
  PCN_STATUS,
} = require('../lib/pcn-annotate');

test('annotateClaimToken rejects orphan claim_id', () => {
  const token = annotateClaimToken(
    { claim_id: 'orphan123', value: '5' },
    { contextClaimIds: new Set(['abc']), claimMap: new Map() },
  );
  assert.equal(token.pcn_status, PCN_STATUS.REJECTED);
  assert.match(token.pcn_reason, /not in allowed context/i);
});

test('annotateNoticiaClaims sets quality_status incomplete when claims rejected', () => {
  const candidates = [{
    country: 'ARG',
    claim_id: 'good',
    observation: { time_period: '2024', unit_measure: '%' },
  }];
  const noticia = annotateNoticiaClaims({
    claim_tokens: [
      { claim_id: 'good', value: '1' },
      { claim_id: 'orphan', value: '2' },
    ],
  }, new Set(['good']), candidates, 'WB_WDI_FP_CPI_TOTL_ZG');

  assert.equal(noticia.claim_tokens[1].pcn_status, PCN_STATUS.REJECTED);
  assert.equal(noticia.quality_status, 'incomplete');
  assert.ok(noticia.quality_tags.includes('orphan_claim'));
});

test('buildClaimMapFromCandidates prefers unit_measure over display unit', () => {
  const { buildClaimMapFromCandidates } = require('../lib/pcn-annotate');
  const { buildCandidate } = require('../lib/analysis/candidate-builder');
  const { computeClaimId, claimInputFromObservation } = require('../lib/pcn-claims');
  const detection = {
    type: 'anomaly',
    indicator: 'FAO_CP_23014',
    country: 'ARG',
    z_score: 2.1,
    observation: {
      time_period: '2025-09-01',
      value: '27.263038',
      unit_measure: 'PC_A',
    },
    previous: null,
    history: [],
  };
  const cand = buildCandidate(detection, 1);
  const map = buildClaimMapFromCandidates([{ ...cand, country: 'ARG' }], 'FAO_CP_23014');
  const claimId = cand.detection_meta.claim_id;
  const meta = map.get(claimId);
  assert.equal(meta.unit_measure, 'PC_A');
  assert.equal(claimId, computeClaimId(claimInputFromObservation(detection.observation, {
    database_id: 'FAO_CP',
    indicator: 'FAO_CP_23014',
    country: 'ARG',
  })));
});
