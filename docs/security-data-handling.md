# Security and Data Handling

> **Status**. Placeholder. Final draft due 2026-05-29.

Topics to cover.

- All data sources are public. No PII.
- No authentication required for the Data360 API. OpenAPI publicly documented.
- License compliance per indicator (filter on the `license` field).
- Verification trace. Every numeric claim links back to its source observation via PCN (see below).
- Hosting. Own infrastructure (Hetzner), TLS, no third-party trackers in the dashboard.
- LLM provider. Claude via Agent SDK. No data sent to commercial AI routers.

## Claim verification

Every numeric value in a generated narrative is wrapped in a PCN claim token (`{{claim:CLAIM_ID|value}}`). The pipeline verifies each token before the alert is emitted.

**Claim ID format.** Two types coexist:

| Source | Length | Algorithm |
|---|---|---|
| Data360 MCP (`data360_get_data`) | 8 hex chars | Server-side (opaque, passed through) |
| Local CSV (no MCP call) | 16 hex chars | SHA-256 over `{indicator, country, time_period, unit_measure}` sorted JSON, truncated |

**Verification.** `lib/pcn-verify.js` checks each claim against `data/context/{COUNTRY}/{tier}.csv`. A 0.1% numeric tolerance is applied (rounding). MCP-sourced 8-char ids skip the id-consistency check and go straight to value comparison. Alerts with any unverified claim are dropped before `data/alerts.json` is written.

**PCN UI components.** `@pcn-js/core` and `@pcn-js/data360` (npm, v0.1.2, Apache-2.0) provide frontend rendering of claim marks. The backend pipeline does not require these packages; they are a frontend dependency only.
