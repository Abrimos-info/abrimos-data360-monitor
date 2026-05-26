# Turnaround time at ports

> CT_TAT_PT

## Identification

- **idno**: `CT_TAT_PT`
- **database_id**: `WB_LPI_20`
- **database**: Logistics Performance Indicators (LPI) 2.0
- **periodicity**: Annual
- **unit**: Days
- **confidentiality**: PU

## License

- **name**: CC BY 4.0
- **uri**: https://creativecommons.org/licenses/by/4.0/

## Links

- **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/CT_TAT_PT.csv
- **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/CT_TAT_PT.json
- **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=CT_TAT_PT
- **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20

## Definition

Time container ships call at a port, excluding waiting time at anchorage outside the port vicinity.

## Methodology

The indicator is calculated based on Marine Traffic port call dataset, which is derived from Automatic Identification System (AIS) signals, enriched with proprietary port and ship data. The dataset includes timestamps for port arrivals and departures, processed through terrestrial AIS receivers. Turnaround time at ports is calculated using timestamped events of containerships arrivals and departures, defined by geofenced port areas established using a proprietary algorithm implemented by Marine Traffic. 
For each port visit in the database lasting more than two hours and less than 1000 hours, turnaround time is computed as the time difference in days between vessel's arrival at port’s geofenced area until vessel's departure from port’s geofenced area. This turnaround time is aggregated at the economy level using statistical measures such as mean, median, and interquartile ranges across all port visits in all of an economy's ports.  
The twenty-foot equivalent unit (TEU)-weighted version of turnaround time uses the same time concept but is weighted by the overall nominal container vessel capacity, measured in TEUs, arriving in ports in a given economy.
More details on the data and its processing can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181

## Sources

- Marine Traffic
- World Bank (WB)

## Topics

- Infrastructure _(WB Practice Groups)_
- Transport _(Data360 Topic L1)_
- Maritime Transport and Logistics _(Data360 Topic L2)_
- Maritime _(LPI Topic L1)_
- Supplementary _(LPI Topic L2)_
- Coastal countries _(LPI Topic L3)_
