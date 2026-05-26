# Architecture Overview

> **Status**. Placeholder. Final draft due 2026-05-29.

## Production architecture

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
                │  LLM call per indicator          │
                │  PCN claim binding               │
                └────────────┬─────────────────────┘
                             │ emits
                             ▼
                ┌──────────────────────────────────┐
                │  Dashboard (Node.js/Pug/Vanilla JS)│
                │  PCN verification marks          │
                └──────────────────────────────────┘
```

## Demo architecture

The demo does not run any orchestration. There is no NiFi, no OpenSearch, no real-time loop. The fetcher writes a local CSV per indicator. That CSV is fed directly to the LLM step, which produces narratives in two phases. The dashboard reads a static `data/alerts.json`.

```
TeseoETL fetcher  →  CSV + DATADICT + meta.json  →  LLM phase 1 (Noticia per indicator)
                                                       ↓
                                                    LLM phase 2 (Reportaje per dataset, if ≥2 Noticias share dataset_id)
                                                       ↓
                                                    data/alerts.json  →  Dashboard
```

Two indicator-selection modes share this pipeline:

- **Static watchlist**. 35 indicators in `lib/watchlist.js`, three fetch tiers (pulse, annual, forecast). Analysis and PCN read `annual`, `forecast`, and `dynamic` only (`CONTEXT_TIERS`); `pulse.csv` is legacy on disk.
- **Dynamic discovery**. Indicators discovered from `/data360/searchv2`, expanded to codes via `/data360/indicators?datasetId=…`, persisted to `data/dynamic-watchlist.json`, and stored as a fourth tier (`dynamic`). Run via `npm run pipeline:dynamic`.

This keeps the demo cheap, deterministic, and demonstrable. The pieces marked as production above are described in the deliverables as roadmap. They are not part of what runs on 31 May 2026.

## Components

- **Dashboard (Node.js/Pug/Vanilla JS)**. Reads `data/alerts.json`. Renders two content types: Noticia (per indicator, news card) and Reportaje (per dataset, wider card spanning two grid columns). Filter by `content_type`.
- **Detection and narrative pipeline (Node.js)**. `fetch` → `fetch:news` (optional) → `analyze` (`lib/analysis/runner.js`: detect strategies 1+4, then **Phase 1** emits a Noticia per indicator/country and **Phase 2** (`lib/analysis/reportaje-runner.js`) emits a Reportaje per dataset when ≥2 Noticias share its `dataset_id`).
- **Dynamic discovery (optional)**. `lib/dynamic-watchlist.js` + `bin/discover-indicators.js`. Replaces the static 35-item watchlist with results from `/data360/searchv2`.
- **TeseoETL fetcher**. Calls Data360 API v3 and writes JSONlines per indicator (production) or, in demo mode, a CSV plus a per-indicator data dictionary (`{IDNO}_DATADICT.csv`) and metadata JSON (`{IDNO}.meta.json`).
- **Apache NiFi (production only)**. Orchestrates the fetcher, ingests JSONlines, normalises, pushes to OpenSearch.
- **OpenSearch (production only)**. Canonical store of observations and metadata.
- **LLM**. Claude Opus 4.7 via Agent SDK. One call per indicator (Noticia) and one call per qualifying dataset (Reportaje).
- **Verification**. Proof-Carrying Numbers (PCN), Data360 claims provider. Reportajes reuse the `claim_id`s emitted by the Noticias they synthesize.

(To be expanded.)
