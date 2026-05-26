'use strict';

/**
 * Build a numbered omnibus markdown context for one indicator.
 *
 * Full mode (legacy): all 5 LAC countries, 30 series points, 80-line datadict.
 * Slim mode (default): only candidate countries, 12 series points, compact datadict,
 * baseline snapshot for the primary candidate country only.
 *
 * Datadict = column definitions from Data360 `{IDNO}_DATADICT.csv` (what OBS_VALUE,
 * REF_AREA, UNIT_MEASURE mean). Slim keeps ~15 lines so the model parses units without
 * shipping the full dictionary.
 */

const {
  loadIndicatorMetadata,
  loadCountryBackground,
  loadDataDict,
  COUNTRIES,
} = require('../data-loader');

const SLIM_SERIES_POINTS = parseInt(process.env.CONTEXT_SLIM_SERIES_POINTS || '12', 10);
const SLIM_BASELINE_INDICATORS = parseInt(process.env.CONTEXT_SLIM_BASELINE_INDICATORS || '12', 10);
const SLIM_DATADICT_LINES = parseInt(process.env.CONTEXT_SLIM_DATADICT_LINES || '15', 10);

function pickPrimaryCountry(candidates) {
  if (!candidates?.length) return null;
  let best = candidates[0];
  let bestZ = Math.abs(best.z_score || 0);
  for (const c of candidates.slice(1)) {
    const z = Math.abs(c.z_score || 0);
    if (z > bestZ) {
      best = c;
      bestZ = z;
    }
  }
  return best.country;
}

function candidateCountries(candidates) {
  return [...new Set((candidates || []).map((c) => c.country).filter(Boolean))];
}

function isRankUnit(unit) {
  return String(unit || '').toUpperCase() === 'RANK';
}

