# Data360 API Integration Methodology

> **Status**. Draft. Final polish due 2026-05-22.
> Released under CC BY 4.0.

## Endpoints used (Data360 API v3)

| Endpoint | Method | Purpose |
|---|---|---|
| `/data360/searchv2` | POST | Indicator discovery (also used by dynamic-watchlist mode, ordered by `series_description/date_last_update desc`) |
| `/data360/metadata` | POST | Full indicator metadata (OData syntax) |
| `/data360/indicators` | GET | List indicators per dataset. Returns the canonical `idno` used verbatim in URLs (never re-prefixed with the database id) |
| `/data360/disaggregation` | GET | Available disaggregations |
| `/data360/data` | GET | Observation values (LAC context files) |
| `data360files.worldbank.org/.../data/{DB}/{IND}.csv` | GET / HEAD | Bulk CSV download and freshness probe. The same prefix also serves `{IND}_DATADICT.csv` |

### URL convention

The bulk CSV URL is `{BLOB_BASE}/{databaseId}/{idno}.csv`, with `idno` used exactly as returned by `listIndicators`. The static watchlist happens to use idnos that start with the database id (e.g. `WB_WDI_*` under `WB_WDI`), but this is a property of the values the API returns, not a separate convention. Dynamic discovery follows the same rule. See `csvUrl` in [`lib/data360-client.js`](../lib/data360-client.js).

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
