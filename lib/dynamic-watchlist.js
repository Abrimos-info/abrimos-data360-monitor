'use strict';

const { search, listIndicators, headCsv, csvUrl } = require('./data360-client');

const COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];
const API_MAX_RESULTS = 100;

async function fetchRecentDatasets({ daysBack = 7, searchFn = search, referenceDate = new Date() } = {}) {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffStr = cutoff.toISOString().slice(0, 10); // YYYY-MM-DD

  const res = await searchFn({
    search: '*',
    orderby: 'series_description/date_last_update desc',
    top: API_MAX_RESULTS,
  });

  return (res.value || [])
    .filter((item) => item.type === 'dataset')
    .map((item) => ({
      database_id: item.series_description.database_id,
      name: item.series_description.name,
      date_last_update: item.series_description.date_last_update,
      csv_link: item.series_description.csv_link,
    }))
    .filter((ds) => ds.database_id && ds.date_last_update && ds.date_last_update >= cutoffStr);
}

async function expandDatasetToIndicators(datasetId, { listIndicatorsFn = listIndicators } = {}) {
  const codes = await listIndicatorsFn(datasetId);
  if (!Array.isArray(codes)) return [];
  return codes.map((code) => ({
    idno: `${datasetId}_${code}`,
    database_id: datasetId,
    label: `${datasetId}_${code}`,
    tier: 'dynamic',
  }));
}

async function buildDynamicWatchlist({
  daysBack = 7,
  referenceDate = new Date(),
  searchFn = search,
  listIndicatorsFn = listIndicators,
  headCsvFn = headCsv,
} = {}) {
  const datasets = await fetchRecentDatasets({ daysBack, searchFn, referenceDate });
  const watchlist = [];

  for (const ds of datasets) {
    const entries = await expandDatasetToIndicators(ds.database_id, { listIndicatorsFn });
    for (const entry of entries) {
      const url = csvUrl(entry.database_id, entry.idno);
      try {
        const head = await headCsvFn(url);
        if (head.status === 200) {
          watchlist.push({ ...entry, csv_url: url, date_last_update: ds.date_last_update });
        }
      } catch (_) {
        // indicator CSV not found — skip
      }
    }
  }

  return watchlist;
}

module.exports = { fetchRecentDatasets, expandDatasetToIndicators, buildDynamicWatchlist, COUNTRIES };
