'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderSparklineSvg } = require('../lib/sparkline');

test('renderSparklineSvg returns svg polyline', () => {
  const svg = renderSparklineSvg([
    { value: 1 },
    { value: 3 },
    { value: 2 },
  ]);
  assert.match(svg, /^<svg class="d360-sparkline"/);
  assert.match(svg, /polyline/);
});

test('renderSparklineSvg empty for no data', () => {
  assert.equal(renderSparklineSvg([]), '');
});
