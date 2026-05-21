   1: # CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR
   2: 
   3: 
   4: ## Indicador
   5: 
   6: - idno: GOV_WGI_CC
   7: - database_id: WB_WGI
   8: - nombre: Worldwide Governance Indicators: Control of Corruption
   9: - periodicidad: Annual
  10: - dataset URL: https://data360.worldbank.org/en/int/dataset/WB_WGI
  11: - CSV bulk: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_CC.csv
  12: 
  13: ## Definición y metodología
  14: 
  15: # Worldwide Governance Indicators: Control of Corruption
  16: 
  17: > Control of corruption
  18: 
  19: ## Identification
  20: 
  21: - **idno**: `GOV_WGI_CC`
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
  34: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_CC.csv
  35: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WGI/GOV_WGI_CC.json
  36: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WGI&INDICATOR=GOV_WGI_CC
  37: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WGI
  38: 
  39: ## Definition
  40: 
  41: Control of Corruption (CC) captures perceptions of the extent to which public power is used for private gain, including both petty and grand corruption, as well as capture of the state by elites and private interests.
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
  78: | 1996 | -0.777785 | U |
  79: | 1998 | -0.778898 | U |
  80: | 2000 | -0.564655 | U |
  81: | 2002 | -0.799632 | U |
  82: | 2003 | -0.811933 | U |
  83: | 2004 | -0.594333 | U |
  84: | 2005 | -0.639466 | U |
  85: | 2006 | -0.646603 | U |
  86: | 2007 | -0.612308 | U |
  87: | 2008 | -0.460048 | U |
  88: | 2009 | -0.512253 | U |
  89: | 2010 | -0.620941 | U |
  90: | 2011 | -0.551837 | U |
  91: | 2012 | -0.769241 | U |
  92: | 2013 | -0.720212 | U |
  93: | 2014 | -0.870797 | U |
  94: | 2015 | -0.906748 | U |
  95: | 2016 | -0.873698 | U |
  96: | 2017 | -0.883921 | U |
  97: | 2018 | -0.972041 | U |
  98: | 2019 | -1.003857 | U |
  99: | 2020 | -1.099881 | U |
 100: | 2021 | -1.217909 | U |
 101: | 2022 | -1.216663 | U |
 102: | 2023 | -1.086913 | U |
 103: | 2024 | -0.948265 | U |
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
 132: | 1996 | -1.102101 | U |
 133: | 1998 | -1.103213 | U |
 134: | 2000 | -1.041962 | U |
 135: | 2002 | -1.110083 | U |
 136: | 2003 | -1.0388 | U |
 137: | 2004 | -0.989914 | U |
 138: | 2005 | -0.947566 | U |
 139: | 2006 | -0.935612 | U |
 140: | 2007 | -0.927027 | U |
 141: | 2008 | -0.942413 | U |
 142: | 2009 | -1.000739 | U |
 143: | 2010 | -1.001939 | U |
 144: | 2011 | -0.969795 | U |
 145: | 2012 | -1.095529 | U |
 146: | 2013 | -1.106077 | U |
 147: | 2014 | -0.965643 | U |
 148: | 2015 | -0.811178 | U |
 149: | 2016 | -0.924299 | U |
 150: | 2017 | -0.946984 | U |
 151: | 2018 | -0.969579 | U |
 152: | 2019 | -1.058241 | U |
 153: | 2020 | -0.972604 | U |
 154: | 2021 | -1.12042 | U |
 155: | 2022 | -1.031405 | U |
 156: | 2023 | -1.099323 | U |
 157: | 2024 | -1.24469 | U |
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
 186: | 1996 | -0.224841 | U |
 187: | 1998 | -0.417484 | U |
 188: | 2000 | -0.305116 | U |
 189: | 2002 | -0.56214 | U |
 190: | 2003 | -0.548224 | U |
 191: | 2004 | -0.405483 | U |
 192: | 2005 | -0.38908 | U |
 193: | 2006 | -0.320852 | U |
 194: | 2007 | -0.404287 | U |
 195: | 2008 | -0.413776 | U |
 196: | 2009 | -0.397007 | U |
 197: | 2010 | -0.367297 | U |
 198: | 2011 | -0.339635 | U |
 199: | 2012 | -0.516814 | U |
 200: | 2013 | -0.517294 | U |
 201: | 2014 | -0.666054 | U |
 202: | 2015 | -0.645136 | U |
 203: | 2016 | -0.219363 | U |
 204: | 2017 | -0.178142 | U |
 205: | 2018 | -0.005735 | U |
 206: | 2019 | -0.084705 | U |
 207: | 2020 | -0.13447 | U |
 208: | 2021 | -0.32733 | U |
 209: | 2022 | -0.340233 | U |
 210: | 2023 | -0.354078 | U |
 211: | 2024 | -0.325708 | U |
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
 240: | 1996 | -0.532577 | U |
 241: | 1998 | -0.715686 | U |
 242: | 2000 | -0.756352 | U |
 243: | 2002 | -0.803993 | U |
 244: | 2003 | -0.670435 | U |
 245: | 2004 | -0.776023 | U |
 246: | 2005 | -0.83973 | U |
 247: | 2006 | -0.815113 | U |
 248: | 2007 | -0.788617 | U |
 249: | 2008 | -0.716223 | U |
 250: | 2009 | -0.703735 | U |
 251: | 2010 | -0.711729 | U |
 252: | 2011 | -0.66963 | U |
 253: | 2012 | -0.613671 | U |
 254: | 2013 | -0.584111 | U |
 255: | 2014 | -0.755222 | U |
 256: | 2015 | -0.722848 | U |
 257: | 2016 | -0.766105 | U |
 258: | 2017 | -0.775723 | U |
 259: | 2018 | -0.618424 | U |
 260: | 2019 | -0.527363 | U |
 261: | 2020 | -0.518386 | U |
 262: | 2021 | -0.632697 | U |
 263: | 2022 | -0.655353 | U |
 264: | 2023 | -0.719996 | U |
 265: | 2024 | -0.77568 | U |
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
 294: | 1996 | -0.658179 | U |
 295: | 1998 | -0.412542 | U |
 296: | 2000 | -0.052013 | U |
 297: | 2002 | -0.323118 | U |
 298: | 2003 | -0.321736 | U |
 299: | 2004 | -0.456165 | U |
 300: | 2005 | -0.432437 | U |
 301: | 2006 | -0.337979 | U |
 302: | 2007 | -0.402558 | U |
 303: | 2008 | -0.387131 | U |
 304: | 2009 | -0.316012 | U |
 305: | 2010 | -0.383217 | U |
 306: | 2011 | -0.42475 | U |
 307: | 2012 | -0.457957 | U |
 308: | 2013 | -0.531278 | U |
 309: | 2014 | -0.752898 | U |
 310: | 2015 | -0.840904 | U |
 311: | 2016 | -0.821167 | U |
 312: | 2017 | -0.948133 | U |
 313: | 2018 | -0.942749 | U |
 314: | 2019 | -0.889652 | U |
 315: | 2020 | -0.853792 | U |
 316: | 2021 | -0.873387 | U |
 317: | 2022 | -0.875754 | U |
 318: | 2023 | -0.932163 | U |
 319: | 2024 | -0.940877 | U |
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
 345: | ARG | -0.325708 |
 346: | ECU | -0.77568 |
 347: | GTM | -0.948265 |
 348: | HND | -1.24469 |
 349: | MEX | -0.940877 |
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
 360: - candidate_id: cand_abrupt_change_HND_GOV_WGI_CC_2024
 361:   type: abrupt_change
 362:   country: HND
 363:   observation: { period: 2024, value: -1.24469, unit: U }
 364:   previous: { period: 2023, value: -1.099323 }
 365:   z_score: -3.23
 366:   baseline_mean: -1.0563986
 367:   claim_id: 560cfbc8d8ddb767
 368: 
 369: - candidate_id: cand_anomaly_ARG_GOV_WGI_CC_2024
 370:   type: anomaly
 371:   country: ARG
 372:   observation: { period: 2024, value: -0.325708, unit: U }
 373:   z_score: 2.51
 374:   regional_median: -0.940877
 375:   claim_id: 1034608899751295
 376: 
 377: 