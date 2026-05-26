'use strict';

const ai = require('../ai-client');
const { runAgent } = require('./agent');
const { logChat } = require('./log');
const { normalizeFocusCountries } = require('./focus-countries');

function writeSse(res, event, data) {
  let payload;
  try {
    payload = JSON.stringify(data);
  } catch (err) {
    const detail = {
      event,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : typeof data,
    };
    logChat('sse', 'JSON.stringify failed for SSE payload', err, detail);
    throw err;
  }
  res.write(`event: ${event}\n`);
  res.write(`data: ${payload}\n\n`);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function lastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return messages[i].content;
  }
  return null;
}

function handleChatConfig(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  const info = ai.getChatModelInfo();
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(info));
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const chatLlm = ai.getChatModelInfo();
  console.log(`[AI-CHAT] ${chatLlm.providerLabel} | ${chatLlm.model}`);

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    logChat('api', 'Invalid request body', err);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const sanitized = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  if (body.presetPrompt && typeof body.presetPrompt === 'string') {
    sanitized.push({ role: 'user', content: body.presetPrompt });
  }

  const focusCountries = normalizeFocusCountries(body.focus_countries);
  const focusChanged = body.focus_changed === true;
  const alertId = typeof body.alert_id === 'string' ? body.alert_id : null;

  const chatContext = {
    message_count: sanitized.length,
    last_user: lastUserMessage(sanitized),
    focus_countries: focusCountries,
    focus_changed: focusChanged,
    alert_id: alertId,
  };

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  let clientClosed = false;
  let finished = false;
  req.on('aborted', () => {
    clientClosed = true;
    logChat('api', 'Client aborted chat request', null, chatContext);
  });
  res.on('close', () => {
    if (!finished && !clientClosed) {
      logChat('api', 'Response closed before chat finished', null, chatContext);
    }
  });
  res.on('error', (err) => {
    logChat('api', 'Response stream error', err, chatContext);
  });

  const emit = (event, data) => {
    try {
      writeSse(res, event, data);
    } catch (err) {
      logChat('sse', `Failed to write SSE event "${event}"`, err, {
        ...chatContext,
        event,
        payload_type: data == null ? 'null' : typeof data,
        payload_keys: data && typeof data === 'object' ? Object.keys(data) : undefined,
      });
      throw err;
    }
  };

  try {
    emit('chat_start', {
      provider: chatLlm.providerLabel,
      provider_key: chatLlm.provider,
      model: chatLlm.model,
    });
    await runAgent({ messages: sanitized, emit, chatContext, focusCountries, focusChanged, alertId });
  } catch (err) {
    logChat('agent', 'Chat agent failed', err, chatContext);
    try {
      emit('error', {
        message: err.message,
        name: err.name,
        code: err.code || null,
      });
    } catch (emitErr) {
      logChat('sse', 'Could not emit error event to client', emitErr, chatContext);
    }
  } finally {
    finished = true;
    res.end();
  }
}

module.exports = { handleChat, handleChatConfig, writeSse };
