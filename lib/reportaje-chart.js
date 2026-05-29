'use strict';

const fs = require('fs');
const path = require('path');
const { DEMO_COUNTRIES } = require('./url-slug');
const { escHtml, renderMultiSeriesChartSvg, renderDumbbellChartSvg } = require('./chart-svg');
const { parseCsv } = require('./csv');

const SNAPSHOTS_DIR = path.join(__dirname, '../data/snapshots');

function loadSeriesFromSnapshot(idno, country) {
  const csvPath = path.join(SNAPSHOTS_DIR, `${idno}.csv`);
  if (!fs.existsSync(csvPath)) return null;
  try {
    const { rows } = parseCsv(fs.readFileSync(csvPath, 'utf8'));
    const points = rows
      .filter((r) => r.REF_AREA === country && r.INDICATOR === idno && r.OBS_STATUS === 'A')
      .filter((r) => {
        const sex = r.SEX; const age = r.AGE; const urb = r.URBANISATION;
        if (sex && sex !== '_Z' && sex !== '_T') return false;
        if (age && age !== '_Z' && age !== '_T') return false;
        if (urb && urb !== '_Z' && urb !== '_T') return false;
        return true;
      })
      .map((r) => ({ period: (r.TIME_PERIOD || '').slice(0, 10), value: Number(r.OBS_VALUE) }))
      .filter((p) => p.period && Number.isFinite(p.value))
      .sort((a, b) => a.period.localeCompare(b.period));
    return points.length ? points : null;
  } catch (_) {
    return null;
  }
}

const COUNTRY_COLORS = {
  ARG: '#0083C8',
  ECU: '#FDB813',
  GTM: '#002244',
  HND: '#1d6a47',
  MEX: '#2074D0',
};

const COUNTRY_ORDER = DEMO_COUNTRIES;

function primaryCountryForNoticia(noticia, reportajeCountries) {
  const id = String(noticia.id || '');
  const m = id.match(/_(ARG|ECU|GTM|HND|MEX)(?:_|$)/);
  if (m) return m[1];
  const pool = Array.isArray(reportajeCountries) ? reportajeCountries : [];
  const fromNoticia = Array.isArray(noticia.countries) ? noticia.countries : [];
  return fromNoticia.find((iso) => pool.includes(iso)) || fromNoticia[0] || noticia.country || null;
}

function indicatorLabel(indicator, idno, lang) {
  const lng = lang === 'en' ? 'en' : 'es';
  const name = indicator && indicator.name && indicator.name[lng];
  if (name && name !== idno) {
    const short = name.split(/[—–-]/)[0].trim();
    return short.length > 28 ? `${short.slice(0, 26)}…` : short;
  }
  const parts = String(idno || '').split('_');
  return parts[parts.length - 1] || idno || '';
}

