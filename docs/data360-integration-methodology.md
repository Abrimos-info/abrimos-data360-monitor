# Data360 API Integration Methodology

> **Status**. Placeholder. Final draft due 2026-05-22.
> Released under CC BY 4.0.

## Endpoints used (Data360 API v3)

| Endpoint | Method | Purpose |
|---|---|---|
| `/data360/searchv2` | POST | Indicator discovery |
| `/data360/metadata` | POST | Full indicator metadata (OData syntax) |
| `/data360/indicators` | GET | List indicators per dataset |
| `/data360/disaggregation` | GET | Available disaggregations |
| `/data360/data` | GET | Observation values |
| `data360files.worldbank.org/...csv` | GET | Bulk CSV download |

## Detection strategies (demo)

1. **Abrupt changes**. Z-score against historical trajectory per `(indicator, country, disaggregation)`.
2. **Cross-indicator anomalies**. Outliers from the regional pattern within the LAC scope.

(To be expanded with example queries, OData syntax, and schema mapping.)
