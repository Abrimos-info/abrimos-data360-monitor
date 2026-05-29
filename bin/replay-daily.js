#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { computeNewsWindow } = require('../lib/news-window');
const { summarizeCountryNewsCoverage } = require('../lib/news-coverage');
const { DEFAULT_COUNTRIES } = require('../lib/news-fetch');
const { eligibleNoticiasForDay } = require('../lib/analysis/replay-mode');
const { createTimer, startRunTimer } = require('../lib/timing');
const { stepLog } = require('../lib/pipe-log');

const ROOT = path.join(__dirname, '..');
const ALERTS_FILE = path.join(ROOT, 'data', 'alerts.json');

function parseArgs(argv) {
  const args = {
    from: '2026-05-22',
    to: '2026-05-29',
    effort: process.env.CLAUDE_EFFORT || 'medium',
    skipFetch: false,
    skipNews: false,
    forceNews: false,
    noLlm: false,
    backfill: false,
    regenNewsletter: false,
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
    if (a === '--skip-news') { args.skipNews = true; continue; }
    if (a === '--force-news') { args.forceNews = true; args.skipNews = false; continue; }
    if (a === '--with-news') { args.forceNews = true; args.skipNews = false; continue; }
    if (a === '--no-llm') { args.noLlm = true; continue; }
    if (a === '--backfill') { args.backfill = true; continue; }
    if (a === '--regen-newsletter') { args.regenNewsletter = true; continue; }
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

function readAlertsAggregate() {
  if (!fs.existsSync(ALERTS_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function backupAlerts() {
  const stamp = new Date().toISOString().slice(0, 10);
  const ALERTS_DIR = path.join(ROOT, 'data', 'alerts');
  if (fs.existsSync(ALERTS_FILE)) {
    const dest = path.join(ROOT, 'data', `alerts.backup-${stamp}.json`);
    fs.copyFileSync(ALERTS_FILE, dest);
    stepLog('replay-daily', `backup → ${dest}`);
  }
  if (fs.existsSync(ALERTS_DIR)) {
    const destDir = path.join(ROOT, 'data', `alerts.backup-${stamp}`);
    fs.cpSync(ALERTS_DIR, destDir, { recursive: true });
    stepLog('replay-daily', `backup → ${destDir}/`);
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

function newsWindowForReplay(opts) {
  return computeNewsWindow({ from: opts.from, to: opts.to });
}

function newsAlreadyCovered(window) {
  const minAccepted = parseInt(process.env.NEWS_MIN_ACCEPTED_PER_COUNTRY || '8', 10);
  const coverage = summarizeCountryNewsCoverage(DEFAULT_COUNTRIES, {
    from: window.from,
    to: window.to,
    minAccepted,
  });
  return coverage.needsNews.length === 0;
}

function maybeFetchNews(opts) {
  if (opts.skipNews) {
    stepLog('replay-daily', 'skip news (--skip-news)');
    return;
  }
  const window = newsWindowForReplay(opts);
  if (!opts.forceNews && newsAlreadyCovered(window)) {
    stepLog('replay-daily', `skip news (pool covered ${window.from}→${window.to}; use --force-news to refresh)`);
    return;
  }
  stepLog('replay-daily', `fetch:news pool ${window.from}→${window.to} (≤5 Gemini + GDELT fallback) ...`);
  runNode('fetch-news.js', [
    '--no-preview',
    '--mode=pool',
    `--from=${window.from}`,
    `--to=${window.to}`,
    ...(opts.forceNews ? ['--no-skip-covered'] : ['--skip-covered']),
  ]);
}

function shouldSkipAnalyzeForDay(opts, date, alerts) {
  if (!opts.backfill) return false;
  const count = eligibleNoticiasForDay(alerts, date).length;
  return count > 0;
}

function shouldRunNewsletter(opts, date, alerts, analyzedThisDay) {
  if (analyzedThisDay) return true;
  if (opts.regenNewsletter) return true;
  if (opts.backfill) return false;
  return true;
}

async function main() {
  startRunTimer('replay-daily');
  const timer = createTimer('replay-daily');
  const opts = parseArgs(process.argv.slice(2));
  const dates = dateRange(opts.from, opts.to);
  const modeLabel = opts.backfill ? 'backfill' : 'replay';
  stepLog('replay-daily', `${modeLabel}: ${dates.length} day(s): ${dates[0]} … ${dates[dates.length - 1]}`);

  backupAlerts();
  if (!opts.backfill) {
    fs.writeFileSync(ALERTS_FILE, '[]', 'utf8');
  } else {
    const existing = readAlertsAggregate().length;
    stepLog('replay-daily', `keeping ${existing} alert(s) in aggregate (--backfill)`);
  }

  if (!opts.skipFetch && !opts.backfill) {
    runNode('discover-indicators.js');
    timer.lap('discover');
    runNode('fetch-data.js', ['--watchlist-file', 'data/dynamic-watchlist.json']);
    timer.lap('fetch');
    maybeFetchNews(opts);
    timer.lap('fetch-news');
  } else if (opts.backfill && !opts.skipFetch) {
    stepLog('replay-daily', 'skip fetch in backfill (use --skip-fetch explicitly or run discover/fetch separately)');
  }

  let alerts = readAlertsAggregate();

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const skipAnalyze = shouldSkipAnalyzeForDay(opts, date, alerts);
    let analyzedThisDay = false;

    if (skipAnalyze) {
      const count = eligibleNoticiasForDay(alerts, date).length;
      stepLog('replay-daily', `skip analyze ${date} (${count} noticia(s) already, ${i + 1}/${dates.length})`);
    } else {
      const analysisArgs = [
        `--as-of=${date}`,
        ...(opts.backfill || i > 0 ? ['--append'] : []),
        ...(opts.backfill ? ['--noticias-only'] : []),
        ...(opts.effort ? [`--effort=${opts.effort}`] : []),
        ...(opts.noLlm ? ['--no-llm'] : []),
      ];
      stepLog('replay-daily', `analyze ${date} (${i + 1}/${dates.length}) ...`);
      runNode('generate-analysis.js', analysisArgs);
      analyzedThisDay = true;
      alerts = readAlertsAggregate();
      timer.lap(`analyze:${date}`);
    }

    if (shouldRunNewsletter(opts, date, alerts, analyzedThisDay)) {
      stepLog('replay-daily', `newsletter ${date} (${i + 1}/${dates.length}) ...`);
      runNode('generate-newsletter.js', [
        `--date=${date}`,
        ...(opts.effort ? [`--effort=${opts.effort}`] : []),
        ...(opts.noLlm ? ['--no-llm'] : []),
      ]);
      timer.lap(`newsletter:${date}`);
    } else {
      stepLog('replay-daily', `skip newsletter ${date} (day already had noticias, ${i + 1}/${dates.length})`);
    }
  }

  if (opts.backfill && !opts.noLlm) {
    stepLog('replay-daily', 'reportajes (changed-only, append) ...');
    runNode('generate-analysis.js', [
      '--reportajes-only',
      '--append',
      '--changed-only',
      ...(opts.effort ? [`--effort=${opts.effort}`] : []),
    ]);
    timer.lap('reportajes');
  }

  timer.end('total');
  stepLog('replay-daily', 'finished');
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
