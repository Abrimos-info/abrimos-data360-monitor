# CLAUDE.md, abrimos-data360-monitor

> Data360 Global Challenge, phase 2 (submission deadline 2026-05-31).
> Working notes and decisions live in the Abrimos internal knowledge base.

## Model delegation

```
Requires tool use (Read/Write/Bash/Grep)?
  ├─ YES → Requires qualitative judgment?
  │         ├─ YES → Sonnet sub-agent
  │         └─ NO  → Haiku sub-agent
  └─ NO  → Context >32K tokens or images/PDFs?
             ├─ YES → Gemini Flash (script)
             └─ NO  → Atomic, self-contained task?
                       ├─ YES → LAIA / vLLM (script), default external model
                       └─ NO  → Architecture decision?
                                 ├─ YES → Opus (current session)
                                 └─ NO  → Sonnet sub-agent
```

### External model commands (via `AI_PROVIDER` env)

```bash
# Demo path. Claude via Agent SDK with Abrimos subscription
AI_PROVIDER=claude-code AI_MODEL=opus-4-7

# LAIA, Qwen 2.5 14B (free fallback for atomic tasks)
AI_PROVIDER=vllm AI_API_URL=https://llms.laia.ar/v1 AI_MODEL=Qwen/Qwen2.5-14B-Instruct-AWQ

# OpenRouter (fallback if LAIA is down)
# via openrouter.py with model gpt-oss
```

### What goes where

| Task                                       | Tier                    |
| ------------------------------------------ | ----------------------- |
| Narrative per indicator (one LLM call)     | Claude Opus 4.7 (SDK)   |
| Architecture decisions, verification       | Opus (current session)  |
| Writing code that reads/writes files       | Sonnet sub-agent        |
| File search, grep, mechanical ops          | Haiku sub-agent         |
| Summarize, translate, classify, draft      | LAIA ($0)               |
| Large file analysis, PDFs, images          | Gemini Flash ($0)       |
| Fallback if LAIA unavailable               | OpenRouter gpt-oss ($0) |

**Rule**. Never deliver output from a lower tier without reviewing it first.

## Project structure

```
bin/
  fetch-data.js         # Freshness probe + selective download (watchlist)
  fetch-news.js         # GDELT headlines → data/news/{COUNTRY}/{YYYY-MM}.jsonl
  generate-analysis.js  # CLI: detect (1+4) + LLM + emit data/alerts.json
  fetch-baseline.js     # Legacy tier fetcher (annual)
  fetch-pulse.js        # Legacy tier fetcher (pulse)
  fetch-forecast.js     # Legacy tier fetcher (forecast)
lib/
  analysis/runner.js    # Unified detect + narrate + merge alerts.json
  watchlist.js          # 35-indicator demo watchlist (3 tiers)
  freshness-probe.js    # Conditional HEAD probe
  freshness-cache.js    # ETag cache on disk
  context-fetch.js      # CSV snapshot + LAC context refresh
  ai-client.js          # Claude / LAIA / OpenRouter abstraction
  data360-client.js     # Data360 API v3 client (headCsv, getCsv, getData, …)
  opensearch-client.js  # OpenSearch (when in scope)
  detect/
    z-score.js          # Strategy 1, abrupt changes
    cross-indicator.js  # Strategy 4, cross-indicator anomalies
  pcn-claims.js         # PCN claim-bound token generation
examples/
  freshness-probe-demo.js  # Standalone HEAD/ETag spike
connector/
  watchlist.json        # Original 20-candidate probe notes
data/
  changed-since.json    # Indicators updated since last probe
  index.json            # Per-indicator freshness summary
  snapshots/            # CSV + ETag cache (gitignored)
  alerts.json           # Final output consumed by the frontend
docs/
  data-fetcher-architecture.md
  architecture-overview.md
  data360-integration-methodology.md
```

## Standing decisions

