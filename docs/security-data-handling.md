# Security and Data Handling

> **Status**. Final draft for Data360 Global Challenge phase 2 (2026-05-29).

This document describes how **Data360 News Agent** handles data, user input, and third-party services in the demo deployment. It is written for jurors evaluating the World Bank Media Party submission.

---

## 1. Data sources

### Public indicator data (no PII)

All economic and social indicators come from **World Bank Data360**, a public API and open data platform. Observations, metadata, and bulk CSVs are openly accessible. The demo does not ingest private datasets, credentials, or personally identifiable information from indicator sources.

License compliance: each indicator carries a `license` field (typically CC BY 4.0). The pipeline preserves license references in alert metadata and verification traces.

### Press headlines (public URLs)

Headlines are fetched from **GDELT Document API v2** and/or **Gemini**-assisted search (see `bin/fetch-news.js`). Stored fields include title, URL, date, and source domain — all public web content. No paywalled full-text storage in the demo.

---

## 2. User-provided data

### Newsletter and indicator alerts subscription

When a visitor submits the subscription modal:

| Field stored | Purpose |
|--------------|---------|
| Email address | Intended recipient for future newsletter/alerts |
| Subscription type | `newsletter_lac` or `indicator_alerts` |
| Countries (optional) | Filter scope for indicator alerts |
| Topics (optional) | macro, fiscal, social, food_security, governance |
| Language preference | `es` or `en` |
| Timestamp | When the request was received |
| User-Agent, Referer | Operational debugging only |

**Storage**: append-only TSV at `data/newsletter/subscribers.tsv`. This file is **gitignored** and lives only on the server filesystem.

**Demo limitation**: no email is sent, no confirmation message, no automated unsubscribe flow. The UI states this clearly; full policy text lives at `/privacidad` (loaded from `config/copy/privacidad.{es,en}.json`).

**Production roadmap**: dedicated mail provider, encrypted storage, GDPR-style deletion on request, one-click unsubscribe in every message.

### Chat messages

Questions typed in global or article-scoped chat are sent to the configured LLM provider for the current session. In demo:

- Chat input is **not** linked to subscription email (no account system).
- Conversation history for article chat is stored in **browser `sessionStorage` only** — not on the server after the SSE response completes.
- Global chat history is held in page memory for the session; not persisted server-side.

---

## 3. Third-party processing

### LLM providers

Configured via environment variables — see the full secrets and configuration table in [`docs/environment-variables.md`](./environment-variables.md) (`AI_PROVIDER`, `CHAT_AI_PROVIDER`, `GEMINI_API_KEY`, `NVIDIA_API_KEY`, etc.):

| Provider | Typical use | Data sent |
|----------|-------------|-----------|
| Claude (Agent SDK) | Pipeline narratives | Omnibus analysis context (public data + headlines) |
| LAIA / vLLM | Chat fallback | User question + tool results |
| NVIDIA NIM | Optional chat/pipeline | Same as above |
| OpenRouter | Fallback | Same as above |

Tool results sent to the LLM contain **public indicator values** and alert summaries — not subscriber emails. Operators should review each provider's privacy policy before production deployment.

### Data360 MCP server

Optional Python MCP server ([worldbank/data360-mcp](https://github.com/worldbank/data360-mcp)) runs on **localhost only** (`127.0.0.1:8021`). The Node monitor calls it for chat tools; it is **not** exposed through nginx or the public internet.

### Gemini (news fetch)

When `npm run fetch:news` uses Gemini, article titles/URLs may be sent to Google's API for grounding or summarization. API keys belong in `.env` (gitignored).

---

## 4. Cookies, tracking, and analytics

The demo **does not** use:

- Third-party analytics (Google Analytics, Meta Pixel, etc.)
- Advertising trackers
- Cross-site tracking cookies

Language preference and onboarding dismissal use **first-party browser storage** (`localStorage` / query params) only. No cookie banner is required for the demo scope; the privacy page at `/privacidad` documents this.

---

## 5. Claim verification (PCN)

Every numeric value in generated narratives should map to a verifiable **claim token** with a `claim_id`.

### Claim ID formats

| Source | Length | Algorithm |
|--------|--------|-----------|
| Data360 MCP (`mcp_get_data`) | 8 hex chars | Server-side opaque ID (passed through) |
| Local CSV (pipeline) | 16 hex chars | SHA-256 over sorted JSON `{indicator, country, time_period, unit_measure}`, truncated |

### Verification pipeline

`lib/pcn-verify.js` checks each claim against `data/context/{COUNTRY}/{tier}.csv` for tiers in `CONTEXT_TIERS` (annual, forecast, dynamic). A **0.1% numeric tolerance** handles rounding. MCP-sourced 8-char IDs skip ID consistency check and compare values directly. Alerts with any unverified claim are **dropped** before writing `data/alerts.json`.

### Frontend

`@pcn-js/core` and `@pcn-js/data360` (Apache-2.0) support claim mark rendering. Users can click through to Data360 dataset and CSV URLs in `verification_trace`.

---

## 6. Hosting and transport

- **Infrastructure**: Abrimos-owned servers.
- **TLS**: HTTPS in production/staging via nginx.
- **Staging gate**: optional HTTP basic auth on the monitor only (`infra/nginx/.htpasswd` — demo credentials documented as intentionally weak).
- **Secrets**: API keys and provider tokens in `.env`, never committed (see `.gitignore`). Full variable list: [`docs/environment-variables.md`](./environment-variables.md).
- **Static assets**: served from `/static/*` with cache headers; no user data in static files.

MCP and subscriber TSV are not reachable from the public internet in the recommended deployment layout.

---

## 7. Repository and license

- Source: [abrimos-info/abrimos-data360-monitor](https://github.com/abrimos-info/abrimos-data360-monitor) (GPLv3).
- Generated alerts and analysis artifacts in `data/` may be committed for demo replay; subscriber TSV is excluded.
- Contact for data requests: contacto@abrimos.info (referenced on `/privacidad`).

---

## 8. Summary matrix

| Data type | Contains PII? | Stored where | Retention (demo) |
|-----------|---------------|--------------|------------------|
| Data360 indicators | No | `data/context/`, `data/snapshots/` | Until next fetch |
| GDELT headlines | No | `data/news/` (gitignored) | Per month file |
| Generated alerts | No | `data/alerts.json` | Version controlled |
| Subscriber email | Yes | `subscribers.tsv` (gitignored) | Until manual deletion |
| Chat questions | Possibly* | LLM provider transient | Session / provider policy |

*Chat may contain editorial questions that indirectly identify a newsroom; demo does not authenticate users or log chat server-side.

---

## Related documentation

- [User guide (ES)](./user-guide.md) — subscription and chat behaviour
- [User guide (EN)](./user-guide.en.md) — English user guide
- [Environment variables](./environment-variables.md) — secrets and configuration reference
- [Architecture overview](./architecture-overview.md) — deployment topology
- [Data360 integration methodology](./data360-integration-methodology.md) — API access patterns
