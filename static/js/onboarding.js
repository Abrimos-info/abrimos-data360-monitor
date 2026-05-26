'use strict';

(function () {
  var STORAGE_KEY = 'd360_onboarding_seen';
  var COOKIE_NAME = 'd360_country';
  var COOKIE_MAX_AGE = 31536000;

  function shouldShowOnFirstVisit() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('onboarding') === '1') return true;
      return localStorage.getItem(STORAGE_KEY) !== '1';
    } catch (_) {
      return false;
    }
  }

  function setCountryCookie(iso) {
    if (!iso) return;
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(iso) + '; path=/; max-age=' + COOKIE_MAX_AGE + '; samesite=lax';
  }

  function dismiss(markSeen) {
    if (markSeen !== false) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) { /* ignore */ }
    }
    var el = document.getElementById('d360-onboard');
    if (el) el.style.display = 'none';
    document.body.classList.remove('d360-onboard-open');
    document.querySelectorAll('[data-open-onboarding="countries"]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function openOnboarding(opts) {
    opts = opts || {};
    var el = document.getElementById('d360-onboard');
    if (!el) return;
    el.style.display = '';
    document.body.classList.add('d360-onboard-open');
    if (opts.focusCountries) {
      var section = document.getElementById('d360-onboard-countries');
      if (section && section.scrollIntoView) {
        section.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function bindOnboarding(el) {
    el.querySelectorAll('[data-onboard-dismiss]').forEach(function (node) {
      node.addEventListener('click', function () { dismiss(true); });
    });

    el.querySelectorAll('[data-onboard-go]').forEach(function (link) {
      link.addEventListener('click', function () { dismiss(true); });
    });

    el.querySelectorAll('[data-country-iso]').forEach(function (link) {
      link.addEventListener('click', function () {
        setCountryCookie(link.getAttribute('data-country-iso'));
        dismiss(true);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') dismiss(true);
    });
  }

  function bindCountryPickerTriggers() {
    document.querySelectorAll('[data-open-onboarding="countries"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openOnboarding({ focusCountries: true });
        btn.setAttribute('aria-expanded', 'true');
      });
    });
  }

  function init() {
    var el = document.getElementById('d360-onboard');
    if (el) {
      bindOnboarding(el);
      if (shouldShowOnFirstVisit()) openOnboarding();
    }
    bindCountryPickerTriggers();
  }

  window.D360Onboarding = {
    open: openOnboarding,
    dismiss: dismiss,
    setCountryCookie: setCountryCookie,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