function formatDeltaLine(c) {
  const obsVal = Number(c.observation?.value);
  const obsPeriod = c.observation?.time_period;
  const unit = c.observation?.unit_measure || c.observation?.unit || '';
  if (!Number.isFinite(obsVal)) return null;
  if (!c.previous) {
    return `valor actual (${obsPeriod}): ${obsVal} — sin período anterior en la detección`;
  }
  const prevVal = Number(c.previous.value);
  const prevPeriod = c.previous.time_period;
  if (!Number.isFinite(prevVal)) return null;
  const delta = obsVal - prevVal;

  if (isRankUnit(unit)) {
    if (delta > 0) {
      return `valor actual (${obsPeriod}): puesto ${obsVal}; anterior (${prevPeriod}): puesto ${prevVal}; Δ=+${delta} puestos — empeoró del puesto ${prevVal} al ${obsVal} (rank sube = posición global peor)`;
    }
    if (delta < 0) {
      return `valor actual (${obsPeriod}): puesto ${obsVal}; anterior (${prevPeriod}): puesto ${prevVal}; Δ=${delta} puestos — mejoró del puesto ${prevVal} al ${obsVal} (rank baja = posición global mejor)`;
    }
    return `valor actual (${obsPeriod}): puesto ${obsVal}; anterior (${prevPeriod}): puesto ${prevVal}; sin cambio de posición`;
  }

  const pct = prevVal !== 0 ? ((delta / Math.abs(prevVal)) * 100) : null;
  const pctStr = pct != null && Number.isFinite(pct) ? `, ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : '';
  const dir = delta > 0 ? 'sube' : (delta < 0 ? 'baja' : 'sin cambio');
  return `valor actual (${obsPeriod}): ${obsVal}; anterior (${prevPeriod}): ${prevVal}; Δ=${delta >= 0 ? '+' : ''}${delta}${pctStr} (${dir})`;
}

function buildContext({
  idno,
  seriesByCountry,
  baselineSeriesByCountry,
  candidates,
  detectionThresholds = { abrupt_z: 2, cross_z: 2 },
  slim = process.env.AI_SLIM_CONTEXT !== 'false',
}) {
  const sections = [];
  const indicatorMd = loadIndicatorMetadata(idno) || '';
  const focusCountries = slim
    ? candidateCountries(candidates)
    : COUNTRIES;
  const primaryCountry = slim ? pickPrimaryCountry(candidates) : null;
  const seriesLimit = slim ? SLIM_SERIES_POINTS : 30;
  const countriesForBlock = focusCountries.length ? focusCountries : COUNTRIES;

  sections.push({
    heading: slim
      ? '# CONTEXTO SLIM (país(es) candidato(s) únicamente)'
      : '# CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR',
    lines: slim && primaryCountry
      ? [`País protagonista (mayor |z|): ${primaryCountry}. Baseline contextual solo para este país.`]
      : [],
  });

  if (indicatorMd) {
    const mdLines = indicatorMd.trim().split('\n');
    sections.push({
      heading: '## Definición y metodología',
      lines: slim ? mdLines.slice(0, 35) : mdLines,
    });
  }

  const dataDictCsv = loadDataDict(idno);
  if (dataDictCsv) {
    const dictLimit = slim ? SLIM_DATADICT_LINES : 80;
    const dictLines = dataDictCsv.split('\n').slice(0, dictLimit);
    sections.push({
      heading: slim
        ? '## Diccionario de datos (columnas clave del CSV)'
        : '## Diccionario de datos (primeras columnas)',
      lines: slim
        ? [
          'Glosario de columnas del CSV de Data360 para este indicador (unidades, códigos de área, etc.).',
          ...dictLines,
        ]
        : dictLines,
    });
  }

  const countryBlock = { heading: '## Países y trayectorias', lines: [] };
  for (const country of countriesForBlock) {
    countryBlock.lines.push(`### ${country}`);
    countryBlock.lines.push('');

    const background = loadCountryBackground(country);
    countryBlock.lines.push('#### Background del país');
    countryBlock.lines.push('');
    if (background) {
      const bgLines = background.trim().split('\n');
      for (const line of (slim ? bgLines.slice(0, 12) : bgLines)) countryBlock.lines.push(line);
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
      for (const obs of series.slice(-seriesLimit)) {
        countryBlock.lines.push(`| ${obs.time_period} | ${obs.value} | ${obs.unit_measure} |`);
      }
    }
    countryBlock.lines.push('');

    const showBaseline = !slim || country === primaryCountry;
    if (showBaseline) {
      const baseline = baselineSeriesByCountry[country] || {};
      const otherIdnos = Object.keys(baseline).filter((k) => k !== idno).slice(0, SLIM_BASELINE_INDICATORS);
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
  }
  sections.push(countryBlock);

  sections.push({
    heading: '## Reglas de detección activas',
    lines: [
      `- Estrategia 1, cambio abrupto: |z| >= ${detectionThresholds.abrupt_z} respecto a los 5 puntos previos.`,
      `- Estrategia 4, anomalía cross-país: |z| >= ${detectionThresholds.cross_z} respecto a la mediana regional (MAD-based).`,
    ],
  });

  if (candidates && candidates.length > 0) {
    const primary = pickPrimaryCountry(candidates);
    const candidateLines = [
      slim
        ? 'Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.'
        : 'Cada candidato fue detectado por el pipeline determinístico. Emití el bloque JSON final.',
      primary ? `Protagonista (mayor |z|): ${primary}. Usá sus números en lead, observation y titular.` : '',
      '',
    ];
    for (const c of candidates) {
      candidateLines.push(`- candidate_id: ${c.candidate_id}`);
      candidateLines.push(`  type: ${c.type}`);
      candidateLines.push(`  country: ${c.country}`);
      candidateLines.push(`  observation: { period: ${c.observation.time_period}, value: ${c.observation.value}, unit: ${c.observation.unit_measure || c.observation.unit} }`);
      const unit = c.observation.unit_measure || c.observation.unit || '';
      if (unit === 'IX') {
        candidateLines.push('  NOTA UNIDAD: serie índice (p. ej. base 2015=100) — NO es inflación en %; el hecho es el Δ vs período anterior.');
      }
      if (isRankUnit(unit)) {
        candidateLines.push('  NOTA UNIDAD: posición global (RANK) — menor número = mejor posición; si el rank sube, la posición empeora. Usá verbos "empeoró"/"mejoró" con "del puesto X al Y", no "aumentó"/"mejoró" por el signo del Δ numérico.');
      }
      if (c.previous) candidateLines.push(`  previous: { period: ${c.previous.time_period}, value: ${c.previous.value} }`);
      const deltaLine = formatDeltaLine(c);
      if (deltaLine) candidateLines.push(`  REDACTAR CON ESTOS VALORES: ${deltaLine}`);
      candidateLines.push(`  z_score: ${c.z_score.toFixed(2)}`);
      if (c.baseline_mean != null) candidateLines.push(`  baseline_mean: ${c.baseline_mean}`);
      if (c.regional_median != null) candidateLines.push(`  regional_median: ${c.regional_median}`);
      candidateLines.push(`  claim_id: ${c.claim_id}`);
      candidateLines.push('');
    }
    candidateLines.push('### allowed_claim_ids');
    candidateLines.push('Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.');
    candidateLines.push('');
    for (const c of candidates) candidateLines.push(`- ${c.claim_id}`);
    candidateLines.push('');
    sections.push({ heading: '## Candidatos detectados', lines: candidateLines });
  }

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

module.exports = {
  buildContext,
  pickPrimaryCountry,
  candidateCountries,
  formatDeltaLine,
  isRankUnit,
};
