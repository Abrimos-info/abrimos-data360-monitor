   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Worldwide Governance Indicators: Government Effectiveness
   8: 
   9: > Government effectiveness
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `GOV_WGI_GE`
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
  26: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_GE.csv
  27: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WGI/GOV_WGI_GE.json
  28: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WGI&INDICATOR=GOV_WGI_GE
  29: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WGI
  30: 
  31: ## Definition
  32: 
  33: Government Effectiveness (GE) captures perceptions of the quality of public services, the civil service, policy formulation and implementation, and the credibility of a government’s decisions.
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
  66: | 2013 | 0.222828 | U |
  67: | 2014 | 0.131427 | U |
  68: | 2015 | 0.099996 | U |
  69: | 2016 | 0.12806 | U |
  70: | 2017 | 0.009986 | U |
  71: | 2018 | -0.026929 | U |
  72: | 2019 | -0.008668 | U |
  73: | 2020 | -0.046266 | U |
  74: | 2021 | -0.045743 | U |
  75: | 2022 | -0.087418 | U |
  76: | 2023 | -0.074865 | U |
  77: | 2024 | -0.219933 | U |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -0.940877 | U |
  84: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
  85: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
  86: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
  87: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
  88: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
  89: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
  90: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
  91: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
  92: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
  93: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
  94: | WB_WDI_SI_POV_DDAY | 2024 | 1.6 | PT_POP |
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
 106: - candidate_id: cand_abrupt_change_MEX_GOV_WGI_GE_2024
 107:   type: abrupt_change
 108:   country: MEX
 109:   observation: { period: 2024, value: -0.219933, unit: U }
 110:   previous: { period: 2023, value: -0.074865 }
 111:   z_score: -5.48
 112:   baseline_mean: -0.05259200000000001
 113:   claim_id: e5a617f33fd81552
 114: 
 115: ### allowed_claim_ids
 116: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 117: 
 118: - e5a617f33fd81552
 119: 
 120: 