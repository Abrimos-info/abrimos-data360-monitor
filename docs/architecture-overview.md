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

The demo does not run any orchestration. There is no NiFi, no OpenSearch, no real-time loop. The fetcher writes a local CSV per indicator. That CSV is fed directly to the LLM step, which produces narratives. The dashboard reads a static `data/alerts.json`.

```
TeseoETL fetcher script  →  local CSV  →  LLM  →  data/alerts.json  →  Dashboard
```

This keeps the demo cheap, deterministic, and demonstrable. The pieces marked as production above are described in the deliverables as roadmap. They are not part of what runs on 31 May 2026.

## Components

- **Dashboard (Node.js/Pug/Vanilla JS)**. Reads `data/alerts.json`.
- **Detection and narrative pipeline (Node.js)**. `fetch` → `fetch:news` (optional) → `analyze` (`lib/analysis/runner.js`: detect strategies 1+4, LLM per indicator, emit `data/alerts.json`).
- **TeseoETL fetcher**. Calls Data360 API v3 and writes JSONlines per indicator (production) or local CSV (demo).
- **Apache NiFi (production only)**. Orchestrates the fetcher, ingests JSONlines, normalises, pushes to OpenSearch.
- **OpenSearch (production only)**. Canonical store of observations and metadata.
- **LLM**. Claude Opus 4.7 via Agent SDK. One call per indicator.
- **Verification**. Proof-Carrying Numbers (PCN), Data360 claims provider.

(To be expanded.)
