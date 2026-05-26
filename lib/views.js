'use strict';

const fs = require('fs');
const path = require('path');
const pug = require('pug');

const i18n = require('./i18n');
const alertsStore = require('./alerts-store');
const { latestDetectedAt, formatLastUpdate } = require('./alert-display');
const { getDataAgeIso, getDataAgeSeconds } = require('./data-age');
const {
  DEMO_COUNTRIES,
  countrySlug,
  isoFromCountrySlug,
  parseArticlePath,
} = require('./url-slug');
const { iso3ToFlagEmoji } = require('./country-flag');
const { indicatorSearchUrl, indicatorUrl } = require('./data360-urls');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const ARTICLE_CHAT_PRESETS_PATH = path.join(ROOT, 'config', 'article-chat-presets.json');

const templateCache = new Map();
let articleChatPresetsCache = null;

function loadArticleChatPresets() {
  if (articleChatPresetsCache) return articleChatPresetsCache;
  try {
    articleChatPresetsCache = JSON.parse(fs.readFileSync(ARTICLE_CHAT_PRESETS_PATH, 'utf8'));
  } catch (_) {
    articleChatPresetsCache = [];
  }
  return articleChatPresetsCache;
}

function getTemplate(name) {
  if (templateCache.has(name)) return templateCache.get(name);
  const filepath = path.join(TEMPLATES_DIR, `${name}.pug`);
  const fn = pug.compileFile(filepath, { cache: false, pretty: false });
  templateCache.set(name, fn);
  return fn;
}

function clearTemplateCache() {
  templateCache.clear();
}

function pickLang(req) {
  const url = req.parsedUrl;
  const q = url.searchParams.get('lang');
  if (q === 'es' || q === 'en') return q;
  const m = url.searchParams.get('langMode');
  if (m === 'es' || m === 'en') return m;
  const accept = (req.headers['accept-language'] || '').toLowerCase();
  if (accept.startsWith('en')) return 'en';
  return 'es';
}

function pickLangMode(req) {
  const m = req.parsedUrl.searchParams.get('langMode');
  if (m === 'es' || m === 'en') return m;
  if (m === 'both') return pickLang(req);
  return pickLang(req);
}

function langModeForRoute(req, route, lang, langMode) {
  if (route === 'monitor') return langMode === 'both' ? lang : langMode;
  return langMode;
}

function readFilters(req) {
  const sp = req.parsedUrl.searchParams;
  const variant = sp.get('variant');
  const contentType = sp.get('content_type');
  return {
    country: sp.get('country') || 'ALL',
    category: sp.get('category') || 'ALL',
    content_type: ['noticia', 'reportaje'].includes(contentType) ? contentType : 'ALL',
    variant: ['narr', 'num', 'news'].includes(variant) ? variant : 'narr',
    alert: sp.get('alert') || null,
  };
}

function matchesCountry(a, iso) {
  if (a.country === iso) return true;
  if (Array.isArray(a._countries) && a._countries.includes(iso)) return true;
  if (Array.isArray(a.countries) && a.countries.includes(iso)) return true;
  return false;
}

function applyFilters(alerts, filters) {
  return alerts.filter((a) => {
    if (filters.country !== 'ALL' && !matchesCountry(a, filters.country)) return false;
    if (filters.category !== 'ALL' && a.category !== filters.category) return false;
    if (filters.content_type && filters.content_type !== 'ALL') {
      const ct = a.content_type || 'noticia';
      if (ct !== filters.content_type) return false;
    }
    return true;
  });
}

function pageLocals(req, extra = {}) {
  const lang = pickLang(req);
  const rawLangMode = pickLangMode(req);
  const route = extra.activeRoute || 'monitor';
  const langMode = langModeForRoute(req, route, lang, rawLangMode);
  return {
    lang,
    langMode,
    stringsEs: i18n.getAll('es'),
    stringsEn: i18n.getAll('en'),
    _: i18n.getString,
    countryFlag: iso3ToFlagEmoji,
    ...extra,
    indicatorSearchUrl,
    indicatorUrl,
  };
}

function redirect(res, location, permanent = false) {
  res.writeHead(permanent ? 301 : 302, { Location: location });
  res.end();
}

