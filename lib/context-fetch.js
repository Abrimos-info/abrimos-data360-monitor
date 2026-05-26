'use strict';

const fs = require('fs');
const path = require('path');
const { getMetadata, getData, getCsv, dataDictUrl, metadataJsonUrl, getJson } = require('./data360-client');
const {
  csvSnapshotPath,
  metaSnapshotPath,
  loadEtag,
  saveEtag,
} = require('./freshness-cache');
const { COUNTRIES, getTierFile } = require('./watchlist');
const { rowsToCsv, parseCsv, mergeContextRows } = require('./csv');
const { datasetSearchUrl } = require('./data360-urls');

function isAcceptable(o, expectedSex, expectedCb1) {
  if (o.OBS_STATUS !== 'A') return false;
  const sex = o.SEX;
  const age = o.AGE;
  const urb = o.URBANISATION;
  const cb1 = o.COMP_BREAKDOWN_1;
  if (sex != null && sex !== expectedSex && sex !== '_T' && sex !== '_Z') return false;
  if (age != null && age !== '_T' && age !== '_Z') return false;
  if (urb != null && urb !== '_T' && urb !== '_Z') return false;
  if (expectedCb1 != null && cb1 !== expectedCb1) return false;
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
  parts.push(`- **dataset on Data360**: ${datasetSearchUrl(db)}`);
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

async function fetchAndCacheMetadata(indicatorsDir, idno, db, label, force) {
  const mdPath = path.join(indicatorsDir, `${idno}.md`);
  if (!force && fs.existsSync(mdPath)) return;

  const md = await getMetadata(idno);
  const record = md.value && md.value[0] ? md.value[0] : {};
  const sd = record.series_description || {};

  fs.mkdirSync(indicatorsDir, { recursive: true });
  fs.writeFileSync(mdPath, metaToMarkdown(idno, db, label, sd), 'utf8');
  return record;
}

async function downloadCsvSnapshot(snapshotsDir, entry, opts = {}) {
  const force = Boolean(opts.force);
  const getCsvFn = opts.getCsv || getCsv;
  const csvUrlFn = opts.csvUrl || require('./data360-client').csvUrl;
  const { database_id, idno, csv_url: urlOverride } = entry;
  const url = urlOverride || csvUrlFn(database_id, idno);
  const localPath = csvSnapshotPath(snapshotsDir, idno);
  const missingLocal = !fs.existsSync(localPath);
  const prev = (force || missingLocal) ? null : loadEtag(snapshotsDir, idno);
  const res = await getCsvFn(url, prev);

  if (res.status === 304 && !force && !missingLocal) {
    return { idno, downloaded: false, status: 304 };
  }
  if (res.status !== 200 || !res.body) {
    return { idno, downloaded: false, status: res.status, error: true };
  }

  fs.mkdirSync(snapshotsDir, { recursive: true });
  fs.writeFileSync(csvSnapshotPath(snapshotsDir, idno), res.body, 'utf8');

  if (res.etag) {
    saveEtag(snapshotsDir, idno, {
      etag: res.etag,
      lastModified: res.lastModified,
      probedAt: new Date().toISOString(),
      csv_url: url,
    });
  }

  return { idno, downloaded: true, status: 200, bytes: res.body.length };
}

/**
 * Download the data-dictionary CSV for an indicator if not already cached.
 * Saves to {snapshotsDir}/{idno}_DATADICT.csv
 */
async function downloadDataDict(snapshotsDir, entry) {
  const { database_id, idno } = entry;
  const destPath = path.join(snapshotsDir, `${idno}_DATADICT.csv`);
  if (fs.existsSync(destPath)) return { cached: true, path: destPath };

  const url = dataDictUrl(database_id, idno);
  const res = await getCsv(url);
  if (res.status === 200 && res.body) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
    fs.writeFileSync(destPath, res.body, 'utf8');
    return { cached: false, path: destPath, bytes: res.body.length };
  }
  return { cached: false, path: null, status: res.status };
}

/**
 * Download the metadata JSON blob for an indicator.
 * Saves to {snapshotsDir}/{idno}.meta.json
 */
async function downloadMetadataJson(snapshotsDir, entry) {
  const { database_id, idno } = entry;
  const destPath = path.join(snapshotsDir, `${idno}.meta.json`);
  if (fs.existsSync(destPath)) return { cached: true, path: destPath };

  const url = metadataJsonUrl(database_id, idno);
  const data = await getJson(url);
  if (data) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
    fs.writeFileSync(destPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return { cached: false, path: destPath };
  }
  return { cached: false, path: null };
}

async function saveMetaSnapshot(snapshotsDir, idno, db, label, force) {
  const out = metaSnapshotPath(snapshotsDir, idno);
  if (!force && fs.existsSync(out)) return;
  const md = await getMetadata(idno);
  fs.mkdirSync(snapshotsDir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(md.value?.[0] || {}, null, 2) + '\n', 'utf8');
}

async function fetchObservationsForCountry(country, entry) {
  const { database_id, idno, expectedSex, expectedCb1 } = entry;
  const data = await getData(database_id, idno, country, { top: 5000 });
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

async function refreshContextForIndicator(contextDir, entry) {
  const tierFile = getTierFile(entry.tier);
  const headers = ['indicator', 'time_period', 'value', 'unit_measure'];
  const summary = { idno: entry.idno, countries: 0, rows: 0 };

  for (const country of COUNTRIES) {
    const dir = path.join(contextDir, country);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, tierFile);

    let existing = { headers, rows: [] };
    if (fs.existsSync(filePath)) {
      existing = parseCsv(fs.readFileSync(filePath, 'utf8'));
    }

    const newRows = await fetchObservationsForCountry(country, entry);
    const merged = mergeContextRows(existing.rows, newRows, entry.idno);
    fs.writeFileSync(filePath, rowsToCsv(headers, merged), 'utf8');

    summary.countries++;
    summary.rows += newRows.length;
  }

  return summary;
}

async function refreshContextForIndicators(contextDir, indicatorsDir, snapshotsDir, entries, opts = {}) {
  const { forceMetadata = false } = opts;
  const results = [];

  for (const entry of entries) {
    process.stdout.write(`  context ${entry.idno} ... `);
    try {
      await fetchAndCacheMetadata(indicatorsDir, entry.idno, entry.database_id, entry.label, forceMetadata);
      await saveMetaSnapshot(snapshotsDir, entry.idno, entry.database_id, entry.label, forceMetadata);
      const summary = await refreshContextForIndicator(contextDir, entry);
      process.stdout.write(`${summary.rows} obs\n`);
      results.push({ idno: entry.idno, ok: true, ...summary });
    } catch (e) {
      process.stdout.write(`fail: ${e.message.slice(0, 80)}\n`);
      results.push({ idno: entry.idno, ok: false, error: e.message });
    }
  }

  return results;
}

module.exports = {
  isAcceptable,
  downloadCsvSnapshot,
  downloadDataDict,
  downloadMetadataJson,
  refreshContextForIndicators,
  fetchAndCacheMetadata,
};
