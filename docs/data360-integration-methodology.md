# Data360 API Integration Methodology

> **Status**. Draft. Final polish due 2026-05-22.
> Released under CC BY 4.0.

## Endpoints used (Data360 API v3)

| Endpoint | Method | Purpose |
|---|---|---|
| `/data360/searchv2` | POST | Indicator discovery |
| `/data360/metadata` | POST | Full indicator metadata (OData syntax) |
| `/data360/indicators` | GET | List indicators per dataset |
| `/data360/disaggregation` | GET | Available disaggregations |
| `/data360/data` | GET | Observation values (LAC context files) |
| `data360files.worldbank.org/.../data/{DB}/{IND}.csv` | GET / HEAD | Bulk CSV download and freshness probe |

## Freshness detection (Phase 1)

Data360 does not expose a bulk “updated since” feed. The monitor detects upstream changes with **conditional HEAD** on each indicator’s bulk CSV blob.

1. **Probe**. `HEAD` the CSV URL with cached `If-None-Match` / `If-Modified-Since`.
2. **Interpret**. `304` = unchanged. `200` = changed (or first probe).
3. **Report**. Write `data/changed-since.json` with the list of changed `idno` values.
4. **Fetch selectively**. Download CSV snapshots and refresh LAC context only for changed indicators.

The metadata field `series_description.date_last_update` is null for all probed watchlist indicators (2026-05-21). Do not use it for change detection. The reliable signal is the blob `Last-Modified` header.

See [`docs/data-fetcher-architecture.md`](data-fetcher-architecture.md) for schemas, commands, and module map.

## Detection strategies (demo)

1. **Abrupt changes**. Z-score against historical trajectory per `(indicator, country, disaggregation)`.
2. **Cross-indicator anomalies**. Outliers from the regional pattern within the LAC scope.

(To be expanded with example queries, OData syntax, and schema mapping.)
