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
  fetch-data.js          # Freshness probe + selective download (watchlist or dynamic)
  fetch-news.js          # GDELT headlines → data/news/{COUNTRY}/{YYYY-MM}.jsonl
  generate-analysis.js   # CLI: detect (1+4) + LLM + emit data/alerts.json
  discover-indicators.js # Query Data360 for recently-updated datasets → data/dynamic-watchlist.json
  fetch-baseline.js      # Legacy tier fetcher (annual)
  fetch-pulse.js         # Legacy tier fetcher (pulse)
  fetch-forecast.js      # Legacy tier fetcher (forecast)
lib/
  analysis/runner.js          # Phase 1: detect + narrate Noticias; Phase 2: invokes reportaje-runner
  analysis/reportaje-runner.js # Groups Noticias by dataset; one LLM call per dataset → Reportaje
  analysis/context-builder.js  # Omnibus numbered context; injects allowed_claim_ids enumeration
  analysis/alert-extractor.js  # Brace-balanced JSON extractor for ```noticia / ```reportaje blocks
  analysis/quality-validator.js # Q1 (claim trace) + Q2 (schema) + Q4 (length/bilingual)
  watchlist.js          # 35-indicator static demo watchlist (3 tiers)
  dynamic-watchlist.js  # Discover datasets updated in the last N days from the search API
  freshness-probe.js    # Conditional HEAD probe
  freshness-cache.js    # ETag cache on disk
  context-fetch.js      # CSV snapshot + LAC context refresh (handles dynamic tier)
  ai-client.js          # Claude / LAIA / OpenRouter abstraction
  data360-client.js     # Data360 API v3 client (headCsv, getCsv, getData, listIndicators, …)
  opensearch-client.js  # OpenSearch (when in scope)
  detect/
    z-score.js          # Strategy 1, abrupt changes
    cross-indicator.js  # Strategy 4, cross-indicator anomalies
  prompts/
    noticia-{system,task,template}.md    # Per-indicator Noticia prompts (D-031)
    reportaje-{system,task}.md           # Per-dataset Reportaje prompts (D-032)
  pcn-claims.js         # PCN claim-bound token generation
examples/
  freshness-probe-demo.js  # Standalone HEAD/ETag spike
connector/
  watchlist.json        # Original 20-candidate probe notes
data/
  changed-since.json       # Indicators updated since last probe
  dynamic-watchlist.json   # Latest output of `discover-indicators.js` (gitignored)
  index.json               # Per-indicator freshness summary
  snapshots/               # CSV + ETag cache + per-indicator _DATADICT.csv + .meta.json (gitignored)
  context/{COUNTRY}/dynamic.csv  # Observations for dynamic-tier indicators
  alerts.json              # Final output consumed by the frontend (Noticia + Reportaje items)
  alerts/{idno}.json       # Per-indicator Noticia output
  alerts/reportaje_{dataset}.json  # Per-dataset Reportaje output
  alerts/{idno}.raw.txt    # Raw LLM output when parsing yielded 0 items (diagnostic)
docs/
  data-fetcher-architecture.md
  architecture-overview.md
  data360-integration-methodology.md
  news-architecture.md
