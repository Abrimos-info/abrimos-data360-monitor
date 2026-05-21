# Worldwide Governance Indicators: Control of Corruption

> Control of corruption

## Identification

- **idno**: `GOV_WGI_CC`
- **database_id**: `WB_WGI`
- **database**: Worldwide Governance Indicators (WGI)
- **periodicity**: Annual
- **unit**: Unitless
- **confidentiality**: PU

## License

- **name**: unspecified

## Links

- **csv**: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_CC.csv
- **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WGI/GOV_WGI_CC.json
- **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WGI&INDICATOR=GOV_WGI_CC
- **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WGI

## Definition

Control of Corruption (CC) captures perceptions of the extent to which public power is used for private gain, including both petty and grand corruption, as well as capture of the state by elites and private interests.

## Methodology

The following are the key steps:
STEP 1:  Assigning indicators from the underlying sources to the six governance dimensions.  Individual questions or variables from the underlying data sources are mapped to up to two of the six governance dimensions.
STEP 2:  Rescaling the individual source data to range from 0 to 1.  Each question from the underlying data sources is rescaled to range from 0 to 1, with higher values corresponding to better governance outcomes.
STEP 3:  Using an Unobserved Components Model to construct a governance estimate for each dimension by taking a weighted average of the source-by-dimension data. To aggregate data across multiple sources, the WGI uses a statistical technique known as an Unobserved Components Model (UCM).
STEP 4:  Transforming the UCM-generated governance estimates to a 0–100 absolute governance score. The WGI transform the governance estimates for each country, year, and dimension—typically ranging from approximately –2.5 to 2.5 —into absolute scores on a 0–100 scale, with 100 representing the best absolute governance performance.

The following is a summary of the methodology:
https://www.worldbank.org/en/publication/worldwide-governance-indicators/documentation#3
The following is detailed description of the methodology:
https://www.worldbank.org/content/dam/sites/govindicators/doc/The%20Worldwide%20Governance%20Indicators%202025%20Methodology%20Revision.pdf

## Sources

- Worldwide Governance Indicators (WGI) (https://datacatalog.worldbank.org/search/dataset/0038026/Worldwide-Governance-Indicators)

## Topics

- Prosperity _(WB Practice Groups)_
- Institutions _(Data360 Topic L1)_
- Public Institutions _(Data360 Topic L2)_
