   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): HND. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Gini index
   8: 
   9: > Gini index
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_SI_POV_GINI`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SI_POV_GINI.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SI_POV_GINI.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SI_POV_GINI
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Gini index measures the extent to which the distribution of income (or, in some cases, consumption expenditure) among individuals or households within an economy deviates from a perfectly equal distribution. A Lorenz curve plots the cumulative percentages of total income received against the cumulative number of recipients, starting with the poorest individual or household. The Gini index measures the area between the Lorenz curve and a hypothetical line of absolute equality, expressed as a percentage of the maximum area under the line. Thus a Gini index of 0 represents perfect equality, while an index of 100 implies perfect inequality.
  35: 
  36: ## Methodology
  37: 
  38: The Gini index measures the area between the Lorenz curve and a hypothetical line of absolute equality, expressed as a percentage of the maximum area under the line. A Lorenz curve plots the cumulative percentages of total income received against the cumulative number of recipients, starting with the poorest individual. Thus a Gini index of 0 represents perfect equality, while an index of 100 implies perfect inequality.
  39: 
  40: The Gini index provides a convenient summary measure of the degree of inequality. Data on the distribution of income or consumption come from nationally representative household surveys. Where the original data from the household survey were available, they have been used to calculate the income or consumption shares by quintile. Otherwise, shares have been estimated from the best available grouped data.
  41: 
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
  66: | 2010 | 53.1 | 0_TO_100 |
  67: | 2011 | 52.6 | 0_TO_100 |
  68: | 2012 | 53.4 | 0_TO_100 |
  69: | 2013 | 50 | 0_TO_100 |
  70: | 2014 | 49.9 | 0_TO_100 |
  71: | 2015 | 49.2 | 0_TO_100 |
  72: | 2016 | 49.8 | 0_TO_100 |
  73: | 2017 | 49.4 | 0_TO_100 |
  74: | 2018 | 48.9 | 0_TO_100 |
  75: | 2019 | 48.2 | 0_TO_100 |
  76: | 2023 | 46.8 | 0_TO_100 |
  77: | 2024 | 45.7 | 0_TO_100 |
  78: 
  79: #### Otros indicadores del país, valor más reciente disponible
  80: 
  81: | indicator | period | value | unit |
  82: |-----------|--------|-------|------|
  83: | GOV_WGI_CC | 2024 | -1.24469 | U |
  84: | GOV_WGI_GE | 2024 | -0.619673 | U |
  85: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
  86: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
  87: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
  88: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
  89: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
  90: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
  91: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
  92: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
  93: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
  94: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
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
 106: - candidate_id: cand_abrupt_change_HND_WB_WDI_SI_POV_GINI_2024
 107:   type: abrupt_change
 108:   country: HND
 109:   observation: { period: 2024, value: 45.7, unit: 0_TO_100 }
 110:   previous: { period: 2023, value: 46.8 }
 111:   z_score: -2.47
 112:   baseline_mean: 48.620000000000005
 113:   claim_id: 69279ed10867aa4f
 114: 
 115: ### allowed_claim_ids
 116: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 117: 
 118: - 69279ed10867aa4f
 119: 
 120: 