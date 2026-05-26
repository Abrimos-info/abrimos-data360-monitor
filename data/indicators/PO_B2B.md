# Business-to-business postal delivery time

> PO_B2B

## Identification

- **idno**: `PO_B2B`
- **database_id**: `WB_LPI_20`
- **database**: Logistics Performance Indicators (LPI) 2.0
- **periodicity**: Annual
- **unit**: Days
- **confidentiality**: PU

## License

- **name**: CC BY 4.0
- **uri**: https://creativecommons.org/licenses/by/4.0/

## Links

- **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/PO_B2B.csv
- **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/PO_B2B.json
- **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=PO_B2B
- **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20

## Definition

Time spent by a business-to-business (B2B) postal item in the importing economy from arrival at the economy’s office of exchange (postal bureau) to first attempted or final delivery. B2B postal items are parcels (up to 30 kilograms) and express shipments.

## Methodology

The indicator is calculated using dataset supplied by the Universal Postal Union (UPU). It is sourced from UPU's EMSEVT messaging standard that contains electronic data interchanges for individual tracked postal items enabling granular visibility over their progress along the supply chain. Postal items are usually classified into three categories: letter-post items (documents and small parcels up to 2 kilograms), parcel-post items (larger parcels of at least 2 kilograms), and express mail service (EMS). Records associated with parcel-post and EMS mail classes were categorized as business-to-business (B2B) postal activities. 
B2B postal delivery time is the time difference between the time a postal item arrives at the destination economy and the time the item is either delivered to the customer or an unsuccessful first delivery is attempted.  The mean, median, and interquartile range (20th–80th percentiles) for all shipments in a given year in a given economy are calculated.
The indicator is reported only for economies with more than ten observations/year is observed and with mean and median delivery times at destination exceeding half a day.
More details on the methodology can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181

## Sources

- Universal Postal Union (UPU)
- World Bank (WB)

## Topics

- Infrastructure _(WB Practice Groups)_
- Transport _(Data360 Topic L1)_
- Transport Economics _(Data360 Topic L2)_
- Postal _(LPI Topic L1)_
- Core _(LPI Topic L2)_
