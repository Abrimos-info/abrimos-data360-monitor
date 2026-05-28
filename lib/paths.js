'use strict';

const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const NEWSLETTER_DIR = path.join(DATA_DIR, 'newsletter');
const NEWSLETTER_EDITIONS_DIR = path.join(NEWSLETTER_DIR, 'editions');
const SUBSCRIBERS_TSV = path.join(NEWSLETTER_DIR, 'subscribers.tsv');

module.exports = {
  REPO_ROOT,
  DATA_DIR,
  NEWSLETTER_DIR,
  NEWSLETTER_EDITIONS_DIR,
  SUBSCRIBERS_TSV,
};
