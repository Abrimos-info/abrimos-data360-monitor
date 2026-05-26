# Aviation import dwell time

> AV_DT

## Identification

- **idno**: `AV_DT`
- **database_id**: `WB_LPI_20`
- **database**: Logistics Performance Indicators (LPI) 2.0
- **periodicity**: Annual
- **unit**: Days
- **confidentiality**: PU

## License

- **name**: CC BY 4.0
- **uri**: https://creativecommons.org/licenses/by/4.0/

## Links

- **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/AV_DT.csv
- **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/AV_DT.json
- **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=AV_DT
- **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20

## Definition

The time elapsed between the moment an air cargo shipment becomes ready to be picked up  by the consignee or his agent until the moment the cargo is cleared by customs and leaves the destination airport.

## Methodology

Data for this indicator was provided to the World Bank by Cargo iQ, a nonprofit group affiliated with the International Air Transport Association (IATA). Cargo iQ’s event recording follows an electronic data interchange protocol, adhering to a logical sequence of supply chain events. An air freight shipment, typically identified through an electronic airway bill (e-AWB), is tracked from the departure of the flight with cargo from origin airport to its arrival and subsequent check-in at a warehouse at the destination airport. This is followed by the notification to the consignee of the freight’s arrival (event NFD) and the forwarder or consignee’s collection of the freight from the carrier facility at the destination airport (event DLV). 
Aviation import dwell time is the time difference between the events NFD and DLV. The time elapsed between the NFD and DLV events was calculated for each e-AWB recorded at the destination economy, assuming the validity of the time difference (both timestamps had to exist, and the time difference between them had to be positive). 
To protect commercially sensitive information, only economies that have at least three airlines reporting and the two largest airlines (measured by the number of e-AWBs recorded per year) account for no more than 90 percent of the total number of e-AWBs recorded for that economy each year were included. 
More details on the methodology can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181

## Sources

- Cargo iQ
- World Bank (WB)

## Topics

- Infrastructure _(WB Practice Groups)_
- Transport _(Data360 Topic L1)_
- Air Transport _(Data360 Topic L2)_
- Aviation _(LPI Topic L1)_
- Core _(LPI Topic L2)_
