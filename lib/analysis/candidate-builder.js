'use strict';

/**
 * Build candidate alerts (everything in the schema except narratives + claim_tokens)
 * from detection output. The orchestrator passes these into the LLM, which only
 * adds bilingual narratives. Final alerts are merged here later.
 */

const { computeClaimId } = require('../pcn-claims');
const { loadIndicatorMetadata, loadIndicatorMetadataJson } = require('../data-loader');

const CATEGORY_RULES = [
  [/^WB_WDI_NY_GDP|^WB_WDI_FP_CPI|^WB_WDI_BX_KLT|^WB_WDI_BN_CAB|^WB_WDI_GC|^WB_CCDFS|^IMF_BOP|^IMF_WEO|^FAO_CP/, 'economy'],
  [/^WB_WDI_SH_/, 'health'],
  [/^WB_WDI_SE_/, 'education'],
  [/^WB_WDI_SI_POV|^WB_MPO_POV/, 'poverty'],
  [/^WB_WDI_SL_/, 'labor'],
  [/^GOV_WGI|^WB_WGI/, 'governance'],
  [/^IPC_IPC/, 'food_security'],
];

function categoryFor(idno) {
  for (const [pattern, cat] of CATEGORY_RULES) {
    if (pattern.test(idno)) return cat;
  }
  return 'economy';
}

function indicatorMetaFields(idno) {
  // Primary path: curated Markdown metadata (static watchlist)
  const md = loadIndicatorMetadata(idno);
  if (md) {
    const nameMatch = md.match(/^# (.+)$/m);
    const licenseMatch = md.match(/## License\s*\n\s*\n\s*- \*\*name\*\*:\s*(.+)/);
    const sourcesMatch = md.match(/## Sources[\s\S]*?\(?(https?:\/\/[^\s)]+)/i);
    const methodMatch = md.match(/## Methodology[\s\S]*?(https?:\/\/[^\s)]+)/);
    const methodologyRef = sourcesMatch ? sourcesMatch[1] : (methodMatch ? methodMatch[1] : null);
    return {
      name: nameMatch ? nameMatch[1].trim() : idno,
      license: licenseMatch ? licenseMatch[1].trim() : 'unspecified',
      methodologyRef,
    };
  }

  // Fallback path: downloaded metadata JSON (dynamic indicators from Task A1/A2 + B2)
  const meta = loadIndicatorMetadataJson(idno);
  if (meta) {
    const sd = meta.series_description || meta;
    return {
      name: sd.name || idno,
      license: (Array.isArray(sd.license) && sd.license[0] && sd.license[0].name) || 'CC BY-4.0',
      methodologyRef: (sd.methodology_references && sd.methodology_references[0] && sd.methodology_references[0].uri) || null,
    };
  }

  return { name: idno, license: 'unspecified', methodologyRef: null };
}

function databaseIdFor(idno) {
  if (idno.startsWith('GOV_WGI_')) return 'WB_WGI';
  if (idno.startsWith('WB_WDI_')) return 'WB_WDI';
  if (idno.startsWith('WB_CCDFS_')) return 'WB_CCDFS';
  if (idno.startsWith('WB_MPO_')) return 'WB_MPO';
  if (idno.startsWith('WB_IDS_')) return 'WB_IDS';
  if (idno.startsWith('IMF_BOP_')) return 'IMF_BOP';
  if (idno.startsWith('IMF_WEO_')) return 'IMF_WEO';
  if (idno.startsWith('FAO_CP_')) return 'FAO_CP';
  if (idno.startsWith('IPC_IPC_')) return 'IPC_IPC';
  return idno.split('_').slice(0, 2).join('_');
}

function unitDisplay(unitCode) {
  if (!unitCode) return '';
  const m = {
    PC_A: '%',
    PT: '%',
    USD: 'USD',
    PS: 'persons',
    XDC: 'local currency',
  };
  return m[unitCode] || unitCode;
}

function formatMagnitude(z, observation, previous) {
  const sign = z >= 0 ? '+' : '−';
  const absZ = Math.abs(z);
  return {
    es: `${sign}${absZ.toFixed(1)}σ`,
    en: `${sign}${absZ.toFixed(1)}σ`,
  };
}

function buildChartSeries(history, observation, regionalSnapshot = null) {
  if (!history || history.length === 0) return [];
  const series = history.map((p) => ({
    period: p.time_period,
    value: Number(p.value),
  }));
  const targetPeriod = observation.time_period;
  for (const point of series) {
    if (point.period === targetPeriod) point.is_change_point = true;
  }
  // Annotate the most recent point as the change point if not already.
  if (!series.some((p) => p.is_change_point) && series.length > 0) {
    series[series.length - 1].is_change_point = true;
  }
  return series;
}

function makeCandidateId(country, idno, period, type) {
  return `cand_${type}_${country}_${idno}_${period}`.replace(/[^A-Za-z0-9_]/g, '_');
}

function makeAlertId(type, country, idno, period, seq) {
  const datePart = new Date().toISOString().slice(0, 10);
  const seqStr = String(seq).padStart(3, '0');
  return `alert_${datePart}_${seqStr}`;
}

function buildCandidate(detection, sequence) {
  const idno = detection.indicator;
  const databaseId = databaseIdFor(idno);
  const meta = indicatorMetaFields(idno);
  const observation = detection.observation;
  const claimId = computeClaimId({
    database_id: databaseId,
    indicator: idno,
    country: detection.country,
    time_period: observation.time_period,
    unit_measure: observation.unit_measure,
  });
  const value = Number(observation.value);
  const candidateId = makeCandidateId(detection.country, idno, observation.time_period, detection.type);
  const alertId = makeAlertId(detection.type, detection.country, idno, observation.time_period, sequence);
  return {
    candidate_id: candidateId,
    alert: {
      id: alertId,
      type: detection.type,
      country: detection.country,
      category: categoryFor(idno),
      indicator: {
        idno,
        database_id: databaseId,
        name: { es: meta.name, en: meta.name },
      },
      observation: {
        value,
        time_period: observation.time_period,
        unit: unitDisplay(observation.unit_measure),
      },
      magnitude: formatMagnitude(detection.z_score, observation, detection.previous),
      chart_series: buildChartSeries(detection.history, observation, detection.regional_snapshot),
      verification_trace: {
        data360_dataset_url: `https://data360.worldbank.org/en/int/dataset/${databaseId}`,
        csv_link: `https://data360files.worldbank.org/data360-data/data/${databaseId}/${idno}.csv`,
        ...(meta.methodologyRef ? { methodology_ref: meta.methodologyRef } : {}),
      },
      score: Math.min(1, Math.max(0, Math.abs(detection.z_score) / 4)),
      detected_at: new Date().toISOString(),
      license: meta.license,
    },
    detection_meta: {
      z_score: detection.z_score,
      previous: detection.previous,
      baseline_mean: detection.baseline_mean,
      baseline_stddev: detection.baseline_stddev,
      regional_median: detection.regional_median,
      regional_snapshot: detection.regional_snapshot,
      claim_id: claimId,
    },
  };
}

module.exports = { buildCandidate, categoryFor, databaseIdFor, indicatorMetaFields };
