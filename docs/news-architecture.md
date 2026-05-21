# News Ingest Subsystem — Architecture

> **Status**: Design approved. Implementation pending (second round).
> **Decision**: D-029 (defined) → D-030 (stack + schema, proposed below).

---

## 1. Use cases

### Demo (submission 2026-05-31)

**Option chosen: (a) Passive context for the LLM.**

Headlines from the snapshot period are injected as a new section §6 (`## Recent public discourse`) in the omnibus context assembled by `lib/analysis/context-builder.js`. The LLM can then reference current events in narratives (§3, §2) without needing any new detection logic. No structural change to the alert schema.

Rationale: Strategy 2 (narrative-data divergence) requires a divergence classifier on top of the headline set, which adds scope. The demo deadline is 2026-05-31. Passive context enrichment takes 1–2 days to implement; Strategy 2 activation takes an additional 2–3 days. Risk-adjusted choice: ship context enrichment now, gate Strategy 2 behind D-030.

### Roadmap

- **Strategy 2 (active)**: a second LLM pass or a zero-shot classifier compares the news tone around an indicator against the direction of the data signal. If the narrative says "economy improving" but the indicator dropped 18 %, the divergence is itself an alert.
- **Cross-link headline ↔ alert**: alerts in `data/alerts.json` gain an optional `news_links[]` array listing the URLs of headlines that mention the indicator or the detection event.

---

## 2. Sources

### Primary: GDELT Document API v2

Endpoint: `https://api.gdeltproject.org/api/v2/doc/doc`

Parameters used: `query`, `SOURCELANG:Spanish`, `SOURCECOUNTRY`, `startdatetime`, `enddatetime`, `mode=artlist`, `format=json`.

Advantages:
- **Free, no authentication, no rate-limit stated** (be respectful: one request per country per run, ≤12 requests total for a demo snapshot).
- **Historical queries**: supports date ranges back to 2015, compatible with D-007 (replay mode).
- Returns `title`, `url`, `seendate`, `language`, `domain`, `sourcecountry`.
- Covers hundreds of Spanish-language outlets per LAC country: La Nación, Clarín, Infobae (ARG); El Comercio, La Hora, Plan V (ECU); Prensa Libre, El Periódico (GTM); El Heraldo, La Tribuna, Proceso (HND); El Universal, Excélsior, Animal Político (MEX).
- License: GDELT is released under an open license for research, journalism, and non-commercial use; redistribution of URLs and headlines is permitted.

Limitation: coverage is weakest for HND and GTM (fewer indexed outlets); English-language international press (Reuters, AP) tends to dominate for those two. Mitigated by adding `lang:es` filter and country-specific query terms (see §11 Risks).

### Fallback: Google News RSS

URL pattern: `https://news.google.com/rss/search?q={country_name}&hl=es-{cc}&gl={CC}&ceid={CC}:es`

Advantages: zero configuration, no API key, returns recent articles with headline, URL, source, and publication date. Works for all 5 countries.

Limitations: no historical depth (7–30 days only), URL format may change, Google ToS prohibits commercial redistribution of scraped content. Acceptable as **demo fallback** only; not for the sustainability plan.

---

## 3. License and redistribution

| Action | GDELT primary | Google News fallback |
|--------|--------------|----------------------|
| Store headline text | Permitted (open license) | Acceptable internally; do not publish full text |
| Store snippet (1–2 lines) | Permitted | Backend only; do not serve from public dashboard |
| Republish URL | Permitted | Permitted (URLs are not copyrightable) |
| Serve headline from public dashboard | Permitted with attribution | Avoid; use only URL link |
| robots.txt constraint | GDELT API has none | Respect Google's robots.txt on google.com |

For the public demo dashboard, display only **headline + source name + URL link** from GDELT. Do not render snippet text inline. This is conservative and compatible with both GDELT and LAC copyright law (fair use / derecho de cita).

---

## 4. Headline schema

```json
{
  "id": "sha1(url)",
  "country": "ARG",
  "published_at": "2026-04-18T12:30:00Z",
  "fetched_at": "2026-05-15T10:00:00Z",
  "source": {
    "name": "La Nación",
    "domain": "lanacion.com.ar"
  },
  "url": "https://www.lanacion.com.ar/...",
  "headline": "Riesgo país cayó a mínimo en cuatro años",
  "snippet": null,
  "language": "es",
  "gdelt_tone": -3.2,
  "tags": [],
  "indicators_hint": []
}
```

Field notes:
- `id`: SHA-1 of the normalized URL (lowercase, strip trailing slash). Deterministic deduplication key.
- `country`: ISO 3166-1 alpha-3 (`ARG`, `ECU`, `GTM`, `HND`, `MEX`) from the GDELT query, not from the outlet location. An article about Mexico in a Guatemalan outlet still goes into MEX.
- `published_at` / `fetched_at`: separate fields. `published_at` comes from GDELT `seendate`; `fetched_at` is the run timestamp. Both needed for replay mode (D-007).
- `snippet`: `null` for GDELT artlist mode (no snippet returned); populated in future if using a full-document fetch mode.
- `gdelt_tone`: GDELT's computed tone score (-100 to +100). Optional but useful for Strategy 2 later. Omit if not returned.
- `tags`: GDELT themes array if available (`ECON_CURRENCY`, `ENV_CLIMATE`, etc.). Forward-compatible with enrichment.
- `indicators_hint`: empty in ingest step; populated by optional enrichment pass (§8).

---

## 5. Disk layout

```
data/news/{COUNTRY}/{YYYY-MM}.jsonl
```

One JSON object per line. Example:

