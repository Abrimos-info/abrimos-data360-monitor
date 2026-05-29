#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const ai = require('../lib/ai-client');
const { editionFile } = require('../lib/newsletter/editions');
const { alertsForDate, generateNewsletterEdition, saveEdition } = require('../lib/newsletter/generator');

const ALERTS_FILE = path.join(__dirname, '..', 'data', 'alerts.json');
const EDITION_SCOPE = 'lac';

function parseArgs(argv) {
  const args = { date: null, noLlm: false, effort: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--date' && argv[i + 1]) { args.date = argv[++i]; continue; }
    if (a.startsWith('--date=')) { args.date = a.slice('--date='.length); continue; }
    if (a === '--no-llm') { args.noLlm = true; continue; }
    if (a === '--effort' && argv[i + 1]) { args.effort = argv[++i]; continue; }
    if (a.startsWith('--effort=')) { args.effort = a.slice('--effort='.length); continue; }
  }
  return args;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const dateIso = opts.date || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    throw new Error(`Invalid --date ${dateIso} (expected YYYY-MM-DD)`);
  }
  const alerts = fs.existsSync(ALERTS_FILE)
    ? JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'))
    : [];
  const pool = alertsForDate(Array.isArray(alerts) ? alerts : [], dateIso);
  if (pool.length === 0) {
    const stalePath = editionFile(EDITION_SCOPE, dateIso);
    if (fs.existsSync(stalePath)) {
      fs.unlinkSync(stalePath);
      console.log(`[newsletter] removed stale edition ${stalePath}`);
    }
    console.log(`[newsletter] skip ${dateIso}: no noticias for this date`);
    return;
  }

  ai.resetTokenStats();
  ai.logAnalysisLlm('AI-NEWSLETTER');
  console.log(`[newsletter] generating LAC edition for ${dateIso} (${pool.length} noticia(s)) ...`);
  const edition = await generateNewsletterEdition({
    dateIso,
    alerts: Array.isArray(alerts) ? alerts : [],
    noLlm: opts.noLlm,
    effort: opts.effort,
  });
  const filepath = saveEdition(EDITION_SCOPE, dateIso, edition);
  console.log(`[newsletter] saved ${filepath}`);
  const stats = ai.getTokenStats();
  console.log(`[AI-COST-NEWSLETTER] calls: ${stats.calls} | est: $${stats.cost.toFixed(4)}`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack || ''}\n`);
  process.exit(1);
});
