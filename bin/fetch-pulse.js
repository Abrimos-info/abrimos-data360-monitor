#!/usr/bin/env node
'use strict';

/**
 * Fetch Tier 1 pulse indicators (sub-annual, freshest available) for the 5 LAC countries.
 *
 * Output layout (D-024):
 *
 *   data/context/{COUNTRY}/pulse.csv   One row per (indicator, period)
 *   data/indicators/{INDICATOR}.md     Metadata document per indicator (shared with annual)
 *
 * Watchlist criteria for the demo:
 *   - 5 Monthly indicators with verified LAC coverage (FAO consumer prices and IPC food security).
 *   - 5 IMF_BOP Quarterly indicators selected for narrative density:
 *       * Total current and capital account balance (the headline external pulse)
 *       * Reserve assets (IIP, central bank reserves)
 *       * Portfolio investment net (capital flight signal)
 *       * Government debt securities held abroad (sovereign risk proxy)
 *       * Foreign-held equity stock (cross-country comparable)
 *
 * Run:
 *   node bin/fetch-pulse.js
 */

const fs = require('fs');
const path = require('path');
const { getMetadata, getData } = require('../lib/data360-client');
const { rowsToCsv } = require('../lib/csv');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTEXT_DIR = path.join(REPO_ROOT, 'data', 'context');
const INDICATORS_DIR = path.join(REPO_ROOT, 'data', 'indicators');

const COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

