'use strict';

(function () {
  var STORAGE_KEY = 'd360_onboarding_seen';

  function shouldShow() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('onboarding') === '1') return true;
      return localStorage.getItem(STORAGE_KEY) !== '1';
    } catch (_) {
      return false;
    }
  }

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) { /* ignore */ }
    var el = document.getElementById('d360-onboard');
    if (el) el.style.display = 'none';
  }

  function initLangToggle() {
    document.querySelectorAll('.d360-lang__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-lang');
        var url = new URL(window.location.href);
        url.searchParams.set('langMode', mode);
        window.location.href = url.toString();
      });
    });
  }

  function init() {
    initLangToggle();
    var el = document.getElementById('d360-onboard');
    if (!el) return;
    if (!shouldShow()) return;

    el.style.display = '';
    document.body.classList.add('d360-onboard-open');

    el.querySelectorAll('[data-onboard-dismiss]').forEach(function (node) {
      node.addEventListener('click', function () {
        dismiss();
        document.body.classList.remove('d360-onboard-open');
      });
    });

    el.querySelectorAll('[data-onboard-go]').forEach(function (link) {
      link.addEventListener('click', function () { dismiss(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dismiss();
        document.body.classList.remove('d360-onboard-open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
