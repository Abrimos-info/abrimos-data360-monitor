'use strict';

const fs = require('fs');
const path = require('path');
const views = require('./views');
const { isoFromCountrySlug, parseArticlePath } = require('./url-slug');

const ROUTES_PATH = path.join(__dirname, '..', 'config', 'routes.json');

let cachedRoutes = null;

function loadRoutesConfig() {
  if (cachedRoutes) return cachedRoutes;
  cachedRoutes = JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf8'));
  return cachedRoutes;
}

function clearRoutesCache() {
  cachedRoutes = null;
}

function segmentsMatchPattern(segments, pattern) {
  if (segments.length !== pattern.length) return null;
  const params = {};
  for (let i = 0; i < pattern.length; i += 1) {
    const pat = pattern[i];
    const seg = segments[i];
    if (pat.startsWith(':')) {
      params[pat.slice(1)] = decodeURIComponent(seg);
    } else if (pat !== seg) {
      return null;
    }
  }
  return params;
}

function matchRoute(segments) {
  const { routes } = loadRoutesConfig();
  for (const route of routes) {
    if (route.match === 'fallback') continue;

    if (route.match === 'exact') {
      const params = segmentsMatchPattern(segments, route.segments || []);
      if (params) return { viewName: route.viewName, params, routeId: route.id };
      continue;
    }

    if (route.match === 'countrySlug') {
      if (segments.length !== 1) continue;
      const slug = segments[0];
      if (!isoFromCountrySlug(slug)) continue;
      return {
        viewName: route.viewName,
        params: { countrySlug: slug },
        routeId: route.id,
      };
    }

    if (route.match === 'article') {
      if (segments.length !== 5) continue;
      const parsed = parseArticlePath(segments);
      if (!parsed) continue;
      return { viewName: route.viewName, params: { parsed }, routeId: route.id };
    }
  }

  const fallback = routes.find((r) => r.match === 'fallback');
  return {
    viewName: fallback ? fallback.viewName : 'notFoundPage',
    params: {},
    routeId: fallback ? fallback.id : 'not-found',
  };
}

async function invokeHandler(viewName, req, res, params) {
  const fn = views[viewName];
  if (typeof fn !== 'function') {
    throw new Error(`Unknown view handler: ${viewName}`);
  }

  switch (viewName) {
    case 'frontpagePage':
      return fn(req, res, params.countrySlug);
    case 'indicatorDetailPage':
      return fn(req, res, params.idno);
    case 'alertPage':
      return fn(req, res, params.parsed);
    case 'legacyDashboardPage': {
      const iso = req.parsedUrl.searchParams.get('country') || 'ARG';
      return fn(req, res, iso);
    }
    case 'newsletterEditionPage':
      return fn(req, res, params.date);
    case 'alertsSamplePage':
      return fn(req, res, params.countrySlug);
    case 'notFoundPage':
      return fn(req, res);
    default:
      return fn(req, res);
  }
}

async function dispatch(req, res) {
  const segments = req.segments || [];
  const match = matchRoute(segments);
  req.routeMatch = match;
  return invokeHandler(match.viewName, req, res, match.params);
}

function listViewNames() {
  return loadRoutesConfig().routes.map((r) => r.viewName);
}

module.exports = {
  loadRoutesConfig,
  clearRoutesCache,
  matchRoute,
  dispatch,
  listViewNames,
};
