'use strict';

/**
 * Public Data360 link helpers.
 *
 * Public Data360 surfaces (2026-05):
 *   - indicator page → /en/indicator/{IDNO}
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

function indicatorUrl(idno) {
  if (!idno) return `${INDICATOR_BASE}`;
  return `${INDICATOR_BASE}/${encodeURIComponent(idno)}`;
}

/** @deprecated alias — prefer indicatorUrl */
function indicatorSearchUrl(idno) {
  return indicatorUrl(idno);
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
  indicatorUrl,
  indicatorSearchUrl,
  datasetPageUrl,
  indicatorPageUrl,
  csvUrl,
  apiDataUrl,
};
