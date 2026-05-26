# Number of transshipments

> TRS_NUM

## Identification

- **idno**: `TRS_NUM`
- **database_id**: `WB_LPI_20`
- **database**: Logistics Performance Indicators (LPI) 2.0
- **periodicity**: Annual
- **unit**: Transshipments
- **confidentiality**: PU

## License

- **name**: CC BY 4.0
- **uri**: https://creativecommons.org/licenses/by/4.0/

## Links

- **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/TRS_NUM.csv
- **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/TRS_NUM.json
- **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=TRS_NUM
- **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20

## Definition

Average number of times inbound containers in an economy are transshipped in their journey from the port of loading in the origin economy to the port of destination in the importing economy. Transshipment refers to moving a container from one ship to another to reach the final destination

## Methodology

Indicator is derived from a container-tracking dataset provided to the World Bank by a major global shipping line under confidentiality arrangements.
Observations are recorded at the container level and include container status (full or empty), location, and timestamps for discrete event types. Each timestamp captures the date and time of one of 70-plus tracking events occurring across locations—such as seaports, inland terminals, depots, quays, and rail ramps—identified by UN/LOCODEs. 
Container voyages (sequences of events attributed to a particular consignment in a container) are segmented into five phases of movement: empty container positioning, export, shipping/transshipment, import, and empty container return. Phases are constructed by slicing individual container voyages into legs comprising sequences of steps: either dwell time at a single location or lead time between distinct locations.
Number of transshipments of a container traveling from origin to destination port is calculated for all inbound shipments as the number of times a container is transshipped (discharged from one vessel and loaded onto another vessel) at intermediate port facilities (other than port of origin and destination) during the maritime shipping phase of its voyage. 
More details on the methodology can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181

## Sources

- World Bank (WB)

## Topics

- Infrastructure _(WB Practice Groups)_
- Transport _(Data360 Topic L1)_
- Maritime Transport and Logistics _(Data360 Topic L2)_
- Maritime _(LPI Topic L1)_
- Supplementary _(LPI Topic L2)_
- Coastal countries _(LPI Topic L3)_
