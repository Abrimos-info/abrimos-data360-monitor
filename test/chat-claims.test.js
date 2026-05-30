'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function loadPcnClaims() {
  const sandbox = {
    window: {},
    D360_STRINGS: { en: {}, es: {} },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../static/js/pcn-claims.js'), 'utf8'), sandbox);
  return sandbox.D360PcnClaims;
}

describe('chat claim rendering', () => {
  it('renderClaimMarkersHtml hydrates scoped claim markers for chat prose', () => {
    const pcn = loadPcnClaims();
    const alert = {
      claim_tokens: [{
        claim_id: 'adbc2def10343310',
        value: '1',
        pcn_status: 'verified',
        pcn_reason: 'Verified',
      }],
    };
    const html = pcn.renderClaimMarkersHtml(
      'Argentina scored {{claim:adbc2def10343310|1}} in 2024.',
      alert,
      'en',
    );
    assert.match(html, /d360-claim/);
    assert.match(html, /d360-vmark--verified/);
    assert.doesNotMatch(html, /\{\{claim:/);
  });
});
