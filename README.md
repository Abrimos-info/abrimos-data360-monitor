# abrimos-data360-monitor

> Autonomous monitor that detects newsworthy events across the 12,000 indicators of Data360 and delivers them verified to LAC newsrooms.

A prototype by **[Abrimos.info](https://abrimos.info)** for the **Data360 Global Challenge** (World Bank and Media Party), phase 2.

## Status

Ten-day sprint (21 to 31 May 2026). Submission deadline is 31 May 2026, via Media Party Hub.

## Stack

- **Frontend**. Node.js and React (dashboard)
- **Backend**. Node.js, OpenSearch
- **Data layer**. Data360 API v3 client (direct REST)
- **LLM**. Claude Opus 4.7 via Agent SDK
- **Verification**. [Proof-Carrying Numbers (PCN)](https://github.com/worldbank/pcn) from the World Bank
- **Hosting**. Abrimos-owned infrastructure (Hetzner)
- **Production roadmap**. Apache NiFi orchestrates continuous updates

## Countries covered in the demo (LAC)

Guatemala, Honduras, Argentina, Ecuador, Mexico.

## Detection

The demo covers two of the five canonical detection patterns.

1. **Abrupt changes**. Observations with elevated z-score against their historical trajectory.
2. **Cross-indicator anomalies**. Countries that fall outside the regional pattern.

Roadmap. Narrative versus data divergences, invisible trends, untold milestones.

## Challenge deliverables

1. Working prototype and repo (this repository)
2. Demo video (5 min)
3. Architecture overview. [`docs/architecture-overview.md`](docs/architecture-overview.md)
4. Data360 API integration methodology. [`docs/data360-integration-methodology.md`](docs/data360-integration-methodology.md)
5. Security and data handling. [`docs/security-data-handling.md`](docs/security-data-handling.md)
6. User guide. [`docs/user-guide.md`](docs/user-guide.md)
7. Sustainability plan. [`docs/sustainability-plan.md`](docs/sustainability-plan.md)

## Team

- **Eduard Martín-Borregón**. Lead, narrative, UX, video, documentation.
- **Martin Szyszlican**. Frontend, LLM agents, RAG, dashboard.
- **Fernando Matzdorf**. Data360 connector, schema, ETL.

## License

GPLv3. See [`LICENSE`](LICENSE).
