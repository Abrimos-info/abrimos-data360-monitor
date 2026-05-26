'use strict';

/**
 * Static version management — git commit count for cache busting (?v=).
 * Mirrors sociedad-web-front/lib/static-version.js.
 */

let cachedStaticVersion = null;
let cachedCommitHash = null;

function getStaticVersion() {
  if (cachedStaticVersion !== null) return cachedStaticVersion;

  const { execSync } = require('child_process');
  let commitNumber;
  try {
    commitNumber = execSync('git rev-list --count HEAD').toString().trim();
    console.log(new Date(), `static-version: ${commitNumber}`);
  } catch (error) {
    console.error(new Date(), 'static-version: git rev-list failed, using timestamp', error.message);
    commitNumber = Date.now().toString();
  }

  cachedStaticVersion = commitNumber;
  return cachedStaticVersion;
}

function getCommitHash() {
  if (cachedCommitHash !== null) return cachedCommitHash;

  const { execSync } = require('child_process');
  try {
    cachedCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (_) {
    cachedCommitHash = 'unknown';
  }
  return cachedCommitHash;
}

function staticAsset(relPath) {
  const p = String(relPath || '').replace(/^\//, '');
  return `/static/${p}?v=${getStaticVersion()}`;
}

module.exports = { getStaticVersion, getCommitHash, staticAsset };
