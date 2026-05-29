#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const ai = require('../lib/ai-client');
const { clearCache } = require('../lib/pcn-verify');
const {
  runReportajes,
  syncReportajeClaimValues,
} = require('../lib/analysis/reportaje-runner');
const { annotateReportajeClaims } = require('../lib/pcn-annotate');

const REPO_ROOT = path.resolve(__dirname, '..');
const ALERTS_FILE = path.join(REPO_ROOT, 'data', 'alerts.json');
const ALERTS_DIR = path.join(REPO_ROOT, 'data', 'alerts');

function parseArgs(argv) {
  const args = {
    dataset: null,
    country: null,
    asOf: null,
    effort: null,
    syncOnly: false,
    append: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dataset' && argv[i + 1]) { args.dataset = argv[++i].toUpperCase(); continue; }
    if (a.startsWith('--dataset=')) { args.dataset = a.slice('--dataset='.length).toUpperCase(); continue; }
    if (a === '--country' && argv[i + 1]) { args.country = argv[++i].toUpperCase(); continue; }
    if (a.startsWith('--country=')) { args.country = a.slice('--country='.length).toUpperCase(); continue; }
    if (a === '--as-of' && argv[i + 1]) { args.asOf = argv[++i]; continue; }
    if (a.startsWith('--as-of=')) { args.asOf = a.slice('--as-of='.length); continue; }
    if (a === '--effort' && argv[i + 1]) { args.effort = argv[++i]; continue; }
    if (a.startsWith('--effort=')) { args.effort = a.slice('--effort='.length); continue; }
    if (a === '--sync-only') { args.syncOnly = true; continue; }
    if (a === '--append') { args.append = true; continue; }
    if (a === '--no-append') { args.append = false; continue; }
  }
  return args;
}

function readAlertsAggregate() {
  if (!fs.existsSync(ALERTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
}

function writeAlertsAggregate(alerts) {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf8');
}

function mergeReportaje(reportaje) {
  const incomingId = reportaje.id;
  const kept = readAlertsAggregate().filter(
    (a) => a.content_type !== 'reportaje' || a.id !== incomingId,
  );
  writeAlertsAggregate([...kept, reportaje]);
}

function sourceNoticias(all, dataset, country, idnos = null) {
  return all.filter((n) => {
    if (n.content_type !== 'noticia') return false;
    if (String(n.country || '').toUpperCase() !== country) return false;
    const ds = n.dataset_id || n.indicator?.database_id;
    if (ds !== dataset) return false;
    if (idnos && !idnos.includes(n.indicator?.idno)) return false;
    return true;
  });
}

function findReportaje(all, dataset, country) {
  return all.find((a) => {
    if (a.content_type !== 'reportaje') return false;
    if (String(a.country || '').toUpperCase() !== country) return false;
    return (a.dataset_id || '') === dataset;
  }) || null;
}

function summarizeClaims(item) {
  const tokens = item?.claim_tokens || [];
  const verified = tokens.filter((t) => t.pcn_status === 'verified').length;
  const rejected = tokens.filter((t) => t.pcn_status === 'rejected').length;
  return { verified, rejected, total: tokens.length, quality: item?.quality_status || 'unknown' };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dataset || !opts.country) {
    process.stderr.write('Usage: node bin/regenerate-reportaje.js --dataset=WB_MPO --country=ARG [--sync-only] [--as-of=YYYY-MM-DD] [--effort=medium]\n');
    process.exit(1);
  }

  const cacheKey = `${opts.dataset}_${opts.country}`;
  const cachePath = path.join(ALERTS_DIR, `reportaje_${cacheKey}.json`);
  const all = readAlertsAggregate();
  const noticias = sourceNoticias(all, opts.dataset, opts.country, null);

  console.log(`[regenerate-reportaje] ${opts.dataset} / ${opts.country}: ${noticias.length} source noticia(s)`);
  for (const n of noticias) {
    const s = summarizeClaims(n);
    console.log(`  - ${n.indicator?.idno}: quality=${s.quality}, claims ${s.verified}/${s.total} verified`);
  }

  if (opts.syncOnly) {
    clearCache();
    const reportaje = findReportaje(all, opts.dataset, opts.country);
    if (!reportaje) {
      process.stderr.write(`No reportaje found for ${opts.dataset} / ${opts.country}\n`);
      process.exit(1);
    }
    const contextClaimIds = new Set(
      noticias.flatMap((n) => (n.claim_tokens || []).map((t) => t.claim_id)).filter(Boolean),
    );
    syncReportajeClaimValues(reportaje, noticias);
    annotateReportajeClaims(reportaje, contextClaimIds, noticias);
    fs.mkdirSync(ALERTS_DIR, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(reportaje, null, 2) + '\n', 'utf8');
    if (opts.append) mergeReportaje(reportaje);
    const after = summarizeClaims(reportaje);
    console.log(`[regenerate-reportaje] sync-only done: quality=${after.quality}, claims ${after.verified}/${after.total} verified, ${after.rejected} rejected`);
    if (after.rejected) process.exit(2);
    return;
  }

  if (noticias.length < 2) {
    process.stderr.write(`Need at least 2 source noticias; found ${noticias.length}\n`);
    process.exit(1);
  }

  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

  ai.resetTokenStats();
  const reportajes = await runReportajes(noticias, {
    minNoticias: 2,
    changedOnly: false,
    asOf: opts.asOf,
    effort: opts.effort,
  });

  if (!reportajes.length) {
    process.stderr.write('Reportaje generation produced no output\n');
    process.exit(1);
  }

  const reportaje = reportajes[0];
  if (opts.append) mergeReportaje(reportaje);
  const after = summarizeClaims(reportaje);
  console.log(`[regenerate-reportaje] regenerated: quality=${after.quality}, claims ${after.verified}/${after.total} verified, ${after.rejected} rejected`);
  const stats = ai.getTokenStats();
  console.log(`[AI-COST] calls: ${stats.calls} | in: ${stats.inputTokens} | out: ${stats.outputTokens} | est: $${stats.cost.toFixed(4)}`);
  if (after.rejected) process.exit(2);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n${err.stack || ''}\n`);
  process.exit(1);
});
