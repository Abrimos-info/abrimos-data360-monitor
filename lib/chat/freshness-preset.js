'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CHANGED_SINCE_PATH = path.join(REPO_ROOT, 'data', 'changed-since.json');
const INDEX_PATH = path.join(REPO_ROOT, 'data', 'index.json');
const DEMO_COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

function parseHttpDate(value) {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

function formatBlobDate(value, lang) {
  const t = parseHttpDate(value);
  if (!t) return lang === 'en' ? 'unknown' : 'desconocida';
  const locale = lang === 'en' ? 'en-US' : 'es-AR';
  return new Date(t).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function readJsonSafe(filepath) {
  try {
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function loadFreshnessReport() {
  const changedSince = readJsonSafe(CHANGED_SINCE_PATH);
  const index = readJsonSafe(INDEX_PATH);
  if (!changedSince && !index) {
    return {
      probed_at: null,
      since: null,
      total_probed: 0,
      changed_count: 0,
      force: false,
      indicators: [],
    };
  }

  const indexRows = index?.indicators || changedSince?.indicators || [];
  let selected = indexRows;

  if (changedSince && !changedSince.force && changedSince.changed_indicators?.length) {
    const changed = new Set(changedSince.changed_indicators);
    selected = indexRows.filter((row) => changed.has(row.idno));
  } else if (changedSince?.indicators?.length) {
    selected = changedSince.indicators;
  }

  const indicators = selected
    .map((row) => ({
      idno: row.idno,
      database_id: row.database_id,
      tier: row.tier || 'annual',
      label: row.label || row.idno,
      last_modified: row.last_modified || null,
      changed_this_run: row.changed_this_run !== false,
      csv_url: row.csv_url || null,
    }))
    .sort((a, b) => parseHttpDate(b.last_modified) - parseHttpDate(a.last_modified));

  return {
    probed_at: changedSince?.probed_at || index?.generated_at || null,
    since: changedSince?.since || index?.since || null,
    total_probed: changedSince?.total_probed || index?.total || indicators.length,
    changed_count: changedSince?.changed ?? index?.changed_count ?? indicators.length,
    force: changedSince?.force === true,
    indicators,
  };
}

/** Special line format: @IDNO|DATABASE|TIER|LABEL|BLOB_DATE */
function formatIndicatorLine(ind, lang) {
  const date = formatBlobDate(ind.last_modified, lang);
  const label = String(ind.label || ind.idno).replace(/\|/g, '/');
  return `@${ind.idno}|${ind.database_id}|${ind.tier}|${label}|${date}`;
}

function buildCatalogBlock(indicators, lang, maxItems = 12) {
  const slice = indicators.slice(0, maxItems);
  const lines = slice.map((ind) => formatIndicatorLine(ind, lang));
  const header = lang === 'en' ? '/indicators-updated' : '/indicadores-actualizados';
  let block = `${header}\n${lines.join('\n')}`;
  if (indicators.length > slice.length) {
    const rest = indicators.length - slice.length;
    block += lang === 'en'
      ? `\n… +${rest} more (read_freshness for full list)`
      : `\n… +${rest} más (read_freshness para lista completa)`;
  }
  return block;
}

function buildFreshnessPreset(lang, opts = {}) {
  const maxItems = opts.maxItems || 12;
  const report = loadFreshnessReport();
  const indicators = report.indicators;
  const count = indicators.length;
  const probeLabel = report.probed_at
    ? formatBlobDate(report.probed_at, lang)
    : (lang === 'en' ? 'never' : 'nunca');

  const catalogBlock = count
    ? buildCatalogBlock(indicators, lang, maxItems)
    : (lang === 'en' ? '/indicators-updated\n(empty — run npm run fetch:probe)' : '/indicadores-actualizados\n(vacío — ejecutá npm run fetch:probe)');

  const countries = DEMO_COUNTRIES.join(', ');

  const promptEs = [
    `Según la última sonda de freshness del monitor (probe: ${probeLabel}, ${count} indicadores con CSV actualizado en Data360), mostrá al usuario el catálogo siguiente y explicá cómo pedir gráficas o análisis por país.`,
    '',
    catalogBlock,
    '',
    'Países demo: ' + countries + '.',
    '',
    'Formato de línea: `@IDNO|database|tier|nombre|fecha-blob`.',
    'El usuario puede pedir:',
    '- **Gráfica** — «gráfica {IDNO} {PAÍS}» → `mcp_get_data` + bloque ```sparkline``` si hay alerta (`list_alerts` con idno y country).',
    '- **Análisis** — «análisis {IDNO}» o «análisis {IDNO} {PAÍS}» → `run_analysis({ idno })` y resumir alertas.',
    '- **Comparar LAC** — «comparar {IDNO}» → `mcp_compare_countries` en GTM,HND,ARG,ECU,MEX.',
    '',
    'Mostrá la lista en markdown (bloque de código con el formato especial). Preguntá qué indicador, país y tipo (gráfica o análisis) quiere explorar.',
  ].join('\n');

  const promptEn = [
    `Using the monitor's latest freshness probe (probe: ${probeLabel}, ${count} indicators with updated Data360 CSVs), show the user the catalog below and explain how to request charts or analyses per country.`,
    '',
    catalogBlock,
    '',
    'Demo countries: ' + countries + '.',
    '',
    'Line format: `@IDNO|database|tier|name|blob-date`.',
    'The user can ask for:',
    '- **Chart** — "chart {IDNO} {COUNTRY}" → `mcp_get_data` + ```sparkline``` block if an alert exists (`list_alerts` with idno and country).',
    '- **Analysis** — "analyze {IDNO}" or "analyze {IDNO} {COUNTRY}" → `run_analysis({ idno })` and summarize alerts.',
    '- **Compare LAC** — "compare {IDNO}" → `mcp_compare_countries` across GTM,HND,ARG,ECU,MEX.',
    '',
    'Render the list in markdown (code block with the special format). Ask which indicator, country, and type (chart or analysis) they want.',
  ].join('\n');

  return {
    id: 'freshness_updated',
    default: false,
    label_es: count ? `Actualizados Data360 (${count})` : 'Actualizados Data360',
    label_en: count ? `Updated in Data360 (${count})` : 'Updated in Data360',
    prompt_es: promptEs,
    prompt_en: promptEn,
    probed_at: report.probed_at,
    changed_count: count,
    catalog: indicators.map((ind) => ({
      ...ind,
      line: formatIndicatorLine(ind, lang),
      blob_date: formatBlobDate(ind.last_modified, lang),
    })),
    catalog_block: catalogBlock,
  };
}

function loadChatPresets(lang, opts = {}) {
  const presetPath = path.join(REPO_ROOT, 'config', 'chat-presets.json');
  let staticPresets = [];
  try {
    staticPresets = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
  } catch (_) {
    staticPresets = [];
  }
  const fresh = buildFreshnessPreset(lang, opts);
  const rest = staticPresets.filter((p) => p.id !== 'freshness_updated');
  return [fresh, ...rest];
}

function summarizeForTool(report, maxItems = 35) {
  return {
    probed_at: report.probed_at,
    since: report.since,
    total_probed: report.total_probed,
    changed_count: report.changed_count,
    force: report.force,
    countries: DEMO_COUNTRIES,
    line_format: '@IDNO|database|tier|label|blob-date',
    indicators: report.indicators.slice(0, maxItems).map((ind) => ({
      line: formatIndicatorLine(ind, 'es'),
      idno: ind.idno,
      database_id: ind.database_id,
      tier: ind.tier,
      label: ind.label,
      last_modified: ind.last_modified,
      csv_url: ind.csv_url,
    })),
    total_listed: Math.min(maxItems, report.indicators.length),
    total_available: report.indicators.length,
  };
}

module.exports = {
  loadFreshnessReport,
  buildFreshnessPreset,
  loadChatPresets,
  formatIndicatorLine,
  buildCatalogBlock,
  summarizeForTool,
  DEMO_COUNTRIES,
};