function truncate(text, max = 160) {
  if (!text) return '';
  const s = String(text);
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function pickHeadline(alert, lang) {
  const lng = lang === 'en' ? 'en' : 'es';
  if (alert.title && alert.title[lng]) return alert.title[lng];
  if (alert._title) return alert._title;
  if (alert.narrative_citizen && alert.narrative_citizen[lng]) return alert.narrative_citizen[lng];
  return alert.id;
}

function pickLead(alert, lang) {
  const lng = lang === 'en' ? 'en' : 'es';
  if (alert.lead && alert.lead[lng]) return alert.lead[lng];
  if (alert.narrative_journalist && alert.narrative_journalist[lng]) return alert.narrative_journalist[lng];
  return '';
}

function frontpageData(iso, lang) {
  const all = alertsStore.getAlertsForCountry(iso);
  const reportajes = all.filter((a) => a.content_type === 'reportaje');
  const noticias = all.filter((a) => (a.content_type || 'noticia') !== 'reportaje');
  reportajes.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const heroReportaje = reportajes[0] || null;
  const secondaryReportajes = reportajes.slice(1, 3);
  return { heroReportaje, secondaryReportajes, noticias, all };
}

async function countryPickerPage(req, res) {
  const alertId = req.parsedUrl.searchParams.get('alert');
  if (alertId) {
    const alert = alertsStore.getAlertById(alertId);
    if (alert && alert._path) {
      const q = req.parsedUrl.searchParams.toString();
      const suffix = q ? `?${q.replace(/(^|&)alert=[^&]*&?/, '$1').replace(/&$/, '')}` : '';
      return redirect(res, `${alert._path}${suffix}`, true);
    }
  }

  const html = getTemplate('country-picker')(pageLocals(req, {
    activeRoute: 'monitor',
    demoCountries: DEMO_COUNTRIES,
    countryLinks: DEMO_COUNTRIES.map((iso) => ({ iso, slug: countrySlug(iso) })),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function frontpagePage(req, res, countrySlugParam) {
  const iso = isoFromCountrySlug(countrySlugParam);
  if (!iso) return notFoundPage(res);

  if (req.parsedUrl.searchParams.get('legacy') === '1') {
    return legacyDashboardPage(req, res, iso);
  }

  const lang = pickLang(req);
  const allAlerts = alertsStore.getAlerts();
  const { heroReportaje, secondaryReportajes, noticias } = frontpageData(iso, lang);
  const dataAgeSeconds = getDataAgeSeconds(allAlerts);
  const dataAgeIso = getDataAgeIso(allAlerts);

  const html = getTemplate('frontpage')(pageLocals(req, {
    activeRoute: 'monitor',
    countryIso: iso,
    countrySlug: countrySlugParam,
    heroReportaje,
    secondaryReportajes,
    noticias,
    lastUpdate: formatLastUpdate(latestDetectedAt(allAlerts)),
    dataAgeSeconds,
    dataAgeIso,
    categories: alertsStore.getCategories(),
    pickHeadline,
    pickLead,
  }));

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function legacyDashboardPage(req, res, countryIso) {
  const filters = { ...readFilters(req), country: countryIso };
  const allAlerts = alertsStore.getAlerts();
  const visibleAlerts = applyFilters(allAlerts, filters);
  const html = getTemplate('dashboard')(pageLocals(req, {
    activeRoute: 'monitor',
    filters,
    allAlerts,
    visibleAlerts,
    selectedAlertId: filters.alert,
    lastUpdate: formatLastUpdate(latestDetectedAt(allAlerts)),
    countries: alertsStore.getCountries(),
    categories: alertsStore.getCategories(),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function alertPage(req, res, parsed) {
  const pathKey = `/${parsed.countrySlug}/${parsed.type}/${parsed.year}/${parsed.month}/${parsed.slug}`;
  let alert = alertsStore.getAlertByPath(pathKey);
  if (!alert) {
    const candidates = alertsStore.getAlerts().filter((a) => {
      const parts = (a._path || '').split('/');
      return parts[parts.length - 1] === parsed.slug
        && parts[1] === parsed.type
        && parts[2] === parsed.year
        && parts[3] === parsed.month;
    });
    alert = candidates[0] || null;
  }
  if (!alert) return notFoundPage(res);

  const lang = pickLang(req);
  const lng = lang === 'en' ? 'en' : 'es';
  const headline = pickHeadline(alert, lang);
  const lead = pickLead(alert, lang);
  const canonical = alert._path || pathKey;
  const countryName = i18n.getString(`chat.country.${parsed.iso}`, lang);
  const siteName = i18n.getString('site_name', lang);
  const pageTitle = `${headline} · ${countryName} · ${siteName}`;

  const html = getTemplate('alert-page')(pageLocals(req, {
    activeRoute: 'article',
    alert,
    countryIso: parsed.iso,
    countrySlug: parsed.countrySlug,
    canonical,
    pageTitle,
    metaDescription: truncate(lead || headline),
    publishedTime: alert.detected_at || null,
    jsonLd: buildJsonLd(alert, canonical, headline, lead, lng),
    articlePresets: loadArticleChatPresets(),
  }));

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function buildJsonLd(alert, canonical, headline, lead, lng) {
  const isReportaje = alert.content_type === 'reportaje';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': isReportaje ? 'Article' : 'NewsArticle',
    headline,
    description: lead,
    datePublished: alert.detected_at || undefined,
    author: { '@type': 'Organization', name: `${i18n.getString('site_name', lng === 'en' ? 'en' : 'es')} / Abrimos.info` },
    url: canonical,
  });
}

async function chatRedirectPage(req, res) {
  redirect(res, '/');
}

async function aboutPage(req, res) {
  const html = getTemplate('about')(pageLocals(req, {
    activeRoute: 'about',
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function notFoundPage(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset="utf-8"><title>404</title><h1>No encontrado</h1>');
}

async function routePage(req, res) {
  const segments = req.segments || [];
  const alertId = req.parsedUrl.searchParams.get('alert');

  if (segments.length === 0) {
    return countryPickerPage(req, res);
  }

  if (segments.length === 1) {
    if (segments[0] === 'about') return aboutPage(req, res);
    if (segments[0] === 'chat') return chatRedirectPage(req, res);
    if (segments[0] === 'dev' && segments[1] === 'feed') {
      /* handled below if 2 segments */
    }
    if (isoFromCountrySlug(segments[0])) {
      return frontpagePage(req, res, segments[0]);
    }
    return notFoundPage(res);
  }

  if (segments.length === 2 && segments[0] === 'dev' && segments[1] === 'feed') {
    const iso = req.parsedUrl.searchParams.get('country') || 'ARG';
    return legacyDashboardPage(req, res, iso);
  }

  if (segments.length === 5) {
    const parsed = parseArticlePath(segments);
    if (parsed) return alertPage(req, res, parsed);
  }

  return notFoundPage(res);
}

module.exports = {
  countryPickerPage,
  frontpagePage,
  alertPage,
  legacyDashboardPage,
  dashboardPage: legacyDashboardPage,
  chatPage: chatRedirectPage,
  aboutPage,
  routePage,
  clearTemplateCache,
  pickLang,
  pickLangMode,
  langModeForRoute,
  readFilters,
  applyFilters,
  pickHeadline,
  pickLead,
};