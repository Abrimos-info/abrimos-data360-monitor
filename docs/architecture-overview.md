# Architecture Overview

> **Status:** placeholder. Final draft due 2026-05-29.

## Components

- **Dashboard (Node.js + React)** — reads `data/alerts.json`.
- **Detection pipeline (Node.js)** — fetch → detect → narrate → emit.
- **Data layer** — direct REST against Data360 API v3.
- **LLM** — Claude Opus 4.7 via Agent SDK; one call per indicator.
- **Verification** — Proof-Carrying Numbers (PCN), Data360 claims provider.
- **Production roadmap** — Apache NiFi orchestrates polling and updates.

(To be expanded.)
