# Data Fetcher Architecture

> Architecture of the data ingestion layer for `abrimos-data360-monitor`.
> Audience. Contributors building or maintaining the fetcher.

## Goal

Pull historical observations and metadata from Data360 for a curated watchlist of indicators × countries, and feed them into the detection and narrative pipeline. The fetcher is the TeseoETL script that runs the API calls. Its output shape changes depending on the deployment mode.

## Scope

- **Five LAC countries**. Guatemala (GTM), Honduras (HND), Argentina (ARG), Ecuador (ECU), Mexico (MEX).
- **Two indicator-selection modes**.
  - **Static watchlist** (default). 35 demo indicators across three tiers (pulse, annual, forecast). Canonical list in [`lib/watchlist.js`](../lib/watchlist.js). [`connector/watchlist.json`](../connector/watchlist.json) holds the original 20-candidate probe.
  - **Dynamic discovery**. Indicators are not fixed: they are discovered from the Data360 `searchv2` endpoint ranked by `series_description/date_last_update desc`, expanded to indicator codes via `/data360/indicators?datasetId=…`, and treated as a fourth tier (`dynamic`). Implemented in [`lib/dynamic-watchlist.js`](../lib/dynamic-watchlist.js) and driven by [`bin/discover-indicators.js`](../bin/discover-indicators.js).
- **Historical replay only** for the demo. No real-time polling. The continuous monitoring promise lives in the production roadmap.

## Implementation status (Phase 1, 2026-05-22)

| Component | Status |
|---|---|
| `bin/fetch-data.js` | Implemented. Unified entrypoint with freshness probe. |
| `lib/freshness-probe.js` | Implemented. Conditional HEAD over bulk CSVs. |
| `lib/freshness-cache.js` | Implemented. Per-indicator ETag cache on disk. |
| `lib/context-fetch.js` | Implemented. Snapshot download + LAC context refresh via `/data360/data`. |
| `data/changed-since.json` | Implemented. List of indicators updated since last probe. |
| `data/index.json` | Implemented. Per-indicator freshness summary. |
| `bin/build-catalog.js` / `bin/probe-freshness.js` | Roadmap (Phase 2, full ~13k catalog). |
| `bin/discover-indicators.js` / `lib/dynamic-watchlist.js` | Implemented. Dynamic discovery mode — see "Dynamic discovery" below. |
| `bin/fetch-baseline.js`, `fetch-pulse.js`, `fetch-forecast.js` | Legacy tier fetchers. Superseded by `fetch-data.js` for new runs; kept for reference. |
| `examples/freshness-probe-demo.js` | Standalone spike used to validate HEAD/ETag behaviour before integration. |

## Two deployment modes

The same TeseoETL fetcher script is used in both modes. Only the output destination and downstream wiring change.

### Production mode (roadmap)

```
Apache NiFi (scheduler)
   │
   │  invokes
   ▼
TeseoETL fetcher script
   │
   │  exports JSONlines per indicator
   ▼
NiFi pipeline
   │
   │  reads, normalises, indexes
   ▼
OpenSearch
   │
   │  queries
   ▼
Detection and narrative pipeline
```

NiFi schedules and triggers the TeseoETL fetcher. The fetcher writes one JSONlines file per indicator. NiFi picks those files up, normalises the records against the canonical schema, and indexes them into OpenSearch. Downstream steps (detection, narrative, dashboard) read from OpenSearch.

### Demo mode (what runs on 31 May 2026)

```
TeseoETL fetcher script (manual run)
   │
   │  writes local CSV per indicator
   ▼
data/snapshots/{INDICATOR}.csv
   │
   │  fed directly to LLM step
   ▼
LLM narrative (one call per indicator)
   │
   ▼
data/alerts.json
   │
   ▼
Static dashboard
```

No NiFi. No OpenSearch. No queue. The fetcher writes a local CSV per indicator. The LLM step ingests that CSV directly together with the metadata document. The output of the pipeline is a static `data/alerts.json` that the dashboard reads on load. This keeps the demo deterministic, cheap, and reproducible without infrastructure.

