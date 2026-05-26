   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ECU. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Inflation, average consumer prices, Percent change
   8: 
   9: > Inflation, average consumer prices, percent change
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `IMF_WEO_PCPIPCH`
  14: - **database_id**: `IMF_WEO`
  15: - **database**: World Economic Outlook (WEO)
  16: - **periodicity**: Annual
  17: - **unit**: Percentage change
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: License Specified Externally
  23: - **uri**: https://www.imf.org/external/terms.htm
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/IMF_WEO/IMF_WEO_PCPIPCH.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/IMF_WEO/IMF_WEO_PCPIPCH.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=IMF_WEO&INDICATOR=IMF_WEO_PCPIPCH
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/IMF_WEO
  31: 
  32: ## Definition
  33: 
  34: Annual percentages of average consumer prices are year-on-year changes.
  35: 
  36: ## Sources
  37: 
  38: - World Economic Outlook (https://www.imf.org/en/publications/weo)
  39: 
  40: ## Topics
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
  66: | 2008 | 8.585 | PC |
  67: | 2009 | 6.27 | PC |
  68: | 2010 | 10.461 | PC |
  69: | 2011 | 9.775 | PC |
  70: | 2012 | 10.043 | PC |
  71: | 2013 | 10.619 | PC |
  72: | 2017 | 25.675 | PC |
  73: | 2018 | 34.277 | PC |
  74: | 2019 | 53.548 | PC |
  75: | 2020 | 42.015 | PC |
  76: | 2021 | 48.409 | PC |
  77: | 2022 | 72.431 | PC |
  78: 
  79: ### ECU
  80: 
  81: #### Background del país
  82: 
  83: # Ecuador (ECU)
  84: 
  85: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  86: 
  87: ## Identification
  88: 
  89: - **iso3**: `ECU`
  90: - **name_es**: Ecuador
  91: - **name_en**: Ecuador
  92: - **capital**: Quito
  93: - **population**: ~18 millones (2024, estimación)
  94: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
  95: 
  96: #### Serie de este indicador
  97: 
  98: | period | value | unit |
  99: |--------|-------|------|
 100: | 2012 | 5.102 | PC |
 101: | 2013 | 2.722 | PC |
 102: | 2014 | 3.589 | PC |
 103: | 2015 | 3.966 | PC |
 104: | 2016 | 1.728 | PC |
 105: | 2017 | 0.417 | PC |
 106: | 2018 | -0.224 | PC |
 107: | 2019 | 0.266 | PC |
 108: | 2020 | -0.339 | PC |
 109: | 2021 | 0.133 | PC |
 110: | 2022 | 3.466 | PC |
 111: | 2023 | 2.216 | PC |
 112: 
 113: #### Otros indicadores del país, valor más reciente disponible
 114: 
 115: | indicator | period | value | unit |
 116: |-----------|--------|-------|------|
 117: | GOV_WGI_CC | 2024 | -0.77568 | U |
 118: | GOV_WGI_GE | 2024 | -0.219613 | U |
 119: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
 120: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 5.650429 | PT_GDP |
 121: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
 122: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
 123: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
 124: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
 125: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
 126: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
 127: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
 128: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
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
 140: - candidate_id: cand_abrupt_change_ARG_IMF_WEO_PCPIPCH_2022
 141:   type: abrupt_change
 142:   country: ARG
 143:   observation: { period: 2022, value: 72.431, unit: PC }
 144:   previous: { period: 2021, value: 48.409 }
 145:   z_score: 2.85
 146:   baseline_mean: 40.7848
 147:   claim_id: d53704c66d869c55
 148: 
 149: - candidate_id: cand_anomaly_ECU_IMF_WEO_PCPIPCH_2023
 150:   type: anomaly
 151:   country: ECU
 152:   observation: { period: 2023, value: 2.216, unit: PC }
 153:   z_score: -4.33
 154:   regional_median: 5.867
 155:   claim_id: 314f0022ae1ce045
 156: 
 157: ### allowed_claim_ids
 158: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 159: 
 160: - d53704c66d869c55
 161: - 314f0022ae1ce045
 162: 
 163: 