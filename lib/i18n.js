'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', 'config');
const SUPPORTED = ['es', 'en'];

let strings = {};
const reloadCallbacks = [];

function load() {
  const next = {};
  for (const lang of SUPPORTED) {
    const filepath = path.join(CONFIG_DIR, `strings.${lang}.json`);
    if (fs.existsSync(filepath)) {
      try {
        next[lang] = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      } catch (err) {
        console.error(new Date(), `i18n: failed to parse ${filepath}:`, err.message);
        next[lang] = {};
      }
    } else {
      console.warn(new Date(), `i18n: missing ${filepath}`);
      next[lang] = {};
    }
  }
  strings = next;
  console.log(new Date(), 'i18n: loaded', SUPPORTED.join(', '));
}

function reload() {
  load();
  for (const cb of reloadCallbacks) {
    try { cb(); } catch (e) { console.error(new Date(), 'i18n reload callback failed:', e); }
  }
}

function onReload(cb) {
  reloadCallbacks.push(cb);
}

function resolve(obj, dotKey) {
  const parts = dotKey.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return undefined;
  }
  return cur;
}

function getString(key, lang, params) {
  const normalizedLang = (lang === 'en') ? 'en' : 'es';
  let val = resolve(strings[normalizedLang] || {}, key);
  if (val === undefined && normalizedLang !== 'en') {
    val = resolve(strings.en || {}, key);
  }
  if (val === undefined) {
    return `[${key}]`;
  }
  if (typeof val === 'string' && params) {
    return val.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
  }
  return val;
}

function getAll(lang) {
  const normalizedLang = (lang === 'en') ? 'en' : 'es';
  return strings[normalizedLang] || {};
}

load();

module.exports = {
  getString,
  getAll,
  reload,
  onReload,
};
