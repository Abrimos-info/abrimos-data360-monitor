#!/usr/bin/env node
'use strict';

require('dotenv').config();

const path = require('path');
const { spawnSync } = require('child_process');
const ai = require('../lib/ai-client');

const ROOT = path.resolve(__dirname, '..');
const force = process.argv.includes('--force');

function run(label, cmd, args) {
  console.log(`[pipeline:dynamic] ${label} ...`);
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  ai.logAnalysisLlm('pipeline:dynamic');
  console.log(`[pipeline:dynamic] starting${force ? ' (force refresh)' : ''} ...`);

  run('discover', process.execPath, [path.join(ROOT, 'bin', 'discover-indicators.js')]);

  const fetchArgs = ['--watchlist-file', 'data/dynamic-watchlist.json'];
  if (force) fetchArgs.unshift('--force');
  run('fetch', process.execPath, [path.join(ROOT, 'bin', 'fetch-data.js'), ...fetchArgs]);

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run('fetch:news:dynamic', npm, ['run', 'fetch:news:dynamic']);
  run('analyze:dynamic', npm, ['run', 'analyze:dynamic']);

  console.log('[pipeline:dynamic] finished');
}

main();
