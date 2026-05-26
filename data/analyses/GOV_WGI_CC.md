   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): HND. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Worldwide Governance Indicators: Control of Corruption
   8: 
   9: > Control of corruption
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `GOV_WGI_CC`
  14: - **database_id**: `WB_WGI`
  15: - **database**: Worldwide Governance Indicators (WGI)
  16: - **periodicity**: Annual
  17: - **unit**: Unitless
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: unspecified
  23: 
  24: ## Links
  25: 
  26: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_CC.csv
  27: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WGI/GOV_WGI_CC.json
  28: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WGI&INDICATOR=GOV_WGI_CC
  29: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WGI
  30: 
  31: ## Definition
  32: 
  33: Control of Corruption (CC) captures perceptions of the extent to which public power is used for private gain, including both petty and grand corruption, as well as capture of the state by elites and private interests.
  34: 
  35: ## Methodology
  36: 
  37: The following are the key steps:
  38: STEP 1:  Assigning indicators from the underlying sources to the six governance dimensions.  Individual questions or variables from the underlying data sources are mapped to up to two of the six governance dimensions.
  39: STEP 2:  Rescaling the individual source data to range from 0 to 1.  Each question from the underlying data sources is rescaled to range from 0 to 1, with higher values corresponding to better governance outcomes.
  40: STEP 3:  Using an Unobserved Components Model to construct a governance estimate for each dimension by taking a weighted average of the source-by-dimension data. To aggregate data across multiple sources, the WGI uses a statistical technique known as an Unobserved Components Model (UCM).
  41: STEP 4:  Transforming the UCM-generated governance estimates to a 0–100 absolute governance score. The WGI transform the governance estimates for each country, year, and dimension—typically ranging from approximately –2.5 to 2.5 —into absolute scores on a 0–100 scale, with 100 representing the best absolute governance performance.
  42: 
  43: ## Países y trayectorias
  44: 
  45: ### HND
  46: 
  47: #### Background del país
  48: 
  49: # Honduras (HND)
  50: 
  51: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  52: 
  53: ## Identification
  54: 
  55: - **iso3**: `HND`
  56: - **name_es**: Honduras
  57: - **name_en**: Honduras
  58: - **capital**: Tegucigalpa (Distrito Central con Comayagüela)
  59: - **population**: ~10 millones (2024, estimación)
  60: - **wikipedia**: https://es.wikipedia.org/wiki/Honduras
  61: 
  62: #### Serie de este indicador
  63: 
  64: | period | value | unit |
  65: |--------|-------|------|
  66: | 2013 | -1.106077 | U |
  67: | 2014 | -0.965643 | U |
  68: | 2015 | -0.811178 | U |
  69: | 2016 | -0.924299 | U |
  70: | 2017 | -0.946984 | U |
  71: | 2018 | -0.969579 | U |
  72: | 2019 | -1.058241 | U |
  73: | 2020 | -0.972604 | U |
  74: | 2021 | -1.12042 | U |
  75: | 2022 | -1.031405 | U |
  76: | 2023 | -1.099323 | U |
  77: | 2024 | -1.24469 | U |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_GE | 2024 | -0.619673 | U |
  84: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
  85: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
  86: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
  87: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
  88: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
  89: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
  90: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
  91: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
  92: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
  93: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
  94: | WB_WDI_SI_POV_DDAY | 2024 | 15.7 | PT_POP |
  95: 
  96: ### ARG
  97: 
  98: #### Background del país
  99: 
 100: # Argentina (ARG)
 101: 
 102: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 103: 
 104: ## Identification
 105: 
 106: - **iso3**: `ARG`
 107: - **name_es**: Argentina
 108: - **name_en**: Argentina
 109: - **capital**: Ciudad Autónoma de Buenos Aires
 110: - **population**: ~47 millones (2024, estimación)
 111: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
 112: 
 113: #### Serie de este indicador
 114: 
 115: | period | value | unit |
 116: |--------|-------|------|
 117: | 2013 | -0.517294 | U |
 118: | 2014 | -0.666054 | U |
 119: | 2015 | -0.645136 | U |
 120: | 2016 | -0.219363 | U |
 121: | 2017 | -0.178142 | U |
 122: | 2018 | -0.005735 | U |
 123: | 2019 | -0.084705 | U |
 124: | 2020 | -0.13447 | U |
 125: | 2021 | -0.32733 | U |
 126: | 2022 | -0.340233 | U |
 127: | 2023 | -0.354078 | U |
 128: | 2024 | -0.325708 | U |
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
 140: - candidate_id: cand_abrupt_change_HND_GOV_WGI_CC_2024
 141:   type: abrupt_change
 142:   country: HND
 143:   observation: { period: 2024, value: -1.24469, unit: U }
 144:   previous: { period: 2023, value: -1.099323 }
 145:   z_score: -3.23
 146:   baseline_mean: -1.0563986
 147:   claim_id: 560cfbc8d8ddb767
 148: 
 149: - candidate_id: cand_anomaly_ARG_GOV_WGI_CC_2024
 150:   type: anomaly
 151:   country: ARG
 152:   observation: { period: 2024, value: -0.325708, unit: U }
 153:   z_score: 2.51
 154:   regional_median: -0.940877
 155:   claim_id: 1034608899751295
 156: 
 157: ### allowed_claim_ids
 158: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 159: 
 160: - 560cfbc8d8ddb767
 161: - 1034608899751295
 162: 
 163: 