   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): GTM. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Remittance outflows (US$ million)
   8: 
   9: > WB_KNOMAD_MRO
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_KNOMAD_MRO`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_KNOMAD/WB_KNOMAD_MRO.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_KNOMAD/WB_KNOMAD_MRO.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_KNOMAD&INDICATOR=WB_KNOMAD_MRO
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_KNOMAD
  31: 
  32: ## Definition
  33: 
  34: Remittance outward flows (US$ million)
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
  85: | 2012 | 27.9052 | USD_CUR |
  86: | 2013 | 27.74553 | USD_CUR |
  87: | 2014 | 26.12559 | USD_CUR |
  88: | 2015 | 22.9061 | USD_CUR |
  89: | 2016 | 18.78648 | USD_CUR |
  90: | 2017 | 18.33387 | USD_CUR |
  91: | 2018 | 18.91029 | USD_CUR |
  92: | 2019 | 18.00769 | USD_CUR |
  93: | 2020 | 18.66457 | USD_CUR |
  94: | 2021 | 19.96793 | USD_CUR |
  95: | 2022 | 23.85243 | USD_CUR |
  96: | 2023 | 28.29706 | USD_CUR |
  97: 
  98: #### Otros indicadores del país, valor más reciente disponible
  99: 
 100: | indicator | period | value | unit |
 101: |-----------|--------|-------|------|
 102: | GOV_WGI_CC | 2024 | -0.948265 | U |
 103: | GOV_WGI_GE | 2024 | -0.90937 | U |
 104: | WB_CCDFS_GGDY | 2022 | 29.222 | PT |
 105: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 2.887155 | PT_GDP |
 106: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.632519 | PT_GDP |
 107: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 2.869928 | PC_A |
 108: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 12.478014 | PT_REV |
 109: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.651864 | PC_A |
 110: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6150.025714 | USD |
 111: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
 112: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
 113: | WB_WDI_SH_STA_MMRT | 2023 | 94 | DT_10P5BR_L |
 114: 
 115: ### MEX
 116: 
 117: #### Background del país
 118: 
 119: # México (MEX)
 120: 
 121: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 122: 
 123: ## Identification
 124: 
 125: - **iso3**: `MEX`
 126: - **name_es**: México
 127: - **name_en**: Mexico
 128: - **capital**: Ciudad de México
 129: - **population**: ~130 millones (2024, estimación)
 130: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 131: 
 132: #### Serie de este indicador
 133: 
 134: | period | value | unit |
 135: |--------|-------|------|
 136: | 2012 | 0 | USD_CUR |
 137: | 2013 | 748.784364 | USD_CUR |
 138: | 2014 | 715.177445 | USD_CUR |
 139: | 2015 | 632.146573 | USD_CUR |
 140: | 2016 | 543.970787 | USD_CUR |
 141: | 2017 | 635.236627 | USD_CUR |
 142: | 2018 | 742.219159 | USD_CUR |
 143: | 2019 | 787.386867 | USD_CUR |
 144: | 2020 | 647.378542 | USD_CUR |
 145: | 2021 | 767.243593 | USD_CUR |
 146: | 2022 | 883.189736 | USD_CUR |
 147: | 2023 | 1055.657232 | USD_CUR |
 148: 
 149: 
 150: ## Reglas de detección activas
 151: 
 152: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 153: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 154: 
 155: ## Candidatos detectados
 156: 
 157: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 158: Protagonista (mayor |z|): GTM. Usá sus números en lead, observation y titular.
 159: 
 160: - candidate_id: cand_abrupt_change_GTM_WB_KNOMAD_MRO_2023
 161:   type: abrupt_change
 162:   country: GTM
 163:   observation: { period: 2023, value: 28.29706, unit: USD_CUR }
 164:   previous: { period: 2022, value: 23.85243 }
 165:   REDACTAR CON ESTOS VALORES: valor actual (2023): 28.29706; anterior (2022): 23.85243; Δ=+4.44463, +18.6% (sube)
 166:   z_score: 3.61
 167:   baseline_mean: 19.880581999999997
 168:   claim_id: 2948bbd92afe478d
 169: 
 170: - candidate_id: cand_abrupt_change_MEX_WB_KNOMAD_MRO_2023
 171:   type: abrupt_change
 172:   country: MEX
 173:   observation: { period: 2023, value: 1055.657232, unit: USD_CUR }
 174:   previous: { period: 2022, value: 883.189736 }
 175:   REDACTAR CON ESTOS VALORES: valor actual (2023): 1055.657232; anterior (2022): 883.189736; Δ=+172.46749599999998, +19.5% (sube)
 176:   z_score: 3.42
 177:   baseline_mean: 765.4835794
 178:   claim_id: 9a0a4ea0d942ca6e
 179: 
 180: ### allowed_claim_ids
 181: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 182: 
 183: - 2948bbd92afe478d
 184: - 9a0a4ea0d942ca6e
 185: 
 186: 