| ID | Decision |
|---|---|
| D-002 | Data360 is the primary source. Supplementary sources are secondary. |
| D-003 | Demo covers 5 LAC countries. GTM, HND, ARG, ECU, MEX. |
| D-006 | Product tagline. "Autonomous monitor that detects newsworthy events across the 12,000 indicators of Data360 and delivers them verified to LAC newsrooms." |
| D-007 | Demo works backwards (replay over historical snapshots), not real-time. |
| D-008 | Deliverable is a static dashboard reading `data/alerts.json`. |
| D-009 | Non-functional newsletter subscribe button (visual placeholder). |
| D-010 | Covers strategies 1 (abrupt changes) and 4 (cross-indicator anomalies). |
| D-011 | Node.js stack. NiFi roadmap. LLM does one call per indicator. |
| D-012 | Hosting on Hetzner. |
| D-017 | LLM is Claude Opus 4.7 via Agent SDK. |
| D-018 | Repo `abrimos-info/abrimos-data360-monitor`. |
| D-020 | License GPLv3. |
| D-021 | Watchlist split in three indicator tiers. Tier 1 pulse (sub-annual fresh indicators, ≤10), Tier 2 context (annual snapshot, 10-16), Tier 3 forecasts (IMF_WEO + WB_MPO outlook, ~9). Each tier has its own fetcher and CSV file (`pulse.csv`, `annual.csv`, `forecast.csv`). Forecasts are first-class data with verification trace, not roadmap. The word "news" is reserved for actual press headlines (see D-029). |
| D-024 | Tabular data as CSV, descriptive metadata as Markdown. Data at `data/context/{COUNTRY}/{tier}.csv`. Indicator metadata at `data/indicators/{IDNO}.md`. |
| D-025 | All demo code in Node.js (CommonJS). Initial Python probes archived under `archive/python/`. |
| D-026 | `archive/` and `design/` are gitignored. Curate to `docs/` if a piece needs to go public. |
| D-027 | REST direct is the default path (bulk fetch, detection). MCP server (`worldbank/data360-mcp`) is optional for runtime narrative when its native SHA-256 `claim_id` and precomputed comparisons add value. Trial decision for this demo iteration, to be validated against a full pipeline run. |
| D-028 | Analysis stage: 4 prompt files (`analysis-{system,task,template,quality}.md`), omnibus numbered context per indicator, output with fenced blocks (`alert`, `quality`, `source`). One LLM call per indicator. Automatic claim-traceability validation against the numbered context. Alert schema aligned with PCN. |
| D-029 | "News" refers to real press headlines per country, not to sub-annual indicator data. A separate `news` subsystem (architecture pending) ingests recent headlines from the 5 LAC countries and feeds them into the analysis context so narratives can reference current public discourse. The sub-annual indicator tier is `pulse` (D-021). |
| D-030 | News subsystem uses GDELT DOC API v2 as primary source (free, no auth, history since 2015, filter `SOURCELANG:Spanish` + country); Google News RSS as planned fallback (not implemented in demo). Headlines stored at `data/news/{COUNTRY}/{YYYY-MM}.jsonl` (gitignored), dedup by SHA-1 of URL. Schema includes `gdelt_tone` (for future Strategy 2) and `indicators_hint` (empty in demo). Injected into the omnibus context as §6 "Discurso público reciente", max 8 headlines per country, ~1.2k tokens. Demo use is passive narrative context only — Strategy 2 (narrative-data divergence) stays in roadmap. Full design at `docs/news-architecture.md`. |

## Key commands

```bash
# Typical replay: fetch data → optional news → analyze (detect + narrate + emit)
npm run fetch && npm run fetch:news && npm run analyze

# Fetch with freshness probe (downloads only changed indicators)
npm run fetch

# Probe only: write data/changed-since.json without downloading
npm run fetch:probe

# Bootstrap: treat all watchlist indicators as changed
node bin/fetch-data.js --force

# Single indicator analysis
node bin/generate-analysis.js --only FAO_CP_23012
```

## Cost tracking

`lib/ai-client.js` tracks tokens and cost. Log prefixes.

- `[AI-COST]`. Context size before each call.
- `[AI-COST-NARRATE]`. Cost per indicator narrative.

## Conventions

- CommonJS (`type: "commonjs"`), not ESM.
- `OBS_VALUE` is always `Decimal`, never `Number`.
- Disaggregations `_Z` (n/a) and `_T` (total) are filtered explicitly.
- Only `OBS_STATUS = "A"` enters detection.
- Every alert must carry a `verification_trace` with links to `data360.worldbank.org` and the `csv_link`.
