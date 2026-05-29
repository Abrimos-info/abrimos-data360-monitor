'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countNoticias,
  countNoticiasByCountry,
  evaluateIndicatorLimit,
  recordNoticias,
  resolveLimits,
  isLimitEnabled,
} = require('../lib/analysis/analysis-limits');

test('countNoticias ignores reportajes', () => {
  const alerts = [
    { content_type: 'noticia', country: 'ARG' },
    { content_type: 'reportaje', country: 'ARG' },
    { country: 'MEX' },
  ];
  assert.equal(countNoticias(alerts), 2);
  assert.deepEqual(countNoticiasByCountry(alerts), { ARG: 1, MEX: 1 });
});

test('evaluateIndicatorLimit enforces run cap before country cap', () => {
  const limits = { maxPerCountry: 2, maxPerRun: 3 };
  const atRunCap = evaluateIndicatorLimit({
    primaryCountry: 'ARG',
    countryCounts: { ARG: 0 },
    runCount: 3,
    limits,
  });
  assert.equal(atRunCap.skip, true);
  assert.equal(atRunCap.reason, 'run_cap');
});

test('evaluateIndicatorLimit enforces country cap', () => {
  const limits = { maxPerCountry: 2, maxPerRun: 0 };
  const atCountryCap = evaluateIndicatorLimit({
    primaryCountry: 'MEX',
    countryCounts: { MEX: 2 },
    runCount: 2,
    limits,
  });
  assert.equal(atCountryCap.skip, true);
  assert.equal(atCountryCap.reason, 'country_cap');
});

test('recordNoticias increments counters for validated alerts', () => {
  const countryCounts = { ARG: 1 };
  const added = recordNoticias(countryCounts, [{ country: 'MEX' }, { country: 'MEX' }], {
    primaryCountry: 'MEX',
  });
  assert.equal(added, 2);
  assert.deepEqual(countryCounts, { ARG: 1, MEX: 2 });
});

test('resolveLimits reads env defaults when unset', () => {
  const prevCountry = process.env.ANALYSIS_MAX_NOTICIAS_PER_COUNTRY;
  const prevRun = process.env.ANALYSIS_MAX_NOTICIAS_PER_RUN;
  delete process.env.ANALYSIS_MAX_NOTICIAS_PER_COUNTRY;
  delete process.env.ANALYSIS_MAX_NOTICIAS_PER_RUN;
  try {
    const limits = resolveLimits();
    assert.equal(limits.maxPerCountry, 0);
    assert.equal(limits.maxPerRun, 0);
    assert.equal(isLimitEnabled(limits), false);
  } finally {
    if (prevCountry != null) process.env.ANALYSIS_MAX_NOTICIAS_PER_COUNTRY = prevCountry;
    if (prevRun != null) process.env.ANALYSIS_MAX_NOTICIAS_PER_RUN = prevRun;
  }
});
