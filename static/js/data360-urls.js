(function (global) {
  'use strict';

  var SITE_ORIGIN = 'https://data360.worldbank.org';
  var SEARCH_BASE = SITE_ORIGIN + '/en/search';
  var INDICATOR_BASE = SITE_ORIGIN + '/en/indicator';
  var BLOB_DATA_BASE = 'https://data360files.worldbank.org/data360-data/data';

  function datasetSearchUrl(databaseId) {
    if (!databaseId) return SEARCH_BASE;
    return SEARCH_BASE + '?query=' + encodeURIComponent(databaseId);
  }

  function indicatorUrl(idno) {
    if (!idno) return INDICATOR_BASE;
    return INDICATOR_BASE + '/' + encodeURIComponent(idno);
  }

  function indicatorSearchUrl(idno) {
    return indicatorUrl(idno);
  }

  function datasetPageUrl(databaseId) {
    return datasetSearchUrl(databaseId);
  }

  function indicatorPageUrl(idno) {
    return indicatorUrl(idno);
  }

  function csvUrl(databaseId, idno) {
    return BLOB_DATA_BASE + '/' + databaseId + '/' + idno + '.csv';
  }

  global.D360Urls = {
    SITE_ORIGIN: SITE_ORIGIN,
    SEARCH_BASE: SEARCH_BASE,
    INDICATOR_BASE: INDICATOR_BASE,
    datasetSearchUrl: datasetSearchUrl,
    indicatorUrl: indicatorUrl,
    indicatorSearchUrl: indicatorSearchUrl,
    datasetPageUrl: datasetPageUrl,
    indicatorPageUrl: indicatorPageUrl,
    csvUrl: csvUrl,
  };
})(typeof window !== 'undefined' ? window : globalThis);
