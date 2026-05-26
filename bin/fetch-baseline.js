#!/usr/bin/env node
'use strict';

/**
 * Fetch Tier 2 annual context indicators for the 5 LAC countries.
 *
 * Output layout:
 *
 *   data/
 *     context/{COUNTRY}/annual.csv      One row per (indicator, year)
 *     indicators/{INDICATOR}.md         Metadata document per indicator
 *
 * The country folder pattern leaves room for future tiers:
 *
 *   data/context/{COUNTRY}/pulse.csv    Tier 1 sub-annual indicators (later)
 *   data/context/{COUNTRY}/forecast.csv Tier 3 IMF/WB outlook (later)
 *
 * Run:
 *   node bin/fetch-context.js
 */

const fs = require('fs');
const path = require('path');
const { getMetadata, getData } = require('../lib/data360-client');
const { rowsToCsv } = require('../lib/csv');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTEXT_DIR = path.join(REPO_ROOT, 'data', 'context');
const INDICATORS_DIR = path.join(REPO_ROOT, 'data', 'indicators');

const COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

// (databaseId, indicator, label, expectedSex, expectedCompBreakdown1)
const TIER2 = [
  ['WB_WDI', 'WB_WDI_NY_GDP_PCAP_CD',       'GDP per capita, current USD',             '_T', null],
  ['WB_WDI', 'WB_WDI_NY_GDP_MKTP_KD_ZG',    'GDP growth, annual %',                    '_T', null],
  ['WB_WDI', 'WB_WDI_FP_CPI_TOTL_ZG',       'Inflation, CPI annual %',                 '_T', null],
  ['WB_WDI', 'WB_WDI_BX_KLT_DINV_WD_GD_ZS', 'FDI net inflows, % of GDP',               '_T', null],
  ['WB_WDI', 'WB_WDI_BN_CAB_XOKA_GD_ZS',    'Current account balance, % of GDP',       '_T', null],
  ['WB_CCDFS', 'WB_CCDFS_GGDY',             'General government gross debt, % of GDP', '_T', null],
  ['WB_WDI', 'WB_WDI_GC_XPN_INTP_RV_ZS',    'Interest payments, % of revenue',         '_T', null],
  ['WB_WDI', 'WB_WDI_SI_POV_GINI',          'Gini index',                              '_T', null],
  ['WB_WDI', 'WB_WDI_SI_POV_DDAY',          'Poverty headcount at $2.15/day',          '_T', null],
  ['WB_WDI', 'WB_WDI_SE_SEC_ENRR',          'Secondary enrolment, gross %',            '_T', null],
  ['WB_WDI', 'WB_WDI_SH_STA_MMRT',          'Maternal mortality ratio',                '_T', null],
  ['WB_WDI', 'WB_WDI_SH_DYN_MORT',          'Under-five mortality',                    '_T', null],
  ['WB_WDI', 'WB_WDI_SL_TLF_CACT_FE_ZS',    'Female labour force participation, 15+',  'F',  null],
  ['WB_WDI', 'WB_WDI_SL_UEM_TOTL_ZS',       'Unemployment, total %',                   '_T', null],
  ['WB_WGI', 'GOV_WGI_GE',                  'Government effectiveness',                '_Z', 'WGI_EST'],
  ['WB_WGI', 'GOV_WGI_CC',                  'Control of corruption',                   '_Z', 'WGI_EST'],
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
  if (sex !== null && sex !== undefined && sex !== expectedSex) return false;
  if (age !== null && age !== undefined && age !== '_T' && age !== '_Z') return false;
  if (urb !== null && urb !== undefined && urb !== '_T' && urb !== '_Z') return false;
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
  parts.push(`- **dataset on Data360**: ${require('../lib/data360-urls').datasetSearchUrl(db)}`);
  parts.push('');
  if (sd.definition_long) {
    parts.push('## Definition');
    parts.push('');
    parts.push(sd.definition_long.trim());
    parts.push('');
  }
  if (sd.methodology) {
    parts.push('## Methodology');
    parts.push('');
    parts.push(sd.methodology.trim());
    parts.push('');
  }
  if (sources.length > 0) {
    parts.push('## Sources');
    parts.push('');
    for (const s of sources) {
      const name = s.name || s.organization || 'source';
      const uri = s.uri ? ` (${s.uri})` : '';
      parts.push(`- ${name}${uri}`);
    }
    parts.push('');
  }
  if (topics.length > 0) {
    parts.push('## Topics');
    parts.push('');
    for (const t of topics) {
      const vocab = t.vocabulary ? ` _(${t.vocabulary})_` : '';
      parts.push(`- ${t.name}${vocab}`);
    }
    parts.push('');
  }
  return parts.join('\n');
}

async function fetchOneIndicator(country, db, idno, label, expectedSex, expectedCb1) {
  const data = await getData(db, idno, country);
  const observations = (data.value || [])
    .filter((o) => isAcceptable(o, expectedSex, expectedCb1))
    .map((o) => ({
      indicator: idno,
      time_period: (o.TIME_PERIOD || '').slice(0, 10),
      value: o.OBS_VALUE,
      unit_measure: o.UNIT_MEASURE || '',
    }))
    .filter((r) => r.value !== null && r.value !== undefined && r.value !== '')
    .sort((a, b) => a.time_period.localeCompare(b.time_period));
  return observations;
}

async function fetchAndCacheMetadata(idno, db, label) {
  const out = path.join(INDICATORS_DIR, `${idno}.md`);
  if (fs.existsSync(out)) return;
  const md = await getMetadata(idno);
  const sd = (md.value && md.value[0] && md.value[0].series_description) || {};
  const markdown = metaToMarkdown(idno, db, label, sd);
  fs.writeFileSync(out, markdown, 'utf8');
}

async function main() {
  ensureDir(CONTEXT_DIR);
  ensureDir(INDICATORS_DIR);

  // First pass: cache metadata once per indicator (shared across countries)
  for (const [db, idno, label] of TIER2) {
    process.stdout.write(`metadata ${idno} ... `);
    await fetchAndCacheMetadata(idno, db, label);
    process.stdout.write('ok\n');
  }

  // Second pass: per country, fetch and write annual.csv
  for (const country of COUNTRIES) {
    const dir = path.join(CONTEXT_DIR, country);
    ensureDir(dir);
    const rows = [];
    for (const [db, idno, label, expSex, expCb1] of TIER2) {
      process.stdout.write(`[${country}] ${idno} ... `);
      const obs = await fetchOneIndicator(country, db, idno, label, expSex, expCb1);
      process.stdout.write(`${obs.length} obs\n`);
      rows.push(...obs);
    }
    const csv = rowsToCsv(['indicator', 'time_period', 'value', 'unit_measure'], rows);
    const outPath = path.join(dir, 'annual.csv');
    fs.writeFileSync(outPath, csv, 'utf8');
    process.stdout.write(`[${country}] wrote ${outPath} (${rows.length} rows)\n\n`);
  }
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
