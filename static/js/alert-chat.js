'use strict';

(function () {
  function initScoped(opts) {
    if (!opts || !opts.formEl || !opts.messagesEl) return;
    var TurnUi = window.D360ChatTurnUi;
    if (!TurnUi) return;

    var alertId = opts.alertId;
    var lang = window.D360_LANG || 'es';
    var strings = (window.D360_STRINGS && window.D360_STRINGS[lang]) || {};
    var history = [];
    var busy = false;
    var storageKey = 'd360-chat-' + alertId;

    try {
      var saved = sessionStorage.getItem(storageKey);
      if (saved) history = JSON.parse(saved);
    } catch (_) { /* ignore */ }

    function saveHistory() {
      try { sessionStorage.setItem(storageKey, JSON.stringify(history.slice(-20))); } catch (_) { /* ignore */ }
    }

    function setBusy(on) {
      busy = on;
      if (opts.inputEl) opts.inputEl.disabled = on;
      if (opts.sendEl) opts.sendEl.disabled = on;
      if (opts.presetsEl) {
        opts.presetsEl.querySelectorAll('button').forEach(function (btn) {
          btn.disabled = on;
        });
      }
    }

    function showMessages() {
      opts.messagesEl.hidden = false;
      if (opts.welcomeEl) opts.welcomeEl.hidden = true;
      if (opts.panelEl) opts.panelEl.classList.add('d360-alert-chat__panel--has-messages');
    }

    function hidePresets() {
      if (!opts.presetsEl || opts.presetsEl.hidden) return;
      opts.presetsEl.hidden = true;
      if (opts.panelEl) opts.panelEl.classList.add('d360-alert-chat__panel--active');
    }

    function onConversationStarted() {
      hidePresets();
    }

    function appendBubble(role, html, extraClass) {
      showMessages();
      var div = document.createElement('div');
      div.className = 'd360-chat__msg d360-chat__msg--' + role + (extraClass ? ' ' + extraClass : '');
      div.innerHTML = html;
      if (window.D360IndicatorPills && window.D360IndicatorPills.enhanceIndicatorPills) {
        window.D360IndicatorPills.enhanceIndicatorPills(div);
      }
      opts.messagesEl.appendChild(div);
      opts.messagesEl.scrollTop = opts.messagesEl.scrollHeight;
      return div;
    }

    function mergeSparklineCache(saved) {
      if (!saved || typeof saved !== 'object') return;
      window.D360_SPARKLINE_CACHE = window.D360_SPARKLINE_CACHE || {};
      Object.keys(saved).forEach(function (key) {
        window.D360_SPARKLINE_CACHE[key] = saved[key];
      });
    }

    function snapshotSparklineCache(pendingCharts) {
      var cache = window.D360_SPARKLINE_CACHE || {};
      var out = {};
      (pendingCharts || []).forEach(function (spec) {
        var key = (spec.indicator_id || '') + '|' + (spec.country_code || '');
        if (cache[key]) out[key] = cache[key];
      });
      return out;
    }

    function buildActivitySnapshot(trace) {
      var steps = [{
        kind: 'llm',
        label: TurnUi.ui(strings, lang, 'chat.activity_thinking') + ' · turn 1',
        meta: TurnUi.ui(strings, lang, 'chat.activity_tool_done'),
        state: 'done',
      }];
      (trace || []).forEach(function (t) {
        steps.push({
          kind: 'tool',
          label: TurnUi.ui(strings, lang, 'chat.activity_tool') + ': ' + TurnUi.toolLabel(strings, lang, t.name),
          meta: t.data360 ? 'Data360' : (t.source || ''),
          state: t.ok ? 'done' : 'failed',
        });
      });
      return steps;
    }

    function registerIndicatorsFromTrace(trace) {
      if (!window.D360IndicatorPills || !trace || !trace.length) return;
      trace.forEach(function (t) {
        if (t.indicators && t.indicators.length) {
          window.D360IndicatorPills.registerIndicators(t.indicators);
        }
      });
    }

    function restoreAssistantTurn(msg) {
      var el = appendBubble('assistant', TurnUi.assistantShell());
      if (msg.sparkline_cache) mergeSparklineCache(msg.sparkline_cache);
      if (msg.indicators && window.D360IndicatorPills && window.D360IndicatorPills.registerIndicators) {
        window.D360IndicatorPills.registerIndicators(msg.indicators);
      }
      registerIndicatorsFromTrace(msg.trace);

      var streamEl = el.querySelector('.d360-chat__stream');
      TurnUi.renderChatMarkdown(streamEl, msg.content, msg.pending_charts || []);

      if (msg.activity && msg.activity.length) {
        TurnUi.renderRestoredActivity(el.querySelector('.d360-chat__activity'), msg.activity, lang, strings);
      }

      TurnUi.renderTrace(
        el,
        msg.trace || [],
        msg.used_data360 === true,
        msg.indicators || [],
        lang,
        strings,
      );
      return el;
    }

    function renderAssistantContent(markdown, pendingCharts) {
      var shell = TurnUi.assistantShell();
      var streamHtml = window.D360Markdown
        ? '<div class="d360-prose">' +
          window.D360Markdown.renderMarkdown(markdown, { pendingCharts: pendingCharts || [] }) +
          '</div>'
        : TurnUi.escapeHtml(markdown);
      return shell.replace(
        '<div class="d360-chat__stream"></div>',
        '<div class="d360-chat__stream">' + streamHtml + '</div>',
      );
    }

    opts.formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var text = (opts.inputEl.value || '').trim();
      if (!text) return;
      opts.inputEl.value = '';
      stream(text);
    });

    if (opts.presetsEl) {
      opts.presetsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-prompt]');
        if (!btn || busy) return;
        stream(btn.getAttribute('data-prompt'));
      });
    }

    if (opts.inputEl) {
      opts.inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          opts.formEl.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    }

    async function stream(userText) {
      setBusy(true);
      onConversationStarted();
      history.push({ role: 'user', content: userText });
      appendBubble('user', '<p>' + TurnUi.escapeHtml(userText) + '</p>');
      saveHistory();

      var assistantEl = appendBubble('assistant', TurnUi.assistantShell(), 'is-streaming');
      var steps = TurnUi.createStepController(assistantEl, opts.messagesEl, lang, strings, { mergeAlerts: true });
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
          body: JSON.stringify({ messages: history, alert_id: alertId }),
        });
        if (!res.ok || !res.body) throw new Error(TurnUi.ui(strings, lang, 'chat.error'));

        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var state = {
          buffer: '',
          handler: function (event, payload) {
            if (event === 'chat_start' && TurnUi.mountChatLlmMeta) {
              var metaTarget = opts.llmMetaEl || document.getElementById('d360-alert-chat-llm');
              TurnUi.mountChatLlmMeta(metaTarget, payload, strings, lang);
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
                indicators: payload.indicators,
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
              TurnUi.renderChatMarkdown(streamEl, markdown, pendingCharts);
              opts.messagesEl.scrollTop = opts.messagesEl.scrollHeight;
            }
            if (event === 'done') {
              markdown = payload.markdown || markdown;
              trace = payload.trace || trace;
              usedData360 = payload.used_data360 === true || usedData360;
              indicatorsUsed = payload.indicators || indicatorsUsed;
              TurnUi.renderChatMarkdown(streamEl, markdown, pendingCharts);
              TurnUi.renderTrace(assistantEl, trace, usedData360, indicatorsUsed, lang, strings);
            }
            if (event === 'error') {
              steps.failBoot();
              streamEl.innerHTML = '<p class="d360-chat__error">' + TurnUi.escapeHtml(payload.message || TurnUi.ui(strings, lang, 'chat.error')) + '</p>';
            }
          },
        };

        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          TurnUi.parseSseChunk(decoder.decode(chunk.value, { stream: true }), state);
        }

        assistantEl.classList.remove('is-streaming');
        if (markdown) {
          history.push({
            role: 'assistant',
            content: markdown,
            trace: trace,
            used_data360: usedData360,
            indicators: indicatorsUsed,
            pending_charts: pendingCharts,
            sparkline_cache: snapshotSparklineCache(pendingCharts),
            activity: buildActivitySnapshot(trace),
          });
          saveHistory();
        }
      } catch (err) {
        assistantEl.classList.remove('is-streaming');
        steps.failBoot();
        streamEl.innerHTML = '<p class="d360-chat__error">' + TurnUi.escapeHtml(err.message) + '</p>';
      } finally {
        setBusy(false);
      }
    }

    if (history.length) {
      onConversationStarted();
      history.forEach(function (msg) {
        if (!msg || !msg.content) return;
        if (msg.role === 'user') {
          appendBubble('user', '<p>' + TurnUi.escapeHtml(msg.content) + '</p>');
        } else if (msg.role === 'assistant') {
          if (msg.trace || msg.activity || msg.pending_charts || msg.sparkline_cache) {
            restoreAssistantTurn(msg);
          } else {
            appendBubble('assistant', renderAssistantContent(msg.content));
          }
        }
      });
      opts.messagesEl.scrollTop = opts.messagesEl.scrollHeight;
    }

    var llmMetaEl = opts.llmMetaEl || document.getElementById('d360-alert-chat-llm');
    if (llmMetaEl && TurnUi.loadChatLlmMeta) {
      TurnUi.loadChatLlmMeta(llmMetaEl, strings, lang);
    }
  }

  window.D360Chat = window.D360Chat || {};
  window.D360Chat.initScoped = initScoped;
}());
