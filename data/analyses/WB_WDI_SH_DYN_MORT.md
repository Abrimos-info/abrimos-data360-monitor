   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): GTM. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Mortality rate, under-5 (per 1,000 live births)
   8: 
   9: > Under-five mortality
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_SH_DYN_MORT`
  14: - **database_id**: `WB_WDI`
  15: - **database**: World Development Indicators (WDI)
  16: - **periodicity**: Annual
  17: - **unit**: Per 1000 live births
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY-4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SH_DYN_MORT.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SH_DYN_MORT.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SH_DYN_MORT
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Under-five mortality rate is the probability per 1,000 that a newborn baby will die before reaching age five, if subject to age-specific mortality rates of the specified year.
  35: 
  36: ## Methodology
  37: 
  38: Estimates of neonatal, infant, and child mortality tend to vary by source and method for a given time and place. Years for available estimates also vary by country, making comparisons across countries and over time difficult. To make neonatal, infant, and child mortality estimates comparable and to ensure consistency across estimates by different agencies, the United Nations Inter-agency Group for Child Mortality Estimation (UN IGME), which comprises the United Nations Children's Fund (UNICEF), the World Health Organization (WHO), the World Bank, the United Nations Population Division, and other universities and research institutes, developed and adopted a statistical method that uses all available information to reconcile differences. The method uses statistical models to obtain a best estimate trend line by fitting a country-specific regression model of mortality rates against their reference dates.
  39: 
  40: ## Sources
  41: 
  42: 
  43: ## Países y trayectorias
  44: 
  45: ### GTM
  46: 
  47: #### Background del país
  48: 
  49: # Guatemala (GTM)
  50: 
  51: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  52: 
  53: ## Identification
  54: 
  55: - **iso3**: `GTM`
  56: - **name_es**: Guatemala
  57: - **name_en**: Guatemala
  58: - **capital**: Ciudad de Guatemala
  59: - **population**: ~18 millones (2024, estimación)
  60: - **wikipedia**: https://es.wikipedia.org/wiki/Guatemala
  61: 
  62: #### Serie de este indicador
  63: 
  64: | period | value | unit |
  65: |--------|-------|------|
  66: | 2013 | 30.4 | DT_10P3BR_L |
  67: | 2014 | 29.2 | DT_10P3BR_L |
  68: | 2015 | 28.1 | DT_10P3BR_L |
  69: | 2016 | 27 | DT_10P3BR_L |
  70: | 2017 | 26.1 | DT_10P3BR_L |
  71: | 2018 | 25.1 | DT_10P3BR_L |
  72: | 2019 | 24.3 | DT_10P3BR_L |
  73: | 2020 | 23.5 | DT_10P3BR_L |
  74: | 2021 | 22.7 | DT_10P3BR_L |
  75: | 2022 | 21.9 | DT_10P3BR_L |
  76: | 2023 | 21.2 | DT_10P3BR_L |
  77: | 2024 | 20.5 | DT_10P3BR_L |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -0.948265 | U |
  84: | GOV_WGI_GE | 2024 | -0.90937 | U |
  85: | WB_CCDFS_GGDY | 2022 | 29.222 | PT |
  86: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 2.887155 | PT_GDP |
  87: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.632519 | PT_GDP |
  88: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 2.869928 | PC_A |
  89: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 12.478014 | PT_REV |
  90: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.651864 | PC_A |
  91: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6150.025714 | USD |
  92: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
  93: | WB_WDI_SH_STA_MMRT | 2023 | 94 | DT_10P5BR_L |
  94: | WB_WDI_SI_POV_DDAY | 2023 | 9.7 | PT_POP |
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
 106: - candidate_id: cand_anomaly_GTM_WB_WDI_SH_DYN_MORT_2024
 107:   type: anomaly
 108:   country: GTM
 109:   observation: { period: 2024, value: 20.5, unit: DT_10P3BR_L }
 110:   z_score: 2.63
 111:   regional_median: 13.1
 112:   claim_id: 6613138f8f5f9479
 113: 
 114: ### allowed_claim_ids
 115: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 116: 
 117: - 6613138f8f5f9479
 118: 
 119: 