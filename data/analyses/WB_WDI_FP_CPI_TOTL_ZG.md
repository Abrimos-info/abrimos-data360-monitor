   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Inflation, consumer prices (annual % growth)
   8: 
   9: > Inflation, CPI annual %
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_FP_CPI_TOTL_ZG`
  14: - **database_id**: `WB_WDI`
  15: - **database**: World Development Indicators (WDI)
  16: - **periodicity**: Annual
  17: - **unit**: %
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY-4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_FP_CPI_TOTL_ZG.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_FP_CPI_TOTL_ZG.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_FP_CPI_TOTL_ZG
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Inflation as measured by the consumer price index reflects the annual percentage change in the cost to the average consumer of acquiring a basket of goods and services that may be fixed or changed at specified intervals, such as yearly. This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.
  35: 
  36: ## Methodology
  37: 
  38: Consumer Prices Indices are compiled in accordance with international standards: Consumer Price Index Manual, 2020 or 2004 version. Specific information on how countries compile their CPI statistics can be found on the IMF website: https://dsbb.imf.org/
  39: 
  40: ## Sources
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
  66: | 2018 | 34.277224 | PC_A |
  67: | 2019 | 53.548304 | PC_A |
  68: | 2020 | 42.015095 | PC_A |
  69: | 2021 | 48.409379 | PC_A |
  70: | 2022 | 72.430758 | PC_A |
  71: | 2023 | 133.488936 | PC_A |
  72: | 2024 | 219.883929 | PC_A |
  73: 
  74: #### Otros indicadores del país, valor más reciente disponible
  75: 
  76: | indicator | period | value | unit |
  77: |-----------|--------|-------|------|
  78: | GOV_WGI_CC | 2024 | -0.325708 | U |
  79: | GOV_WGI_GE | 2024 | 0.183748 | U |
  80: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
  81: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
  82: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
  83: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
  84: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
  85: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
  86: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
  87: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
  88: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
  89: | WB_WDI_SI_POV_DDAY | 2024 | 1 | PT_POP |
  90: 
  91: 
  92: ## Reglas de detección activas
  93: 
  94: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
  95: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
  96: 
  97: ## Candidatos detectados
  98: 
  99: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 100: 
 101: - candidate_id: cand_abrupt_change_ARG_WB_WDI_FP_CPI_TOTL_ZG_2024
 102:   type: abrupt_change
 103:   country: ARG
 104:   observation: { period: 2024, value: 219.883929, unit: % }
 105:   previous: { period: 2023, value: 133.488936 }
 106:   z_score: 4.02
 107:   baseline_mean: 69.9784944
 108:   claim_id: 9b6df5dd7c4d83a3
 109: 
 110: - candidate_id: cand_anomaly_ARG_WB_WDI_FP_CPI_TOTL_ZG_2024
 111:   type: anomaly
 112:   country: ARG
 113:   observation: { period: 2024, value: 219.883929, unit: % }
 114:   z_score: 83.63
 115:   regional_median: 4.606211
 116:   claim_id: 9b6df5dd7c4d83a3
 117: 
 118: ### allowed_claim_ids
 119: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 120: 
 121: - 9b6df5dd7c4d83a3
 122: - 9b6df5dd7c4d83a3
 123: 
 124: 