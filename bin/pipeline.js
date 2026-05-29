#!/usr/bin/env node
'use strict';

require('dotenv').config();

const path = require('path');
const { spawnSync } = require('child_process');
const ai = require('../lib/ai-client');
const { printPipelineSummary } = require('../lib/pipeline-summary');
const { createTimer, startRunTimer } = require('../lib/timing');
const { stepLog } = require('../lib/pipe-log');

const ROOT = path.resolve(__dirname, '..');
const force = process.argv.includes('--force');

function run(label, cmd, args) {
  stepLog('pipeline', `${label} ...`);
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  startRunTimer('pipeline');
  const timer = createTimer('pipeline');
  ai.logAnalysisLlm('pipeline');
  stepLog('pipeline', `starting${force ? ' (force refresh)' : ''} ...`);

  run('discover', process.execPath, [path.join(ROOT, 'bin', 'discover-indicators.js')]);
  timer.lap('discover');

  const fetchArgs = ['--watchlist-file', 'data/dynamic-watchlist.json'];
  if (force) fetchArgs.unshift('--force');
  run('fetch', process.execPath, [path.join(ROOT, 'bin', 'fetch-data.js'), ...fetchArgs]);
  timer.lap('fetch');

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run('fetch:news', npm, ['run', 'fetch:news']);
  timer.lap('fetch-news');

  run('analyze', npm, ['run', 'analyze:changed']);
  timer.lap('analyze');

  run('newsletter', npm, ['run', 'generate:newsletter']);
  timer.lap('newsletter');

  printPipelineSummary('pipeline');
  timer.end('total');
  stepLog('pipeline', 'finished');
}

main();
