# Test Plan

> Test coverage for `abrimos-data360-monitor`.
> Status as of 2026-05-29. Run: `npm test` → `node --test test/*.test.js`.

## Current state

| Item | Status |
|------|--------|
| `test/` directory | **61 suites**, 291 tests |
| Last run | **289 pass, 0 fail, 2 skipped** (~7 s) |
| HTTP mocking | Injected `headCsv` / `getCsv` hooks + local `http.Server` in `data360-client.test.js` |
| `test/fixtures/` | Present (`watchlist-mini.json`, HEAD mocks, GDELT sample) |
| `test/helpers/` | `tmpdir`, `load-alerts`, `parse-context-claims`, `http-mock` |
| CI | `.github/workflows/test.yml` runs `npm test` on push/PR |
| Browser / E2E | Deferred — `test/e2e-deferred.test.js` skipped |

### Implementation status (by file)

| File | Phase | Status |
|------|-------|--------|
| `test/alerts-store.test.js` | — | Implemented (extended D-010 types, journalist field) |
| `test/i18n.test.js` | 4 | Implemented (+ `newsletter.*` keys) |
| `test/server.test.js` | 0, 4 | Implemented (D-006 meta, frontpage, newsletter, subscribe, traversal) |
| `test/routes.test.js` | — | Implemented (all viewNames from routes.json) |
| `test/static-copy.test.js` | — | Implemented (privacidad, metodologia, terminos, uso) |
| `test/url-slug.test.js` | — | Implemented (article paths) |
| `test/indicators-hub.test.js` | — | Implemented |
| `test/chat.test.js` | 4 | Implemented (tools, sparkline, API 405) |
| `test/freshness-preset.test.js` | — | Implemented |
| `test/alert-schema.test.js` | 1 | Implemented |
| `test/quality-validator.test.js` | 1 | Implemented |
| `test/csv.test.js` | 2 | Implemented |
| `test/watchlist.test.js` | 2 | Implemented |
| `test/freshness-cache.test.js` | 2 | Implemented |
| `test/data360-client.test.js` | 2 | Implemented |
| `test/freshness-probe.test.js` | 2 | Implemented |
| `test/context-fetch.test.js` | 2 | Implemented |
| `test/fetch-data.integration.test.js` | 2 | Implemented |
| `test/z-score.test.js` | 3 | Implemented |
| `test/cross-indicator.test.js` | 3 | Implemented |
| `test/pcn-claims.test.js` | 3 | Implemented |
| `test/alert-extractor.test.js` | 3 | Implemented |
| `test/news.test.js` | 3 | Implemented |
| `test/views.test.js` | 4 | Implemented |
| `test/alert-display.test.js` | 4 | Implemented |
| `test/alerts-store-perf.test.js` | 5 | Implemented |
| `test/license.test.js` | 5 | Implemented |
| `test/e2e-deferred.test.js` | 5 | Skipped (Playwright TBD) |
| `test/build-pipeline-deferred.test.js` | 5 | Skipped (full live pipeline integration TBD) |

### Testability refactors (production code)

| Module | Change |
|--------|--------|
| `lib/freshness-probe.js` | Optional `opts.headCsv`, `opts.csvUrl` |
| `lib/context-fetch.js` | Export `isAcceptable`; optional `opts.getCsv`, `opts.csvUrl` |
| `lib/analysis/quality-validator.js` | Export `validateAgainstSchema` |
| `lib/views.js` | Export `pickLang`, `pickLangMode`, `readFilters`, `langModeForRoute` |
| `bin/fetch-data.js` | `--data-dir`, `--watchlist-file`, `runFetchData(argv, hooks)` |

### Still open (see sections below)

- `test/data-loader.test.js`, `candidate-builder`, `context-builder`, `generate-analysis` (optional P1)
- `bin/evaluate-mcp.js` smoke with `MCP_DISABLED`
- Playwright E2E for filters and newsletter modal
- Full `npm run build` integration smoke

---

## P0 — Data contract (demo / jury)

