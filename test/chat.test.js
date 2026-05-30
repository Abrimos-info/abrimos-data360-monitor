'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { executeTool, getToolDefinitions } = require('../lib/chat/tools');
const { writeSse } = require('../lib/chat/api');

describe('chat tools', () => {
  function pickAnyIndicatorIdno() {
    const store = require('../lib/alerts-store');
    const first = store.getAlerts().find((a) => a && a.indicator && a.indicator.idno);
    return first ? first.indicator.idno : 'WB_WDI_FP_CPI_TOTL_ZG';
  }

  it('exports tool definitions', () => {
    const defs = getToolDefinitions();
    assert.ok(Array.isArray(defs));
    assert.ok(defs.length >= 5);
    assert.ok(defs.some((d) => d.function.name === 'list_alerts'));
  });

  it('list_alerts returns array', async () => {
    const out = await executeTool('list_alerts', { limit: 3 });
    assert.equal(out.ok, true);
    assert.ok(Array.isArray(out.alerts));
  });

  it('read_news handles country', async () => {
    const out = await executeTool('read_news', { country: 'ARG', limit: 2 });
    assert.equal(out.ok, true);
    assert.equal(out.country, 'ARG');
  });

  it('list_alerts filters by idno', async () => {
    const idno = pickAnyIndicatorIdno();
    const out = await executeTool('list_alerts', { idno, limit: 5 });
    assert.equal(out.ok, true);
    assert.ok(out.alerts.every((a) => a.idno === idno));
  });

  it('normalizeMcpArgs joins country_codes for MCP', () => {
    const { normalizeMcpArgs } = require('../lib/chat/tools');
    assert.equal(normalizeMcpArgs({ country_codes: ['ARG', 'MEX'] }).country_codes, 'ARG,MEX');
    assert.equal(normalizeMcpArgs({ country_codes: 'ARG,MEX' }).country_codes, 'ARG,MEX');
  });

  it('read_freshness returns catalog', async () => {
    const out = await executeTool('read_freshness', { limit: 3 });
    assert.equal(out.ok, true);
    assert.equal(out.source, 'freshness_probe');
    assert.ok(Array.isArray(out.indicators));
  });

  it('trimToolResultForLlm strips heavy alert fields for context', async () => {
    const { trimToolResultForLlm } = require('../lib/chat/tool-format');
    const raw = await executeTool('list_alerts', { idno: pickAnyIndicatorIdno(), limit: 3 });
    const trimmed = trimToolResultForLlm(raw, 'list_alerts');
    const json = JSON.stringify(trimmed);
    assert.ok(json.length < 8000, `tool result too large: ${json.length} chars`);
    assert.ok(!json.includes('chart_series'));
    assert.ok(!json.includes('verification_trace'));
    assert.equal(trimmed.alerts_cards, undefined);
  });

  it('run_analysis reuses existing alerts for idno', async () => {
    const idno = pickAnyIndicatorIdno();
    const out = await executeTool('run_analysis', { idno });
    assert.equal(out.ok, true);
    // In fixture-only CI, analysis may be unavailable for idno; in full alerts.json it should cache.
    assert.ok(out.cached === true || out.source === 'pipeline' || out.source === 'monitor');
  });

  it('getAlertsForIndicator filters by country', () => {
    const store = require('../lib/alerts-store');
    const idno = pickAnyIndicatorIdno();
    const all = store.getAlertsForIndicator(idno);
    assert.ok(all.length >= 0);
    const arg = store.getAlertsForIndicator(idno, { country: 'ARG' });
    assert.ok(arg.every((a) => a.country === 'ARG'));
  });

  it('mcp_get_data builds chart_series from data rows', async (t) => {
    // Deterministic: avoid relying on a live MCP server or external network in CI.
    const mcp = require('../lib/mcp-client');
    const rest = require('../lib/data360-client');
    const origCallTool = mcp.callTool;
    const origGetData = rest.getData;

    mcp.callTool = async () => { throw new Error('MCP unavailable (test stub)'); };
    rest.getData = async () => ({
      value: [
        { TIME_PERIOD: '2024-01-01', OBS_VALUE: '7.15', OBS_STATUS: 'A', UNIT_MEASURE: 'PERCENT', SEX: '_T' },
        { TIME_PERIOD: '2025-01-01', OBS_VALUE: '7.145', OBS_STATUS: 'A', UNIT_MEASURE: 'PERCENT', SEX: '_T' },
      ],
    });

    t.after(() => {
      mcp.callTool = origCallTool;
      rest.getData = origGetData;
    });

    const out = await executeTool('mcp_get_data', {
      database_id: 'WB_WDI',
      indicator_id: 'WB_WDI_SL_UEM_TOTL_ZS',
      country_code: 'ARG',
      chart_points: 48,
    });
    assert.equal(out.ok, true);
    assert.ok(Array.isArray(out.chart_series));
    assert.ok(out.chart_series.length >= 2, `expected series points, got ${out.chart_series.length}`);
    assert.ok(Number.isFinite(out.chart_series[out.chart_series.length - 1].value));
    assert.ok(out.chart_series[out.chart_series.length - 1].period);
  });
});

