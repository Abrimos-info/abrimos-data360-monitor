'use strict';

const fs = require('fs');
const path = require('path');
const pug = require('pug');
const { NEWSLETTER_EDITIONS_DIR } = require('../paths');
const { readJsonSafe } = require('../file-utils');

const templatePath = path.join(__dirname, '..', '..', 'templates', 'newsletter-edition.pug');
let renderFn = null;

function editionFile(scope, dateIso) {
  return path.join(NEWSLETTER_EDITIONS_DIR, `${scope}-${dateIso}.json`);
}

function loadLatestEditionDate(scope) {
  const dates = listEditions(scope);
  return dates.length ? dates[dates.length - 1] : null;
}

function listEditions(scope) {
  const dir = NEWSLETTER_EDITIONS_DIR;
  if (!fs.existsSync(dir)) return [];
  const prefix = `${scope}-`;
  return fs.readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .map((f) => f.slice(prefix.length, -5))
    .sort();
}

function loadEdition(scope, dateIso) {
  return readJsonSafe(editionFile(scope, dateIso), null);
}

function renderEditionHtml(edition, locals) {
  if (!renderFn) {
    renderFn = pug.compileFile(templatePath, { cache: false, pretty: false });
  }
  return renderFn(locals);
}

module.exports = {
  loadEdition,
  loadLatestEditionDate,
  listEditions,
  renderEditionHtml,
  editionFile,
};
