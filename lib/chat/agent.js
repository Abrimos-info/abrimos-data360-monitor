'use strict';

const fs = require('fs');
const path = require('path');
const ai = require('../ai-client');
const { getToolDefinitions, executeTool, isData360Tool, alertsForSse } = require('./tools');
const {
  extractIndicators,
  summarizeToolResponse,
  summarizeMessagesForDebug,
  trimToolResultForLlm,
  compactHistoryForLlm,
} = require('./tool-format');
const { logChat } = require('./log');
const { normalizeFocusCountries, appendFocusToSystemPrompt } = require('./focus-countries');
const alertsStore = require('../alerts-store');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const MAX_TURNS = parseInt(process.env.CHAT_MAX_TURNS || '8', 10);

function loadSystemPrompt(focusCountries, focusChanged, alertContext) {
  let base = fs.readFileSync(path.join(REPO_ROOT, 'lib', 'prompts', 'chat-system.md'), 'utf8');
  base = appendFocusToSystemPrompt(base, focusCountries, focusChanged);
  if (alertContext) {
    const title = alertContext.title?.es || alertContext.title || alertContext.id;
    const lead = alertContext.lead?.es || alertContext.lead || '';
    base += `\n\n## Pieza en contexto (chat acotado)\nEstás respondiendo preguntas sobre esta pieza publicada:\n- id: ${alertContext.id}\n- tipo: ${alertContext.content_type || 'noticia'}\n- titular: ${title}\n- lead: ${lead}\nRespondé solo sobre esta pieza, sus datos citados y su metodología. No inventes hechos fuera del artículo.`;
  }
  return base;
}

function emitChunked(emit, text) {
  const chunk = 24;
  for (let i = 0; i < text.length; i += chunk) {
    emit('token', { text: text.slice(i, i + chunk) });
  }
}

function lastUserText(history) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user') return String(history[i].content || '');
  }
  return '';
}

function wantsNewsToolsRequired(text) {
  const t = String(text || '').toLowerCase();
  if (/actualiz|actualizar|update|fetch|traer|descarg/.test(t) && /titular|news|gdelt|noticia|headline/.test(t)) {
    return true;
  }
  if (/titular|headline|noticia/.test(t) && /mostr|list|resum|leer|read|reciente|m[aá]s relevante/.test(t)) {
    return true;
  }
  return false;
}

function hasNewsToolInTrace(trace) {
  return trace.some((t) => t.name === 'fetch_news' || t.name === 'read_news');
}

