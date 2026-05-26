   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Press Freedom Index Overall Score
   8: 
   9: > RWB_PFI_OVRL
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `RWB_PFI_OVRL`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/RWB_PFI/RWB_PFI_OVRL.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/RWB_PFI/RWB_PFI_OVRL.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=RWB_PFI&INDICATOR=RWB_PFI_OVRL
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=RWB_PFI
  31: 
  32: ## Definition
  33: 
  34: The purpose of the World Press Freedom Index is to compare the level of freedom enjoyed by journalists and media in 180 countries and territories. The definition of press freedom used by RSF and its panel of experts to compile the Index is the following: "Press freedom is defined as the ability of journalists as individuals and collectives to select, produce, and disseminate news in the public interest independent of political, economic, legal, and social interference and in the absence of threats to their physical and mental safety." 
  35: 
  36: On the basis of this definition, the press freedom questionnaire and map are broken down into five distinct categories or indicators (political context, legal framework, economic context, sociocultural context and safety).
  37: 
  38: The Index is a snapshot of the situation during the calendar year (January-December) prior to its publication. Nonetheless, it is meant to be seen as an accurate reflection of the situation at the time of publication. Therefore, when the press freedom situation changes dramatically in a country between the end of the year assessed and publication, the data is updated to take account of the most recent events possible. This may be related to a new war, a coup d'état, a major attack on journalists, or the sudden introduction of an extreme repressive policy.
  39: 
  40: The Index is based on a score ranging from 0 to 100 that is assigned to each country or territory, with 100 being the best possible score (the highest possible level of press freedom) and 0 the worst.
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
  85: | 2014 | 55 | RANK |
  86: | 2015 | 57 | RANK |
  87: | 2016 | 54 | RANK |
  88: | 2017 | 50 | RANK |
  89: | 2018 | 52 | RANK |
  90: | 2019 | 57 | RANK |
  91: | 2020 | 64 | RANK |
  92: | 2021 | 69 | RANK |
  93: | 2022 | 29 | RANK |
  94: | 2023 | 40 | RANK |
  95: | 2024 | 66 | RANK |
  96: | 2025 | 87 | RANK |
  97: 
  98: #### Otros indicadores del país, valor más reciente disponible
  99: 
 100: | indicator | period | value | unit |
 101: |-----------|--------|-------|------|
 102: | GOV_WGI_CC | 2024 | -0.325708 | U |
 103: | GOV_WGI_GE | 2024 | 0.183748 | U |
 104: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
 105: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
 106: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
 107: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 108: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 109: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 110: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 111: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 112: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 113: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 114: 
 115: ### ECU
 116: 
 117: #### Background del país
 118: 
 119: # Ecuador (ECU)
 120: 
 121: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 122: 
 123: ## Identification
 124: 
 125: - **iso3**: `ECU`
 126: - **name_es**: Ecuador
 127: - **name_en**: Ecuador
 128: - **capital**: Quito
 129: - **population**: ~18 millones (2024, estimación)
 130: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
 131: 
 132: #### Serie de este indicador
 133: 
 134: | period | value | unit |
 135: |--------|-------|------|
 136: | 2014 | 95 | RANK |
 137: | 2015 | 108 | RANK |
 138: | 2016 | 109 | RANK |
 139: | 2017 | 105 | RANK |
 140: | 2018 | 92 | RANK |
 141: | 2019 | 97 | RANK |
 142: | 2020 | 98 | RANK |
 143: | 2021 | 96 | RANK |
 144: | 2022 | 68 | RANK |
 145: | 2023 | 80 | RANK |
 146: | 2024 | 110 | RANK |
 147: | 2025 | 94 | RANK |
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
 158: Protagonista (mayor |z|): ARG. Usá sus números en lead, observation y titular.
 159: 
 160: - candidate_id: cand_abrupt_change_ARG_RWB_PFI_OVRL_2025
 161:   type: abrupt_change
 162:   country: ARG
 163:   observation: { period: 2025, value: 87, unit: RANK }
 164:   NOTA UNIDAD: posición global (RANK) — menor número = mejor posición; si el rank sube, la posición empeora. Usá verbos "empeoró"/"mejoró" con "del puesto X al Y", no "aumentó"/"mejoró" por el signo del Δ numérico.
 165:   previous: { period: 2024, value: 66 }
 166:   REDACTAR CON ESTOS VALORES: valor actual (2025): puesto 87; anterior (2024): puesto 66; Δ=+21 puestos — empeoró del puesto 66 al 87 (rank sube = posición global peor)
 167:   z_score: 1.86
 168:   baseline_mean: 53.6
 169:   claim_id: 089d12f2e272b6d3
 170: 
 171: - candidate_id: cand_abrupt_change_ECU_RWB_PFI_OVRL_2025
 172:   type: abrupt_change
 173:   country: ECU
 174:   observation: { period: 2025, value: 94, unit: RANK }
 175:   NOTA UNIDAD: posición global (RANK) — menor número = mejor posición; si el rank sube, la posición empeora. Usá verbos "empeoró"/"mejoró" con "del puesto X al Y", no "aumentó"/"mejoró" por el signo del Δ numérico.
 176:   previous: { period: 2024, value: 110 }
 177:   REDACTAR CON ESTOS VALORES: valor actual (2025): puesto 94; anterior (2024): puesto 110; Δ=-16 puestos — mejoró del puesto 110 al 94 (rank baja = posición global mejor)
 178:   z_score: 0.22
 179:   baseline_mean: 90.4
 180:   claim_id: fe4c4327384d9c2b
 181: 
 182: ### allowed_claim_ids
 183: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 184: 
 185: - 089d12f2e272b6d3
 186: - fe4c4327384d9c2b
 187: 
 188: 