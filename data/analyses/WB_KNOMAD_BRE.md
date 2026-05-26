   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Bilateral Remittance Estimates using Migrant Stocks, Host Country Incomes, and Origin Country Incomes (US$ million)
   8: 
   9: > WB_KNOMAD_BRE
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_KNOMAD_BRE`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_KNOMAD/WB_KNOMAD_BRE.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_KNOMAD/WB_KNOMAD_BRE.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_KNOMAD&INDICATOR=WB_KNOMAD_BRE
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_KNOMAD
  31: 
  32: ## Definition
  33: 
  34: Partner corresponds to Remittance-receiving country.
  35: 
  36: These estimates are based on the methodology developed by Ratha and Shaw, 2007, "South-South Migration and Remittances," World Bank (https://openknowledge.worldbank.org/handle/10986/6733). The remittance data is for 2021, disaggregated using host country and origin country incomes, and estimated migrant stocks from 2021. Flows between India and Pakistan, Pakistan and India, Lebanon and Israel and vice versa, and Azerbaijan and Armenia and vice versa  are assumed to be zero given the political economy situations in these corridors.
  37: 
  38: There are several caveats relating to our data on bilateral remittances. First of all, it is very important to note that bilateral remittance matrix presented here is an analytical estimate derived from a global estimation of bilateral matrix flows. This estimate is simply that, an estimate based on methodology and logical assumptions.
  39: 
  40: The caveats attached to this estimate are: (a) The migrant stock data is drawn from the Bilateral Migration Matrix, which is itself based on UN Population Division and National Census data. These are by nature updated infrequently and may not appropriately capture sudden changes in migrant stock; (b) The incomes of migrants abroad and the costs of living in the migrants' country of origin are both proxied by per capita incomes in PPP terms, which is only a rough proxy; (c) Remittance behavior of second-generation migrants who may be recorded as native-born in the remittance source country are not accounted for; (d) There is no way to capture remittances flowing  through informal, unrecorded channels; (e) It does not account for cases where remittances may be miscalculated due to accounting errors arising from confusion with trade and tourism receipts; (f) It may also include cases of retirees moving to certain countries and taking out (remitting) their life long savings.
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
  85: | 2021 | 3147.931614 | USD_CUR |
  86: 
  87: ### MEX
  88: 
  89: #### Background del país
  90: 
  91: # México (MEX)
  92: 
  93: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  94: 
  95: ## Identification
  96: 
  97: - **iso3**: `MEX`
  98: - **name_es**: México
  99: - **name_en**: Mexico
 100: - **capital**: Ciudad de México
 101: - **population**: ~130 millones (2024, estimación)
 102: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 103: 
 104: #### Serie de este indicador
 105: 
 106: | period | value | unit |
 107: |--------|-------|------|
 108: | 2021 | 3274.880339 | USD_CUR |
 109: 
 110: #### Otros indicadores del país, valor más reciente disponible
 111: 
 112: | indicator | period | value | unit |
 113: |-----------|--------|-------|------|
 114: | GOV_WGI_CC | 2024 | -0.940877 | U |
 115: | GOV_WGI_GE | 2024 | -0.219933 | U |
 116: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 117: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 118: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 119: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 120: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 121: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 122: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 123: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 124: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 125: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 126: 
 127: 
 128: ## Reglas de detección activas
 129: 
 130: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 131: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 132: 
 133: ## Candidatos detectados
 134: 
 135: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 136: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 137: 
 138: - candidate_id: cand_anomaly_ARG_WB_KNOMAD_BRE_2021
 139:   type: anomaly
 140:   country: ARG
 141:   observation: { period: 2021, value: 3147.931614, unit: USD_CUR }
 142:   REDACTAR CON ESTOS VALORES: valor actual (2021): 3147.931614 — sin período anterior en la detección
 143:   z_score: 2.10
 144:   regional_median: 867.520316
 145:   claim_id: 2e54cd56f798f4c8
 146: 
 147: - candidate_id: cand_anomaly_MEX_WB_KNOMAD_BRE_2021
 148:   type: anomaly
 149:   country: MEX
 150:   observation: { period: 2021, value: 3274.880339, unit: USD_CUR }
 151:   REDACTAR CON ESTOS VALORES: valor actual (2021): 3274.880339 — sin período anterior en la detección
 152:   z_score: 2.22
 153:   regional_median: 867.520316
 154:   claim_id: a9c6bead76204747
 155: 
 156: ### allowed_claim_ids
 157: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 158: 
 159: - 2e54cd56f798f4c8
 160: - a9c6bead76204747
 161: 
 162: 