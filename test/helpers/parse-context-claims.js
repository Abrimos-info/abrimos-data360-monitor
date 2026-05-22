'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CLAIM_RE = /claim_id:\s*([a-f0-9]+)/gi;

function parseClaimIdsFromAnalysis(idno) {
  const filePath = path.join(ROOT, 'data', 'analyses', `${idno}.md`);
  if (!fs.existsSync(filePath)) return new Set();
  const text = fs.readFileSync(filePath, 'utf8');
  const ids = new Set();
  let m;
  while ((m = CLAIM_RE.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

module.exports = { parseClaimIdsFromAnalysis, CLAIM_RE };
