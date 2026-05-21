'use strict';

// behavior.js — Data360 Monitor client. Vanilla JS, no framework.

(function () {

  // ---------------------------------------------------------------
  // Subscribe button (newsletter is non-functional per D-009)
  // ---------------------------------------------------------------
  function initSubscribeButton() {
    var btn = document.getElementById('d360-subscribe-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.alert('Newsletter coming soon.');
    });
  }

  // ---------------------------------------------------------------
  // Filters: show/hide cards client-side, sync URL
  // ---------------------------------------------------------------
  function initFilters() {
    var country = document.getElementById('d360-filter-country');
    var category = document.getElementById('d360-filter-category');
    var variant = document.getElementById('d360-filter-variant');
    if (!country || !category) return;

    // Variant change requires a server round-trip (different mixin per variant).
    if (variant) {
      variant.addEventListener('change', function () {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.value);
        window.location.href = url.toString();
      });
    }

    function apply() {
      var c = country.value;
      var k = category.value;
      var cards = document.querySelectorAll('[data-alert-id]');
      var visible = 0;
      cards.forEach(function (card) {
        var cc = card.getAttribute('data-country');
        var ck = card.getAttribute('data-category');
        var hide = (c !== 'ALL' && c !== cc) || (k !== 'ALL' && k !== ck);
        card.classList.toggle('d360-card--hidden', hide);
        if (!hide) visible++;
      });
      var count = document.getElementById('d360-event-count');
      if (count) count.textContent = String(visible);
      syncUrl({ country: c, category: k });
      toggleEmptyFiltered(visible === 0 && cards.length > 0);
    }

    country.addEventListener('change', apply);
    category.addEventListener('change', apply);
  }

  function toggleEmptyFiltered(show) {
    var el = document.getElementById('d360-empty-filtered');
    if (el) {
      el.style.display = show ? '' : 'none';
    }
  }

  function syncUrl(params) {
    var url = new URL(window.location.href);
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === null || v === undefined || v === 'ALL') {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, v);
      }
    });
    history.replaceState(null, '', url.toString());
  }

  // ---------------------------------------------------------------
  // Language toggle (es / en / both). For now just updates URL.
  // Visual language switching is deferred until templates accept langMode.
  // ---------------------------------------------------------------
  function initLangToggle() {
    var buttons = document.querySelectorAll('.d360-lang__btn');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-lang');
        var url = new URL(window.location.href);
        url.searchParams.set('langMode', mode);
        window.location.href = url.toString();
      });
    });
  }

  // ---------------------------------------------------------------
  // Detail panel — opened by clicking a card. Renders from template.
  // ---------------------------------------------------------------
  function initCardClicks() {
    var cards = document.querySelectorAll('[data-alert-id]');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-alert-id');
        openDetail(id);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetail(card.getAttribute('data-alert-id'));
        }
      });
    });
  }

  function openDetail(alertId) {
    // TODO: implemented in task #8 (detail panel via template binding).
    console.log('openDetail', alertId, '(detail panel not implemented yet)');
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function init() {
    initSubscribeButton();
    initFilters();
    initLangToggle();
    initCardClicks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
