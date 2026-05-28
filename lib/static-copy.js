'use strict';

const path = require('path');
const { readJsonSafe } = require('./file-utils');

const COPY_DIR = path.resolve(__dirname, '..', 'config', 'copy');

function loadStaticCopy(pageId, lang) {
  const lng = lang === 'en' ? 'en' : 'es';
  const primary = readJsonSafe(path.join(COPY_DIR, `${pageId}.${lng}.json`));
  if (primary) return primary;
  if (lng !== 'es') {
    return readJsonSafe(path.join(COPY_DIR, `${pageId}.es.json`));
  }
  return null;
}

module.exports = { loadStaticCopy };
