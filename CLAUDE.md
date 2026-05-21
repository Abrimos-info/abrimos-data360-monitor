# CLAUDE.md — abrimos-data360-monitor

> Data360 Global Challenge, phase 2 (submission deadline 2026-05-31).
> Working notes & decisions live in the Abrimos internal knowledge base.

## Model delegation

```
Requires tool use (Read/Write/Bash/Grep)?
  ├─ YES → Requires qualitative judgment?
  │         ├─ YES → Sonnet sub-agent
  │         └─ NO  → Haiku sub-agent
  └─ NO  → Context >32K tokens or images/PDFs?
             ├─ YES → Gemini Flash (script)
             └─ NO  → Atomic, self-contained task?
                       ├─ YES → LAIA / vLLM (script) — default external model
                       └─ NO  → Architecture decision?
                                 ├─ YES → Opus (current session)
                                 └─ NO  → Sonnet sub-agent
```

### External model commands (via `AI_PROVIDER` env)

```bash
# Demo path: Claude via Agent SDK with Abrimos subscription
AI_PROVIDER=claude-code AI_MODEL=opus-4-7

# LAIA — Qwen 2.5 14B (free fallback for atomic tasks)
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

**Rule**: never deliver output from a lower tier without reviewing it first.

## Project structure

```
bin/
  fetch-data.js         # Download historical CSVs from Data360
  detect-changes.js     # Strategies 1 and 4
  narrate-indicators.js # LLM, one call per indicator
  emit-alerts.js        # Generate data/alerts.json
lib/
  ai-client.js          # Claude / LAIA / OpenRouter abstraction
  data360-client.js     # Data360 API v3 client
  opensearch-client.js  # OpenSearch (when in scope)
  detect/
    z-score.js          # Strategy 1: abrupt changes
    cross-indicator.js  # Strategy 4: cross-indicator anomalies
  pcn-claims.js         # PCN claim-bound token generation
frontend/
  (Node.js + React, static dashboard reading data/alerts.json)
connector/
  watchlist.json        # Countries × indicators to monitor
data/
  snapshots/            # Downloaded CSVs (gitignored)
  alerts.json           # Final output consumed by the frontend
docs/
  architecture-overview.md
  data360-integration-methodology.md
  security-data-handling.md
  user-guide.md
  sustainability-plan.md
templates/
  narrative-citizen.md
  narrative-journalist.md
test/
```

## Standing decisions

| ID | Decision |
|---|---|
| D-002 | Data360 is the primary source; supplementary sources are secondary |
| D-003 | Demo covers 5 LAC countries: GTM, HND, ARG, ECU, MEX |
| D-006 | Product tagline: "Autonomous monitor that detects newsworthy events across the 12,000 indicators of Data360 and delivers them verified to LAC newsrooms." |
| D-007 | Demo works backwards (replay over historical snapshots), not real-time |
| D-008 | Deliverable = static dashboard reading `data/alerts.json` |
| D-009 | Non-functional newsletter subscribe button (visual placeholder) |
| D-010 | Covers strategies 1 (abrupt changes) and 4 (cross-indicator anomalies) |
| D-011 | Node.js stack. NiFi roadmap. LLM: one call per indicator |
| D-012 | Hosting on Hetzner |
| D-017 | LLM = Claude Opus 4.7 via Agent SDK |
| D-018 | Repo `abrimos-info/abrimos-data360-monitor` |
| D-020 | License: GPLv3 |

## Key commands

```bash
# Full pipeline (historical replay)
npm run build

# Fetch only
npm run fetch

# Detection only over existing snapshots
npm run detect

# Narrative only (LLM)
npm run narrate

# Frontend dev
npm run frontend:dev
```

## Cost tracking

`lib/ai-client.js` tracks tokens and cost. Log prefixes:
- `[AI-COST]` — context size before each call
- `[AI-COST-NARRATE]` — cost per indicator narrative

## Conventions

- CommonJS (`type: "commonjs"`), not ESM
- `OBS_VALUE` is always `Decimal`, never `Number`
- Disaggregations `_Z` (n/a) and `_T` (total) are filtered explicitly
- Only `OBS_STATUS = "A"` enters detection
- Every alert must carry a `verification_trace` with links to `data360.worldbank.org` and the `csv_link`