Highest leverage before submission: every shipped alert must match the public schema and standing decisions (D-003, D-006, D-010).

### `docs/alert-schema.json` + `lib/analysis/quality-validator.js`

| Test | Expected behaviour |
|------|-------------------|
| All `data/alerts/*.json` entries | Pass Ajv schema validation |
| `verification_trace` | `data360_dataset_url` and `csv_link` present; URLs well-formed |
| Countries | Only `GTM`, `HND`, `ARG`, `ECU`, `MEX` (D-003) |
| Types | Only `abrupt_change` and `anomaly` (D-010); align `alerts-store.test.js` (today allows `cross_indicator_anomaly`) |
| Bilingual content | `title` / `lead` / `story` have `es` and `en` |
| Q1 claim traceability | Each `claim_tokens[].claim_id` appears in numbered analysis context for that indicator |
| Q4 length | `story` length within 250–4000 chars; bilingual `es`/`en` fields present |
| `chart_series` | Non-empty array; points have `period` and numeric `value` |

Suggested file: `test/alert-schema.test.js`.

### Series hygiene (CLAUDE conventions)

| Test | Expected behaviour |
|------|-------------------|
| CSV parse | `OBS_VALUE` parsed with `Decimal`, not `Number` |
| Status filter | Only `OBS_STATUS = "A"` enters detection context |
| Disaggregations | `_Z` and `_T` dropped per watchlist rules (`lib/context-fetch.js` `isAcceptable`) |

---

## P0 — Freshness / fetch (Phase 1)

No dedicated coverage today. Highest priority for newly implemented code; already hit a first-run regression (304 after HEAD cache without local CSV).

### `lib/freshness-probe.js`

| Test | Expected behaviour |
|------|-------------------|
| First run, no cache | All indicators `changed: true`, `first_probe: true`, `since: null` |
| Second run, cached HEAD returns 304 | `changed: 0`, all in unchanged |
| One indicator returns 200 with new `Last-Modified` | Only that `idno` in `changed_indicators` |
| `force: true` | All marked changed even when HEAD returns 304 |
| HTTP 404 / 500 on HEAD | Increments `errors`, does not abort batch |
| `buildChangedSinceReport` | `indicators` contains only changed rows; `changed_indicators` consistent |
| `buildIndex` | All watchlist indicators present with correct `changed_this_run` |
| `saveProbeState` | Run N+1 has `since` equal to run N `last_probe_at` |

### `lib/freshness-cache.js`

| Test | Expected behaviour |
|------|-------------------|
| `loadEtag`, missing file | Returns `null` |
| `saveEtag` / `loadEtag` | Round-trip valid JSON |
| `loadProbeState`, missing file | Returns `{ last_probe_at: null }` |
| Path helpers | `etagPath`, `csvSnapshotPath`, `metaSnapshotPath` produce expected paths |

### `lib/data360-client.js` (HEAD / GET)

| Test | Expected behaviour |
|------|-------------------|
| `csvUrl` | Predictable `{BLOB}/{DB}/{IDNO}.csv` URL |
| `headCsv` without cache | HEAD with no conditional headers |
| `headCsv` with cache | Sends `If-None-Match` and `If-Modified-Since` |
| `headCsv` returns 304 | `changed: false` |
| `getCsv` returns 304 | `body: null` |
| `getCsv` returns 200 | Body and response headers returned |

### `lib/context-fetch.js`

| Test | Expected behaviour |
|------|-------------------|
| Local CSV missing, ETag cached | Unconditional GET (regression: do not stop at 304 with no file) |
| Local CSV present, GET returns 304 | Does not rewrite disk |
| `force: true` | Unconditional GET always |
| `isAcceptable` | Drops non-`A` `OBS_STATUS`; filters sex/age/urban/cb1 per watchlist (e.g. WGI `_Z` + `WGI_EST`) |
| `refreshContextForIndicator` | `mergeContextRows` replaces rows for one `idno` without touching others in the same tier file |

### `lib/csv.js`

