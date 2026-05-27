'use strict';

(function () {

  function initFilters() {
    var country = document.getElementById('d360-filter-country');
    var category = document.getElementById('d360-filter-category');
    var contentType = document.getElementById('d360-filter-content-type');
    var variant = document.getElementById('d360-filter-variant');
    if (!country || !category) return;

    if (variant) {
      variant.addEventListener('change', function () {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.value);
        window.location.href = url.toString();
      });
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

    function apply() {
      var c = country.value;
      var k = category.value;
      var t = contentType ? contentType.value : 'ALL';
      var cards = document.querySelectorAll('.d360-card--link[data-country]');
      var visible = 0;
      cards.forEach(function (card) {
        var cc = card.getAttribute('data-country');
        var ck = card.getAttribute('data-category');
        var ct = card.getAttribute('data-content-type');
        var hide =
          (c !== 'ALL' && c !== cc) ||
          (k !== 'ALL' && k !== ck) ||
          (t && t !== 'ALL' && t !== ct);
        card.classList.toggle('d360-card--hidden', hide);
        if (!hide) visible++;
      });
      var count = document.getElementById('d360-event-count');
      if (count) count.textContent = String(visible);
      syncUrl({ country: c, category: k, content_type: t });
      toggleEmptyFiltered(visible === 0 && cards.length > 0);
    }

    country.addEventListener('change', apply);
    category.addEventListener('change', apply);
    if (contentType) contentType.addEventListener('change', apply);
  }

  function toggleEmptyFiltered(show) {
    var el = document.getElementById('d360-empty-filtered');
    if (el) el.style.display = show ? '' : 'none';
  }

  function init() {
    initFilters();

    if (window.D360AlertsFeed && window.D360AlertsFeed.bindRefreshOnFocus) {
      window.D360AlertsFeed.bindRefreshOnFocus(window.D360_LANG || 'es');
    }

    var initialAlert = window.D360_FILTERS && window.D360_FILTERS.alert;
    if (initialAlert && window.D360DetailPanel) {
      window.D360DetailPanel.open(initialAlert);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
