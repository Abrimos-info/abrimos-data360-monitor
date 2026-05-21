   1: # CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR
   2: 
   3: 
   4: ## Indicador
   5: 
   6: - idno: GOV_WGI_GE
   7: - database_id: WB_WGI
   8: - nombre: Worldwide Governance Indicators: Government Effectiveness
   9: - periodicidad: Annual
  10: - dataset URL: https://data360.worldbank.org/en/int/dataset/WB_WGI
  11: - CSV bulk: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_GE.csv
  12: 
  13: ## Definición y metodología
  14: 
  15: # Worldwide Governance Indicators: Government Effectiveness
  16: 
  17: > Government effectiveness
  18: 
  19: ## Identification
  20: 
  21: - **idno**: `GOV_WGI_GE`
  22: - **database_id**: `WB_WGI`
  23: - **database**: Worldwide Governance Indicators (WGI)
  24: - **periodicity**: Annual
  25: - **unit**: Unitless
  26: - **confidentiality**: PU
  27: 
  28: ## License
  29: 
  30: - **name**: unspecified
  31: 
  32: ## Links
  33: 
  34: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_GE.csv
  35: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WGI/GOV_WGI_GE.json
  36: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WGI&INDICATOR=GOV_WGI_GE
  37: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WGI
  38: 
  39: ## Definition
  40: 
  41: Government Effectiveness (GE) captures perceptions of the quality of public services, the civil service, policy formulation and implementation, and the credibility of a government’s decisions.
  42: 
  43: ## Methodology
  44: 
  45: The following are the key steps:
  46: STEP 1:  Assigning indicators from the underlying sources to the six governance dimensions.  Individual questions or variables from the underlying data sources are mapped to up to two of the six governance dimensions.
  47: STEP 2:  Rescaling the individual source data to range from 0 to 1.  Each question from the underlying data sources is rescaled to range from 0 to 1, with higher values corresponding to better governance outcomes.
  48: STEP 3:  Using an Unobserved Components Model to construct a governance estimate for each dimension by taking a weighted average of the source-by-dimension data. To aggregate data across multiple sources, the WGI uses a statistical technique known as an Unobserved Components Model (UCM).
  49: STEP 4:  Transforming the UCM-generated governance estimates to a 0–100 absolute governance score. The WGI transform the governance estimates for each country, year, and dimension—typically ranging from approximately –2.5 to 2.5 —into absolute scores on a 0–100 scale, with 100 representing the best absolute governance performance.
  50: 
  51: The following is a summary of the methodology:
  52: https://www.worldbank.org/en/publication/worldwide-governance-indicators/documentation#3
  53: The following is detailed description of the methodology:
  54: https://www.worldbank.org/content/dam/sites/govindicators/doc/The%20Worldwide%20Governance%20Indicators%202025%20Methodology%20Revision.pdf
  55: 
  56: ## Sources
  57: 
  58: - Worldwide Governance Indicators (WGI) (https://datacatalog.worldbank.org/search/dataset/0038026/Worldwide-Governance-Indicators)
  59: 
  60: ## Topics
  61: 
  62: - Prosperity _(WB Practice Groups)_
  63: - Institutions _(Data360 Topic L1)_
  64: - Public Institutions _(Data360 Topic L2)_
  65: 
  66: ## Países y trayectorias
  67: 
  68: ### GTM
  69: 
  70: #### Background del país
  71: 
  72: No disponible en el contexto proporcionado.
  73: 
  74: #### Serie de este indicador
  75: 
  76: | period | value | unit |
  77: |--------|-------|------|
  78: | 1996 | -0.944999 | U |
  79: | 1998 | -0.728223 | U |
  80: | 2000 | -1.047024 | U |
  81: | 2002 | -0.926044 | U |
  82: | 2003 | -0.946189 | U |
  83: | 2004 | -0.889665 | U |
  84: | 2005 | -0.89905 | U |
  85: | 2006 | -0.700804 | U |
  86: | 2007 | -0.672582 | U |
  87: | 2008 | -0.64902 | U |
  88: | 2009 | -0.581593 | U |
  89: | 2010 | -0.607393 | U |
  90: | 2011 | -0.68136 | U |
  91: | 2012 | -0.692263 | U |
  92: | 2013 | -0.64526 | U |
  93: | 2014 | -0.572186 | U |
  94: | 2015 | -0.652723 | U |
  95: | 2016 | -0.675754 | U |
  96: | 2017 | -0.698204 | U |
  97: | 2018 | -0.765142 | U |
  98: | 2019 | -0.777929 | U |
  99: | 2020 | -0.776452 | U |
 100: | 2021 | -0.744434 | U |
 101: | 2022 | -0.884207 | U |
 102: | 2023 | -0.862881 | U |
 103: | 2024 | -0.90937 | U |
 104: 
 105: #### Otros indicadores del país, valor más reciente disponible
 106: 
 107: | indicator | period | value | unit |
 108: |-----------|--------|-------|------|
 109: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6150.025714 | USD |
 110: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.651864 | PC_A |
 111: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 2.869928 | PC_A |
 112: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.632519 | PT_GDP |
 113: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 2.887155 | PT_GDP |
 114: | WB_CCDFS_GGDY | 2022 | 29.222 | PT |
 115: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 12.478014 | PT_REV |
 116: | WB_WDI_SI_POV_GINI | 2023 | 45.2 | 0_TO_100 |
 117: | WB_WDI_SI_POV_DDAY | 2023 | 9.7 | PT_POP |
 118: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
 119: | WB_WDI_SH_STA_MMRT | 2023 | 94 | DT_10P5BR_L |
 120: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
 121: 
 122: ### HND
 123: 
 124: #### Background del país
 125: 
 126: No disponible en el contexto proporcionado.
 127: 
 128: #### Serie de este indicador
 129: 
 130: | period | value | unit |
 131: |--------|-------|------|
 132: | 1996 | -1.180164 | U |
 133: | 1998 | -0.963388 | U |
 134: | 2000 | -1.077682 | U |
 135: | 2002 | -1.024773 | U |
 136: | 2003 | -1.07357 | U |
 137: | 2004 | -0.745263 | U |
 138: | 2005 | -0.697415 | U |
 139: | 2006 | -0.716458 | U |
 140: | 2007 | -0.613212 | U |
 141: | 2008 | -0.686731 | U |
 142: | 2009 | -0.646504 | U |
 143: | 2010 | -0.62548 | U |
 144: | 2011 | -0.604004 | U |
 145: | 2012 | -0.688157 | U |
 146: | 2013 | -0.805053 | U |
 147: | 2014 | -0.600978 | U |
 148: | 2015 | -0.555561 | U |
 149: | 2016 | -0.431288 | U |
 150: | 2017 | -0.419323 | U |
 151: | 2018 | -0.527148 | U |
 152: | 2019 | -0.512528 | U |
 153: | 2020 | -0.582503 | U |
 154: | 2021 | -0.667252 | U |
 155: | 2022 | -0.686258 | U |
 156: | 2023 | -0.657901 | U |
 157: | 2024 | -0.619673 | U |
 158: 
 159: #### Otros indicadores del país, valor más reciente disponible
 160: 
 161: | indicator | period | value | unit |
 162: |-----------|--------|-------|------|
 163: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
 164: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
 165: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
 166: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
 167: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
 168: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
 169: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
 170: | WB_WDI_SI_POV_GINI | 2024 | 45.7 | 0_TO_100 |
 171: | WB_WDI_SI_POV_DDAY | 2024 | 15.7 | PT_POP |
 172: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
 173: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
 174: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
 175: 
 176: ### ARG
 177: 
 178: #### Background del país
 179: 
 180: No disponible en el contexto proporcionado.
 181: 
 182: #### Serie de este indicador
 183: 
 184: | period | value | unit |
 185: |--------|-------|------|
 186: | 1996 | 0.199457 | U |
 187: | 1998 | 0.065758 | U |
 188: | 2000 | 0.010782 | U |
 189: | 2002 | -0.225256 | U |
 190: | 2003 | -0.135875 | U |
 191: | 2004 | -0.023834 | U |
 192: | 2005 | 0.013348 | U |
 193: | 2006 | 0.05189 | U |
 194: | 2007 | 0.000855 | U |
 195: | 2008 | -0.071041 | U |
 196: | 2009 | -0.05848 | U |
 197: | 2010 | 0.007236 | U |
 198: | 2011 | 0.07173 | U |
 199: | 2012 | 0.001394 | U |
 200: | 2013 | -0.016257 | U |
 201: | 2014 | 0.178178 | U |
 202: | 2015 | 0.118702 | U |
 203: | 2016 | 0.342763 | U |
 204: | 2017 | 0.295653 | U |
 205: | 2018 | 0.257748 | U |
 206: | 2019 | 0.262957 | U |
 207: | 2020 | 0.148927 | U |
 208: | 2021 | 0.112565 | U |
 209: | 2022 | 0.108586 | U |
 210: | 2023 | 0.061473 | U |
 211: | 2024 | 0.183748 | U |
 212: 
 213: #### Otros indicadores del país, valor más reciente disponible
 214: 
 215: | indicator | period | value | unit |
 216: |-----------|--------|-------|------|
 217: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 218: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 219: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 220: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
 221: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
 222: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
 223: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 224: | WB_WDI_SI_POV_GINI | 2024 | 42.4 | 0_TO_100 |
 225: | WB_WDI_SI_POV_DDAY | 2024 | 1 | PT_POP |
 226: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 227: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 228: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 229: 
 230: ### ECU
 231: 
 232: #### Background del país
 233: 
 234: No disponible en el contexto proporcionado.
 235: 
 236: #### Serie de este indicador
 237: 
 238: | period | value | unit |
 239: |--------|-------|------|
 240: | 1996 | -0.83122 | U |
 241: | 1998 | -0.537937 | U |
 242: | 2000 | -1.066418 | U |
 243: | 2002 | -1.078758 | U |
 244: | 2003 | -1.038527 | U |
 245: | 2004 | -0.911567 | U |
 246: | 2005 | -0.926587 | U |
 247: | 2006 | -0.902354 | U |
 248: | 2007 | -0.83636 | U |
 249: | 2008 | -0.759748 | U |
 250: | 2009 | -0.478312 | U |
 251: | 2010 | -0.483877 | U |
 252: | 2011 | -0.301058 | U |
 253: | 2012 | -0.292019 | U |
 254: | 2013 | -0.185913 | U |
 255: | 2014 | -0.107604 | U |
 256: | 2015 | -0.193813 | U |
 257: | 2016 | -0.153198 | U |
 258: | 2017 | -0.142592 | U |
 259: | 2018 | -0.213034 | U |
 260: | 2019 | -0.195296 | U |
 261: | 2020 | -0.343507 | U |
 262: | 2021 | -0.110747 | U |
 263: | 2022 | 0.001625 | U |
 264: | 2023 | -0.162534 | U |
 265: | 2024 | -0.219613 | U |
 266: 
 267: #### Otros indicadores del país, valor más reciente disponible
 268: 
 269: | indicator | period | value | unit |
 270: |-----------|--------|-------|------|
 271: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
 272: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
 273: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
 274: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
 275: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 5.650429 | PT_GDP |
 276: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
 277: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
 278: | WB_WDI_SI_POV_GINI | 2025 | 45.9 | 0_TO_100 |
 279: | WB_WDI_SI_POV_DDAY | 2025 | 3.4 | PT_POP |
 280: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
 281: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
 282: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
 283: 
 284: ### MEX
 285: 
 286: #### Background del país
 287: 
 288: No disponible en el contexto proporcionado.
 289: 
 290: #### Serie de este indicador
 291: 
 292: | period | value | unit |
 293: |--------|-------|------|
 294: | 1996 | -0.413603 | U |
 295: | 1998 | 0.037653 | U |
 296: | 2000 | 0.01828 | U |
 297: | 2002 | -0.31513 | U |
 298: | 2003 | -0.270301 | U |
 299: | 2004 | -0.243361 | U |
 300: | 2005 | -0.130268 | U |
 301: | 2006 | -0.085116 | U |
 302: | 2007 | -0.159786 | U |
 303: | 2008 | 0.006614 | U |
 304: | 2009 | 0.103917 | U |
 305: | 2010 | -0.070423 | U |
 306: | 2011 | 0.0989 | U |
 307: | 2012 | 0.198193 | U |
 308: | 2013 | 0.222828 | U |
 309: | 2014 | 0.131427 | U |
 310: | 2015 | 0.099996 | U |
 311: | 2016 | 0.12806 | U |
 312: | 2017 | 0.009986 | U |
 313: | 2018 | -0.026929 | U |
 314: | 2019 | -0.008668 | U |
 315: | 2020 | -0.046266 | U |
 316: | 2021 | -0.045743 | U |
 317: | 2022 | -0.087418 | U |
 318: | 2023 | -0.074865 | U |
 319: | 2024 | -0.219933 | U |
 320: 
 321: #### Otros indicadores del país, valor más reciente disponible
 322: 
 323: | indicator | period | value | unit |
 324: |-----------|--------|-------|------|
 325: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 326: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 327: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 328: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 329: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 330: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 331: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 332: | WB_WDI_SI_POV_GINI | 2024 | 42.6 | 0_TO_100 |
 333: | WB_WDI_SI_POV_DDAY | 2024 | 1.6 | PT_POP |
 334: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 335: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 336: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 337: 
 338: 
 339: ## Comparación regional, último período común
 340: 
 341: Período: 2024
 342: 
 343: | country | value |
 344: |---------|-------|
 345: | ARG | 0.183748 |
 346: | ECU | -0.219613 |
 347: | GTM | -0.90937 |
 348: | HND | -0.619673 |
 349: | MEX | -0.219933 |
 350: 
 351: ## Reglas de detección activas
 352: 
 353: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 354: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 355: 
 356: ## Candidatos detectados
 357: 
 358: Cada candidato fue detectado por el pipeline determinístico. Para cada uno, escribí narrativas bilingües y emitilas en el bloque JSON final.
 359: 
 360: - candidate_id: cand_abrupt_change_MEX_GOV_WGI_GE_2024
 361:   type: abrupt_change
 362:   country: MEX
 363:   observation: { period: 2024, value: -0.219933, unit: U }
 364:   previous: { period: 2023, value: -0.074865 }
 365:   z_score: -5.48
 366:   baseline_mean: -0.05259200000000001
 367:   claim_id: e5a617f33fd81552
 368: 
 369: 