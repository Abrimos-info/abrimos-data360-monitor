# Architecture Overview

> **Status**. Final draft for Data360 Global Challenge phase 2 (2026-05-29).

## Context

**Data360 News Agent** (repo `abrimos-data360-monitor`) is an AI-powered news agency prototype for Latin American and Caribbean newsrooms. It monitors World Bank Data360 indicators, detects statistically notable changes, generates bilingual verified narratives (Noticia + Reportaje), and publishes them through a Node.js web application with PCN (Proof-Carrying Numbers) traceability.

The submission demo runs in **historical replay mode**: CSV snapshots are fetched once, analysis runs offline, and the web app reads a static `data/alerts.json`. Production roadmap adds continuous orchestration (Apache NiFi), a canonical observation store (OpenSearch), and scheduled pipeline runs.

---

## Demo architecture

No NiFi, no OpenSearch, no real-time polling loop. Two indicator-selection modes share the same pipeline:

- **Static watchlist** — ~35 indicators in `lib/watchlist.js` (pulse, annual, forecast tiers on disk).
- **Dynamic discovery** — datasets updated in the last N days via `/data360/searchv2`, expanded to indicator codes, stored as a fourth tier (`dynamic`). Default analysis uses `NOTICIA_TIERS = ['dynamic']`.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ discover        │     │ fetch-data.js    │     │ fetch-news.js   │
│ (optional)      │────▶│ HEAD probe + CSV │────▶│ headlines JSONL │
└─────────────────┘     └────────┬─────────┘     └────────┬────────┘
                                   │                        │
                                   ▼                        ▼
                        ┌──────────────────────────────────────────┐
                        │ generate-analysis.js                     │
                        │  1. detect (z-score, cross-indicator)    │
                        │  2. Phase 1: Noticia per indicator       │
                        │  3. Phase 2: Reportaje per dataset (≥2)  │
                        └────────────────────┬─────────────────────┘
                                             │
                                             ▼
                                  data/alerts.json
                                             │
                                             ▼
                        ┌──────────────────────────────────────────┐
                        │ data360-monitor.js (Node + Pug)          │
                        │  • Country front pages                   │
                        │  • Article pages + scoped chat           │
                        │  • Global chat + MCP tools               │
                        │  • Newsletter preview + subscribe TSV    │
                        └──────────────────────────────────────────┘
```

### Data flow detail

1. **Freshness probe** — conditional `HEAD` on bulk CSV blobs; writes `data/changed-since.json`.
2. **Selective fetch** — downloads changed indicators; refreshes `data/context/{COUNTRY}/{tier}.csv` and `data/snapshots/`.
3. **News ingest** (optional) — GDELT and/or Gemini-backed fetch to `data/news/{COUNTRY}/{YYYY-MM}.jsonl` for LLM context (passive, not detection).
4. **Detection** — strategies 1 (abrupt change) and 4 (cross-indicator anomaly) over LAC CSV context.
5. **Narrative** — one LLM call per Noticia; one per Reportaje when ≥2 Noticias share a `dataset_id`. Output validated (Q1 claim trace, Q2 schema, Q4 bilingual length).
6. **Emit** — merge into `data/alerts.json`; enrich with display metadata and canonical article URLs.

### Web application layers

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| HTTP server | `data360-monitor.js`, `lib/router.js` | Routing, static assets, API |
| Views | Pug templates, `lib/views.js` | SSR pages (frontpage, article, hub, chat) |
| Client | Vanilla JS | Filters (legacy), detail panel, chat SSE, newsletter modal |
| Alerts store | `lib/alerts-store.js` | In-memory `alerts.json` + hot reload |
| Chat agent | `lib/chat/agent.js`, tools | SSE streaming, MCP/REST Data360 |
| Subscribe | `lib/subscribe.js` | Append-only TSV (demo, no SMTP) |

---

## Production architecture (roadmap)

```
                ┌──────────────────────────────────┐
                │  Apache NiFi (orchestrator)      │
                │  Schedules and triggers updates  │
                └────────────┬─────────────────────┘
                             │ invokes
                             ▼
                ┌──────────────────────────────────┐
                │  TeseoETL fetcher script         │
                │  Calls Data360 API v3            │
                │  Exports JSONlines per indicator │
                └────────────┬─────────────────────┘
                             │ writes .jsonl
                             ▼
                ┌──────────────────────────────────┐
                │  NiFi pipeline                   │
                │  Reads JSONlines                 │
                │  Normalises records              │
                │  Pushes to OpenSearch            │
                └────────────┬─────────────────────┘
                             │ indexes
                             ▼
                ┌──────────────────────────────────┐
                │  OpenSearch                      │
                │  Canonical observation store     │
                └────────────┬─────────────────────┘
                             │ queries
                             ▼
                ┌──────────────────────────────────┐
                │  Detection and narrative layer   │
                │  Z-score, cross-indicator        │
                │  LLM call per indicator/dataset  │
                │  PCN claim binding               │
                └────────────┬─────────────────────┘
                             │ emits
                             ▼
                ┌──────────────────────────────────┐
                │  Dashboard (Node.js/Pug)         │
                │  PCN verification marks          │
                │  Newsletter delivery (SMTP)      │
                └──────────────────────────────────┘
