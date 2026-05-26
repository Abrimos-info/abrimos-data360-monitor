'use strict';

(function () {
  var messagesEl = document.getElementById('d360-chat-messages');
  var formEl = document.getElementById('d360-chat-form');
  var inputEl = document.getElementById('d360-chat-input');
  var presetsEl = document.getElementById('d360-chat-presets');
  var focusEl = document.getElementById('d360-chat-focus');
  var focusSelectEl = document.getElementById('d360-focus-country');
  if (!messagesEl || !formEl || !inputEl) return;

  var demoCountries = window.D360_DEMO_COUNTRIES || ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];
  var lastSentFocusKey = null;

  var history = [];
  var sessionTurns = [];
  var busy = false;
  var lang = window.D360_LANG || 'es';
  var strings = (window.D360_STRINGS && window.D360_STRINGS[lang]) || {};

  function ui(key) {
    return strings[key] || (window.D360_STRINGS.en && window.D360_STRINGS.en[key]) || key;
  }

  function toolLabel(name) {
    return ui('chat.tool.' + name) || name;
  }

  function updateExportButtons() {
    var hasTurns = sessionTurns.length > 0;
    ['d360-export-copy', 'd360-export-md', 'd360-export-pdf'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !hasTurns || busy;
    });
  }

  function buildExportMarkdown() {
    if (!window.D360ChatExport) return '';
    return window.D360ChatExport.buildConversationMarkdown(sessionTurns, {
      title: ui('chat.export_title'),
      lang: lang,
      focusCountries: getFocusCountries(),
      toolLabel: toolLabel,
      labels: {
        exported: lang === 'en' ? 'Exported' : 'Exportado',
        focus: lang === 'en' ? 'Country focus' : 'Países foco',
        user: lang === 'en' ? 'User' : 'Usuario',
        assistant: lang === 'en' ? 'Assistant' : 'Asistente',
        sources: ui('chat.trace_title'),
        indicators: ui('chat.indicators_used'),
        data360_yes: ui('chat.trace_data360_yes'),
        data360_no: ui('chat.trace_data360_no'),
        no_sources: ui('chat.trace_none'),
        tool_failed: ui('chat.activity_tool_failed'),
      },
    });
  }

  function recordTurn(turn) {
    sessionTurns.push(turn);
    updateExportButtons();
  }

  function bindExportToolbar() {
    var copyBtn = document.getElementById('d360-export-copy');
    var mdBtn = document.getElementById('d360-export-md');
    var pdfBtn = document.getElementById('d360-export-pdf');
    if (!copyBtn && !mdBtn && !pdfBtn) return;

    function ensureExportable() {
      if (!sessionTurns.length) {
        window.alert(ui('chat.export_empty'));
        return false;
      }
      if (!window.D360ChatExport) return false;
      return true;
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!ensureExportable()) return;
        window.D360ChatExport.copyText(buildExportMarkdown())
          .then(function () { window.alert(ui('chat.export_copied')); })
          .catch(function (err) { logClientError('export-copy', err); });
      });
    }

    if (mdBtn) {
      mdBtn.addEventListener('click', function () {
        if (!ensureExportable()) return;
        var stamp = window.D360ChatExport.fileStamp();
        window.D360ChatExport.downloadText('data360-chat-' + stamp + '.md', buildExportMarkdown());
      });
    }

    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        if (!ensureExportable()) return;
        try {
          window.D360ChatExport.printConversationPdf(buildExportMarkdown(), {
            title: ui('chat.export_title'),
            lang: lang,
          });
        } catch (err) {
          logClientError('export-pdf', err);
          window.alert(err.message || ui('chat.error'));
        }
      });
    }

    updateExportButtons();
  }

  function getFocusSelectValue() {
    if (!focusSelectEl) return 'ALL';
    return focusSelectEl.value || 'ALL';
  }

  function getFocusCountries() {
    var value = getFocusSelectValue();
    if (value === 'ALL') return demoCountries.slice();
    return demoCountries.indexOf(value) >= 0 ? [value] : demoCountries.slice();
  }

  function focusKey(countries) {
    return (countries || getFocusCountries()).join(',');
  }

  function focusCountryPhrase(countries) {
    var list = countries && countries.length ? countries : getFocusCountries();
    if (list.length === demoCountries.length) {
      return lang === 'en' ? 'all demo countries' : 'todos los países demo';
    }
    if (list.length === 1) return list[0];
    return list.join(', ');
  }

  function appendFocusToQuery(text) {
    var countries = getFocusCountries();
    var key = focusKey(countries);
    var prefix = lang === 'en' ? 'Country focus' : 'Países foco';
    if (lastSentFocusKey === key) return text.trim();
    return text.trim() + '\n\n[' + prefix + ': ' + countries.join(', ') + ']';
  }

  function syncFreshnessCountrySelects() {
    var countries = getFocusCountries();
    if (countries.length !== 1) return;
    document.querySelectorAll('.d360-freshness-country').forEach(function (sel) {
      sel.value = countries[0];
    });
  }

  function bindFocusCountry() {
    if (!focusSelectEl) return;
    focusSelectEl.addEventListener('change', syncFreshnessCountrySelects);
    syncFreshnessCountrySelects();
  }

  function clearEmpty() {
    var empty = messagesEl.querySelector('.d360-chat__empty');
    if (empty) empty.remove();
  }

  function appendBubble(role, html, extraClass) {
    clearEmpty();
    var div = document.createElement('div');
    div.className = 'd360-chat__msg d360-chat__msg--' + role + (extraClass ? ' ' + extraClass : '');
    div.innerHTML = html;
    if (window.D360IndicatorPills && window.D360IndicatorPills.enhanceIndicatorPills) {
      window.D360IndicatorPills.enhanceIndicatorPills(div);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function setBusy(on) {
    busy = on;
    inputEl.disabled = on;
    var sendBtn = document.getElementById('d360-chat-send');
    if (sendBtn) sendBtn.disabled = on;
    updateExportButtons();
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatJson(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch (_) {
      return String(value);
    }
  }

  function formatMs(ms) {
    if (ms == null || !Number.isFinite(ms)) return '—';
    if (ms < 1000) return ms + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
  }

  function formatNum(n) {
    if (n == null || !Number.isFinite(n)) return '—';
    return String(n);
  }

  function formatTps(tps) {
    if (tps == null || !Number.isFinite(tps)) return '—';
    return tps.toFixed(1) + ' tok/s';
  }

  function argsHint(args) {
    if (!args) return '';
    if (args.country) return args.country;
    if (args.country_code) return args.country_code;
    if (args.country_codes && args.country_codes.length) return args.country_codes.join(', ');
    if (args.idno) return args.idno;
    if (args.indicator_id) return args.indicator_id;
    return '';
  }

  function debugGrid(items) {
    var rows = items.filter(function (item) { return item.value != null && item.value !== '—'; });
    if (!rows.length) return '';
    return '<dl class="d360-chat__debug">' +
      rows.map(function (item) {
        return '<div class="d360-chat__debug-row">' +
          '<dt>' + escapeHtml(item.label) + '</dt>' +
          '<dd>' + escapeHtml(String(item.value)) + '</dd>' +
          '</div>';
      }).join('') +
      '</dl>';
  }

  function debugBlock(title, content) {
    if (!content) return '';
    return '<div class="d360-chat__debug-block">' +
      '<h4 class="d360-chat__debug-title">' + escapeHtml(title) + '</h4>' +
      '<pre class="d360-chat__debug-pre">' + escapeHtml(content) + '</pre>' +
      '</div>';
  }

  function stepStateClass(state) {
    if (state === 'active') return 'd360-chat__step--active';
    if (state === 'failed') return 'd360-chat__step--failed';
    return 'd360-chat__step--done';
  }

  function stepIcon(state) {
    if (state === 'active') {
      return '<span class="d360-chat__spinner" aria-hidden="true"></span>';
    }
    if (state === 'failed') {
      return '<span class="d360-chat__act-icon d360-chat__act-icon--fail">!</span>';
    }
    return '<span class="d360-chat__act-icon">✓</span>';
  }

  function createStepController(rootEl) {
    var activityEl = rootEl.querySelector('.d360-chat__activity');
    var cardsEl = rootEl.querySelector('.d360-chat__cards');
    var steps = {};

    function scroll() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function buildSummary(kind, label, meta, state) {
      return stepIcon(state) +
        '<span class="d360-chat__step-label">' + escapeHtml(label) + '</span>' +
        (meta ? '<span class="d360-chat__step-meta">' + escapeHtml(meta) + '</span>' : '') +
        '<span class="d360-chat__step-chevron" aria-hidden="true"></span>';
    }

    function ensureStep(id, kind, label, meta, state) {
      if (steps[id]) return steps[id];
      var details = document.createElement('details');
      details.className = 'd360-chat__step d360-chat__step--' + kind + ' ' + stepStateClass(state || 'active');
      details.setAttribute('data-act-id', id);
      details.open = false;

      var summary = document.createElement('summary');
      summary.className = 'd360-chat__step-summary';
      summary.innerHTML = buildSummary(kind, label, meta, state || 'active');

      var body = document.createElement('div');
      body.className = 'd360-chat__step-body';

      details.appendChild(summary);
      details.appendChild(body);
      activityEl.appendChild(details);

      steps[id] = { el: details, body: body, kind: kind, label: label };
      scroll();
      return steps[id];
    }

    function setState(id, state, meta) {
      var step = steps[id];
      if (!step) return;
      step.el.className = 'd360-chat__step d360-chat__step--' + step.kind + ' ' + stepStateClass(state);
      var summary = step.el.querySelector('.d360-chat__step-summary');
      if (summary) {
        summary.innerHTML = buildSummary(step.kind, step.label, meta, state);
      }
      if (state !== 'active') step.el.open = false;
      scroll();
    }

    function setBody(id, html) {
      var step = steps[id];
      if (!step) return;
      step.body.innerHTML = html;
      scroll();
    }

    function appendCards(alerts) {
      if (!cardsEl || !window.D360ChatCards || !alerts || !alerts.length) return;
      if (window.D360DetailPanel && window.D360DetailPanel.mergeAlerts) {
        window.D360DetailPanel.mergeAlerts(alerts);
      }
      var html = window.D360ChatCards.renderAlertCards(alerts, lang);
      if (!html) return;
      if (!cardsEl.querySelector('.d360-chat__cards-title')) {
        cardsEl.innerHTML = '<p class="d360-chat__cards-title">' + escapeHtml(ui('chat.cards_title')) + '</p>';
      }
      cardsEl.insertAdjacentHTML('beforeend', html);
      cardsEl.querySelectorAll('.d360-card--chat').forEach(function (card) {
        if (window.D360DetailPanel && window.D360DetailPanel.bindCard) {
          window.D360DetailPanel.bindCard(card);
        }
      });
      scroll();
    }

    return {
      addBoot: function () {
        ensureStep('boot', 'llm', ui('chat.activity_thinking') + '…', '', 'active');
      },
      finishBoot: function () {
        setState('boot', 'done');
      },
      llmStart: function (payload) {
        this.finishBoot();
        var id = 'llm-' + payload.turn;
        var providerMeta = [payload.provider, payload.model].filter(Boolean).join(' · ');
        ensureStep(id, 'llm', ui('chat.activity_thinking') + '… (turn ' + (payload.turn + 1) + ')', providerMeta, 'active');
        var grid = debugGrid([
          { label: ui('chat.debug.model'), value: payload.model },
          { label: ui('chat.debug.provider'), value: payload.provider },
          { label: ui('chat.debug.messages'), value: payload.message_count },
        ]);
        setBody(id, grid + debugBlock(ui('chat.debug.request'), payload.request_preview || ''));
        steps[id].label = ui('chat.activity_thinking') + '… (turn ' + (payload.turn + 1) + ')';
      },
      llmEnd: function (payload) {
        var id = 'llm-' + payload.turn;
        var step = steps[id];
        if (!step) return;
        var meta = payload.has_tools ? ui('chat.activity_tool') : ui('chat.activity_tool_done');
        step.label = ui('chat.activity_thinking') + ' · turn ' + (payload.turn + 1);
        setState(id, 'done', meta);

        var body = debugGrid([
          { label: ui('chat.debug.model'), value: payload.model },
          { label: ui('chat.debug.provider'), value: payload.provider },
          { label: ui('chat.debug.duration'), value: formatMs(payload.duration_ms) },
          { label: ui('chat.debug.input_tokens'), value: formatNum(payload.input_tokens) },
          { label: ui('chat.debug.output_tokens'), value: formatNum(payload.output_tokens) },
          { label: ui('chat.debug.tps'), value: formatTps(payload.tokens_per_second) },
        ]);

        if (payload.tool_calls && payload.tool_calls.length) {
          body += debugBlock(ui('chat.debug.tool_calls'), formatJson(payload.tool_calls));
        }
        if (payload.response_preview) {
          body += debugBlock(ui('chat.debug.response'), payload.response_preview);
        }
        setBody(id, body);
      },
      toolStart: function (payload) {
        if (steps[payload.id]) return;
        var req = payload.request || payload.args;
        var hint = argsHint(req);
        var meta = payload.data360 ? 'Data360' : (payload.name === 'read_news' ? 'GDELT' : (payload.source || ''));
        var label = ui('chat.activity_tool') + ': ' + toolLabel(payload.name) + (hint ? ' (' + hint + ')' : '');
        ensureStep(payload.id, 'tool', label, meta, 'active');
        setBody(payload.id, debugBlock(ui('chat.debug.request'), formatJson(req)));
        steps[payload.id].label = label;
      },
      toolResult: function (payload) {
        var step = steps[payload.id];
        if (!step) {
          this.toolStart(payload);
          step = steps[payload.id];
        }
        var meta = payload.source || '';
        if (payload.data360) meta = (meta || 'Data360') + (payload.ok ? '' : ' · ' + ui('chat.activity_tool_failed'));
        setState(payload.id, payload.ok ? 'done' : 'failed', meta);

        var body = debugGrid([
          { label: ui('chat.debug.duration'), value: formatMs(payload.duration_ms) },
          { label: ui('chat.debug.source'), value: payload.source },
          { label: ui('chat.debug.data360'), value: payload.data360 ? ui('chat.trace_data360_yes') : ui('chat.trace_data360_no') },
        ]);
        body += debugBlock(ui('chat.debug.request'), formatJson(payload.request));
        body += debugBlock(ui('chat.debug.response'), payload.response_text || formatJson(payload.response));

        if (payload.indicators && payload.indicators.length && window.D360ChatCards) {
          body += '<div class="d360-chat__debug-block">' +
            '<h4 class="d360-chat__debug-title">' + escapeHtml(ui('chat.debug.indicators')) + '</h4>' +
            window.D360ChatCards.indicatorLinksHtml(payload.indicators, lang) +
            '</div>';
        }

        setBody(payload.id, body);

        if (payload.alerts && payload.alerts.length) {
          appendCards(payload.alerts);
          if (window.D360AlertsFeed) {
            window.D360AlertsFeed.upsertAlertsInFeed(payload.alerts, lang);
            if (payload.name === 'run_analysis' && payload.source === 'pipeline') {
              window.D360AlertsFeed.notifyAlertsUpdated();
            }
          }
        }
      },
      failBoot: function () {
        setState('boot', 'failed');
      },
    };
  }

  function renderTrace(container, trace, usedData360, indicators) {
    var el = container.querySelector('.d360-chat__trace');
    if (!el) return;

    var html = '';

    if (!trace || !trace.length) {
      html += '<span class="d360-chat__trace-label">' + escapeHtml(ui('chat.trace_title')) + ':</span> ' +
        escapeHtml(ui('chat.trace_none'));
    } else {
      var parts = trace.map(function (t) {
        var lbl = toolLabel(t.name);
        var src = t.source ? ' · ' + t.source : '';
        var mark = t.ok ? '' : ' (' + ui('chat.activity_tool_failed') + ')';
        return lbl + src + mark;
      });
      html += '<span class="d360-chat__trace-label">' + escapeHtml(ui('chat.trace_title')) + ':</span> ' +
        escapeHtml(parts.join(' → '));
    }

    html += '<br><span class="d360-chat__trace-data360">' +
      escapeHtml(usedData360 ? ui('chat.trace_data360_yes') : ui('chat.trace_data360_no')) +
      '</span>';

    if (indicators && indicators.length && window.D360ChatCards) {
      html += '<div class="d360-chat__trace-indicators">' +
        '<span class="d360-chat__trace-label">' + escapeHtml(ui('chat.indicators_used')) + ':</span>' +
        window.D360ChatCards.indicatorLinksHtml(indicators, lang) +
        '</div>';
    }

    el.innerHTML = html;
  }

  function logClientError(scope, err, extra) {
    console.error('[d360-chat:' + scope + ']', extra || '', err);
    if (err && err.stack) console.error(err.stack);
    if (err && err.cause) console.error('[d360-chat:cause]', err.cause);
  }

  function parseSseChunk(text, state) {
    state.buffer += text;
    var parts = state.buffer.split('\n\n');
    state.buffer = parts.pop() || '';
    parts.forEach(function (block) {
      var event = 'message';
      var data = '';
      block.split('\n').forEach(function (line) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      });
      if (data) {
        try {
          state.handler(event, JSON.parse(data));
        } catch (parseErr) {
          logClientError('sse-parse', parseErr, { event: event, data_preview: data.slice(0, 500) });
        }
      }
    });
  }

  async function streamChat(userText) {
    var countries = getFocusCountries();
    var focusChanged = lastSentFocusKey !== focusKey(countries);

    setBusy(true);
    var queryText = appendFocusToQuery(userText);
    lastSentFocusKey = focusKey(countries);
    history.push({ role: 'user', content: queryText });
    appendBubble('user', '<p>' + escapeHtml(userText) + '</p>');

    var assistantEl = appendBubble('assistant',
      '<div class="d360-chat__activity"></div>' +
      '<div class="d360-chat__cards"></div>' +
      '<div class="d360-chat__stream"></div>' +
      '<div class="d360-chat__trace"></div>',
      'is-streaming');

    var steps = createStepController(assistantEl);
    var streamEl = assistantEl.querySelector('.d360-chat__stream');
    var markdown = '';
    var trace = [];
    var usedData360 = false;
    var indicatorsUsed = [];
    var pendingCharts = [];

    steps.addBoot();

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          focus_countries: countries,
          focus_changed: focusChanged,
        }),
      });

      if (!res.ok || !res.body) {
        var errBody = '';
        try { errBody = await res.text(); } catch (_) { /* ignore */ }
        logClientError('http', new Error('Chat request failed: ' + res.status), {
          status: res.status,
          statusText: res.statusText,
          body: errBody.slice(0, 2000),
        });
        throw new Error('Chat request failed: ' + res.status + (errBody ? ' — ' + errBody.slice(0, 200) : ''));
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var state = {
        buffer: '',
        handler: function (event, payload) {
          if (event === 'chat_start' && window.D360ChatTurnUi && window.D360ChatTurnUi.mountChatLlmMeta) {
            window.D360ChatTurnUi.mountChatLlmMeta(document.getElementById('d360-chat-llm'), payload, strings, lang);
          }
          if (event === 'llm_start') steps.llmStart(payload);
          if (event === 'llm_end') steps.llmEnd(payload);
          if (event === 'tool_start') steps.toolStart(payload);
          if (event === 'tool_result') {
            trace.push({
              name: payload.name,
              ok: payload.ok,
              source: payload.source,
              data360: payload.data360,
            });
            if (payload.data360 && payload.ok) usedData360 = true;
            if (window.D360Markdown && window.D360Markdown.cacheSeriesFromTool) {
              window.D360Markdown.cacheSeriesFromTool(payload);
            }
            if (window.D360IndicatorPills) {
              if (payload.indicators && payload.indicators.length) {
                window.D360IndicatorPills.registerIndicators(payload.indicators);
              }
              if (payload.indicator_name && payload.request && payload.request.indicator_id) {
                window.D360IndicatorPills.registerIndicator({
                  idno: payload.request.indicator_id,
                  name: payload.indicator_name,
                  database_id: payload.request.database_id,
                });
              }
            }
            if (payload.name === 'mcp_get_data' && payload.ok && payload.request) {
              pendingCharts.push({
                indicator_id: payload.request.indicator_id,
                country_code: payload.request.country_code,
              });
            }
            steps.toolResult(payload);
          }
          if (event === 'token') {
            markdown += payload.text || '';
            renderChatMarkdown(streamEl, markdown, pendingCharts);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
          if (event === 'done') {
            markdown = payload.markdown || markdown;
            trace = payload.trace || trace;
            usedData360 = payload.used_data360 === true || usedData360;
            indicatorsUsed = payload.indicators || indicatorsUsed;
            renderChatMarkdown(streamEl, markdown, pendingCharts);
            renderTrace(assistantEl, trace, usedData360, indicatorsUsed);
          }
          if (event === 'error') {
            logClientError('server', new Error(payload.message || ui('chat.error')), payload);
            steps.failBoot();
            streamEl.innerHTML = '<p class="d360-chat__error">' + escapeHtml(payload.message || ui('chat.error')) + '</p>';
          }
        },
      };

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        parseSseChunk(decoder.decode(chunk.value, { stream: true }), state);
      }

      assistantEl.classList.remove('is-streaming');
      if (markdown) history.push({ role: 'assistant', content: markdown });
      recordTurn({
        user: userText,
        assistant: markdown || '',
        trace: trace.slice(),
        indicators: indicatorsUsed.slice(),
        usedData360: usedData360,
      });
    } catch (err) {
      assistantEl.classList.remove('is-streaming');
      steps.failBoot();
      logClientError('stream', err, { userText: userText, trace: trace });
      streamEl.innerHTML = '<p class="d360-chat__error">' + escapeHtml(err.message) + '</p>';
      recordTurn({
        user: userText,
        assistant: '**' + ui('chat.error') + ':** ' + err.message,
        trace: trace.slice(),
        indicators: indicatorsUsed.slice(),
        usedData360: usedData360,
      });
    } finally {
      setBusy(false);
    }
  }

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    streamChat(text);
  });

  if (presetsEl) {
    presetsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-prompt]');
      if (!btn || busy) return;
      streamChat(btn.getAttribute('data-prompt'));
    });
  }

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  function renderChatMarkdown(targetEl, text, pendingCharts) {
    if (!targetEl) return;
    if (window.D360Markdown) {
      targetEl.innerHTML = '<div class="d360-prose">' +
        window.D360Markdown.renderMarkdown(text, { pendingCharts: pendingCharts || [] }) +
        '</div>';
    } else {
      targetEl.textContent = text;
    }
  }

  function bindFreshnessPanel(rootEl) {
    if (!rootEl) return;
    var countrySelect = rootEl.querySelector('.d360-freshness-country');
    var catalogBtn = rootEl.querySelector('.d360-fresh__catalog');
    if (catalogBtn) {
      catalogBtn.addEventListener('click', function () {
        if (busy) return;
        var prompt = catalogBtn.getAttribute('data-prompt');
        if (prompt) streamChat(prompt);
      });
    }
    rootEl.querySelectorAll('.d360-fresh__item').forEach(function (row) {
      var idno = row.getAttribute('data-idno');
      row.querySelectorAll('[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (busy || !idno) return;
          var focus = getFocusCountries();
          var country = focus.length === 1
            ? focus[0]
            : (countrySelect ? countrySelect.value : 'ARG');
          var countryText = focus.length === demoCountries.length ? country : focusCountryPhrase(focus);
          var action = btn.getAttribute('data-action');
          var text = action === 'chart'
            ? (lang === 'en'
              ? 'Chart ' + idno + ' for ' + countryText + '. Call mcp_get_data, then include a ```sparkline``` block with indicator_id+country_code or observations from the tool. Do not invent alert_id.'
              : 'Gráfica ' + idno + ' para ' + countryText + '. Llamá mcp_get_data e incluí un bloque ```sparkline``` con indicator_id+country_code u observations del tool. No inventes alert_id.')
            : (lang === 'en'
              ? 'Analyze ' + idno + ' for ' + countryText + ' with the monitor pipeline and summarize alerts.'
              : 'Análisis ' + idno + ' para ' + countryText + ' con el pipeline del monitor y resumí alertas.');
          streamChat(text);
        });
      });
    });
  }

  function showFreshnessInChat() {
    if (busy) return;
    var tpl = document.getElementById('d360-fresh-tpl');
    if (!tpl) return;
    clearEmpty();
    var wrap = document.createElement('div');
    wrap.className = 'd360-chat__msg d360-chat__msg--assistant d360-chat__msg--freshness';
    wrap.appendChild(document.importNode(tpl.content, true));
    messagesEl.appendChild(wrap);
    bindFreshnessPanel(wrap);
    syncFreshnessCountrySelects();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  var freshnessOpenBtn = document.getElementById('d360-freshness-open');
  if (freshnessOpenBtn) {
    freshnessOpenBtn.addEventListener('click', showFreshnessInChat);
  }

  bindFocusCountry();
  bindExportToolbar();

  var llmMetaEl = document.getElementById('d360-chat-llm');
  if (llmMetaEl && window.D360ChatTurnUi && window.D360ChatTurnUi.loadChatLlmMeta) {
    window.D360ChatTurnUi.loadChatLlmMeta(llmMetaEl, strings, lang);
  }
}());
