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

  function resolvePublicDatasetUrl(databaseId, storedUrl) {
    if (databaseId) return datasetSearchUrl(databaseId);
    var raw = storedUrl || '';
    var legacy = raw.match(/\/(?:int\/)?dataset\/([^/?#]+)/i);
    if (legacy) return datasetSearchUrl(legacy[1]);
    return raw || null;
  }

  function indicatorUrl(idno, opts) {
    opts = opts || {};
    if (!idno) return INDICATOR_BASE;
    var base = INDICATOR_BASE + '/' + encodeURIComponent(idno);
    var country = opts.country || opts.refArea || null;
    var view = opts.view || (country ? 'trend' : null);
    if (!country && !view) return base;
    var params = [];
    if (view) params.push('view=' + encodeURIComponent(view));
    if (country) params.push('country=' + encodeURIComponent(country));
    return base + '?' + params.join('&');
  }

  function indicatorSearchUrl(idno, opts) {
    return indicatorUrl(idno, opts);
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
    resolvePublicDatasetUrl: resolvePublicDatasetUrl,
    indicatorUrl: indicatorUrl,
    indicatorSearchUrl: indicatorSearchUrl,
    datasetPageUrl: datasetPageUrl,
    indicatorPageUrl: indicatorPageUrl,
    csvUrl: csvUrl,
  };
})(typeof window !== 'undefined' ? window : globalThis);
