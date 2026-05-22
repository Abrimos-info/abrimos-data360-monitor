'use strict';

function head200(overrides = {}) {
  return {
    status: 200,
    etag: overrides.etag || '"etag-200"',
    lastModified: overrides.lastModified || 'Wed, 21 May 2025 12:00:00 GMT',
    changed: true,
  };
}

function head304(overrides = {}) {
  return {
    status: 304,
    etag: overrides.etag || null,
    lastModified: overrides.lastModified || null,
    changed: false,
  };
}

function headError(status) {
  return { status, etag: null, lastModified: null, changed: false };
}

function get200(body, overrides = {}) {
  return {
    status: 200,
    body: body ?? 'indicator,country,time_period,OBS_VALUE\n',
    etag: overrides.etag || '"etag-200"',
    lastModified: overrides.lastModified || 'Wed, 21 May 2025 12:00:00 GMT',
  };
}

function get304() {
  return { status: 304, body: null, etag: null, lastModified: null };
}

module.exports = { head200, head304, headError, get200, get304 };
