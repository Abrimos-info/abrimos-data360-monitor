'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { getWatchlist, getTierFile, COUNTRIES } = require('../lib/watchlist');

test('getWatchlist has 35 unique idnos', () => {
  const list = getWatchlist();
  assert.equal(list.length, 35);
  const idnos = list.map((e) => e.idno);
  assert.equal(idnos.length, new Set(idnos).size);
});

test('tier counts 10 pulse + 16 annual + 9 forecast', () => {
  const list = getWatchlist();
  const pulse = list.filter((e) => e.tier === 'pulse').length;
  const annual = list.filter((e) => e.tier === 'annual').length;
  const forecast = list.filter((e) => e.tier === 'forecast').length;
  assert.equal(pulse, 10);
  assert.equal(annual, 16);
  assert.equal(forecast, 9);
});

test('getTierFile maps tiers to csv filenames', () => {
  assert.equal(getTierFile('pulse'), 'pulse.csv');
  assert.equal(getTierFile('annual'), 'annual.csv');
  assert.equal(getTierFile('forecast'), 'forecast.csv');
});

test('demo countries constant', () => {
  assert.deepEqual(COUNTRIES, ['GTM', 'HND', 'ARG', 'ECU', 'MEX']);
});
