'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildContext,
  pickPrimaryCountry,
  candidateCountries,
  formatDeltaLine,
} = require('../lib/analysis/context-builder');

const candidates = [
  { candidate_id: 'c1', type: 'abrupt_change', country: 'ECU', observation: { time_period: '2024', value: '1', unit_measure: '%' }, z_score: 3.2, claim_id: 'aaa' },
  { candidate_id: 'c2', type: 'anomaly', country: 'ARG', observation: { time_period: '2024', value: '2', unit_measure: '%' }, z_score: 1.1, claim_id: 'bbb' },
];

test('pickPrimaryCountry chooses highest |z|', () => {
  assert.equal(pickPrimaryCountry(candidates), 'ECU');
});

test('candidateCountries returns unique ISO3 list', () => {
  assert.deepEqual(candidateCountries(candidates).sort(), ['ARG', 'ECU']);
});

test('formatDeltaLine for RANK: rising rank means worse position', () => {
  const line = formatDeltaLine({
    observation: { time_period: '2025', value: '87', unit_measure: 'RANK' },
    previous: { time_period: '2024', value: '66' },
  });
  assert.match(line, /empeoró del puesto 66 al 87/);
  assert.match(line, /Δ=\+21 puestos/);
});

test('formatDeltaLine for RANK: falling rank means better position', () => {
  const line = formatDeltaLine({
    observation: { time_period: '2025', value: '77', unit_measure: 'RANK' },
    previous: { time_period: '2024', value: '94' },
  });
  assert.match(line, /mejoró del puesto 94 al 77/);
});

test('slim context includes only candidate countries not all LAC', () => {
  const seriesByCountry = {
    ECU: [{ time_period: '2023', value: '1', unit_measure: '%' }, { time_period: '2024', value: '2', unit_measure: '%' }],
    ARG: [{ time_period: '2024', value: '3', unit_measure: '%' }],
    MEX: [{ time_period: '2024', value: '9', unit_measure: '%' }],
  };
  const baseline = {
    ECU: { WB_X: [{ time_period: '2023', value: '1', unit_measure: 'U' }] },
    ARG: { WB_X: [{ time_period: '2023', value: '2', unit_measure: 'U' }] },
    MEX: { WB_X: [{ time_period: '2023', value: '3', unit_measure: 'U' }] },
  };
  const ctx = buildContext({
    idno: 'TEST_1',
    seriesByCountry,
    baselineSeriesByCountry: baseline,
    candidates,
    slim: true,
  });
  assert.match(ctx, /CONTEXTO SLIM/);
  assert.match(ctx, /### ECU/);
  assert.match(ctx, /### ARG/);
  assert.doesNotMatch(ctx, /### MEX/);
  assert.match(ctx, /País protagonista.*ECU/);
});

test('RANK candidate includes REDACTAR and NOTA UNIDAD in context', () => {
  const rankCandidates = [{
    candidate_id: 'c1',
    type: 'abrupt_change',
    country: 'ARG',
    observation: { time_period: '2025', value: '87', unit_measure: 'RANK' },
    previous: { time_period: '2024', value: '66' },
    z_score: 2.5,
    claim_id: 'abc',
  }];
  const ctx = buildContext({
    idno: 'RWB_PFI_OVRL',
    seriesByCountry: { ARG: [{ time_period: '2025', value: '87', unit_measure: 'RANK' }] },
    baselineSeriesByCountry: { ARG: {} },
    candidates: rankCandidates,
    slim: true,
  });
  assert.match(ctx, /NOTA UNIDAD: posición global \(RANK\)/);
  assert.match(ctx, /REDACTAR CON ESTOS VALORES:.*empeoró del puesto 66 al 87/);
});
