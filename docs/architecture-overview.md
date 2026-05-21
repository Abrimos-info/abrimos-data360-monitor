# Architecture Overview

> **Status**. Placeholder. Final draft due 2026-05-29.

## Components

- **Dashboard (Node.js and React)**. Reads `data/alerts.json`.
- **Detection pipeline (Node.js)**. Fetch, detect, narrate, emit.
- **Data layer**. Direct REST against Data360 API v3.
- **LLM**. Claude Opus 4.7 via Agent SDK. One call per indicator.
- **Verification**. Proof-Carrying Numbers (PCN), Data360 claims provider.
- **Production roadmap**. Apache NiFi orchestrates polling and updates.

(To be expanded.)
