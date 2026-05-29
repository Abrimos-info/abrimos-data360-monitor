'use strict';

const fs = require('fs');
const path = require('path');
const pug = require('pug');

const i18n = require('./i18n');
const alertsStore = require('./alerts-store');
const { latestDetectedAt, headlineDateLabel } = require('./alert-display');
const { getDataAgeIso, getDataAgeSeconds } = require('./data-age');
const {
  DEMO_COUNTRIES,
  countrySlug,
  isoFromCountrySlug,
  parseArticlePath,
  pathForCountry,
} = require('./url-slug');
const { iso3ToFlagEmoji } = require('./country-flag');
const { indicatorSearchUrl, indicatorUrl } = require('./data360-urls');
const {
  recentUpdatedIndicators,
  watchlistByTier,
  indicatorPageData,
  countryTickerIndicators,
  indicatorKnown,
  buildIndicatorAlertCounts,
  attachAlertCounts,
  sortHubTierEntries,
  HUB_TIER_ORDER,
} = require('./indicators-hub');
const { renderSparklineSvg } = require('./sparkline');
const { renderReportajeChartForAlert } = require('./reportaje-chart');
const { enrichIndicator, enrichIndicatorList, indicatorFromAlert } = require('./indicator-display');
const { formatLlmDebugSummary, formatLlmDebugTitle, buildProductionMetaRows } = require('./analysis/llm-debug');
const { getStaticVersion, getCommitHash, staticAsset } = require('./static-version');

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
  return pickLang(req);
}

