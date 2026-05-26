   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Bilateral Estimate of Migrant Stocks
   8: 
   9: > WB_KNOMAD_MIG
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_KNOMAD_MIG`
  14: - **database_id**: `WB_KNOMAD`
  15: - **database**: The Global Knowledge Partnership on Migration and Development (KNOMAD) database
  16: - **periodicity**: Annual
  17: - **unit**: US dollars
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY 4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_KNOMAD/WB_KNOMAD_MIG.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_KNOMAD/WB_KNOMAD_MIG.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_KNOMAD&INDICATOR=WB_KNOMAD_MIG
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_KNOMAD
  31: 
  32: ## Definition
  33: 
  34: Estimate of Migrant Stocks
  35: 
  36: ## Methodology
  37: 
  38: Two key datasets are used to construct the bilateral remittance matrices. The first is the Bilateral Migration Matrix. The Bilateral Migration Matrix provides estimates on immigrant stocks, disaggregated by migrant source countries, in all the countries for which data is available. It is based on data collected from countries’ census bureau and other relevant sources. The second key dataset used in the construction of the Bilateral Remittance Matrix is the remittance inflows data. The remittance inflows data are constructed as the sum, where data is available, of two components in the IMF’s Balance of Payments Statistics: i) compensation of employees, ii) personal transfers. Constructing the Bilateral Remittance Matrix involves allocating a country’s total remittance inflows in a given year to its emigrant stocks estimated in the Bilateral Migration Matrix, adjusting for the migrant sending and receiving countries’ per capita income. It is important to emphasize that this is not an official figure. The methodology used is described in greater detail in the paper: "South-South Migration and Remittances" by Ratha and Shaw (2007).
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
  85: | 2021 | 11267241 | USD_CUR |
  86: 
  87: #### Otros indicadores del país, valor más reciente disponible
  88: 
  89: | indicator | period | value | unit |
  90: |-----------|--------|-------|------|
  91: | GOV_WGI_CC | 2024 | -0.940877 | U |
  92: | GOV_WGI_GE | 2024 | -0.219933 | U |
  93: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
  94: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
  95: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
  96: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
  97: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
  98: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
  99: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 100: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 101: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 102: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 103: 
 104: 
 105: ## Reglas de detección activas
 106: 
 107: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 108: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 109: 
 110: ## Candidatos detectados
 111: 
 112: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 113: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 114: 
 115: - candidate_id: cand_anomaly_MEX_WB_KNOMAD_MIG_2021
 116:   type: anomaly
 117:   country: MEX
 118:   observation: { period: 2021, value: 11267241, unit: USD_CUR }
 119:   REDACTAR CON ESTOS VALORES: valor actual (2021): 11267241 — sin período anterior en la detección
 120:   z_score: 43.54
 121:   regional_median: 1143078
 122:   claim_id: 3a606687e0169d1f
 123: 
 124: ### allowed_claim_ids
 125: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 126: 
 127: - 3a606687e0169d1f
 128: 
 129: 