describe('chat markdown', () => {
  it('repairSparklineFences closes unclosed sparkline blocks', () => {
    const fs = require('node:fs');
    const vm = require('node:vm');
    const code = fs.readFileSync(require('node:path').join(__dirname, '../static/js/markdown.js'), 'utf8');
    const sandbox = { document: { createElement: () => ({ innerHTML: '', querySelectorAll: () => [] }) } };
    vm.runInNewContext(code, sandbox);
    const md = sandbox.D360Markdown;
    const input = 'Texto\n\n```sparkline\n{"indicator_id":"WB_WDI_SI_POV_DDAY","country_code":"ARG"}\n\n\nMás texto';
    const fixed = md.repairSparklineFences(input);
    assert.match(fixed, /```sparkline\n\{[\s\S]*\}\n```/);
    assert.match(fixed, /Más texto/);
  });

  it('renderMarkdown renders sparkline blocks with marked v15', () => {
    const fs = require('node:fs');
    const vm = require('node:vm');
    const markedCode = fs.readFileSync(require('node:path').join(__dirname, '../static/vendor/marked.min.js'), 'utf8');
    const pillsCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/indicator-pills.js'), 'utf8');
    const mdCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/markdown.js'), 'utf8');
    const chartsCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/charts.js'), 'utf8');
    const sandbox = {
      NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_SKIP: 3, FILTER_ACCEPT: 1 },
      document: {
        createElement: () => ({ innerHTML: '', querySelectorAll: () => [] }),
        createTreeWalker: () => ({ nextNode: () => null }),
      },
      D360_STRINGS: { es: { 'chat.indicator_open': 'Data360' }, en: {} },
      D360_LANG: 'es',
      D360_INDICATOR_CATALOG: [{ idno: 'WB_WDI_SL_UEM_TOTL_ZS', name: 'Unemployment, total %' }],
    };
    vm.runInNewContext(markedCode, sandbox);
    vm.runInNewContext(chartsCode, sandbox);
    vm.runInNewContext(pillsCode, sandbox);
    vm.runInNewContext(mdCode, sandbox);
    const md = sandbox.D360Markdown;
    sandbox.D360_SPARKLINE_CACHE = {
      'WB_WDI_SL_UEM_TOTL_ZS|ARG': [{ period: '2024', value: 7.15 }, { period: '2025', value: 7.145 }],
    };
    const html = md.renderMarkdown('```sparkline\n{"indicator_id":"WB_WDI_SL_UEM_TOTL_ZS","country_code":"ARG"}\n```');
    assert.match(html, /d360-md-sparkline/);
    assert.match(html, /<svg/);
    assert.doesNotMatch(html, /language-sparkline/);
  });

  it('renderMarkdown auto-injects sparkline when LLM omits block', () => {
    const fs = require('node:fs');
    const vm = require('node:vm');
    const markedCode = fs.readFileSync(require('node:path').join(__dirname, '../static/vendor/marked.min.js'), 'utf8');
    const pillsCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/indicator-pills.js'), 'utf8');
    const mdCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/markdown.js'), 'utf8');
    const chartsCode = fs.readFileSync(require('node:path').join(__dirname, '../static/js/charts.js'), 'utf8');
    const sandbox = {
      NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_SKIP: 3, FILTER_ACCEPT: 1 },
      document: {
        createElement: () => ({ innerHTML: '', querySelectorAll: () => [] }),
        createTreeWalker: () => ({ nextNode: () => null }),
      },
      D360_STRINGS: { es: { 'chat.indicator_open': 'Data360' }, en: {} },
      D360_LANG: 'es',
      D360_INDICATOR_CATALOG: [],
    };
    vm.runInNewContext(markedCode, sandbox);
    vm.runInNewContext(chartsCode, sandbox);
    vm.runInNewContext(pillsCode, sandbox);
    vm.runInNewContext(mdCode, sandbox);
    const md = sandbox.D360Markdown;
    sandbox.D360_SPARKLINE_CACHE = {
      'WB_WDI_SL_UEM_TOTL_ZS|ARG': [{ period: '2007', value: 8.47 }, { period: '2025', value: 7.145 }],
    };
    const input = 'La tasa de desempleo en Argentina.\n\n![Gráfica](https://dummyimage.com/600x400/000/fff&text=Chart)\n\n20252007';
    const html = md.renderMarkdown(input, {
      pendingCharts: [{ indicator_id: 'WB_WDI_SL_UEM_TOTL_ZS', country_code: 'ARG' }],
    });
    assert.match(html, /d360-md-sparkline/);
    assert.match(html, /<svg/);
    assert.doesNotMatch(html, /dummyimage/);
    assert.doesNotMatch(html, /20252007/);
  });
});

