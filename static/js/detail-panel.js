'use strict';

(function () {

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
  }

  function isChatPage() {
    return !!document.querySelector('.d360-page--chat');
  }

  function syncUrl(params) {
    if (isChatPage()) return;
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

  function renderChartSvg(series) {
    if (window.D360Charts && window.D360Charts.renderChartSvg) {
      return window.D360Charts.renderChartSvg(series);
    }
    return '';
  }

  var i18nLogged = window.__D360_I18N_LOGGED || (window.__D360_I18N_LOGGED = new Set());

  function uiString(key, lang) {
    var strings = window.D360_STRINGS || {};
    var bag = strings[lang] || {};
    if (bag[key]) return bag[key];
    if (lang !== 'en' && strings.en && strings.en[key]) return strings.en[key];
    return '[' + key + ']';
  }

  function pickLang(lang) {
    return lang === 'en' ? 'en' : 'es';
  }

  function observationValue(alert, lng) {
    if (alert.observation && alert.observation.display) {
      return alert.observation.display[lng] || String(alert.observation.value);
    }
    return String(alert.observation ? alert.observation.value : '');
  }

  function periodValue(alert, lng) {
    if (alert.observation && alert.observation.period_display) {
      return alert.observation.period_display[lng] || alert.observation.time_period;
    }
    return alert.observation ? alert.observation.time_period : '';
  }

  function formatScore(score) {
    if (score == null || !Number.isFinite(Number(score))) return '';
    return (Math.round(Number(score) * 100) / 100).toFixed(2);
  }

  function formatDetectedAt(iso, lang) {
    if (window.D360LocalDatetime && window.D360LocalDatetime.formatLocalDisplay) {
      return window.D360LocalDatetime.formatLocalDisplay(iso, lang);
    }
    if (!iso) return '';
    return iso.slice(0, 16).replace('T', ' \u00b7 ');
  }

  function formatDetectedTitle(iso, lang) {
    if (window.D360LocalDatetime && window.D360LocalDatetime.formatLocalTitle) {
      return window.D360LocalDatetime.formatLocalTitle(iso, lang);
    }
    return iso || '';
  }

  function sanitizeUrl(url) {
    if (!url) return url;
    return String(url).replace(/[)\],.;]+$/, '');
  }

  function resolveClaimDisplay(token, lang, fallback) {
    if (!token) return fallback || '';
    var field = lang === 'en' ? 'display_en' : 'display_es';
    if (token[field] && token[field].indexOf('{{claim:') === -1) return token[field];
    return fallback || String(token.value || '');
  }

  function renderClaimMarkersHtml(text, alert, lang) {
    if (window.D360PcnClaims && window.D360PcnClaims.renderClaimMarkersHtml) {
      return window.D360PcnClaims.renderClaimMarkersHtml(text, alert, lang);
    }
    if (!text) return '';
    var map = new Map((alert.claim_tokens || []).map(function (t) { return [String(t.claim_id), t]; }));
    return String(text).replace(/\{\{claim:([^}|]+)\|([^}]*)\}\}/g, function (_, id, fallback) {
      var token = map.get(String(id));
      return escHtml(resolveClaimDisplay(token, lang, fallback || id));
    });
  }

  function renderNarrativeText(text, alert, lang) {
    if (!text) return '';
    var map = new Map((alert.claim_tokens || []).map(function (t) { return [String(t.claim_id), t]; }));
    return String(text).replace(/\{\{claim:([^}|]+)\|([^}]*)\}\}/g, function (_, id, fallback) {
      var token = map.get(String(id));
      return resolveClaimDisplay(token, lang, fallback || id);
    });
  }

  function pickBilingual(field, lng) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lng] || field.es || field.en || '';
  }

  function renderStoryHtml(text) {
    if (!text) return '';
    var paragraphs = String(text).split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean);
    if (!paragraphs.length) return '';
    return paragraphs.map(function (p) {
      return '<p>' + escHtml(p).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function renderValueBlock(container, alert, lang) {
    var lng = pickLang(lang);
    container.textContent = observationValue(alert, lng);
  }

  function periodNarrativeValue(alert, lng) {
    if (alert.observation && alert.observation.period_narrative) {
      return alert.observation.period_narrative[lng] || alert.observation.time_period;
    }
    return periodValue(alert, lng);
  }

  function renderDataDateBadgeHtml(alert, lng, label, staleLabel) {
    var text = periodNarrativeValue(alert, lng);
    var stale = alert.data_period_stale;
    var cls = 'd360-data-date' + (stale ? ' d360-data-date--stale' : '');
    var title = stale ? staleLabel : '';
    return '<span class="' + cls + '"' + (title ? ' title="' + escAttr(title) + '"' : '') + '>' +
      '<span class="d360-data-date__label">' + escHtml(label) + '</span>' +
      '<span class="d360-data-date__value">' + escHtml(text) + '</span></span>';
  }

  function renderDataPeriodBlock(container, alert, lang) {
    var lng = pickLang(lang);
    var label = uiString('detail.data_period', lang);
    var staleLabel = uiString('detail.data_period_stale', lang);
    container.innerHTML = renderDataDateBadgeHtml(alert, lng, label, staleLabel);
  }

  function renderPeriodBlock(container, alert, lang) {
    var lng = pickLang(lang);
    container.textContent = periodValue(alert, lng);
  }

  function renderBindings(node, alert, lang) {
    var lng = pickLang(lang);
    var isReportaje = alert.content_type === 'reportaje';

    function bind(name, html) {
      var el = node.querySelector('[data-bind="' + name + '"]');
      if (el) el.innerHTML = html;
    }

    function hideWrap(name) {
      var el = node.querySelector('[data-bind="' + name + '"]');
      if (el) el.style.display = 'none';
    }

    var countriesArr = Array.isArray(alert._countries) && alert._countries.length
      ? alert._countries
      : (alert.countries && alert.countries.length ? alert.countries : (alert.country ? [alert.country] : []));
    var countriesHtml = countriesArr.map(function (iso) {
      var name = uiString('chat.country.' + iso, lang) || iso;
      if (window.D360CountryFlag && window.D360CountryFlag.renderCountryTagHtml) {
        return window.D360CountryFlag.renderCountryTagHtml(iso, name);
      }
      return '<span class="d360-country"><span class="d360-country__name">' + escHtml(name) + '</span></span>';
    }).join(' ');
    bind('countryTag', countriesHtml || '');

    bind('category', escHtml(alert.category || ''));

    var typeLabel = alert._type_label
      || (isReportaje ? uiString('badge.reportaje', lang) : uiString('badge.noticia', lang));
    var chipCls = isReportaje ? 'reportaje' : 'noticia';
    bind('typeChip',
      '<span class="d360-badge d360-badge--' + chipCls + '">' + escHtml(typeLabel) + '</span>');

    var titleText = alert._title
      || pickBilingual(alert.title, lng)
      || (alert.indicator && alert.indicator.name ? pickBilingual(alert.indicator.name, lng) : '')
      || alert.id || '';
    bind('title', escHtml(titleText));

    var idnoText = '';
    if (alert.indicator && alert.indicator.idno) idnoText = alert.indicator.idno;
    else if (Array.isArray(alert.indicators) && alert.indicators.length) idnoText = alert.indicators.join(' · ');
    bind('idno', escHtml(idnoText));

    var dataPeriodEl = node.querySelector('[data-bind="dataPeriod"]');
    if (alert.observation && dataPeriodEl) {
      renderDataPeriodBlock(dataPeriodEl, alert, lang);
    } else if (dataPeriodEl) {
      dataPeriodEl.innerHTML = '';
      dataPeriodEl.style.display = 'none';
    }

    var numblock = node.querySelector('[data-bind="numblockWrap"]');
    if (alert.observation) {
      var valueEl = node.querySelector('[data-bind="value"]');
      if (valueEl) renderValueBlock(valueEl, alert, lang);

      var magText = String(alert.magnitude ? (alert.magnitude[lng] || '') : '');
      var magSign = magText.charAt(0) === '+'
        ? 'up'
        : (magText.charAt(0) === '−' || magText.charAt(0) === '-') ? 'down' : 'neutral';
      bind('magnitude', '<span class="d360-mag d360-mag--' + magSign + '">' + escHtml(magText) + '</span>');

      if (numblock) numblock.setAttribute('aria-label',
        observationValue(alert, lng) + ', ' + periodNarrativeValue(alert, lng) + ', ' + magText);
    } else if (numblock) {
      numblock.style.display = 'none';
    }

    var leadText = alert._lead || pickBilingual(alert.lead, lng);
    var leadEl = node.querySelector('[data-bind="lead"]');
    var leadWrap = node.querySelector('[data-bind="leadWrap"]');
    if (leadText && leadEl) {
      leadEl.innerHTML = renderClaimMarkersHtml(leadText, alert, lng);
    } else if (leadWrap) {
      leadWrap.style.display = 'none';
    }

    var storyText = pickBilingual(alert.story, lng);
    var storyEl = node.querySelector('[data-bind="story"]');
    var storyWrap = node.querySelector('[data-bind="storyWrap"]');
    if (storyText && storyEl) {
      var resolved = renderClaimMarkersHtml(storyText, alert, lng);
      var paragraphs = resolved.split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean);
      if (!paragraphs.length) {
        storyEl.innerHTML = '';
      } else {
        storyEl.innerHTML = paragraphs.map(function (p) {
          return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
        }).join('');
      }
    } else if (storyWrap) {
      storyWrap.style.display = 'none';
    }

    var chartEl = node.querySelector('[data-bind="chart"]');
    var chartWrap = node.querySelector('[data-bind="chartWrap"]');
    if (chartEl && alert.chart_series && alert.chart_series.length) {
      chartEl.innerHTML = renderChartSvg(alert.chart_series);
    } else {
      if (chartEl) chartEl.innerHTML = '';
      if (chartWrap) chartWrap.style.display = 'none';
    }

    var indicatorsWrap = node.querySelector('[data-bind="indicatorsWrap"]');
    var indicatorsEl = node.querySelector('[data-bind="indicators"]');
    if (isReportaje && Array.isArray(alert.indicators) && alert.indicators.length && indicatorsEl) {
      var countryIso = countriesArr[0] || alert.country || null;
      indicatorsEl.innerHTML = alert.indicators.map(function (idno) {
        var urlOpts = countryIso ? { country: countryIso } : null;
        var url = (window.D360Urls && window.D360Urls.indicatorSearchUrl)
          ? window.D360Urls.indicatorSearchUrl(idno, urlOpts)
          : ('https://data360.worldbank.org/en/indicator/' + encodeURIComponent(idno)
            + (countryIso ? ('?view=trend&country=' + encodeURIComponent(countryIso)) : ''));
        return '<li><a href="' + escAttr(url) + '" target="_blank" rel="noopener">' + escHtml(idno) + '</a></li>';
      }).join('');
    } else if (indicatorsWrap) {
      indicatorsWrap.style.display = 'none';
    }

    var traceEl = node.querySelector('[data-bind="trace"]');
    if (traceEl && alert.verification_trace) {
      var t = alert.verification_trace;
      var items = [];
      var idno = alert.indicator && alert.indicator.idno;
      var countryIso = countriesArr[0] || alert.country || null;
      var datasetId = alert.dataset_id || (alert.indicator && alert.indicator.database_id) || null;
      var urls = window.D360Urls || {};

      if (idno) {
        var indUrl = urls.indicatorSearchUrl
          ? urls.indicatorSearchUrl(idno, countryIso ? { country: countryIso } : null)
          : ('https://data360.worldbank.org/en/indicator/' + encodeURIComponent(idno)
            + (countryIso ? ('?view=trend&country=' + encodeURIComponent(countryIso)) : ''));
        items.push(
          '<li><span class="d360-trace__num">' + escHtml(String(items.length + 1)) + '</span>' +
          '<a class="d360-trace__link" href="' + escAttr(indUrl) + '" target="_blank" rel="noopener">' +
          escHtml(uiString('detail.data360_indicator', lng)) + '</a>' +
          '<span class="d360-trace__hint">' + escHtml(idno) + '</span></li>'
        );
      }

      var datasetUrl = null;
      if (isReportaje && datasetId && urls.datasetSearchUrl) {
        datasetUrl = urls.datasetSearchUrl(datasetId);
      } else if (!idno) {
        datasetUrl = urls.resolvePublicDatasetUrl
          ? urls.resolvePublicDatasetUrl(datasetId, t.data360_dataset_url)
          : t.data360_dataset_url;
      }
      if (datasetUrl) {
        items.push(
          '<li><span class="d360-trace__num">' + escHtml(String(items.length + 1)) + '</span>' +
          '<a class="d360-trace__link" href="' + escAttr(datasetUrl) + '" target="_blank" rel="noopener">' +
          escHtml(uiString('detail.data360_dataset', lng)) + '</a>' +
          '<span class="d360-trace__hint">data360.worldbank.org</span></li>'
        );
      }
      var csvLinks = [];
      if (t.csv_link) csvLinks.push(t.csv_link);
      else if (Array.isArray(t.csv_links)) csvLinks = t.csv_links.slice();
      csvLinks.forEach(function (csvHref) {
        var csvHint = String(csvHref).split('/').pop() || '.csv';
        items.push(
          '<li><span class="d360-trace__num">' + escHtml(String(items.length + 1)) + '</span>' +
          '<a class="d360-trace__link" href="' + escAttr(csvHref) + '" target="_blank" rel="noopener">' +
          escHtml(uiString('detail.csv_download', lng)) + '</a>' +
          '<span class="d360-trace__hint">' + escHtml(csvHint) + '</span></li>'
        );
      });
      if (t.methodology_ref) {
        var methodUrl = sanitizeUrl(t.methodology_ref);
        items.push(
          '<li><span class="d360-trace__num">3</span>' +
          '<a class="d360-trace__link" href="' + escAttr(methodUrl) + '" target="_blank" rel="noopener">' +
          escHtml(uiString('detail.methodology', lng)) + '</a>' +
          '<span class="d360-trace__hint">' + escHtml(methodUrl.replace(/^https?:\/\//, '')) + '</span></li>'
        );
      }
      if (alert.license && alert.license !== 'unspecified') {
        items.push(
          '<li><span class="d360-trace__num">' + escHtml(String(items.length + 1)) + '</span>' +
          '<span class="d360-trace__label">' + escHtml(uiString('detail.license', lng)) + '</span>' +
          '<span class="d360-trace__hint">' + escHtml(alert.license) + '</span></li>'
        );
      }
      traceEl.innerHTML = items.join('');
    }

    var metaEl = node.querySelector('[data-bind="meta"]');
    if (metaEl) {
      var countryStr = countriesArr.join(', ') || (alert.country || '');
      var detectedHtml = '';
      if (alert.detected_at) {
        var detectedLabel = formatDetectedAt(alert.detected_at, lng);
        detectedHtml = '<time class="d360-local-datetime" datetime="' + escAttr(alert.detected_at) + '" title="' +
          escAttr(formatDetectedTitle(alert.detected_at, lng)) + '">' + escHtml(detectedLabel) + '</time>';
      }
      metaEl.innerHTML = [
        '<div><dt>' + escHtml(uiString('detail.country', lng)) + '</dt><dd>' + escHtml(countryStr) + '</dd></div>',
        '<div><dt>' + escHtml(uiString('detail.category', lng)) + '</dt><dd>' + escHtml(alert.category || '') + '</dd></div>',
        '<div><dt>' + escHtml(uiString('detail.score', lng)) + '</dt><dd>' + escHtml(formatScore(alert.score)) + '</dd></div>',
        '<div><dt>' + escHtml(uiString('detail.detected_pipeline', lng)) + '</dt><dd>' + detectedHtml + '</dd></div>',
      ].join('');
      if (window.D360LocalDatetime) {
        window.D360LocalDatetime.apply(metaEl.querySelector('time.d360-local-datetime'), lng);
      }
    }

    var copyTitle = titleText;
    var copyBody = renderNarrativeText(leadText || storyText || '', alert, lng);
    var previewText = (copyBody || copyTitle || '').slice(0, 80);
    bind('copyPreview', escHtml(previewText + (previewText.length >= 80 ? '...' : '')));

    var copyBtn = node.querySelector('.d360-detail__copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var traceUrl = alert.verification_trace && alert.verification_trace.data360_dataset_url
          ? alert.verification_trace.data360_dataset_url
          : ((window.D360Urls && window.D360Urls.SEARCH_BASE) || 'https://data360.worldbank.org/en/search');
        var parts = [];
        if (copyTitle) parts.push(copyTitle);
        if (copyBody) parts.push(copyBody);
        var text = parts.join('\n\n') + '\n\nSource: ' + traceUrl;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
        } else if (window.clipboardData) {
          window.clipboardData.setData('text', text);
        }
      });
    }
  }

  function findAlert(alertId) {
    var alerts = window.D360_ALERTS || [];
    for (var i = 0; i < alerts.length; i++) {
      if (alerts[i].id === alertId) return alerts[i];
    }
    return null;
  }

  function mergeAlerts(alerts) {
    if (!alerts || !alerts.length) return;
    if (!window.D360_ALERTS) window.D360_ALERTS = [];
    alerts.forEach(function (incoming) {
      if (!incoming || !incoming.id) return;
      var idx = -1;
      for (var i = 0; i < window.D360_ALERTS.length; i++) {
        if (window.D360_ALERTS[i].id === incoming.id) { idx = i; break; }
      }
      if (idx >= 0) window.D360_ALERTS[idx] = incoming;
      else window.D360_ALERTS.push(incoming);
    });
  }

  function closeDetail(skipSync) {
    var existing = document.querySelector('.d360-detail');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    if (!skipSync) syncUrl({ alert: null });
  }

  function openDetail(alertId) {
    var found = findAlert(alertId);
    if (!found) return;

    closeDetail(true);

    var lang = window.D360_LANG || 'es';

    var tpl = document.getElementById('d360-detail-tpl');
    if (!tpl) return;

    var fragment = document.importNode(tpl.content, true);
    var panel = fragment.firstElementChild;
    renderBindings(panel, found, lang);

    var closeBtn = panel.querySelector('.d360-detail__close');
    if (closeBtn) closeBtn.addEventListener('click', function () { closeDetail(false); });

    document.body.appendChild(panel);
    syncUrl({ alert: alertId });

    var firstFocusable = panel.querySelector('button');
    if (firstFocusable) firstFocusable.focus();
  }

  function alertHref(alert) {
    if (!alert) return null;
    var iso = window.D360_COUNTRY_ISO
      || (window.D360_FILTERS && window.D360_FILTERS.country)
      || alert.country
      || (alert.countries && alert.countries[0]);
    if (alert._paths && iso && alert._paths[iso]) return alert._paths[iso];
    return alert._path || null;
  }

  function bindCard(card) {
    if (!card || card.getAttribute('data-d360-bound')) return;
    card.setAttribute('data-d360-bound', '1');
    card.addEventListener('click', function () {
      var id = card.getAttribute('data-alert-id');
      var alerts = window.D360_ALERTS || [];
      var alert = alerts.find(function (a) { return a.id === id; });
      if (alert) {
        var href = alertHref(alert);
        if (href) {
          window.location.href = href;
          return;
        }
      }
      openDetail(id);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail(card.getAttribute('data-alert-id'));
      }
    });
  }

  window.D360DetailPanel = {
    open: openDetail,
    close: closeDetail,
    mergeAlerts: mergeAlerts,
    bindCard: bindCard,
    renderNarrativeText: renderNarrativeText,
    renderClaimMarkersHtml: renderClaimMarkersHtml,
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetail(false);
  });

}());
