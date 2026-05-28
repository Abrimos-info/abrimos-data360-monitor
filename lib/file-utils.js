'use strict';

const fs = require('fs');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(filepath, defaultValue = null) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (_) {
    return defaultValue;
  }
}

function appendTsvLine(filepath, fields) {
  ensureDir(require('path').dirname(filepath));
  const line = fields.map((v) => String(v == null ? '' : v).replace(/\t/g, ' ')).join('\t') + '\n';
  fs.appendFileSync(filepath, line, 'utf8');
}

module.exports = {
  ensureDir,
  readJsonSafe,
  appendTsvLine,
};
