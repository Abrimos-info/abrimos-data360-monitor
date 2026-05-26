   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # WJP Rule of Law Index: Factor 1 - Constraints on Government Powers
   8: 
   9: > WJP_ROL_FAC_1
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WJP_ROL_FAC_1`
  14: - **database_id**: `WJP_ROL`
  15: - **database**: Rule of Law Index
  16: - **periodicity**: Annual
  17: - **unit**: 0-1 scale
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: License Specified Externally
  23: - **uri**: https://worldjusticeproject.org/terms-service#Acceptable%20Use
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WJP_ROL/WJP_ROL_FAC_1.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WJP_ROL/WJP_ROL_FAC_1.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WJP_ROL&INDICATOR=WJP_ROL_FAC_1
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WJP_ROL
  31: 
  32: ## Definition
  33: 
  34: 1 signifies the highest score and 0 signifies the lowest score. For more information, please refer to: https://worldjusticeproject.org/rule-of-law-index/downloads/ROLIndex2024_Table_of_Variables.pdf
  35: 
  36: ## Methodology
  37: 
  38: Please refer to: https://worldjusticeproject.org/rule-of-law-index/downloads/Index-Methodology-2024.pdf
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
  85: | 2012-2013 | 0.72 | 0_TO_1 |
  86: | 2014 | 0.704308 | 0_TO_1 |
  87: | 2015 | 0.655732 | 0_TO_1 |
  88: | 2016 | 0.619409 | 0_TO_1 |
  89: | 2017-2018 | 0.577731 | 0_TO_1 |
  90: | 2019 | 0.592037 | 0_TO_1 |
  91: | 2020 | 0.600789 | 0_TO_1 |
  92: | 2021 | 0.599759 | 0_TO_1 |
  93: | 2022 | 0.612072 | 0_TO_1 |
  94: | 2023 | 0.61861 | 0_TO_1 |
  95: | 2024 | 0.604119 | 0_TO_1 |
  96: | 2025 | 0.572014 | 0_TO_1 |
  97: 
  98: #### Otros indicadores del país, valor más reciente disponible
  99: 
 100: | indicator | period | value | unit |
 101: |-----------|--------|-------|------|
 102: | GOV_WGI_CC | 2024 | -0.940877 | U |
 103: | GOV_WGI_GE | 2024 | -0.219933 | U |
 104: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 105: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 106: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 107: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 108: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 109: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 110: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 111: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 112: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 113: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 114: 
 115: ### HND
 116: 
 117: #### Background del país
 118: 
 119: # Honduras (HND)
 120: 
 121: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 122: 
 123: ## Identification
 124: 
 125: - **iso3**: `HND`
 126: - **name_es**: Honduras
 127: - **name_en**: Honduras
 128: - **capital**: Tegucigalpa (Distrito Central con Comayagüela)
 129: - **population**: ~10 millones (2024, estimación)
 130: - **wikipedia**: https://es.wikipedia.org/wiki/Honduras
 131: 
 132: #### Serie de este indicador
 133: 
 134: | period | value | unit |
 135: |--------|-------|------|
 136: | 2015 | 0.553164 | 0_TO_1 |
 137: | 2016 | 0.548851 | 0_TO_1 |
 138: | 2017-2018 | 0.494082 | 0_TO_1 |
 139: | 2019 | 0.481112 | 0_TO_1 |
 140: | 2020 | 0.460306 | 0_TO_1 |
 141: | 2021 | 0.446282 | 0_TO_1 |
 142: | 2022 | 0.478574 | 0_TO_1 |
 143: | 2023 | 0.504306 | 0_TO_1 |
 144: | 2024 | 0.511104 | 0_TO_1 |
 145: | 2025 | 0.490426 | 0_TO_1 |
 146: 
 147: ### ARG
 148: 
 149: #### Background del país
 150: 
 151: # Argentina (ARG)
 152: 
 153: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 154: 
 155: ## Identification
 156: 
 157: - **iso3**: `ARG`
 158: - **name_es**: Argentina
 159: - **name_en**: Argentina
 160: - **capital**: Ciudad Autónoma de Buenos Aires
 161: - **population**: ~47 millones (2024, estimación)
 162: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
 163: 
 164: #### Serie de este indicador
 165: 
 166: | period | value | unit |
 167: |--------|-------|------|
 168: | 2012-2013 | 0.63 | 0_TO_1 |
 169: | 2014 | 0.666212 | 0_TO_1 |
 170: | 2015 | 0.633982 | 0_TO_1 |
 171: | 2016 | 0.754402 | 0_TO_1 |
 172: | 2017-2018 | 0.801906 | 0_TO_1 |
 173: | 2019 | 0.795204 | 0_TO_1 |
 174: | 2020 | 0.793352 | 0_TO_1 |
 175: | 2021 | 0.761109 | 0_TO_1 |
 176: | 2022 | 0.725489 | 0_TO_1 |
 177: | 2023 | 0.720655 | 0_TO_1 |
 178: | 2024 | 0.738399 | 0_TO_1 |
 179: | 2025 | 0.718678 | 0_TO_1 |
 180: 
 181: 
 182: ## Reglas de detección activas
 183: 
 184: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 185: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 186: 
 187: ## Candidatos detectados
 188: 
 189: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 190: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 191: 
 192: - candidate_id: cand_abrupt_change_MEX_WJP_ROL_FAC_1_2025
 193:   type: abrupt_change
 194:   country: MEX
 195:   observation: { period: 2025, value: 0.572014, unit: 0_TO_1 }
 196:   previous: { period: 2024, value: 0.604119 }
 197:   REDACTAR CON ESTOS VALORES: valor actual (2025): 0.572014; anterior (2024): 0.604119; Δ=-0.03210499999999994, -5.3% (baja)
 198:   z_score: -4.35
 199:   baseline_mean: 0.6070697999999999
 200:   claim_id: a94c15413ad0608c
 201: 
 202: - candidate_id: cand_anomaly_HND_WJP_ROL_FAC_1_2025
 203:   type: anomaly
 204:   country: HND
 205:   observation: { period: 2025, value: 0.490426, unit: 0_TO_1 }
 206:   previous: { period: 2024, value: 0.511104 }
 207:   REDACTAR CON ESTOS VALORES: valor actual (2025): 0.490426; anterior (2024): 0.511104; Δ=-0.02067800000000003, -4.0% (baja)
 208:   z_score: -2.28
 209:   regional_median: 0.606337
 210:   claim_id: 26b69b4cd236e863
 211: 
 212: - candidate_id: cand_anomaly_ARG_WJP_ROL_FAC_1_2025
 213:   type: anomaly
 214:   country: ARG
 215:   observation: { period: 2025, value: 0.718678, unit: 0_TO_1 }
 216:   previous: { period: 2024, value: 0.738399 }
 217:   REDACTAR CON ESTOS VALORES: valor actual (2025): 0.718678; anterior (2024): 0.738399; Δ=-0.01972099999999999, -2.7% (baja)
 218:   z_score: 2.21
 219:   regional_median: 0.606337
 220:   claim_id: a542ef633d179ee1
 221: 
 222: ### allowed_claim_ids
 223: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 224: 
 225: - a94c15413ad0608c
 226: - 26b69b4cd236e863
 227: - a542ef633d179ee1
 228: 
 229: 