# Data Fetcher Architecture

> Architecture of the data ingestion layer for `abrimos-data360-monitor`.
> Audience. Contributors building or maintaining the fetcher.

## Goal

Pull historical observations and metadata from Data360 for a curated watchlist of indicators × countries, and feed them into the detection and narrative pipeline. The fetcher is the TeseoETL script that runs the API calls. Its output shape changes depending on the deployment mode.

## Scope

- **Five LAC countries**. Guatemala (GTM), Honduras (HND), Argentina (ARG), Ecuador (ECU), Mexico (MEX).
- **20 pre-selected indicators** (see table below) to be narrowed down to 10 in the next iteration.
- **Historical replay only** for the demo. No real-time polling. The continuous monitoring promise lives in the production roadmap.

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
│   │  watchlist                                               │   │
│   │  connector/watchlist.json  →  (countries[], indicators[])│   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  metadataFetcher                                         │   │
│   │  POST /data360/metadata (no $select, full document)      │   │
│   │  writes data/snapshots/{INDICATOR}.meta.json             │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  csvFetcher                                              │   │
│   │  HEAD {csv_link} with If-Modified-Since                  │   │
│   │     ├─ 304 Not Modified → skip                           │   │
│   │     └─ 200 OK → GET full CSV                             │   │
│   │  writes data/snapshots/{INDICATOR}.csv                   │   │
│   │  writes data/snapshots/{INDICATOR}.etag                  │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  index.json                                              │   │
│   │  Per-indicator summary. Time range, country coverage,    │   │
│   │  observation count, last fetch timestamp, content hash.  │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The LLM step (`bin/narrate-indicators.js`) consumes the raw CSV and the metadata JSON directly. No intermediate normalised JSON file is produced in demo mode. Normalisation rules below apply at LLM-prompt-construction time.

## Components (production mode)

The same fetcher is invoked by NiFi instead of by a human. It runs once per indicator and writes a JSONlines file (one observation per line) instead of a CSV. NiFi reads each `.jsonl`, applies the same normalisation rules, and pushes the records to OpenSearch with the observation key as `_id` (see "Observation key" below). Detection runs against OpenSearch.

## On-disk layout (demo mode)

```
data/
  snapshots/
    {INDICATOR}.csv                # raw CSV from data360files.worldbank.org
    {INDICATOR}.etag               # cached ETag and Last-Modified for conditional GETs
    {INDICATOR}.meta.json          # full metadata document
  alerts.json                      # final output consumed by the dashboard
  index.json                       # per-indicator summary
```

All paths under `data/` are gitignored except `index.json` and `alerts.json`, which are small and useful for reproducibility.

## Endpoints used

| Endpoint | Method | Purpose |
|---|---|---|
| `/data360/metadata` | POST | Full indicator metadata (OData `$filter` by `idno`) |
| `/data360/indicators?datasetId=…` | GET | Verify indicators exist within a dataset |
| `data360files.worldbank.org/data360-data/data/{DB_ID}/{INDICATOR}.csv` | GET / HEAD | Bulk CSV with `ETag` and `Last-Modified` |

The fetcher does **not** call `/data360/data` for the demo. bulk CSVs are far cheaper and contain the same observations.

## Conditional GETs

The bulk CSV server (Azure Blob Storage behind a CDN) returns standard `ETag` and `Last-Modified` headers and honours `If-Modified-Since`. The fetcher stores both values per file and reuses them on subsequent runs:

```
HEAD csv_link
  If-Modified-Since: {cached Last-Modified}
  If-None-Match: {cached ETag}

→ 304 Not Modified  ⇒  skip download
→ 200 OK            ⇒  download full CSV, refresh ETag cache
```

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
| `COMP_BREAKDOWN_1..3` | Keep all values. Their semantics are indicator-specific, treat them as part of the observation key. |
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

> **Note for the implementer.** The two WGI indicators may live under a database other than `WB_WDI`. Resolve their real `database_id` via `/data360/searchv2` before adding them to the production watchlist.

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

- `data/snapshots/{INDICATOR}.csv`. Raw observations consumed directly by the LLM step (`bin/narrate-indicators.js`).
- `data/snapshots/{INDICATOR}.meta.json`. Metadata document consumed alongside the CSV.
- `data/index.json`. Per-indicator summary used by the dashboard's last-updated panel.

In production mode.

- `data/jsonl/{INDICATOR}.jsonl`. One observation per line, ingested by NiFi, normalised, and pushed to OpenSearch.
- OpenSearch index `data360_observations` and `data360_metadata` become the canonical store. Detection and narrative read from there, not from local files.

## Rate limits

Confirmed during the 2026-05-21 office hour with the World Bank team. **5,000 concurrent requests per minute per IP**. The fetcher does not need throttling for the demo scope (20 indicators × 5 countries).

## Production roadmap (out of scope for the demo)

- Wire the TeseoETL fetcher into Apache NiFi as a scheduled processor.
- Define the NiFi flow that ingests JSONlines, normalises records, and pushes them to OpenSearch.
- Subscribe to a future webhook channel if the World Bank publishes one.
- Maintain a versioned audit log of observation revisions inside OpenSearch.
