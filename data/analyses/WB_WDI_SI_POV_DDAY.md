   1: # CONTEXTO INTEGRADO PARA ANÁLISIS DE INDICADOR
   2: 
   3: 
   4: ## Definición y metodología
   5: 
   6: # Poverty headcount ratio at $3.00 a day (2021 PPP) (% of population)
   7: 
   8: > Poverty headcount at $2.15/day
   9: 
  10: ## Identification
  11: 
  12: - **idno**: `WB_WDI_SI_POV_DDAY`
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
  26: - **csv**: https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SI_POV_DDAY.csv
  27: - **json metadata**: https://data360files.worldbank.org/data360-data/metadata/WB_WDI/WB_WDI_SI_POV_DDAY.json
  28: - **api template**: https://data360api.worldbank.org/data360/data?top=1000&skip=0&DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_SI_POV_DDAY
  29: - **dataset on Data360**: https://data360.worldbank.org/en/int/dataset/WB_WDI
  30: 
  31: ## Definition
  32: 
  33: Poverty headcount ratio at $3.00 a day is the percentage of the population living on less than $3.00 a day at 2021 purchasing power adjusted prices. As a result of revisions in PPP exchange rates, poverty rates for individual countries cannot be compared with poverty rates reported in earlier editions.
  34: 
  35: ## Methodology
  36: 
  37: International comparisons of poverty estimates entail both conceptual and practical problems. Countries have different definitions of poverty, and consistent comparisons across countries can be difficult. Local poverty lines tend to have higher purchasing power in rich countries, where more generous standards are used, than in poor countries.
  38: 
  39: Since World Development Report 1990, the World Bank has aimed to apply a common standard in measuring extreme poverty, anchored to what poverty means in the world's poorest countries. The welfare of people living in different countries can be measured on a common scale by adjusting for differences in the purchasing power of currencies. The commonly used $1 a day standard, measured in 1985 international prices and adjusted to local currency using purchasing power parities (PPPs), was chosen for World Development Report 1990 because it was typical of the poverty lines in low-income countries at the time. As differences in the cost of living across the world evolve, the international poverty line has to be periodically updated using new PPP price data to reflect these changes. The last change was in September 2022, when we adopted $3.00 as the international poverty line using the 2021 PPP. Poverty measures based on international poverty lines attempt to hold the real value of the poverty line constant across countries, as is done when making comparisons over time. The $4.20 poverty line is derived from typical national poverty lines in countries classified as Lower Middle Income. The $8.30 poverty line is derived from typical national poverty lines in countries classified as Upper Middle Income.
  40: 
  41: Early editions of World Development Indicators used PPPs from the Penn World Tables to convert values in local currency to equivalent purchasing power measured in U.S dollars. Later editions used 1993, 2005, and 2021 consumption PPP estimates produced by the World Bank. The current extreme poverty line is set at $3.00 a day in 2021 PPP terms, which represents the mean of the poverty lines found in 15 of the poorest countries ranked by per capita consumption. The new poverty line maintains the same standard for extreme poverty - the poverty line typical of the poorest countries in the world - but updates it using the latest information on the cost of living in developing countries. As a result of revisions in PPP exchange rates, poverty rates for individual countries cannot be compared with poverty rates reported in earlier editions.
  42: 
  43: The statistics reported here are based on consumption data or, when unavailable, on income surveys.
  44: 
  45: ## Sources
  46: 
  47: - World Bank, Poverty and Inequality Platform. Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database. For more information and methodology, please see http://pip.worldbank.org. (http://pip.worldbank.org)
  48: 
  49: ## Topics
  50: 
  51: - Prosperity _(WB Practice Groups)_
  52: - Poverty _(Data360 Topic L1)_
  53: - Poverty _(Data360 Topic L2)_
  54: 
  55: ## Países y trayectorias
  56: 
  57: ### GTM
  58: 
  59: #### Background del país
  60: 
  61: # Guatemala (GTM)
  62: 
  63: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
  64: 
  65: ## Identification
  66: 
  67: - **iso3**: `GTM`
  68: - **name_es**: Guatemala
  69: - **name_en**: Guatemala
  70: - **capital**: Ciudad de Guatemala
  71: - **population**: ~18 millones (2024, estimación)
  72: - **wikipedia**: https://es.wikipedia.org/wiki/Guatemala
  73: 
  74: ## Perfil general
  75: 
  76: Guatemala es una república democrática en el extremo noroccidental de América Central. Se divide en 22 departamentos y 340 municipios. Es el país más poblado de Centroamérica y una de las economías medianas de la región, con una población joven y una diversidad étnica y lingüística marcada (población indígena mayoritaria en varios departamentos).
  77: 
  78: ## Economía y desarrollo
  79: 
  80: La economía se apoya en agricultura (café, azúcar, banano), manufactura ligera, remesas y servicios. La desigualdad, la pobreza rural y la inversión social limitada condicionan indicadores de salud, educación y empleo. El quetzal es la moneda nacional. Data360 publica series sobre crecimiento, pobreza, mortalidad materna, participación laboral femenina y gobernanza institucional.
  81: 
  82: ## Temas en agenda pública
  83: 
  84: En 2024–2026 los medios guatemaltecos (Prensa Libre, El Periódico, entre otros) cubren corrupción, migración hacia Estados Unidos, seguridad, precios de alimentos y acceso a servicios de salud. La cobertura indexada por GDELT es más limitada que en países más grandes; los titulares del período se cargan desde `data/news/GTM/`.
  85: 
  86: ## Fuentes
  87: 
  88: - Wikipedia (es), artículo «Guatemala», consultado 2026-05-21. Licencia CC BY-SA 4.0.
  89: - Titulares del período: `data/news/GTM/` (subsistema GDELT, ver `docs/news-architecture.md`).
  90: 
  91: #### Serie de este indicador
  92: 
  93: | period | value | unit |
  94: |--------|-------|------|
  95: | 1986 | 47.4 | PT_POP |
  96: | 1989 | 35.1 | PT_POP |
  97: | 1998 | 13.4 | PT_POP |
  98: | 2000 | 8.8 | PT_POP |
  99: | 2006 | 10.5 | PT_POP |
 100: | 2014 | 8 | PT_POP |
 101: | 2023 | 9.7 | PT_POP |
 102: 
 103: #### Otros indicadores del país, valor más reciente disponible
 104: 
 105: | indicator | period | value | unit |
 106: |-----------|--------|-------|------|
 107: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6150.025714 | USD |
 108: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.651864 | PC_A |
 109: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 2.869928 | PC_A |
 110: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.632519 | PT_GDP |
 111: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 2.887155 | PT_GDP |
 112: | WB_CCDFS_GGDY | 2022 | 29.222 | PT |
 113: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 12.478014 | PT_REV |
 114: | WB_WDI_SI_POV_GINI | 2023 | 45.2 | 0_TO_100 |
 115: | WB_WDI_SE_SEC_ENRR | 2024 | 49.57658 | PT |
 116: | WB_WDI_SH_STA_MMRT | 2023 | 94 | DT_10P5BR_L |
 117: | WB_WDI_SH_DYN_MORT | 2024 | 20.5 | DT_10P3BR_L |
 118: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 38.324 | PT_W |
 119: 
 120: ### HND
 121: 
 122: #### Background del país
 123: 
 124: # Honduras (HND)
 125: 
 126: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 127: 
 128: ## Identification
 129: 
 130: - **iso3**: `HND`
 131: - **name_es**: Honduras
 132: - **name_en**: Honduras
 133: - **capital**: Tegucigalpa (Distrito Central con Comayagüela)
 134: - **population**: ~10 millones (2024, estimación)
 135: - **wikipedia**: https://es.wikipedia.org/wiki/Honduras
 136: 
 137: ## Perfil general
 138: 
 139: Honduras es un estado unitario en América Central con costas en el Atlántico y el Pacífico. Tegucigalpa y Comayagüela forman el Distrito Central, principal núcleo urbano. San Pedro Sula es el segundo centro económico. El país enfrenta desafíos persistentes de desigualdad, violencia y exposición a huracanes.
 140: 
 141: ## Economía y desarrollo
 142: 
 143: La economía combina agricultura (café, palma, banano), maquila textil, remesas y servicios. El lempira es la moneda nacional. Los indicadores de pobreza, desempleo, salud materno-infantil y gobernanza reflejan presión fiscal limitada y necesidades de inversión social. Data360 aporta series comparables con el resto de la región LAC del demo.
 144: 
 145: ## Temas en agenda pública
 146: 
 147: Entre 2024 y 2026 la prensa hondureña (El Heraldo, La Tribuna, Proceso Digital, entre otros) prioriza seguridad, empleo, corrupción, migración y servicios públicos. GDELT indexa menos medios locales que en Argentina o México; los titulares del período se cargan desde `data/news/HND/`.
 148: 
 149: ## Fuentes
 150: 
 151: - Wikipedia (es), artículo «Honduras», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 152: - Titulares del período: `data/news/HND/` (subsistema GDELT, ver `docs/news-architecture.md`).
 153: 
 154: #### Serie de este indicador
 155: 
 156: | period | value | unit |
 157: |--------|-------|------|
 158: | 1991 | 41.3 | PT_POP |
 159: | 1992 | 36.5 | PT_POP |
 160: | 1993 | 31.3 | PT_POP |
 161: | 1994 | 32.9 | PT_POP |
 162: | 1995 | 34.4 | PT_POP |
 163: | 1996 | 38.2 | PT_POP |
 164: | 1997 | 27.5 | PT_POP |
 165: | 1998 | 32.3 | PT_POP |
 166: | 1999 | 32.1 | PT_POP |
 167: | 2001 | 26.5 | PT_POP |
 168: | 2002 | 29 | PT_POP |
 169: | 2003 | 34 | PT_POP |
 170: | 2004 | 33.3 | PT_POP |
 171: | 2005 | 31.3 | PT_POP |
 172: | 2006 | 27.3 | PT_POP |
 173: | 2007 | 22 | PT_POP |
 174: | 2008 | 20.9 | PT_POP |
 175: | 2009 | 18.1 | PT_POP |
 176: | 2010 | 19.6 | PT_POP |
 177: | 2011 | 20.1 | PT_POP |
 178: | 2012 | 24 | PT_POP |
 179: | 2013 | 20.8 | PT_POP |
 180: | 2014 | 20.6 | PT_POP |
 181: | 2015 | 19.9 | PT_POP |
 182: | 2016 | 19.8 | PT_POP |
 183: | 2017 | 19.3 | PT_POP |
 184: | 2018 | 19.8 | PT_POP |
 185: | 2019 | 18.8 | PT_POP |
 186: | 2023 | 17 | PT_POP |
 187: | 2024 | 15.7 | PT_POP |
 188: 
 189: #### Otros indicadores del país, valor más reciente disponible
 190: 
 191: | indicator | period | value | unit |
 192: |-----------|--------|-------|------|
 193: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 3426.434833 | USD |
 194: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 3.55397 | PC_A |
 195: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.606211 | PC_A |
 196: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 3.529037 | PT_GDP |
 197: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -4.45338 | PT_GDP |
 198: | WB_CCDFS_GGDY | 2022 | 49.091 | PT |
 199: | WB_WDI_GC_XPN_INTP_RV_ZS | 2020 | 10.629658 | PT_REV |
 200: | WB_WDI_SI_POV_GINI | 2024 | 45.7 | 0_TO_100 |
 201: | WB_WDI_SE_SEC_ENRR | 2024 | 51.763981 | PT |
 202: | WB_WDI_SH_STA_MMRT | 2023 | 47 | DT_10P5BR_L |
 203: | WB_WDI_SH_DYN_MORT | 2024 | 15 | DT_10P3BR_L |
 204: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 39.59 | PT_W |
 205: 
 206: ### ARG
 207: 
 208: #### Background del país
 209: 
 210: # Argentina (ARG)
 211: 
 212: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 213: 
 214: ## Identification
 215: 
 216: - **iso3**: `ARG`
 217: - **name_es**: Argentina
 218: - **name_en**: Argentina
 219: - **capital**: Ciudad Autónoma de Buenos Aires
 220: - **population**: ~47 millones (2024, estimación)
 221: - **wikipedia**: https://es.wikipedia.org/wiki/Argentina
 222: 
 223: ## Perfil general
 224: 
 225: Argentina es una república federal democrática en el extremo sur de América del Sur. Integra 23 provincias y la Ciudad Autónoma de Buenos Aires como capital federal. Es la tercera economía de la región y uno de los países con mayor nivel educativo relativo en LAC, con una clase media urbana amplia y un sistema de prensa plural.
 226: 
 227: ## Economía y desarrollo
 228: 
 229: La economía combina agricultura exportadora (soja, maíz, carne), manufactura y servicios. El peso argentino convive con restricciones cambiarias recurrentes, inflación elevada y deuda pública en moneda externa. Los indicadores de pobreza, empleo e inversión extranjera son sensibles a ciclos macro y a la política fiscal y monetaria. El Banco Mundial y el FMI publican series clave sobre PIB, inflación, cuenta corriente y deuda soberana.
 230: 
 231: ## Temas en agenda pública
 232: 
 233: En 2024–2026 el debate público concentra estabilización macro, acuerdo con el FMI, desinflación, empleo formal y acceso al dólar. La prensa nacional (La Nación, Clarín, Infobae, entre otros) cubre de cerca datos del INDEC, riesgo país y reformas estructurales. Los titulares del período de análisis se cargan por separado desde `data/news/ARG/`.
 234: 
 235: ## Fuentes
 236: 
 237: - Wikipedia (es), artículo «Argentina», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 238: - Titulares del período: `data/news/ARG/` (subsistema GDELT, ver `docs/news-architecture.md`).
 239: 
 240: #### Serie de este indicador
 241: 
 242: | period | value | unit |
 243: |--------|-------|------|
 244: | 1994 | 2.7 | PT_POP |
 245: | 1995 | 5.1 | PT_POP |
 246: | 1996 | 5.4 | PT_POP |
 247: | 1997 | 5.2 | PT_POP |
 248: | 1998 | 5.7 | PT_POP |
 249: | 1999 | 5.9 | PT_POP |
 250: | 2000 | 7.3 | PT_POP |
 251: | 2001 | 10.7 | PT_POP |
 252: | 2002 | 17.1 | PT_POP |
 253: | 2003 | 8.2 | PT_POP |
 254: | 2004 | 6 | PT_POP |
 255: | 2005 | 4.4 | PT_POP |
 256: | 2006 | 3.5 | PT_POP |
 257: | 2007 | 2.8 | PT_POP |
 258: | 2008 | 2.6 | PT_POP |
 259: | 2009 | 2.4 | PT_POP |
 260: | 2010 | 1.5 | PT_POP |
 261: | 2011 | 1.2 | PT_POP |
 262: | 2012 | 1.3 | PT_POP |
 263: | 2013 | 1.1 | PT_POP |
 264: | 2014 | 1.1 | PT_POP |
 265: | 2016 | 1.3 | PT_POP |
 266: | 2017 | 1.1 | PT_POP |
 267: | 2018 | 1.6 | PT_POP |
 268: | 2019 | 1.7 | PT_POP |
 269: | 2020 | 2.2 | PT_POP |
 270: | 2021 | 1.4 | PT_POP |
 271: | 2022 | 1.3 | PT_POP |
 272: | 2023 | 1.2 | PT_POP |
 273: | 2024 | 1 | PT_POP |
 274: 
 275: #### Otros indicadores del país, valor más reciente disponible
 276: 
 277: | indicator | period | value | unit |
 278: |-----------|--------|-------|------|
 279: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 13969.78366 | USD |
 280: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -1.342931 | PC_A |
 281: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 219.883929 | PC_A |
 282: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 1.824095 | PT_GDP |
 283: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 0.893118 | PT_GDP |
 284: | WB_CCDFS_GGDY | 2022 | 84.685 | PT |
 285: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 8.462084 | PT_REV |
 286: | WB_WDI_SI_POV_GINI | 2024 | 42.4 | 0_TO_100 |
 287: | WB_WDI_SE_SEC_ENRR | 2023 | 105.574584 | PT |
 288: | WB_WDI_SH_STA_MMRT | 2023 | 33 | DT_10P5BR_L |
 289: | WB_WDI_SH_DYN_MORT | 2024 | 9.5 | DT_10P3BR_L |
 290: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 52.469 | PT_W |
 291: 
 292: ### ECU
 293: 
 294: #### Background del país
 295: 
 296: # Ecuador (ECU)
 297: 
 298: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 299: 
 300: ## Identification
 301: 
 302: - **iso3**: `ECU`
 303: - **name_es**: Ecuador
 304: - **name_en**: Ecuador
 305: - **capital**: Quito
 306: - **population**: ~18 millones (2024, estimación)
 307: - **wikipedia**: https://es.wikipedia.org/wiki/Ecuador
 308: 
 309: ## Perfil general
 310: 
 311: Ecuador es una república presidencialista unitaria en la región noroccidental de América del Sur. Limita con Colombia y Perú y tiene costa pacífica; el archipiélago de Galápagos forma parte del territorio nacional. Guayaquil es la ciudad más poblada. El país es miembro de la Comunidad Andina y se organiza en 24 provincias.
 312: 
 313: ## Economía y desarrollo
 314: 
 315: La economía depende del petróleo, la agricultura (banano, cacao, flores), la pesca y las remesas. El dólar estadounidense es moneda de curso legal desde 2000, lo que ancla la inflación pero limita la política monetaria. Los indicadores de pobreza, desempleo, inversión y balanza comercial reflejan choques externos en el precio del crudo y presiones fiscales. Data360 concentra series sobre PIB, pobreza, salud y gobernanza.
 316: 
 317: ## Temas en agenda pública
 318: 
 319: Entre 2024 y 2026 la cobertura mediática (El Comercio, La Hora, Plan V, entre otros) sigue seguridad, empleo, servicios básicos, energía y deuda externa. Los titulares del período de análisis se cargan por separado desde `data/news/ECU/`.
 320: 
 321: ## Fuentes
 322: 
 323: - Wikipedia (es), artículo «Ecuador», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 324: - Titulares del período: `data/news/ECU/` (subsistema GDELT, ver `docs/news-architecture.md`).
 325: 
 326: #### Serie de este indicador
 327: 
 328: | period | value | unit |
 329: |--------|-------|------|
 330: | 1987 | 21.6 | PT_POP |
 331: | 1994 | 21.5 | PT_POP |
 332: | 1995 | 18.1 | PT_POP |
 333: | 1998 | 21.1 | PT_POP |
 334: | 1999 | 26.9 | PT_POP |
 335: | 2000 | 34.1 | PT_POP |
 336: | 2003 | 18.9 | PT_POP |
 337: | 2004 | 19.4 | PT_POP |
 338: | 2005 | 15.4 | PT_POP |
 339: | 2006 | 10.9 | PT_POP |
 340: | 2007 | 10.9 | PT_POP |
 341: | 2008 | 9.8 | PT_POP |
 342: | 2009 | 9.3 | PT_POP |
 343: | 2010 | 7.8 | PT_POP |
 344: | 2011 | 6.4 | PT_POP |
 345: | 2012 | 6 | PT_POP |
 346: | 2013 | 4.5 | PT_POP |
 347: | 2014 | 4 | PT_POP |
 348: | 2015 | 4.8 | PT_POP |
 349: | 2016 | 5 | PT_POP |
 350: | 2017 | 4.3 | PT_POP |
 351: | 2018 | 4.7 | PT_POP |
 352: | 2019 | 4.6 | PT_POP |
 353: | 2020 | 8.4 | PT_POP |
 354: | 2021 | 5.3 | PT_POP |
 355: | 2022 | 4.4 | PT_POP |
 356: | 2023 | 4.7 | PT_POP |
 357: | 2024 | 7.3 | PT_POP |
 358: | 2025 | 3.4 | PT_POP |
 359: 
 360: #### Otros indicadores del país, valor más reciente disponible
 361: 
 362: | indicator | period | value | unit |
 363: |-----------|--------|-------|------|
 364: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 6874.70574 | USD |
 365: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | -2.001255 | PC_A |
 366: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 1.547325 | PC_A |
 367: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 0.355365 | PT_GDP |
 368: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | 5.650429 | PT_GDP |
 369: | WB_CCDFS_GGDY | 2022 | 57.686 | PT |
 370: | WB_WDI_GC_XPN_INTP_RV_ZS | 2022 | 4.662799 | PT_REV |
 371: | WB_WDI_SI_POV_GINI | 2025 | 45.9 | 0_TO_100 |
 372: | WB_WDI_SE_SEC_ENRR | 2023 | 92.811803 | PT |
 373: | WB_WDI_SH_STA_MMRT | 2023 | 55 | DT_10P5BR_L |
 374: | WB_WDI_SH_DYN_MORT | 2024 | 12.9 | DT_10P3BR_L |
 375: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 52.386 | PT_W |
 376: 
 377: ### MEX
 378: 
 379: #### Background del país
 380: 
 381: # México (MEX)
 382: 
 383: > Perfil país para contexto narrativo del pipeline Data360 Monitor.
 384: 
 385: ## Identification
 386: 
 387: - **iso3**: `MEX`
 388: - **name_es**: México
 389: - **name_en**: Mexico
 390: - **capital**: Ciudad de México
 391: - **population**: ~130 millones (2024, estimación)
 392: - **wikipedia**: https://es.wikipedia.org/wiki/M%C3%A9xico
 393: 
 394: ## Perfil general
 395: 
 396: México es una república federal en la parte meridional de América del Norte. Integra 32 entidades federativas; la Ciudad de México es la capital y el principal centro político. Es la segunda economía de América Latina y uno de los mayores exportadores manufactureros del mundo, con integración profunda con Estados Unidos vía T-MEC.
 397: 
 398: ## Economía y desarrollo
 399: 
 400: La economía mezcla manufactura (automotriz, electrónica), petróleo, turismo, remesas y servicios. El peso mexicano es una moneda líquida en mercados emergentes. Los indicadores de pobreza, desigualdad, empleo formal, inversión extranjera y finanzas públicas son centrales en el debate de desarrollo. Data360 concentra series amplias de WB, FMI y otros proveedores para el país.
 401: 
 402: ## Temas en agenda pública
 403: 
 404: En 2024–2026 la prensa nacional (El Universal, Reforma, Animal Político, Excélsior, entre otros) cubre inflación, nearshoring, seguridad, reforma judicial y salud pública. Los titulares del período de análisis se cargan por separado desde `data/news/MEX/`.
 405: 
 406: ## Fuentes
 407: 
 408: - Wikipedia (es), artículo «México», consultado 2026-05-21. Licencia CC BY-SA 4.0.
 409: - Titulares del período: `data/news/MEX/` (subsistema GDELT, ver `docs/news-architecture.md`).
 410: 
 411: #### Serie de este indicador
 412: 
 413: | period | value | unit |
 414: |--------|-------|------|
 415: | 1984 | 15 | PT_POP |
 416: | 1989 | 14.8 | PT_POP |
 417: | 1992 | 13.3 | PT_POP |
 418: | 1994 | 13.6 | PT_POP |
 419: | 1996 | 21.7 | PT_POP |
 420: | 1998 | 21.9 | PT_POP |
 421: | 2000 | 16.3 | PT_POP |
 422: | 2002 | 12.8 | PT_POP |
 423: | 2004 | 11 | PT_POP |
 424: | 2005 | 11.7 | PT_POP |
 425: | 2006 | 9 | PT_POP |
 426: | 2008 | 10.1 | PT_POP |
 427: | 2010 | 8.4 | PT_POP |
 428: | 2012 | 7.3 | PT_POP |
 429: | 2014 | 7.2 | PT_POP |
 430: | 2016 | 4.4 | PT_POP |
 431: | 2018 | 3.9 | PT_POP |
 432: | 2020 | 4.3 | PT_POP |
 433: | 2022 | 2.3 | PT_POP |
 434: | 2024 | 1.6 | PT_POP |
 435: 
 436: #### Otros indicadores del país, valor más reciente disponible
 437: 
 438: | indicator | period | value | unit |
 439: |-----------|--------|-------|------|
 440: | WB_WDI_NY_GDP_PCAP_CD | 2024 | 14185.781225 | USD |
 441: | WB_WDI_NY_GDP_MKTP_KD_ZG | 2024 | 1.427428 | PC_A |
 442: | WB_WDI_FP_CPI_TOTL_ZG | 2024 | 4.722256 | PC_A |
 443: | WB_WDI_BX_KLT_DINV_WD_GD_ZS | 2024 | 2.449665 | PT_GDP |
 444: | WB_WDI_BN_CAB_XOKA_GD_ZS | 2024 | -0.899378 | PT_GDP |
 445: | WB_CCDFS_GGDY | 2022 | 54.073 | PT |
 446: | WB_WDI_GC_XPN_INTP_RV_ZS | 2024 | 20.000111 | PT_REV |
 447: | WB_WDI_SI_POV_GINI | 2024 | 42.6 | 0_TO_100 |
 448: | WB_WDI_SE_SEC_ENRR | 2024 | 103.093323 | PT |
 449: | WB_WDI_SH_STA_MMRT | 2023 | 42 | DT_10P5BR_L |
 450: | WB_WDI_SH_DYN_MORT | 2024 | 13.1 | DT_10P3BR_L |
 451: | WB_WDI_SL_TLF_CACT_FE_ZS | 2025 | 47.45 | PT_W |
 452: 
 453: 
 454: ## Discurso público reciente
 455: 
 456: Titulares de prensa para los países del scope.
 457: Período: 2026-04 a 2026-05. Máximo 8 titulares por país, más reciente primero.
 458: Filtro GDELT: 10 temas validados alineados con indicadores anuales (WB_471_ECONOMIC_GROWTH, TAX_ECON_PRICE, WB_698_TRADE, ECON_DEBT, POVERTY, WB_695_POVERTY, WB_642_CHILD_HEALTH, WB_639_REPRODUCTIVE_MATERNAL_AND_CHILD_HEALTH, WB_2748_EMPLOYMENT, CORRUPTION).
 459: 
 460: ### GTM
 461: 
 462: - [2026-05-21] Lahora (lahora.gt): "China y su afán con Taiwán"
 463:   URL: https://lahora.gt/opinion/por-la-transparencia/2026/05/21/china-y-su-afan-con-taiwan/
 464: - [2026-05-21] Lahora (lahora.gt): "Crece presión por ley antilavado : EE . UU . llama a aprobación que cierre la puerta a narcotraficantes y criminales"
 465:   URL: https://lahora.gt/nacionales/ralvarado/2026/05/21/estados-unidos-insta-a-guatemala-a-aprobar-ley-antilavado-con-estandares-del-gafi/
 466: - [2026-05-21] Lahora (lahora.gt): "Inmigrante con 2 deportaciones expeditas podría solicitar perdón migratorio a EE . UU ."
 467:   URL: https://lahora.gt/opinion/fcastro/2026/05/21/inmigrante-con-2-deportaciones-expeditas-podria-solicitar-perdon-migratorio-a-ee-uu-2/
 468: - [2026-05-21] Prensalibre (prensalibre.com): "EE . UU . pide al Congreso de Guatemala aprobar una ley contra el lavado de dinero con estándares internacionales"
 469:   URL: https://www.prensalibre.com/guatemala/politica/ee-uu-pide-al-congreso-de-guatemala-aprobar-una-ley-contra-el-lavado-de-dinero-con-estandares-internacionales-breaking/
 470: - [2026-05-21] Prensalibre (prensalibre.com): "Sheinbaum descarta  gran riesgo  para remesas pese a orden ejecutiva de Trump"
 471:   URL: https://www.prensalibre.com/ahora/internacional/sheinbaum-descarta-gran-riesgo-para-remesas-pese-a-orden-ejecutiva-de-trump/
 472: - [2026-05-21] Emisorasunidas (emisorasunidas.com): "Organizaciones piden al nuevo Fiscal General poner fin a criminalización de periodistas"
 473:   URL: https://emisorasunidas.com/nacional/2026/05/21/organizaciones-fiscal-general-criminalizacion-periodistas-libertad-prensa/
 474: - [2026-05-21] Emisorasunidas (emisorasunidas.com): "Atrapan narcotraficante con droga oculta en mercancía de Kim Kardashian"
 475:   URL: https://emisorasunidas.com/farandula/2026/05/21/atrapan-a-narcotraficante-que-ocultaba-droga-en-mercaderia-de-kim-kardashian/
 476: - [2026-05-21] Publinews (publinews.gt): "Ubican más de Q350 mil en una casa que era usada por pandilleros del Barrio 18"
 477:   URL: https://www.publinews.gt/noticias/2026/05/21/ubican-mas-de-q350-mil-en-una-casa-que-era-usada-por-pandilleros-del-barrio-18/
 478: 
 479: ### HND
 480: 
 481: - [2026-05-21] Proceso (proceso.hn): "Johana Bermúdez llama a vacunarse ante alerta por sarampión en Honduras"
 482:   URL: https://proceso.hn/johana-bermudez-llama-a-vacunarse-ante-alerta-por-sarampion-en-honduras/
 483: - [2026-05-21] Proceso (proceso.hn): "Panamá suspende la venta de energía eléctrica a Costa Rica en medio de pugna comercial"
 484:   URL: https://proceso.hn/panama-suspende-la-venta-de-energia-electrica-a-costa-rica-en-medio-de-pugna-comercial/
 485: - [2026-05-21] Laprensa (laprensa.hn): "Crisis política en Bolivia"
 486:   URL: https://www.laprensa.hn/opinion/columnas/crisis-politica-en-bolivia-DA30743624
 487: - [2026-05-21] Proceso (proceso.hn): "Aranceles de EEUU habrían provocado caída del 5 % en la maquila hondureña"
 488:   URL: https://proceso.hn/aranceles-de-eeuu-habrian-provocado-caida-del-5-en-la-maquila-hondurena/
 489: - [2026-05-21] Proceso (proceso.hn): "Cámaras de Comercio exigen al Congreso enfocarse en generación de empleo"
 490:   URL: https://proceso.hn/camaras-de-comercio-exige-al-congreso-enfocarse-en-generacion-de-empleo/
 491: - [2026-05-21] Abriendobrecha (abriendobrecha.tv): "Fenagh niega carestía de carne y alerta de salida ilegal de ganado hacia México"
 492:   URL: https://abriendobrecha.tv/nacionales/fenagh-niega-carestia-de-carne-y-alerta-de-salida-ilegal-de-ganado-hacia-mexico/
 493: - [2026-05-21] Abriendobrecha (abriendobrecha.tv): "La deuda externa del sector público alcanzó los $10 , 761 . 8 millones"
 494:   URL: https://abriendobrecha.tv/economia/la-deuda-externa-del-sector-publico-alcanzo-los-10761-8-millones/
 495: - [2026-05-21] Laprensa (laprensa.hn): "Piden ayuda para repatriar desde Estados Unidos a Olancho a la hondureña Dariela Galeano"
 496:   URL: https://www.laprensa.hn/mundo/piden-ayuda-repatriar-hondurena-dariela-galeano-estados-unidos-olancho-JA30743648
 497: 
 498: ### ARG
 499: 
 500: - [2026-05-21] Diariosanrafael (diariosanrafael.com.ar): "La actividad económica mostró signos de recuperación : tuvo una suba del 5 , 5 % en marzo"
 501:   URL: https://diariosanrafael.com.ar/la-actividad-economica-mostro-signos-de-recuperacion-tuvo-una-suba-del-55-en-marzo/
 502: - [2026-05-21] Cronica (cronica.com.ar): "Alianza estratégica con Estados Unidos : cómo son los nuevos aviones de vigilancia que recibirá la Armada para custodiar el Mar Argentino"
 503:   URL: https://www.cronica.com.ar/politica/alianza-estrategica-con-estados-unidos-como-son-los-nuevos-aviones-de-vigilancia-que-recibira-la-armada-para-custodiar-el-mar-argentino-5487/
 504: - [2026-05-21] Eldiariodelapampa (eldiariodelapampa.com.ar): "La actividad económica en marzo subió 5 , 5 % y fue la mejor desde junio de 2025 :: El Diario de La Pampa"
 505:   URL: https://www.eldiariodelapampa.com.ar/pais/74461/la-actividad-economica-en-marzo-subio-55-en-porciento--y-fue-la-mejor-desde-junio-de-2025
 506: - [2026-05-21] Cronica (cronica.com.ar): "La Asociación Conciencia y el cóctel que reunió a todos por la educación :  El futuro no se espera : se enseña , se aprende y se construye"
 507:   URL: https://www.cronica.com.ar/politica/la-asociacion-conciencia-y-el-coctel-que-reunio-a-todos-por-la-educacion-el-futuro-no-se-espera-se-ensena-se-aprende-y-se-construye-1857/
 508: - [2026-05-21] Agencianova (agencianova.com): "VIDEO | La casta eran los laburantes : al 70 por ciento de los trabajadores el sueldo les dura menos de medio mes"
 509:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167675&id_tiponota=6
 510: - [2026-05-21] Agencianova (agencianova.com): "La diputada Karina Banfi cruzó al Gobierno por el recorte de Zona Fría y advirtió fuertes subas en las tarifas"
 511:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167676&id_tiponota=4
 512: - [2026-05-21] Agencianova (agencianova.com): "VIDEO | Silvina Soria acusó a una libertaria de comandar ataques en redes y habló de una  fuerte interna  en el partido"
 513:   URL: https://www.agencianova.com/nota.asp?n=2026_5_21&id=167684&id_tiponota=4
 514: - [2026-05-21] Diariosanrafael (diariosanrafael.com.ar): "Milei recibió en la Quinta de Olivos a Adorni para repasar la agenda de gestión"
 515:   URL: https://diariosanrafael.com.ar/milei-recibio-en-la-quinta-de-olivos-a-adorni-para-repasar-la-agenda-de-gestion/
 516: 
 517: ### ECU
 518: 
 519: - [2026-05-21] Eldiario (eldiario.ec): "Lavinia y el precio de la fama"
 520:   URL: https://www.eldiario.ec/opinion/lavinia-y-el-precio-de-la-fama/
 521: - [2026-05-21] Eldiario (eldiario.ec): "Familia de Matthew Perry acusa a su exasistente de traición"
 522:   URL: https://www.eldiario.ec/espectaculos/familia-de-matthew-perry-rompe-el-silencio-y-acusa-a-su-exasistente-confiamos-en-un-hombre-sin-conciencia-21052026/
 523: - [2026-05-21] Expreso (expreso.ec): "Ecuador presentará recurso de reconsideración ante la CAN por la tasa de seguridad"
 524:   URL: https://www.expreso.ec/economia-y-negocios/ecuador-presentara-recurso-reconsideracion-can-tasa-seguridad-282903.html
 525: - [2026-05-21] Expreso (expreso.ec): "Comic Con Ecuador confirma la participación de Christopher Masterson en su edición 2026"
 526:   URL: https://www.expreso.ec/entretenimiento/comic-ecuador-confirma-participacion-chris-masterson-edicion-2026-282877.html
 527: - [2026-05-21] Expreso (expreso.ec): "Municipio de Guayaquil crea comité de calidad que reconoce no haber tenido antes"
 528:   URL: https://www.expreso.ec/guayaquil/municipio-guayaquil-crea-comite-calidad-reconoce-no-haber-tenido-282912.html
 529: - [2026-05-21] Expreso (expreso.ec): "Narcopolítica en México : Cártel de Sinaloa se infiltró en ocho municipios en Morelo"
 530:   URL: https://www.expreso.ec/internacional/narcopolitica-mexico-cartel-sinaloa-infiltro-ocho-municipios-morelo-282914.html
 531: - [2026-05-21] Eldiario (eldiario.ec): "Madre muere en ataque armado al comprar pañales en Quevedo"
 532:   URL: https://www.eldiario.ec/seguridad/salio-a-comprar-panales-para-su-hijo-y-murio-en-ataque-armado-en-quevedo-21052026/
 533: - [2026-05-21] Expreso (expreso.ec): "Centenares protestan en La Paz : Las marchas exigen liberar los bloqueos de vías contra el Gobierno"
 534:   URL: https://www.expreso.ec/internacional/centenares-protestan-paz-marchas-exigen-liberar-bloqueos-vias-gobierno-282885.html
 535: 
 536: ### MEX
 537: 
 538: - [2026-05-21] Tiempo (tiempo.com.mx): "Invitan a hamburguesa en favor de Nidia , padece cáncer de rin"
 539:   URL: https://www.tiempo.com.mx/local/hamburguesa-beneficio-nidia-sandoval-cancer-de-rinon/
 540: - [2026-05-21] Eldictamen (eldictamen.mx): "Impulsan reforma constitucional en materia de no reelección y nepotismo electoral"
 541:   URL: https://www.eldictamen.mx/impulsan-reforma-constitucional-en-materia-de-no-reeleccion-y-nepotismo-electoral/
 542: - [2026-05-21] Aciprensa (aciprensa.com): "El don sagrado de la familia debe ser protegido de 4 amenazas actuales , señala obispo"
 543:   URL: https://www.aciprensa.com/noticias/125297/el-don-sagrado-de-la-familia-debe-ser-protegido-de-4-amenazas-actuales-senala-obispo
 544: - [2026-05-21] Tiempo (tiempo.com.mx): "Ex pareja llega armado y dispara contra establecimiento de la Vallarta🎦"
 545:   URL: https://www.tiempo.com.mx/local/agencia-working-las-granjas-avenida-vallarta-ataque-arma-de-postas-movilizacion-policiaca-expareja-disparos-chihuahua-autoridades/
 546: - [2026-05-21] Oem (oem.com.mx): "Inauguran Policía Cibernética Municipal en La Paz"
 547:   URL: https://oem.com.mx:443/elsudcaliforniano/local/inauguran-policia-cibernetica-municipal-en-la-paz-30117921
 548: - [2026-05-21] Criteriohidalgo (criteriohidalgo.com): "Franquicias requieren visión operativa y disciplina"
 549:   URL: https://www.criteriohidalgo.com/first-class/franquicias-requieren-vision-operativa-y-disciplina
 550: - [2026-05-21] Nortedigital (nortedigital.mx): "Retrocede empleo maquilador juarense a como estaba hace 10 años"
 551:   URL: https://nortedigital.mx/retrocede-empleo-maquilador-juarense-a-como-estaba-hace-10-anos/
 552: - [2026-05-21] Elimparcial (elimparcial.com): "Extorsión y sobreregulación golpean al comercio en Tijuana , advierte Concanaco"
 553:   URL: https://www.elimparcial.com/tij/tijuana/2026/05/21/extorsion-y-sobreregulacion-golpean-al-comercio-en-tijuana-advierte-concanaco/
 554: 
 555: 
 556: ## Reglas de detección activas
 557: 
 558: - Estrategia 1, cambio abrupto: |z| >= 2 respecto a los 5 puntos previos.
 559: - Estrategia 4, anomalía cross-país: |z| >= 2 respecto a la mediana regional (MAD-based).
 560: 
 561: ## Candidatos detectados
 562: 
 563: Cada candidato fue detectado por el pipeline determinístico. Para cada uno, escribí narrativas bilingües y emitilas en el bloque JSON final.
 564: 
 565: - candidate_id: cand_abrupt_change_HND_WB_WDI_SI_POV_DDAY_2024
 566:   type: abrupt_change
 567:   country: HND
 568:   observation: { period: 2024, value: 15.7, unit: PT_POP }
 569:   previous: { period: 2023, value: 17 }
 570:   z_score: -2.79
 571:   baseline_mean: 18.94
 572:   claim_id: 8c6bba0568efc716
 573: 
 574: - candidate_id: cand_anomaly_HND_WB_WDI_SI_POV_DDAY_2024
 575:   type: anomaly
 576:   country: HND
 577:   observation: { period: 2024, value: 15.7, unit: PT_POP }
 578:   z_score: 2.41
 579:   regional_median: 4.45
 580:   claim_id: 8c6bba0568efc716
 581: 
 582: 