   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): HND. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Container import dwell time
   8: 
   9: > CT_DT_M
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `CT_DT_M`
  14: - **database_id**: `WB_LPI_20`
  15: - **database**: Logistics Performance Indicators (LPI) 2.0
  16: - **periodicity**: Annual
  17: - **unit**: Days
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC-BY-4.0
  23: 
  24: ## Links
  25: 
  26: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/CT_DT_M.csv
  27: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/CT_DT_M.json
  28: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=CT_DT_M
  29: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20
  30: 
  31: ## Definition
  32: 
  33: The time between the discharge of a full container from the vessel at the port of arrival (port of entry) until the time the container exits port's premises by truck or rail.
  34: 
  35: ## Methodology
  36: 
  37: Indicator is derived from a container-tracking dataset provided to the World Bank by a major global shipping line under confidentiality arrangements.
  38: Observations are recorded at the container level and include container status (full or empty), location, and timestamps for discrete event types. Each timestamp captures the date and time of one of 70-plus tracking events occurring across locations—such as seaports, inland terminals, depots, quays, and rail ramps—identified by UN/LOCODEs. 
  39: Container voyages (sequences of events attributed to a particular consignment in a container) are segmented into five phases of movement: empty container positioning, export, shipping/transshipment, import, and empty container return. Phases are constructed by slicing individual container voyages into legs comprising sequences of steps: either dwell time at a single location or lead time between distinct locations.
  40: The container import dwell time is calculated as the time between the discharge of a full container from the vessel at the port of arrival (port of entry) until the time the container exits port's premises by truck or rail.
  41: More details on the methodology can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181
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
  85: | 2023 | 9.5 | D |
  86: | 2024 | 10 | D |
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
 105: ### MEX
 106: 
 107: #### Background del país
 108: 
 109: # México (MEX)
 110: 
 111: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 112: 
 113: ## Identification
 114: 
 115: - **iso3**: `MEX`
 116: - **name_es**: México
 117: - **name_en**: Mexico
 118: - **capital**: Ciudad de México
 119: - **population**: ~130 millones (2024, estimación)
 120: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 121: 
 122: #### Serie de este indicador
 123: 
 124: | period | value | unit |
 125: |--------|-------|------|
 126: | 2023 | 8.4 | D |
 127: | 2024 | 9.3 | D |
 128: 
 129: 
 130: ## Reglas de detección activas
 131: 
 132: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 133: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 134: 
 135: ## Candidatos detectados
 136: 
 137: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 138: Protagonista (mayor |z|): HND. Usá sus números en lead, observation y titular.
 139: 
 140: - candidate_id: cand_anomaly_HND_CT_DT_M_2024
 141:   type: anomaly
 142:   country: HND
 143:   observation: { period: 2024, value: 10, unit: D }
 144:   previous: { period: 2023, value: 9.5 }
 145:   REDACTAR CON ESTOS VALORES: valor actual (2024): 10; anterior (2023): 9.5; Δ=+0.5, +5.3% (sube)
 146:   z_score: 6.74
 147:   regional_median: 8
 148:   claim_id: d9ff6181e443d8f8
 149: 
 150: - candidate_id: cand_anomaly_MEX_CT_DT_M_2024
 151:   type: anomaly
 152:   country: MEX
 153:   observation: { period: 2024, value: 9.3, unit: D }
 154:   previous: { period: 2023, value: 8.4 }
 155:   REDACTAR CON ESTOS VALORES: valor actual (2024): 9.3; anterior (2023): 8.4; Δ=+0.9000000000000004, +10.7% (sube)
 156:   z_score: 4.38
 157:   regional_median: 8
 158:   claim_id: 728b8c884029c431
 159: 
 160: ### allowed_claim_ids
 161: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 162: 
 163: - d9ff6181e443d8f8
 164: - 728b8c884029c431
 165: 
 166: 