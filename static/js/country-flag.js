'use strict';

(function (global) {
  var ISO3_TO_ISO2 = {
    ARG: 'AR', ECU: 'EC', GTM: 'GT', HND: 'HN', MEX: 'MX',
  };

  function iso3ToFlagEmoji(iso3) {
    var iso2 = ISO3_TO_ISO2[String(iso3 || '').toUpperCase()];
    if (!iso2 || iso2.length !== 2) return '';
    var chars = iso2.toUpperCase().split('');
    return String.fromCodePoint(
      0x1F1E6 + chars[0].charCodeAt(0) - 65,
      0x1F1E6 + chars[1].charCodeAt(0) - 65,
    );
  }

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCountryTagHtml(iso, name) {
    var flag = iso3ToFlagEmoji(iso);
    var label = name || iso || '';
    var parts = [];
    if (flag) {
      parts.push('<span class="d360-country__flag" aria-hidden="true">' + flag + '</span>');
    }
    if (label) {
      parts.push('<span class="d360-country__name">' + escHtml(label) + '</span>');
    }
    return '<span class="d360-country">' + parts.join('') + '</span>';
  }

  global.D360CountryFlag = {
    iso3ToFlagEmoji: iso3ToFlagEmoji,
    renderCountryTagHtml: renderCountryTagHtml,
  };
}(typeof window !== 'undefined' ? window : globalThis));
