   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): HND. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Turnaround time at ports
   8: 
   9: > CT_TAT_PT
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `CT_TAT_PT`
  14: - **database_id**: `WB_LPI_20`
  15: - **database**: Logistics Performance Indicators (LPI) 2.0
  16: - **periodicity**: Annual
  17: - **unit**: Days
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY 4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/CT_TAT_PT.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/CT_TAT_PT.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=CT_TAT_PT
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20
  31: 
  32: ## Definition
  33: 
  34: Time container ships call at a port, excluding waiting time at anchorage outside the port vicinity.
  35: 
  36: ## Methodology
  37: 
  38: The indicator is calculated based on Marine Traffic port call dataset, which is derived from Automatic Identification System (AIS) signals, enriched with proprietary port and ship data. The dataset includes timestamps for port arrivals and departures, processed through terrestrial AIS receivers. Turnaround time at ports is calculated using timestamped events of containerships arrivals and departures, defined by geofenced port areas established using a proprietary algorithm implemented by Marine Traffic. 
  39: For each port visit in the database lasting more than two hours and less than 1000 hours, turnaround time is computed as the time difference in days between vessel's arrival at port’s geofenced area until vessel's departure from port’s geofenced area. This turnaround time is aggregated at the economy level using statistical measures such as mean, median, and interquartile ranges across all port visits in all of an economy's ports.  
  40: The twenty-foot equivalent unit (TEU)-weighted version of turnaround time uses the same time concept but is weighted by the overall nominal container vessel capacity, measured in TEUs, arriving in ports in a given economy.
  41: More details on the data and its processing can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181
  42: 
  43: ## Diccionario de datos (columnas clave del CSV)
  44: 
  45: Glosario de columnas del CSV de Data360 para este indicador (unidades, códigos de área, etc.).
  46: VARIABLE_ID,VARIABLE_LABEL,VARIABLE_DESCRIPTION,VARIABLE_DATA_TYPE,VARIABLE_REQUIRED
  47: STRUCTURE,STRUCTURE,,,False
  48: STRUCTURE_ID,STRUCTURE_ID,,,False
  49: ACTION,ACTION,,,False
  50: FREQ,Frequency of observation,Time interval at which observations occur over a given time period.,String,True
  51: REF_AREA,Reference area,Country or geographic area to which the measured statistical phenomenon relates.,String,True
  52: INDICATOR,Statistical indicator,"Data element that represents statistical data for a specified time, place, and other characteristics, and is corrected for at least one dimension (usually size) to allow for meaningful comparisons.",String,True
  53: SEX,Sex,State of being male or female.,,True
  54: AGE,Age,Length of time that an entity has lived or existed.,String,True
  55: URBANISATION,Degree of urbanisation,"Refers to Total, Urban, or Rural location.",String,True
  56: UNIT_MEASURE,Unit of measure,Unit in which the data values are expressed.,String,True
  57: COMP_BREAKDOWN_1,Custom Dimension 1,,String,True
  58: COMP_BREAKDOWN_2,Custom Dimension 2,,String,True
  59: COMP_BREAKDOWN_3,Custom Dimension 3,,String,True
  60: TIME_PERIOD,Time period,Timespan or point in time to which the observation actually refers.,ObservationalTimePeriod,True
  61: 
  62: ## Países y trayectorias
  63: 
  64: ### HND
  65: 
  66: #### Background del país
  67: 
  68: # Honduras (HND)
  69: 
  70: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  71: 
  72: ## Identification
  73: 
  74: - **iso3**: `HND`
  75: - **name_es**: Honduras
  76: - **name_en**: Honduras
  77: - **capital**: Tegucigalpa (Distrito Central con Comayagüela)
  78: - **population**: ~10 millones (2024, estimación)
  79: - **wikipedia**: https://es.wikipedia.org/wiki/Honduras
  80: 
  81: #### Serie de este indicador
  82: 
  83: | period | value | unit |
  84: |--------|-------|------|
  85: | 2023 | 0.6 | D |
  86: | 2024 | 0.6 | D |
  87: 
  88: #### Otros indicadores del país, valor más reciente disponible
  89: 
  90: | indicator | period | value | unit |
  91: |-----------|--------|-------|------|
  92: | GOV_WGI_CC | 2024 | -1.24469 | U |
  93: | GOV_WGI_GE | 2024 | -0.619673 | U |
  94: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
  95: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
  96: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
  97: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
  98: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
  99: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
 100: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
 101: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
 102: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
 103: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
 104: 
 105: 
 106: ## Reglas de detección activas
 107: 
 108: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 109: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 110: 
 111: ## Candidatos detectados
 112: 
 113: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 114: Protagonista (mayor |z|): HND. Usá sus números en lead, observation y titular.
 115: 
 116: - candidate_id: cand_anomaly_HND_CT_TAT_PT_2024
 117:   type: anomaly
 118:   country: HND
 119:   observation: { period: 2024, value: 0.6, unit: D }
 120:   previous: { period: 2023, value: 0.6 }
 121:   REDACTAR CON ESTOS VALORES: valor actual (2024): 0.6; anterior (2023): 0.6; Δ=+0, +0.0% (sin cambio)
 122:   z_score: -3.04
 123:   regional_median: 1.5
 124:   claim_id: 4b40a9363dcaa15b
 125: 
 126: ### allowed_claim_ids
 127: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 128: 
 129: - 4b40a9363dcaa15b
 130: 
 131: 