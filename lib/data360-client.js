'use strict';

const axios = require('axios');

const API_BASE = process.env.DATA360_API_BASE || 'https://data360api.worldbank.org';
const BLOB_BASE = 'https://data360files.worldbank.org/data360-data/data';
const UA = 'abrimos-data360-monitor/0.1 (https://github.com/Abrimos-info/abrimos-data360-monitor)';

const http = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: {
    'User-Agent': UA,
    'Accept': 'application/json',
  },
});

const blobHttp = axios.create({
  timeout: 120000,
  headers: { 'User-Agent': UA },
});

function csvUrl(databaseId, idno) {
  return `${BLOB_BASE}/${databaseId}/${idno}.csv`;
}

async function getMetadata(indicator) {
  const body = { query: `&$filter=series_description/idno eq '${indicator}'` };
  const res = await http.post('/data360/metadata', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

async function getData(databaseId, indicator, refArea, opts = {}) {
  const params = {
    DATABASE_ID: databaseId,
    INDICATOR: indicator,
    REF_AREA: refArea,
    top: opts.top || 5000,
    skip: opts.skip || 0,
  };
  const res = await http.get('/data360/data', { params });
  return res.data;
}

async function search(query) {
  const res = await http.post('/data360/searchv2', query, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

async function listIndicators(datasetId) {
  const res = await http.get('/data360/indicators', { params: { datasetId } });
  return res.data;
}

/**
 * HEAD a bulk CSV blob. Pass prior { etag, lastModified } for conditional request.
 * Returns { status, etag, lastModified, changed } where changed = status !== 304.
 */
async function headCsv(url, cache) {
  const headers = {};
  if (cache?.etag) headers['If-None-Match'] = cache.etag;
  if (cache?.lastModified) headers['If-Modified-Since'] = cache.lastModified;

  const res = await blobHttp.head(url, {
    headers,
    validateStatus: () => true,
  });

  return {
    status: res.status,
    etag: res.headers.etag || null,
    lastModified: res.headers['last-modified'] || null,
    changed: res.status !== 304,
  };
}

/** GET full CSV text. Optional conditional headers from cache. */
async function getCsv(url, cache) {
  const headers = {};
  if (cache?.etag) headers['If-None-Match'] = cache.etag;
  if (cache?.lastModified) headers['If-Modified-Since'] = cache.lastModified;

  const res = await blobHttp.get(url, {
    headers,
    responseType: 'text',
    validateStatus: () => true,
  });

  return {
    status: res.status,
    body: res.status === 200 ? res.data : null,
    etag: res.headers.etag || null,
    lastModified: res.headers['last-modified'] || null,
  };
}

module.exports = {
  getMetadata,
  getData,
  search,
  listIndicators,
  headCsv,
  getCsv,
  csvUrl,
  API_BASE,
  BLOB_BASE,
};
