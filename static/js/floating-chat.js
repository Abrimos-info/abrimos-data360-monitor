'use strict';

(function () {
  var fab = document.getElementById('d360-chatfab');
  var panel = document.getElementById('d360-chatwin');
  var closeBtn = document.getElementById('d360-chatwin-close');
  var minBtn = document.getElementById('d360-chatwin-min');
  var messagesEl = document.getElementById('d360-fab-messages');
  var formEl = document.getElementById('d360-fab-form');
  var inputEl = document.getElementById('d360-fab-input');
  if (!fab || !panel || !messagesEl || !formEl || !inputEl) return;

  var history = [];
  var busy = false;
  var lang = window.D360_LANG || 'es';
  var strings = (window.D360_STRINGS && window.D360_STRINGS[lang]) || {};
  var demoCountries = window.D360_DEMO_COUNTRIES || ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

  function ui(key) {
    return strings[key] || (window.D360_STRINGS.en && window.D360_STRINGS.en[key]) || key;
  }

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) inputEl.focus();
  }

  fab.addEventListener('click', function () {
    setOpen(!panel.classList.contains('is-open'));
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
  if (minBtn) {
    minBtn.addEventListener('click', function () {
      panel.classList.toggle('is-minimized');
    });
  }

  if (window.location.search.indexOf('chat=1') >= 0) {
    setOpen(true);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function appendBubble(role, html) {
    var div = document.createElement('div');
    div.className = 'd360-chat__msg d360-chat__msg--' + role;
    div.innerHTML = html;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function renderMarkdown(el, text) {
    if (window.D360Markdown) {
      el.innerHTML = '<div class="d360-prose">' + window.D360Markdown.renderMarkdown(text, { pendingCharts: [] }) + '</div>';
      if (window.D360PcnClaims && window.D360PcnClaims.enhance) {
        window.D360PcnClaims.enhance(el);
      }
    } else {
      el.textContent = text;
    }
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
        try { state.handler(event, JSON.parse(data)); } catch (_) { /* ignore */ }
      }
    });
  }

  async function streamChat(userText) {
    busy = true;
    inputEl.disabled = true;
    history.push({ role: 'user', content: userText });
    appendBubble('user', '<p>' + escapeHtml(userText) + '</p>');

    var assistantEl = appendBubble('assistant', '<div class="d360-chat__stream"></div>');
    var streamEl = assistantEl.querySelector('.d360-chat__stream');
    var markdown = '';

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          focus_countries: demoCountries.slice(),
          focus_changed: false,
        }),
      });
      if (!res.ok || !res.body) throw new Error(ui('chat.error'));

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var state = {
        buffer: '',
        handler: function (event, payload) {
          if (event === 'token') {
            markdown += payload.text || '';
            renderMarkdown(streamEl, markdown);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
          if (event === 'done') {
            markdown = payload.markdown || markdown;
            renderMarkdown(streamEl, markdown);
          }
          if (event === 'error') {
            streamEl.innerHTML = '<p class="d360-chat__error">' + escapeHtml(payload.message || ui('chat.error')) + '</p>';
          }
        },
      };

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        parseSseChunk(decoder.decode(chunk.value, { stream: true }), state);
      }
      if (markdown) history.push({ role: 'assistant', content: markdown });
    } catch (err) {
      streamEl.innerHTML = '<p class="d360-chat__error">' + escapeHtml(err.message) + '</p>';
    } finally {
      busy = false;
      inputEl.disabled = false;
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

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
}());
