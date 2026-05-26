#!/usr/bin/env node
'use strict';

/**
 * Fetch Tier 3 forecast indicators (IMF World Economic Outlook and World Bank Macro Poverty Outlook).
 *
 * Output layout (D-024):
 *
 *   data/context/{COUNTRY}/forecast.csv   One row per (indicator, period)
 *   data/indicators/{INDICATOR}.md        Metadata document per indicator
 *
 * Watchlist mirrors the headline IMF WEO concepts plus two WB MPO poverty projections,
 * all with confirmed LAC=5/5 coverage and forecast horizon to 2029-2031.
 *
 * Run:
 *   node bin/fetch-forecast.js
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
const TIER3 = [
  ['IMF_WEO', 'IMF_WEO_NGDP_RPCH', 'GDP growth, constant prices, percent change', '_T', null],
  ['IMF_WEO', 'IMF_WEO_PCPIPCH', 'Inflation, average consumer prices, percent change', '_T', null],
  ['IMF_WEO', 'IMF_WEO_LUR', 'Unemployment rate, percent of total labor force', '_T', null],
  ['IMF_WEO', 'IMF_WEO_GGXWDG_NGDP', 'General government gross debt, percent of GDP', '_T', null],
  ['IMF_WEO', 'IMF_WEO_BCA_NGDPD', 'Current account balance, percent of GDP', '_T', null],
  ['IMF_WEO', 'IMF_WEO_GGXONLB_NGDP', 'Primary fiscal balance, percent of GDP', '_T', null],
  ['IMF_WEO', 'IMF_WEO_NGDPDPC', 'GDP per capita, current USD', '_T', null],
  ['WB_MPO', 'WB_MPO_POV1', 'International poverty rate, percent of population', '_T', null],
  ['WB_MPO', 'WB_MPO_POV2', 'Lower middle-income poverty rate, percent of population', '_T', null],
];

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

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
  const parts = [];
  parts.push(`# ${sd.name || label}`); parts.push(''); parts.push(`> ${label}`); parts.push('');
  parts.push('## Identification'); parts.push('');
  parts.push(`- **idno**: \`${idno}\``);
  parts.push(`- **database_id**: \`${db}\``);
  parts.push(`- **database**: ${sd.database_name || db}`);
  if (sd.periodicity) parts.push(`- **periodicity**: ${sd.periodicity}`);
  if (sd.measurement_unit) parts.push(`- **unit**: ${sd.measurement_unit}`);
  parts.push('');
  parts.push('## License'); parts.push('');
  parts.push(`- **name**: ${license.name || 'unspecified'}`);
  if (license.uri) parts.push(`- **uri**: ${license.uri}`);
  parts.push('');
  parts.push('## Links'); parts.push('');
  if (sd.csv_link) parts.push(`- **csv**: ${sd.csv_link}`);
  if (sd.json_link) parts.push(`- **json metadata**: ${sd.json_link}`);
  parts.push(`- **dataset on Data360**: ${require('../lib/data360-urls').datasetSearchUrl(db)}`);
  parts.push('');
  if (sd.definition_long) { parts.push('## Definition'); parts.push(''); parts.push(sd.definition_long.trim()); parts.push(''); }
  if (sd.methodology) { parts.push('## Methodology'); parts.push(''); parts.push(sd.methodology.trim()); parts.push(''); }
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
  for (const [db, idno, label] of TIER3) {
    process.stdout.write(`metadata ${idno} ... `);
    try { await fetchAndCacheMetadata(idno, db, label); process.stdout.write('ok\n'); }
    catch (e) { process.stdout.write(`fail: ${e.message.slice(0, 100)}\n`); }
  }
  for (const country of COUNTRIES) {
    const dir = path.join(CONTEXT_DIR, country);
    ensureDir(dir);
    const rows = [];
    for (const [db, idno, , expSex, expCb1] of TIER3) {
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
    const outPath = path.join(dir, 'forecast.csv');
    fs.writeFileSync(outPath, csv, 'utf8');
    process.stdout.write(`[${country}] wrote ${outPath} (${rows.length} rows)\n\n`);
  }
}

main().catch((e) => { process.stderr.write(`Error: ${e.message}\n`); process.exit(1); });
