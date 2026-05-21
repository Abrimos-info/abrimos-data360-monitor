# Data Fetcher Architecture

> Architecture of the data ingestion layer for `abrimos-data360-monitor`.
> Audience: contributors building or maintaining the fetcher.

## Goal

Pull historical observations and metadata from Data360 for a curated watchlist of indicators × countries, store them locally as canonical snapshots, and produce the inputs required by the detection pipeline. The fetcher is designed to be re-run idempotently and to skip downloads when the upstream file has not changed.

## Scope

- **Five LAC countries:** Guatemala (GTM), Honduras (HND), Argentina (ARG), Ecuador (ECU), Mexico (MEX).
- **20 pre-selected indicators** (see table below) to be narrowed down to 10 in the next iteration.
- **Historical replay only** for the demo. No real-time polling. The "continuous monitoring" promise lives in the production roadmap.

## Components

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   bin/fetch-data.js  (entrypoint)                                │
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
│   │  POST /data360/metadata (no $select → full document)     │   │
│   │  → data/snapshots/{INDICATOR}.meta.json                  │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  csvFetcher                                              │   │
│   │  HEAD {csv_link} with If-Modified-Since                  │   │
│   │     ├─ 304 Not Modified → skip                           │   │
│   │     └─ 200 OK → GET full CSV                             │   │
│   │  → data/snapshots/{INDICATOR}.csv                        │   │
│   │  → data/snapshots/{INDICATOR}.etag                       │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  normaliser                                              │   │
│   │  - cast OBS_VALUE → Decimal                              │   │
│   │  - filter OBS_STATUS != "A"                              │   │
│   │  - drop rows where any required disagg = "_Z"            │   │
│   │  - tag rows where any disagg = "_T" (totals)             │   │
│   │  - filter REF_AREA to watchlist countries                │   │
│   │  → data/normalised/{INDICATOR}.json                      │   │
│   └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  index.json                                              │   │
│   │  Per-indicator summary: time range, country coverage,    │   │
│   │  observation count, last fetch timestamp, content hash   │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## On-disk layout

```
data/
  snapshots/
    {INDICATOR}.csv                # raw CSV from data360files.worldbank.org
    {INDICATOR}.etag               # cached ETag + Last-Modified for conditional GETs
    {INDICATOR}.meta.json          # full metadata document
  normalised/
    {INDICATOR}.json               # cleaned, decimal-cast rows for the demo countries
  index.json                       # per-indicator summary
```

All paths under `data/` are gitignored except `index.json`, which is small and useful for reproducibility.

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

- `data/normalised/{INDICATOR}.json`. input for the detection step (`bin/detect-changes.js`)
- `data/snapshots/{INDICATOR}.meta.json`. input for the narrative step (`bin/narrate-indicators.js`)
- `data/index.json`. summary used by the dashboard's "Last updated" panel

## Rate limits

Confirmed during the 2026-05-21 office hour with the World Bank team: **5,000 concurrent requests per minute per IP**. The fetcher does not need throttling for the demo scope (20 indicators × 5 countries).

## Production roadmap (out of scope for the demo)

- Replace the local cron-style runner with an Apache NiFi flow.
- Push normalised observations into OpenSearch instead of flat JSON.
- Subscribe to a future webhook channel if the World Bank publishes one.
- Maintain a versioned audit log for every observation update.
