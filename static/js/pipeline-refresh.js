'use strict';

(function () {
  function uiString(key, lang) {
    var strings = window.D360_STRINGS || {};
    var bag = strings[lang] || strings.es || {};
    return bag[key] || key;
  }

  function init() {
    var btn = document.getElementById('d360-refresh-btn');
    var status = document.getElementById('d360-refresh-status');
    if (!btn) return;

    var lang = window.D360_LANG || 'es';
    var age = window.D360_DATA_AGE || {};
    if (age.seconds != null && age.seconds >= 3600) {
      btn.disabled = false;
    }

    btn.addEventListener('click', function () {
      btn.disabled = true;
      if (status) {
        status.style.display = '';
        status.textContent = uiString('ui.refresh_running', lang);
      }
      fetch('/api/pipeline/refresh', { method: 'POST' })
        .then(function (r) { return r.json(); })
        .then(function () { pollStatus(lang, btn, status); })
        .catch(function () {
          if (status) status.textContent = 'Error';
          btn.disabled = false;
        });
    });
  }

  function pollStatus(lang, btn, status) {
    fetch('/api/pipeline/status', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status === 'running') {
          setTimeout(function () { pollStatus(lang, btn, status); }, 3000);
          return;
        }
        if (data.status === 'done') {
          if (status) status.textContent = uiString('ui.refresh_done', lang);
          window.location.reload();
          return;
        }
        if (status) status.textContent = data.error || 'Error';
        btn.disabled = false;
      })
      .catch(function () {
        btn.disabled = false;
      });
  }

  document.addEventListener('DOMContentLoaded', init);
}());
