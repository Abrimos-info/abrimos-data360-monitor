'use strict';

(function () {

  function readCountryCookie() {
    var match = document.cookie.match(/(?:^|; )d360_country=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function open() {
    var el = document.getElementById('d360-newsletter');
    if (!el) return;
    el.style.display = '';
    document.body.classList.add('d360-onboard-open');
    var btn = document.getElementById('d360-subscribe-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    resetForm();
    var email = document.getElementById('d360-subscribe-email');
    if (email) email.focus();
  }

  function close() {
    var el = document.getElementById('d360-newsletter');
    if (el) el.style.display = 'none';
    document.body.classList.remove('d360-onboard-open');
    var btn = document.getElementById('d360-subscribe-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function ui(key) {
    var lang = window.D360_LANG || 'es';
    var strings = (window.D360_STRINGS && window.D360_STRINGS[lang]) || {};
    return strings[key] || (window.D360_STRINGS.en && window.D360_STRINGS.en[key]) || key;
  }

  function resetForm() {
    var form = document.getElementById('d360-subscribe-form');
    var success = document.getElementById('d360-subscribe-success');
    var err = document.getElementById('d360-subscribe-error');
    var link = document.getElementById('d360-subscribe-preview-link');
    if (form) {
      form.reset();
      form.style.display = '';
      var newsletter = form.querySelector('input[value="newsletter_lac"]');
      if (newsletter) newsletter.checked = true;
    }
    if (success) success.style.display = 'none';
    if (err) { err.hidden = true; err.textContent = ''; }
    if (link) { link.hidden = false; link.removeAttribute('href'); }
    syncCountrySelect();
  }

  function syncCountrySelect() {
    var form = document.getElementById('d360-subscribe-form');
    var country = document.getElementById('d360-subscribe-country');
    var allOpt = document.getElementById('d360-subscribe-country-all');
    if (!form || !country) return;
    var type = form.querySelector('input[name="subscription_type"]:checked');
    var alerts = type && type.value === 'indicator_alerts';
    country.disabled = !alerts;
    country.required = alerts;
    if (allOpt) allOpt.hidden = alerts;
    if (alerts) {
      var iso = readCountryCookie();
      if (iso && country.querySelector('option[value="' + iso + '"]')) {
        country.value = iso;
      } else {
        var firstCountry = country.querySelector('option[value]:not([value=""])');
        if (firstCountry) country.value = firstCountry.value;
      }
    } else {
      country.value = '';
    }
  }

  function successMessage(type) {
    return type === 'indicator_alerts'
      ? ui('subscribe.success_alerts')
      : ui('subscribe.success_newsletter');
  }

  async function submitForm(e) {
    e.preventDefault();
    var form = document.getElementById('d360-subscribe-form');
    var err = document.getElementById('d360-subscribe-error');
    var submitBtn = form && form.querySelector('button[type="submit"]');
    if (!form) return;

    var fd = new FormData(form);
    var subscriptionType = fd.get('subscription_type');
    var email = String(fd.get('email') || '').trim();
    var countryIso = fd.get('country_iso');

    err.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    try {
      var res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          subscription_type: subscriptionType,
          country_iso: subscriptionType === 'indicator_alerts' ? countryIso : '',
          lang: window.D360_LANG || 'es',
        }),
      });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'error');
      }
      form.style.display = 'none';
      var success = document.getElementById('d360-subscribe-success');
      var text = document.getElementById('d360-subscribe-success-text');
      var link = document.getElementById('d360-subscribe-preview-link');
      if (text) text.textContent = successMessage(subscriptionType);
      if (link && data.preview_url) {
        link.href = data.preview_url;
        link.hidden = false;
      }
      if (success) success.style.display = '';
    } catch (ex) {
      err.textContent = ui('subscribe.error_generic');
      err.hidden = false;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function bindOpenTriggers() {
    document.querySelectorAll('[data-open-subscribe]').forEach(function (node) {
      if (node.dataset.subscribeBound === '1') return;
      node.dataset.subscribeBound = '1';
      node.removeAttribute('disabled');
      node.removeAttribute('aria-disabled');
      node.addEventListener('click', function (ev) {
        ev.preventDefault();
        open();
      });
    });
  }

  function init() {
    var el = document.getElementById('d360-newsletter');
    var form = document.getElementById('d360-subscribe-form');
    if (!el || !form) return;

    bindOpenTriggers();

    form.addEventListener('submit', submitForm);
    form.querySelectorAll('input[name="subscription_type"]').forEach(function (radio) {
      radio.addEventListener('change', syncCountrySelect);
    });

    el.querySelectorAll('[data-newsletter-dismiss]').forEach(function (node) {
      node.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.style.display !== 'none') close();
    });

    syncCountrySelect();
  }

  window.D360Subscribe = { open: open, close: close };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
