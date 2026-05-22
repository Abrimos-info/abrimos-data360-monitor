#!/usr/bin/env node
'use strict';

require('dotenv').config({ override: true });

const ai = require('../lib/ai-client');
const { runAnalysis } = require('../lib/analysis/runner');

function parseArgs(argv) {
  const args = { only: null, noLlm: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only' && argv[i + 1]) { args.only = argv[++i]; continue; }
    if (a.startsWith('--only=')) { args.only = a.slice('--only='.length); continue; }
    if (a === '--no-llm') { args.noLlm = true; continue; }
  }
  return args;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  console.log('[analysis] starting pipeline ...');
  const result = await runAnalysis({
    only: opts.only,
    noLlm: opts.noLlm,
    onProgress: ({ idno, count }) => console.log(`[analysis] ${idno}: ${count} candidate(s)`),
  });
  console.log(`[analysis] finished ${result.alertCount} alerts (${result.abruptCount} abrupt, ${result.anomalyCount} anomaly candidates)`);
  const stats = ai.getTokenStats();
  console.log(`[AI-COST-ANALYSIS] total calls: ${stats.calls} | in: ${stats.inputTokens} | out: ${stats.outputTokens} | est: $${stats.cost.toFixed(4)}`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack || ''}\n`);
  process.exit(1);
});
