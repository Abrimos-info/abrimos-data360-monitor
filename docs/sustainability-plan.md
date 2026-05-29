# Sustainability and Maintenance Plan

> **Status**. Final draft for Data360 Global Challenge phase 2 (2026-05-29).

---

## Framing

> "The Challenge is the door to a partner ecosystem, not a terminal prize. More partners can come to the table after the deadline. The project connects civic tech, media and startups at scale."
> Mariano Blejman (Media Party), 2026-05-21 office hour.

**Data360 News Agent** is designed as a **public, reusable asset** for LAC newsrooms — not a one-off demo binary. The repository (GPLv3), documentation, and partner network are the foundation for post-Challenge operation.

---

## Positioning

### Public asset for the ecosystem

- **Open repository** — full pipeline, frontend, and docs at [abrimos-info/abrimos-data360-monitor](https://github.com/abrimos-info/abrimos-data360-monitor).
- **LAC-first** — five pilot countries (GTM, HND, ARG, ECU, MEX) with newspaper-style UX and bilingual narratives.
- **Verification by design** — PCN claim tokens link every figure to Data360; newsrooms can audit before publish.
- **Free commercial access** for newsrooms and NPOs in developing countries (stated in product copy and subscription modal).

### Upstream contribution to World Bank MCP

Features developed during the Challenge — robust REST fallback, freshness probing, omnibus context for narratives — are candidates for contribution to [worldbank/data360-mcp](https://github.com/worldbank/data360-mcp). Abrimos maintains a parallel MCP deployment documented in the README; improvements that benefit all MCP consumers will be proposed as PRs or design notes to the AI for Data team.

### Partner pipeline

Initial distribution network for pilot feedback and co-design:

| Partner | Country | Role |
|---------|---------|------|
| Animal Político | Mexico | Editorial pilot, newsletter feedback |
| Quinto Elemento Lab | Mexico | Data journalism integration |
| Ojoconmipisto | Guatemala | LAC Spanish-language newsroom |

Post-deadline: expand to additional LAC outlets via Abrimos.info media network and World Bank introductions from the Challenge jury.

---

## Product continuity after the Challenge

### What stays running (months 1–3)

| Component | Owner | Frequency |
|-----------|-------|-----------|
| Dynamic pipeline | Abrimos ops | Weekly (`pipeline:dynamic`) or on Data360 release cycles |
| Staging site | Abrimos infra | Continuous (monitor process) |
| Newsletter editions | Editorial + pipeline | Target: daily LAC edition (fixture → generated) |
| Repository maintenance | Abrimos dev | Issue triage, dependency updates |

### Roadmap milestones

1. **SMTP newsletter** — wire `subscribers.tsv` to a mail provider; implement unsubscribe (policy already drafted in `/privacidad` copy).
2. **NiFi + OpenSearch** — replace manual npm replay with scheduled fetch and indexed observations (see [architecture-overview.md](./architecture-overview.md)).
3. **Strategy 2** — headline-data divergence as a third detection signal ([news-architecture.md](./news-architecture.md)).
4. **Self-hosted LLM option** — for newsrooms with strict data-residency requirements (noted in privacy copy).

---

## Operational model

### Team roles (Abrimos.info)

| Person | Responsibility |
|--------|----------------|
| Eduard Martín-Borregón | Product, editorial voice, partner relations, documentation |
| Martin Szyszlican | Frontend, LLM agents, dashboard, chat |
| Fernando Matzdorf | Data360 connector, ETL, freshness, schema |

### Pipeline operation

Typical weekly run (dynamic mode):

```bash
npm run pipeline:dynamic
npm run fetch:news:dynamic   # optional headlines refresh
```

Cost tracking via `[AI-COST]` and `[AI-COST-NARRATE]` logs in `lib/ai-client.js`. Pipeline cost scales with number of changed indicators × LLM calls (one per Noticia, one per qualifying Reportaje). Chat cost is separate (`CHAT_AI_PROVIDER`).

Operators monitor:

- `data/changed-since.json` — upstream freshness
- Q1/Q2/Q4 validation failures in analyze logs
- `data/alerts/*.raw.txt` — LLM parse failures

### Infrastructure

- Monitor: single Node process behind nginx TLS.
- MCP: optional second process on localhost (chat enrichment).
- No managed cloud dependency required beyond LLM API keys; can migrate to self-hosted models.

---

## Funding model (post-Challenge)

Honest framing — no fixed budget committed at submission time:

| Source | Fit |
|--------|-----|
| **World Bank / Media Party follow-on** | Challenge ecosystem grants, MCP co-development |
| **Abrimos core budget** | Maintenance of staging, weekly pipeline, partner support |
| **Newsroom partnerships** | In-kind editorial testing; optional sponsorship for dedicated country coverage |
| **Foundation / civic tech grants** | LAC media sustainability, open data journalism |
| **Commercial services (optional)** | Custom indicator watchlists, private deployment, training — **not** paywall on public demo data |

Revenue is **not** required for the free tier promised to developing-country newsrooms. Any paid tier would cover marginal LLM and infra cost for bespoke deployments only.

---

## Five-line pitch (post-deadline jury call)

**Data360 News Agent turns 12,000 World Bank indicators into verified, publish-ready LAC news — automatically.**  
We detect what changed, narrate it bilingually, and bind every number to its source row (PCN).  
Newsrooms get a daily newsletter and on-demand chat over the same verified feed.  
The stack is open source (GPLv3), REST-first with optional World Bank MCP, and already piloting with Animal Político and Quinto Elemento.  
We are looking for partners to scale from five countries to full LAC coverage and to co-develop Strategy 2 (when headlines and data disagree, that is the story).

---

## Risk and mitigation

| Risk | Mitigation |
|------|------------|
| LLM cost at scale | Dynamic discovery limits scope; cache `run_analysis`; LAIA/NIM fallbacks |
| GDELT coverage gaps (HND, GTM) | Gemini supplement; partner-sourced headline lists |
| Data360 API changes | Versioned client in `lib/data360-client.js`; HEAD probe catches blob moves |
| Partner churn | Open repo allows any newsroom to self-host |
| Model hallucination | Q1 claim traceability; chat tool-use requirements; PCN UI audit |

---

## Success metrics (6-month horizon)

- **Adoption**: ≥3 LAC newsrooms using weekly alert feed or newsletter regularly.
- **Quality**: ≥95% of emitted alerts pass Q1+Q2 on first LLM attempt.
- **Freshness**: pipeline run within 48h of major Data360 dataset updates.
- **Upstream**: ≥1 accepted improvement to data360-mcp or public methodology doc.
- **Sustainability**: funding path identified (grant or WB partnership) beyond Abrimos bootstrap.

---

## Related documentation

- [Architecture overview](./architecture-overview.md)
- [User guide](./user-guide.md)
- [Security and data handling](./security-data-handling.md)
