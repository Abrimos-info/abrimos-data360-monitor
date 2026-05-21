'use strict';

/**
 * Build a numbered omnibus markdown context for one indicator.
 *
 * The context bundles, in this order:
 *   1. Identification of the indicator
 *   2. Definition and methodology (from the cached indicator markdown)
 *   3. Per country: background narrative, this indicator's full series,
 *      and a snapshot of related indicators from the country baseline
 *   4. Cross-country comparison for the latest common period
 *   5. Detection rules in force
 *   6. Candidate alerts detected deterministically
 *
 * Every line is prefixed with `NNNN: ` so the LLM can cite by (section, line).
 */

const path = require('path');
const fs = require('fs');
const {
  loadIndicatorMetadata,
  loadCountryBackground,
  loadCountryNews,
  COUNTRIES,
} = require('../data-loader');

function indicatorDatabaseId(idno) {
  if (idno.startsWith('WB_WDI_')) return 'WB_WDI';
  if (idno.startsWith('WB_WGI_') || idno.startsWith('GOV_WGI_')) return 'WB_WGI';
  if (idno.startsWith('WB_CCDFS_')) return 'WB_CCDFS';
  if (idno.startsWith('WB_MPO_')) return 'WB_MPO';
  if (idno.startsWith('WB_IDS_')) return 'WB_IDS';
  if (idno.startsWith('IMF_BOP_')) return 'IMF_BOP';
  if (idno.startsWith('IMF_WEO_')) return 'IMF_WEO';
  if (idno.startsWith('IMF_IFS_')) return 'IMF_IFS';
  if (idno.startsWith('IMF_FSI_')) return 'IMF_FSI';
  if (idno.startsWith('IMF_IRFCL_')) return 'IMF_IRFCL';
  if (idno.startsWith('FAO_CP_')) return 'FAO_CP';
  if (idno.startsWith('IPC_IPC_')) return 'IPC_IPC';
  return idno.split('_').slice(0, 2).join('_');
}

