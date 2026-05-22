# abrimos-data360-monitor

> Autonomous monitor that detects newsworthy events across the 12,000 indicators of Data360 and delivers them verified to LAC newsrooms.

A prototype by **[Abrimos.info](https://abrimos.info)** for the **Data360 Global Challenge** (World Bank and Media Party), phase 2.

## Status

Ten-day sprint (21 to 31 May 2026). Submission deadline is 31 May 2026, via Media Party Hub.

## Stack

- **Frontend**. Node.js, Pug templates, vanilla JavaScript (Monitor + Chat + About)
- **Backend**. Node.js HTTP server (`data360-monitor.js`)
- **Data layer**. Data360 API v3 (REST + MCP opcional en chat)
- **LLM**. Claude Opus 4.7 via Agent SDK (pipeline); chat multi-proveedor (`lib/ai-client.js`)
- **Verification**. [Proof-Carrying Numbers (PCN)](https://github.com/worldbank/pcn) from the World Bank
- **Hosting**. Abrimos-owned infrastructure
- **Production roadmap**. Apache NiFi orchestrates continuous updates

## Documentation

| Document | Description |
|----------|-------------|
| [**User guide (ES)**](./docs/user-guide.md) | All product features for newsrooms — Monitor, Chat, verification, pipeline |
| [Features reference](./docs/features-reference.md) | Technical feature catalog (API, tools, files) |
| [Architecture overview](./docs/architecture-overview.md) | Demo vs production |
| [Frontend architecture](./docs/frontend-architecture.md) | Pug, filters, detail panel |

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
- `data/index.json` — freshness summary for all 35 watchlist indicators

Full design. [`docs/data-fetcher-architecture.md`](docs/data-fetcher-architecture.md)

## Analysis pipeline

Detection and narrative generation run in one step:

```bash
npm run fetch:news   # optional: GDELT headlines for narrative context
npm run analyze      # strategies 1 + 4, LLM per indicator → data/alerts.json
```

Per-indicator only: `node bin/generate-analysis.js --only FAO_CP_23012`

See [`docs/user-guide.md`](docs/user-guide.md) for the full operator reference.

## Challenge deliverables

1. Working prototype and repo (this repository)
2. Demo video (5 min)
3. Architecture overview. [`docs/architecture-overview.md`](docs/architecture-overview.md)
4. Data360 API integration methodology. [`docs/data360-integration-methodology.md`](docs/data360-integration-methodology.md)
5. Security and data handling. [`docs/security-data-handling.md`](docs/security-data-handling.md)
6. User guide. [`docs/user-guide.md`](docs/user-guide.md) — **funcionalidades completas (Monitor + Chat)**
7. Features reference. [`docs/features-reference.md`](docs/features-reference.md)
8. Sustainability plan. [`docs/sustainability-plan.md`](docs/sustainability-plan.md)

## Team

- **Eduard Martín-Borregón**. Lead, narrative, UX, video, documentation.
- **Martin Szyszlican**. Frontend, LLM agents, RAG, dashboard.
- **Fernando Matzdorf**. Data360 connector, schema, ETL.

## License

GPLv3. See [`LICENSE`](LICENSE).
