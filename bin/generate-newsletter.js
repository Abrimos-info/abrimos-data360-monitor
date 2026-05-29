#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const ai = require('../lib/ai-client');
const { generateNewsletterEdition, saveEdition } = require('../lib/newsletter/generator');

const ALERTS_FILE = path.join(__dirname, '..', 'data', 'alerts.json');

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
  ai.resetTokenStats();
  ai.logAnalysisLlm('AI-NEWSLETTER');
  const alerts = fs.existsSync(ALERTS_FILE)
    ? JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'))
    : [];
  console.log(`[newsletter] generating LAC edition for ${dateIso} ...`);
  const edition = await generateNewsletterEdition({
    dateIso,
    alerts: Array.isArray(alerts) ? alerts : [],
    noLlm: opts.noLlm,
    effort: opts.effort,
  });
  const filepath = saveEdition('lac', dateIso, edition);
  console.log(`[newsletter] saved ${filepath}`);
  const stats = ai.getTokenStats();
  console.log(`[AI-COST-NEWSLETTER] calls: ${stats.calls} | est: $${stats.cost.toFixed(4)}`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack || ''}\n`);
  process.exit(1);
});
