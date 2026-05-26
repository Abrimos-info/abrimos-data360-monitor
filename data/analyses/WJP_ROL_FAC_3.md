   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): HND. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # WJP Rule of Law Index: Factor 3 - Open Government
   8: 
   9: > WJP_ROL_FAC_3
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WJP_ROL_FAC_3`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WJP_ROL/WJP_ROL_FAC_3.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WJP_ROL/WJP_ROL_FAC_3.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WJP_ROL&INDICATOR=WJP_ROL_FAC_3
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
  85: | 2015 | 0.551156 | 0_TO_1 |
  86: | 2016 | 0.526318 | 0_TO_1 |
  87: | 2017-2018 | 0.536449 | 0_TO_1 |
  88: | 2019 | 0.521876 | 0_TO_1 |
  89: | 2020 | 0.529411 | 0_TO_1 |
  90: | 2021 | 0.523038 | 0_TO_1 |
  91: | 2022 | 0.526273 | 0_TO_1 |
  92: | 2023 | 0.534618 | 0_TO_1 |
  93: | 2024 | 0.52635 | 0_TO_1 |
  94: | 2025 | 0.507753 | 0_TO_1 |
  95: 
  96: #### Otros indicadores del país, valor más reciente disponible
  97: 
  98: | indicator | period | value | unit |
  99: |-----------|--------|-------|------|
 100: | GOV_WGI_CC | 2024 | -1.24469 | U |
 101: | GOV_WGI_GE | 2024 | -0.619673 | U |
 102: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
 103: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
 104: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
 105: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
 106: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
 107: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
 108: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
 109: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
 110: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
 111: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
 112: 
 113: 
 114: ## Reglas de detección activas
 115: 
 116: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 117: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 118: 
 119: ## Candidatos detectados
 120: 
 121: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 122: Protagonista (mayor |z|): HND. Usá sus números en lead, observation y titular.
 123: 
 124: - candidate_id: cand_abrupt_change_HND_WJP_ROL_FAC_3_2025
 125:   type: abrupt_change
 126:   country: HND
 127:   observation: { period: 2025, value: 0.507753, unit: 0_TO_1 }
 128:   previous: { period: 2024, value: 0.52635 }
 129:   REDACTAR CON ESTOS VALORES: valor actual (2025): 0.507753; anterior (2024): 0.52635; Δ=-0.018596999999999975, -3.5% (baja)
 130:   z_score: -4.63
 131:   baseline_mean: 0.527938
 132:   claim_id: cc059b2848f2934a
 133: 
 134: - candidate_id: cand_anomaly_HND_WJP_ROL_FAC_3_2025
 135:   type: anomaly
 136:   country: HND
 137:   observation: { period: 2025, value: 0.507753, unit: 0_TO_1 }
 138:   previous: { period: 2024, value: 0.52635 }
 139:   REDACTAR CON ESTOS VALORES: valor actual (2025): 0.507753; anterior (2024): 0.52635; Δ=-0.018596999999999975, -3.5% (baja)
 140:   z_score: -6.93
 141:   regional_median: 0.638832
 142:   claim_id: cc059b2848f2934a
 143: 
 144: ### allowed_claim_ids
 145: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 146: 
 147: - cc059b2848f2934a
 148: - cc059b2848f2934a
 149: 
 150: 