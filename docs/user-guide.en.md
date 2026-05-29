# User guide — Data360 News Agent

> **Language** · English · [Versión en español](./user-guide.md)

> **Audience**: newsrooms in Latin America and the Caribbean.  
> **Status**: functional draft as of 2026-05-29 (phase 2 demo, submission 2026-05-31).

## What this tool does

**Data360 News Agent** is an AI-powered news agency that monitors economic, social, and governance indicators in **Guatemala, Honduras, Argentina, Ecuador, and Mexico**. When it detects a statistically notable fact, it publishes two types of verified content:

- **Noticia** — bilingual piece (250–600 words) per indicator and country, triggered by a detection candidate.
- **Reportaje** — bilingual long-form piece (500–1200 words) per *dataset*, generated only when two or more Noticias share the same `dataset_id`. Synthesises a regional view with per-country sections and reuses the `claim_id`s from the Noticias it synthesises.

Every piece links back to its source at [data360.worldbank.org](https://data360.worldbank.org).

The product has three main surfaces:

| View | URL | Purpose |
|------|-----|---------|
| **Country picker** | `/` | Choose a country and see recently updated indicators |
| **Country front page** | `/{country}` (e.g. `/mexico`) | Newspaper layout: featured reportaje, headlines, indicator ticker |
| **Article** | `/{country}/{noticia\|reportaje}/{year}/{month}/{slug}` | Full reading experience + chat scoped to the piece |
| **Global indicators** | `/indicadores` | Hub by tier with alert counts and filters |
| **Global chat** | `/chat` | Free exploration with presets, freshness, and Data360 tools |

All views read the same alerts file (`data/alerts.json`).

---

## Demo scope

- **Countries**: GTM, HND, ARG, ECU, MEX (do not substitute BRA, CHL, COL, etc.).
- **Indicators**: two selection modes.
  - **Static watchlist**: ~35 indicators across three fetch tiers (pulse, annual, forecast). Canonical list in `lib/watchlist.js`. The `pulse` tier no longer enters detection or PCN verification.
  - **Dynamic mode** (recommended): indicators discovered live from `/data360/searchv2`, expanded via `/data360/indicators?datasetId=…`, persisted in `data/dynamic-watchlist.json` and written to `data/context/{COUNTRY}/dynamic.csv`. This is the source the pipeline uses by default (`NOTICIA_TIERS = ['dynamic']`).
- **Detection**: strategies **1** (abrupt changes, z-score) and **4** (cross-indicator anomalies).
- **Mode**: historical replay over CSV snapshots, not continuous real time (D-007).
- **Headlines**: GDELT and/or Gemini (depending on script), stored in `data/news/{COUNTRY}/{YYYY-MM}.jsonl` (passive context for narratives; narrative–data divergence remains on the roadmap).

---

## Web interface

### Navigation

Top bar (World Bank theme):

- **Front page** — country picker and LAC front pages
- **Global indicators** — `/indicadores` hub
- **About** — methodology, limits, team, license
- **Subscribe** — subscription modal (LAC newsletter or indicator alerts)
- **ES / EN** — UI and narrative language selector

Legal and informational pages: `/metodologia`, `/privacidad`, `/terminos`, `/uso` (content in `config/copy/`, not covered here).

### Languages

**ES / EN** selector in the bar. Changes the interface and the language of displayed narratives. Pieces store text in both languages in JSON; the UI shows **one language at a time** (no simultaneous bilingual mode on screen).

URL parameters: `?lang=es` or `?lang=en`.

### Onboarding

Welcome modal on first visit (dismissible). Presents **Data360 News Agent** as an AI news agency: it detects newsworthy facts in Data360's 12,000 indicators and delivers them verified with local perspective to LAC newsrooms. Force with `?onboarding=1`.

### Subscriptions

The **Subscribe** button opens a modal with two types:

| Type | What you would receive in production | Demo preview |
|------|--------------------------------------|--------------|
| **Daily LAC newsletter** | One verified finding by email each morning | `/newsletter` → latest fixture edition |
| **Indicator alerts** | Notice when an indicator or dataset you follow is updated | `/indicadores` with country/topic filters |

In the demo, the form saves email + type (+ optional countries/topics for alerts) to `data/newsletter/subscribers.tsv` via `POST /api/subscribe`. **No real email** is sent and there is no SMTP confirmation (roadmap).

Valid alert topics: macro, fiscal, social, food_security, governance.

---

## Country picker (`/`)

- Links to the five LAC front pages (`/guatemala`, `/honduras`, …).
- List of recently updated indicators with links to the hub or article.
- Legacy deep link: `/?alert={id}` redirects to the canonical article if `_path` exists.

---

## Country front page (`/{country}`)

Newspaper layout (`frontpage.pug` template):

- **Featured reportaje** — in-depth piece in the hero (if a reportaje exists for that country).
- **Headlines** — noticias interleaved with reportajes (`interleaveHeadlines()`); link to the article.
- **Updated indicators** — horizontal bar with chips (value + magnitude + sparkline); link to the noticia.
- **Masthead** — edition label (month · year) and data age.

Ordered by **data date** (`time_period`), not detection date.

Each headline or chip shows indicator code (IDNO), data date (stale badge if applicable), detection type, and narrative in the active language.

Country picker popup (`country-menu.js`) to jump between LAC front pages.

### Legacy view (card grid with filters)

Available at `/dev/feed` or by adding `?legacy=1` to a country front page. Renders the classic SSR feed (`dashboard.pug`) with client-side filters:

| Filter | Options |
|--------|---------|
| **Country** | ALL or one ISO3 from the feed |
| **Category** | ALL or thematic category |
| **Content type** | ALL · Noticia · Reportaje |
| **Card variant** | Narrative · Number · Newspaper |

Filters hide cards with CSS; the event counter updates instantly. State in URL (`?country=ARG&category=economy&variant=narr`).

---

## Article (`/{country}/{type}/{year}/{month}/{slug}`)

Reading page with:

- Headline, lead, full story with resolved PCN tokens
- Historical sparkline, value, period, magnitude
- Traceability: Data360 link, CSV, methodology
- Editorial use disclaimer and production metadata
- Newsletter subscription CTA in the footer

### Scoped chat (primary)

Each article includes a **scoped chat FAB** (`floating-chat.pug` + `alert-chat.js`). The conversation is stored in `sessionStorage` by `alert_id`; on reload, markdown, tool traces, cached sparklines, and activity steps are restored.

The agent uses `lib/prompts/chat-scoped-system.md` and receives:

1. **Published piece** — headline, lead, story, and `claim_id`s from JSON.
2. **Generation context** — omnibus markdown from `data/analyses/{IDNO}.md` (fallback `*.llm-call.md`). For reportajes, the `.md` files of each indicator in the dataset are concatenated.

Limit: `CHAT_GENERATION_CONTEXT_MAX_CHARS` (default 48000).

---

## Global indicators (`/indicadores`)

Hub with indicators grouped by tier (annual, forecast, dynamic), alert count per IDNO, recent indicators, and URL filters (`?countries=ARG,MEX&topics=macro`).

Per-indicator detail: `/indicador/{IDNO}` — metadata, alerts by country, links to articles.

---

## Newsletter (`/newsletter`, `/newsletter/lac/{date}`)

- `/newsletter` redirects to the most recent LAC edition in `data/newsletter/editions/`.
- Each fixture edition includes hero, secondary headlines, bilingual subject/preheader, and CTA to front page or article.
- Linked from the subscription modal and article footers.

---

## Global analytical chat (`/chat`)

### General flow

1. Choose a **preset** or type a question.
2. Optional: adjust **Focus country** (dropdown).
3. The agent calls pipeline **tools** (live SSE).
4. The response includes markdown, sparklines, alert cards, and source traceability.

### Built-in presets

| Preset | Typical action |
|--------|----------------|
| **Data360 updates** | Freshness catalogue + how to request chart/analysis |
| **Analyze indicator** | Pipeline on an IDNO (e.g. FAO_CP_23012) |
| **Recent headlines** | Read headlines from disk |
| **Monitor alerts** | List alerts by data date |
| **Compare countries (MCP)** | Public debt % GDP across the 5 countries |
| **Search indicator** | Semantic Data360 search |
| **Refresh news** | Fetch headlines + summary |

### Focus country

**All** or one country (GTM · Guatemala, etc.) in the dropdown. Each query sends `focus_countries` to the server; if you changed focus, the agent receives an explicit note.

### Freshness catalogue

**Recently published data (N)** opens a panel with indicators whose CSV changed (`data/changed-since.json`). Per row: tier, IDNO, blob date, **Chart** and **Analysis** buttons.

### Export conversation

Copy markdown, download `.md`, print PDF (`chat-export.js`).

### Agent rules (summary)

- **Does not invent figures**; must call Data360 tools before stating numbers.
- **Headlines**: must call `fetch_news` / `read_news`.
- **Analysis**: `list_alerts` first; `run_analysis` only if no alerts on disk.
- **Charts**: `mcp_get_data` + sparkline block.
- Monitor links: deep link to canonical article or `/?alert=ID`.

---

## About (`/about`)

Static page covering: what the product is, LAC scope, detection methodology, PCN verification, demo limitations, roadmap (NiFi, OpenSearch, Strategy 2), Abrimos.info team, and GPLv3 license.

---

## Alert anatomy

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `content_type` | `noticia` or `reportaje` |
| `title` / `lead` / `story` | Bilingual text `{ es, en }` |
| `country` | ISO3 of the piece's country (`GTM`, `HND`, `ARG`, `ECU`, `MEX`) |
| `dataset_id` | Data360 dataset identifier |
| `indicator` | (**Noticia** only) IDNO, `database_id`, bilingual `name` |
| `indicators` | (**Reportaje** only) list of covered IDNOs (≥2) |
| `noticia_ids` | (**Reportaje** only) ids of synthesised Noticias |
| `observation` | value, `time_period`, unit |
| `claim_tokens` | Verifiable values with `claim_id` |
| `verification_trace` | Data360 URLs: dataset + CSV(s) + methodology |
| `chart_series` | `{period, value}` points for sparkline |
| `score` | Normalised severity (0–1) |
| `detected_at` | ISO generation timestamp |
| `data_period_stale` | Whether data is older than freshness threshold |

Formal schema: `docs/alert-schema.json`.

Canonical URLs: `/{countrySlug}/{noticia|reportaje}/{year}/{month}/{slug}` (`lib/url-slug.js`).

---

## Verification before publishing

1. Open the article or detail panel (legacy view).
2. Review the narrative and resolved **claim tokens**.
3. Follow **Sources**: Data360 dataset → CSV → methodology.
4. Match `time_period` with what you publish (**data date**, not pipeline date).
5. Use **Copy citation** to paste text + URL into your CMS.

More context: `docs/data360-integration-methodology.md`.

---

## Data sources

| Source | Demo use |
|--------|----------|
| **Data360 API v3** (REST + optional MCP) | Indicators, series, comparisons |
| **Local CSVs** `data/context/` | Offline detection and narrative |
| **GDELT DOC API v2** / **Gemini** | Press headlines (script-dependent) |
| **Freshness probe** | `data/changed-since.json`, `data/index.json` |

---

## Pipeline (operators / development)

```bash
npm run fetch                    # download CSV + data dictionary + meta.json
npm run fetch:probe              # change probe only (~2 s)
npm run fetch:news               # headlines pool (≤5 countries: Gemini → GDELT)
npm run fetch:news:indicator     # legacy: Gemini per indicator (watchlist)
npm run fetch:news:gdelt           # GDELT only, no themes
npm run analyze                  # detection + Noticias + Reportajes → data/alerts.json
npm run analyze:changed          # analyze changed-since indicators only
npm run analyze:noticias         # Phase 1 only
npm run analyze:reportajes       # Phase 2 only
npm run analyze:no-llm           # pipeline without LLM
npm run discover                 # /searchv2 → dynamic-watchlist.json
npm run pipeline                 # discover → fetch → news → analyze → newsletter
npm run pipeline:force           # same, bypass ETag on fetch
npm run build                    # alias for pipeline
npm run pipeline:news-gdelt      # GDELT-only alias (fetch:news:gdelt)
npm run generate:newsletter      # LAC edition for the day (also run at end of pipeline)
npm run replay:daily             # day-by-day replay (analyze + newsletter per day)
npm run dev                      # web server :8090 (development)
npm run start                    # production
npm test                         # Node tests
```

Full flow: `npm run pipeline` (or `npm run build`).  
Individual steps: `fetch` → `fetch:news` (optional) → `analyze`.  
Multi-day replay: `replay:daily --from=2026-05-22 --to=2026-05-29` (respects `CLAUDE_EFFORT`). News runs **once** at start if the pool does not cover the window (`--from` − 30 days → `--to`); skipped when ≥8 accepted headlines/country already exist. `--force-news` refreshes; `--skip-news` skips. With `--skip-fetch`, only analyze + newsletter run.

Pipeline/replay logs show run elapsed time as `+2m 14s` on milestones (`stepLog`, `[TIMING]`, milestone `pipeLog` events). Propagates to child processes via `D360_RUN_EPOCH`.

Main output: **`data/alerts.json`**.

### Environment variables

Full reference: [`docs/environment-variables.md`](./environment-variables.md). Template: [`.env.example`](../.env.example).

| Group | Key variables |
|-------|---------------|
| Pipeline LLM | `AI_PROVIDER`, `AI_MODEL_NOTICIA`, `AI_MODEL_REPORTAJE`, `NOTICIA_TRANSLATE` |
| Claude | `CLAUDE_MODEL`, `CLAUDE_EFFORT` (`low` \| `medium` \| `high`) |
| Chat | `CHAT_AI_PROVIDER`, `CHAT_MAX_TURNS`, `CHAT_GENERATION_CONTEXT_MAX_CHARS` |
| Analysis | `ANALYSIS_CHANGED_ONLY`, `ANALYSIS_MAX_INDICATORS`, `AI_SLIM_CONTEXT` |
| Server | `D360_PORT`, `NODE_ENV`, `MCP_URL` |

`CLAUDE_EFFORT` controls the Claude CLI `--effort=` flag for analysis, newsletter, and `replay:daily`. Default empty (no flag); `replay:daily` uses `medium` if unset.

### Alert schema

Each Noticia and Reportaje carries a single **`country`** field (ISO3), not a list. Formal schema: `docs/alert-schema.json`.

### Frontend — critical CSS

`templates/layout.pug` loads `static/css/layout.css` in `<head>` (blocking) with tokens, WB theme, and chrome. Remaining page styles live in `static/css/main.css` and are included per template. This reduces FOUC on the app shell.

---

## HTTP API (demo)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Country picker (HTML) |
| GET | `/{country}` | Country front page (HTML) |
| GET | `/{country}/{type}/{y}/{m}/{slug}` | Article (HTML) |
| GET | `/indicadores`, `/indicators` | Indicators hub (HTML) |
| GET | `/indicador/{IDNO}` | Indicator detail (HTML) |
| GET | `/chat` | Global chat (HTML) |
| GET | `/about` | About (HTML) |
| GET | `/metodologia`, `/privacidad`, `/terminos`, `/uso` | Static pages (HTML) |
| GET | `/newsletter` | Redirect to latest LAC edition |
| GET | `/newsletter/lac/{date}` | Newsletter edition (HTML) |
| GET | `/alertas/{country}/ejemplo` | Alert subscription preview |
| GET | `/dev/feed` | Legacy feed with filters (HTML) |
| GET | `/api/alerts` | JSON `{ alerts: [...] }` |
| POST | `/api/subscribe` | JSON `{ email, subscription_type, countries?, topics?, lang? }` |
| POST | `/api/chat` | Agent SSE |
| GET | `/static/*` | Static assets |

---

## Agent tools (chat)

| Tool | Function |
|------|----------|
| `list_alerts` | Filtered local alerts |
| `run_analysis` | Pipeline by IDNO; cached unless `force: true` |
| `read_news` / `fetch_news` | Headlines on disk / refresh |
| `read_freshness` | Updated indicators catalogue |
| `mcp_search_indicators` | Data360 search |
| `mcp_get_data` | Series by indicator and country |
| `mcp_compare_countries` | LAC comparison |
| `mcp_rank_countries` | Country ranking |
| `mcp_summarize_data` | Statistical summary |

Definitions: `lib/chat/tools.js`.

---

## When to use each view

| Need | Front page | Article + chat | Global chat |
|------|------------|----------------|-------------|
| Quick browse by country | ✓ | | |
| Full editorial reading | | ✓ | |
| PCN verification | ✓ (legacy panel) | ✓ | partial |
| Question about a published piece | | ✓ | |
| Explore 12k indicators | | | ✓ |
| Chart without prior alert | | | ✓ |
| On-demand re-analysis | | ✓ | ✓ |
| Export session | | ✓ | ✓ |

---

## Known limitations (demo)

- No NiFi orchestration or OpenSearch at runtime.
- Chat depends on configured LLM; may hallucinate if it skips tools.
- Uneven GDELT coverage (HND/GTM weaker).
- Subscription saves email to local TSV; **no email send or automated unsubscribe**.
- Strategy 2 (headline–data divergence): designed, not active in detection.
- `run_analysis` can take minutes and has LLM cost.

Roadmap: `docs/architecture-overview.md`, `docs/sustainability-plan.md`.

---

## Related documentation

| Document | Content |
|----------|---------|
| [features-reference.md](./features-reference.md) | Exhaustive technical reference |
| [architecture-overview.md](./architecture-overview.md) | Demo vs production architecture |
| [frontend-architecture.md](./frontend-architecture.md) | Pug, JS, routes |
| [data-fetcher-architecture.md](./data-fetcher-architecture.md) | Freshness probe and fetch |
| [data360-integration-methodology.md](./data360-integration-methodology.md) | Data360 API integration |
| [news-architecture.md](./news-architecture.md) | Headlines subsystem |
| [security-data-handling.md](./security-data-handling.md) | Data handling |
| [environment-variables.md](./environment-variables.md) | Environment variable table |
| [user-guide.md](./user-guide.md) | This guide in Spanish |
| [CLAUDE.md](../CLAUDE.md) | Internal repo decisions |

---

## Contact and license

**Abrimos.info** — [abrimos.info](https://abrimos.info)  
Repository: [abrimos-info/abrimos-data360-monitor](https://github.com/abrimos-info/abrimos-data360-monitor)  
License: **GPLv3**