function indicatorNameFromMetadata(md) {
  if (!md) return null;
  const m = md.match(/^# (.+)$/m);
  return m ? m[1].trim() : null;
}

function indicatorPeriodicityFromMetadata(md) {
  if (!md) return null;
  const m = md.match(/\*\*periodicity\*\*:\s*(.+)/i);
  return m ? m[1].trim() : null;
}

function buildContext({
  idno,
  seriesByCountry,
  baselineSeriesByCountry,
  candidates,
  detectionThresholds = { abrupt_z: 2, cross_z: 2 },
}) {
  const sections = [];
  const databaseId = indicatorDatabaseId(idno);
  const indicatorMd = loadIndicatorMetadata(idno) || '';
  const indicatorName = indicatorNameFromMetadata(indicatorMd) || idno;
  const periodicity = indicatorPeriodicityFromMetadata(indicatorMd) || 'unknown';

  sections.push({
    heading: '# CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR',
    lines: [],
  });

  sections.push({
    heading: '## Indicador',
    lines: [
      `- idno: ${idno}`,
      `- database_id: ${databaseId}`,
      `- nombre: ${indicatorName}`,
      `- periodicidad: ${periodicity}`,
      `- dataset URL: https://data360.worldbank.org/en/int/dataset/${databaseId}`,
      `- CSV bulk: https://data360files.worldbank.org/data360-data/data/${databaseId}/${idno}.csv`,
    ],
  });

  if (indicatorMd) {
    sections.push({
      heading: '## Definición y metodología',
      lines: indicatorMd.trim().split('\n'),
    });
  }

  const countryBlock = { heading: '## Países y trayectorias', lines: [] };
  for (const country of COUNTRIES) {
    countryBlock.lines.push(`### ${country}`);
    countryBlock.lines.push('');

    const background = loadCountryBackground(country);
    countryBlock.lines.push('#### Background del país');
    countryBlock.lines.push('');
    if (background) {
      for (const line of background.trim().split('\n')) countryBlock.lines.push(line);
    } else {
      countryBlock.lines.push('No disponible en el contexto proporcionado.');
    }
    countryBlock.lines.push('');

    const news = loadCountryNews(country);
    if (news) {
      countryBlock.lines.push('#### Titulares recientes');
      countryBlock.lines.push('');
      for (const line of news.trim().split('\n').slice(0, 40)) countryBlock.lines.push(line);
      countryBlock.lines.push('');
    }

    countryBlock.lines.push('#### Serie de este indicador');
    countryBlock.lines.push('');
    const series = (seriesByCountry[country] || []).slice().sort((a, b) =>
      a.time_period.localeCompare(b.time_period));
    if (series.length === 0) {
      countryBlock.lines.push('Sin observaciones para este indicador.');
    } else {
      countryBlock.lines.push('| period | value | unit |');
      countryBlock.lines.push('|--------|-------|------|');
      for (const obs of series.slice(-30)) {
        countryBlock.lines.push(`| ${obs.time_period} | ${obs.value} | ${obs.unit_measure} |`);
      }
    }
    countryBlock.lines.push('');

    const baseline = baselineSeriesByCountry[country] || {};
    const otherIdnos = Object.keys(baseline).filter((k) => k !== idno).slice(0, 12);
    if (otherIdnos.length > 0) {
      countryBlock.lines.push('#### Otros indicadores del país, valor más reciente disponible');
      countryBlock.lines.push('');
      countryBlock.lines.push('| indicator | period | value | unit |');
      countryBlock.lines.push('|-----------|--------|-------|------|');
      for (const otherIdno of otherIdnos) {
        const obs = baseline[otherIdno];
        if (!obs || obs.length === 0) continue;
        const latest = obs[obs.length - 1];
        countryBlock.lines.push(`| ${otherIdno} | ${latest.time_period} | ${latest.value} | ${latest.unit_measure} |`);
      }
      countryBlock.lines.push('');
    }
  }
  sections.push(countryBlock);

  const periodMap = new Map();
  for (const country of COUNTRIES) {
    for (const obs of seriesByCountry[country] || []) {
      if (!periodMap.has(obs.time_period)) periodMap.set(obs.time_period, []);
      periodMap.get(obs.time_period).push({ country, value: obs.value });
    }
  }
  const periodsSorted = [...periodMap.keys()].sort();
  let latestCommonPeriod = null;
  for (let i = periodsSorted.length - 1; i >= 0; i--) {
    if (periodMap.get(periodsSorted[i]).length >= 3) { latestCommonPeriod = periodsSorted[i]; break; }
  }
  if (latestCommonPeriod) {
    const snapshot = periodMap.get(latestCommonPeriod).sort((a, b) => a.country.localeCompare(b.country));
    sections.push({
      heading: '## Comparación regional, último período común',
      lines: [
        `Período: ${latestCommonPeriod}`,
        '',
        '| country | value |',
        '|---------|-------|',
        ...snapshot.map((s) => `| ${s.country} | ${s.value} |`),
      ],
    });
  }

  sections.push({
    heading: '## Reglas de detección activas',
    lines: [
      `- Estrategia 1, cambio abrupto: |z| >= ${detectionThresholds.abrupt_z} respecto a los 5 puntos previos.`,
      `- Estrategia 4, anomalía cross-país: |z| >= ${detectionThresholds.cross_z} respecto a la mediana regional (MAD-based).`,
    ],
  });

  if (candidates && candidates.length > 0) {
    const candidateLines = ['Cada candidato fue detectado por el pipeline determinístico. Para cada uno, escribí narrativas bilingües y emitilas en el bloque JSON final.', ''];
    for (const c of candidates) {
      candidateLines.push(`- candidate_id: ${c.candidate_id}`);
      candidateLines.push(`  type: ${c.type}`);
      candidateLines.push(`  country: ${c.country}`);
      candidateLines.push(`  observation: { period: ${c.observation.time_period}, value: ${c.observation.value}, unit: ${c.observation.unit_measure || c.observation.unit} }`);
      if (c.previous) candidateLines.push(`  previous: { period: ${c.previous.time_period}, value: ${c.previous.value} }`);
      candidateLines.push(`  z_score: ${c.z_score.toFixed(2)}`);
      if (c.baseline_mean != null) candidateLines.push(`  baseline_mean: ${c.baseline_mean}`);
      if (c.regional_median != null) candidateLines.push(`  regional_median: ${c.regional_median}`);
      candidateLines.push(`  claim_id: ${c.claim_id}`);
      candidateLines.push('');
    }
    sections.push({ heading: '## Candidatos detectados', lines: candidateLines });
  }

  // Render with line numbers
  const rendered = [];
  let lineNo = 1;
  for (const section of sections) {
    rendered.push(`${String(lineNo).padStart(4, ' ')}: ${section.heading}`); lineNo += 1;
    rendered.push(`${String(lineNo).padStart(4, ' ')}: `); lineNo += 1;
    for (const line of section.lines) {
      rendered.push(`${String(lineNo).padStart(4, ' ')}: ${line}`); lineNo += 1;
    }
    rendered.push(`${String(lineNo).padStart(4, ' ')}: `); lineNo += 1;
  }
  return rendered.join('\n');
}

module.exports = { buildContext };