function looksLikeFakeToolMarkdown(text) {
  return /"name"\s*:\s*"(fetch_news|read_news|mcp_get_data|list_alerts|run_analysis)"/.test(text)
    || /```(?:json|tool)?[\s\S]*?"name"\s*:\s*"fetch_news"/.test(text);
}

async function runAgent({ messages, emit, chatContext = {}, focusCountries = null, focusChanged = false, alertId = null }) {
  const tools = getToolDefinitions();
  const focus = normalizeFocusCountries(focusCountries);
  const alertContext = alertId ? alertsStore.getAlertById(alertId) : null;
  const system = loadSystemPrompt(focus, focusChanged === true, alertContext);
  const history = [{ role: 'system', content: system }, ...messages];
  const trace = [];
  const indicatorsUsed = new Map();
  const modelInfo = ai.getChatModelInfo();
  const userQuery = lastUserText(messages);
  const requireToolsFirst = wantsNewsToolsRequired(userQuery);

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const llmRequestPreview = summarizeMessagesForDebug(history.slice(-6));
    emit('llm_start', {
      turn,
      kind: 'llm',
      model: modelInfo.model,
      provider: modelInfo.providerLabel,
      provider_key: modelInfo.provider,
      request_preview: llmRequestPreview,
      message_count: history.length,
    });

    const llmHistory = compactHistoryForLlm(history);
    const t0 = Date.now();
    let result;
    try {
      result = await ai.chatComplete(llmHistory, {
        tools,
        label: `chat:turn${turn}`,
        tool_choice: (turn === 0 && requireToolsFirst) ? 'required' : 'auto',
      });
    } catch (err) {
      logChat('llm', `chatComplete failed on turn ${turn}`, err, {
        ...chatContext,
        turn,
        model: modelInfo.model,
        provider: modelInfo.providerLabel,
      });
      throw err;
    }

    const stats = result.stats || {
      provider: modelInfo.provider,
      providerLabel: modelInfo.providerLabel,
      model: modelInfo.model,
      duration_ms: Date.now() - t0,
    };

    emit('llm_end', {
      turn,
      kind: 'llm',
      model: stats.model,
      provider: stats.providerLabel || modelInfo.providerLabel,
      provider_key: stats.provider,
      duration_ms: stats.duration_ms,
      input_tokens: stats.input_tokens,
      output_tokens: stats.output_tokens,
      tokens_per_second: stats.tokens_per_second,
      has_tools: !!(result.tool_calls?.length),
      tool_calls: (result.tool_calls || []).map((tc) => ({
        id: tc.id,
        name: tc.function?.name,
        arguments: tc.function?.arguments,
      })),
      response_preview: (result.content || '').slice(0, 2000),
    });

    if (result.tool_calls?.length) {
      history.push({
        role: 'assistant',
        content: result.content || '',
        tool_calls: result.tool_calls,
      });

      for (const tc of result.tool_calls) {
        const name = tc.function?.name;
        let args = {};
        try {
          args = JSON.parse(tc.function?.arguments || '{}');
        } catch (parseErr) {
          logChat('tool', `Invalid tool arguments JSON for ${name}`, parseErr, {
            ...chatContext,
            turn,
            tool_call_id: tc.id,
            raw_arguments: tc.function?.arguments,
          });
          args = {};
        }

        emit('tool_start', {
          id: tc.id,
          name,
          args,
          kind: 'tool',
          data360: isData360Tool(name) || name === 'list_alerts' || name === 'run_analysis',
          request: args,
        });

        const toolT0 = Date.now();
        let out;
        try {
          out = await executeTool(name, args);
        } catch (err) {
          logChat('tool', `executeTool threw for ${name}`, err, { ...chatContext, turn, args });
          throw err;
        }
        const toolDurationMs = Date.now() - toolT0;

        if (out.ok === false) {
          logChat('tool', `Tool ${name} returned error`, null, {
            ...chatContext,
            turn,
            args,
            error: out.error,
            source: out.source,
          });
        }

        const indicators = extractIndicators(name, args, out);
        for (const ind of indicators) indicatorsUsed.set(ind.idno, ind);

        const entry = {
          type: 'tool',
          id: tc.id,
          name,
          ok: out.ok !== false,
          source: out.source,
          data360: out.data360 === true,
          duration_ms: toolDurationMs,
          indicators,
        };
        trace.push(entry);

        const forUi = trimToolResultForLlm(out, name);

        emit('tool_result', {
          id: tc.id,
          name,
          ok: out.ok !== false,
          source: out.source,
          data360: out.data360 === true,
          kind: 'tool',
          duration_ms: toolDurationMs,
          request: args,
          error: out.error || null,
          response_text: summarizeToolResponse(forUi, 8000),
          chart_series: out.chart_series || out.data?.chart_series || null,
          indicator_name: out.indicator_name || out.data?.indicator_name || null,
          indicators,
          alerts: alertsForSse(out.alerts_cards || out.alerts),
        });

        history.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(forUi),
        });
      }
      continue;
    }

    const text = (result.content || '').trim();
    if (!text) {
      logChat('agent', 'Empty response from model', null, { ...chatContext, turn });
      emit('error', { message: 'Empty response from model' });
      emit('done', {
        markdown: '',
        trace,
        indicators: [...indicatorsUsed.values()],
        used_data360: trace.some((t) => t.data360 && t.ok),
      });
      return '';
    }

    if (
      requireToolsFirst
      && !hasNewsToolInTrace(trace)
      && turn < MAX_TURNS - 1
      && (looksLikeFakeToolMarkdown(text) || turn === 0)
    ) {
      logChat('agent', 'News request without tool calls — nudging model', null, {
        ...chatContext,
        turn,
        fake_tool_text: looksLikeFakeToolMarkdown(text),
      });
      history.push({ role: 'assistant', content: text });
      history.push({
        role: 'user',
        content: 'Ejecutá los tools de verdad (fetch_news y/o read_news). No escribas JSON de tools ni titulares inventados: llamá las funciones y resumí solo lo que devuelvan.',
      });
      continue;
    }

    emitChunked(emit, text);
    emit('done', {
      markdown: text,
      trace,
      indicators: [...indicatorsUsed.values()],
      used_data360: trace.some((t) => t.data360 && t.ok),
    });
    return text;
  }

  logChat('agent', 'Max agent turns reached', null, { ...chatContext, max_turns: MAX_TURNS });
  emit('error', { message: 'Max agent turns reached' });
  emit('done', {
    markdown: '',
    trace,
    indicators: [...indicatorsUsed.values()],
    used_data360: trace.some((t) => t.data360 && t.ok),
  });
  return '';
}

module.exports = { runAgent, MAX_TURNS, wantsNewsToolsRequired, looksLikeFakeToolMarkdown };
