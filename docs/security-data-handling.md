# Security and Data Handling

> **Status**. Placeholder. Final draft due 2026-05-29.

Topics to cover.

- All data sources are public. No PII.
- No authentication required for the Data360 API. OpenAPI publicly documented.
- License compliance per indicator (filter on the `license` field).
- Verification trace. Every numeric claim links back to its source observation via PCN.
- Hosting. Own infrastructure (Hetzner), TLS, no third-party trackers in the dashboard.
- LLM provider. Claude via Agent SDK. No data sent to commercial AI routers.
