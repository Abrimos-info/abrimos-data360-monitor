   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Import supply chain termination
   8: 
   9: > SC_END
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `SC_END`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/SC_END.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/SC_END.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=SC_END
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20
  31: 
  32: ## Definition
  33: 
  34: Time between a full container being sent to the consignee from the last logistics facility (port or in-land) and an empty container being returned to a depot.
  35: 
  36: ## Methodology
  37: 
  38: Indicator is derived from a container-tracking dataset provided to the World Bank by a major global shipping line under confidentiality arrangements.
  39: Observations are recorded at the container level and include container status (full or empty), location, and timestamps for discrete event types. Each timestamp captures the date and time of one of 70-plus tracking events occurring across locations—such as seaports, inland terminals, depots, quays, and rail ramps—identified by UN/LOCODEs. 
  40: Container voyages (sequences of events attributed to a particular consignment in a container) are segmented into five phases of movement: empty container positioning, export, shipping/transshipment, import, and empty container return. Phases are constructed by slicing individual container voyages into legs comprising sequences of steps: either dwell time at a single location or lead time between distinct locations.
  41: The import supply termination is calculated as the time between a full container being sent to the consignee from the last logistics facility (port or in-land) and the same empty container being returned to a depot.
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
  64: ### ARG
  65: 
  66: #### Background del país
  67: 
  68: # Argentina (ARG)
  69: 
  70: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  71: 
  72: ## Identification
  73: 
  74: - **iso3**: `ARG`
  75: - **name_es**: Argentina
  76: - **name_en**: Argentina
  77: - **capital**: Ciudad Autónoma de Buenos Aires
  78: - **population**: ~47 millones (2024, estimación)
  79: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
  80: 
  81: #### Serie de este indicador
  82: 
  83: | period | value | unit |
  84: |--------|-------|------|
  85: | 2023 | 10.7 | D |
  86: | 2024 | 6.5 | D |
  87: 
  88: #### Otros indicadores del país, valor más reciente disponible
  89: 
  90: | indicator | period | value | unit |
  91: |-----------|--------|-------|------|
  92: | GOV_WGI_CC | 2024 | -0.325708 | U |
  93: | GOV_WGI_GE | 2024 | 0.183748 | U |
  94: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
  95: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
  96: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
  97: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
  98: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
  99: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 100: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 101: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 102: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 103: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
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
 114: Protagonista (mayor |z|): ARG. Usá sus números en lead, observation y titular.
 115: 
 116: - candidate_id: cand_anomaly_ARG_SC_END_2024
 117:   type: anomaly
 118:   country: ARG
 119:   observation: { period: 2024, value: 6.5, unit: D }
 120:   previous: { period: 2023, value: 10.7 }
 121:   REDACTAR CON ESTOS VALORES: valor actual (2024): 6.5; anterior (2023): 10.7; Δ=-4.199999999999999, -39.3% (baja)
 122:   z_score: 2.36
 123:   regional_median: 3
 124:   claim_id: 3aa56e5448fde4ec
 125: 
 126: ### allowed_claim_ids
 127: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 128: 
 129: - 3aa56e5448fde4ec
 130: 
 131: 