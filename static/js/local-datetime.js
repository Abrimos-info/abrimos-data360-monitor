'use strict';

(function () {
  function resolveLang(lang) {
    return lang === 'en' ? 'en' : 'es';
  }

  function parseIso(iso) {
    if (!iso) return null;
    var d = new Date(iso);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  function formatLocalDisplay(iso, lang) {
    var d = parseIso(iso);
    if (!d) return '—';
    var lng = resolveLang(lang || window.D360_LANG || document.documentElement.lang);
    var date = new Intl.DateTimeFormat(lng, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    var time = new Intl.DateTimeFormat(lng, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return date + ' \u00b7 ' + time;
  }

  function formatLocalTitle(iso, lang) {
    var d = parseIso(iso);
    if (!d) return '';
    var lng = resolveLang(lang || window.D360_LANG || document.documentElement.lang);
    return new Intl.DateTimeFormat(lng, {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZoneName: 'long',
    }).format(d);
  }

  function apply(el, lang) {
    if (!el) return;
    var iso = el.getAttribute('datetime');
    var lng = lang || window.D360_LANG || document.documentElement.lang || 'es';
    el.textContent = formatLocalDisplay(iso, lng);
    var title = formatLocalTitle(iso, lng);
    if (title) el.title = title;
    el.setAttribute('data-d360-localized', '1');
  }

  function applyAll(root, lang) {
    var scope = root || document;
    scope.querySelectorAll('time.d360-local-datetime[datetime]').forEach(function (el) {
      apply(el, lang);
    });
  }

  window.D360LocalDatetime = {
    apply: apply,
    applyAll: applyAll,
    formatLocalDisplay: formatLocalDisplay,
    formatLocalTitle: formatLocalTitle,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyAll(); });
  } else {
    applyAll();
  }
}());