```
data/news/ARG/2026-04.jsonl
data/news/ARG/2026-05.jsonl
data/news/ECU/2026-04.jsonl
...
```

Rationale:
- Consistent with the `data/context/{COUNTRY}/` pattern already in use.
- Month-granularity matches the demo time window (April–May 2026 snapshot).
- Deduplication by `id` is O(1): check the relevant month file before appending.
- Expected size: ~100 headlines/day/country × 30 days × 300 bytes/headline ≈ 900 KB per country-month. Five countries × 2 months ≈ 9 MB total. Gitignored (`.gitignore` entry: `data/news/`).

For the demo, the fetcher runs once before submission and produces a static snapshot. The context-builder reads the month files corresponding to the analysis period.

---

## 6. Integration with the analysis pipeline (D-028)

A new section §6 is added to the omnibus context document assembled by `lib/analysis/context-builder.js`:

```markdown
## Discurso público reciente

Titulares de prensa para los países del scope, período 2026-04 a 2026-05.
Máximo 8 titulares por país, ordenados de más reciente a más antiguo.

### ARG

- [2026-05-10] La Nación (lanacion.com.ar): "Riesgo país cayó a mínimo en cuatro años"
  URL: https://www.lanacion.com.ar/...
- [2026-05-03] Infobae (infobae.com): "El INDEC publicó los datos de inflación de abril"
  URL: https://...

### ECU

- ...
```

The system prompt (`lib/prompts/analysis-system.md`) must declare this new section in the input contract table (§2, row 6). The LLM cites it via line numbers in `source` blocks, same as other sections.

**Token budget**: 8 headlines × 5 countries × avg 120 chars per formatted line = ~4,800 chars ≈ 1,200 tokens. This is negligible (< 2 % of a typical 70k-token omnibus). No per-indicator filtering needed for the demo.

**Selection logic**: load all headlines for the country in the relevant month range, sort by `published_at` descending, take the first 8. No relevance filtering in the demo; in production, `indicators_hint` (populated by enrichment) can be used to select only headlines linked to the current indicator.

---

## 7. Optional enrichment (post-ingest)

A lightweight pass using LAIA (Qwen 2.5 14B, zero cost) can label each headline with which Data360 indicators it mentions, writing results to `indicators_hint`.

**Tradeoffs**:

| | Demo | Production |
|---|---|---|
| Cost | ~0 (LAIA free) | ~0 |
| Latency | +10–30 min per snapshot | Async, runs after ingest |
| Utility demo | Low (all 8 headlines per country shown regardless) | High (enables per-indicator filtering) |
| Risk | Qwen misclassification creates noise | Validate Q-check on claim coverage |

**Recommendation**: skip enrichment for the demo. Schedule as production step in the roadmap. The `indicators_hint` field is pre-reserved in the schema.

---

## 8. Stack

| Concern | Library | Notes |
|---------|---------|-------|
| HTTP | `axios` | Already in use; add timeout + retry (3×, exponential backoff) |
| RSS parsing | `rss-parser` (npm) | Fallback only; lightweight, no native deps |
| GDELT response | `JSON.parse` | GDELT artlist mode returns JSON directly |
| Deduplication | SHA-1 via `crypto` (Node built-in) | Hash of normalized URL |
| JSONL write | `fs.appendFileSync` | One line per headline; atomic per record |
| Rate limiting | Manual: one request per country | GDELT has no stated limit; 12 requests max per demo run |

New file: `bin/fetch-news.js`. Entry point: `node bin/fetch-news.js --countries GTM,HND,ARG,ECU,MEX --from 2026-04-01 --to 2026-05-21`.

---

## 9. Estimates

**Implementation effort**: 1–2 person-days.
- `bin/fetch-news.js` (GDELT query + JSONL write + dedup): ~4 hours.
- `lib/analysis/context-builder.js` §6 section injection: ~2 hours.
- `lib/prompts/analysis-system.md` §2 contract update: ~30 min.
- Tests (unit + integration with fixture JSONL): ~2 hours.

**Volume per demo snapshot** (90 days × 5 countries):
- ~50–100 articles/day/country from GDELT (Spanish, LAC query).
- Total: ~22,500–45,000 headlines.
- Disk: ~10–15 MB JSONL (gitignored).

**Monetary cost**: zero. GDELT is free; LAIA enrichment is free; no paid APIs.

---

## 10. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| GDELT coverage weak for HND, GTM | Medium | Augment query with country-specific terms (`"Honduras" OR "Guatemala"`) and add English-language results as secondary query |
| GDELT API down at demo run | Low | Run 1 week before submission; cache result; fallback to Google News RSS |
| Capital-city media bias | Medium | Accept for demo; note in `docs/sustainability-plan.md` as known limitation |
| Spanish-only coverage misses English reports on LAC | Low | Add `SOURCELANG:English` secondary query for international outlets (Reuters, AP Latin America) |
| Censored or non-indexed outlets (HND, GTM in particular) | High | Acknowledge in limitations; propose direct RSS of El Faro, Plaza Pública as supplement in production |
| GDELT tone field absent in artlist mode | Low | Make `gdelt_tone` optional in schema; omit if missing |
| LLM over-cites news at expense of data | Low | Enforce existing §4 alert schema: alerts must be grounded in numeric observations, not in headlines alone |

---

## Proposed D-030

> **D-030** | News subsystem: GDELT DOC API v2 as primary source (free, historical, Spanish-filtered by country); Google News RSS as fallback; headlines stored as `data/news/{COUNTRY}/{YYYY-MM}.jsonl`; injected in omnibus context as §6 (max 8 per country); no enrichment in demo; Strategy 2 activation deferred to production.
