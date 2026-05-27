'use strict';

const { DEMO_COUNTRIES } = require('./url-slug');
const { renderMultiSeriesChartSvg } = require('./chart-svg');

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
      if (noticia) cellMap.set(key, cellFromNoticia(noticia, idno, country));
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

function renderReportajeChartForAlert(reportaje, getAlertById, opts = {}) {
  const getAllAlerts = opts.getAllAlerts;
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const payload = buildReportajeSeries(reportaje, getAlertById, getAllAlerts, lang);
  if (!payload) return '';
  const labels = opts.labels || {};
  const ariaLabel = labels.title || 'Regional multi-series chart';
  const variant = opts.variant === 'compact' ? 'compact' : 'full';
  return renderMultiSeriesChartSvg(payload, {
    variant,
    focusCountry: opts.focusCountry || null,
    ariaLabel,
  });
}

module.exports = {
  buildReportajeSeries,
  renderReportajeChartForAlert,
  primaryCountryForNoticia,
};
