#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ALERTS_FILE = path.join(ROOT, 'data', 'alerts.json');
const ALERTS_DIR = path.join(ROOT, 'data', 'alerts');

function parseArgs(argv) {
  const args = {
    from: '2026-05-22',
    to: '2026-05-29',
    effort: process.env.CLAUDE_EFFORT || 'medium',
    skipFetch: false,
    noLlm: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from' && argv[i + 1]) { args.from = argv[++i]; continue; }
    if (a.startsWith('--from=')) { args.from = a.slice('--from='.length); continue; }
    if (a === '--to' && argv[i + 1]) { args.to = argv[++i]; continue; }
    if (a.startsWith('--to=')) { args.to = a.slice('--to='.length); continue; }
    if (a === '--effort' && argv[i + 1]) { args.effort = argv[++i]; continue; }
    if (a.startsWith('--effort=')) { args.effort = a.slice('--effort='.length); continue; }
    if (a === '--skip-fetch') { args.skipFetch = true; continue; }
    if (a === '--no-llm') { args.noLlm = true; continue; }
  }
  return args;
}

function dateRange(from, to) {
  const out = [];
  const start = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function backupAlerts() {
  const stamp = new Date().toISOString().slice(0, 10);
  if (fs.existsSync(ALERTS_FILE)) {
    const dest = path.join(ROOT, 'data', `alerts.backup-${stamp}.json`);
    fs.copyFileSync(ALERTS_FILE, dest);
    console.log(`[replay-daily] backup → ${dest}`);
  }
  if (fs.existsSync(ALERTS_DIR)) {
    const destDir = path.join(ROOT, 'data', `alerts.backup-${stamp}`);
    fs.cpSync(ALERTS_DIR, destDir, { recursive: true });
    console.log(`[replay-daily] backup → ${destDir}/`);
  }
}

function runNode(script, extraArgs = []) {
  const res = spawnSync(process.execPath, [path.join(ROOT, 'bin', script), ...extraArgs], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (res.status !== 0) process.exit(res.status || 1);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const dates = dateRange(opts.from, opts.to);
  console.log(`[replay-daily] ${dates.length} day(s): ${dates[0]} … ${dates[dates.length - 1]}`);
  backupAlerts();
  fs.writeFileSync(ALERTS_FILE, '[]', 'utf8');

  if (!opts.skipFetch) {
    runNode('discover-indicators.js');
    runNode('fetch-data.js', ['--watchlist-file', 'data/dynamic-watchlist.json']);
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const news = spawnSync(npm, ['run', 'fetch:news'], { cwd: ROOT, stdio: 'inherit', env: process.env });
    if (news.status !== 0) process.exit(news.status || 1);
  }

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const append = i > 0;
    const analysisArgs = [
      `--as-of=${date}`,
      ...(append ? ['--append'] : []),
      ...(opts.effort ? [`--effort=${opts.effort}`] : []),
      ...(opts.noLlm ? ['--no-llm'] : []),
    ];
    console.log(`[replay-daily] analyze ${date} ...`);
    runNode('generate-analysis.js', analysisArgs);
    console.log(`[replay-daily] newsletter ${date} ...`);
    runNode('generate-newsletter.js', [
      `--date=${date}`,
      ...(opts.effort ? [`--effort=${opts.effort}`] : []),
      ...(opts.noLlm ? ['--no-llm'] : []),
    ]);
  }
  console.log('[replay-daily] finished');
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
