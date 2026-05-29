'use strict';

(function () {

  var TOPIC_SLUGS = ['macro', 'fiscal', 'social', 'food_security', 'governance'];
  var COUNTRY_ISOS = ['ARG', 'ECU', 'GTM', 'HND', 'MEX'];

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

  function selectedSubscriptionType(form) {
    var type = form.querySelector('input[name="subscription_type"]:checked');
    return type ? type.value : 'newsletter_lac';
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
    var footer = document.querySelector('#d360-newsletter .d360-subscribe-form__footer');
    if (footer) footer.style.display = '';
    if (link) {
      link.hidden = false;
      link.textContent = ui('subscribe.success_preview_newsletter');
      link.removeAttribute('href');
    }
    syncAlertsFields();
  }

  function updateSubmitCta() {
    var form = document.getElementById('d360-subscribe-form');
    var submitBtn = document.getElementById('d360-subscribe-submit');
    if (!form || !submitBtn) return;
    var type = selectedSubscriptionType(form);
    submitBtn.textContent = type === 'indicator_alerts'
      ? ui('subscribe.cta_alerts')
      : ui('subscribe.cta_newsletter');
  }

  function syncAlertsFields() {
    var el = document.getElementById('d360-newsletter');
    var form = document.getElementById('d360-subscribe-form');
    var filters = document.getElementById('d360-subscribe-filters');
    var archiveWrap = document.getElementById('d360-subscribe-archive-wrap');
    if (!form) return;
    var alerts = selectedSubscriptionType(form) === 'indicator_alerts';
    if (el) el.classList.toggle('is-alerts-mode', alerts);
    if (filters) filters.hidden = !alerts;
    if (archiveWrap) archiveWrap.hidden = alerts;
    if (alerts) {
      var iso = readCountryCookie();
      if (iso && COUNTRY_ISOS.indexOf(iso) !== -1) {
        var box = form.querySelector('input[name="countries[]"][value="' + iso + '"]');
        if (box) box.checked = true;
      }
    }
    updateSubmitCta();
  }

  function successMessage(type) {
    return type === 'indicator_alerts'
      ? ui('subscribe.success_alerts')
      : ui('subscribe.success_newsletter');
  }

  function previewLinkLabel(type) {
    return type === 'indicator_alerts'
      ? ui('subscribe.success_preview_alerts')
      : ui('subscribe.success_preview_newsletter');
  }

  function fallbackPreviewUrl(type) {
    return type === 'indicator_alerts' ? '/indicadores' : '/newsletter';
  }

  async function submitForm(e) {
    e.preventDefault();
    var form = document.getElementById('d360-subscribe-form');
    var err = document.getElementById('d360-subscribe-error');
    var submitBtn = document.getElementById('d360-subscribe-submit');
    if (!form) return;

    var subscriptionType = selectedSubscriptionType(form);
    var email = String((new FormData(form).get('email') || '')).trim();
    var countries = Array.from(form.querySelectorAll('input[name="countries[]"]:checked')).map(function (n) {
      return n.value;
    });
    var topics = Array.from(form.querySelectorAll('input[name="topics[]"]:checked')).map(function (n) {
      return n.value;
    });

    err.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    try {
      var res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          subscription_type: subscriptionType,
          countries: countries,
          topics: topics,
          lang: window.D360_LANG || 'es',
        }),
      });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'error');
      }
      form.style.display = 'none';
      var footer = document.querySelector('#d360-newsletter .d360-subscribe-form__footer');
      if (footer) footer.style.display = 'none';
      var success = document.getElementById('d360-subscribe-success');
      var text = document.getElementById('d360-subscribe-success-text');
      var link = document.getElementById('d360-subscribe-preview-link');
      if (text) text.textContent = successMessage(subscriptionType);
      if (link) {
        link.href = data.preview_url || fallbackPreviewUrl(subscriptionType);
        link.textContent = previewLinkLabel(subscriptionType);
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
      radio.addEventListener('change', syncAlertsFields);
    });

    el.querySelectorAll('[data-newsletter-dismiss]').forEach(function (node) {
      node.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.style.display !== 'none') close();
    });

    syncAlertsFields();
  }

  window.D360Subscribe = { open: open, close: close };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
