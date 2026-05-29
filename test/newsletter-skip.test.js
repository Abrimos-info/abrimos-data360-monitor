'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { alertsForDate } = require('../lib/newsletter/generator');
const { editionFile } = require('../lib/newsletter/editions');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'generate-newsletter.js');

test('alertsForDate excludes reportajes and other dates', () => {
  const alerts = [
    {
      content_type: 'noticia',
      detected_at: '2026-05-29T12:00:00.000Z',
      country: 'ARG',
    },
    {
      content_type: 'reportaje',
      detected_at: '2026-05-29T12:00:00.000Z',
      country: 'ARG',
    },
    {
      content_type: 'noticia',
      detected_at: '2026-05-28T12:00:00.000Z',
      country: 'MEX',
    },
    {
      content_type: 'noticia',
      detected_at: '2026-05-29T12:00:00.000Z',
      quality_status: 'rejected',
      country: 'ECU',
    },
  ];
  const pool = alertsForDate(alerts, '2026-05-29');
  assert.equal(pool.length, 1);
  assert.equal(pool[0].country, 'ARG');
});

test('generate-newsletter skips when pool is empty', () => {
  const dateIso = '2099-01-01';
  const editionPath = editionFile('lac', dateIso);
  fs.mkdirSync(path.dirname(editionPath), { recursive: true });
  fs.writeFileSync(editionPath, '{"edition":{"is_dry_day":true}}\n', 'utf8');

  const res = spawnSync(process.execPath, [BIN, `--date=${dateIso}`], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'test' },
  });

  assert.equal(res.status, 0, res.stderr || res.stdout);
  assert.match(res.stdout, /skip 2099-01-01: no noticias/);
  assert.match(res.stdout, /removed stale edition/);
  assert.equal(fs.existsSync(editionPath), false);
});
