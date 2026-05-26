   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Press Freedom Index: Political context
   8: 
   9: > RWB_PFI_PLC
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `RWB_PFI_PLC`
  14: - **database_id**: `RWB_PFI`
  15: - **database**: Press Freedom Index
  16: - **periodicity**: Annual
  17: - **unit**: Score, Rank
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: License Specified Externally
  23: - **uri**: https://rsf.org/en/terms-and-conditions
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/RWB_PFI/RWB_PFI_PLC.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/RWB_PFI/RWB_PFI_PLC.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=RWB_PFI&INDICATOR=RWB_PFI_PLC
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=RWB_PFI
  31: 
  32: ## Definition
  33: 
  34: This indicator aims to evaluate:
  35: - the degree of support and respect for media autonomy vis-à-vis political pressure from the state or from other political actors;
  36: - the level of acceptance of a variety of journalistic approaches satisfying professional standards, including politically aligned approaches and independent approaches;
  37: - the degree of support for the media in their role of holding politicians and government to account in the public interest.
  38: 
  39: 
  40: Please refer to: https://rsf.org/en/methodology-used-compiling-world-press-freedom-index-2024?year=2024&data_type=general
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
  85: | 2022 | 167 | RANK |
  86: | 2023 | 149 | RANK |
  87: | 2024 | 132 | RANK |
  88: | 2025 | 142 | RANK |
  89: 
  90: ### MEX
  91: 
  92: #### Background del país
  93: 
  94: # México (MEX)
  95: 
  96: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  97: 
  98: ## Identification
  99: 
 100: - **iso3**: `MEX`
 101: - **name_es**: México
 102: - **name_en**: Mexico
 103: - **capital**: Ciudad de México
 104: - **population**: ~130 millones (2024, estimación)
 105: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 106: 
 107: #### Serie de este indicador
 108: 
 109: | period | value | unit |
 110: |--------|-------|------|
 111: | 2022 | 82 | RANK |
 112: | 2023 | 88 | RANK |
 113: | 2024 | 81 | RANK |
 114: | 2025 | 84 | RANK |
 115: 
 116: #### Otros indicadores del país, valor más reciente disponible
 117: 
 118: | indicator | period | value | unit |
 119: |-----------|--------|-------|------|
 120: | GOV_WGI_CC | 2024 | -0.940877 | U |
 121: | GOV_WGI_GE | 2024 | -0.219933 | U |
 122: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 123: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 124: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 125: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 126: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 127: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 128: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 129: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 130: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 131: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 132: 
 133: 
 134: ## Reglas de detección activas
 135: 
 136: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 137: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 138: 
 139: ## Candidatos detectados
 140: 
 141: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 142: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 143: 
 144: - candidate_id: cand_anomaly_HND_RWB_PFI_PLC_2025
 145:   type: anomaly
 146:   country: HND
 147:   observation: { period: 2025, value: 142, unit: RANK }
 148:   NOTA UNIDAD: posición global (RANK) — menor número = mejor posición; si el rank sube, la posición empeora. Usá verbos "empeoró"/"mejoró" con "del puesto X al Y", no "aumentó"/"mejoró" por el signo del Δ numérico.
 149:   REDACTAR CON ESTOS VALORES: valor actual (2025): 142 — sin período anterior en la detección
 150:   z_score: 2.10
 151:   regional_median: 114
 152:   claim_id: d4f7a12ebe719391
 153: 
 154: - candidate_id: cand_anomaly_MEX_RWB_PFI_PLC_2025
 155:   type: anomaly
 156:   country: MEX
 157:   observation: { period: 2025, value: 84, unit: RANK }
 158:   NOTA UNIDAD: posición global (RANK) — menor número = mejor posición; si el rank sube, la posición empeora. Usá verbos "empeoró"/"mejoró" con "del puesto X al Y", no "aumentó"/"mejoró" por el signo del Δ numérico.
 159:   REDACTAR CON ESTOS VALORES: valor actual (2025): 84 — sin período anterior en la detección
 160:   z_score: -2.25
 161:   regional_median: 114
 162:   claim_id: f07f94f3fb838407
 163: 
 164: ### allowed_claim_ids
 165: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 166: 
 167: - d4f7a12ebe719391
 168: - f07f94f3fb838407
 169: 
 170: 