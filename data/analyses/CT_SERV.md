   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Number of services
   8: 
   9: > CT_SERV
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `CT_SERV`
  14: - **database_id**: `WB_LPI_20`
  15: - **database**: Logistics Performance Indicators (LPI) 2.0
  16: - **periodicity**: Annual
  17: - **unit**: Services
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY 4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/CT_SERV.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/CT_SERV.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=CT_SERV
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20
  31: 
  32: ## Definition
  33: 
  34: Number of direct container liner shipping services servicing the ports in an economy
  35: 
  36: ## Methodology
  37: 
  38: The indicator is calculated using the shipping schedules in the MDS Transmodal Containership Databank indicating the number of container shipping services by year and quarter. For a given economy, the indicator is the average number of services across the four quarters of each year.
  39: 
  40: ## Sources
  41: 
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
  64: ### GTM
  65: 
  66: #### Background del país
  67: 
  68: # Guatemala (GTM)
  69: 
  70: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  71: 
  72: ## Identification
  73: 
  74: - **iso3**: `GTM`
  75: - **name_es**: Guatemala
  76: - **name_en**: Guatemala
  77: - **capital**: Ciudad de Guatemala
  78: - **population**: ~18 millones (2024, estimación)
  79: - **wikipedia**: https://es.wikipedia.org/wiki/Guatemala
  80: 
  81: #### Serie de este indicador
  82: 
  83: | period | value | unit |
  84: |--------|-------|------|
  85: | 2023 | 30.2 | SERV |
  86: | 2024 | 32.2 | SERV |
  87: 
  88: ### MEX
  89: 
  90: #### Background del país
  91: 
  92: # México (MEX)
  93: 
  94: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  95: 
  96: ## Identification
  97: 
  98: - **iso3**: `MEX`
  99: - **name_es**: México
 100: - **name_en**: Mexico
 101: - **capital**: Ciudad de México
 102: - **population**: ~130 millones (2024, estimación)
 103: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 104: 
 105: #### Serie de este indicador
 106: 
 107: | period | value | unit |
 108: |--------|-------|------|
 109: | 2023 | 55.2 | SERV |
 110: | 2024 | 58.5 | SERV |
 111: 
 112: #### Otros indicadores del país, valor más reciente disponible
 113: 
 114: | indicator | period | value | unit |
 115: |-----------|--------|-------|------|
 116: | GOV_WGI_CC | 2024 | -0.940877 | U |
 117: | GOV_WGI_GE | 2024 | -0.219933 | U |
 118: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 119: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 120: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 121: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 122: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 123: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 124: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 125: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 126: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 127: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
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
 138: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 139: 
 140: - candidate_id: cand_anomaly_GTM_CT_SERV_2024
 141:   type: anomaly
 142:   country: GTM
 143:   observation: { period: 2024, value: 32.2, unit: SERV }
 144:   previous: { period: 2023, value: 30.2 }
 145:   REDACTAR CON ESTOS VALORES: valor actual (2024): 32.2; anterior (2023): 30.2; Δ=+2.0000000000000036, +6.6% (sube)
 146:   z_score: 11.06
 147:   regional_median: 24
 148:   claim_id: 9788e0405a6c63cf
 149: 
 150: - candidate_id: cand_anomaly_MEX_CT_SERV_2024
 151:   type: anomaly
 152:   country: MEX
 153:   observation: { period: 2024, value: 58.5, unit: SERV }
 154:   previous: { period: 2023, value: 55.2 }
 155:   REDACTAR CON ESTOS VALORES: valor actual (2024): 58.5; anterior (2023): 55.2; Δ=+3.299999999999997, +6.0% (sube)
 156:   z_score: 46.54
 157:   regional_median: 24
 158:   claim_id: 0d526bff91b7111d
 159: 
 160: ### allowed_claim_ids
 161: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 162: 
 163: - 9788e0405a6c63cf
 164: - 0d526bff91b7111d
 165: 
 166: 