'use strict';

/**
 * Build a numbered omnibus markdown context for one indicator.
 *
 * The context bundles, in this order:
 *   1. Definition and methodology (from the cached indicator markdown; includes identification)
 *   2. Per country: background narrative, this indicator's full series,
 *      and a snapshot of related indicators from the country baseline
 *   3. Recent public discourse (GDELT headlines)
 *   4. Detection rules in force
 *   5. Candidate alerts detected deterministically
 *
 * Every line is prefixed with `NNNN: ` so the LLM can cite by (section, line).
 */

const {
  loadIndicatorMetadata,
  loadCountryBackground,
  loadDataDict,
  COUNTRIES,
} = require('../data-loader');
const { buildNewsSectionLines } = require('../news');
const { themesForAnnualWatchlist } = require('../news-themes');

function buildContext({
  idno,
  seriesByCountry,
  baselineSeriesByCountry,
  candidates,
  detectionThresholds = { abrupt_z: 2, cross_z: 2 },
}) {
  const sections = [];
  const indicatorMd = loadIndicatorMetadata(idno) || '';

  sections.push({
    heading: '# CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR',
    lines: [],
  });

  if (indicatorMd) {
    sections.push({
      heading: '## Definición y metodología',
      lines: indicatorMd.trim().split('\n'),
    });
  }

  const dataDictCsv = loadDataDict(idno);
  if (dataDictCsv) {
    const dictLines = dataDictCsv.split('\n').slice(0, 80);
    sections.push({
      heading: '## Diccionario de datos (primeras columnas)',
      lines: dictLines,
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

  const newsThemes = themesForAnnualWatchlist();
  const newsSection = buildNewsSectionLines(COUNTRIES, {
    fromMonth: '2026-04',
    toMonth: '2026-05',
    limitPerCountry: 8,
    themeNote: `Filtro GDELT: ${newsThemes.length} temas validados alineados con indicadores anuales (${newsThemes.join(', ')}).`,
  });
  if (newsSection.any) {
    sections.push({
      heading: '## Discurso público reciente',
      lines: newsSection.lines,
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
