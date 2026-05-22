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

  function sanitizeUrl(url) {
    if (!url) return url;
    return String(url).replace(/[)\],.;]+$/, '');
  }

  function renderNarrativeText(text, alert, lang) {
    if (!text) return '';
    var map = new Map((alert.claim_tokens || []).map(function (t) { return [String(t.claim_id), t]; }));
    return String(text).replace(/\{\{claim:([^}|]+)\|([^}]*)\}\}/g, function (_, id, fallback) {
      var token = map.get(String(id));
      if (token) {
        var field = lang === 'en' ? 'display_en' : 'display_es';
        if (token[field] && token[field].indexOf('{{claim:') === -1) return token[field];
        return fallback || String(token.value);
      }
      return fallback || id;
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
      return '<span class="d360-country"><span class="d360-country__iso">' + escHtml(iso) + '</span></span>';
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
      leadEl.textContent = renderNarrativeText(leadText, alert, lng);
    } else if (leadWrap) {
      leadWrap.style.display = 'none';
    }

    var storyText = pickBilingual(alert.story, lng);
    var storyEl = node.querySelector('[data-bind="story"]');
    var storyWrap = node.querySelector('[data-bind="storyWrap"]');
    if (storyText && storyEl) {
      var resolved = renderNarrativeText(storyText, alert, lng);
      if (window.marked && window.marked.parse) {
        storyEl.innerHTML = window.marked.parse(resolved, { gfm: true, breaks: false });
      } else {
        storyEl.innerHTML = renderStoryHtml(resolved);
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
      indicatorsEl.innerHTML = alert.indicators.map(function (idno) {
        var url = 'https://data360.worldbank.org/en/int/indicators/' + encodeURIComponent(idno);
        return '<li><a href="' + escAttr(url) + '" target="_blank" rel="noopener">' + escHtml(idno) + '</a></li>';
      }).join('');
    } else if (indicatorsWrap) {
      indicatorsWrap.style.display = 'none';
    }

    var traceEl = node.querySelector('[data-bind="trace"]');
    if (traceEl && alert.verification_trace) {
      var t = alert.verification_trace;
      var items = [];
      if (t.data360_dataset_url) {
        items.push(
          '<li><span class="d360-trace__num">1</span>' +
          '<a class="d360-trace__link" href="' + escAttr(t.data360_dataset_url) + '" target="_blank" rel="noopener">' +
          escHtml(uiString('detail.data360_dataset', lng)) + '</a>' +
          '<span class="d360-trace__hint">data360.worldbank.org</span></li>'
        );
      }
      if (t.csv_link) {
        items.push(
          '<li><span class="d360-trace__num">2</span>' +
          '<a class="d360-trace__link" href="' + escAttr(t.csv_link) + '" target="_blank" rel="noopener">' +
          escHtml(uiString('detail.csv_download', lng)) + '</a>' +
          '<span class="d360-trace__hint">.csv</span></li>'
        );
      }
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
      metaEl.innerHTML = [
        '<div><dt>' + escHtml(uiString('detail.country', lng)) + '</dt><dd>' + escHtml(countryStr) + '</dd></div>',
        '<div><dt>' + escHtml(uiString('detail.category', lng)) + '</dt><dd>' + escHtml(alert.category || '') + '</dd></div>',
        '<div><dt>' + escHtml(uiString('detail.score', lng)) + '</dt><dd>' + escHtml(formatScore(alert.score)) + '</dd></div>',
        '<div><dt>' + escHtml(uiString('detail.detected_pipeline', lng)) + '</dt><dd>' + escHtml(alert.detected_at ? alert.detected_at.slice(0, 10) : '') + '</dd></div>',
      ].join('');
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
          : 'https://data360.worldbank.org';
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

  function bindCard(card) {
    if (!card || card.getAttribute('data-d360-bound')) return;
    card.setAttribute('data-d360-bound', '1');
    card.addEventListener('click', function () {
      openDetail(card.getAttribute('data-alert-id'));
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
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetail(false);
  });

}());
