   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ARG. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Unemployment rate, Percent of total labor force
   8: 
   9: > Unemployment rate, percent of total labor force
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `IMF_WEO_LUR`
  14: - **database_id**: `IMF_WEO`
  15: - **database**: World Economic Outlook (WEO)
  16: - **periodicity**: Annual
  17: - **unit**: Percentage of labor force
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: License Specified Externally
  23: - **uri**: https://www.imf.org/external/terms.htm
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/IMF_WEO/IMF_WEO_LUR.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/IMF_WEO/IMF_WEO_LUR.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=IMF_WEO&INDICATOR=IMF_WEO_LUR
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/IMF_WEO
  31: 
  32: ## Definition
  33: 
  34: Unemployment rate can be defined by either the national definition, the ILO harmonized definition, or the OECD harmonized definition. The OECD harmonized unemployment rate gives the number of unemployed persons as a percentage of the labor force (the total number of people employed plus unemployed). [OECD Main Economic Indicators, OECD, monthly] As defined by the International Labour Organization, unemployed workers are those who are currently not working but are willing and able to work for pay, currently available to work, and have actively searched for work. [ILO, http://www.ilo.org/public/english/bureau/stat/res/index.htm]
  35: 
  36: ## Methodology
  37: 
  38: The IMF's World Economic Outlook uses a "bottom-up" approach in producing its forecasts; that is, country teams within the IMF generate projections for individual countries. These are then aggregated, and through a series of iterations where the aggregates feed back into individual countries' forecasts, forecasts converge to the projections reported in the WEO.
  39: 
  40: Because forecasts are made by the individual country teams, the methodology can vary from country to country and series to series depending on many factors. To get more information on a specific country and series forecast, you may contact the country teams directly; from the Countries tab on the IMF website. (From: https://www.imf.org/en/Publications/WEO/frequently-asked-questions#:~:text=%2Ddatabase%2FDisclaimer.-,Q.,generate%20projections%20for%20individual%20countries.)
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
  66: | 2011 | 7.15 | PT_LF |
  67: | 2012 | 7.2 | PT_LF |
  68: | 2013 | 7.075 | PT_LF |
  69: | 2014 | 7.25 | PT_LF |
  70: | 2015 | 6.533 | PT_LF |
  71: | 2016 | 8.467 | PT_LF |
  72: | 2017 | 8.35 | PT_LF |
  73: | 2018 | 9.2 | PT_LF |
  74: | 2019 | 9.825 | PT_LF |
  75: | 2020 | 11.55 | PT_LF |
  76: | 2021 | 8.75 | PT_LF |
  77: | 2022 | 6.825 | PT_LF |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -0.325708 | U |
  84: | GOV_WGI_GE | 2024 | 0.183748 | U |
  85: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
  86: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
  87: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
  88: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
  89: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
  90: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
  91: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
  92: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
  93: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
  94: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
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
 106: - candidate_id: cand_abrupt_change_ARG_IMF_WEO_LUR_2022
 107:   type: abrupt_change
 108:   country: ARG
 109:   observation: { period: 2022, value: 6.825, unit: PT_LF }
 110:   previous: { period: 2021, value: 8.75 }
 111:   z_score: -2.16
 112:   baseline_mean: 9.535
 113:   claim_id: 2a2e030904a94b63
 114: 
 115: ### allowed_claim_ids
 116: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 117: 
 118: - 2a2e030904a94b63
 119: 
 120: 