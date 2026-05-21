#!/usr/bin/env node
'use strict';

/**
 * Evaluate the Data360 MCP server against the direct REST API on:
 *
 *   1. Round-trip latency for equivalent queries.
 *   2. Coverage. Which pieces of our pipeline does each path cover natively?
 *   3. Output quality. Does MCP return enriched, easier-to-narrate data?
 *
 * Prerequisites:
 *   - MCP server running locally (uv run poe serve), default URL http://127.0.0.1:8021/mcp.
 *   - The repo's lib/data360-client.js for the REST baseline.
 *
 * Run:
 *   node bin/evaluate-mcp.js
 */

const fs = require('fs');
const path = require('path');
const rest = require('../lib/data360-client');
const mcp = require('../lib/mcp-client');

const COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];
const DEBT_INDICATOR = { db: 'WB_CCDFS', idno: 'WB_CCDFS_GGDY' };
const GDP_INDICATOR = { db: 'WB_WDI', idno: 'WB_WDI_NY_GDP_PCAP_CD' };

async function timed(label, fn) {
  const t0 = Date.now();
  let ok = true;
  let result, err;
  try {
    result = await fn();
  } catch (e) {
    ok = false;
    err = e;
  }
  const ms = Date.now() - t0;
  return { label, ok, ms, result, err };
}

function compact(obj, max = 350) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return s.length > max ? s.slice(0, max) + ' ...' : s;
}

async function main() {
  const trials = [];

  trials.push(await timed('REST search indicators (debt, 1 query)', async () => {
    const d = await rest.search({
      search: 'general government gross debt',
      select: 'series_description/idno,series_description/database_id,series_description/name,series_description/periodicity,series_description/time_periods',
      top: 10,
    });
    return { n: (d.value || []).length, sample: (d.value || [])[0] };
  }));

  trials.push(await timed('MCP search_indicators (debt, single query)', async () => {
    const r = await mcp.callTool('data360_search_indicators', {
      query: 'general government gross debt percent GDP',
      n_results: 10,
    });
    const results = (r.parsed && r.parsed.results) || [];
    return { n: results.length, sample: results[0] };
  }));

  trials.push(await timed('REST get data (debt, ARG)', async () => {
    const d = await rest.getData(DEBT_INDICATOR.db, DEBT_INDICATOR.idno, 'ARG', { top: 500 });
    return { n: (d.value || []).length, last: (d.value || []).slice(-1)[0] };
  }));

  trials.push(await timed('MCP data360_get_data (debt, ARG)', async () => {
    const r = await mcp.callTool('data360_get_data', {
      database_id: DEBT_INDICATOR.db,
      indicator_id: DEBT_INDICATOR.idno,
      country_code: 'ARG',
      limit: 500,
    });
    return { sample: compact(r.parsed, 500) };
  }));

  trials.push(await timed('MCP rank_countries (GDP per capita, 2024, LAC)', async () => {
    const r = await mcp.callTool('data360_rank_countries', {
      database_id: GDP_INDICATOR.db,
      indicator_id: GDP_INDICATOR.idno,
      year: 2024,
      country_codes: COUNTRIES.join(','),
      order: 'desc',
      top_n: 5,
    });
    return { sample: compact(r.parsed, 700) };
  }));

  trials.push(await timed('MCP compare_countries (debt, LAC)', async () => {
    const r = await mcp.callTool('data360_compare_countries', {
      database_id: DEBT_INDICATOR.db,
      indicator_id: DEBT_INDICATOR.idno,
      country_codes: COUNTRIES.join(','),
    });
    return { sample: compact(r.parsed, 700) };
  }));

  trials.push(await timed('MCP summarize_data (GDP per capita, MEX)', async () => {
    const r = await mcp.callTool('data360_summarize_data', {
      database_id: GDP_INDICATOR.db,
      indicator_id: GDP_INDICATOR.idno,
      country_code: 'MEX',
    });
    return { sample: compact(r.parsed, 500) };
  }));

  trials.push(await timed('MCP get_viz_spec (GDP per capita ARG)', async () => {
    const r = await mcp.callTool('data360_get_viz_spec', {
      database_id: GDP_INDICATOR.db,
      indicator_id: GDP_INDICATOR.idno,
      country_code: 'ARG',
      chart_type: 'line',
    });
    return { sample: compact(r.parsed, 500) };
  }));

  // Print compact report
  process.stdout.write('\n=== MCP vs REST evaluation ===\n');
  for (const t of trials) {
    const status = t.ok ? 'OK ' : 'ERR';
    const ms = String(t.ms).padStart(5) + 'ms';
    process.stdout.write(`[${status}] ${ms}  ${t.label}\n`);
    if (t.err) {
      process.stdout.write(`         error: ${t.err.message.slice(0, 200)}\n`);
    } else if (t.result) {
      const lines = compact(t.result, 400).split('\n');
      for (const l of lines) process.stdout.write(`         ${l}\n`);
    }
  }

  // Persist measurements
  const outDir = path.resolve(__dirname, '..', 'archive', 'mcp-evaluation');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(outPath, JSON.stringify(trials.map((t) => ({
    label: t.label,
    ok: t.ok,
    ms: t.ms,
    error: t.err ? t.err.message : null,
    result: t.result,
  })), null, 2));
  process.stdout.write(`\nDetails saved to ${outPath}\n`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