```

**Not in demo (31 May 2026):** NiFi scheduling, OpenSearch indexing, continuous polling, automated email delivery, Strategy 2 (headline-data divergence detection).

---

## Components

### Monitor web (`data360-monitor.js`)

Standalone Node.js HTTP server. Default port `8090` (`D360_PORT`). Serves:

- Country picker and LAC front pages (newspaper layout)
- SEO-friendly article URLs per Noticia/Reportaje
- Indicators hub and per-IDNO detail pages
- Global analytical chat with tool traces
- Scoped chat on article pages (generation context injected)
- Newsletter edition preview and subscription modal
- Static legal pages (`/privacidad`, `/terminos`, …)

### Analysis pipeline (`bin/generate-analysis.js`, `lib/analysis/`)

- **Detection**: `lib/detect/z-score.js`, `lib/detect/cross-indicator.js`
- **Context**: `lib/analysis/context-builder.js` — CSV tiers, indicator metadata, data dictionary, GDELT headlines, numbered claim candidates
- **Phase 1**: `lib/analysis/runner.js` — Noticia per indicator/country
- **Phase 2**: `lib/analysis/reportaje-runner.js` — Reportaje per dataset
- **Quality**: `lib/analysis/quality-validator.js`, `lib/pcn-verify.js`
- **Output**: `data/alerts.json` consumed by UI and chat tools

### Data360 integration

- **REST** (default for fetch/detection): `lib/data360-client.js` — search, metadata, CSV HEAD/GET, `/data360/data`
- **MCP** (optional for chat): [worldbank/data360-mcp](https://github.com/worldbank/data360-mcp) on localhost; `lib/mcp-client.js` with REST fallback in `lib/chat/tools.js`

### Verification (PCN)

Every numeric claim in narratives carries a `claim_id` resolvable to a Data360 observation. Pipeline drops alerts with unverified claims. Frontend renders `{{claim:…}}` tokens via `@pcn-js/core` patterns and local helpers.

### Newsletter (demo scope)

- Fixture editions in `data/newsletter/editions/`
- Subscription form → `data/newsletter/subscribers.tsv` (gitignored)
- No mail transport in demo; production adds SMTP + unsubscribe links

---

## Deployment

Two independent processes on the server:

| Service | Port | Entry |
|---------|------|-------|
| Monitor | 8090 | `node data360-monitor.js` |
| Data360 MCP | 8021 (localhost) | `uv run fastmcp …` (optional, chat only) |

Nginx terminates TLS and proxies **only the monitor**. MCP binds to `127.0.0.1`; not exposed publicly. Staging may use HTTP basic auth — see [`infra/nginx/README.md`](../infra/nginx/README.md).

Environment: `.env` for `AI_PROVIDER`, `CHAT_AI_PROVIDER`, `MCP_URL`, `NVIDIA_API_KEY`, etc. (see `.env.example`).

---

## Demo limits (explicit, 2026-05-31)

| Area | Demo | Production target |
|------|------|-------------------|
| Data refresh | Manual npm scripts | NiFi-scheduled |
| Observation store | Local CSV | OpenSearch |
| Countries | 5 LAC ISO3 | Expandable |
| Indicators | ~35 static or dynamic discovery window | Full catalog |
| Detection | Strategies 1 + 4 | + Strategy 2 divergence |
| Real-time | Replay over snapshots | Continuous |
| Email | TSV log only | SMTP + List-Unsubscribe |
| Auth | None (staging: basic auth) | Per-tenant if needed |

---

## Related documentation

- [User guide](./user-guide.md) — product features for newsrooms
- [Features reference](./features-reference.md) — technical catalog
- [Data fetcher architecture](./data-fetcher-architecture.md) — freshness probe design
- [Data360 integration methodology](./data360-integration-methodology.md) — API usage
- [Frontend architecture](./frontend-architecture.md) — Pug/JS structure
