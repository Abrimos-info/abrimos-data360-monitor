   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # General government gross debt, % of GDP
   8: 
   9: > General government gross debt, % of GDP
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_CCDFS_GGDY`
  14: - **database_id**: `WB_CCDFS`
  15: - **database**: A Cross-Country Database of Fiscal Space
  16: - **periodicity**: Annual
  17: - **unit**: Percentage
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY 4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_CCDFS/WB_CCDFS_GGDY.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_CCDFS/WB_CCDFS_GGDY.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_CCDFS&INDICATOR=WB_CCDFS_GGDY
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_CCDFS
  31: 
  32: ## Definition
  33: 
  34: General government gross debt, % of GDP
  35: 
  36: ## Methodology
  37: 
  38: For a full description of the methodology: https://www.sciencedirect.com/science/article/pii/S0261560622000857?via%3Dihub
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
  66: | 2011 | 23.779 | PT |
  67: | 2012 | 24.577 | PT |
  68: | 2013 | 24.997 | PT |
  69: | 2014 | 24.651 | PT |
  70: | 2015 | 24.803 | PT |
  71: | 2016 | 24.956 | PT |
  72: | 2017 | 25.093 | PT |
  73: | 2018 | 26.43 | PT |
  74: | 2019 | 26.432 | PT |
  75: | 2020 | 31.48 | PT |
  76: | 2021 | 30.751 | PT |
  77: | 2022 | 29.222 | PT |
  78: 
  79: ### ARG
  80: 
  81: #### Background del país
  82: 
  83: # Argentina (ARG)
  84: 
  85: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  86: 
  87: ## Identification
  88: 
  89: - **iso3**: `ARG`
  90: - **name_es**: Argentina
  91: - **name_en**: Argentina
  92: - **capital**: Ciudad Autónoma de Buenos Aires
  93: - **population**: ~47 millones (2024, estimación)
  94: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
  95: 
  96: #### Serie de este indicador
  97: 
  98: | period | value | unit |
  99: |--------|-------|------|
 100: | 2011 | 38.935 | PT |
 101: | 2012 | 40.436 | PT |
 102: | 2013 | 43.496 | PT |
 103: | 2014 | 44.697 | PT |
 104: | 2015 | 52.563 | PT |
 105: | 2016 | 53.06 | PT |
 106: | 2017 | 57.028 | PT |
 107: | 2018 | 85.246 | PT |
 108: | 2019 | 88.835 | PT |
 109: | 2020 | 102.79 | PT |
 110: | 2021 | 80.82 | PT |
 111: | 2022 | 84.685 | PT |
 112: 
 113: #### Otros indicadores del país, valor más reciente disponible
 114: 
 115: | indicator | period | value | unit |
 116: |-----------|--------|-------|------|
 117: | GOV_WGI_CC | 2024 | -0.325708 | U |
 118: | GOV_WGI_GE | 2024 | 0.183748 | U |
 119: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
 120: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
 121: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 122: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 123: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 124: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 125: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 126: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 127: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 128: | WB_WDI_SI_POV_DDAY | 2024 | 1 | PT_POP |
 129: 
 130: 
 131: ## Reglas de detección activas
 132: 
 133: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 134: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 135: 
 136: ## Candidatos detectados
 137: 
 138: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 139: 
 140: - candidate_id: cand_anomaly_GTM_WB_CCDFS_GGDY_2022
 141:   type: anomaly
 142:   country: GTM
 143:   observation: { period: 2022, value: 29.222, unit: % }
 144:   z_score: -3.36
 145:   regional_median: 54.073
 146:   claim_id: 7f536ec6bea03d4e
 147: 
 148: - candidate_id: cand_anomaly_ARG_WB_CCDFS_GGDY_2022
 149:   type: anomaly
 150:   country: ARG
 151:   observation: { period: 2022, value: 84.685, unit: % }
 152:   z_score: 4.14
 153:   regional_median: 54.073
 154:   claim_id: 581748259e057799
 155: 
 156: ### allowed_claim_ids
 157: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 158: 
 159: - 7f536ec6bea03d4e
 160: - 581748259e057799
 161: 
 162: 