function sortCountries(countries) {
  return [...countries].sort((a, b) => {
    const ai = COUNTRY_ORDER.indexOf(a);
    const bi = COUNTRY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function noticiaMatchesReportaje(noticia, reportaje) {
  if (!noticia || (noticia.content_type || 'noticia') === 'reportaje') return false;
  if ((reportaje.noticia_ids || []).includes(noticia.id)) return true;
  const idno = noticia.indicator && noticia.indicator.idno;
  if (Array.isArray(reportaje.indicators) && reportaje.indicators.length) {
    if (!reportaje.indicators.includes(idno)) return false;
  }
  const ds = reportaje.dataset_id;
  if (ds && noticia.dataset_id === ds) return true;
  if (ds && idno && String(idno).startsWith(`${ds}_`)) return true;
  return false;
}

function findNoticiaForCell(noticias, idno, country, countries) {
  for (const noticia of noticias) {
    if ((noticia.indicator && noticia.indicator.idno) !== idno) continue;
    if (primaryCountryForNoticia(noticia, countries) === country) return noticia;
  }
  for (const noticia of noticias) {
    if ((noticia.indicator && noticia.indicator.idno) !== idno) continue;
    const pool = Array.isArray(noticia.countries) ? noticia.countries : [];
    if (!pool.includes(country)) continue;
    const id = String(noticia.id || '');
    if (id.includes(`_${country}_`)) return noticia;
  }
  return null;
}

function cellFromNoticia(noticia, idno, country) {
  return {
    idno,
    country,
    series: Array.isArray(noticia.chart_series) ? noticia.chart_series : [],
    value: noticia.observation && noticia.observation.value,
    period: noticia.observation && noticia.observation.time_period,
    display: noticia.observation && noticia.observation.display,
    unit: noticia.observation && noticia.observation.unit,
    indicator: noticia.indicator || null,
  };
}

/**
 * Build multi-series chart payload for a reportaje from its linked noticias.
 * @param {object} reportaje
 * @param {(id: string) => object|null} getAlertById
 * @param {() => object[]} [getAllAlerts]
 * @param {string} [lang]
 */
function buildReportajeSeries(reportaje, getAlertById, getAllAlerts, lang = 'es') {
  if (!reportaje || reportaje.content_type !== 'reportaje') return null;

  const countries = sortCountries(
    Array.isArray(reportaje.countries) && reportaje.countries.length
      ? reportaje.countries
      : COUNTRY_ORDER,
  );
  const indicators = Array.isArray(reportaje.indicators) ? [...reportaje.indicators] : [];

  const pool = [];

  for (const nid of reportaje.noticia_ids || []) {
    const noticia = typeof getAlertById === 'function' ? getAlertById(nid) : null;
    if (noticia) pool.push(noticia);
  }

  if (typeof getAllAlerts === 'function') {
    const seen = new Set(pool.map((n) => n.id));
    for (const noticia of getAllAlerts()) {
      if (seen.has(noticia.id)) continue;
      if (!noticiaMatchesReportaje(noticia, reportaje)) continue;
      pool.push(noticia);
      seen.add(noticia.id);
    }
  }

  const cellMap = new Map();
  for (const noticia of pool) {
    const idno = noticia.indicator && noticia.indicator.idno;
    const country = primaryCountryForNoticia(noticia, countries);
    if (!idno || !country) continue;
    if (indicators.length && !indicators.includes(idno)) continue;
    cellMap.set(`${idno}|${country}`, cellFromNoticia(noticia, idno, country));
  }
  for (const idno of indicators) {
    for (const country of countries) {
      const key = `${idno}|${country}`;
      if (cellMap.has(key)) continue;
      const noticia = findNoticiaForCell(pool, idno, country, countries);
      if (noticia) {
        cellMap.set(key, cellFromNoticia(noticia, idno, country));
        continue;
      }
      const snapshotPoints = loadSeriesFromSnapshot(idno, country);
      if (snapshotPoints) {
        const latest = snapshotPoints[snapshotPoints.length - 1];
        cellMap.set(key, {
          idno,
          country,
          series: snapshotPoints,
          value: latest.value,
          period: latest.period,
          display: null,
          unit: null,
          indicator: { idno },
        });
      }
    }
  }

  const allPeriods = [];
  const series = [];
  for (const [key, cell] of cellMap) {
    if (!cell.series || !cell.series.length) continue;
    const idno = cell.idno;
    const country = cell.country;
    const ind = cell.indicator || { idno };
    const label = `${country} · ${indicatorLabel(ind, idno, lang)}`;
    const points = cell.series
      .map((p) => ({ period: p.period, value: Number(p.value) }))
      .filter((p) => p.period && Number.isFinite(p.value));
    if (!points.length) continue;
    points.forEach((p) => allPeriods.push(p.period));
    const color = COUNTRY_COLORS[country] || '#0083C8';

    // dash pattern based on indicator order for a given country
    const idx = Math.max(0, indicators.indexOf(idno));
    const dash = (idx % 3 === 1) ? '5 3' : ((idx % 3 === 2) ? '2 2' : null);

    series.push({
      id: key,
      country,
      idno,
      color,
      dash,
      label,
      points,
      unit: cell.unit || null,
    });
  }

  if (!series.length) return null;
  return {
    unit: series.find((s) => s.unit)?.unit || null,
    periods: allPeriods,
    series,
  };
}

const COUNTRY_LABELS_ES = { ARG: 'Argentina', ECU: 'Ecuador', GTM: 'Guatemala', HND: 'Honduras', MEX: 'México' };
const COUNTRY_LABELS_EN = { ARG: 'Argentina', ECU: 'Ecuador', GTM: 'Guatemala', HND: 'Honduras', MEX: 'Mexico' };

const META_DIR = path.join(__dirname, '../data/snapshots');
function loadIndicatorName(idno) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(META_DIR, `${idno}.meta.json`), 'utf8'));
    return meta.series_description && meta.series_description.name || null;
  } catch (_) {
    return null;
  }
}

/**
 * Build one dumbbell payload per indicator from the full series data.
 * Each payload has rows = countries, start dot = earliest point, end dot = latest point.
 */