| Test | Expected behaviour |
|------|-------------------|
| `parseCsv` / `rowsToCsv` | Round-trip with quoted values and embedded commas |
| `mergeContextRows` | Removes old rows for `idno`, keeps others, sorts by `(indicator, time_period)` |
| Empty CSV / header only | Does not throw |

### `lib/watchlist.js`

| Test | Expected behaviour |
|------|-------------------|
| `getWatchlist()` | 35 entries, no duplicate `idno` |
| Tier counts | 10 pulse + 16 annual + 9 forecast |
| `getTierFile` | `pulse` → `pulse.csv`, etc. |
| Countries | All entries target D-003 set |

### `bin/fetch-data.js` (light integration)

| Test | Expected behaviour |
|------|-------------------|
| `--probe-only` | Writes `changed-since.json` and `index.json`; no context or CSV download |
| No changes after probe | Logs "nothing to download", exit 0 |
| With changes | Downloads and refreshes only `changed_indicators` |
| Output files | Creates `changed-since.json`, `changed-since-YYYY-MM-DD.json`, `index.json` |

### Tier fetchers (smoke)

| Script | Expected behaviour |
|--------|-------------------|
| Legacy tier fetch (`fetch-baseline.js`, `fetch-pulse.js`, `fetch-forecast.js`) | Removed; use `bin/fetch-data.js` (`npm run fetch`) |

---

## P1 — Detection (D-010)

### `lib/detect/z-score.js`

| Test | Expected behaviour |
|------|-------------------|
| Short series | Ignored when fewer than `window + 1` points |
| Abrupt change | Candidate when \|z\| ≥ threshold on synthetic series |
| Non-numeric | Skipped without throwing |
| `Decimal` | Large / precise `OBS_VALUE` strings parse without float corruption |

### `lib/detect/cross-indicator.js`

| Test | Expected behaviour |
|------|-------------------|
| Regional outlier | Detected vs MAD-based regional median |
| Minimum countries | No candidate when cohort too small |
| Latest period | Correct `time_period` selected across countries |

---

## P1 — Analysis pipeline

### `lib/data-loader.js`

| Test | Expected behaviour |
|------|-------------------|
| Context CSV parsing | Rows keyed by indicator / country / period |
| `pickLatestPerKey` | Keeps latest observation per disaggregation key |

### `lib/analysis/candidate-builder.js`

| Test | Expected behaviour |
|------|-------------------|
| Category assignment | Maps `idno` patterns to UI categories |
| Candidate merge | Joins detection output with watchlist metadata |

### `lib/analysis/context-builder.js`

| Test | Expected behaviour |
|------|-------------------|
| Omnibus sections | Numbered context includes methodology, series, rules, candidates |
| News injection (D-030) | § press discourse; max 8 headlines per country from `data/news/` |
| Token budget | Rough upper bound on headline block size (~1.2k tokens target) |

### `lib/analysis/alert-extractor.js`

| Test | Expected behaviour |
|------|-------------------|
| Fenced ` ```noticia ` / ` ```reportaje ` block | Parsed via `extractJsonObject` (brace-balanced, string-aware) |
| Triple-backticks inside string values | Tolerated; the scanner only counts braces, ignoring the closing fence |
| Truncated response (missing closing fence) | Returns the partial object up to the last balanced brace, or null |
| Invalid JSON | Returns null / error without throwing upstream |
| 0-item parse despite fence-opener present | Raw response persisted to `data/alerts/{idno}.raw.txt` (or `reportaje_{dataset}.raw.txt`) for diagnosis |

### `lib/analysis/narrative-normalizer.js`

| Test | Expected behaviour |
|------|-------------------|
| Bilingual fields | Normalizes `es` / `en` shapes |
| Length / whitespace | Trims per Q4 expectations |

### `lib/analysis/quality-validator.js`

| Test | Expected behaviour |
|------|-------------------|
| Q1 orphan claim | Fails when `claim_id` ∉ context set; failure `notes` field surfaces in console log |
| Q2 schema failure | Reports Ajv errors |
| Q4 | Bilingual fields present + `story` length 250–4000 chars |
| `allowed_claim_ids` literal section | Present in §5 of Noticia context and §7 of Reportaje context |