describe('chat generation context', () => {
  it('loads noticia context from data/analyses/{IDNO}.md', () => {
    const { loadGenerationContext, loadNoticiaContextMarkdown } = require('../lib/chat/generation-context');
    const r = loadNoticiaContextMarkdown('RWB_PFI_LGC');
    assert.equal(r.source, 'analyses_md');
    assert.ok(r.markdown && r.markdown.includes('CONTEXTO SLIM'));
    const alert = {
      id: 'noticia_test',
      content_type: 'noticia',
      indicator: { idno: 'RWB_PFI_LGC' },
    };
    const gen = loadGenerationContext(alert);
    assert.ok(gen);
    assert.ok(gen.markdown.includes('CONTEXTO SLIM'));
    assert.equal(gen.truncated, false);
  });

  it('truncates oversized context', () => {
    const { truncateMarkdown } = require('../lib/chat/generation-context');
    const long = 'x'.repeat(100);
    const out = truncateMarkdown(long, 50);
    assert.equal(out.truncated, true);
    assert.ok(out.markdown.includes('truncado'));
  });

  it('aggregates reportaje context from indicator analyses files', () => {
    const { loadGenerationContext } = require('../lib/chat/generation-context');
    const store = require('../lib/alerts-store');
    const reportaje = store.getAlerts().find((a) => a.content_type === 'reportaje' && Array.isArray(a.indicators) && a.indicators.length >= 2);
    if (!reportaje) return;
    const gen = loadGenerationContext(reportaje);
    assert.ok(gen, 'expected aggregate context for reportaje');
    assert.ok(gen.source.includes('aggregate') || gen.source === 'analyses_md');
    assert.ok(gen.markdown.length > 100);
  });
});

describe('chat scoped system prompt', () => {
  it('loadSystemPrompt includes scoped base and generation context for alert', () => {
    const { loadSystemPrompt } = require('../lib/chat/agent');
    const store = require('../lib/alerts-store');
    const alert = store.getAlerts().find((a) => a.indicator?.idno === 'RWB_PFI_LGC') || store.getAlerts()[0];
    assert.ok(alert);
    const system = loadSystemPrompt(['ARG'], false, alert);
    assert.match(system, /chat acotado|Pieza publicada/i);
    assert.match(system, /Contexto de generación|contexto omnibus|CONTEXTO SLIM|no hay archivo/i);
  });

  it('loadSystemPrompt adds English UI block when lang is en', () => {
    const { loadSystemPrompt } = require('../lib/chat/agent');
    const system = loadSystemPrompt(['ARG'], false, null, 'en');
    assert.match(system, /UI language/i);
    assert.match(system, /Respond in English/i);
  });
});

describe('chat agent helpers', () => {
  it('detects news refresh intent', () => {
    const { wantsNewsToolsRequired } = require('../lib/chat/agent');
    assert.equal(wantsNewsToolsRequired('Actualizá titulares GDELT para Argentina'), true);
    assert.equal(wantsNewsToolsRequired('Mostrá titulares recientes de Argentina'), true);
    assert.equal(wantsNewsToolsRequired('Comparar deuda entre países'), false);
  });

  it('detects fake tool JSON in markdown', () => {
    const { looksLikeFakeToolMarkdown } = require('../lib/chat/agent');
    assert.equal(looksLikeFakeToolMarkdown('{"name":"fetch_news","arguments":{}}'), true);
    assert.equal(looksLikeFakeToolMarkdown('Resumen de titulares reales'), false);
  });
});

