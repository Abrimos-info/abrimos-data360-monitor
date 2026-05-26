'use strict';

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'es';
}

function parseIso(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** Visible label: local date + time, no timezone suffix. */
function formatLocalDisplay(iso, lang) {
  const d = parseIso(iso);
  if (!d) return '—';
  const lng = resolveLang(lang);
  const date = new Intl.DateTimeFormat(lng, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  const time = new Intl.DateTimeFormat(lng, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return `${date} · ${time}`;
}

/** Tooltip: full local datetime with timezone name. */
function formatLocalTitle(iso, lang) {
  const d = parseIso(iso);
  if (!d) return '';
  const lng = resolveLang(lang);
  try {
    return new Intl.DateTimeFormat(lng, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'long',
    }).format(d);
  } catch (_) {
    return d.toString();
  }
}

module.exports = {
  resolveLang,
  parseIso,
  formatLocalDisplay,
  formatLocalTitle,
};