// [databaseId, indicator, label, expectedSex, expectedCompBreakdown1]
const TIER1 = [
  ['FAO_CP', 'FAO_CP_23012', 'Consumer Prices, General Indices', '_T', null],
  ['FAO_CP', 'FAO_CP_23013', 'Consumer Prices, Food Indices', '_T', null],
  ['FAO_CP', 'FAO_CP_23014', 'Food price inflation', '_T', null],
  ['IPC_IPC', 'IPC_IPC_PHASE', 'People in each phase of food insecurity classification', '_T', null],
  ['IPC_IPC', 'IPC_IPC_P3PLUS', 'People in Phase 3 food insecurity or above', '_T', null],
  ['IMF_BOP', 'IMF_BOP_BTCC_BP6', 'Total current and capital account balance', '_T', null],
  ['IMF_BOP', 'IMF_BOP_IR_BP6', 'Reserve assets (IIP)', '_T', null],
  ['IMF_BOP', 'IMF_BOP_BFP_BP6', 'Portfolio investment, net (BOP financial account)', '_T', null],
  ['IMF_BOP', 'IMF_BOP_IPDG_BP6', 'Government debt securities held by foreigners (IIP)', '_T', null],
  ['IMF_BOP', 'IMF_BOP_IPE_BP6', 'Foreign-held equity and investment fund shares (IIP)', '_T', null],
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isAcceptable(o, expectedSex, expectedCb1) {
  if (o.OBS_STATUS !== 'A') return false;
  const sex = o.SEX;
  const age = o.AGE;
  const urb = o.URBANISATION;
  const cb1 = o.COMP_BREAKDOWN_1;
  if (sex != null && sex !== expectedSex && sex !== '_T' && sex !== '_Z') return false;
  if (age != null && age !== '_T' && age !== '_Z') return false;
  if (urb != null && urb !== '_T' && urb !== '_Z') return false;
  if (expectedCb1 !== null && cb1 !== expectedCb1) return false;
  return true;
}

function metaToMarkdown(idno, db, label, sd) {
  const licenses = sd.license || [];
  const license = licenses[0] || {};
  const sources = sd.sources || [];
  const topics = sd.topics || [];
  const parts = [];
  parts.push(`# ${sd.name || label}`);
  parts.push('');
  parts.push(`> ${label}`);
  parts.push('');
  parts.push('## Identification');
  parts.push('');
  parts.push(`- **idno**: \`${idno}\``);
  parts.push(`- **database_id**: \`${db}\``);
  parts.push(`- **database**: ${sd.database_name || db}`);
  if (sd.periodicity) parts.push(`- **periodicity**: ${sd.periodicity}`);
  if (sd.measurement_unit) parts.push(`- **unit**: ${sd.measurement_unit}`);
  if (sd.confidentiality_status) parts.push(`- **confidentiality**: ${sd.confidentiality_status}`);
  parts.push('');
  parts.push('## License');
  parts.push('');
  parts.push(`- **name**: ${license.name || 'unspecified'}`);
  if (license.uri) parts.push(`- **uri**: ${license.uri}`);
  parts.push('');
  parts.push('## Links');
  parts.push('');
  if (sd.csv_link) parts.push(`- **csv**: ${sd.csv_link}`);
  if (sd.json_link) parts.push(`- **json metadata**: ${sd.json_link}`);
  if (sd.api_link) parts.push(`- **api template**: ${sd.api_link}`);
  parts.push(`- **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/${db}`);
  parts.push('');
  if (sd.definition_long) { parts.push('## Definition'); parts.push(''); parts.push(sd.definition_long.trim()); parts.push(''); }
  if (sd.methodology) { parts.push('## Methodology'); parts.push(''); parts.push(sd.methodology.trim()); parts.push(''); }
  if (sources.length > 0) {
    parts.push('## Sources'); parts.push('');
    for (const s of sources) {
      const name = s.name || s.organization || 'source';
      const uri = s.uri ? ` (${s.uri})` : '';
      parts.push(`- ${name}${uri}`);
    }
    parts.push('');
  }
  if (topics.length > 0) {
    parts.push('## Topics'); parts.push('');
    for (const t of topics) {
      const vocab = t.vocabulary ? ` _(${t.vocabulary})_` : '';
      parts.push(`- ${t.name}${vocab}`);
    }
    parts.push('');
  }
  return parts.join('\n');
}

async function fetchAndCacheMetadata(idno, db, label) {
  const out = path.join(INDICATORS_DIR, `${idno}.md`);
  if (fs.existsSync(out)) return;
  const md = await getMetadata(idno);
  const sd = (md.value && md.value[0] && md.value[0].series_description) || {};
  const markdown = metaToMarkdown(idno, db, label, sd);
  fs.writeFileSync(out, markdown, 'utf8');
}

async function fetchOneIndicator(country, db, idno, expectedSex, expectedCb1) {
  const data = await getData(db, idno, country, { top: 5000 });
  return (data.value || [])
    .filter((o) => isAcceptable(o, expectedSex, expectedCb1))
    .map((o) => ({
      indicator: idno,
      time_period: (o.TIME_PERIOD || '').slice(0, 10),
      value: o.OBS_VALUE,
      unit_measure: o.UNIT_MEASURE || '',
    }))
    .filter((r) => r.value !== null && r.value !== undefined && r.value !== '')
    .sort((a, b) => a.time_period.localeCompare(b.time_period));
}

async function main() {
  ensureDir(CONTEXT_DIR);
  ensureDir(INDICATORS_DIR);

  for (const [db, idno, label] of TIER1) {
    process.stdout.write(`metadata ${idno} ... `);
    try {
      await fetchAndCacheMetadata(idno, db, label);
      process.stdout.write('ok\n');
    } catch (e) {
      process.stdout.write(`fail: ${e.message.slice(0, 100)}\n`);
    }
  }

  for (const country of COUNTRIES) {
    const dir = path.join(CONTEXT_DIR, country);
    ensureDir(dir);
    const rows = [];
    for (const [db, idno, , expSex, expCb1] of TIER1) {
      process.stdout.write(`[${country}] ${idno} ... `);
      try {
        const obs = await fetchOneIndicator(country, db, idno, expSex, expCb1);
        process.stdout.write(`${obs.length} obs\n`);
        rows.push(...obs);
      } catch (e) {
        process.stdout.write(`fail: ${e.message.slice(0, 100)}\n`);
      }
    }
    const csv = rowsToCsv(['indicator', 'time_period', 'value', 'unit_measure'], rows);
    const outPath = path.join(dir, 'pulse.csv');
    fs.writeFileSync(outPath, csv, 'utf8');
    process.stdout.write(`[${country}] wrote ${outPath} (${rows.length} rows)\n\n`);
  }
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
