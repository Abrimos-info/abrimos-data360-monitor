'use strict';

(function (global) {
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function ui(strings, lang, key) {
    return strings[key]
      || (global.D360_STRINGS && global.D360_STRINGS.en && global.D360_STRINGS.en[key])
      || key;
  }

  function toolLabel(strings, lang, name) {
    return ui(strings, lang, 'chat.tool.' + name) || name;
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

  function assistantShell() {
    return '<div class="d360-chat__activity"></div>' +
      '<div class="d360-chat__cards"></div>' +
      '<div class="d360-chat__stream"></div>' +
      '<div class="d360-chat__trace"></div>';
  }

  function renderChatMarkdown(targetEl, text, pendingCharts) {
    if (!targetEl) return;
    if (global.D360Markdown) {
      targetEl.innerHTML = '<div class="d360-prose">' +
        global.D360Markdown.renderMarkdown(text, { pendingCharts: pendingCharts || [] }) +
        '</div>';
    } else {
      targetEl.textContent = text;
    }
  }

  function renderRestoredActivity(activityEl, steps, lang, strings) {
    if (!activityEl || !steps || !steps.length) return;
    steps.forEach(function (step, index) {
      var state = step.state === 'failed' ? 'failed' : 'done';
      var details = document.createElement('details');
      details.className = 'd360-chat__step d360-chat__step--' + (step.kind || 'tool') + ' ' + stepStateClass(state);
      details.setAttribute('data-act-id', 'restore-' + index);
      details.open = false;

      var summary = document.createElement('summary');
      summary.className = 'd360-chat__step-summary';
      summary.innerHTML = buildSummary(step.kind || 'tool', step.label || '', step.meta || '', state);

      var body = document.createElement('div');
      body.className = 'd360-chat__step-body';
      body.innerHTML = '<p class="d360-chat__trace-none">' +
        escapeHtml(ui(strings, lang, 'chat.trace_restored') || 'Restored from this session') +
        '</p>';

      details.appendChild(summary);
      details.appendChild(body);
      activityEl.appendChild(details);
    });
  }

  function renderTrace(container, trace, usedData360, indicators, lang, strings) {
    var el = container.querySelector('.d360-chat__trace');
    if (!el) return;

    var html = '';
    if (!trace || !trace.length) {
      html += '<span class="d360-chat__trace-label">' + escapeHtml(ui(strings, lang, 'chat.trace_title')) + ':</span> ' +
        escapeHtml(ui(strings, lang, 'chat.trace_none'));
    } else {
      var parts = trace.map(function (t) {
        var lbl = toolLabel(strings, lang, t.name);
        var src = t.source ? ' · ' + t.source : '';
        var mark = t.ok ? '' : ' (' + ui(strings, lang, 'chat.activity_tool_failed') + ')';
        return lbl + src + mark;
      });
      html += '<span class="d360-chat__trace-label">' + escapeHtml(ui(strings, lang, 'chat.trace_title')) + ':</span> ' +
        escapeHtml(parts.join(' → '));
    }

    html += '<br><span class="d360-chat__trace-data360">' +
      escapeHtml(usedData360 ? ui(strings, lang, 'chat.trace_data360_yes') : ui(strings, lang, 'chat.trace_data360_no')) +
      '</span>';

    if (indicators && indicators.length && global.D360ChatCards) {
      html += '<div class="d360-chat__trace-indicators">' +
        '<span class="d360-chat__trace-label">' + escapeHtml(ui(strings, lang, 'chat.indicators_used')) + ':</span>' +
        global.D360ChatCards.indicatorLinksHtml(indicators, lang) +
        '</div>';
    }

    el.innerHTML = html;
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
        } catch (_) { /* ignore malformed chunk */ }
      }
    });
  }

  function createStepController(rootEl, messagesEl, lang, strings, hooks) {
    hooks = hooks || {};
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
      if (!cardsEl || !global.D360ChatCards || !alerts || !alerts.length) return;
      if (hooks.mergeAlerts && global.D360DetailPanel && global.D360DetailPanel.mergeAlerts) {
        global.D360DetailPanel.mergeAlerts(alerts);
      }
      var html = global.D360ChatCards.renderAlertCards(alerts, lang);
      if (!html) return;
      if (!cardsEl.querySelector('.d360-chat__cards-title')) {
        cardsEl.innerHTML = '<p class="d360-chat__cards-title">' + escapeHtml(ui(strings, lang, 'chat.cards_title')) + '</p>';
      }
      cardsEl.insertAdjacentHTML('beforeend', html);
      cardsEl.querySelectorAll('.d360-card--chat').forEach(function (card) {
        if (global.D360DetailPanel && global.D360DetailPanel.bindCard) {
          global.D360DetailPanel.bindCard(card);
        }
      });
      scroll();
    }

    return {
      addBoot: function () {
        ensureStep('boot', 'llm', ui(strings, lang, 'chat.activity_thinking') + '…', '', 'active');
      },
      finishBoot: function () {
        setState('boot', 'done');
      },
      llmStart: function (payload) {
        this.finishBoot();
        var id = 'llm-' + payload.turn;
        ensureStep(id, 'llm', ui(strings, lang, 'chat.activity_thinking') + '… (turn ' + (payload.turn + 1) + ')', payload.model || '', 'active');
        var grid = debugGrid([
          { label: ui(strings, lang, 'chat.debug.model'), value: payload.model },
          { label: ui(strings, lang, 'chat.debug.provider'), value: payload.provider },
          { label: ui(strings, lang, 'chat.debug.messages'), value: payload.message_count },
        ]);
        setBody(id, grid + debugBlock(ui(strings, lang, 'chat.debug.request'), payload.request_preview || ''));
        steps[id].label = ui(strings, lang, 'chat.activity_thinking') + '… (turn ' + (payload.turn + 1) + ')';
      },
      llmEnd: function (payload) {
        var id = 'llm-' + payload.turn;
        var step = steps[id];
        if (!step) return;
        var meta = payload.has_tools ? ui(strings, lang, 'chat.activity_tool') : ui(strings, lang, 'chat.activity_tool_done');
        step.label = ui(strings, lang, 'chat.activity_thinking') + ' · turn ' + (payload.turn + 1);
        setState(id, 'done', meta);
        var body = debugGrid([
          { label: ui(strings, lang, 'chat.debug.model'), value: payload.model },
          { label: ui(strings, lang, 'chat.debug.provider'), value: payload.provider },
          { label: ui(strings, lang, 'chat.debug.duration'), value: formatMs(payload.duration_ms) },
          { label: ui(strings, lang, 'chat.debug.input_tokens'), value: formatNum(payload.input_tokens) },
          { label: ui(strings, lang, 'chat.debug.output_tokens'), value: formatNum(payload.output_tokens) },
          { label: ui(strings, lang, 'chat.debug.tps'), value: formatTps(payload.tokens_per_second) },
        ]);
        if (payload.tool_calls && payload.tool_calls.length) {
          body += debugBlock(ui(strings, lang, 'chat.debug.tool_calls'), formatJson(payload.tool_calls));
        }
        if (payload.response_preview) {
          body += debugBlock(ui(strings, lang, 'chat.debug.response'), payload.response_preview);
        }
        setBody(id, body);
      },
      toolStart: function (payload) {
        if (steps[payload.id]) return;
        var req = payload.request || payload.args;
        var hint = argsHint(req);
        var meta = payload.data360 ? 'Data360' : (payload.name === 'read_news' ? 'GDELT' : (payload.source || ''));
        var label = ui(strings, lang, 'chat.activity_tool') + ': ' + toolLabel(strings, lang, payload.name) + (hint ? ' (' + hint + ')' : '');
        ensureStep(payload.id, 'tool', label, meta, 'active');
        setBody(payload.id, debugBlock(ui(strings, lang, 'chat.debug.request'), formatJson(req)));
        steps[payload.id].label = label;
      },
      toolResult: function (payload) {
        var step = steps[payload.id];
        if (!step) {
          this.toolStart(payload);
          step = steps[payload.id];
        }
        var meta = payload.source || '';
        if (payload.data360) meta = (meta || 'Data360') + (payload.ok ? '' : ' · ' + ui(strings, lang, 'chat.activity_tool_failed'));
        setState(payload.id, payload.ok ? 'done' : 'failed', meta);
        var body = debugGrid([
          { label: ui(strings, lang, 'chat.debug.duration'), value: formatMs(payload.duration_ms) },
          { label: ui(strings, lang, 'chat.debug.source'), value: payload.source },
          { label: ui(strings, lang, 'chat.debug.data360'), value: payload.data360 ? ui(strings, lang, 'chat.trace_data360_yes') : ui(strings, lang, 'chat.trace_data360_no') },
        ]);
        body += debugBlock(ui(strings, lang, 'chat.debug.request'), formatJson(payload.request));
        body += debugBlock(ui(strings, lang, 'chat.debug.response'), payload.response_text || formatJson(payload.response));
        if (payload.indicators && payload.indicators.length && global.D360ChatCards) {
          body += '<div class="d360-chat__debug-block">' +
            '<h4 class="d360-chat__debug-title">' + escapeHtml(ui(strings, lang, 'chat.debug.indicators')) + '</h4>' +
            global.D360ChatCards.indicatorLinksHtml(payload.indicators, lang) +
            '</div>';
        }
        setBody(payload.id, body);
        if (payload.alerts && payload.alerts.length) {
          appendCards(payload.alerts);
        }
      },
      failBoot: function () {
        setState('boot', 'failed');
      },
    };
  }

  global.D360ChatTurnUi = {
    escapeHtml: escapeHtml,
    ui: ui,
    toolLabel: toolLabel,
    assistantShell: assistantShell,
    renderChatMarkdown: renderChatMarkdown,
    renderRestoredActivity: renderRestoredActivity,
    renderTrace: renderTrace,
    parseSseChunk: parseSseChunk,
    createStepController: createStepController,
  };
}(typeof window !== 'undefined' ? window : globalThis));
