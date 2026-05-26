'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

function lum(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg, bg) {
  const hi = Math.max(lum(fg), lum(bg));
  const lo = Math.min(lum(fg), lum(bg));
  return (hi + 0.05) / (lo + 0.05);
}

function parseTokens(css) {
  const tokens = {};
  for (const line of css.split('\n')) {
    const m = line.match(/^\s*(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/);
    if (m) tokens[m[1]] = m[2];
  }
  return tokens;
}

const css = fs.readFileSync(path.join(__dirname, '../static/css/tokens.css'), 'utf8');
const t = parseTokens(css);

test('text tokens meet WCAG 2.1 AA 4.5:1 on white and bg-alt', () => {
  const textKeys = ['--fg', '--fg-bold', '--fg-light', '--brand-red', '--brand-red-deep', '--ok', '--warn'];
  for (const key of textKeys) {
    assert.ok(t[key], `missing ${key}`);
    assert.ok(contrastRatio(t[key], t['--bg']) >= 4.5, `${key} on --bg`);
    assert.ok(contrastRatio(t[key], t['--bg-alt']) >= 4.5, `${key} on --bg-alt`);
  }
});

test('border tokens meet WCAG 2.1 AA 3:1 non-text contrast on white', () => {
  for (const key of ['--border', '--border-strong']) {
    assert.ok(contrastRatio(t[key], t['--bg']) >= 3, `${key} on --bg`);
  }
});

test('white text on brand red meets 4.5:1', () => {
  assert.ok(contrastRatio('#ffffff', t['--brand-red']) >= 4.5);
});
