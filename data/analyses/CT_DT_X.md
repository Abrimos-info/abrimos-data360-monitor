   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Container export dwell time
   8: 
   9: > CT_DT_X
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `CT_DT_X`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/CT_DT_X.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/CT_DT_X.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=CT_DT_X
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20
  31: 
  32: ## Definition
  33: 
  34: Time spent at the port of departure (defined by UNLOCODE) from arrival of full export container to completion of container loading on vessel
  35: 
  36: ## Methodology
  37: 
  38: Indicator is derived from a container-tracking dataset provided to the World Bank by a major global shipping line under confidentiality arrangements.
  39: Observations are recorded at the container level and include container status (full or empty), location, and timestamps for discrete event types. Each timestamp captures the date and time of one of 70-plus tracking events occurring across locations—such as seaports, inland terminals, depots, quays, and rail ramps—identified by UN/LOCODEs. 
  40: Container voyages (sequences of events attributed to a particular consignment in a container) are segmented into five phases of movement: empty container positioning, export, shipping/transshipment, import, and empty container return. Phases are constructed by slicing individual container voyages into legs comprising sequences of steps: either dwell time at a single location or lead time between distinct locations.
  41: The export phase usually starts from a point when a container is received by the shipping line from the shipper until it is loaded on a vessel at the port of loading (port of origin). 
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
  64: ### MEX
  65: 
  66: #### Background del país
  67: 
  68: # México (MEX)
  69: 
  70: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  71: 
  72: ## Identification
  73: 
  74: - **iso3**: `MEX`
  75: - **name_es**: México
  76: - **name_en**: Mexico
  77: - **capital**: Ciudad de México
  78: - **population**: ~130 millones (2024, estimación)
  79: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
  80: 
  81: #### Serie de este indicador
  82: 
  83: | period | value | unit |
  84: |--------|-------|------|
  85: | 2023 | 9.4 | D |
  86: | 2024 | 10.3 | D |
  87: 
  88: #### Otros indicadores del país, valor más reciente disponible
  89: 
  90: | indicator | period | value | unit |
  91: |-----------|--------|-------|------|
  92: | GOV_WGI_CC | 2024 | -0.940877 | U |
  93: | GOV_WGI_GE | 2024 | -0.219933 | U |
  94: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
  95: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
  96: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
  97: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
  98: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
  99: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 100: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 101: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 102: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 103: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
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
 114: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 115: 
 116: - candidate_id: cand_anomaly_MEX_CT_DT_X_2024
 117:   type: anomaly
 118:   country: MEX
 119:   observation: { period: 2024, value: 10.3, unit: D }
 120:   previous: { period: 2023, value: 9.4 }
 121:   REDACTAR CON ESTOS VALORES: valor actual (2024): 10.3; anterior (2023): 9.4; Δ=+0.9000000000000004, +9.6% (sube)
 122:   z_score: 3.31
 123:   regional_median: 4.9
 124:   claim_id: cd8ea17f02163344
 125: 
 126: ### allowed_claim_ids
 127: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 128: 
 129: - cd8ea17f02163344
 130: 
 131: 