```

## Standing decisions

| ID | Decision |
|---|---|
| D-002 | Data360 is the primary source. Supplementary sources are secondary. |
| D-003 | Demo covers 5 LAC countries. GTM, HND, ARG, ECU, MEX. |
| D-006 | Product tagline. "AI-powered news agency that detects newsworthy facts from Data360's 12,000 indicators and delivers them verified with local perspective to LAC newsrooms." (ES: agencia de noticias basada en IA, 12.000 indicadores, perspectiva local LAC.) |
| D-007 | Demo works backwards (replay over historical snapshots), not real-time. |
| D-008 | Deliverable is a static dashboard reading `data/alerts.json`. |
| D-009 | Non-functional newsletter subscribe button (visual placeholder). |
| D-010 | Covers strategies 1 (abrupt changes) and 4 (cross-indicator anomalies). |
| D-011 | Node.js stack. NiFi roadmap. LLM does one call per indicator. |
| D-012 | Hosting on Abrimos-owned infrastructure. |
| D-017 | LLM is Claude Opus 4.7 via Agent SDK. |
| D-018 | Repo `abrimos-info/abrimos-data360-monitor`. |
| D-020 | License GPLv3. |
| D-021 | Watchlist split in four indicator tiers. Tier 1 pulse (sub-annual fresh indicators, ≤10), Tier 2 context (annual snapshot, 10-16), Tier 3 forecasts (IMF_WEO + WB_MPO outlook, ~9), Tier 4 dynamic (datasets discovered via API as updated in the last N days, see D-031). Each tier has its own CSV file at `data/context/{COUNTRY}/{tier}.csv`. Forecasts are first-class data with verification trace, not roadmap. The word "news" is reserved for actual press headlines (see D-029). |
| D-024 | Tabular data as CSV, descriptive metadata as Markdown. Data at `data/context/{COUNTRY}/{tier}.csv`. Indicator metadata at `data/indicators/{IDNO}.md`. |
| D-025 | All demo code in Node.js (CommonJS). Initial Python probes archived under `archive/python/`. |
| D-026 | `archive/` and `design/` are gitignored. Curate to `docs/` if a piece needs to go public. |
| D-027 | REST direct is the default path (bulk fetch, detection). MCP server (`worldbank/data360-mcp`) is optional for runtime narrative when its native SHA-256 `claim_id` and precomputed comparisons add value. Trial decision for this demo iteration, to be validated against a full pipeline run. |
| D-028 | Analysis stage produces two content types (D-031, D-032). Phase 1 emits Noticias per indicator (3 prompt files `noticia-{system,task,template}.md`); Phase 2 groups Phase 1 Noticias by `dataset_id` and emits a Reportaje per dataset that has ≥2 Noticias (2 prompt files `reportaje-{system,task}.md`). Both invoke the LLM once per item with an omnibus numbered context. Outputs are extracted from fenced blocks (```noticia / ```reportaje) using a brace-balanced JSON scanner tolerant to inner backticks. Automatic claim-traceability validation (Q1) and JSON-schema validation (Q2) against the numbered context. Item schema aligned with PCN. |
| D-029 | "News" refers to real press headlines per country, not to sub-annual indicator data. A separate `news` subsystem (architecture pending) ingests recent headlines from the 5 LAC countries and feeds them into the analysis context so narratives can reference current public discourse. The sub-annual indicator tier is `pulse` (D-021). |
| D-030 | News subsystem uses GDELT DOC API v2 as primary source (free, no auth, history since 2015, filter `SOURCELANG:Spanish` + country); Google News RSS as planned fallback (not implemented in demo). Headlines stored at `data/news/{COUNTRY}/{YYYY-MM}.jsonl` (gitignored), dedup by SHA-1 of URL. Schema includes `gdelt_tone` (for future Strategy 2) and `indicators_hint` (empty in demo). Injected into the omnibus context as §6 "Discurso público reciente", max 8 headlines per country, ~1.2k tokens. Demo use is passive narrative context only — Strategy 2 (narrative-data divergence) stays in roadmap. Full design at `docs/news-architecture.md`. |
| D-031 | Dynamic indicator discovery: `bin/discover-indicators.js` queries `searchv2` with `orderby: 'series_description/date_last_update desc'` and filters to datasets updated in the last N days (default 7). Each surviving dataset is expanded via `/data360/indicators?datasetId=X` and HEAD-probed for CSV availability. The output is `data/dynamic-watchlist.json`, consumed by `fetch-data.js --watchlist-file ...`. Convention: `csvUrl` is `{db}/{code}.csv` where `code` is verbatim from `listIndicators` — never re-prefixed. Country filter is applied downstream at context-fetch time (5 LAC countries). **Analysis and PCN** read `CONTEXT_TIERS` (`annual`, `forecast`, `dynamic`) via `lib/data-loader.js`; the legacy `pulse.csv` tier is still fetchable but excluded from detection and claim verification. Default Noticia runs use `NOTICIA_TIERS = ['dynamic']` only. |
| D-035 | Public Data360 indicator links use `/en/indicator/{IDNO}` (see `lib/data360-urls.js` → `indicatorUrl()`). Dataset discovery links still use `/en/search?query={DATABASE_ID}`. |
| D-032 | Output content model: a `Noticia` is a complete bilingual news story (es/en) for one indicator + country triggered by a detection candidate; a `Reportaje` is a bilingual long-form piece (500–1200 words story) for one dataset, generated only when ≥2 Noticias share the same `dataset_id`. Reportajes synthesize the regional picture from those Noticias plus per-country sections; they reuse the Noticias' `claim_id`s rather than minting new ones. The frontend renders each with its own card variant; the badge mixin `+contentTypeBadge` reads `content_type`. Schema at `docs/alert-schema.json` uses `oneOf` and `additionalProperties: false`. |
| D-033 | LLM-output extraction is brace-balanced and string-aware, not regex-based. The extractor walks each ` ```noticia ` / ` ```reportaje ` opener forward, finds the first `{`, counts braces with string/escape awareness, and ignores the closing fence entirely. Tolerates inner triple-backticks (table snippets, hallucinated mid-block closers) and truncated responses missing the closing fence. Implemented in `lib/analysis/alert-extractor.js`; reused by `reportaje-runner.js`. When parsing yields 0 items but the response contains a fence opener, the raw text is saved to `data/alerts/{idno}.raw.txt` for offline diagnosis. |
| D-034 | Q1 (claim_id traceability) is the dominant failure mode for small models. The omnibus context appends an explicit `### allowed_claim_ids` bare-bullet enumeration at the end of `## Candidatos detectados` (§5 for Noticia, §7 for Reportaje) so models can pattern-match rather than parse prose. System prompts forbid triple-backticks inside string fields as defense in depth. Validation-failure logs include the failure's `notes` field so the offending claim_id or field name surfaces at the console. |

## Key commands

```bash
# Static replay (35-indicator watchlist): fetch → news → analyze
npm run fetch && npm run fetch:news && npm run analyze

# Dynamic replay (datasets updated in the last 7 days):
npm run pipeline:dynamic
# … or force-refresh, bypassing the ETag cache:
npm run pipeline:dynamic:force

# Just discover recently-updated datasets, no fetch
npm run discover

# Probe only: write data/changed-since.json without downloading
npm run fetch:probe

# Bootstrap: treat all watchlist indicators as changed
node bin/fetch-data.js --force

# Single indicator analysis (Phase 1 only, no Reportaje)
node bin/generate-analysis.js --only FAO_CP_23012

# Dry run (skip the LLM, exercise the pipeline plumbing)
npm run analyze:no-llm
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
