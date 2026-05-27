'use strict';

(function () {
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function ui(key, lang) {
    var strings = (window.D360_STRINGS && window.D360_STRINGS[lang]) || {};
    return strings[key] || (window.D360_STRINGS.en && window.D360_STRINGS.en[key]) || key;
  }

  function typeText(type, lang) {
    if (type === 'abrupt_change') {
      return lang === 'en' ? 'Abrupt change' : 'Cambio abrupto';
    }
    return lang === 'en' ? 'Anomaly' : 'Anomalía';
  }

  function magClass(text) {
    if (!text || typeof text !== 'string') return 'neutral';
    if (text.charAt(0) === '+') return 'up';
    if (text.charAt(0) === '−' || text.charAt(0) === '-') return 'down';
    return 'neutral';
  }

  function langKey(lang) {
    return lang === 'en' ? 'en' : 'es';
  }

  function enrichAlert(alert) {
    if (!alert) return null;
    if (alert.indicator && (alert.lead || alert.title)) return alert;
    if (alert.id && window.D360_ALERTS) {
      var full = window.D360_ALERTS.find(function (a) { return a.id === alert.id; });
      if (full) return full;
    }
    if (alert.idno && !alert.indicator) {
      return {
        id: alert.id || ('chat-' + alert.idno),
        type: alert.type || 'abrupt_change',
        country: alert.country || '',
        category: alert.category || '',
        indicator: {
          idno: alert.idno,
          name: alert.name || { es: alert.idno, en: alert.idno },
        },
        observation: alert.observation || {
          value: alert.value,
          time_period: alert.time_period,
          display: alert.value != null ? { es: String(alert.value), en: String(alert.value) } : undefined,
        },
        magnitude: alert.magnitude || { es: '', en: '' },
        lead: alert.lead || {
          es: alert.lead_es || alert.citizen_es || '',
          en: alert.lead_en || alert.citizen_en || '',
        },
        data_period_stale: alert.data_period_stale,
      };
    }
    return alert;
  }

  function observationHtml(ev, lang) {
    var lng = langKey(lang);
    if (ev.observation && ev.observation.display) {
      return escapeHtml(ev.observation.display[lng] || ev.observation.display.es || '');
    }
    if (ev.observation && ev.observation.value != null) {
      return escapeHtml(String(ev.observation.value));
    }
    return '';
  }

  function dataDateBadge(ev, lang) {
    var lng = langKey(lang);
    var label = ui('detail.data_period', lang);
    var text = (ev.observation && ev.observation.period_narrative && ev.observation.period_narrative[lng])
      || (ev.observation && ev.observation.period_display && ev.observation.period_display[lng])
      || (ev.observation && ev.observation.time_period)
      || '';
    var staleCls = ev.data_period_stale ? ' d360-data-date--stale' : '';
    return '<span class="d360-data-date' + staleCls + '">' +
      '<span class="d360-data-date__label">' + escapeHtml(label) + '</span>' +
      '<span class="d360-data-date__value">' + escapeHtml(text) + '</span>' +
      '</span>';
  }

  function typeChip(type, label) {
    var cls = type === 'abrupt_change' ? 'abrupt' : 'anomaly';
    var svg = type === 'abrupt_change'
      ? '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M1 8 L4 4 L6 6 L9 2" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M2 5 L4 5 M6 5 L8 5 M5 2 L5 8" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round"/></svg>';
    return '<span class="d360-typechip d360-typechip--' + cls + '">' +
      '<span class="d360-typechip__shape" aria-hidden="true">' + svg + '</span>' +
      '<span>' + escapeHtml(label) + '</span></span>';
  }

  function indicatorUrl(ev) {
    var idno = ev.indicator && ev.indicator.idno;
    if (!idno) return null;
    if (window.D360Urls && window.D360Urls.indicatorSearchUrl) {
      return window.D360Urls.indicatorSearchUrl(idno);
    }
    return 'https://data360.worldbank.org/en/indicator/' + encodeURIComponent(idno);
  }

  function renderNarrativeCard(ev, lang) {
    var lng = langKey(lang);
    var idno = ev.indicator && ev.indicator.idno;
    var indUrl = indicatorUrl(ev);
    var indLink = indUrl
      ? '<a class="d360-card__dataset d360-card__dataset--link" href="' + escapeHtml(indUrl) + '" target="_blank" rel="noopener">' + escapeHtml(idno) + '</a>'
      : '<span class="d360-card__dataset">' + escapeHtml(idno || '') + '</span>';
    var mag = (ev.magnitude && ev.magnitude[lng]) || '';
    var name = (ev.indicator && ev.indicator.name && ev.indicator.name[lng]) || idno || '';
    var narrative = (ev.lead && ev.lead[lng]) || (ev.title && ev.title[lng]) || '';

    function countryName(iso, langKey) {
      var bag = (window.D360_STRINGS && window.D360_STRINGS[langKey]) || {};
      return bag['chat.country.' + iso] || iso;
    }

    function countryTagHtml(iso, langKey) {
      if (window.D360CountryFlag && window.D360CountryFlag.renderCountryTagHtml) {
        return window.D360CountryFlag.renderCountryTagHtml(iso, countryName(iso, langKey));
      }
      return '<span class="d360-country"><span class="d360-country__name">' + escapeHtml(countryName(iso, langKey)) + '</span></span>';
    }

    return '<article class="d360-card d360-card--narr d360-card--chat" tabindex="0" role="button" data-alert-id="' + escapeHtml(ev.id || '') + '">' +
      '<div class="d360-card__head">' +
        '<div class="d360-card__metaL">' +
          countryTagHtml(ev.country, lng) +
          '<span class="d360-card__divider">·</span>' + indLink +
        '</div>' +
        '<div class="d360-card__metaR">' +
          dataDateBadge(ev, lang) +
          typeChip(ev.type, typeText(ev.type, lang)) +
        '</div>' +
      '</div>' +
      '<div class="d360-card__body">' + escapeHtml(narrative) + '</div>' +
      '<div class="d360-card__sub">' +
        escapeHtml(name) + ' · ' + observationHtml(ev, lang) +
        (mag ? ' · <span class="d360-mag d360-mag--' + magClass(mag) + '">' + escapeHtml(mag) + '</span>' : '') +
      '</div>' +
    '</article>';
  }

  function renderAlertCards(alerts, lang) {
    if (!alerts || !alerts.length) return '';
    var cards = alerts.map(enrichAlert).filter(Boolean);
    if (!cards.length) return '';
    return '<div class="d360-feed d360-feed--chat">' +
      cards.map(function (ev) { return renderNarrativeCard(ev, lang); }).join('') +
      '</div>';
  }

  function indicatorLinksHtml(indicators, lang) {
    if (!indicators || !indicators.length) return '';
    if (window.D360IndicatorPills && window.D360IndicatorPills.renderIndicatorPills) {
      return window.D360IndicatorPills.renderIndicatorPills(indicators);
    }
    return '<ul class="d360-chat__indicator-list">' +
      indicators.map(function (ind) {
        var url = ind.url || ('https://data360.worldbank.org/en/int/indicators/' + encodeURIComponent(ind.idno));
        var name = ind.name || ind.idno;
        return '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">' +
          escapeHtml(ind.idno) + '</a> · ' + escapeHtml(name) + '</li>';
      }).join('') +
      '</ul>';
  }

  window.D360ChatCards = {
    renderAlertCards: renderAlertCards,
    indicatorLinksHtml: indicatorLinksHtml,
  };
}());
