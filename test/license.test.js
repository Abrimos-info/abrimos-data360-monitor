'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

test('package license matches LICENSE file', () => {
  const licensePath = path.join(__dirname, '..', 'LICENSE');
  assert.ok(fs.existsSync(licensePath));
  const text = fs.readFileSync(licensePath, 'utf8');
  assert.match(text, /GNU GENERAL PUBLIC LICENSE/);
  assert.equal(pkg.license, 'GPL-3.0-or-later');
});