function langModeForRoute(req, route, lang, langMode) {
  return lang;
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

function parseCookie(req, name) {
  const raw = req.headers.cookie || '';
  const match = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function resolveSelectedCountryIso(req, extra = {}) {
  if (extra.countryIso && DEMO_COUNTRIES.includes(extra.countryIso)) return extra.countryIso;
  const fromCookie = parseCookie(req, 'd360_country');
  if (fromCookie && DEMO_COUNTRIES.includes(fromCookie)) return fromCookie;
  return null;
}

function monitorHomeUrlFor(iso) {
  return iso ? `/${countrySlug(iso)}` : '/';
}

function writeHtml(res, html, opts = {}) {
  const headers = { 'Content-Type': 'text/html; charset=utf-8' };
  if (opts.countryIso && DEMO_COUNTRIES.includes(opts.countryIso)) {
    headers['Set-Cookie'] = `d360_country=${opts.countryIso}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  res.writeHead(200, headers);
  res.end(html);
}

function seoLocals(req, pageKey, params = {}) {
  const lang = pickLang(req);
  return {
    pageTitle: i18n.getString(`page.${pageKey}.title`, lang, params),
    metaDescription: i18n.getString(`page.${pageKey}.description`, lang, params),
  };
}

function pageLocals(req, extra = {}) {
  const lang = pickLang(req);
  const rawLangMode = pickLangMode(req);
  const route = extra.activeRoute || 'monitor';
  const langMode = langModeForRoute(req, route, lang, rawLangMode);
  const countryLinks = DEMO_COUNTRIES.map((iso) => ({ iso, slug: countrySlug(iso) }));
  const selectedCountryIso = resolveSelectedCountryIso(req, extra);
  const monitorHomeUrl = monitorHomeUrlFor(selectedCountryIso);
  return {
    lang,
    langMode,
    stringsEs: i18n.getAll('es'),
    stringsEn: i18n.getAll('en'),
    _: i18n.getString,
    countryFlag: iso3ToFlagEmoji,
    countryLinks,
    selectedCountryIso,
    monitorHomeUrl,
    ...extra,
    countryLinks: extra.countryLinks || countryLinks,
    selectedCountryIso: extra.countryIso && DEMO_COUNTRIES.includes(extra.countryIso)
      ? extra.countryIso
      : selectedCountryIso,
    monitorHomeUrl: extra.countryIso && DEMO_COUNTRIES.includes(extra.countryIso)
      ? monitorHomeUrlFor(extra.countryIso)
      : monitorHomeUrl,
    indicatorSearchUrl,
    indicatorUrl,
    staticVersion: getStaticVersion(),
    commitHash: getCommitHash(),
    staticAsset,
    formatLlmDebugSummary,
    formatLlmDebugTitle,
    buildProductionMetaRows: (alert, lang) => buildProductionMetaRows(alert, lang, i18n.getString),
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
  if (alert.lead && alert.lead[lng]) return truncate(alert.lead[lng], 120);
  return alert.id;
}

function pickLead(alert, lang) {
  const lng = lang === 'en' ? 'en' : 'es';
  if (alert.lead && alert.lead[lng]) return alert.lead[lng];
  return '';
}

function editionLabel(iso, lang) {
  const countryName = i18n.getString(`chat.country.${iso}`, lang);
  const now = new Date();
  const locale = lang === 'en' ? 'en-US' : 'es-AR';
  const monthName = now.toLocaleString(locale, { month: 'long', timeZone: 'UTC' });
  const year = String(now.getUTCFullYear());
  return i18n.getString('frontpage.edition', lang, { country: countryName, month: monthName, year });
}

function interleaveHeadlines(noticias, reportajes) {
  const items = [];
  const reps = [...reportajes];
  let repIdx = 0;
  noticias.forEach((n, i) => {
    items.push({ kind: 'noticia', alert: n });
    if ((i + 1) % 3 === 0 && repIdx < reps.length) {
      items.push({ kind: 'reportaje', alert: reps[repIdx] });
      repIdx += 1;
    }
  });
  while (repIdx < reps.length) {
    items.push({ kind: 'reportaje', alert: reps[repIdx] });
    repIdx += 1;
  }
  return items;
}

function makeReportajeChartRenderer(lang, focusCountry) {
  return (reportaje, variant = 'full') => renderReportajeChartForAlert(
    reportaje,
    (id) => alertsStore.getAlertById(id),
    {
      variant,
      lang,
      focusCountry,
      getAllAlerts: () => alertsStore.getAlerts(),
      labels: {
        title: i18n.getString('reportaje.chart.title', lang),
        empty: i18n.getString('reportaje.chart.empty', lang),
      },
    },
  );
}

function frontpageData(iso, lang) {
  const all = alertsStore.getAlertsForCountry(iso);
  const reportajes = all.filter((a) => a.content_type === 'reportaje');
  const noticias = all.filter((a) => (a.content_type || 'noticia') !== 'reportaje');
  reportajes.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const heroReportaje = reportajes[0] || null;
  const inlineReportajes = heroReportaje ? reportajes.slice(1) : reportajes;
  const headlineItems = interleaveHeadlines(noticias, inlineReportajes);
  const tickerIndicators = countryTickerIndicators(iso, 10);
  return {
    heroReportaje,
    headlineItems,
    noticias,
    tickerIndicators,
    all,
    editionLabel: editionLabel(iso, lang),
  };
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

  const lang = pickLang(req);
  const recentIndicators = enrichIndicatorList(recentUpdatedIndicators(12), lang);
  const html = getTemplate('country-picker')(pageLocals(req, {
    activeRoute: 'monitor',
    demoCountries: DEMO_COUNTRIES,
    countryLinks: DEMO_COUNTRIES.map((iso) => ({ iso, slug: countrySlug(iso) })),
    recentIndicators,
    ...seoLocals(req, 'home'),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function frontpagePage(req, res, countrySlugParam) {
  const iso = isoFromCountrySlug(countrySlugParam);
  if (!iso) return notFoundPage(req, res);

  if (req.parsedUrl.searchParams.get('legacy') === '1') {
    return legacyDashboardPage(req, res, iso);
  }

  const lang = pickLang(req);
  const allAlerts = alertsStore.getAlerts();
  const {
    heroReportaje,
    headlineItems,
    tickerIndicators,
    editionLabel: editionText,
  } = frontpageData(iso, lang);
  const dataAgeSeconds = getDataAgeSeconds(allAlerts);
  const dataAgeIso = getDataAgeIso(allAlerts);

  const countryName = i18n.getString(`chat.country.${iso}`, lang);

  const html = getTemplate('frontpage')(pageLocals(req, {
    activeRoute: 'monitor',
    countryIso: iso,
    countrySlug: countrySlugParam,
    heroReportaje,
    headlineItems,
    tickerIndicators,
    editionLabel: editionText,
    lastUpdateIso: latestDetectedAt(allAlerts),
    dataAgeSeconds,
    dataAgeIso,
    categories: alertsStore.getCategories(),
    pickHeadline,
    pickLead,
    headlineDateLabel,
    pathForCountry,
    renderSparklineSvg,
    renderReportajeChart: makeReportajeChartRenderer(lang, iso),
    indicatorFromAlert,
    enrichIndicator: (entry) => enrichIndicator(entry, lang),
    countryLinks: DEMO_COUNTRIES.map((cIso) => ({ iso: cIso, slug: countrySlug(cIso) })),
    ...seoLocals(req, 'country', { country: countryName }),
  }));

  writeHtml(res, html, { countryIso: iso });
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
    lastUpdateIso: latestDetectedAt(allAlerts),
    countries: alertsStore.getCountries(),
    categories: alertsStore.getCategories(),
    pathForCountry,
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function indicatorsHubPage(req, res) {
  const lang = pickLang(req);
  const alertCounts = buildIndicatorAlertCounts();
  const tiersRaw = watchlistByTier();
  const tiers = {};
  for (const [key, list] of Object.entries(tiersRaw)) {
    const withCounts = attachAlertCounts(list, alertCounts);
    tiers[key] = sortHubTierEntries(enrichIndicatorList(withCounts, lang), key);
  }
  const recentIndicators = enrichIndicatorList(
    attachAlertCounts(recentUpdatedIndicators(16), alertCounts),
    lang,
  );
  const allAlerts = alertsStore.getAlerts();
  const html = getTemplate('indicators-hub')(pageLocals(req, {
    activeRoute: 'indicators',
    tiers,
    tierOrder: HUB_TIER_ORDER,
    recentIndicators,
    lastUpdateIso: getDataAgeIso(allAlerts),
    demoCountries: DEMO_COUNTRIES,
    countryLinks: DEMO_COUNTRIES.map((iso) => ({ iso, slug: countrySlug(iso) })),
    ...seoLocals(req, 'indicators'),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function indicatorDetailPage(req, res, idno) {
  if (!idno || !indicatorKnown(idno)) return notFoundPage(req, res);
  const lang = pickLang(req);
  const { catalog, alerts, byCountry } = indicatorPageData(idno);
  const indicatorMeta = enrichIndicatorList([catalog], lang)[0];
  const allAlerts = alertsStore.getAlerts();
  const html = getTemplate('indicator-page')(pageLocals(req, {
    activeRoute: 'indicators',
    idno,
    catalog: indicatorMeta,
    alerts,
    byCountry,
    demoCountries: DEMO_COUNTRIES,
    lastUpdateIso: getDataAgeIso(allAlerts),
    pickHeadline,
    pickLead,
    headlineDateLabel,
    pathForCountry,
    enrichIndicator: (entry) => enrichIndicator(entry, lang),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function alertPage(req, res, parsed) {
  const pathKey = `/${parsed.countrySlug}/${parsed.type}/${parsed.year}/${parsed.month}/${parsed.slug}`;
  let alert = alertsStore.getAlertByPath(pathKey);
  if (!alert) {
    const candidates = alertsStore.getAlerts().filter((a) => {
      const p = pathForCountry(a, parsed.iso) || a._path;
      if (!p) return false;
      const parts = p.split('/');
      return parts[parts.length - 1] === parsed.slug
        && parts[1] === parsed.type
        && parts[2] === parsed.year
        && parts[3] === parsed.month;
    });
    alert = candidates[0] || null;
  }
  if (!alert) return notFoundPage(req, res);

  const lang = pickLang(req);
  const lng = lang === 'en' ? 'en' : 'es';
  const headline = pickHeadline(alert, lang);
  const lead = pickLead(alert, lang);
  const canonical = pathKey || pathForCountry(alert, parsed.iso) || alert._path;
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
    enrichIndicator: (entry) => enrichIndicator(entry, lng),
    indicatorFromAlert: (a) => indicatorFromAlert(a, lang),
    renderReportajeChart: makeReportajeChartRenderer(lng, parsed.iso),
    productionMetaRows: buildProductionMetaRows(alert, lang, i18n.getString),
  }));

  writeHtml(res, html, { countryIso: parsed.iso });
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

async function chatPage(req, res) {
  const lang = pickLang(req);
  const { loadChatPresets: loadPresets, loadFreshnessReport } = require('./chat/freshness-preset');
  const freshnessReport = loadFreshnessReport();
  const freshnessCatalog = freshnessReport.catalog || [];
  const freshnessProbedAt = freshnessReport.probed_at || null;

  const html = getTemplate('chat')(pageLocals(req, {
    activeRoute: 'chat',
    presets: loadPresets(lang),
    freshnessCatalog,
    freshnessProbedAt,
    demoCountries: DEMO_COUNTRIES,
    allAlerts: alertsStore.getAlerts(),
    includeFloatingChat: false,
    ...seoLocals(req, 'chat'),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function aboutPage(req, res) {
  const demo = alertsStore.findPcnDemoAlert();
  const html = getTemplate('about')(pageLocals(req, {
    activeRoute: 'about',
    pcnDemoPath: demo ? demo.path : null,
    ...seoLocals(req, 'about'),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const staticPages = require('./pages/static-pages').createStaticPageHandlers({
  getTemplate,
  pageLocals,
  seoLocals,
});
const {
  metodologiaPage,
  privacidadPage,
  terminosPage,
  usoPage,
} = staticPages;

async function newsletterIndexPage(req, res) {
  const { loadLatestEditionDate } = require('./newsletter/editions');
  const date = loadLatestEditionDate('lac') || '2026-05-28';
  return redirect(res, `/newsletter/lac/${date}`);
}

async function newsletterEditionPage(req, res, dateIso) {
  const { loadEdition, renderEditionHtml, listEditions } = require('./newsletter/editions');
  const lang = pickLang(req);
  const edition = loadEdition('lac', dateIso);
  if (!edition) return notFoundPage(req, res);
  const allEditions = listEditions('lac').slice().reverse();
  const html = renderEditionHtml(edition, pageLocals(req, {
    activeRoute: 'newsletter',
    edition,
    dateIso,
    allEditions,
    lang,
    ...seoLocals(req, 'newsletter'),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function alertsSamplePage(req, res, countrySlugParam) {
  const iso = isoFromCountrySlug(countrySlugParam);
  if (!iso) return notFoundPage(req, res);
  const lang = pickLang(req);
  const indicators = enrichIndicatorList(
    recentUpdatedIndicators(12).filter((e) => !e.countries || e.countries.includes(iso)),
    lang,
  );
  const html = getTemplate('alerts-sample')(pageLocals(req, {
    activeRoute: 'newsletter',
    countryIso: iso,
    countrySlug: countrySlugParam,
    indicators,
    editionLabel: editionLabel(iso, lang),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function notFoundPage(req, res) {
  const lang = pickLang(req);
  try {
    const html = getTemplate('not-found')(pageLocals(req, {
      activeRoute: 'monitor',
      ...seoLocals(req, 'not_found'),
    }));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  } catch (_) {
    /* fallback */
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset="utf-8"><title>404</title><h1>No encontrado</h1>');
}

async function routePage(req, res) {
  return require('./route-registry').dispatch(req, res);
}

module.exports = {
  countryPickerPage,
  frontpagePage,
  alertPage,
  legacyDashboardPage,
  dashboardPage: legacyDashboardPage,
  chatPage,
  aboutPage,
  metodologiaPage,
  privacidadPage,
  terminosPage,
  usoPage,
  newsletterIndexPage,
  newsletterEditionPage,
  alertsSamplePage,
  indicatorsHubPage,
  indicatorDetailPage,
  notFoundPage,
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