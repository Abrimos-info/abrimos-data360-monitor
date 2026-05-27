'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { themesForIndicatorOrFallback } = require('../lib/news-themes');
const { buildPipelineSummary } = require('../lib/pipeline-summary');

test('themesForIndicatorOrFallback maps poverty idnos', () => {
  const themes = themesForIndicatorOrFallback('WB_PIP_NPOOR_IPL');
  assert.ok(themes.includes('POVERTY'));
});

test('themesForIndicatorOrFallback maps governance idnos', () => {
  const themes = themesForIndicatorOrFallback('RWB_PFI_OVRL');
  assert.ok(themes.includes('CORRUPTION'));
});

test('buildPipelineSummary returns shape from alerts store', () => {
  const summary = buildPipelineSummary();
  assert.ok(summary.noticias);
  assert.ok(typeof summary.noticias.total === 'number');
  assert.ok(typeof summary.reportajes.total === 'number');
});
