'use strict';

(function () {
  function pickLang() {
    return window.D360_LANG === 'en' ? 'en' : 'es';
  }

  function hydrateLeadEl(el, alert, lng) {
    if (!el || !alert || !window.D360PcnClaims) return;
    var lead = alert.lead && alert.lead[lng];
    if (!lead || lead.indexOf('{{claim:') === -1) return;
    var normalize = window.D360PcnClaims.normalizeClaimMarkerText;
    var render = window.D360PcnClaims.renderClaimMarkersHtml;
    el.innerHTML = render(normalize(lead), alert, lng);
  }

  function initFrontpageClaims() {
    var lng = pickLang();
    var byId = window.D360_FRONTPAGE_ALERTS || {};
    var hero = window.D360_HERO_ALERT || byId.hero;
    hydrateLeadEl(document.getElementById('d360-frontpage-hero-lede'), hero, lng);

    document.querySelectorAll('.d360-frontpage__headline-lede[data-alert-id]').forEach(function (el) {
      var id = el.getAttribute('data-alert-id');
      if (id && byId[id]) hydrateLeadEl(el, byId[id], lng);
    });
  }

  document.addEventListener('DOMContentLoaded', initFrontpageClaims);
}());
