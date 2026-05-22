'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  loadFreshnessReport,
  buildFreshnessPreset,
  formatIndicatorLine,
  buildCatalogBlock,
} = require('../lib/chat/freshness-preset');

describe('freshness preset', () => {
  it('loads freshness report from disk', () => {
    const report = loadFreshnessReport();
    assert.ok(Array.isArray(report.indicators));
  });

  it('formatIndicatorLine uses special @ prefix', () => {
    const line = formatIndicatorLine({
      idno: 'FAO_CP_23012',
      database_id: 'FAO_CP',
      tier: 'pulse',
      label: 'Consumer Prices',
      last_modified: 'Tue, 13 Jan 2026 07:15:31 GMT',
    }, 'es');
    assert.match(line, /^@FAO_CP_23012\|FAO_CP\|pulse\|/);
  });

  it('buildCatalogBlock includes header', () => {
    const block = buildCatalogBlock([{
      idno: 'X',
      database_id: 'DB',
      tier: 'annual',
      label: 'Test',
      last_modified: null,
    }], 'es', 5);
    assert.match(block, /^\/indicadores-actualizados/);
  });

  it('buildFreshnessPreset includes catalog block', () => {
    const preset = buildFreshnessPreset('es');
    assert.equal(preset.id, 'freshness_updated');
    assert.equal(preset.default, false);
    assert.ok(preset.prompt_es.includes('/indicadores-actualizados'));
    assert.ok(preset.prompt_es.includes('gráfica'));
  });
});
