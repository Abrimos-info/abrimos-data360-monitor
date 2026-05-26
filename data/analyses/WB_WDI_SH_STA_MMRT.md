   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): GTM. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Maternal mortality ratio (modeled estimate, per 100,000 live births)
   8: 
   9: > Maternal mortality ratio
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_SH_STA_MMRT`
  14: - **database_id**: `WB_WDI`
  15: - **database**: World Development Indicators (WDI)
  16: - **periodicity**: Annual
  17: - **unit**: Per 100,000 live births
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY-4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SH_STA_MMRT.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SH_STA_MMRT.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SH_STA_MMRT
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Maternal mortality ratio is the number of women who die from pregnancy-related causes while pregnant or within 42 days of pregnancy termination per 100,000 live births. The data are estimated with a regression model using information on the proportion of maternal deaths among non-AIDS deaths in women ages 15-49, fertility, birth attendants, and GDP measured using purchasing power parities (PPPs).
  35: 
  36: ## Methodology
  37: 
  38: The estimates are based on an exercise by the Maternal Mortality Estimation Inter-Agency Group (MMEIG) which consists of World Health Organization (WHO), United Nations Children's Fund (UNICEF), World Bank, and United Nations Population Fund (UNFPA), and include country-level time series data. For countries without complete registration data but with other types of data and for countries with no data, maternal mortality is estimated with a regression model using available national maternal mortality data and socioeconomic information.
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
  66: | 2012 | 115 | DT_10P5BR_L |
  67: | 2013 | 111 | DT_10P5BR_L |
  68: | 2014 | 111 | DT_10P5BR_L |
  69: | 2015 | 112 | DT_10P5BR_L |
  70: | 2016 | 110 | DT_10P5BR_L |
  71: | 2017 | 107 | DT_10P5BR_L |
  72: | 2018 | 107 | DT_10P5BR_L |
  73: | 2019 | 106 | DT_10P5BR_L |
  74: | 2020 | 102 | DT_10P5BR_L |
  75: | 2021 | 125 | DT_10P5BR_L |
  76: | 2022 | 97 | DT_10P5BR_L |
  77: | 2023 | 94 | DT_10P5BR_L |
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
  93: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
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
 106: - candidate_id: cand_anomaly_GTM_WB_WDI_SH_STA_MMRT_2023
 107:   type: anomaly
 108:   country: GTM
 109:   observation: { period: 2023, value: 94, unit: DT_10P5BR_L }
 110:   z_score: 3.96
 111:   regional_median: 47
 112:   claim_id: ae6ec5f7de9f676d
 113: 
 114: ### allowed_claim_ids
 115: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 116: 
 117: - ae6ec5f7de9f676d
 118: 
 119: 