There is no Q3 in this version.

### `lib/analysis/runner.js` + `bin/generate-analysis.js`

| Test | Expected behaviour |
|------|-------------------|
| `--no-llm` | Writes analysis stub without API call |
| Per-indicator output | `data/analyses/{IDNO}.md` and alert JSON paths |
| Mock `ai-client` | Single call per indicator; cost log prefix optional assert |

---

## P1 — Verification (PCN)

### `lib/pcn-claims.js`

| Test | Expected behaviour |
|------|-------------------|
| `computeClaimId` | Stable for same observation tuple |
| Key sensitivity | Changes when `time_period`, country, or breakdown changes |
| `buildClaimToken` | Matches alert schema shape |

### `lib/pcn-verify.js`

| Test | Expected behaviour |
|------|-------------------|
| Valid tokens | Pass against context claim set |
| Invalid tokens | Structured failure for Q1 |

---

## P1 — News (D-030)

### `lib/news.js`

| Test | Expected behaviour |
|------|-------------------|
| `headlineId` | SHA-1 of normalized URL; dedup on re-ingest |
| `parseGdeltSeendate` | `20260521T201500Z` → ISO UTC |
| `loadHeadlinesForCountry` | Reads `data/news/{COUNTRY}/{YYYY-MM}.jsonl` |
| Country map | Only D-003 codes in `COUNTRY_GDELT` |

### `lib/news-fetch.js`

| Test | Expected behaviour |
|------|-------------------|
| GDELT query | `SOURCELANG:Spanish` + country filter (mock response) |
| Schema | `gdelt_tone`, `indicators_hint`, required headline fields |

### `lib/news-themes.js`

| Test | Expected behaviour |
|------|-------------------|
| Theme helpers | Deterministic output for fixture headlines (if used in pipeline) |

### `bin/fetch-news.js`

| Test | Expected behaviour |
|------|-------------------|
| Idempotent run | Second run does not duplicate URLs in month file |
| `--no-preview` | Exit 0; writes jsonl under `data/news/` |

---

## P1 — HTTP server and views

Extend `test/server.test.js`.

| Test | Expected behaviour |
|------|-------------------|
| `GET /chat` | 200 `text/html`; chat shell present |
| `GET /api/chat` | Wrong method → 405 or documented error |
| Tagline D-006 | `<meta name="description">` contains exact EN phrase from `strings.en.json` |
| `GET /?lang=es` | `html lang="es"` or equivalent |
| `GET /?langMode=both` | Renders without error on monitor route |
| Newsletter UI | `#d360-subscribe-btn`, `#d360-newsletter`, `newsletter-modal.js` served 200 |
| Static traversal | `GET /static/../etc/passwd` → 404 |
| `lib/views.js` | `readFilters`: invalid `variant` → `narr`; `pickLang` / `pickLangMode` |

### `lib/alert-display.js`

| Test | Expected behaviour |
|------|-------------------|
| `formatLastUpdate` | ISO → human-readable label |
| Stale period badge | Triggers when observation older than threshold |

### `lib/router.js`

| Test | Expected behaviour |
|------|-------------------|
| Unknown route | 404 |
| `config/routes.json` | Every `viewName` resolves to `views[viewName]` function |

---

## P1 — Chat (extend `test/chat.test.js`)

| Test | Expected behaviour |
|------|-------------------|
| `lib/chat/agent.js` | One turn with mocked tools / LLM |
| `POST /api/chat` | Integration on ephemeral port; SSE `event:` lines |
| Tools | `read_analysis`, metadata tools, invalid country → `ok: false` |
| `repairSparklineFences` | **Passing** — keep regression |
| `renderMarkdown` + sparkline | Fix fixture; assert `<svg>` and `d360-md-sparkline` |
| `lib/mcp-client.js` | Timeout / connection error surfaces in tool result |

---

