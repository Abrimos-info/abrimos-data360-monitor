   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ECU. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Current account balance (% of GDP)
   8: 
   9: > Current account balance, % of GDP
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_BN_CAB_XOKA_GD_ZS`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_BN_CAB_XOKA_GD_ZS.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_BN_CAB_XOKA_GD_ZS.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_BN_CAB_XOKA_GD_ZS
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Balance of current transactions (transactions in goods and services, earned income and transfer income) between residents and non-residents. The term current account balance is used in the external accounts and is expressed from the perspective of resident units. The term current external balance is used in the national accounts and is expressed from the perspective of the non-resident units, and therefore with the opposite sign. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.
  35: 
  36: ## Methodology
  37: 
  38: Balance of payments statistics are compiled in accordance with international standards: Balance of Payments and International Investment Position Manual, 6th or 5th editions. Specific information on how countries compile their balance of payments statistics can be found on the IMF website: https://dsbb.imf.org/
  39: 
  40: ## Sources
  41: 
  42: 
  43: ## Países y trayectorias
  44: 
  45: ### ECU
  46: 
  47: #### Background del país
  48: 
  49: # Ecuador (ECU)
  50: 
  51: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  52: 
  53: ## Identification
  54: 
  55: - **iso3**: `ECU`
  56: - **name_es**: Ecuador
  57: - **name_en**: Ecuador
  58: - **capital**: Quito
  59: - **population**: ~18 millones (2024, estimación)
  60: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
  61: 
  62: #### Serie de este indicador
  63: 
  64: | period | value | unit |
  65: |--------|-------|------|
  66: | 2013 | -0.966038 | PT_GDP |
  67: | 2014 | -0.651048 | PT_GDP |
  68: | 2015 | -2.284844 | PT_GDP |
  69: | 2016 | 0.912554 | PT_GDP |
  70: | 2017 | -0.387243 | PT_GDP |
  71: | 2018 | -1.533165 | PT_GDP |
  72: | 2019 | -0.506461 | PT_GDP |
  73: | 2020 | 2.09334 | PT_GDP |
  74: | 2021 | 2.838943 | PT_GDP |
  75: | 2022 | 1.953571 | PT_GDP |
  76: | 2023 | 1.984823 | PT_GDP |
  77: | 2024 | 5.650429 | PT_GDP |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -0.77568 | U |
  84: | GOV_WGI_GE | 2024 | -0.219613 | U |
  85: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
  86: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
  87: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
  88: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
  89: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
  90: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
  91: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
  92: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
  93: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
  94: | WB_WDI_SI_POV_DDAY | 2025 | 3.4 | PT_POP |
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
 106: - candidate_id: cand_abrupt_change_ECU_WB_WDI_BN_CAB_XOKA_GD_ZS_2024
 107:   type: abrupt_change
 108:   country: ECU
 109:   observation: { period: 2024, value: 5.650429, unit: PT_GDP }
 110:   previous: { period: 2023, value: 1.984823 }
 111:   z_score: 3.13
 112:   baseline_mean: 1.6728432000000002
 113:   claim_id: f742660d8165afc8
 114: 
 115: ### allowed_claim_ids
 116: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 117: 
 118: - f742660d8165afc8
 119: 
 120: 