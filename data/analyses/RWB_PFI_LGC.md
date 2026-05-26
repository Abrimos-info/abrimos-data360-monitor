   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Press Freedom Index: Legal framework
   8: 
   9: > RWB_PFI_LGC
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `RWB_PFI_LGC`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/RWB_PFI/RWB_PFI_LGC.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/RWB_PFI/RWB_PFI_LGC.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=RWB_PFI&INDICATOR=RWB_PFI_LGC
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=RWB_PFI
  31: 
  32: ## Definition
  33: 
  34: This indicator aims to evaluate:
  35: - the degree to which journalists and media are free to work without censorship or judicial sanctions, or excessive restrictions on their freedom of expression;
  36: - the ability to access information without discrimination between journalists, and the ability to protect sources;
  37: - the presence or absence of impunity for those responsible for acts of violence against journalists.
  38: 
  39: Please refer to: https://rsf.org/en/methodology-used-compiling-world-press-freedom-index-2024?year=2024&data_type=general
  40: 
  41: ## Methodology
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
  85: | 2022 | 2 | RANK |
  86: | 2023 | 2 | RANK |
  87: | 2024 | 37 | RANK |
  88: | 2025 | 48 | RANK |
  89: 
  90: #### Otros indicadores del país, valor más reciente disponible
  91: 
  92: | indicator | period | value | unit |
  93: |-----------|--------|-------|------|
  94: | GOV_WGI_CC | 2024 | -0.325708 | U |
  95: | GOV_WGI_GE | 2024 | 0.183748 | U |
  96: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
  97: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
  98: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
  99: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 100: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 101: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 102: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 103: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 104: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 105: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 106: 
 107: 
 108: ## Reglas de detección activas
 109: 
 110: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 111: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 112: 
 113: ## Candidatos detectados
 114: 
 115: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 116: Protagonista (mayor |z|): ARG. Usá sus números en lead, observation y titular.
 117: 
 118: - candidate_id: cand_anomaly_ARG_RWB_PFI_LGC_2025
 119:   type: anomaly
 120:   country: ARG
 121:   observation: { period: 2025, value: 48, unit: RANK }
 122:   NOTA UNIDAD: posición global (RANK) — menor número = mejor posición; si el rank sube, la posición empeora. Usá verbos "empeoró"/"mejoró" con "del puesto X al Y", no "aumentó"/"mejoró" por el signo del Δ numérico.
 123:   previous: { period: 2024, value: 37 }
 124:   REDACTAR CON ESTOS VALORES: valor actual (2025): puesto 48; anterior (2024): puesto 37; Δ=+11 puestos — empeoró del puesto 37 al 48 (rank sube = posición global peor)
 125:   z_score: -2.36
 126:   regional_median: 97
 127:   claim_id: 71eb45d03cc2934a
 128: 
 129: ### allowed_claim_ids
 130: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 131: 
 132: - 71eb45d03cc2934a
 133: 
 134: 