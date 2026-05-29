# abrimos-data360-monitor

> AI-powered news agency that detects newsworthy facts from Data360's 12,000 indicators and delivers them verified with local perspective to LAC newsrooms.

A prototype by **[Abrimos.info](https://abrimos.info)** for the **Data360 Global Challenge** (World Bank and Media Party), phase 2.

## Status

Ten-day sprint (21 to 31 May 2026). Submission deadline is 31 May 2026, via Media Party Hub.

## Stack

- **Frontend**. Node.js, Pug templates, vanilla JavaScript — country front pages, articles, indicators hub, chat, newsletter preview
- **Backend**. Node.js HTTP server (`data360-monitor.js`)
- **Data layer**. Data360 API v3 (REST + MCP optional in chat)
- **LLM**. Claude Opus 4.7 via Agent SDK (pipeline); multi-provider chat (`claude-code`, `vllm`, `nvidia`, OpenRouter via `lib/ai-client.js`)
- **Verification**. [Proof-Carrying Numbers (PCN)](https://github.com/worldbank/pcn) from the World Bank
- **Hosting**. Abrimos-owned infrastructure
- **Production roadmap**. Apache NiFi orchestrates continuous updates

## Web application

The monitor serves a newspaper-style product for five LAC countries:

| Route | Purpose |
|-------|---------|
| `/` | Country picker + recently updated indicators |
| `/{country}` | Country front page (hero reportaje, headlines, indicator ticker) |
| `/{country}/{noticia\|reportaje}/{year}/{month}/{slug}` | Full article + scoped chat |
| `/indicadores` | Global indicators hub by tier |
| `/indicador/{IDNO}` | Indicator detail and alerts by country |
| `/chat` | Global analytical chat (presets, freshness, MCP tools) |
| `/newsletter/lac/{date}` | LAC newsletter edition preview |
| `/metodologia`, `/privacidad`, `/terminos`, `/uso` | Static pages (`config/copy/`) |

**Subscribe** modal → `POST /api/subscribe` → local TSV (`data/newsletter/subscribers.tsv`, gitignored). No real email in demo.

Legacy card feed with client filters: `/dev/feed` or `?legacy=1` on a country page.

Full operator guide: [`docs/user-guide.md`](docs/user-guide.md) (ES) · [`docs/user-guide.en.md`](docs/user-guide.en.md) (EN).

## Deployment

The demo runs two independent processes on the server: the **Node monitor** (dashboard + chat UI) and the **Data360 MCP server** (Python, chat tools only). Nginx terminates TLS and proxies only the monitor; MCP stays on localhost.

| Service | Default port | Repo / entrypoint |
|---------|--------------|-------------------|
| Monitor | `8090` (`D360_PORT`) | this repo — `node data360-monitor.js` |
| Data360 MCP | `8021` | [worldbank/data360-mcp](https://github.com/worldbank/data360-mcp) |

Nginx example. [`infra/nginx/data360.example.conf`](infra/nginx/data360.example.conf) and [`infra/nginx/README.md`](infra/nginx/README.md).

### Data360 MCP server

The chat agent calls Data360 through MCP (`mcp_search_indicators`, `mcp_get_data`, `mcp_compare_countries`, etc.). If MCP is down, `lib/chat/tools.js` falls back to the REST client automatically — the UI keeps working, but responses may be less enriched.

**1. Install MCP (once per host)**

Requires Python 3.10+ and [uv](https://github.com/astral-sh/uv).

```bash
git clone https://github.com/worldbank/data360-mcp.git
cd data360-mcp
uv sync
uv pip install -e data360-mcp
uv pip install -e data360-mcp-server
```

Create `.env` in the MCP repo (or export):

```bash
DATA360_API_BASE_URL=https://data360api.worldbank.org
```

**2. Run MCP**

Development:

```bash
uv run fastmcp run data360-mcp-server/src/data360_mcp_server/main.py:mcp --transport http --port 8021
```

Or use the upstream script: `./run_server.sh`.

The HTTP endpoint must be reachable at `http://127.0.0.1:8021/mcp` (Streamable HTTP + SSE).

**3. Point the monitor at MCP**

In this repo's `.env`:

```bash
MCP_URL=http://127.0.0.1:8021/mcp
```

Do not expose MCP through nginx — bind to localhost and let only the Node process call it.

**4. Verify**

With MCP running:

```bash
node bin/evaluate-mcp.js
```

Smoke-test from the deployed site: open an article chat and ask for a LAC comparison or a sparkline; tool traces should show `source: data360_mcp`.

**5. Production (systemd sketch)**

Run MCP as its own unit, restart independently of the monitor:

```ini
# /etc/systemd/system/data360-mcp.service
[Unit]
Description=World Bank Data360 MCP server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/data360-mcp
Environment=DATA360_API_BASE_URL=https://data360api.worldbank.org
ExecStart=/usr/local/bin/uv run fastmcp run data360-mcp-server/src/data360_mcp_server/main.py:mcp --transport http --host 127.0.0.1 --port 8021
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Adjust paths, then `systemctl enable --now data360-mcp`. Restart the monitor after changing `MCP_URL`.

### PM2 (process manager)

For persistent hosting of the Node monitor, use [PM2](https://pm2.keymetrics.io/) with the included ecosystem file:

```bash
npm install -g pm2
cp .env.example .env   # configure D360_PORT, MCP_URL, AI_*, etc.
pm2 start ecosystem.config.js
pm2 save
pm2 startup            # optional: survive reboot
```

[`ecosystem.config.js`](ecosystem.config.js) runs `data360-monitor.js` with `NODE_ENV=production`, `D360_PORT=8090`, and loads secrets from `.env` via `env_file`. Run the Data360 MCP server separately (systemd or another PM2 app on port 8021).

```bash
pm2 logs data360-monitor
pm2 restart data360-monitor
```

Environment reference: [`docs/environment-variables.md`](docs/environment-variables.md).

### Anthropic API (analysis pipeline)

With `AI_PROVIDER=claude-code`, the pipeline calls the [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) when `ANTHROPIC_API_KEY` is set. This is the expected path for local development and production (pm2).

In `.env`:

```bash
AI_PROVIDER=claude-code
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=opus
```

Create keys at [console.anthropic.com](https://console.anthropic.com/settings/keys). Full variable reference: [`docs/environment-variables.md`](docs/environment-variables.md).

## Documentation

| Document | Description |
|----------|-------------|
| [**User guide (ES)**](./docs/user-guide.md) | All product features for newsrooms — front pages, articles, chat, verification, pipeline |
| [**User guide (EN)**](./docs/user-guide.en.md) | English translation of the user guide |
| [Environment variables](./docs/environment-variables.md) | Complete `.env` reference (AI, chat, news, server) |
| [Features reference](./docs/features-reference.md) | Technical feature catalog (API, tools, files) |
| [Architecture overview](./docs/architecture-overview.md) | Demo vs production |
| [Frontend architecture](./docs/frontend-architecture.md) | Pug, routes, article chat |
| [Security and data handling](./docs/security-data-handling.md) | Subscriptions, LLM, PCN, hosting |
| [Sustainability plan](./docs/sustainability-plan.md) | Post-Challenge partners and operation |

## Countries covered in the demo (LAC)

Guatemala, Honduras, Argentina, Ecuador, Mexico.

## Detection

The demo covers two of the five canonical detection patterns.

1. **Abrupt changes**. Observations with elevated z-score against their historical trajectory.
2. **Cross-indicator anomalies**. Countries that fall outside the regional pattern.

Roadmap. Narrative versus data divergences, invisible trends, untold milestones.

## Data fetch and freshness

The pipeline uses `bin/fetch-data.js` to detect upstream updates before downloading.

```bash
npm run fetch:probe    # fast check (~2 s): which indicators changed?
npm run fetch          # probe + download changed + refresh LAC context
```

Outputs.

- `data/changed-since.json` — indicators updated since the last probe (`changed_indicators` array)
- `data/index.json` — freshness summary for all watchlist indicators

Full design. [`docs/data-fetcher-architecture.md`](docs/data-fetcher-architecture.md)

## Analysis pipeline

Detection and narrative generation run in two phases inside one step:

```bash
npm run fetch:news   # optional: headlines for narrative context (Gemini default)
npm run analyze      # strategies 1 + 4 → Phase 1 Noticias → Phase 2 Reportajes → data/alerts.json
```

The pipeline emits two content types:

- **Noticia** — bilingual news story (one per indicator/country, 250–600 words) triggered by a detection candidate.
- **Reportaje** — bilingual long-form (one per dataset, 500–1200 words) generated only when two or more Noticias share the same `dataset_id`. Synthesises a regional view and reuses the Noticias' `claim_id`s.

Each alert carries a single **`country`** field (ISO3), not a list — see `docs/alert-schema.json`.

Per-indicator only: `node bin/generate-analysis.js --only FAO_CP_23012`

Indicators can be picked from the static 35-item watchlist (`lib/watchlist.js`) or discovered dynamically from `/data360/searchv2`:

```bash
npm run pipeline               # discover → fetch → news → analyze → newsletter
npm run pipeline:force         # same, but bypass the ETag cache
npm run build                  # alias for pipeline
npm run analyze:changed        # analyze changed indicators only
npm run analyze:noticias       # Phase 1 only
npm run analyze:reportajes     # Phase 2 only
npm run fetch:news             # headlines (Gemini, dynamic watchlist)
npm run pipeline:news-gdelt    # GDELT fetch for watchlist
npm run generate:newsletter    # LAC newsletter edition for today (also run by pipeline)
npm run replay:daily           # day-by-day replay (fetch + analyze + newsletter)
```

### LLM providers

Pipeline (`AI_PROVIDER`) and chat (`CHAT_AI_PROVIDER`): `claude-code`, `vllm` (LAIA), `nvidia` (NIM), OpenRouter. See [`.env.example`](.env.example) and [`docs/environment-variables.md`](docs/environment-variables.md).

See [`docs/user-guide.md`](docs/user-guide.md) for the full operator reference.

## Challenge deliverables

1. Working prototype and repo (this repository)
2. Demo video (5 min)
3. Architecture overview. [`docs/architecture-overview.md`](docs/architecture-overview.md)
4. Data360 API integration methodology. [`docs/data360-integration-methodology.md`](docs/data360-integration-methodology.md)
5. Security and data handling. [`docs/security-data-handling.md`](docs/security-data-handling.md)
6. User guide. [`docs/user-guide.md`](docs/user-guide.md) (ES) · [`docs/user-guide.en.md`](docs/user-guide.en.md) (EN)
7. Features reference. [`docs/features-reference.md`](docs/features-reference.md)
8. Sustainability plan. [`docs/sustainability-plan.md`](docs/sustainability-plan.md)

## Team

- **Eduard Martín-Borregón**. Lead, narrative, UX, video, documentation.
- **Martin Szyszlican**. Frontend, LLM agents, RAG, dashboard.
- **Fernando Matzdorf**. Data360 connector, schema, ETL.

## License

GPLv3. See [`LICENSE`](LICENSE).
