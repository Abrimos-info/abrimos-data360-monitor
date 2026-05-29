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
| Pipeline | Abrimos ops | Weekly (`npm run pipeline`) or on Data360 release cycles |
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
npm run pipeline
npm run fetch:news   # optional: headline pool refresh (≤5 countries)
```

Logs show run elapsed time as `+Xm Ys` on pipeline milestones (`D360_RUN_EPOCH` shared across subprocesses).

Cost tracking via `[AI-COST]`, `[AI-COST-NARRATE]`, and `[AI-COST-ANALYSIS]` logs in `lib/ai-client.js` / `bin/generate-analysis.js`. Pipeline cost scales with changed indicators × LLM calls (one per Noticia, one per qualifying Reportaje). Chat cost is separate (`CHAT_AI_PROVIDER`, default LAIA — free).

Operators monitor:

- `data/changed-since.json` — upstream freshness
- Q1/Q2/Q4 validation failures in analyze logs
- `data/alerts/*.raw.txt` — LLM parse failures

### LLM cost model (measured + estimated)

Reference run: **`run2.log`** (2026-05-29, pre-pool architecture). Current default **`fetch:news`** uses **pool mode** (`lib/news-pool.js`): up to **5 Gemini calls** (one per LAC country) with **GDELT fallback** per country; **0 calls** when the pool already has ≥8 accepted headlines per country in the window.

| Stage | Legacy `run2.log` | Current pool mode |
|-------|-------------------|-------------------|
| Headlines (`fetch:news`) | **137 Gemini batch calls** (aborted on 429) | **≤5 Gemini + ≤5 GDELT**; skip when covered |
| Steady day (skip-covered) | ~15 indicator calls | **0** if pool full |

**Analysis tokens (estimated; not in `run2.log`).**  
One Noticia call carries the full omnibus context (CSV tiers, data dictionary, up to 8 headlines). One Reportaje call synthesises multiple Noticias. Order-of-magnitude per call: **~18k in / ~2.5k out** (Noticia), **~35k in / ~5k out** (Reportaje). Current feed (`data/alerts.json`): 53 Noticias + 6 Reportajes accumulated over several runs.

| Daily scenario | Noticia calls | Reportaje calls | Analysis tokens (in + out) |
|----------------|-------------:|----------------:|---------------------------:|
| Steady state (typical) | ~8–12 | ~0–1 | **~180k–250k** |
| Heavy update day (like `run2.log` bootstrap) | ~25–40 | ~2–5 | **~600k–900k** |

**Estimated daily cost (paid APIs).** Prices as of May 2026; Gemini Flash-Lite at [$0.10 / $0.40 per 1M input/output tokens](https://ai.google.dev/gemini-api/docs/pricing); Anthropic Claude Opus 4.7 at **$15 / $75 per 1M** (pipeline default in D-017, tracked in `lib/ai-client.js` `MODEL_PRICING`).

| Stage | Steady day | Heavy day | Provider |
|-------|----------:|----------:|----------|
| News fetch (Gemini pool) | ~2k tok → **~$0.0005** | ~10k tok → **~$0.002** | Gemini API |
| Analysis (Noticias + Reportajes) | ~230k tok → **~$5–6** | ~750k tok → **~$15–18** | Anthropic Opus |
| **Daily total (paid path)** | **~$5–6** | **~$15–20** | Gemini + Anthropic |

Chat usage (global `/chat`, article-scoped FAB) is user-driven and not part of the scheduled pipeline; at default `CHAT_AI_PROVIDER=vllm` it routes to **LAIA** ($0).

**Free backup providers (production default for demos).**  
The Challenge demo and Abrimos staging runs use paid-capable providers only where quality requires it, but the stack is designed to fall back to **zero marginal cost**:

| Provider | Env | Role | Cost |
|----------|-----|------|------|
| **LAIA** (Qwen 2.5 14B via vLLM) | `AI_PROVIDER=vllm` / `CHAT_AI_PROVIDER=vllm` | Chat default; atomic pipeline fallback | **$0** |
| **NVIDIA NIM** (Kimi K2.6) | `AI_PROVIDER=nvidia` | Analysis path used in `run2.log` | **$0** on Abrimos NIM credits |
| Claude Opus (Agent SDK) | `AI_PROVIDER=claude-code` | Highest-quality narratives (D-017) | Subscription / API |
| Gemini Flash-Lite | `fetch:news` pool (≤5 calls) | Headline discovery only | ~$0.002/day full pass |

Operational rule: run **Gemini + NVIDIA/LAIA** for daily replay; reserve **Anthropic Opus** for final narrative polish or jury/demo builds where Q1 claim traceability is critical.

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
| LLM cost at scale | Dynamic discovery limits scope; cache `run_analysis`; **LAIA + NVIDIA NIM as $0 fallbacks**; Gemini news ~$0.02/day; Opus analysis ~$5–6/day steady |
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
