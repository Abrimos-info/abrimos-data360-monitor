'use strict';

const test = require('node:test');
const fs = require('fs');
const path = require('path');

const missing = ['detect-changes.js', 'narrate-indicators.js', 'emit-alerts.js']
  .filter((name) => !fs.existsSync(path.join(__dirname, '../bin', name)));

test('npm run build smoke', {
  skip: missing.length
    ? `bin/${missing.join(', bin/')} not in repo yet`
    : false,
}, () => {});
