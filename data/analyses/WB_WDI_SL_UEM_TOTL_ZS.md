   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Unemployment, total (% of total labor force) (modeled ILO estimate)
   8: 
   9: > Unemployment, total %
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_SL_UEM_TOTL_ZS`
  14: - **database_id**: `WB_WDI`
  15: - **database**: World Development Indicators (WDI)
  16: - **periodicity**: Annual
  17: - **unit**: % of total labor force
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY-4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SL_UEM_TOTL_ZS.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SL_UEM_TOTL_ZS.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SL_UEM_TOTL_ZS
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Unemployment refers to the share of the labor force that is without work but available for and seeking employment.
  35: 
  36: ## Methodology
  37: 
  38: The unemployment rate is calculated by expressing the number of unemployed persons as a percentage of the total number of persons in the labor force. The labor force (formerly known as the economically active population) is the sum of the number of persons employed and the number of persons unemployed. 
  39: 
  40: The series is part of the "ILO modeled estimates database," including nationally reported observations and imputed data for countries with missing data, primarily to capture regional and global trends with consistent country coverage. Country-reported microdata is based mainly on nationally representative labor force surveys, with other sources (e.g., household surveys and population censuses) considering differences in the data source, the scope of coverage, methodology, and other country-specific factors. Country analysis requires caution where limited nationally reported data are available. A series of models are also applied to impute missing observations and make projections. However, imputed observations are not based on national data, are subject to high uncertainty, and should not be used for country comparisons or rankings. For more information: https://ilostat.ilo.org/resources/concepts-and-definitions/ilo-modelled-estimates/
  41: 
  42: 
  43: ## Países y trayectorias
  44: 
  45: ### ARG
  46: 
  47: #### Background del país
  48: 
  49: # Argentina (ARG)
  50: 
  51: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  52: 
  53: ## Identification
  54: 
  55: - **iso3**: `ARG`
  56: - **name_es**: Argentina
  57: - **name_en**: Argentina
  58: - **capital**: Ciudad Autónoma de Buenos Aires
  59: - **population**: ~47 millones (2024, estimación)
  60: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
  61: 
  62: #### Serie de este indicador
  63: 
  64: | period | value | unit |
  65: |--------|-------|------|
  66: | 2014 | 7.268 | PT_LF |
  67: | 2015 | 7.577 | PT_LF |
  68: | 2016 | 8.088 | PT_LF |
  69: | 2017 | 8.347 | PT_LF |
  70: | 2018 | 9.22 | PT_LF |
  71: | 2019 | 9.843 | PT_LF |
  72: | 2020 | 11.461 | PT_LF |
  73: | 2021 | 8.736 | PT_LF |
  74: | 2022 | 6.805 | PT_LF |
  75: | 2023 | 6.139 | PT_LF |
  76: | 2024 | 7.15 | PT_LF |
  77: | 2025 | 7.145 | PT_LF |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -0.325708 | U |
  84: | GOV_WGI_GE | 2024 | 0.183748 | U |
  85: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
  86: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
  87: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
  88: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
  89: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
  90: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
  91: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
  92: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
  93: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
  94: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
  95: 
  96: 
  97: ## Reglas de detección activas
  98: 
  99: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 100: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 101: 
 102: ## Candidatos detectados
 103: 
 104: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 105: 
 106: - candidate_id: cand_anomaly_ARG_WB_WDI_SL_UEM_TOTL_ZS_2025
 107:   type: anomaly
 108:   country: ARG
 109:   observation: { period: 2025, value: 7.145, unit: PT_LF }
 110:   z_score: 3.68
 111:   regional_median: 3.308
 112:   claim_id: dad1d6be0755c4f1
 113: 
 114: ### allowed_claim_ids
 115: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 116: 
 117: - dad1d6be0755c4f1
 118: 
 119: 