function buildDumbbellPayloads(reportaje, getAlertById, getAllAlerts, lang = 'es', opts = {}) {
  const maxIndicators = opts.maxIndicators || Infinity;
  const payload = buildReportajeSeries(reportaje, getAlertById, getAllAlerts, lang);
  if (!payload || !payload.series.length) return [];

  const countryLabels = lang === 'en' ? COUNTRY_LABELS_EN : COUNTRY_LABELS_ES;

  // Group series by indicator, respecting maxIndicators limit
  const byIndicator = new Map();
  for (const s of payload.series) {
    if (byIndicator.size >= maxIndicators && !byIndicator.has(s.idno)) continue;
    if (!byIndicator.has(s.idno)) byIndicator.set(s.idno, []);
    byIndicator.get(s.idno).push(s);
  }

  const payloads = [];
  for (const [idno, seriesList] of byIndicator) {
    const rows = [];
    for (const s of seriesList) {
      if (!s.points || s.points.length < 1) continue;
      const sorted = [...s.points].sort((a, b) => a.period.localeCompare(b.period));
      const start = sorted[0];
      const end = sorted[sorted.length - 1];
      rows.push({
        iso: s.country,
        label: countryLabels[s.country] || s.country,
        color: s.color || COUNTRY_COLORS[s.country] || '#0083C8',
        startPeriod: start.period,
        startValue: start.value,
        endPeriod: end.period,
        endValue: end.value,
      });
    }
    if (!rows.length) continue;

    // Sort rows by the fixed demo country order so tabs don't reorder on switch
    rows.sort((a, b) => {
      const ai = COUNTRY_ORDER.indexOf(a.iso);
      const bi = COUNTRY_ORDER.indexOf(b.iso);
      if (ai === -1 && bi === -1) return a.iso.localeCompare(b.iso);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const sample = seriesList[0];
    const fullName = loadIndicatorName(idno);
    const title = fullName || indicatorLabel(sample.indicator || { idno }, idno, lang);
    payloads.push({ idno, title, fullName, unit: sample.unit || null, rows });
  }

  return payloads;
}

function renderReportajeChartForAlert(reportaje, getAlertById, opts = {}) {
  const getAllAlerts = opts.getAllAlerts;
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const labels = opts.labels || {};
  const compact = opts.variant === 'compact';
  const svgOpts = compact ? { width: 400, rowHeight: 24, padTop: 24, padBottom: 32, padRight: 48, labelWidth: 76 } : {};

  // Compact: only load and render the first indicator, hint at the rest
  if (compact) {
    const totalIndicators = (reportaje.indicators || []).length;
    const payloads = buildDumbbellPayloads(reportaje, getAlertById, getAllAlerts, lang, { maxIndicators: 1 });
    if (!payloads.length) return '';
    const extra = totalIndicators - 1;
    const hintHtml = extra > 0
      ? `<p class="d360-dumbbell-hint">${escHtml(extra === 1 ? `+ 1 indicador más` : `+ ${extra} indicadores más`)}</p>`
      : '';
    const titleHtml = payloads[0].title
      ? `<p class="d360-frontpage__hero-chart-title">${escHtml(payloads[0].title)}</p>`
      : '';
    return `<div class="d360-dumbbell-wrap">`
      + titleHtml
      + renderDumbbellChartSvg(payloads[0], { ...svgOpts, ariaLabel: labels.title || payloads[0].title })
      + hintHtml
      + `</div>`;
  }

  const payloads = buildDumbbellPayloads(reportaje, getAlertById, getAllAlerts, lang);
  if (!payloads.length) return '';

  // Single indicator: no selector needed
  if (payloads.length === 1) {
    return `<div class="d360-dumbbell-wrap">`
      + renderDumbbellChartSvg(payloads[0], { ...svgOpts, ariaLabel: labels.title || payloads[0].title })
      + `</div>`;
  }

  // Strip longest common prefix from full names for tab labels
  const fullNames = payloads.map((p) => p.fullName || p.title);
  let prefixLen = 0;
  if (fullNames.every(Boolean) && fullNames.length > 1) {
    const shortest = fullNames.reduce((a, b) => a.length <= b.length ? a : b);
    while (prefixLen < shortest.length && fullNames.every((n) => n[prefixLen] === shortest[prefixLen])) prefixLen++;
    // Walk back to a word boundary (colon, dash, space)
    while (prefixLen > 0 && !/[:\-\s]/.test(fullNames[0][prefixLen - 1])) prefixLen--;
  }
  const tabLabel = (p) => {
    const raw = p.fullName || p.title;
    const short = prefixLen > 0 ? raw.slice(prefixLen).replace(/^[\s:\-]+/, '') : raw;
    return short || raw;
  };

  // Multiple indicators: tab selector, panels hidden except first
  const nav = payloads.map((p, i) =>
    `<button class="d360-dumbbell-tab${i === 0 ? ' is-active' : ''}" type="button" data-dumbbell-tab="${i}" aria-selected="${i === 0}">${escHtml(tabLabel(p))}</button>`,
  ).join('');

  const panels = payloads.map((p, i) =>
    `<div class="d360-dumbbell-panel${i === 0 ? ' is-active' : ''}" data-dumbbell-panel="${i}" role="tabpanel" aria-hidden="${i !== 0}">`
    + renderDumbbellChartSvg(p, { ...svgOpts, ariaLabel: labels.title ? `${labels.title} – ${p.title}` : p.title })
    + `</div>`,
  ).join('');

  return `<div class="d360-dumbbell-tabs">`
    + `<div class="d360-dumbbell-tabs__nav" role="tablist">${nav}</div>`
    + panels
    + `</div>`;
}

module.exports = {
  buildReportajeSeries,
  buildDumbbellPayloads,
  renderReportajeChartForAlert,
  primaryCountryForNoticia,
};