## P1 — i18n (extend `test/i18n.test.js`)

| Test | Expected behaviour |
|------|-------------------|
| `newsletter.*` keys | Present in ES and EN |
| Param interpolation | `{name}` replaced; missing param logged once |
| ES tagline | Matches D-006 Spanish variant if defined |

---

## P2 — End-to-end integration (mock HTTP)

| Scenario | What to assert |
|----------|----------------|
| Full mock flow | probe → `changed-since.json` → selective fetch → context updated (no live network) |
| Normal day | Two consecutive probes → second run `changed: 0` |
| Simulated WDI release | One indicator changes → only that idno in context and snapshot |
| `npm run build` smoke | `fetch` → `fetch:news` → `analyze` via `package.json` scripts (no separate detect/narrate bins) |
| `bin/evaluate-mcp.js` | Exit 0 when MCP disabled or mocked |

---

## P2 — Frontend (deferred until runner added)

| Module | Tests needed |
|--------|----------------|
| `static/js/behavior.js` | Country/category filters hide cards; event count updates; URL `history.replaceState` |
| `static/js/detail-panel.js` | Opens from `?alert=` and card click |
| `static/js/newsletter-modal.js` | Open, close, Escape, scrim click |
| `static/js/onboarding.js` | `localStorage` gate; `?onboarding=1` bypass |
| `static/js/lang-toggle.js` | Sets `langMode` query param |
| `static/js/charts.js` | Sparkline render with `D360_SPARKLINE_CACHE` |

Runner options: Playwright (preferred for demo) or jsdom + manual DOM fixtures.

---

## P2 — Phase 2 / roadmap (tests when code exists)

| Module | Tests needed when implemented |
|--------|------------------------------|
| `bin/build-catalog.js` | Dataset merge, dedup, total count |
| `bin/probe-freshness.js` | Concurrency, throttle, partial failure resume |
| Probe → detect wiring | Detection runs only on `changed_indicators` |
| Strategy 2 (narrative–data divergence) | GDELT tone + claim mismatch scoring |
| NiFi / OpenSearch | Out of demo scope; document as manual QA |

---

## P3 — Non-functional

| Test | Expected behaviour |
|------|-------------------|
| `alerts-store` load time | 45 alerts load under loose ms budget |
| `.env.example` | Documents vars used by `ai-client` / fetch without secrets in repo |
| GPL / repo metadata | `package.json` license field matches `LICENSE` |

---

## Suggested implementation order

Completed in repo (2026-05-29): core suites through step 13; routes, static-copy, url-slug, indicators-hub, subscribe API coverage added. Next: Playwright E2E, optional full pipeline integration smoke.

1. ~~Fix regressions~~ — done
2. ~~`alert-schema.test.js`~~ — done
3. ~~`freshness-probe.test.js`~~ — done (DI hooks, not `mock.module`)
4. ~~`freshness-cache.test.js`~~ — done
5. ~~`csv.test.js`~~ — done
6. ~~`context-fetch.test.js`~~ — done
7. ~~`watchlist.test.js`~~ — done
8. ~~`z-score` + `cross-indicator`~~ — done
9. ~~`news.test.js`~~ — done
10. ~~`pcn-claims.test.js`~~ — done
11. ~~`fetch-data.integration.test.js`~~ — done
12. ~~Extend `server.test.js`~~ — done
13. ~~`quality-validator.test.js`~~ — done
14. E2E smoke — pending

---

## Related docs

- [`alert-schema.json`](alert-schema.json) — canonical alert contract under test
- [`data-fetcher-architecture.md`](data-fetcher-architecture.md) — freshness probe design and output schemas
- [`data360-integration-methodology.md`](data360-integration-methodology.md) — API endpoints under test
- [`news-architecture.md`](news-architecture.md) — GDELT ingestion and headline schema
- [`frontend-architecture.md`](frontend-architecture.md) — dashboard routes and client scripts
- [`CLAUDE.md`](../CLAUDE.md) — standing decisions (D-003, D-006, D-009, D-010, D-030)
