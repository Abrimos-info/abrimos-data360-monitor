   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): MEX. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Remittance inflows (US$ million)
   8: 
   9: > WB_KNOMAD_MRI
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `WB_KNOMAD_MRI`
  14: - **database_id**: `WB_KNOMAD`
  15: - **database**: The Global Knowledge Partnership on Migration and Development (KNOMAD) database
  16: - **periodicity**: Annual
  17: - **unit**: US dollars
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY 4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_KNOMAD/WB_KNOMAD_MRI.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_KNOMAD/WB_KNOMAD_MRI.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_KNOMAD&INDICATOR=WB_KNOMAD_MRI
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_KNOMAD
  31: 
  32: ## Definition
  33: 
  34: Migrant remittance inflows (US$ million)
  35: 
  36: ## Methodology
  37: 
  38: Two key datasets are used to construct the bilateral remittance matrices. The first is the Bilateral Migration Matrix. The Bilateral Migration Matrix provides estimates on immigrant stocks, disaggregated by migrant source countries, in all the countries for which data is available. It is based on data collected from countries’ census bureau and other relevant sources. The second key dataset used in the construction of the Bilateral Remittance Matrix is the remittance inflows data. The remittance inflows data are constructed as the sum, where data is available, of two components in the IMF’s Balance of Payments Statistics: i) compensation of employees, ii) personal transfers. Constructing the Bilateral Remittance Matrix involves allocating a country’s total remittance inflows in a given year to its emigrant stocks estimated in the Bilateral Migration Matrix, adjusting for the migrant sending and receiving countries’ per capita income. It is important to emphasize that this is not an official figure. The methodology used is described in greater detail in the paper: "South-South Migration and Remittances" by Ratha and Shaw (2007).
  39: 
  40: ## Sources
  41: 
  42: 
  43: ## Diccionario de datos (columnas clave del CSV)
  44: 
  45: Glosario de columnas del CSV de Data360 para este indicador (unidades, códigos de área, etc.).
  46: VARIABLE_ID,VARIABLE_LABEL,VARIABLE_DESCRIPTION,VARIABLE_DATA_TYPE,VARIABLE_REQUIRED
  47: STRUCTURE,STRUCTURE,,,False
  48: STRUCTURE_ID,STRUCTURE_ID,,,False
  49: ACTION,ACTION,,,False
  50: FREQ,Frequency of observation,Time interval at which observations occur over a given time period.,String,True
  51: REF_AREA,Reference area,Country or geographic area to which the measured statistical phenomenon relates.,String,True
  52: INDICATOR,Statistical indicator,"Data element that represents statistical data for a specified time, place, and other characteristics, and is corrected for at least one dimension (usually size) to allow for meaningful comparisons.",String,True
  53: SEX,Sex,State of being male or female.,,True
  54: AGE,Age,Length of time that an entity has lived or existed.,String,True
  55: URBANISATION,Degree of urbanisation,"Refers to Total, Urban, or Rural location.",String,True
  56: UNIT_MEASURE,Unit of measure,Unit in which the data values are expressed.,String,True
  57: COMP_BREAKDOWN_1,Custom Dimension 1,,String,True
  58: COMP_BREAKDOWN_2,Custom Dimension 2,,String,True
  59: COMP_BREAKDOWN_3,Custom Dimension 3,,String,True
  60: TIME_PERIOD,Time period,Timespan or point in time to which the observation actually refers.,ObservationalTimePeriod,True
  61: 
  62: ## Países y trayectorias
  63: 
  64: ### ECU
  65: 
  66: #### Background del país
  67: 
  68: # Ecuador (ECU)
  69: 
  70: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  71: 
  72: ## Identification
  73: 
  74: - **iso3**: `ECU`
  75: - **name_es**: Ecuador
  76: - **name_en**: Ecuador
  77: - **capital**: Quito
  78: - **population**: ~18 millones (2024, estimación)
  79: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
  80: 
  81: #### Serie de este indicador
  82: 
  83: | period | value | unit |
  84: |--------|-------|------|
  85: | 2012 | 2476.225962 | USD_CUR |
  86: | 2013 | 2458.803089 | USD_CUR |
  87: | 2014 | 2472.449389 | USD_CUR |
  88: | 2015 | 2387.555892 | USD_CUR |
  89: | 2016 | 2612.1 | USD_CUR |
  90: | 2017 | 2849.068577 | USD_CUR |
  91: | 2018 | 3039.078509 | USD_CUR |
  92: | 2019 | 3242.684317 | USD_CUR |
  93: | 2020 | 3343.696164 | USD_CUR |
  94: | 2021 | 4367.441781 | USD_CUR |
  95: | 2022 | 4747.980446 | USD_CUR |
  96: | 2023 | 5452.432467 | USD_CUR |
  97: 
  98: ### MEX
  99: 
 100: #### Background del país
 101: 
 102: # México (MEX)
 103: 
 104: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 105: 
 106: ## Identification
 107: 
 108: - **iso3**: `MEX`
 109: - **name_es**: México
 110: - **name_en**: Mexico
 111: - **capital**: Ciudad de México
 112: - **population**: ~130 millones (2024, estimación)
 113: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 114: 
 115: #### Serie de este indicador
 116: 
 117: | period | value | unit |
 118: |--------|-------|------|
 119: | 2012 | 24056.599208 | USD_CUR |
 120: | 2013 | 23976.098088 | USD_CUR |
 121: | 2014 | 25556.643773 | USD_CUR |
 122: | 2015 | 26824.907167 | USD_CUR |
 123: | 2016 | 29328.81963 | USD_CUR |
 124: | 2017 | 32922.876924 | USD_CUR |
 125: | 2018 | 36526.305945 | USD_CUR |
 126: | 2019 | 39833.517538 | USD_CUR |
 127: | 2020 | 43977.653965 | USD_CUR |
 128: | 2021 | 55067.02956 | USD_CUR |
 129: | 2022 | 61457.717975 | USD_CUR |
 130: | 2023 | 66238.949308 | USD_CUR |
 131: 
 132: #### Otros indicadores del país, valor más reciente disponible
 133: 
 134: | indicator | period | value | unit |
 135: |-----------|--------|-------|------|
 136: | GOV_WGI_CC | 2024 | -0.940877 | U |
 137: | GOV_WGI_GE | 2024 | -0.219933 | U |
 138: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 139: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 140: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 141: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 142: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 143: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 144: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 145: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 146: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 147: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 148: 
 149: 
 150: ## Reglas de detección activas
 151: 
 152: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 153: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 154: 
 155: ## Candidatos detectados
 156: 
 157: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 158: Protagonista (mayor |z|): MEX. Usá sus números en lead, observation y titular.
 159: 
 160: - candidate_id: cand_abrupt_change_ECU_WB_KNOMAD_MRI_2023
 161:   type: abrupt_change
 162:   country: ECU
 163:   observation: { period: 2023, value: 5452.432467, unit: USD_CUR }
 164:   previous: { period: 2022, value: 4747.980446 }
 165:   REDACTAR CON ESTOS VALORES: valor actual (2023): 5452.432467; anterior (2022): 4747.980446; Δ=+704.4520210000001, +14.8% (sube)
 166:   z_score: 2.25
 167:   baseline_mean: 3748.1762434
 168:   claim_id: 2b7351dc67613dbb
 169: 
 170: - candidate_id: cand_anomaly_MEX_WB_KNOMAD_MRI_2023
 171:   type: anomaly
 172:   country: MEX
 173:   observation: { period: 2023, value: 66238.949308, unit: USD_CUR }
 174:   previous: { period: 2022, value: 61457.717975 }
 175:   REDACTAR CON ESTOS VALORES: valor actual (2023): 66238.949308; anterior (2022): 61457.717975; Δ=+4781.231332999996, +7.8% (sube)
 176:   z_score: 4.91
 177:   regional_median: 8968.206468
 178:   claim_id: bd0fc0c13fce421f
 179: 
 180: ### allowed_claim_ids
 181: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 182: 
 183: - 2b7351dc67613dbb
 184: - bd0fc0c13fce421f
 185: 
 186: 