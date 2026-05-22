   1: # CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR
   2: 
   3: 
   4: ## Definición y metodología
   5: 
   6: # Gini index
   7: 
   8: > Gini index
   9: 
  10: ## Identification
  11: 
  12: - **idno**: `WB_WDI_SI_POV_GINI`
  13: - **database_id**: `WB_WDI`
  14: - **database**: World Development Indicators (WDI)
  15: - **periodicity**: Annual
  16: - **unit**: %
  17: - **confidentiality**: PU
  18: 
  19: ## License
  20: 
  21: - **name**: CC BY-4.0
  22: - **uri**: https://creativecommons.org/licenses/by/4.0/
  23: 
  24: ## Links
  25: 
  26: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SI_POV_GINI.csv
  27: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SI_POV_GINI.json
  28: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SI_POV_GINI
  29: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  30: 
  31: ## Definition
  32: 
  33: Gini index measures the extent to which the distribution of income (or, in some cases, consumption expenditure) among individuals or households within an economy deviates from a perfectly equal distribution. A Lorenz curve plots the cumulative percentages of total income received against the cumulative number of recipients, starting with the poorest individual or household. The Gini index measures the area between the Lorenz curve and a hypothetical line of absolute equality, expressed as a percentage of the maximum area under the line. Thus a Gini index of 0 represents perfect equality, while an index of 100 implies perfect inequality.
  34: 
  35: ## Methodology
  36: 
  37: The Gini index measures the area between the Lorenz curve and a hypothetical line of absolute equality, expressed as a percentage of the maximum area under the line. A Lorenz curve plots the cumulative percentages of total income received against the cumulative number of recipients, starting with the poorest individual. Thus a Gini index of 0 represents perfect equality, while an index of 100 implies perfect inequality.
  38: 
  39: The Gini index provides a convenient summary measure of the degree of inequality. Data on the distribution of income or consumption come from nationally representative household surveys. Where the original data from the household survey were available, they have been used to calculate the income or consumption shares by quintile. Otherwise, shares have been estimated from the best available grouped data.
  40: 
  41: The distribution data have been adjusted for household size, providing a more consistent measure of per capita income or consumption. 
  42: 
  43: The year reflects the year in which the underlying household survey data were collected or, when the data collection period bridged two calendar years, the year data collection started.
  44: 
  45: ## Sources
  46: 
  47: - World Bank, Poverty and Inequality Platform. Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database. For more information and methodology, please see http://pip.worldbank.org. (http://pip.worldbank.org)
  48: 
  49: ## Topics
  50: 
  51: - Prosperity _(WB Practice Groups)_
  52: - Poverty _(Data360 Topic L1)_
  53: - Inequality and Shared Prosperity _(Data360 Topic L2)_
  54: - Infrastructure _(WB Practice Groups)_
  55: - Urban, Resilience and Land _(Data360 Topic L1)_
  56: - Housing _(Data360 Topic L2)_
  57: 
  58: ## Países y trayectorias
  59: 
  60: ### GTM
  61: 
  62: #### Background del país
  63: 
  64: # Guatemala (GTM)
  65: 
  66: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  67: 
  68: ## Identification
  69: 
  70: - **iso3**: `GTM`
  71: - **name_es**: Guatemala
  72: - **name_en**: Guatemala
  73: - **capital**: Ciudad de Guatemala
  74: - **population**: ~18 millones (2024, estimación)
  75: - **wikipedia**: https://es.wikipedia.org/wiki/Guatemala
  76: 
  77: ## Perfil general
  78: 
  79: Guatemala es una república democrática en el extremo noroccidental de América Central. Se divide en 22 departamentos y 340 municipios. Es el país más poblado de Centroamérica y una de las economías medianas de la región, con una población joven y una diversidad étnica y lingüística marcada (población indígena mayoritaria en varios departamentos).
  80: 
  81: ## Economía y desarrollo
  82: 
  83: La economía se apoya en agricultura (café, azúcar, banano), manufactura ligera, remesas y servicios. La desigualdad, la pobreza rural y la inversión social limitada condicionan indicadores de salud, educación y empleo. El quetzal es la moneda nacional. Data360 publica series sobre crecimiento, pobreza, mortalidad materna, participación laboral femenina y gobernanza institucional.
  84: 
  85: ## Temas en agenda pública
  86: 
  87: En 2024–2026 los medios guatemaltecos (Prensa Libre, El Periódico, entre otros) cubren corrupción, migración hacia Estados Unidos, seguridad, precios de alimentos y acceso a servicios de salud. La cobertura indexada por GDELT es más limitada que en países más grandes; los titulares del período se cargan desde `data/news/GTM/`.
  88: 
  89: ## Fuentes
  90: 
  91: - Wikipedia (es), artículo «Guatemala», consultado 2026-05-21. Licencia CC BY-SA 4.0.
  92: - Titulares del período: `data/news/GTM/` (subsistema GDELT, ver `docs/news-architecture.md`).
  93: 
  94: #### Serie de este indicador
  95: 
  96: | period | value | unit |
  97: |--------|-------|------|
  98: | 1986 | 54.1 | 0_TO_100 |
  99: | 1989 | 58.8 | 0_TO_100 |
 100: | 1998 | 49.4 | 0_TO_100 |
 101: | 2000 | 54.2 | 0_TO_100 |
 102: | 2006 | 54.5 | 0_TO_100 |
 103: | 2014 | 48.3 | 0_TO_100 |
 104: | 2023 | 45.2 | 0_TO_100 |
 105: 
 106: #### Otros indicadores del país, valor más reciente disponible
 107: 
 108: | indicator | period | value | unit |
 109: |-----------|--------|-------|------|
 110: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6150.025714 | USD |
 111: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.651864 | PC_A |
 112: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 2.869928 | PC_A |
 113: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.632519 | PT_GDP |
 114: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 2.887155 | PT_GDP |
 115: | WB_CCDFS_GGDY | 2022 | 29.222 | PT |
 116: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 12.478014 | PT_REV |
 117: | WB_WDI_SI_POV_DDAY | 2023 | 9.7 | PT_POP |
 118: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
 119: | WB_WDI_SH_STA_MMRT | 2023 | 94 | DT_10P5BR_L |
 120: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
 121: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 38.324 | PT_W |
 122: 
 123: ### HND
 124: 
 125: #### Background del país
 126: 
 127: # Honduras (HND)
 128: 
 129: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 130: 
 131: ## Identification
 132: 
 133: - **iso3**: `HND`
 134: - **name_es**: Honduras
 135: - **name_en**: Honduras
 136: - **capital**: Tegucigalpa (Distrito Central con Comayagüela)
 137: - **population**: ~10 millones (2024, estimación)
 138: - **wikipedia**: https://es.wikipedia.org/wiki/Honduras
 139: 
 140: ## Perfil general
 141: 
 142: Honduras es un estado unitario en América Central con costas en el Atlántico y el Pacífico. Tegucigalpa y Comayagüela forman el Distrito Central, principal núcleo urbano. San Pedro Sula es el segundo centro económico. El país enfrenta desafíos persistentes de desigualdad, violencia y exposición a huracanes.
 143: 
 144: ## Economía y desarrollo
 145: 
 146: La economía combina agricultura (café, palma, banano), maquila textil, remesas y servicios. El lempira es la moneda nacional. Los indicadores de pobreza, desempleo, salud materno-infantil y gobernanza reflejan presión fiscal limitada y necesidades de inversión social. Data360 aporta series comparables con el resto de la región LAC del demo.
 147: 
 148: ## Temas en agenda pública
 149: 
 150: Entre 2024 y 2026 la prensa hondureña (El Heraldo, La Tribuna, Proceso Digital, entre otros) prioriza seguridad, empleo, corrupción, migración y servicios públicos. GDELT indexa menos medios locales que en Argentina o México; los titulares del período se cargan desde `data/news/HND/`.
 151: 
 152: ## Fuentes
 153: 
 154: - Wikipedia (es), artículo «Honduras», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 155: - Titulares del período: `data/news/HND/` (subsistema GDELT, ver `docs/news-architecture.md`).
 156: 
 157: #### Serie de este indicador
 158: 
 159: | period | value | unit |
 160: |--------|-------|------|
 161: | 1991 | 51.8 | 0_TO_100 |
 162: | 1992 | 51.8 | 0_TO_100 |
 163: | 1993 | 53.4 | 0_TO_100 |
 164: | 1994 | 55 | 0_TO_100 |
 165: | 1995 | 55.5 | 0_TO_100 |
 166: | 1996 | 55.7 | 0_TO_100 |
 167: | 1997 | 52.7 | 0_TO_100 |
 168: | 1998 | 57.3 | 0_TO_100 |
 169: | 1999 | 55.2 | 0_TO_100 |
 170: | 2001 | 55.4 | 0_TO_100 |
 171: | 2002 | 55.7 | 0_TO_100 |
 172: | 2003 | 58.1 | 0_TO_100 |
 173: | 2004 | 58.1 | 0_TO_100 |
 174: | 2005 | 59.5 | 0_TO_100 |
 175: | 2006 | 57.5 | 0_TO_100 |
 176: | 2007 | 55.8 | 0_TO_100 |
 177: | 2008 | 55.5 | 0_TO_100 |
 178: | 2009 | 51.3 | 0_TO_100 |
 179: | 2010 | 53.1 | 0_TO_100 |
 180: | 2011 | 52.6 | 0_TO_100 |
 181: | 2012 | 53.4 | 0_TO_100 |
 182: | 2013 | 50 | 0_TO_100 |
 183: | 2014 | 49.9 | 0_TO_100 |
 184: | 2015 | 49.2 | 0_TO_100 |
 185: | 2016 | 49.8 | 0_TO_100 |
 186: | 2017 | 49.4 | 0_TO_100 |
 187: | 2018 | 48.9 | 0_TO_100 |
 188: | 2019 | 48.2 | 0_TO_100 |
 189: | 2023 | 46.8 | 0_TO_100 |
 190: | 2024 | 45.7 | 0_TO_100 |
 191: 
 192: #### Otros indicadores del país, valor más reciente disponible
 193: 
 194: | indicator | period | value | unit |
 195: |-----------|--------|-------|------|
 196: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
 197: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
 198: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
 199: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
 200: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
 201: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
 202: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
 203: | WB_WDI_SI_POV_DDAY | 2024 | 15.7 | PT_POP |
 204: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
 205: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
 206: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
 207: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 39.59 | PT_W |
 208: 
 209: ### ARG
 210: 
 211: #### Background del país
 212: 
 213: # Argentina (ARG)
 214: 
 215: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 216: 
 217: ## Identification
 218: 
 219: - **iso3**: `ARG`
 220: - **name_es**: Argentina
 221: - **name_en**: Argentina
 222: - **capital**: Ciudad Autónoma de Buenos Aires
 223: - **population**: ~47 millones (2024, estimación)
 224: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
 225: 
 226: ## Perfil general
 227: 
 228: Argentina es una república federal democrática en el extremo sur de América del Sur. Integra 23 provincias y la Ciudad Autónoma de Buenos Aires como capital federal. Es la tercera economía de la región y uno de los países con mayor nivel educativo relativo en LAC, con una clase media urbana amplia y un sistema de prensa plural.
 229: 
 230: ## Economía y desarrollo
 231: 
 232: La economía combina agricultura exportadora (soja, maíz, carne), manufactura y servicios. El peso argentino convive con restricciones cambiarias recurrentes, inflación elevada y deuda pública en moneda externa. Los indicadores de pobreza, empleo e inversión extranjera son sensibles a ciclos macro y a la política fiscal y monetaria. El Banco Mundial y el FMI publican series clave sobre PIB, inflación, cuenta corriente y deuda soberana.
 233: 
 234: ## Temas en agenda pública
 235: 
 236: En 2024–2026 el debate público concentra estabilización macro, acuerdo con el FMI, desinflación, empleo formal y acceso al dólar. La prensa nacional (La Nación, Clarín, Infobae, entre otros) cubre de cerca datos del INDEC, riesgo país y reformas estructurales. Los titulares del período de análisis se cargan por separado desde `data/news/ARG/`.
 237: 
 238: ## Fuentes
 239: 
 240: - Wikipedia (es), artículo «Argentina», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 241: - Titulares del período: `data/news/ARG/` (subsistema GDELT, ver `docs/news-architecture.md`).
 242: 
 243: #### Serie de este indicador
 244: 
 245: | period | value | unit |
 246: |--------|-------|------|
 247: | 1994 | 45.9 | 0_TO_100 |
 248: | 1995 | 48.9 | 0_TO_100 |
 249: | 1996 | 49.5 | 0_TO_100 |
 250: | 1997 | 49.1 | 0_TO_100 |
 251: | 1998 | 50.7 | 0_TO_100 |
 252: | 1999 | 49.8 | 0_TO_100 |
 253: | 2000 | 51 | 0_TO_100 |
 254: | 2001 | 53.3 | 0_TO_100 |
 255: | 2002 | 53.8 | 0_TO_100 |
 256: | 2003 | 51 | 0_TO_100 |
 257: | 2004 | 48.5 | 0_TO_100 |
 258: | 2005 | 47.8 | 0_TO_100 |
 259: | 2006 | 46.4 | 0_TO_100 |
 260: | 2007 | 46.3 | 0_TO_100 |
 261: | 2008 | 45 | 0_TO_100 |
 262: | 2009 | 43.8 | 0_TO_100 |
 263: | 2010 | 43.7 | 0_TO_100 |
 264: | 2011 | 42.7 | 0_TO_100 |
 265: | 2012 | 41.4 | 0_TO_100 |
 266: | 2013 | 41.1 | 0_TO_100 |
 267: | 2014 | 41.8 | 0_TO_100 |
 268: | 2016 | 42.3 | 0_TO_100 |
 269: | 2017 | 41.4 | 0_TO_100 |
 270: | 2018 | 41.7 | 0_TO_100 |
 271: | 2019 | 43.3 | 0_TO_100 |
 272: | 2020 | 42.7 | 0_TO_100 |
 273: | 2021 | 42.4 | 0_TO_100 |
 274: | 2022 | 40.7 | 0_TO_100 |
 275: | 2023 | 42.4 | 0_TO_100 |
 276: | 2024 | 42.4 | 0_TO_100 |
 277: 
 278: #### Otros indicadores del país, valor más reciente disponible
 279: 
 280: | indicator | period | value | unit |
 281: |-----------|--------|-------|------|
 282: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 283: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 284: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 285: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
 286: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
 287: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
 288: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 289: | WB_WDI_SI_POV_DDAY | 2024 | 1 | PT_POP |
 290: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 291: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 292: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 293: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 52.469 | PT_W |
 294: 
 295: ### ECU
 296: 
 297: #### Background del país
 298: 
 299: # Ecuador (ECU)
 300: 
 301: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 302: 
 303: ## Identification
 304: 
 305: - **iso3**: `ECU`
 306: - **name_es**: Ecuador
 307: - **name_en**: Ecuador
 308: - **capital**: Quito
 309: - **population**: ~18 millones (2024, estimación)
 310: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
 311: 
 312: ## Perfil general
 313: 
 314: Ecuador es una república presidencialista unitaria en la región noroccidental de América del Sur. Limita con Colombia y Perú y tiene costa pacífica; el archipiélago de Galápagos forma parte del territorio nacional. Guayaquil es la ciudad más poblada. El país es miembro de la Comunidad Andina y se organiza en 24 provincias.
 315: 
 316: ## Economía y desarrollo
 317: 
 318: La economía depende del petróleo, la agricultura (banano, cacao, flores), la pesca y las remesas. El dólar estadounidense es moneda de curso legal desde 2000, lo que ancla la inflación pero limita la política monetaria. Los indicadores de pobreza, desempleo, inversión y balanza comercial reflejan choques externos en el precio del crudo y presiones fiscales. Data360 concentra series sobre PIB, pobreza, salud y gobernanza.
 319: 
 320: ## Temas en agenda pública
 321: 
 322: Entre 2024 y 2026 la cobertura mediática (El Comercio, La Hora, Plan V, entre otros) sigue seguridad, empleo, servicios básicos, energía y deuda externa. Los titulares del período de análisis se cargan por separado desde `data/news/ECU/`.
 323: 
 324: ## Fuentes
 325: 
 326: - Wikipedia (es), artículo «Ecuador», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 327: - Titulares del período: `data/news/ECU/` (subsistema GDELT, ver `docs/news-architecture.md`).
 328: 
 329: #### Serie de este indicador
 330: 
 331: | period | value | unit |
 332: |--------|-------|------|
 333: | 1987 | 50.5 | 0_TO_100 |
 334: | 1994 | 53.3 | 0_TO_100 |
 335: | 1995 | 50.8 | 0_TO_100 |
 336: | 1998 | 49.6 | 0_TO_100 |
 337: | 1999 | 58.6 | 0_TO_100 |
 338: | 2000 | 56.3 | 0_TO_100 |
 339: | 2003 | 53.5 | 0_TO_100 |
 340: | 2004 | 53.9 | 0_TO_100 |
 341: | 2005 | 53.1 | 0_TO_100 |
 342: | 2006 | 52.3 | 0_TO_100 |
 343: | 2007 | 53.4 | 0_TO_100 |
 344: | 2008 | 49.8 | 0_TO_100 |
 345: | 2009 | 48.5 | 0_TO_100 |
 346: | 2010 | 48.8 | 0_TO_100 |
 347: | 2011 | 45.9 | 0_TO_100 |
 348: | 2012 | 46.1 | 0_TO_100 |
 349: | 2013 | 46.9 | 0_TO_100 |
 350: | 2014 | 45 | 0_TO_100 |
 351: | 2015 | 46 | 0_TO_100 |
 352: | 2016 | 45 | 0_TO_100 |
 353: | 2017 | 44.7 | 0_TO_100 |
 354: | 2018 | 45.4 | 0_TO_100 |
 355: | 2019 | 45.7 | 0_TO_100 |
 356: | 2020 | 47.3 | 0_TO_100 |
 357: | 2021 | 45.8 | 0_TO_100 |
 358: | 2022 | 45.5 | 0_TO_100 |
 359: | 2023 | 44.6 | 0_TO_100 |
 360: | 2024 | 45.2 | 0_TO_100 |
 361: | 2025 | 45.9 | 0_TO_100 |
 362: 
 363: #### Otros indicadores del país, valor más reciente disponible
 364: 
 365: | indicator | period | value | unit |
 366: |-----------|--------|-------|------|
 367: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
 368: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
 369: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
 370: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
 371: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 5.650429 | PT_GDP |
 372: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
 373: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
 374: | WB_WDI_SI_POV_DDAY | 2025 | 3.4 | PT_POP |
 375: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
 376: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
 377: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
 378: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 52.386 | PT_W |
 379: 
 380: ### MEX
 381: 
 382: #### Background del país
 383: 
 384: # México (MEX)
 385: 
 386: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 387: 
 388: ## Identification
 389: 
 390: - **iso3**: `MEX`
 391: - **name_es**: México
 392: - **name_en**: Mexico
 393: - **capital**: Ciudad de México
 394: - **population**: ~130 millones (2024, estimación)
 395: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 396: 
 397: ## Perfil general
 398: 
 399: México es una república federal en la parte meridional de América del Norte. Integra 32 entidades federativas; la Ciudad de México es la capital y el principal centro político. Es la segunda economía de América Latina y uno de los mayores exportadores manufactureros del mundo, con integración profunda con Estados Unidos vía T-MEC.
 400: 
 401: ## Economía y desarrollo
 402: 
 403: La economía mezcla manufactura (automotriz, electrónica), petróleo, turismo, remesas y servicios. El peso mexicano es una moneda líquida en mercados emergentes. Los indicadores de pobreza, desigualdad, empleo formal, inversión extranjera y finanzas públicas son centrales en el debate de desarrollo. Data360 concentra series amplias de WB, FMI y otros proveedores para el país.
 404: 
 405: ## Temas en agenda pública
 406: 
 407: En 2024–2026 la prensa nacional (El Universal, Reforma, Animal Político, Excélsior, entre otros) cubre inflación, nearshoring, seguridad, reforma judicial y salud pública. Los titulares del período de análisis se cargan por separado desde `data/news/MEX/`.
 408: 
 409: ## Fuentes
 410: 
 411: - Wikipedia (es), artículo «México», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 412: - Titulares del período: `data/news/MEX/` (subsistema GDELT, ver `docs/news-architecture.md`).
 413: 
 414: #### Serie de este indicador
 415: 
 416: | period | value | unit |
 417: |--------|-------|------|
 418: | 1984 | 48.5 | 0_TO_100 |
 419: | 1989 | 50.1 | 0_TO_100 |
 420: | 1992 | 52.3 | 0_TO_100 |
 421: | 1994 | 53.4 | 0_TO_100 |
 422: | 1996 | 52 | 0_TO_100 |
 423: | 1998 | 53.3 | 0_TO_100 |
 424: | 2000 | 53.4 | 0_TO_100 |
 425: | 2002 | 50.6 | 0_TO_100 |
 426: | 2004 | 50.3 | 0_TO_100 |
 427: | 2005 | 50.9 | 0_TO_100 |
 428: | 2006 | 49.7 | 0_TO_100 |
 429: | 2008 | 50.8 | 0_TO_100 |
 430: | 2010 | 47.7 | 0_TO_100 |
 431: | 2012 | 49.6 | 0_TO_100 |
 432: | 2014 | 48.9 | 0_TO_100 |
 433: | 2016 | 46.9 | 0_TO_100 |
 434: | 2018 | 46 | 0_TO_100 |
 435: | 2020 | 44.6 | 0_TO_100 |
 436: | 2022 | 43.5 | 0_TO_100 |
 437: | 2024 | 42.6 | 0_TO_100 |
 438: 
 439: #### Otros indicadores del país, valor más reciente disponible
 440: 
 441: | indicator | period | value | unit |
 442: |-----------|--------|-------|------|
 443: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 444: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 445: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 446: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 447: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 448: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 449: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 450: | WB_WDI_SI_POV_DDAY | 2024 | 1.6 | PT_POP |
 451: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 452: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 453: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 454: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 47.45 | PT_W |
 455: 
 456: 
 457: ## Discurso público reciente
 458: 
 459: Titulares de prensa para los países del scope.
 460: Período: 2026-04 a 2026-05. Máximo 8 titulares por país, más reciente primero.
 461: Filtro GDELT: 10 temas validados alineados con indicadores anuales (WB_471_ECONOMIC_GROWTH, TAX_ECON_PRICE, WB_698_TRADE, ECON_DEBT, POVERTY, WB_695_POVERTY, WB_642_CHILD_HEALTH, WB_639_REPRODUCTIVE_MATERNAL_AND_CHILD_HEALTH, WB_2748_EMPLOYMENT, CORRUPTION).
 462: 
 463: ### GTM
 464: 
 465: - [2026-05-21] Lahora (lahora.gt): "China y su afán con Taiwán"
 466:   URL: https://lahora.gt/opinion/por-la-transparencia/2026/05/21/china-y-su-afan-con-taiwan/
 467: - [2026-05-21] Lahora (lahora.gt): "Crece presión por ley antilavado : EE . UU . llama a aprobación que cierre la puerta a narcotraficantes y criminales"
 468:   URL: https://lahora.gt/nacionales/ralvarado/2026/05/21/estados-unidos-insta-a-guatemala-a-aprobar-ley-antilavado-con-estandares-del-gafi/
 469: - [2026-05-21] Lahora (lahora.gt): "Inmigrante con 2 deportaciones expeditas podría solicitar perdón migratorio a EE . UU ."
 470:   URL: https://lahora.gt/opinion/fcastro/2026/05/21/inmigrante-con-2-deportaciones-expeditas-podria-solicitar-perdon-migratorio-a-ee-uu-2/
 471: - [2026-05-21] Prensalibre (prensalibre.com): "EE . UU . pide al Congreso de Guatemala aprobar una ley contra el lavado de dinero con estándares internacionales"
 472:   URL: https://www.prensalibre.com/guatemala/politica/ee-uu-pide-al-congreso-de-guatemala-aprobar-una-ley-contra-el-lavado-de-dinero-con-estandares-internacionales-breaking/
 473: - [2026-05-21] Prensalibre (prensalibre.com): "Sheinbaum descarta  gran riesgo  para remesas pese a orden ejecutiva de Trump"
 474:   URL: https://www.prensalibre.com/ahora/internacional/sheinbaum-descarta-gran-riesgo-para-remesas-pese-a-orden-ejecutiva-de-trump/
 475: - [2026-05-21] Emisorasunidas (emisorasunidas.com): "Organizaciones piden al nuevo Fiscal General poner fin a criminalización de periodistas"
 476:   URL: https://emisorasunidas.com/nacional/2026/05/21/organizaciones-fiscal-general-criminalizacion-periodistas-libertad-prensa/
 477: - [2026-05-21] Emisorasunidas (emisorasunidas.com): "Atrapan narcotraficante con droga oculta en mercancía de Kim Kardashian"
 478:   URL: https://emisorasunidas.com/farandula/2026/05/21/atrapan-a-narcotraficante-que-ocultaba-droga-en-mercaderia-de-kim-kardashian/
 479: - [2026-05-21] Publinews (publinews.gt): "Ubican más de Q350 mil en una casa que era usada por pandilleros del Barrio 18"
 480:   URL: https://www.publinews.gt/noticias/2026/05/21/ubican-mas-de-q350-mil-en-una-casa-que-era-usada-por-pandilleros-del-barrio-18/
 481: 
 482: ### HND
 483: 
 484: - [2026-05-21] Proceso (proceso.hn): "Johana Bermúdez llama a vacunarse ante alerta por sarampión en Honduras"
 485:   URL: https://proceso.hn/johana-bermudez-llama-a-vacunarse-ante-alerta-por-sarampion-en-honduras/
 486: - [2026-05-21] Proceso (proceso.hn): "Panamá suspende la venta de energía eléctrica a Costa Rica en medio de pugna comercial"
 487:   URL: https://proceso.hn/panama-suspende-la-venta-de-energia-electrica-a-costa-rica-en-medio-de-pugna-comercial/
 488: - [2026-05-21] Laprensa (laprensa.hn): "Crisis política en Bolivia"
 489:   URL: https://www.laprensa.hn/opinion/columnas/crisis-politica-en-bolivia-DA30743624
 490: - [2026-05-21] Proceso (proceso.hn): "Aranceles de EEUU habrían provocado caída del 5 % en la maquila hondureña"
 491:   URL: https://proceso.hn/aranceles-de-eeuu-habrian-provocado-caida-del-5-en-la-maquila-hondurena/
 492: - [2026-05-21] Proceso (proceso.hn): "Cámaras de Comercio exigen al Congreso enfocarse en generación de empleo"
 493:   URL: https://proceso.hn/camaras-de-comercio-exige-al-congreso-enfocarse-en-generacion-de-empleo/
 494: - [2026-05-21] Abriendobrecha (abriendobrecha.tv): "Fenagh niega carestía de carne y alerta de salida ilegal de ganado hacia México"
 495:   URL: https://abriendobrecha.tv/nacionales/fenagh-niega-carestia-de-carne-y-alerta-de-salida-ilegal-de-ganado-hacia-mexico/
 496: - [2026-05-21] Abriendobrecha (abriendobrecha.tv): "La deuda externa del sector público alcanzó los $10 , 761 . 8 millones"
 497:   URL: https://abriendobrecha.tv/economia/la-deuda-externa-del-sector-publico-alcanzo-los-10761-8-millones/
 498: - [2026-05-21] Laprensa (laprensa.hn): "Piden ayuda para repatriar desde Estados Unidos a Olancho a la hondureña Dariela Galeano"
 499:   URL: https://www.laprensa.hn/mundo/piden-ayuda-repatriar-hondurena-dariela-galeano-estados-unidos-olancho-JA30743648
 500: 
 501: ### ARG
 502: 
 503: - [2026-05-21] Diariosanrafael (diariosanrafael.com.ar): "La actividad económica mostró signos de recuperación : tuvo una suba del 5 , 5 % en marzo"
 504:   URL: https://diariosanrafael.com.ar/la-actividad-economica-mostro-signos-de-recuperacion-tuvo-una-suba-del-55-en-marzo/
 505: - [2026-05-21] Cronica (cronica.com.ar): "Alianza estratégica con Estados Unidos : cómo son los nuevos aviones de vigilancia que recibirá la Armada para custodiar el Mar Argentino"
 506:   URL: https://www.cronica.com.ar/politica/alianza-estrategica-con-estados-unidos-como-son-los-nuevos-aviones-de-vigilancia-que-recibira-la-armada-para-custodiar-el-mar-argentino-5487/
 507: - [2026-05-21] Eldiariodelapampa (eldiariodelapampa.com.ar): "La actividad económica en marzo subió 5 , 5 % y fue la mejor desde junio de 2025 :: El Diario de La Pampa"
 508:   URL: https://www.eldiariodelapampa.com.ar/pais/74461/la-actividad-economica-en-marzo-subio-55-en-porciento--y-fue-la-mejor-desde-junio-de-2025
 509: - [2026-05-21] Cronica (cronica.com.ar): "La Asociación Conciencia y el cóctel que reunió a todos por la educación :  El futuro no se espera : se enseña , se aprende y se construye"
 510:   URL: https://www.cronica.com.ar/politica/la-asociacion-conciencia-y-el-coctel-que-reunio-a-todos-por-la-educacion-el-futuro-no-se-espera-se-ensena-se-aprende-y-se-construye-1857/
 511: - [2026-05-21] Agencianova (agencianova.com): "VIDEO | La casta eran los laburantes : al 70 por ciento de los trabajadores el sueldo les dura menos de medio mes"
 512:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167675&id_tiponota=6
 513: - [2026-05-21] Agencianova (agencianova.com): "La diputada Karina Banfi cruzó al Gobierno por el recorte de Zona Fría y advirtió fuertes subas en las tarifas"
 514:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167676&id_tiponota=4
 515: - [2026-05-21] Agencianova (agencianova.com): "VIDEO | Silvina Soria acusó a una libertaria de comandar ataques en redes y habló de una  fuerte interna  en el partido"
 516:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167684&id_tiponota=4
 517: - [2026-05-21] Diariosanrafael (diariosanrafael.com.ar): "Milei recibió en la Quinta de Olivos a Adorni para repasar la agenda de gestión"
 518:   URL: https://diariosanrafael.com.ar/milei-recibio-en-la-quinta-de-olivos-a-adorni-para-repasar-la-agenda-de-gestion/
 519: 
 520: ### ECU
 521: 
 522: - [2026-05-21] Eldiario (eldiario.ec): "Lavinia y el precio de la fama"
 523:   URL: https://www.eldiario.ec/opinion/lavinia-y-el-precio-de-la-fama/
 524: - [2026-05-21] Eldiario (eldiario.ec): "Familia de Matthew Perry acusa a su exasistente de traición"
 525:   URL: https://www.eldiario.ec/espectaculos/familia-de-matthew-perry-rompe-el-silencio-y-acusa-a-su-exasistente-confiamos-en-un-hombre-sin-conciencia-21052026/
 526: - [2026-05-21] Expreso (expreso.ec): "Ecuador presentará recurso de reconsideración ante la CAN por la tasa de seguridad"
 527:   URL: https://www.expreso.ec/economia-y-negocios/ecuador-presentara-recurso-reconsideracion-can-tasa-seguridad-282903.html
 528: - [2026-05-21] Expreso (expreso.ec): "Comic Con Ecuador confirma la participación de Christopher Masterson en su edición 2026"
 529:   URL: https://www.expreso.ec/entretenimiento/comic-ecuador-confirma-participacion-chris-masterson-edicion-2026-282877.html
 530: - [2026-05-21] Expreso (expreso.ec): "Municipio de Guayaquil crea comité de calidad que reconoce no haber tenido antes"
 531:   URL: https://www.expreso.ec/guayaquil/municipio-guayaquil-crea-comite-calidad-reconoce-no-haber-tenido-282912.html
 532: - [2026-05-21] Expreso (expreso.ec): "Narcopolítica en México : Cártel de Sinaloa se infiltró en ocho municipios en Morelo"
 533:   URL: https://www.expreso.ec/internacional/narcopolitica-mexico-cartel-sinaloa-infiltro-ocho-municipios-morelo-282914.html
 534: - [2026-05-21] Eldiario (eldiario.ec): "Madre muere en ataque armado al comprar pañales en Quevedo"
 535:   URL: https://www.eldiario.ec/seguridad/salio-a-comprar-panales-para-su-hijo-y-murio-en-ataque-armado-en-quevedo-21052026/
 536: - [2026-05-21] Expreso (expreso.ec): "Centenares protestan en La Paz : Las marchas exigen liberar los bloqueos de vías contra el Gobierno"
 537:   URL: https://www.expreso.ec/internacional/centenares-protestan-paz-marchas-exigen-liberar-bloqueos-vias-gobierno-282885.html
 538: 
 539: ### MEX
 540: 
 541: - [2026-05-21] Tiempo (tiempo.com.mx): "Invitan a hamburguesa en favor de Nidia , padece cáncer de rin"
 542:   URL: https://www.tiempo.com.mx/local/hamburguesa-beneficio-nidia-sandoval-cancer-de-rinon/
 543: - [2026-05-21] Eldictamen (eldictamen.mx): "Impulsan reforma constitucional en materia de no reelección y nepotismo electoral"
 544:   URL: https://www.eldictamen.mx/impulsan-reforma-constitucional-en-materia-de-no-reeleccion-y-nepotismo-electoral/
 545: - [2026-05-21] Aciprensa (aciprensa.com): "El don sagrado de la familia debe ser protegido de 4 amenazas actuales , señala obispo"
 546:   URL: https://www.aciprensa.com/noticias/125297/el-don-sagrado-de-la-familia-debe-ser-protegido-de-4-amenazas-actuales-senala-obispo
 547: - [2026-05-21] Tiempo (tiempo.com.mx): "Ex pareja llega armado y dispara contra establecimiento de la Vallarta🎦"
 548:   URL: https://www.tiempo.com.mx/local/agencia-working-las-granjas-avenida-vallarta-ataque-arma-de-postas-movilizacion-policiaca-expareja-disparos-chihuahua-autoridades/
 549: - [2026-05-21] Oem (oem.com.mx): "Inauguran Policía Cibernética Municipal en La Paz"
 550:   URL: https://oem.com.mx:443/elsudcaliforniano/local/inauguran-policia-cibernetica-municipal-en-la-paz-30117921
 551: - [2026-05-21] Criteriohidalgo (criteriohidalgo.com): "Franquicias requieren visión operativa y disciplina"
 552:   URL: https://www.criteriohidalgo.com/first-class/franquicias-requieren-vision-operativa-y-disciplina
 553: - [2026-05-21] Nortedigital (nortedigital.mx): "Retrocede empleo maquilador juarense a como estaba hace 10 años"
 554:   URL: https://nortedigital.mx/retrocede-empleo-maquilador-juarense-a-como-estaba-hace-10-anos/
 555: - [2026-05-21] Elimparcial (elimparcial.com): "Extorsión y sobreregulación golpean al comercio en Tijuana , advierte Concanaco"
 556:   URL: https://www.elimparcial.com/tij/tijuana/2026/05/21/extorsion-y-sobreregulacion-golpean-al-comercio-en-tijuana-advierte-concanaco/
 557: 
 558: 
 559: ## Reglas de detección activas
 560: 
 561: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 562: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 563: 
 564: ## Candidatos detectados
 565: 
 566: Cada candidato fue detectado por el pipeline determinístico. Para cada uno, escribí narrativas bilingües y emitilas en el bloque JSON final.
 567: 
 568: - candidate_id: cand_abrupt_change_HND_WB_WDI_SI_POV_GINI_2024
 569:   type: abrupt_change
 570:   country: HND
 571:   observation: { period: 2024, value: 45.7, unit: 0_TO_100 }
 572:   previous: { period: 2023, value: 46.8 }
 573:   z_score: -2.47
 574:   baseline_mean: 48.620000000000005
 575:   claim_id: 69279ed10867aa4f
 576: 
 577: 