#!/usr/bin/env node
'use strict';

require('dotenv').config();

const ai = require('../lib/ai-client');
const { formatDuration } = require('../lib/timing');
const { runAnalysis } = require('../lib/analysis/runner');

function parseArgs(argv) {
  const args = {
    only: null,
    noLlm: false,
    noTranslate: false,
    phase: 'all',
    allTiers: false,
    changedOnly: process.env.ANALYSIS_CHANGED_ONLY === 'true',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only' && argv[i + 1]) { args.only = argv[++i]; continue; }
    if (a.startsWith('--only=')) { args.only = a.slice('--only='.length); continue; }
    if (a === '--no-llm') { args.noLlm = true; continue; }
    if (a === '--no-translate') { args.noTranslate = true; continue; }
    if (a === '--noticias-only') { args.phase = 'noticias'; continue; }
    if (a === '--reportajes-only') { args.phase = 'reportajes'; continue; }
    if (a === '--all-tiers') { args.allTiers = true; continue; }
    if (a === '--changed-only') { args.changedOnly = true; continue; }
  }
  return args;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  ai.resetTokenStats();
  const llmInfo = ai.logAnalysisLlm('AI-ANALYSIS');
  console.log('[analysis] starting pipeline ...', [
    opts.phase !== 'all' ? `(phase: ${opts.phase})` : '',
    opts.changedOnly ? '(changed-only)' : '',
  ].filter(Boolean).join(' '));
  const result = await runAnalysis({
    only: opts.only,
    noLlm: opts.noLlm,
    translate: !opts.noTranslate,
    phase: opts.phase,
    allTiers: opts.allTiers,
    changedOnly: opts.changedOnly,
    onProgress: ({ idno, count }) => console.log(`[analysis] ${idno}: ${count} candidate(s)`),
  });
  console.log(`[analysis] finished ${result.alertCount} noticias, ${result.reportajeCount} reportajes (${result.indicatorsSkipped || 0} skipped unchanged, ${result.abruptCount} abrupt, ${result.anomalyCount} anomaly candidates)`);
  const stats = ai.getTokenStats();
  const llmTime = formatDuration(stats.durationMs || 0);
  console.log(`[AI-COST-ANALYSIS] ${llmInfo.providerLabel} | ${llmInfo.model} | calls: ${stats.calls} | in: ${stats.inputTokens} | out: ${stats.outputTokens} | llm total: ${llmTime} | est: $${stats.cost.toFixed(4)}`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack || ''}\n`);
  process.exit(1);
});