## Components (demo mode)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   bin/fetch-data.js  (TeseoETL entrypoint, demo mode)            │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  watchlist (lib/watchlist.js)                            │   │
│   │  35 indicators × 3 tiers × 5 LAC countries             │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  freshnessProbe (lib/freshness-probe.js)                 │   │
│   │  HEAD bulk CSV with If-None-Match / If-Modified-Since    │   │
│   │     ├─ 304 Not Modified → unchanged since last probe     │   │
│   │     └─ 200 OK → changed (or first probe, no cache yet)   │   │
│   │  writes data/snapshots/{INDICATOR}.etag                  │   │
│   │  writes data/changed-since.json                          │   │
│   │  writes data/index.json                                  │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼  (only changed indicators, unless --force)             │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  csvFetcher (lib/context-fetch.js)                       │   │
│   │  GET bulk CSV         → data/snapshots/{INDICATOR}.csv   │   │
│   │  GET data dict CSV    → data/snapshots/{IDNO}_DATADICT.csv│   │
│   │  GET metadata JSON    → data/snapshots/{IDNO}.meta.json  │   │
│   │  POST /data360/metadata → indicators/*.md (when in WL)   │   │
│   │  GET /data360/data per country → context/{CC}/{tier}.csv │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The LLM step (`bin/generate-analysis.js` → `lib/analysis/runner.js`) consumes raw CSVs and indicator metadata directly. No intermediate normalised JSON file is produced in demo mode. Normalisation rules below apply at LLM-prompt-construction time.

**Context tiers for analysis and PCN** (`CONTEXT_TIERS` in `lib/data-loader.js`): `annual.csv`, `forecast.csv`, `dynamic.csv`. The legacy `pulse.csv` (Tier 1 sub-annual from the static watchlist) is still written by fetch scripts but **excluded** from detection, LLM context, and PCN verification — it duplicated rows for some datasets (e.g. IMF BOP) and shadowed `dynamic.csv`. Default Noticia runs use only `dynamic.csv` (`NOTICIA_TIERS`); pass `--all-tiers` to `generate-analysis.js` to widen detection to all three context tiers.

## Dynamic discovery

The static watchlist guarantees demo reproducibility but is, by design, narrow. Dynamic discovery widens coverage without hand-maintaining a list:

1. **Search** `/data360/searchv2` ordered by `series_description/date_last_update desc` to surface datasets that the World Bank has recently republished.
2. **Expand** each surviving `dataset_id` to indicator codes via `GET /data360/indicators?datasetId={dataset_id}`. The codes returned are the canonical `idno` values used for everything downstream — they are **not** re-prefixed with the database id (see "URL convention" below).
3. **Persist** the resulting list to `data/dynamic-watchlist.json` so the fetcher and the analysis runner share one source of truth for the run.
4. **Fetch** via the same `csvFetcher` plus the data-dictionary and metadata downloads (see below). Dynamic indicators land in `data/context/{COUNTRY}/dynamic.csv`.

Entry points:

```bash
npm run discover                 # populate data/dynamic-watchlist.json
npm run pipeline:dynamic         # discover → fetch (probe-respecting) → analyze
npm run pipeline:dynamic:force   # same, but pass --force to bypass the ETag cache
```

The `:force` variant is the right tool when you have just changed disaggregation or filter rules and want a clean re-download regardless of `Last-Modified`.

### Per-indicator data dictionaries and metadata

For every indicator that actually gets used (static or dynamic), `bin/fetch-data.js` downloads two side files alongside the bulk CSV:

| Path | Source | Purpose |
|---|---|---|
| `data/snapshots/{IDNO}_DATADICT.csv` | blob host (`data360files.worldbank.org`, same path as the CSV) | Data dictionary, injected into the LLM omnibus context (capped at 80 lines, or 20 lines for small models) |
| `data/snapshots/{IDNO}.meta.json` | metadata blob host | Full indicator metadata document. Used as the fallback when a dynamic indicator has no static-watchlist entry to build human-readable metadata from |

Both are cached with the same ETag mechanism as the CSV.

### URL convention

The bulk CSV URL is constructed as:

```
{BLOB_BASE}/{databaseId}/{idno}.csv
```

The `idno` is used **verbatim** as returned by `listIndicators` — there is no secondary "prefix with `databaseId`" step. The static watchlist appears to follow such a convention only because its `idno` values already match what `listIndicators` returns (e.g. `WB_WDI_FP_CPI_TOTL_ZG` is the indicator's actual id under the `WB_WDI` database). Dynamic discovery uses the same rule. Re-prefixing breaks URLs.

## Components (production mode)

The same fetcher is invoked by NiFi instead of by a human. It runs once per indicator and writes a JSONlines file (one observation per line) instead of a CSV. NiFi reads each `.jsonl`, applies the same normalisation rules, and pushes the records to OpenSearch with the observation key as `_id` (see "Observation key" below). Detection runs against OpenSearch.

## On-disk layout (demo mode)

```
data/
  changed-since.json               # latest: indicators updated since last probe
  changed-since-YYYY-MM-DD.json    # dated copy of the same report
  index.json                       # all watchlist indicators + changed_this_run flag
  dynamic-watchlist.json           # discovery output (when dynamic mode is used)
  snapshots/
    _probe-state.json              # last_probe_at timestamp for the watchlist
    {INDICATOR}.csv                # raw bulk CSV from data360files.worldbank.org
    {INDICATOR}.etag               # cached ETag and Last-Modified for conditional HEAD
    {INDICATOR}.meta.json          # full metadata document from the metadata blob host
    {INDICATOR}_DATADICT.csv       # per-indicator data dictionary (blob host)
  context/{COUNTRY}/
    pulse.csv                      # Tier 1 sub-annual (legacy fetch; not used by analysis/PCN)
    annual.csv                     # Tier 2 annual
    forecast.csv                   # Tier 3 IMF WEO + WB MPO
    dynamic.csv                    # Tier 4 discovered-by-search (dynamic mode)
  indicators/{INDICATOR}.md        # human-readable metadata for LLM context
  alerts.json                      # final output consumed by the dashboard
```

All paths under `data/` are gitignored except `index.json`, `changed-since.json`, and `alerts.json`, which are small and useful for reproducibility.

## Commands

```bash
npm run fetch              # probe + download changed + refresh LAC context
npm run fetch:probe        # probe only (fast, ~2 s for 35 indicators)
node bin/fetch-data.js --force   # bypass the ETag cache (bootstrap / forced refresh)
npm run discover           # populate data/dynamic-watchlist.json from /searchv2
npm run pipeline:dynamic   # discover → fetch → analyze (dynamic mode)
npm run pipeline:dynamic:force  # same but with --force on the fetch step
```

`--force` skips the conditional HEAD entirely and re-downloads the CSV, data dictionary, and metadata for every indicator in the active watchlist, regardless of `If-None-Match` / `If-Modified-Since`.

Typical workflow.

1. **First run** (no ETag cache). All indicators appear in `changed-since.json`. Snapshots and context files are populated.
2. **Daily probe**. `npm run fetch:probe` returns `changed: 0` when Data360 has not republished any CSV.
3. **Incremental fetch**. `npm run fetch` downloads and refreshes context only for indicators listed in `changed_indicators`.

## How to know which indicators changed

There is no Data360 API endpoint that returns “updated since X” for the full catalog. The fetcher compares each indicator’s bulk CSV blob against a local cache.

| HTTP response | Meaning |
|---|---|
| **304 Not Modified** | CSV unchanged since last probe. Skip download. |
| **200 OK** | CSV changed (or first probe with no cache). Include in `changed-since.json`. |

Read `data/changed-since.json`. The field `changed_indicators` is the work list for downstream fetch and detection. The field `since` holds the timestamp of the previous successful probe (`null` on first run).

On first run, every indicator is marked changed (`first_probe: true`). From the second run onward, only indicators whose blob timestamp or ETag differs from the cache appear.

## Output schemas

### `data/changed-since.json`

Report of indicators that changed in this probe. When nothing changed, `changed_indicators` and `indicators` are empty arrays.

```json
{
  "probed_at": "2026-05-22T01:04:00.323Z",
  "since": "2026-05-21T12:00:00.000Z",
  "elapsed_ms": 1368,
  "total_probed": 35,
  "changed": 2,
  "unchanged": 33,
  "errors": 0,
  "force": false,
  "changed_indicators": ["WB_WDI_FP_CPI_TOTL_ZG", "IPC_IPC_PHASE"],
  "indicators": [
    {
      "idno": "WB_WDI_FP_CPI_TOTL_ZG",
      "database_id": "WB_WDI",
      "tier": "annual",
      "label": "Inflation, CPI annual %",
      "status": 200,
      "first_probe": false,
      "last_modified": "Mon, 13 Apr 2026 05:01:39 GMT",
      "previous_last_modified": "Mon, 01 Apr 2026 05:01:39 GMT",
      "previous_probed_at": "2026-05-21T12:00:00.000Z",
      "csv_url": "https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_FP_CPI_TOTL_ZG.csv"
    }
  ]
}
```

### `data/index.json`

Full watchlist with a freshness flag per indicator. Used by the dashboard “last updated” panel.

```json
{
  "generated_at": "2026-05-22T01:04:00.323Z",
  "since": "2026-05-21T12:00:00.000Z",
  "total": 35,
  "changed_count": 2,
  "indicators": [
    {
      "idno": "WB_WDI_FP_CPI_TOTL_ZG",
      "database_id": "WB_WDI",
      "tier": "annual",
      "label": "Inflation, CPI annual %",
      "changed_this_run": true,
      "first_probe": false,
      "last_modified": "Mon, 13 Apr 2026 05:01:39 GMT",
      "etag": "0x8DE994677D56A42",
      "csv_url": "https://data360files.worldbank.org/..."
    }
  ]
}
```

### `data/snapshots/{INDICATOR}.etag`

```json
{
  "etag": "0x8DE994677D56A42",
  "lastModified": "Mon, 13 Apr 2026 10:21:47 GMT",
  "probedAt": "2026-05-22T01:04:00.323Z",
  "csv_url": "https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_NY_GDP_PCAP_CD.csv"
}
```

## Module map

| Module | Role |
|---|---|
| [`bin/fetch-data.js`](../bin/fetch-data.js) | CLI entrypoint. Orchestrates probe, download (CSV + data dictionary + metadata JSON), context refresh. |
| [`bin/discover-indicators.js`](../bin/discover-indicators.js) | Dynamic discovery CLI. Writes `data/dynamic-watchlist.json`. |
| [`lib/watchlist.js`](../lib/watchlist.js) | Canonical 35-indicator static watchlist and tier file names. |
| [`lib/dynamic-watchlist.js`](../lib/dynamic-watchlist.js) | Discover-by-search and dataset-to-indicator expansion. Treats results as the `dynamic` tier. |
| [`lib/freshness-probe.js`](../lib/freshness-probe.js) | HEAD loop, builds `changed-since` and `index` reports. |
| [`lib/freshness-cache.js`](../lib/freshness-cache.js) | Read/write `.etag` files and `_probe-state.json`. |
| [`lib/context-fetch.js`](../lib/context-fetch.js) | Bulk CSV download, metadata + data-dictionary cache, LAC context via API. |
| [`lib/data360-client.js`](../lib/data360-client.js) | `headCsv`, `getCsv`, `csvUrl`, `getMetadata`, `getData`, `listIndicators`, `searchv2`. |

## Endpoints used

| Endpoint | Method | Purpose |
|---|---|---|
| `/data360/searchv2` | POST | Indicator/dataset search (used by dynamic discovery, ordered by `series_description/date_last_update desc`) |
| `/data360/metadata` | POST | Full indicator metadata (OData `$filter` by `idno`) |
| `/data360/indicators?datasetId=…` | GET | Expand a dataset to indicator codes (used by dynamic discovery; returns the canonical `idno`) |
| `data360files.worldbank.org/data360-data/data/{DB_ID}/{INDICATOR}.csv` | GET / HEAD | Bulk CSV with `ETag` and `Last-Modified`. Same prefix serves `{INDICATOR}_DATADICT.csv` |
| metadata blob host | GET | Per-indicator `.meta.json` document |
| `/data360/data` | GET | LAC-filtered observations written to `data/context/{COUNTRY}/{tier}.csv` |

Freshness detection uses the **blob host** (`data360files.worldbank.org`). LAC context files use the **REST API** (`data360api.worldbank.org`). The documented rate limit of 5,000 req/min per IP applies to the API, not to blob HEAD requests.

## Conditional GETs

The bulk CSV server (Azure Blob Storage behind a CDN) returns standard `ETag` and `Last-Modified` headers and honours `If-Modified-Since`. The fetcher stores both values per file and reuses them on subsequent runs:

```
HEAD csv_link
  If-Modified-Since: {cached Last-Modified}
  If-None-Match: {cached ETag}

→ 304 Not Modified  ⇒  skip download (unless local `.csv` is missing)
→ 200 OK            ⇒  download full CSV, refresh ETag cache
```

If the probe returns 200 and caches the ETag, but the local snapshot file does not exist yet, the downloader issues an unconditional GET to retrieve the body. This handles the first-run case where HEAD establishes the cache before the CSV is on disk.

This makes the fetcher safe to rerun on every iteration without wasting bandwidth.

## Normalisation rules

The raw CSV uses the SDMX-flavoured Data360 schema. The normaliser applies these rules before passing rows downstream:

| Field | Rule |
|---|---|
| `OBS_VALUE` | Parse as `Decimal` (decimal.js). Never `Number`. values can exceed safe-integer precision. |
| `OBS_STATUS` | Keep only `"A"` (Approved). Drop provisional, estimated and revised flags from detection. |
| `OBS_CONF` | Keep only `"PU"` (Public). |
| `REF_AREA` | Keep only rows where the country is in the watchlist. |
| `SEX`, `AGE`, `URBANISATION` | If we are computing totals, keep `"_T"`. If we are looking at a specific cut, drop `"_Z"` (not applicable) and `"_T"`. |
| `COMP_BREAKDOWN_1..3` | Keep all values. Their semantics are indicator-specific, treat them as part of the observation key. The `isAcceptable` check in `lib/context-fetch.js` uses loose equality (`!= null`) for `expectedCb1`, so dynamic entries that declare no expectation are not filtered out. |
| `TIME_PERIOD` | Normalise to ISO 8601 prefix (YYYY, YYYY-MM, YYYY-MM-DD) depending on `FREQ`. |

## Observation key

The canonical primary key for an observation is the tuple:

```
(DATABASE_ID, INDICATOR, REF_AREA, TIME_PERIOD,
 SEX, AGE, URBANISATION,
 COMP_BREAKDOWN_1, COMP_BREAKDOWN_2, COMP_BREAKDOWN_3,
 UNIT_MEASURE, FREQ)
```

A SHA-256 hash of this tuple is used as `claim_id` for PCN claim-bound tokens.

## Pre-selected watchlist (20 candidates)

To be narrowed down to 10 finals after verifying real coverage in the five LAC countries. Grouped by thematic axis.

### Macroeconomy and debt

| Indicator | Idno | What it measures | Why it matters |
|---|---|---|---|
| GDP per capita, current USD | `WB_WDI_NY_GDP_PCAP_CD` | Nominal GDP divided by population | Baseline for development level, easy abrupt changes |
| GDP growth, annual % | `WB_WDI_NY_GDP_MKTP_KD_ZG` | Year-on-year real GDP change | Captures recessions and rebounds |
| Inflation, CPI annual % | `WB_WDI_FP_CPI_TOTL_ZG` | Headline inflation | Critical in LAC, Argentina especially exposed |
| Central government debt, % of GDP | `WB_WDI_GC_DOD_TOTL_GD_ZS` | Stock of central government debt over GDP | Fiscal sustainability axis |
| Foreign direct investment, inflows % of GDP | `WB_WDI_BX_KLT_DINV_WD_GD_ZS` | Net FDI inflows | Investor confidence, cross-country outliers |
| Current account balance, % of GDP | `WB_WDI_BN_CAB_XOKA_GD_ZS` | External balance | Detects balance-of-payments stress |

### Poverty and inequality

| Indicator | Idno | What it measures | Why it matters |
|---|---|---|---|
| Gini index | `WB_WDI_SI_POV_GINI` | Income inequality coefficient | Sparse coverage in LAC but high journalistic value |
| Poverty headcount at $2.15/day | `WB_WDI_SI_POV_DDAY` | % of population below extreme poverty line | Sensitive to crises |
| Poverty headcount at $3.65/day | `WB_WDI_SI_POV_LMIC` | % below lower-middle-income poverty line | More sensitive in middle-income countries |
| IPC food-insecurity phase population | `IPC_IPC_PHASE` | People in each IPC food-insecurity phase | Monthly updates. The only non-WDI in the list. proves the pipeline works on any dataset |

### Education

| Indicator | Idno | What it measures | Why it matters |
|---|---|---|---|
| Primary enrolment, gross % | `WB_WDI_SE_PRM_ENRR` | Gross enrolment ratio, primary | Basic coverage indicator |
| Secondary enrolment, gross % | `WB_WDI_SE_SEC_ENRR` | Gross enrolment ratio, secondary | The educational gap shows here in LAC |
| Public spending on education, % of GDP | `WB_WDI_SE_XPD_TOTL_GD_ZS` | Government education expenditure | Common narrative-vs-data gap |

### Health

| Indicator | Idno | What it measures | Why it matters |
|---|---|---|---|
| Maternal mortality ratio | `WB_WDI_SH_STA_MMRT` | Deaths per 100k live births | Sensitive to health-system quality |
| Under-five mortality | `WB_WDI_SH_DYN_MORT` | Deaths per 1k live births under age five | Structural and comparable |
| Health expenditure, % of GDP | `WB_WDI_SH_XPD_CHEX_GD_ZS` | Total health spending | Cross-check against health outcomes |

### Gender and labour

| Indicator | Idno | What it measures | Why it matters |
|---|---|---|---|
| Female labour-force participation, 15+ | `WB_WDI_SL_TLF_CACT_FE_ZS` | Female participation rate | Gender axis, high regional variation |
| Unemployment, total | `WB_WDI_SL_UEM_TOTL_ZS` | % of labour force | Cyclical abrupt changes |

### Governance

| Indicator | Idno | What it measures | Why it matters |
|---|---|---|---|
| Government effectiveness | `WB_WDI_GE_EST` | WGI government effectiveness estimate | Typically low media coverage. good "orphan" candidate |
| Control of corruption | `WB_WDI_CC_EST` | WGI control of corruption estimate | Annual, reflects institutional perception |

> **Probe verified 2026-05-21.** All 20 indicators exist. The two governance indicators (`GE_EST`, `CC_EST`) are exposed under `WB_WDI`, not under a separate WGI database. See `bin/probe-indicators.py` and `connector/watchlist.json` for the live findings.

## Probe results (2026-05-21)

Run `python3 bin/probe-indicators.py` to refresh. Snapshot of the 20 candidates against the five LAC countries:

| Property | Finding |
|---|---|
| Indicators that exist | 20 of 20 |
| Annual periodicity | 19 of 20 |
| Monthly periodicity | 1 of 20 (`IPC_IPC_PHASE`) |
| Last data point range | 2023 to 2025-11 |
| Full LAC coverage (5 of 5 countries) | 18 of 20 |
| Limited coverage | `WB_WDI_GC_DOD_TOTL_GD_ZS` (only GTM and MEX), `IPC_IPC_PHASE` (only ECU, GTM, HND) |
| License `CC BY-4.0` | 19 of 20 |
| License `CC BY-NC-SA 3.0 IGO` | 1 of 20 (`IPC_IPC_PHASE`, non-commercial) |
| `date_last_update` populated | 0 of 20 |

Implications.

- **Change detection cannot rely on `date_last_update`.** Use the HTTP `Last-Modified` header of the bulk CSV instead.
- **Government debt indicator needs a replacement** with better LAC coverage. `WB_CCDFS` (Cross-Country Database of Fiscal Space) is the natural place to look.
- **IPC's non-commercial license** needs handling in the sustainability plan if the project pursues commercial distribution.

## Selection criteria for the final 10

1. Confirmed coverage in all five watchlist countries (check `ref_country` in metadata).
2. At least 8 historical data points to make z-score meaningful.
3. Thematic diversity. at most 2 to 3 indicators per axis.
4. License compatible with journalistic reuse (prefer CC BY, handle NC carefully).
5. Keep `IPC_IPC_PHASE` regardless. it is the non-WDI proof of generality.

## Failure modes the fetcher must handle

| Failure | Behaviour |
|---|---|
| Indicator does not exist | Log warning, skip, do not abort the batch |
| Country has no observations for indicator | Record empty coverage in `index.json`, continue |
| CSV server returns 5xx | Retry once with exponential backoff, then skip |
| CSV server returns 304 | Skip download, keep existing snapshot |
| Metadata field is null | Tolerate, the normaliser produces a partial record |
| `OBS_VALUE` is not numeric | Drop the row, log at debug level |

## Outputs consumed downstream

In demo mode.

- `data/changed-since.json`. Indicators updated since the last probe. Input for selective re-fetch and re-detection.
- `data/index.json`. Per-indicator freshness summary for the dashboard.
- `data/snapshots/{INDICATOR}.csv`. Raw bulk observations (global, all countries).
- `data/snapshots/{INDICATOR}.meta.json`. Metadata document consumed alongside the CSV.
- `data/context/{COUNTRY}/{tier}.csv`. LAC-filtered observations used by detection and LLM context.

In production mode.

- `data/jsonl/{INDICATOR}.jsonl`. One observation per line, ingested by NiFi, normalised, and pushed to OpenSearch.
- OpenSearch index `data360_observations` and `data360_metadata` become the canonical store. Detection and narrative read from there, not from local files.

## Rate limits

Confirmed during the 2026-05-21 office hour with the World Bank team. **5,000 requests per minute per IP** on `data360api.worldbank.org`. The demo watchlist (35 indicators × 5 countries) stays well below this.

Blob HEAD probes (`data360files.worldbank.org`) use a separate CDN infrastructure. Measured throughput for WDI-scale batches is ~30–50k HEADs/min with concurrency 50–100. Phase 2 will add throttling when probing the full ~13k catalog.

## Production roadmap (Phase 2 and beyond)

- `bin/build-catalog.js`. Enumerate all indicators via `GET /data360/indicators` per dataset → `data/catalog.json`.
- `bin/probe-freshness.js`. Parallel HEAD over the full catalog → `data/changed-since.json`.
- Wire probe output into detection so only changed indicators are re-analysed.
- Wire the TeseoETL fetcher into Apache NiFi as a scheduled processor.
- Define the NiFi flow that ingests JSONlines, normalises records, and pushes them to OpenSearch.
- Subscribe to a future webhook channel if the World Bank publishes one.
- Maintain a versioned audit log of observation revisions inside OpenSearch.