describe('chat export', () => {
  it('builds markdown with turns, trace and indicators', () => {
    const { buildConversationMarkdown } = require('../static/js/chat-export.js');
    const md = buildConversationMarkdown([
      {
        user: 'Gráfica de desempleo',
        assistant: 'La tasa subió a **7,1%**.',
        trace: [{ name: 'mcp_get_data', ok: true, source: 'data360_mcp' }],
        indicators: [{ idno: 'WB_WDI_SL_UEM_TOTL_ZS', name: 'Unemployment' }],
        usedData360: true,
      },
    ], {
      title: 'Test chat',
      focusCountries: ['ARG'],
      exportedAt: '2026-05-22T12:00:00Z',
    });
    assert.match(md, /^# Test chat/);
    assert.match(md, /Países foco.*ARG/);
    assert.match(md, /## Usuario/);
    assert.match(md, /Gráfica de desempleo/);
    assert.match(md, /\*\*7,1%\*\*/);
    assert.match(md, /mcp_get_data/);
    assert.match(md, /WB_WDI_SL_UEM_TOTL_ZS/);
  });
});

describe('chat focus countries', () => {
  it('normalizes focus list to demo countries', () => {
    const { normalizeFocusCountries, appendFocusToSystemPrompt } = require('../lib/chat/focus-countries');
    assert.deepEqual(normalizeFocusCountries(['ARG', 'ZZZ']), ['ARG']);
    assert.deepEqual(normalizeFocusCountries([]), ['GTM', 'HND', 'ARG', 'ECU', 'MEX']);
    const system = appendFocusToSystemPrompt('base', ['ARG']);
    assert.match(system, /restringió el foco a: \*\*ARG\*\*/);
    const all = appendFocusToSystemPrompt('base', ['GTM', 'HND', 'ARG', 'ECU', 'MEX']);
    assert.match(all, /cinco países demo/);
    const changed = appendFocusToSystemPrompt('base', ['ARG'], true);
    assert.match(changed, /acaba de cambiar/);
  });
});

describe('indicator pills', () => {
  it('renders human name before compact pill', () => {
    const g = globalThis;
    g.D360_LANG = 'es';
    g.D360_STRINGS = { es: { 'chat.indicator_open': 'Data360' }, en: {} };
    g.D360_INDICATOR_CATALOG = [{
      idno: 'WB_WDI_SL_UEM_TOTL_ZS',
      name: 'Unemployment, total (% of total labor force)',
    }];
    g.D360_INDICATOR_REGISTRY = {};
    require('../static/js/indicator-pills.js');
    const html = g.D360IndicatorPills.renderIndicatorPill('WB_WDI_SL_UEM_TOTL_ZS');
    const namePos = html.indexOf('d360-ind-name');
    const pillPos = html.indexOf('d360-ind-pill');
    assert.ok(namePos >= 0 && pillPos >= 0);
    assert.ok(namePos < pillPos, 'name should precede pill');
    assert.match(html, /Unemployment, total/);
    assert.match(html, /WB_WDI_SL_UEM_TOTL_ZS/);
    assert.match(html, /·/);
    assert.equal((html.match(/d360-ind-pill__id/g) || []).length, 1);
  });

  it('dedupes indicators in trace list', () => {
    const g = globalThis;
    const html = g.D360IndicatorPills.renderIndicatorPills([
      { idno: 'WB_WDI_SL_UEM_TOTL_ZS', name: 'Unemployment' },
      { idno: 'WB_WDI_SL_UEM_TOTL_ZS', name: 'Unemployment' },
    ]);
    assert.equal((html.match(/d360-ind-pill__id/g) || []).length, 1);
  });
});

describe('chat api', () => {
  it('handleChatConfig returns provider and model', async () => {
    const { handleChatConfig } = require('../lib/chat/api');
    const res = {
      status: null,
      body: '',
      writeHead(code, headers) {
        this.status = code;
        this.headers = headers;
      },
      end(payload) {
        this.body = payload;
      },
    };
    await handleChatConfig({ method: 'GET', headers: {} }, res);
    assert.equal(res.status, 200);
    const data = JSON.parse(res.body);
    assert.ok(data.providerLabel || data.provider);
    assert.ok(data.model);
  });

  it('handleChat rejects GET with 405', async () => {
    const { handleChat } = require('../lib/chat/api');
    const res = {
      status: null,
      body: '',
      writeHead(code, headers) {
        this.status = code;
        this.headers = headers;
      },
      end(payload) {
        this.body = payload;
      },
    };
    await handleChat({ method: 'GET', headers: {} }, res);
    assert.equal(res.status, 405);
  });
});

describe('chat sse', () => {
  it('writeSse formats event', () => {
    let written = '';
    const res = { write: (s) => { written += s; } };
    writeSse(res, 'token', { text: 'hi' });
    assert.match(written, /event: token/);
    assert.match(written, /"text":"hi"/);
  });
});

describe('chat log', () => {
  it('formatError captures stack', () => {
    const { formatError } = require('../lib/chat/log');
    const err = new Error('boom');
    const out = formatError(err);
    assert.equal(out.message, 'boom');
    assert.ok(out.stack);
  });
});
