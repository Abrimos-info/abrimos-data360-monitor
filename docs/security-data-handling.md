# Security & Data Handling

> **Status:** placeholder. Final draft due 2026-05-29.

Topics to cover:

- All data sources are public; no PII.
- No authentication required for the Data360 API; OpenAPI publicly documented.
- License compliance per indicator (filter on the `license` field).
- Verification trace: every numeric claim links back to its source observation via PCN.
- Hosting: own infrastructure (Hetzner), TLS, no third-party trackers in the dashboard.
- LLM provider: Claude via Agent SDK; no data sent to commercial AI routers.
