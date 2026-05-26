   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # IIP, Portfolio investment, Debt securities, General government
   8: 
   9: > Government debt securities held by foreigners (IIP)
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `IMF_BOP_IPDG_BP6`
  14: - **database_id**: `IMF_BOP`
  15: - **database**: Balance of Payments (BOP) and International Investment Position (IIP)
  16: - **periodicity**: Annual, Quarterly
  17: - **unit**: USD, Euros, LCU
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: License Specified Externally
  23: - **uri**: https://www.imf.org/external/terms.htm
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/IMF_BOP/IMF_BOP_IPDG_BP6.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/IMF_BOP/IMF_BOP_IPDG_BP6.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=IMF_BOP&INDICATOR=IMF_BOP_IPDG_BP6
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/IMF_BOP
  31: 
  32: ## Definition
  33: 
  34: Please refer to: https://data.imf.org/en/datasets/IMF.STA:BOP_AGG
  35: 
  36: ## Methodology
  37: 
  38: Please refer to: https://www.imf.org/external/pubs/ft/bopman/bopman.pdf
  39: 
  40: ## Sources
  41: 
  42: 
  43: ## Países y trayectorias
  44: 
  45: ### MEX
  46: 
  47: #### Background del país
  48: 
  49: # México (MEX)
  50: 
  51: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  52: 
  53: ## Identification
  54: 
  55: - **iso3**: `MEX`
  56: - **name_es**: México
  57: - **name_en**: Mexico
  58: - **capital**: Ciudad de México
  59: - **population**: ~130 millones (2024, estimación)
  60: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
  61: 
  62: #### Serie de este indicador
  63: 
  64: | period | value | unit |
  65: |--------|-------|------|
  66: | 2022-Q1 | 1.69246e+011 | USD |
  67: | 2022-Q2 | 1.59924e+011 | USD |
  68: | 2022-Q3 | 1.56197e+011 | USD |
  69: | 2022-Q4 | 1.6673e+011 | USD |
  70: | 2023 | 1.88828e+011 | USD |
  71: | 2023-Q1 | 1.78499e+011 | USD |
  72: | 2023-Q2 | 1.8109e+011 | USD |
  73: | 2023-Q3 | 1.75864e+011 | USD |
  74: | 2023-Q4 | 1.88828e+011 | USD |
  75: | 2024-Q1 | 1.98523e+011 | USD |
  76: | 2024-Q2 | 1.86117e+011 | USD |
  77: | 2024-Q3 | 1.86184e+011 | USD |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -0.940877 | U |
  84: | GOV_WGI_GE | 2024 | -0.219933 | U |
  85: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
  86: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
  87: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
  88: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
  89: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
  90: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
  91: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
  92: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
  93: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
  94: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
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
 106: - candidate_id: cand_anomaly_MEX_IMF_BOP_IPDG_BP6_2024_Q3
 107:   type: anomaly
 108:   country: MEX
 109:   observation: { period: 2024-Q3, value: 186184000000, unit: USD }
 110:   z_score: 6.04
 111:   regional_median: 26529000000
 112:   claim_id: a22dcf986bb532f3
 113: 
 114: ### allowed_claim_ids
 115: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 116: 
 117: - a22dcf986bb532f3
 118: 
 119: 