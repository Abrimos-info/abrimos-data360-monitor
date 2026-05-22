   1: # CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR
   2: 
   3: 
   4: ## Definición y metodología
   5: 
   6: # Worldwide Governance Indicators: Control of Corruption
   7: 
   8: > Control of corruption
   9: 
  10: ## Identification
  11: 
  12: - **idno**: `GOV_WGI_CC`
  13: - **database_id**: `WB_WGI`
  14: - **database**: Worldwide Governance Indicators (WGI)
  15: - **periodicity**: Annual
  16: - **unit**: Unitless
  17: - **confidentiality**: PU
  18: 
  19: ## License
  20: 
  21: - **name**: unspecified
  22: 
  23: ## Links
  24: 
  25: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WGI/GOV_WGI_CC.csv
  26: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WGI/GOV_WGI_CC.json
  27: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WGI&INDICATOR=GOV_WGI_CC
  28: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WGI
  29: 
  30: ## Definition
  31: 
  32: Control of Corruption (CC) captures perceptions of the extent to which public power is used for private gain, including both petty and grand corruption, as well as capture of the state by elites and private interests.
  33: 
  34: ## Methodology
  35: 
  36: The following are the key steps:
  37: STEP 1:  Assigning indicators from the underlying sources to the six governance dimensions.  Individual questions or variables from the underlying data sources are mapped to up to two of the six governance dimensions.
  38: STEP 2:  Rescaling the individual source data to range from 0 to 1.  Each question from the underlying data sources is rescaled to range from 0 to 1, with higher values corresponding to better governance outcomes.
  39: STEP 3:  Using an Unobserved Components Model to construct a governance estimate for each dimension by taking a weighted average of the source-by-dimension data. To aggregate data across multiple sources, the WGI uses a statistical technique known as an Unobserved Components Model (UCM).
  40: STEP 4:  Transforming the UCM-generated governance estimates to a 0–100 absolute governance score. The WGI transform the governance estimates for each country, year, and dimension—typically ranging from approximately –2.5 to 2.5 —into absolute scores on a 0–100 scale, with 100 representing the best absolute governance performance.
  41: 
  42: The following is a summary of the methodology:
  43: https://www.worldbank.org/en/publication/worldwide-governance-indicators/documentation#3
  44: The following is detailed description of the methodology:
  45: https://www.worldbank.org/content/dam/sites/govindicators/doc/The%20Worldwide%20Governance%20Indicators%202025%20Methodology%20Revision.pdf
  46: 
  47: ## Sources
  48: 
  49: - Worldwide Governance Indicators (WGI) (https://datacatalog.worldbank.org/search/dataset/0038026/Worldwide-Governance-Indicators)
  50: 
  51: ## Topics
  52: 
  53: - Prosperity _(WB Practice Groups)_
  54: - Institutions _(Data360 Topic L1)_
  55: - Public Institutions _(Data360 Topic L2)_
  56: 
  57: ## Países y trayectorias
  58: 
  59: ### GTM
  60: 
  61: #### Background del país
  62: 
  63: # Guatemala (GTM)
  64: 
  65: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  66: 
  67: ## Identification
  68: 
  69: - **iso3**: `GTM`
  70: - **name_es**: Guatemala
  71: - **name_en**: Guatemala
  72: - **capital**: Ciudad de Guatemala
  73: - **population**: ~18 millones (2024, estimación)
  74: - **wikipedia**: https://es.wikipedia.org/wiki/Guatemala
  75: 
  76: ## Perfil general
  77: 
  78: Guatemala es una república democrática en el extremo noroccidental de América Central. Se divide en 22 departamentos y 340 municipios. Es el país más poblado de Centroamérica y una de las economías medianas de la región, con una población joven y una diversidad étnica y lingüística marcada (población indígena mayoritaria en varios departamentos).
  79: 
  80: ## Economía y desarrollo
  81: 
  82: La economía se apoya en agricultura (café, azúcar, banano), manufactura ligera, remesas y servicios. La desigualdad, la pobreza rural y la inversión social limitada condicionan indicadores de salud, educación y empleo. El quetzal es la moneda nacional. Data360 publica series sobre crecimiento, pobreza, mortalidad materna, participación laboral femenina y gobernanza institucional.
  83: 
  84: ## Temas en agenda pública
  85: 
  86: En 2024–2026 los medios guatemaltecos (Prensa Libre, El Periódico, entre otros) cubren corrupción, migración hacia Estados Unidos, seguridad, precios de alimentos y acceso a servicios de salud. La cobertura indexada por GDELT es más limitada que en países más grandes; los titulares del período se cargan desde `data/news/GTM/`.
  87: 
  88: ## Fuentes
  89: 
  90: - Wikipedia (es), artículo «Guatemala», consultado 2026-05-21. Licencia CC BY-SA 4.0.
  91: - Titulares del período: `data/news/GTM/` (subsistema GDELT, ver `docs/news-architecture.md`).
  92: 
  93: #### Serie de este indicador
  94: 
  95: | period | value | unit |
  96: |--------|-------|------|
  97: | 1996 | -0.777785 | U |
  98: | 1998 | -0.778898 | U |
  99: | 2000 | -0.564655 | U |
 100: | 2002 | -0.799632 | U |
 101: | 2003 | -0.811933 | U |
 102: | 2004 | -0.594333 | U |
 103: | 2005 | -0.639466 | U |
 104: | 2006 | -0.646603 | U |
 105: | 2007 | -0.612308 | U |
 106: | 2008 | -0.460048 | U |
 107: | 2009 | -0.512253 | U |
 108: | 2010 | -0.620941 | U |
 109: | 2011 | -0.551837 | U |
 110: | 2012 | -0.769241 | U |
 111: | 2013 | -0.720212 | U |
 112: | 2014 | -0.870797 | U |
 113: | 2015 | -0.906748 | U |
 114: | 2016 | -0.873698 | U |
 115: | 2017 | -0.883921 | U |
 116: | 2018 | -0.972041 | U |
 117: | 2019 | -1.003857 | U |
 118: | 2020 | -1.099881 | U |
 119: | 2021 | -1.217909 | U |
 120: | 2022 | -1.216663 | U |
 121: | 2023 | -1.086913 | U |
 122: | 2024 | -0.948265 | U |
 123: 
 124: #### Otros indicadores del país, valor más reciente disponible
 125: 
 126: | indicator | period | value | unit |
 127: |-----------|--------|-------|------|
 128: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6150.025714 | USD |
 129: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.651864 | PC_A |
 130: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 2.869928 | PC_A |
 131: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.632519 | PT_GDP |
 132: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 2.887155 | PT_GDP |
 133: | WB_CCDFS_GGDY | 2022 | 29.222 | PT |
 134: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 12.478014 | PT_REV |
 135: | WB_WDI_SI_POV_GINI | 2023 | 45.2 | 0_TO_100 |
 136: | WB_WDI_SI_POV_DDAY | 2023 | 9.7 | PT_POP |
 137: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
 138: | WB_WDI_SH_STA_MMRT | 2023 | 94 | DT_10P5BR_L |
 139: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
 140: 
 141: ### HND
 142: 
 143: #### Background del país
 144: 
 145: # Honduras (HND)
 146: 
 147: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 148: 
 149: ## Identification
 150: 
 151: - **iso3**: `HND`
 152: - **name_es**: Honduras
 153: - **name_en**: Honduras
 154: - **capital**: Tegucigalpa (Distrito Central con Comayagüela)
 155: - **population**: ~10 millones (2024, estimación)
 156: - **wikipedia**: https://es.wikipedia.org/wiki/Honduras
 157: 
 158: ## Perfil general
 159: 
 160: Honduras es un estado unitario en América Central con costas en el Atlántico y el Pacífico. Tegucigalpa y Comayagüela forman el Distrito Central, principal núcleo urbano. San Pedro Sula es el segundo centro económico. El país enfrenta desafíos persistentes de desigualdad, violencia y exposición a huracanes.
 161: 
 162: ## Economía y desarrollo
 163: 
 164: La economía combina agricultura (café, palma, banano), maquila textil, remesas y servicios. El lempira es la moneda nacional. Los indicadores de pobreza, desempleo, salud materno-infantil y gobernanza reflejan presión fiscal limitada y necesidades de inversión social. Data360 aporta series comparables con el resto de la región LAC del demo.
 165: 
 166: ## Temas en agenda pública
 167: 
 168: Entre 2024 y 2026 la prensa hondureña (El Heraldo, La Tribuna, Proceso Digital, entre otros) prioriza seguridad, empleo, corrupción, migración y servicios públicos. GDELT indexa menos medios locales que en Argentina o México; los titulares del período se cargan desde `data/news/HND/`.
 169: 
 170: ## Fuentes
 171: 
 172: - Wikipedia (es), artículo «Honduras», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 173: - Titulares del período: `data/news/HND/` (subsistema GDELT, ver `docs/news-architecture.md`).
 174: 
 175: #### Serie de este indicador
 176: 
 177: | period | value | unit |
 178: |--------|-------|------|
 179: | 1996 | -1.102101 | U |
 180: | 1998 | -1.103213 | U |
 181: | 2000 | -1.041962 | U |
 182: | 2002 | -1.110083 | U |
 183: | 2003 | -1.0388 | U |
 184: | 2004 | -0.989914 | U |
 185: | 2005 | -0.947566 | U |
 186: | 2006 | -0.935612 | U |
 187: | 2007 | -0.927027 | U |
 188: | 2008 | -0.942413 | U |
 189: | 2009 | -1.000739 | U |
 190: | 2010 | -1.001939 | U |
 191: | 2011 | -0.969795 | U |
 192: | 2012 | -1.095529 | U |
 193: | 2013 | -1.106077 | U |
 194: | 2014 | -0.965643 | U |
 195: | 2015 | -0.811178 | U |
 196: | 2016 | -0.924299 | U |
 197: | 2017 | -0.946984 | U |
 198: | 2018 | -0.969579 | U |
 199: | 2019 | -1.058241 | U |
 200: | 2020 | -0.972604 | U |
 201: | 2021 | -1.12042 | U |
 202: | 2022 | -1.031405 | U |
 203: | 2023 | -1.099323 | U |
 204: | 2024 | -1.24469 | U |
 205: 
 206: #### Otros indicadores del país, valor más reciente disponible
 207: 
 208: | indicator | period | value | unit |
 209: |-----------|--------|-------|------|
 210: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
 211: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
 212: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
 213: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
 214: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
 215: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
 216: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
 217: | WB_WDI_SI_POV_GINI | 2024 | 45.7 | 0_TO_100 |
 218: | WB_WDI_SI_POV_DDAY | 2024 | 15.7 | PT_POP |
 219: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
 220: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
 221: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
 222: 
 223: ### ARG
 224: 
 225: #### Background del país
 226: 
 227: # Argentina (ARG)
 228: 
 229: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 230: 
 231: ## Identification
 232: 
 233: - **iso3**: `ARG`
 234: - **name_es**: Argentina
 235: - **name_en**: Argentina
 236: - **capital**: Ciudad Autónoma de Buenos Aires
 237: - **population**: ~47 millones (2024, estimación)
 238: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
 239: 
 240: ## Perfil general
 241: 
 242: Argentina es una república federal democrática en el extremo sur de América del Sur. Integra 23 provincias y la Ciudad Autónoma de Buenos Aires como capital federal. Es la tercera economía de la región y uno de los países con mayor nivel educativo relativo en LAC, con una clase media urbana amplia y un sistema de prensa plural.
 243: 
 244: ## Economía y desarrollo
 245: 
 246: La economía combina agricultura exportadora (soja, maíz, carne), manufactura y servicios. El peso argentino convive con restricciones cambiarias recurrentes, inflación elevada y deuda pública en moneda externa. Los indicadores de pobreza, empleo e inversión extranjera son sensibles a ciclos macro y a la política fiscal y monetaria. El Banco Mundial y el FMI publican series clave sobre PIB, inflación, cuenta corriente y deuda soberana.
 247: 
 248: ## Temas en agenda pública
 249: 
 250: En 2024–2026 el debate público concentra estabilización macro, acuerdo con el FMI, desinflación, empleo formal y acceso al dólar. La prensa nacional (La Nación, Clarín, Infobae, entre otros) cubre de cerca datos del INDEC, riesgo país y reformas estructurales. Los titulares del período de análisis se cargan por separado desde `data/news/ARG/`.
 251: 
 252: ## Fuentes
 253: 
 254: - Wikipedia (es), artículo «Argentina», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 255: - Titulares del período: `data/news/ARG/` (subsistema GDELT, ver `docs/news-architecture.md`).
 256: 
 257: #### Serie de este indicador
 258: 
 259: | period | value | unit |
 260: |--------|-------|------|
 261: | 1996 | -0.224841 | U |
 262: | 1998 | -0.417484 | U |
 263: | 2000 | -0.305116 | U |
 264: | 2002 | -0.56214 | U |
 265: | 2003 | -0.548224 | U |
 266: | 2004 | -0.405483 | U |
 267: | 2005 | -0.38908 | U |
 268: | 2006 | -0.320852 | U |
 269: | 2007 | -0.404287 | U |
 270: | 2008 | -0.413776 | U |
 271: | 2009 | -0.397007 | U |
 272: | 2010 | -0.367297 | U |
 273: | 2011 | -0.339635 | U |
 274: | 2012 | -0.516814 | U |
 275: | 2013 | -0.517294 | U |
 276: | 2014 | -0.666054 | U |
 277: | 2015 | -0.645136 | U |
 278: | 2016 | -0.219363 | U |
 279: | 2017 | -0.178142 | U |
 280: | 2018 | -0.005735 | U |
 281: | 2019 | -0.084705 | U |
 282: | 2020 | -0.13447 | U |
 283: | 2021 | -0.32733 | U |
 284: | 2022 | -0.340233 | U |
 285: | 2023 | -0.354078 | U |
 286: | 2024 | -0.325708 | U |
 287: 
 288: #### Otros indicadores del país, valor más reciente disponible
 289: 
 290: | indicator | period | value | unit |
 291: |-----------|--------|-------|------|
 292: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 293: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 294: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 295: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
 296: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
 297: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
 298: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 299: | WB_WDI_SI_POV_GINI | 2024 | 42.4 | 0_TO_100 |
 300: | WB_WDI_SI_POV_DDAY | 2024 | 1 | PT_POP |
 301: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 302: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 303: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 304: 
 305: ### ECU
 306: 
 307: #### Background del país
 308: 
 309: # Ecuador (ECU)
 310: 
 311: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 312: 
 313: ## Identification
 314: 
 315: - **iso3**: `ECU`
 316: - **name_es**: Ecuador
 317: - **name_en**: Ecuador
 318: - **capital**: Quito
 319: - **population**: ~18 millones (2024, estimación)
 320: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
 321: 
 322: ## Perfil general
 323: 
 324: Ecuador es una república presidencialista unitaria en la región noroccidental de América del Sur. Limita con Colombia y Perú y tiene costa pacífica; el archipiélago de Galápagos forma parte del territorio nacional. Guayaquil es la ciudad más poblada. El país es miembro de la Comunidad Andina y se organiza en 24 provincias.
 325: 
 326: ## Economía y desarrollo
 327: 
 328: La economía depende del petróleo, la agricultura (banano, cacao, flores), la pesca y las remesas. El dólar estadounidense es moneda de curso legal desde 2000, lo que ancla la inflación pero limita la política monetaria. Los indicadores de pobreza, desempleo, inversión y balanza comercial reflejan choques externos en el precio del crudo y presiones fiscales. Data360 concentra series sobre PIB, pobreza, salud y gobernanza.
 329: 
 330: ## Temas en agenda pública
 331: 
 332: Entre 2024 y 2026 la cobertura mediática (El Comercio, La Hora, Plan V, entre otros) sigue seguridad, empleo, servicios básicos, energía y deuda externa. Los titulares del período de análisis se cargan por separado desde `data/news/ECU/`.
 333: 
 334: ## Fuentes
 335: 
 336: - Wikipedia (es), artículo «Ecuador», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 337: - Titulares del período: `data/news/ECU/` (subsistema GDELT, ver `docs/news-architecture.md`).
 338: 
 339: #### Serie de este indicador
 340: 
 341: | period | value | unit |
 342: |--------|-------|------|
 343: | 1996 | -0.532577 | U |
 344: | 1998 | -0.715686 | U |
 345: | 2000 | -0.756352 | U |
 346: | 2002 | -0.803993 | U |
 347: | 2003 | -0.670435 | U |
 348: | 2004 | -0.776023 | U |
 349: | 2005 | -0.83973 | U |
 350: | 2006 | -0.815113 | U |
 351: | 2007 | -0.788617 | U |
 352: | 2008 | -0.716223 | U |
 353: | 2009 | -0.703735 | U |
 354: | 2010 | -0.711729 | U |
 355: | 2011 | -0.66963 | U |
 356: | 2012 | -0.613671 | U |
 357: | 2013 | -0.584111 | U |
 358: | 2014 | -0.755222 | U |
 359: | 2015 | -0.722848 | U |
 360: | 2016 | -0.766105 | U |
 361: | 2017 | -0.775723 | U |
 362: | 2018 | -0.618424 | U |
 363: | 2019 | -0.527363 | U |
 364: | 2020 | -0.518386 | U |
 365: | 2021 | -0.632697 | U |
 366: | 2022 | -0.655353 | U |
 367: | 2023 | -0.719996 | U |
 368: | 2024 | -0.77568 | U |
 369: 
 370: #### Otros indicadores del país, valor más reciente disponible
 371: 
 372: | indicator | period | value | unit |
 373: |-----------|--------|-------|------|
 374: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
 375: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
 376: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
 377: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
 378: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 5.650429 | PT_GDP |
 379: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
 380: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
 381: | WB_WDI_SI_POV_GINI | 2025 | 45.9 | 0_TO_100 |
 382: | WB_WDI_SI_POV_DDAY | 2025 | 3.4 | PT_POP |
 383: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
 384: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
 385: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
 386: 
 387: ### MEX
 388: 
 389: #### Background del país
 390: 
 391: # México (MEX)
 392: 
 393: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 394: 
 395: ## Identification
 396: 
 397: - **iso3**: `MEX`
 398: - **name_es**: México
 399: - **name_en**: Mexico
 400: - **capital**: Ciudad de México
 401: - **population**: ~130 millones (2024, estimación)
 402: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 403: 
 404: ## Perfil general
 405: 
 406: México es una república federal en la parte meridional de América del Norte. Integra 32 entidades federativas; la Ciudad de México es la capital y el principal centro político. Es la segunda economía de América Latina y uno de los mayores exportadores manufactureros del mundo, con integración profunda con Estados Unidos vía T-MEC.
 407: 
 408: ## Economía y desarrollo
 409: 
 410: La economía mezcla manufactura (automotriz, electrónica), petróleo, turismo, remesas y servicios. El peso mexicano es una moneda líquida en mercados emergentes. Los indicadores de pobreza, desigualdad, empleo formal, inversión extranjera y finanzas públicas son centrales en el debate de desarrollo. Data360 concentra series amplias de WB, FMI y otros proveedores para el país.
 411: 
 412: ## Temas en agenda pública
 413: 
 414: En 2024–2026 la prensa nacional (El Universal, Reforma, Animal Político, Excélsior, entre otros) cubre inflación, nearshoring, seguridad, reforma judicial y salud pública. Los titulares del período de análisis se cargan por separado desde `data/news/MEX/`.
 415: 
 416: ## Fuentes
 417: 
 418: - Wikipedia (es), artículo «México», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 419: - Titulares del período: `data/news/MEX/` (subsistema GDELT, ver `docs/news-architecture.md`).
 420: 
 421: #### Serie de este indicador
 422: 
 423: | period | value | unit |
 424: |--------|-------|------|
 425: | 1996 | -0.658179 | U |
 426: | 1998 | -0.412542 | U |
 427: | 2000 | -0.052013 | U |
 428: | 2002 | -0.323118 | U |
 429: | 2003 | -0.321736 | U |
 430: | 2004 | -0.456165 | U |
 431: | 2005 | -0.432437 | U |
 432: | 2006 | -0.337979 | U |
 433: | 2007 | -0.402558 | U |
 434: | 2008 | -0.387131 | U |
 435: | 2009 | -0.316012 | U |
 436: | 2010 | -0.383217 | U |
 437: | 2011 | -0.42475 | U |
 438: | 2012 | -0.457957 | U |
 439: | 2013 | -0.531278 | U |
 440: | 2014 | -0.752898 | U |
 441: | 2015 | -0.840904 | U |
 442: | 2016 | -0.821167 | U |
 443: | 2017 | -0.948133 | U |
 444: | 2018 | -0.942749 | U |
 445: | 2019 | -0.889652 | U |
 446: | 2020 | -0.853792 | U |
 447: | 2021 | -0.873387 | U |
 448: | 2022 | -0.875754 | U |
 449: | 2023 | -0.932163 | U |
 450: | 2024 | -0.940877 | U |
 451: 
 452: #### Otros indicadores del país, valor más reciente disponible
 453: 
 454: | indicator | period | value | unit |
 455: |-----------|--------|-------|------|
 456: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 457: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 458: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 459: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 460: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 461: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 462: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 463: | WB_WDI_SI_POV_GINI | 2024 | 42.6 | 0_TO_100 |
 464: | WB_WDI_SI_POV_DDAY | 2024 | 1.6 | PT_POP |
 465: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 466: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 467: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 468: 
 469: 
 470: ## Discurso público reciente
 471: 
 472: Titulares de prensa para los países del scope.
 473: Período: 2026-04 a 2026-05. Máximo 8 titulares por país, más reciente primero.
 474: Filtro GDELT: 10 temas validados alineados con indicadores anuales (WB_471_ECONOMIC_GROWTH, TAX_ECON_PRICE, WB_698_TRADE, ECON_DEBT, POVERTY, WB_695_POVERTY, WB_642_CHILD_HEALTH, WB_639_REPRODUCTIVE_MATERNAL_AND_CHILD_HEALTH, WB_2748_EMPLOYMENT, CORRUPTION).
 475: 
 476: ### GTM
 477: 
 478: - [2026-05-21] Lahora (lahora.gt): "China y su afán con Taiwán"
 479:   URL: https://lahora.gt/opinion/por-la-transparencia/2026/05/21/china-y-su-afan-con-taiwan/
 480: - [2026-05-21] Lahora (lahora.gt): "Crece presión por ley antilavado : EE . UU . llama a aprobación que cierre la puerta a narcotraficantes y criminales"
 481:   URL: https://lahora.gt/nacionales/ralvarado/2026/05/21/estados-unidos-insta-a-guatemala-a-aprobar-ley-antilavado-con-estandares-del-gafi/
 482: - [2026-05-21] Lahora (lahora.gt): "Inmigrante con 2 deportaciones expeditas podría solicitar perdón migratorio a EE . UU ."
 483:   URL: https://lahora.gt/opinion/fcastro/2026/05/21/inmigrante-con-2-deportaciones-expeditas-podria-solicitar-perdon-migratorio-a-ee-uu-2/
 484: - [2026-05-21] Prensalibre (prensalibre.com): "EE . UU . pide al Congreso de Guatemala aprobar una ley contra el lavado de dinero con estándares internacionales"
 485:   URL: https://www.prensalibre.com/guatemala/politica/ee-uu-pide-al-congreso-de-guatemala-aprobar-una-ley-contra-el-lavado-de-dinero-con-estandares-internacionales-breaking/
 486: - [2026-05-21] Prensalibre (prensalibre.com): "Sheinbaum descarta  gran riesgo  para remesas pese a orden ejecutiva de Trump"
 487:   URL: https://www.prensalibre.com/ahora/internacional/sheinbaum-descarta-gran-riesgo-para-remesas-pese-a-orden-ejecutiva-de-trump/
 488: - [2026-05-21] Emisorasunidas (emisorasunidas.com): "Organizaciones piden al nuevo Fiscal General poner fin a criminalización de periodistas"
 489:   URL: https://emisorasunidas.com/nacional/2026/05/21/organizaciones-fiscal-general-criminalizacion-periodistas-libertad-prensa/
 490: - [2026-05-21] Emisorasunidas (emisorasunidas.com): "Atrapan narcotraficante con droga oculta en mercancía de Kim Kardashian"
 491:   URL: https://emisorasunidas.com/farandula/2026/05/21/atrapan-a-narcotraficante-que-ocultaba-droga-en-mercaderia-de-kim-kardashian/
 492: - [2026-05-21] Publinews (publinews.gt): "Ubican más de Q350 mil en una casa que era usada por pandilleros del Barrio 18"
 493:   URL: https://www.publinews.gt/noticias/2026/05/21/ubican-mas-de-q350-mil-en-una-casa-que-era-usada-por-pandilleros-del-barrio-18/
 494: 
 495: ### HND
 496: 
 497: - [2026-05-21] Proceso (proceso.hn): "Johana Bermúdez llama a vacunarse ante alerta por sarampión en Honduras"
 498:   URL: https://proceso.hn/johana-bermudez-llama-a-vacunarse-ante-alerta-por-sarampion-en-honduras/
 499: - [2026-05-21] Proceso (proceso.hn): "Panamá suspende la venta de energía eléctrica a Costa Rica en medio de pugna comercial"
 500:   URL: https://proceso.hn/panama-suspende-la-venta-de-energia-electrica-a-costa-rica-en-medio-de-pugna-comercial/
 501: - [2026-05-21] Laprensa (laprensa.hn): "Crisis política en Bolivia"
 502:   URL: https://www.laprensa.hn/opinion/columnas/crisis-politica-en-bolivia-DA30743624
 503: - [2026-05-21] Proceso (proceso.hn): "Aranceles de EEUU habrían provocado caída del 5 % en la maquila hondureña"
 504:   URL: https://proceso.hn/aranceles-de-eeuu-habrian-provocado-caida-del-5-en-la-maquila-hondurena/
 505: - [2026-05-21] Proceso (proceso.hn): "Cámaras de Comercio exigen al Congreso enfocarse en generación de empleo"
 506:   URL: https://proceso.hn/camaras-de-comercio-exige-al-congreso-enfocarse-en-generacion-de-empleo/
 507: - [2026-05-21] Abriendobrecha (abriendobrecha.tv): "Fenagh niega carestía de carne y alerta de salida ilegal de ganado hacia México"
 508:   URL: https://abriendobrecha.tv/nacionales/fenagh-niega-carestia-de-carne-y-alerta-de-salida-ilegal-de-ganado-hacia-mexico/
 509: - [2026-05-21] Abriendobrecha (abriendobrecha.tv): "La deuda externa del sector público alcanzó los $10 , 761 . 8 millones"
 510:   URL: https://abriendobrecha.tv/economia/la-deuda-externa-del-sector-publico-alcanzo-los-10761-8-millones/
 511: - [2026-05-21] Laprensa (laprensa.hn): "Piden ayuda para repatriar desde Estados Unidos a Olancho a la hondureña Dariela Galeano"
 512:   URL: https://www.laprensa.hn/mundo/piden-ayuda-repatriar-hondurena-dariela-galeano-estados-unidos-olancho-JA30743648
 513: 
 514: ### ARG
 515: 
 516: - [2026-05-21] Diariosanrafael (diariosanrafael.com.ar): "La actividad económica mostró signos de recuperación : tuvo una suba del 5 , 5 % en marzo"
 517:   URL: https://diariosanrafael.com.ar/la-actividad-economica-mostro-signos-de-recuperacion-tuvo-una-suba-del-55-en-marzo/
 518: - [2026-05-21] Cronica (cronica.com.ar): "Alianza estratégica con Estados Unidos : cómo son los nuevos aviones de vigilancia que recibirá la Armada para custodiar el Mar Argentino"
 519:   URL: https://www.cronica.com.ar/politica/alianza-estrategica-con-estados-unidos-como-son-los-nuevos-aviones-de-vigilancia-que-recibira-la-armada-para-custodiar-el-mar-argentino-5487/
 520: - [2026-05-21] Eldiariodelapampa (eldiariodelapampa.com.ar): "La actividad económica en marzo subió 5 , 5 % y fue la mejor desde junio de 2025 :: El Diario de La Pampa"
 521:   URL: https://www.eldiariodelapampa.com.ar/pais/74461/la-actividad-economica-en-marzo-subio-55-en-porciento--y-fue-la-mejor-desde-junio-de-2025
 522: - [2026-05-21] Cronica (cronica.com.ar): "La Asociación Conciencia y el cóctel que reunió a todos por la educación :  El futuro no se espera : se enseña , se aprende y se construye"
 523:   URL: https://www.cronica.com.ar/politica/la-asociacion-conciencia-y-el-coctel-que-reunio-a-todos-por-la-educacion-el-futuro-no-se-espera-se-ensena-se-aprende-y-se-construye-1857/
 524: - [2026-05-21] Agencianova (agencianova.com): "VIDEO | La casta eran los laburantes : al 70 por ciento de los trabajadores el sueldo les dura menos de medio mes"
 525:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167675&id_tiponota=6
 526: - [2026-05-21] Agencianova (agencianova.com): "La diputada Karina Banfi cruzó al Gobierno por el recorte de Zona Fría y advirtió fuertes subas en las tarifas"
 527:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167676&id_tiponota=4
 528: - [2026-05-21] Agencianova (agencianova.com): "VIDEO | Silvina Soria acusó a una libertaria de comandar ataques en redes y habló de una  fuerte interna  en el partido"
 529:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167684&id_tiponota=4
 530: - [2026-05-21] Diariosanrafael (diariosanrafael.com.ar): "Milei recibió en la Quinta de Olivos a Adorni para repasar la agenda de gestión"
 531:   URL: https://diariosanrafael.com.ar/milei-recibio-en-la-quinta-de-olivos-a-adorni-para-repasar-la-agenda-de-gestion/
 532: 
 533: ### ECU
 534: 
 535: - [2026-05-21] Eldiario (eldiario.ec): "Lavinia y el precio de la fama"
 536:   URL: https://www.eldiario.ec/opinion/lavinia-y-el-precio-de-la-fama/
 537: - [2026-05-21] Eldiario (eldiario.ec): "Familia de Matthew Perry acusa a su exasistente de traición"
 538:   URL: https://www.eldiario.ec/espectaculos/familia-de-matthew-perry-rompe-el-silencio-y-acusa-a-su-exasistente-confiamos-en-un-hombre-sin-conciencia-21052026/
 539: - [2026-05-21] Expreso (expreso.ec): "Ecuador presentará recurso de reconsideración ante la CAN por la tasa de seguridad"
 540:   URL: https://www.expreso.ec/economia-y-negocios/ecuador-presentara-recurso-reconsideracion-can-tasa-seguridad-282903.html
 541: - [2026-05-21] Expreso (expreso.ec): "Comic Con Ecuador confirma la participación de Christopher Masterson en su edición 2026"
 542:   URL: https://www.expreso.ec/entretenimiento/comic-ecuador-confirma-participacion-chris-masterson-edicion-2026-282877.html
 543: - [2026-05-21] Expreso (expreso.ec): "Municipio de Guayaquil crea comité de calidad que reconoce no haber tenido antes"
 544:   URL: https://www.expreso.ec/guayaquil/municipio-guayaquil-crea-comite-calidad-reconoce-no-haber-tenido-282912.html
 545: - [2026-05-21] Expreso (expreso.ec): "Narcopolítica en México : Cártel de Sinaloa se infiltró en ocho municipios en Morelo"
 546:   URL: https://www.expreso.ec/internacional/narcopolitica-mexico-cartel-sinaloa-infiltro-ocho-municipios-morelo-282914.html
 547: - [2026-05-21] Eldiario (eldiario.ec): "Madre muere en ataque armado al comprar pañales en Quevedo"
 548:   URL: https://www.eldiario.ec/seguridad/salio-a-comprar-panales-para-su-hijo-y-murio-en-ataque-armado-en-quevedo-21052026/
 549: - [2026-05-21] Expreso (expreso.ec): "Centenares protestan en La Paz : Las marchas exigen liberar los bloqueos de vías contra el Gobierno"
 550:   URL: https://www.expreso.ec/internacional/centenares-protestan-paz-marchas-exigen-liberar-bloqueos-vias-gobierno-282885.html
 551: 
 552: ### MEX
 553: 
 554: - [2026-05-21] Tiempo (tiempo.com.mx): "Invitan a hamburguesa en favor de Nidia , padece cáncer de rin"
 555:   URL: https://www.tiempo.com.mx/local/hamburguesa-beneficio-nidia-sandoval-cancer-de-rinon/
 556: - [2026-05-21] Eldictamen (eldictamen.mx): "Impulsan reforma constitucional en materia de no reelección y nepotismo electoral"
 557:   URL: https://www.eldictamen.mx/impulsan-reforma-constitucional-en-materia-de-no-reeleccion-y-nepotismo-electoral/
 558: - [2026-05-21] Aciprensa (aciprensa.com): "El don sagrado de la familia debe ser protegido de 4 amenazas actuales , señala obispo"
 559:   URL: https://www.aciprensa.com/noticias/125297/el-don-sagrado-de-la-familia-debe-ser-protegido-de-4-amenazas-actuales-senala-obispo
 560: - [2026-05-21] Tiempo (tiempo.com.mx): "Ex pareja llega armado y dispara contra establecimiento de la Vallarta🎦"
 561:   URL: https://www.tiempo.com.mx/local/agencia-working-las-granjas-avenida-vallarta-ataque-arma-de-postas-movilizacion-policiaca-expareja-disparos-chihuahua-autoridades/
 562: - [2026-05-21] Oem (oem.com.mx): "Inauguran Policía Cibernética Municipal en La Paz"
 563:   URL: https://oem.com.mx:443/elsudcaliforniano/local/inauguran-policia-cibernetica-municipal-en-la-paz-30117921
 564: - [2026-05-21] Criteriohidalgo (criteriohidalgo.com): "Franquicias requieren visión operativa y disciplina"
 565:   URL: https://www.criteriohidalgo.com/first-class/franquicias-requieren-vision-operativa-y-disciplina
 566: - [2026-05-21] Nortedigital (nortedigital.mx): "Retrocede empleo maquilador juarense a como estaba hace 10 años"
 567:   URL: https://nortedigital.mx/retrocede-empleo-maquilador-juarense-a-como-estaba-hace-10-anos/
 568: - [2026-05-21] Elimparcial (elimparcial.com): "Extorsión y sobreregulación golpean al comercio en Tijuana , advierte Concanaco"
 569:   URL: https://www.elimparcial.com/tij/tijuana/2026/05/21/extorsion-y-sobreregulacion-golpean-al-comercio-en-tijuana-advierte-concanaco/
 570: 
 571: 
 572: ## Reglas de detección activas
 573: 
 574: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 575: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 576: 
 577: ## Candidatos detectados
 578: 
 579: Cada candidato fue detectado por el pipeline determinístico. Para cada uno, escribí narrativas bilingües y emitilas en el bloque JSON final.
 580: 
 581: - candidate_id: cand_abrupt_change_HND_GOV_WGI_CC_2024
 582:   type: abrupt_change
 583:   country: HND
 584:   observation: { period: 2024, value: -1.24469, unit: U }
 585:   previous: { period: 2023, value: -1.099323 }
 586:   z_score: -3.23
 587:   baseline_mean: -1.0563986
 588:   claim_id: 560cfbc8d8ddb767
 589: 
 590: - candidate_id: cand_anomaly_ARG_GOV_WGI_CC_2024
 591:   type: anomaly
 592:   country: ARG
 593:   observation: { period: 2024, value: -0.325708, unit: U }
 594:   z_score: 2.51
 595:   regional_median: -0.940877
 596:   claim_id: 1034608899751295
 597: 
 598: 