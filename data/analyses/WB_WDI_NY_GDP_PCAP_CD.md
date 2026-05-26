   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): GTM. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # GDP per capita (current US$)
   8: 
   9: > GDP per capita, current USD
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_NY_GDP_PCAP_CD`
  14: - **database_id**: `WB_WDI`
  15: - **database**: World Development Indicators (WDI)
  16: - **periodicity**: Annual
  17: - **unit**: current US$
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY-4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_NY_GDP_PCAP_CD.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_NY_GDP_PCAP_CD.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_NY_GDP_PCAP_CD
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Gross domestic product is the total income earned through the production of goods and services in an economic territory during an accounting period. It can be measured in three different ways: using either the expenditure approach, the income approach, or the production approach. The core indicator has been divided by the general population to achieve a per capita estimate.This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.
  35: 
  36: ## Methodology
  37: 
  38: National accounts are compiled in accordance with international standards: System of National Accounts, 2008 or 1993 versions. Specific information on how countries compile their national accounts can be found on the IMF website: https://dsbb.imf.org/ Per capita estimates are divided by the total population.
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
  66: | 2013 | 3444.158023 | USD |
  67: | 2014 | 3689.145104 | USD |
  68: | 2015 | 3893.505333 | USD |
  69: | 2016 | 4060.137847 | USD |
  70: | 2017 | 4324.997689 | USD |
  71: | 2018 | 4352.945933 | USD |
  72: | 2019 | 4511.998396 | USD |
  73: | 2020 | 4477.61785 | USD |
  74: | 2021 | 4912.622404 | USD |
  75: | 2022 | 5358.70157 | USD |
  76: | 2023 | 5758.327608 | USD |
  77: | 2024 | 6150.025714 | USD |
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
  91: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
  92: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
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
 106: - candidate_id: cand_abrupt_change_GTM_WB_WDI_NY_GDP_PCAP_CD_2024
 107:   type: abrupt_change
 108:   country: GTM
 109:   observation: { period: 2024, value: 6150.025714, unit: USD }
 110:   previous: { period: 2023, value: 5758.327608 }
 111:   z_score: 2.07
 112:   baseline_mean: 5003.8535656
 113:   claim_id: 3ba3c83d8d2449eb
 114: 
 115: ### allowed_claim_ids
 116: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 117: 
 118: - 3ba3c83d8d2449eb
 119: 
 120: 