'use strict';

const fs = require('fs');
const path = require('path');
const { runAnalysis, analyzeIndicator } = require('../analysis/runner');
const { fetchNews, DEFAULT_COUNTRIES } = require('../news-fetch');
const { loadCountryHeadlines } = require('../news');
const alertsStore = require('../alerts-store');
const mcp = require('../mcp-client');
const rest = require('../data360-client');
const { logChat } = require('./log');
const { loadFreshnessReport, summarizeForTool } = require('./freshness-preset');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function loadIndicatorLabel(idno) {
  if (!idno) return null;
  const mdPath = path.join(REPO_ROOT, 'data', 'indicators', `${idno}.md`);
  if (!fs.existsSync(mdPath)) return null;
  const line = fs.readFileSync(mdPath, 'utf8').split('\n').find((l) => l.startsWith('# '));
  return line ? line.slice(2).trim() : null;
}

const DATA360_TOOLS = new Set([
  'mcp_search_indicators',
  'mcp_get_data',
  'mcp_compare_countries',
  'mcp_rank_countries',
  'mcp_summarize_data',
]);

/** Demo LAC countries (D-003). */
const DEMO_COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

/** Known debt indicator from evaluate-mcp baseline. */
const DEMO_DEBT = { database_id: 'WB_CCDFS', indicator_id: 'WB_CCDFS_GGDY' };

