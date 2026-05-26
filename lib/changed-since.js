'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_CHANGED_SINCE = path.join(REPO_ROOT, 'data', 'changed-since.json');

function loadChangedIdnos(changedSincePath = DEFAULT_CHANGED_SINCE) {
  if (!fs.existsSync(changedSincePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(changedSincePath, 'utf8'));
    return Array.isArray(data.changed_indicators) ? data.changed_indicators : [];
  } catch (_) {
    return null;
  }
}

module.exports = {
  loadChangedIdnos,
  DEFAULT_CHANGED_SINCE,
};
