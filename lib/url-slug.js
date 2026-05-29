'use strict';

const COUNTRY_SLUGS = {
  ARG: 'argentina',
  ECU: 'ecuador',
  GTM: 'guatemala',
  HND: 'honduras',
  MEX: 'mexico',
};

const SLUG_TO_ISO = Object.fromEntries(
  Object.entries(COUNTRY_SLUGS).map(([iso, slug]) => [slug, iso])
);

const DEMO_COUNTRIES = Object.keys(COUNTRY_SLUGS);

function slugify(text, maxLen = 80) {
  if (!text || typeof text !== 'string') return 'articulo';
  let s = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!s) s = 'articulo';
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/, '');
  return s;
}

function countrySlug(iso3) {
  return COUNTRY_SLUGS[String(iso3 || '').toUpperCase()] || String(iso3 || '').toLowerCase();
}

function isoFromCountrySlug(slug) {
  return SLUG_TO_ISO[String(slug || '').toLowerCase()] || null;
}

function primaryCountry(alert) {
  if (alert.country) return String(alert.country).toUpperCase();
  if (Array.isArray(alert.countries) && alert.countries.length) return String(alert.countries[0]).toUpperCase();
  return 'ARG';
}

function alertTitleForSlug(alert) {
  if (alert.title && typeof alert.title === 'object' && alert.title.es) return alert.title.es;
  if (alert._title) return alert._title;
  if (alert.indicator?.name?.es) return alert.indicator.name.es;
  if (alert.lead?.es) return alert.lead.es.slice(0, 60);
  return alert.id || 'articulo';
}

function alertDateParts(alert) {
  let raw = alert.detected_at;
  if (!raw && alert.observation?.time_period) {
    const tp = alert.observation.time_period;
    if (/^\d{4}$/.test(tp)) raw = `${tp}-01-01T00:00:00Z`;
    else if (/^\d{4}-\d{2}$/.test(tp)) raw = `${tp}-01T00:00:00Z`;
    else raw = tp;
  }
  const d = raw ? new Date(raw) : new Date();
  const year = Number.isFinite(d.getTime()) ? String(d.getUTCFullYear()) : '2026';
  const month = Number.isFinite(d.getTime())
    ? String(d.getUTCMonth() + 1).padStart(2, '0')
    : '01';
  return { year, month };
}

function buildAlertPath(alert, opts = {}) {
  const iso = opts.countryIso || primaryCountry(alert);
  const cSlug = opts.countrySlug || countrySlug(iso);
  const type = alert.content_type === 'reportaje' ? 'reportaje' : 'noticia';
  const { year, month } = alertDateParts(alert);
  const slug = opts.slug || slugify(alertTitleForSlug(alert));
  return `/${cSlug}/${type}/${year}/${month}/${slug}`;
}

function parseArticlePath(segments) {
  if (!Array.isArray(segments) || segments.length !== 5) return null;
  const [countrySlug, type, year, month, slug] = segments;
  if (!['noticia', 'reportaje'].includes(type)) return null;
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) return null;
  const iso = isoFromCountrySlug(countrySlug);
  if (!iso) return null;
  return { countrySlug, type, year, month, slug, iso };
}

function countriesForAlert(alert) {
  return [primaryCountry(alert)];
}

function uniquePathForAlert(alert, countryIso, used) {
  const base = buildAlertPath(alert, { countryIso });
  let path = base;
  let n = 2;
  while (used.has(path)) {
    const parts = base.split('/');
    const slug = parts[parts.length - 1];
    parts[parts.length - 1] = `${slug}-${n}`;
    path = parts.join('/');
    n += 1;
  }
  used.add(path);
  return path;
}

function assignUniquePaths(alerts) {
  const used = new Set();
  return alerts.map((alert) => {
    const iso = primaryCountry(alert);
    const path = uniquePathForAlert(alert, iso, used);
    const slug = path.split('/').pop();
    return {
      ...alert,
      slug,
      _path: path,
      _paths: { [iso]: path },
      _canonical_url: path,
    };
  });
}

function pathForCountry(alert, iso) {
  if (!alert) return null;
  const key = String(iso || '').toUpperCase();
  if (alert._paths && alert._paths[key]) return alert._paths[key];
  return alert._path || null;
}

module.exports = {
  COUNTRY_SLUGS,
  SLUG_TO_ISO,
  DEMO_COUNTRIES,
  slugify,
  countrySlug,
  isoFromCountrySlug,
  primaryCountry,
  alertTitleForSlug,
  alertDateParts,
  buildAlertPath,
  parseArticlePath,
  assignUniquePaths,
  countriesForAlert,
  pathForCountry,
};
