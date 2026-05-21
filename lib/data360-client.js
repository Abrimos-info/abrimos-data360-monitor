'use strict';

const axios = require('axios');

const API_BASE = process.env.DATA360_API_BASE || 'https://data360api.worldbank.org';
const UA = 'abrimos-data360-monitor/0.1 (https://github.com/Abrimos-info/abrimos-data360-monitor)';

const http = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: {
    'User-Agent': UA,
    'Accept': 'application/json',
  },
});

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

module.exports = { getMetadata, getData, search, API_BASE };