const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'list_alerts',
      description: 'List verified monitor alerts from local pipeline (Data360-derived). Filter by idno for a specific indicator.',
      parameters: {
        type: 'object',
        properties: {
          country: { type: 'string', description: 'ISO3 e.g. ARG' },
          idno: { type: 'string', description: 'Indicator IDNO e.g. FAO_CP_23012' },
          category: { type: 'string' },
          limit: { type: 'number', default: 10 },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_analysis',
      description: 'Run detection+narrative pipeline for monitor alerts. Use when user asks to analyze an indicator (e.g. FAO_CP_23012). Pass idno. Skips re-run if alerts already exist unless force=true.',
      parameters: {
        type: 'object',
        properties: {
          idno: { type: 'string', description: 'Single indicator IDNO' },
          country: { type: 'string', description: 'Optional ISO3 filter when returning existing alerts' },
          force: { type: 'boolean', description: 'Re-run pipeline even if alerts exist' },
          no_llm: { type: 'boolean', description: 'Skip LLM, deterministic narratives' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_news',
      description: 'Read cached GDELT press headlines for a country',
      parameters: {
        type: 'object',
        properties: {
          country: { type: 'string' },
          limit: { type: 'number', default: 8 },
        },
        required: ['country'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_news',
      description: 'Fetch new headlines from GDELT (slow, rate-limited)',
      parameters: {
        type: 'object',
        properties: {
          countries: { type: 'array', items: { type: 'string' } },
          from: { type: 'string' },
          to: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_freshness',
      description: 'Read latest freshness probe: which watchlist CSVs changed on Data360 (data/changed-since.json, data/index.json). Use for "updated indicators" catalog.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 35 },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mcp_search_indicators',
      description: 'Search World Bank Data360 indicators by keyword. Use before get/compare when IDNO unknown.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          n_results: { type: 'number', default: 8 },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mcp_get_data',
      description: 'Get World Bank Data360 time series for one indicator and country. Required for citing WB numbers.',
      parameters: {
        type: 'object',
        properties: {
          database_id: { type: 'string', description: 'e.g. WB_WDI' },
          indicator_id: { type: 'string', description: 'e.g. WB_WDI_NY_GDP_PCAP_CD' },
          country_code: { type: 'string' },
          limit: { type: 'number', default: 100 },
        },
        required: ['database_id', 'indicator_id', 'country_code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mcp_compare_countries',
      description: 'Compare latest World Bank Data360 values across countries for one indicator. Demo LAC countries: GTM, HND, ARG, ECU, MEX. Debt (% GDP): WB_CCDFS / WB_CCDFS_GGDY.',
      parameters: {
        type: 'object',
        properties: {
          database_id: { type: 'string' },
          indicator_id: { type: 'string' },
          country_codes: {
            type: 'array',
            items: { type: 'string' },
            description: 'ISO3 list; default demo LAC: GTM, HND, ARG, ECU, MEX',
          },
        },
        required: ['database_id', 'indicator_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mcp_rank_countries',
      description: 'Rank countries for an indicator via Data360',
      parameters: {
        type: 'object',
        properties: {
          database_id: { type: 'string' },
          indicator_id: { type: 'string' },
          n: { type: 'number', default: 10 },
        },
        required: ['database_id', 'indicator_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mcp_summarize_data',
      description: 'Summarize World Bank Data360 series for a country',
      parameters: {
        type: 'object',
        properties: {
          database_id: { type: 'string' },
          indicator_id: { type: 'string' },
          country_code: { type: 'string' },
        },
        required: ['database_id', 'indicator_id', 'country_code'],
      },
    },
  },
];

function isData360Tool(name) {
  return DATA360_TOOLS.has(name);
}

function summarizeAlerts(alerts) {
  return alerts.map((a) => ({
    id: a.id,
    country: a.country,
    category: a.category,
    type: a.type,
    idno: a.indicator?.idno,
    name: a.indicator?.name,
    time_period: a.observation?.time_period,
    value: a.observation?.value,
    citizen_es: a.narrative_citizen?.es?.slice(0, 200),
    citizen_en: a.narrative_citizen?.en?.slice(0, 200),
    magnitude: a.magnitude,
  }));
}

function alertsForSse(alerts) {
  return (alerts || []).map((a) => ({
    id: a.id,
    type: a.type,
    country: a.country,
    category: a.category,
    indicator: a.indicator,
    observation: a.observation,
    magnitude: a.magnitude,
    narrative_citizen: a.narrative_citizen,
    narrative_journalist: a.narrative_journalist,
    chart_series: a.chart_series,
    claim_tokens: a.claim_tokens,
    verification_trace: a.verification_trace,
    score: a.score,
    detected_at: a.detected_at,
    license: a.license,
    data_period_stale: a.data_period_stale,
  }));
}

function latestObservations(rows) {
  return observationsSeries(rows, 5);
}

function observationsSeries(rows, maxPoints = 40) {
  const active = (rows || []).filter((r) => {
    const status = r.OBS_STATUS ?? r.obs_status;
    return status == null || status === 'A';
  });
  const sorted = active.sort((a, b) => {
    const pa = a.TIME_PERIOD || a.time_period || '';
    const pb = b.TIME_PERIOD || b.time_period || '';
    return pa.localeCompare(pb);
  });
  return sorted.slice(-maxPoints).map((r) => ({
    time_period: r.TIME_PERIOD || r.time_period,
    value: r.OBS_VALUE ?? r.obs_value ?? r.value,
    unit: r.UNIT_MEASURE || r.unit_measure,
  }));
}

function getDataRows(block) {
  if (!block || typeof block !== 'object') return [];
  if (Array.isArray(block.data) && block.data.length && typeof block.data[0] === 'object') {
    return block.data;
  }
  if (Array.isArray(block.value)) return block.value;
  if (Array.isArray(block.observations)) return block.observations;
  if (Array.isArray(block.time_series)) return block.time_series;
  return [];
}

function buildChartSeriesFromGetData(inner, raw) {
  const existing = inner?.chart_series ?? raw?.chart_series;
  if (Array.isArray(existing) && existing.length) return existing;
  const rows = getDataRows(inner);
  const series = observationsSeries(rows, 48);
  if (series.length) return chartPointsFromObservations(series);
  const nested = inner?.data && typeof inner.data === 'object' ? getDataRows(inner.data) : [];
  if (nested.length) return chartPointsFromObservations(observationsSeries(nested, 48));
  return chartPointsFromObservations(inner.observations || inner.time_series || []);
}

function chartPointsFromObservations(observations) {
  return (observations || []).map((o) => ({
    period: o.time_period || o.period || o.TIME_PERIOD || '',
    value: Number(o.value ?? o.OBS_VALUE ?? o.obs_value),
  })).filter((p) => Number.isFinite(p.value));
}

function isMcpSoftError(data) {
  if (typeof data === 'string') {
    return /validation error|error for call|pydantic/i.test(data);
  }
  if (data && typeof data === 'object') {
    if (data.error && typeof data.error === 'string') return true;
    if (typeof data.detail === 'string' && /validation error/i.test(data.detail)) return true;
    if (data.indicator == null && data.snapshot == null && data.error) return true;
  }
  return false;
}

function normalizeMcpArgs(args) {
  const out = { ...args };
  if (out.country_codes != null) {
    out.country_codes = Array.isArray(out.country_codes)
      ? out.country_codes.join(',')
      : String(out.country_codes);
  }
  return out;
}

function withDemoCountries(args) {
  const codes = args.country_codes;
  if (!codes || (Array.isArray(codes) && codes.length === 0)) {
    return { ...args, country_codes: [...DEMO_COUNTRIES] };
  }
  return args;
}

async function mcpOrRest(mcpName, mcpArgs, restFallback) {
  const normalized = normalizeMcpArgs(mcpArgs);
  try {
    // In CI / local dev the MCP server often isn't running; fail fast and fall back to REST.
    const r = await mcp.callTool(mcpName, normalized, { timeout: 2500 });
    const payload = r.parsed ?? r.text;
    if (isMcpSoftError(payload)) {
      const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
      throw new Error(msg);
    }
    return { ok: true, source: 'data360_mcp', data: payload };
  } catch (mcpErr) {
    try {
      const data = await restFallback();
      return { ok: true, source: 'data360_rest', mcp_error: mcpErr.message, data };
    } catch (restErr) {
      return { ok: false, source: 'none', error: `MCP: ${mcpErr.message}; REST: ${restErr.message}` };
    }
  }
}

async function restSearchIndicators(args) {
  const q = args.query || '';
  const d = await rest.search({
    search: q,
    select: 'series_description/idno,series_description/database_id,series_description/name',
    top: args.n_results || 8,
  });
  return { results: (d.value || []).map((v) => v.series_description || v) };
}

async function restGetData(args) {
  const d = await rest.getData(args.database_id, args.indicator_id, args.country_code, {
    top: args.limit || 5000,
  });
  const series = observationsSeries(d.value, args.chart_points || 48);
  return {
    database_id: args.database_id,
    indicator_id: args.indicator_id,
    country_code: args.country_code,
    indicator_name: loadIndicatorLabel(args.indicator_id),
    observations: series.slice(-5),
    chart_series: chartPointsFromObservations(series),
  };
}

async function restCompareCountries(args) {
  const out = {};
  for (const cc of args.country_codes || []) {
    const d = await rest.getData(args.database_id, args.indicator_id, cc, { top: 200 });
    const obs = latestObservations(d.value);
    out[cc] = obs.length ? obs[obs.length - 1] : null;
  }
  return {
    database_id: args.database_id,
    indicator_id: args.indicator_id,
    countries: out,
  };
}

async function restSummarizeData(args) {
  const block = await restGetData(args);
  const obs = block.observations || [];
  if (!obs.length) return { ...block, summary: 'No active observations' };
  const last = obs[obs.length - 1];
  const first = obs[0];
  return {
    ...block,
    summary: {
      latest: last,
      earliest_in_window: first,
      points: obs.length,
    },
  };
}

async function executeTool(name, args) {
  try {
    switch (name) {
      case 'list_alerts': {
        let alerts = alertsStore.getAlerts();
        if (args.country) alerts = alerts.filter((a) => a.country === args.country);
        if (args.idno) alerts = alerts.filter((a) => a.indicator?.idno === args.idno);
        if (args.category) alerts = alerts.filter((a) => a.category === args.category);
        const limit = args.limit || 10;
        const slice = alerts.slice(0, limit);
        return {
          ok: true,
          source: 'monitor',
          data360: true,
          alerts: summarizeAlerts(slice),
          alerts_cards: slice,
          total: alerts.length,
        };
      }
      case 'run_analysis': {
        if (args.idno && args.force !== true) {
          alertsStore.reload();
          const existing = alertsStore.getAlertsForIndicator(args.idno, { country: args.country });
          if (existing.length) {
            return {
              ok: true,
              source: 'monitor',
              data360: true,
              cached: true,
              idno: args.idno,
              alertCount: existing.length,
              message: `Using ${existing.length} existing alert(s) for ${args.idno}`,
              alerts: summarizeAlerts(existing),
              alerts_cards: existing,
            };
          }
        }
        if (args.idno) {
          const r = await analyzeIndicator(args.idno, { noLlm: args.no_llm === true });
          alertsStore.reload();
          const cards = r.alerts || [];
          return {
            ok: true,
            source: 'pipeline',
            data360: true,
            idno: args.idno,
            alertCount: cards.length,
            message: r.message,
            alerts: summarizeAlerts(cards),
            alerts_cards: cards,
          };
        }
        const r = await runAnalysis({ noLlm: args.no_llm === true });
        alertsStore.reload();
        return {
          ok: true,
          source: 'pipeline',
          data360: true,
          indicatorsProcessed: r.indicatorsProcessed,
          alertCount: r.alertCount,
        };
      }
      case 'read_news': {
        const headlines = loadCountryHeadlines(args.country, {
          fromMonth: '2026-04',
          toMonth: '2026-05',
          limit: args.limit || 8,
        });
        return {
          ok: true,
          source: 'gdelt',
          data360: false,
          country: args.country,
          count: headlines.length,
          headlines: headlines.map((h) => ({
            date: h.published_at?.slice(0, 10),
            source: h.source?.domain,
            headline: h.headline,
            url: h.url,
          })),
        };
      }
      case 'fetch_news': {
        const summary = await fetchNews({
          countries: args.countries || DEFAULT_COUNTRIES,
          from: args.from,
          to: args.to,
        });
        return { ok: true, source: 'gdelt', data360: false, ...summary };
      }
      case 'read_freshness': {
        const report = loadFreshnessReport();
        const summary = summarizeForTool(report, args.limit || 35);
        return {
          ok: true,
          source: 'freshness_probe',
          data360: true,
          ...summary,
          catalog_block: summary.indicators.map((i) => i.line).join('\n'),
        };
      }
      case 'mcp_search_indicators':
        return { ...(await mcpOrRest('data360_search_indicators', args, () => restSearchIndicators(args))), data360: true };
      case 'mcp_get_data': {
        const raw = await mcpOrRest('data360_get_data', args, () => restGetData(args));
        const inner = raw.data && typeof raw.data === 'object' ? raw.data : raw;
        const chartSeries = buildChartSeriesFromGetData(inner, raw);
        const indicatorName = inner.metadata?.name || inner.indicator_name || raw.indicator_name
          || loadIndicatorLabel(args.indicator_id);
        const observations = chartSeries.slice(-8).map((p) => ({
          time_period: p.period,
          value: p.value,
        }));
        return {
          ...raw,
          data360: true,
          indicator_name: indicatorName,
          chart_series: chartSeries,
          observations,
          data: {
            ...inner,
            chart_series: chartSeries,
            indicator_name: indicatorName,
            observations,
          },
        };
      }
      case 'mcp_compare_countries': {
        const compareArgs = withDemoCountries(args);
        return { ...(await mcpOrRest('data360_compare_countries', compareArgs, () => restCompareCountries(compareArgs))), data360: true };
      }
      case 'mcp_rank_countries':
        return { ...(await mcpOrRest('data360_rank_countries', {
          ...args,
          country_codes: args.country_codes || DEMO_COUNTRIES,
        }, async () => restCompareCountries({
          ...args,
          country_codes: args.country_codes || DEMO_COUNTRIES,
        }))), data360: true };
      case 'mcp_summarize_data':
        return { ...(await mcpOrRest('data360_summarize_data', args, () => restSummarizeData(args))), data360: true };
      default:
        return { ok: false, source: 'none', data360: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    logChat('tool', `executeTool ${name} failed`, err, { name, args });
    return { ok: false, source: 'none', data360: isData360Tool(name), error: err.message };
  }
}

function getToolDefinitions() {
  return TOOL_DEFS;
}

module.exports = {
  getToolDefinitions,
  executeTool,
  isData360Tool,
  alertsForSse,
  normalizeMcpArgs,
  isMcpSoftError,
  DEMO_COUNTRIES,
  DEMO_DEBT,
  TOOL_DEFS,
};
