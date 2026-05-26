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
