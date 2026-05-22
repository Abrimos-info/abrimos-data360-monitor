'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', 'config');
const SUPPORTED = ['es', 'en'];

let strings = {};
const reloadCallbacks = [];
const loggedMisses = new Set();

function logOnce(id, fn) {
  if (loggedMisses.has(id)) return;
  loggedMisses.add(id);
  fn();
}

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
  loggedMisses.clear();
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

function lookupString(bag, key) {
  if (!bag || typeof bag !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(bag, key)) return bag[key];
  return resolve(bag, key);
}

function getString(key, lang, params) {
  const normalizedLang = (lang === 'en') ? 'en' : 'es';
  let val = lookupString(strings[normalizedLang] || {}, key);
  let usedEnFallback = false;

  if (val === undefined && normalizedLang !== 'en') {
    val = lookupString(strings.en || {}, key);
    usedEnFallback = val !== undefined;
    if (usedEnFallback) {
      logOnce(`fallback:${normalizedLang}:${key}`, () => {
        console.warn(new Date(), `i18n: key "${key}" missing for "${normalizedLang}", using en fallback`);
      });
    }
  }

  if (val === undefined) {
    logOnce(`missing:${normalizedLang}:${key}`, () => {
      console.warn(new Date(), `i18n: key "${key}" not found for lang "${normalizedLang}"`);
    });
    return `[${key}]`;
  }

  if (typeof val !== 'string') {
    logOnce(`type:${normalizedLang}:${key}`, () => {
      console.error(new Date(), `i18n: key "${key}" for lang "${normalizedLang}" is not a string`);
    });
    return `[${key}]`;
  }

  if (params) {
    return val.replace(/\{(\w+)\}/g, (_, k) => {
      if (k in params) return params[k];
      logOnce(`param:${key}:${k}`, () => {
        console.warn(new Date(), `i18n: missing param "${k}" for key "${key}"`);
      });
      return `{${k}}`;
    });
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
