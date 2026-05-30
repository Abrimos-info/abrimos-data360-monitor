'use strict';

/**
 * Public Data360 link helpers.
 *
 * Public Data360 surfaces (2026-05):
 *   - indicator page → /en/indicator/{IDNO}[?view=trend&country={ISO3}]
 *   - dataset search → /en/search?query={DATABASE_ID}
 *   - CSV blob       → data360files.worldbank.org
 *   - REST API       → data360api.worldbank.org
 */

const SITE_ORIGIN = 'https://data360.worldbank.org';
const SEARCH_BASE = `${SITE_ORIGIN}/en/search`;
const INDICATOR_BASE = `${SITE_ORIGIN}/en/indicator`;
const BLOB_DATA_BASE = 'https://data360files.worldbank.org/data360-data/data';
const API_BASE = 'https://data360api.worldbank.org/data360/data';

function datasetSearchUrl(databaseId) {
  if (!databaseId) return `${SEARCH_BASE}`;
  return `${SEARCH_BASE}?query=${encodeURIComponent(databaseId)}`;
}

/** Prefer search URL; rewrite legacy /en/int/dataset/{ID} from stored traces. */
function resolvePublicDatasetUrl(databaseId, storedUrl) {
  if (databaseId) return datasetSearchUrl(databaseId);
  const raw = storedUrl || '';
  const legacy = raw.match(/\/(?:int\/)?dataset\/([^/?#]+)/i);
  if (legacy) return datasetSearchUrl(legacy[1]);
  return raw || null;
}

function indicatorUrl(idno, opts = {}) {
  if (!idno) return `${INDICATOR_BASE}`;
  const base = `${INDICATOR_BASE}/${encodeURIComponent(idno)}`;
  const country = opts.country || opts.refArea || null;
  const view = opts.view || (country ? 'trend' : null);
  if (!country && !view) return base;
  const params = new URLSearchParams();
  if (view) params.set('view', view);
  if (country) params.set('country', country);
  return `${base}?${params.toString()}`;
}

/** @deprecated alias — prefer indicatorUrl */
function indicatorSearchUrl(idno, opts) {
  return indicatorUrl(idno, opts);
}

/** @deprecated alias — prefer datasetSearchUrl */
function datasetPageUrl(databaseId) {
  return datasetSearchUrl(databaseId);
}

/** @deprecated alias — prefer indicatorUrl */
function indicatorPageUrl(idno) {
  return indicatorUrl(idno);
}

function csvUrl(databaseId, idno) {
  return `${BLOB_DATA_BASE}/${databaseId}/${idno}.csv`;
}

function apiDataUrl(databaseId, idno, refArea, opts = {}) {
  const params = new URLSearchParams({
    DATABASE_ID: databaseId,
    INDICATOR: idno,
    top: String(opts.top || 100),
    skip: String(opts.skip || 0),
  });
  if (refArea) params.set('REF_AREA', refArea);
  return `${API_BASE}?${params.toString()}`;
}

module.exports = {
  SITE_ORIGIN,
  SEARCH_BASE,
  INDICATOR_BASE,
  datasetSearchUrl,
  resolvePublicDatasetUrl,
  indicatorUrl,
  indicatorSearchUrl,
  datasetPageUrl,
  indicatorPageUrl,
  csvUrl,
  apiDataUrl,
};
