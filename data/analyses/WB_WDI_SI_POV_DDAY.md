   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): HND. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Poverty headcount ratio at $3.00 a day (2021 PPP) (% of population)
   8: 
   9: > Poverty headcount at $2.15/day
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_WDI_SI_POV_DDAY`
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
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SI_POV_DDAY.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SI_POV_DDAY.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SI_POV_DDAY
  30: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  31: 
  32: ## Definition
  33: 
  34: Poverty headcount ratio at $3.00 a day is the percentage of the population living on less than $3.00 a day at 2021 purchasing power adjusted prices. As a result of revisions in PPP exchange rates, poverty rates for individual countries cannot be compared with poverty rates reported in earlier editions.
  35: 
  36: ## Methodology
  37: 
  38: International comparisons of poverty estimates entail both conceptual and practical problems. Countries have different definitions of poverty, and consistent comparisons across countries can be difficult. Local poverty lines tend to have higher purchasing power in rich countries, where more generous standards are used, than in poor countries.
  39: 
  40: Since World Development Report 1990, the World Bank has aimed to apply a common standard in measuring extreme poverty, anchored to what poverty means in the world's poorest countries. The welfare of people living in different countries can be measured on a common scale by adjusting for differences in the purchasing power of currencies. The commonly used $1 a day standard, measured in 1985 international prices and adjusted to local currency using purchasing power parities (PPPs), was chosen for World Development Report 1990 because it was typical of the poverty lines in low-income countries at the time. As differences in the cost of living across the world evolve, the international poverty line has to be periodically updated using new PPP price data to reflect these changes. The last change was in September 2022, when we adopted $3.00 as the international poverty line using the 2021 PPP. Poverty measures based on international poverty lines attempt to hold the real value of the poverty line constant across countries, as is done when making comparisons over time. The $4.20 poverty line is derived from typical national poverty lines in countries classified as Lower Middle Income. The $8.30 poverty line is derived from typical national poverty lines in countries classified as Upper Middle Income.
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
  66: | 2010 | 19.6 | PT_POP |
  67: | 2011 | 20.1 | PT_POP |
  68: | 2012 | 24 | PT_POP |
  69: | 2013 | 20.8 | PT_POP |
  70: | 2014 | 20.6 | PT_POP |
  71: | 2015 | 19.9 | PT_POP |
  72: | 2016 | 19.8 | PT_POP |
  73: | 2017 | 19.3 | PT_POP |
  74: | 2018 | 19.8 | PT_POP |
  75: | 2019 | 18.8 | PT_POP |
  76: | 2023 | 17 | PT_POP |
  77: | 2024 | 15.7 | PT_POP |
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
 106: - candidate_id: cand_abrupt_change_HND_WB_WDI_SI_POV_DDAY_2024
 107:   type: abrupt_change
 108:   country: HND
 109:   observation: { period: 2024, value: 15.7, unit: PT_POP }
 110:   previous: { period: 2023, value: 17 }
 111:   z_score: -2.79
 112:   baseline_mean: 18.94
 113:   claim_id: 8c6bba0568efc716
 114: 
 115: - candidate_id: cand_anomaly_HND_WB_WDI_SI_POV_DDAY_2024
 116:   type: anomaly
 117:   country: HND
 118:   observation: { period: 2024, value: 15.7, unit: PT_POP }
 119:   z_score: 2.41
 120:   regional_median: 4.45
 121:   claim_id: 8c6bba0568efc716
 122: 
 123: ### allowed_claim_ids
 124: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 125: 
 126: - 8c6bba0568efc716
 127: - 8c6bba0568efc716
 128: 
 129: 