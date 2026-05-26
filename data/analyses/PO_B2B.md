   1: # CONTEXTO SLIM (país(es) candidato(s) únicamente)
   2: 
   3: País protagonista (mayor |z|): ECU. Baseline contextual solo para este país.
   4: 
   5: ## Definición y metodología
   6: 
   7: # Business-to-business postal delivery time
   8: 
   9: > PO_B2B
  10: 
  11: ## Identification
  12: 
  13: - **idno**: `PO_B2B`
  14: - **database_id**: `WB_LPI_20`
  15: - **database**: Logistics Performance Indicators (LPI) 2.0
  16: - **periodicity**: Annual
  17: - **unit**: Days
  18: - **confidentiality**: PU
  19: 
  20: ## License
  21: 
  22: - **name**: CC BY 4.0
  23: - **uri**: https://creativecommons.org/licenses/by/4.0/
  24: 
  25: ## Links
  26: 
  27: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_LPI_20/PO_B2B.csv
  28: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_LPI_20/PO_B2B.json
  29: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_LPI_20&INDICATOR=PO_B2B
  30: - **dataset on Data360**: https://data360.worldbank.org/en/search?query=WB_LPI_20
  31: 
  32: ## Definition
  33: 
  34: Time spent by a business-to-business (B2B) postal item in the importing economy from arrival at the economy’s office of exchange (postal bureau) to first attempted or final delivery. B2B postal items are parcels (up to 30 kilograms) and express shipments.
  35: 
  36: ## Methodology
  37: 
  38: The indicator is calculated using dataset supplied by the Universal Postal Union (UPU). It is sourced from UPU's EMSEVT messaging standard that contains electronic data interchanges for individual tracked postal items enabling granular visibility over their progress along the supply chain. Postal items are usually classified into three categories: letter-post items (documents and small parcels up to 2 kilograms), parcel-post items (larger parcels of at least 2 kilograms), and express mail service (EMS). Records associated with parcel-post and EMS mail classes were categorized as business-to-business (B2B) postal activities. 
  39: B2B postal delivery time is the time difference between the time a postal item arrives at the destination economy and the time the item is either delivered to the customer or an unsuccessful first delivery is attempted.  The mean, median, and interquartile range (20th–80th percentiles) for all shipments in a given year in a given economy are calculated.
  40: The indicator is reported only for economies with more than ten observations/year is observed and with mean and median delivery times at destination exceeding half a day.
  41: More details on the methodology can be found here: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099042226142027181
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
  85: | 2023 | 57.3 | D |
  86: | 2024 | 75.1 | D |
  87: 
  88: #### Otros indicadores del país, valor más reciente disponible
  89: 
  90: | indicator | period | value | unit |
  91: |-----------|--------|-------|------|
  92: | GOV_WGI_CC | 2024 | -0.77568 | U |
  93: | GOV_WGI_GE | 2024 | -0.219613 | U |
  94: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
  95: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 5.650429 | PT_GDP |
  96: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
  97: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
  98: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
  99: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
 100: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
 101: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
 102: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
 103: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
 104: 
 105: 
 106: ## Reglas de detección activas
 107: 
 108: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 109: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 110: 
 111: ## Candidatos detectados
 112: 
 113: Redactá la noticia en español (campos `.es`). Los campos `.en` los completará un paso de traducción posterior.
 114: Protagonista (mayor |z|): ECU. Usá sus números en lead, observation y titular.
 115: 
 116: - candidate_id: cand_anomaly_ECU_PO_B2B_2024
 117:   type: anomaly
 118:   country: ECU
 119:   observation: { period: 2024, value: 75.1, unit: D }
 120:   previous: { period: 2023, value: 57.3 }
 121:   REDACTAR CON ESTOS VALORES: valor actual (2024): 75.1; anterior (2023): 57.3; Δ=+17.799999999999997, +31.1% (sube)
 122:   z_score: 3.24
 123:   regional_median: 27.1
 124:   claim_id: bccbbe39e7c19845
 125: 
 126: ### allowed_claim_ids
 127: Estos son los ÚNICOS valores válidos para `CLAIM_ID` dentro de `{{claim:CLAIM_ID|valor}}`. Cualquier otro será rechazado por la validación automática.
 128: 
 129: - bccbbe39e7c19845
 130: 
 131: 