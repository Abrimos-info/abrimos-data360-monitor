'use strict';

const { databaseIdFor } = require('../analysis/candidate-builder');
const { datasetSearchUrl, indicatorUrl } = require('../data360-urls');

function indicatorPageUrl(idno, databaseId, country) {
  if (!idno) return null;
  return indicatorUrl(idno, country ? { country } : undefined);
}

function datasetPageUrl(databaseId) {
  if (!databaseId) return null;
  return datasetSearchUrl(databaseId);
}

function pushIndicator(map, idno, databaseId, name) {
  if (!idno) return;
  const key = String(idno);
  const existing = map.get(key);
  const db = databaseId || databaseIdFor(idno);
  const resolvedName = (name && name !== key) ? name : (existing?.name && existing.name !== key ? existing.name : (name || key));
  map.set(key, {
    idno: key,
    database_id: db,
    name: resolvedName,
    url: indicatorPageUrl(key, db),
    dataset_url: datasetPageUrl(db),
  });
}

function extractIndicators(toolName, args, result) {
  const map = new Map();

  if (args?.indicator_id) {
    pushIndicator(map, args.indicator_id, args.database_id);
  }

  const data = result?.data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) {
      for (const r of data.results) {
        const idno = r.idno || r.indicator_id || r.series_description?.idno;
        const db = r.database_id || r.series_description?.database_id;
        const name = r.name || r.series_description?.name;
        pushIndicator(map, idno, db, name);
      }
    }
    if (data.indicator_id) pushIndicator(map, data.indicator_id, data.database_id);
    if (data.countries && args?.indicator_id) {
      pushIndicator(map, args.indicator_id, args.database_id);
    }
  }

  if (Array.isArray(result?.alerts)) {
    for (const a of result.alerts) {
      pushIndicator(map, a.idno, null, a.name?.es || a.name?.en);
    }
  }

  if (toolName === 'list_alerts' || toolName === 'run_analysis') {
    for (const a of result?.alerts || []) {
      pushIndicator(map, a.idno, null, a.name?.es || a.name?.en);
    }
    if (result?.idno) pushIndicator(map, result.idno);
  }

  if (toolName === 'read_freshness') {
    for (const row of result?.indicators || []) {
      pushIndicator(map, row.idno, row.database_id, row.label);
    }
  }

  if (toolName === 'mcp_get_data' && args?.indicator_id) {
    const name = result?.indicator_name || data?.indicator_name || data?.metadata?.name;
    pushIndicator(map, args.indicator_id, args.database_id, name);
  }

  return [...map.values()];
}

function trimAlertForLlm(alert) {
  if (!alert || typeof alert !== 'object') return alert;
  return {
    id: alert.id,
    country: alert.country,
    category: alert.category,
    type: alert.type,
    idno: alert.idno || alert.indicator?.idno,
    name: alert.name || alert.indicator?.name,
    time_period: alert.time_period || alert.observation?.time_period,
    value: alert.value ?? alert.observation?.value,
    lead_es: alert.lead_es || alert.lead?.es?.slice(0, 220),
    lead_en: alert.lead_en || alert.lead?.en?.slice(0, 220),
    magnitude: alert.magnitude,
  };
}

function trimSeriesForLlm(series, maxPoints = 12) {
  if (!Array.isArray(series)) return series;
  return series.slice(-maxPoints);
}

function trimMcpDataForLlm(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.slice(0, 20);
  const out = { ...data };
  if (Array.isArray(out.time_series)) out.time_series = trimSeriesForLlm(out.time_series);
  if (Array.isArray(out.observations)) out.observations = trimSeriesForLlm(out.observations);
  if (Array.isArray(out.chart_series)) out.chart_series = trimSeriesForLlm(out.chart_series);
  if (Array.isArray(out.series)) out.series = trimSeriesForLlm(out.series);
  return out;
}

function trimToolResultForLlm(out, toolName) {
  if (!out || typeof out !== 'object') return out;
  const copy = { ...out };
  delete copy.alerts_cards;

  if (Array.isArray(copy.alerts)) {
    copy.alerts = copy.alerts.map(trimAlertForLlm);
  }

  delete copy.chart_series;

  if (copy.data && typeof copy.data === 'object') {
    copy.data = trimMcpDataForLlm(copy.data);
  }

  if (toolName === 'read_freshness' && Array.isArray(copy.indicators)) {
    copy.indicators = copy.indicators.slice(0, 20).map((row) => ({
      idno: row.idno,
      database_id: row.database_id,
      tier: row.tier,
      label: row.label,
      line: row.line,
    }));
    if (typeof copy.catalog_block === 'string' && copy.catalog_block.length > 2500) {
      copy.catalog_block = `${copy.catalog_block.slice(0, 2500)}\n… [truncated]`;
    }
  }

  if (toolName === 'mcp_get_data') {
    if (Array.isArray(copy.chart_series)) copy.chart_series = trimSeriesForLlm(copy.chart_series);
    if (Array.isArray(copy.observations)) copy.observations = trimSeriesForLlm(copy.observations, 8);
  }

  if (toolName === 'run_analysis' && typeof copy.message === 'string' && copy.message.length > 1200) {
    copy.message = `${copy.message.slice(0, 1200)}… [truncated]`;
  }

  return copy;
}

function compactHistoryForLlm(history, opts = {}) {
  const maxToolChars = opts.maxToolChars || 8000;
  const maxMessages = opts.maxMessages || 16;
  if (!Array.isArray(history) || history.length <= 1) return history;

  const system = history[0]?.role === 'system' ? history[0] : null;
  const rest = system ? history.slice(1) : history;
  const tail = rest.slice(-maxMessages).map((msg) => {
    if (msg.role !== 'tool' || typeof msg.content !== 'string') return msg;
    if (msg.content.length <= maxToolChars) return msg;
    return {
      ...msg,
      content: `${msg.content.slice(0, maxToolChars)}\n… [tool result truncated for context]`,
    };
  });
  return system ? [system, ...tail] : tail;
}

function summarizeToolResponse(result, maxLen = 4000) {
  try {
    const s = JSON.stringify(result, null, 2);
    return s.length > maxLen ? `${s.slice(0, maxLen)}\n… [truncated]` : s;
  } catch (_) {
    return String(result);
  }
}

function summarizeMessagesForDebug(messages, maxChars = 6000) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      const head = `[${m.role}${m.tool_calls ? '+tools' : ''}]`;
      const body = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return `${head}\n${body}`;
    })
    .join('\n\n---\n\n')
    .slice(0, maxChars);
}

module.exports = {
  indicatorPageUrl,
  datasetPageUrl,
  extractIndicators,
  summarizeToolResponse,
  summarizeMessagesForDebug,
  trimToolResultForLlm,
  compactHistoryForLlm,
  trimAlertForLlm,
};
