'use strict';

const { getWatchlist } = require('./watchlist');
const alertsStore = require('./alerts-store');
const { loadIndex } = require('./indicators-hub');

function parseHttpDate(value) {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

function formatUpdatedDate(value, lang) {
  const t = parseHttpDate(value);
  if (!t) return null;
  const locale = lang === 'en' ? 'en-US' : 'es-AR';
  return new Date(t).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDataPeriod(value, lang) {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw.slice(0, 10) + 'T00:00:00Z');
    if (Number.isFinite(d.getTime())) {
      const locale = lang === 'en' ? 'en-US' : 'es-AR';
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
  }
  if (/^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split('-');
    const d = new Date(`${y}-${m}-01T00:00:00Z`);
    if (Number.isFinite(d.getTime())) {
      const locale = lang === 'en' ? 'en-US' : 'es-AR';
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', timeZone: 'UTC' });
    }
  }
  if (/^\d{4}$/.test(raw)) return raw;
  return raw;
}

function watchlistMap() {
  const map = new Map();
  for (const entry of getWatchlist()) {
    map.set(entry.idno, entry);
  }
  return map;
}

function indexMap() {
  const map = new Map();
  for (const row of loadIndex().indicators || []) {
    map.set(row.idno, row);
  }
  return map;
}

function lastDataPeriodForIdno(idno) {
  let max = null;
  for (const alert of alertsStore.getAlertsForIndicator(idno)) {
    const tp = alert.observation?.time_period;
    if (!tp) continue;
    if (!max || String(tp) > String(max)) max = tp;
  }
  return max;
}

function resolveIndicatorName(entry, lang, wl, idx) {
  const lng = lang === 'en' ? 'en' : 'es';
  if (entry.name && entry.name !== entry.idno) return entry.name;
  const label = entry.label || wl?.label || idx?.label;
  if (label && label !== entry.idno) return label;
  for (const alert of alertsStore.getAlertsForIndicator(entry.idno)) {
    const n = alert.indicator?.name?.[lng];
    if (n && n !== entry.idno) return n;
  }
  return entry.idno;
}

function enrichIndicator(entry, lang = 'es', caches = {}) {
  if (!entry || !entry.idno) return entry;
  const wlMap = caches.watchlist || watchlistMap();
  const idxMap = caches.index || indexMap();
  const wl = wlMap.get(entry.idno);
  const idx = idxMap.get(entry.idno);
  const lastModified = entry.last_modified || idx?.last_modified || null;
  const lastDataPeriod = entry.last_data_period || lastDataPeriodForIdno(entry.idno);
  const name = resolveIndicatorName(entry, lang, wl, idx);
  return {
    ...entry,
    idno: entry.idno,
    name,
    label: name,
    database_id: entry.database_id || wl?.database_id || idx?.database_id || null,
    tier: entry.tier || wl?.tier || idx?.tier || null,
    last_modified: lastModified,
    last_modified_display: formatUpdatedDate(lastModified, lang),
    last_data_period: lastDataPeriod,
    last_data_display: formatDataPeriod(lastDataPeriod, lang),
  };
}

function enrichIndicatorList(list, lang = 'es') {
  const caches = { watchlist: watchlistMap(), index: indexMap() };
  return (list || []).map((entry) => enrichIndicator(entry, lang, caches));
}

function indicatorFromAlert(alert, lang = 'es') {
  const lng = lang === 'en' ? 'en' : 'es';
  const idno = alert?.indicator?.idno;
  if (!idno) return null;
  return enrichIndicator({
    idno,
    label: alert.indicator.name?.[lng],
    database_id: alert.indicator.database_id,
    last_data_period: alert.observation?.time_period,
  }, lang);
}

module.exports = {
  enrichIndicator,
  enrichIndicatorList,
  indicatorFromAlert,
  formatUpdatedDate,
  formatDataPeriod,
  lastDataPeriodForIdno,
};
