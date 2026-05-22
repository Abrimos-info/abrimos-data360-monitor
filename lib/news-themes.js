'use strict';

/**
 * Primary themes for the combined GDELT query (validated May 2026).
 * Selected for LAC Spanish coverage over a 1-year window; noisy broad
 * themes (GENERAL_HEALTH, UNEMPLOYMENT, WB_831_GOVERNANCE, etc.) excluded.
 *
 * Theme lookup: http://data.gdeltproject.org/api/v2/guides/LOOKUP-GKGTHEMES.TXT
 */

const { COUNTRY_GDELT } = require('./news');

/** Primary themes used in the GDELT query (one per policy domain). */
const PRIMARY_ANNUAL_GDELT_THEMES = [
  'WB_471_ECONOMIC_GROWTH',
  'TAX_ECON_PRICE',
  'WB_698_TRADE',
  'ECON_DEBT',
  'POVERTY',
  'WB_695_POVERTY',
  'WB_642_CHILD_HEALTH',
  'WB_639_REPRODUCTIVE_MATERNAL_AND_CHILD_HEALTH',
  'WB_2748_EMPLOYMENT',
  'CORRUPTION',
];

/** @type {Record<string, string[]>} */
const INDICATOR_GDELT_THEMES = {
  WB_WDI_NY_GDP_PCAP_CD:       ['EPU_ECONOMY', 'WB_471_ECONOMIC_GROWTH'],
  WB_WDI_NY_GDP_MKTP_KD_ZG:    ['EPU_ECONOMY', 'WB_471_ECONOMIC_GROWTH'],
  WB_WDI_FP_CPI_TOTL_ZG:       ['TAX_ECON_PRICE', 'EPU_ECONOMY'],
  WB_WDI_BX_KLT_DINV_WD_GD_ZS: ['WB_698_TRADE', 'WB_1921_PRIVATE_SECTOR_DEVELOPMENT'],
  WB_WDI_BN_CAB_XOKA_GD_ZS:    ['WB_698_TRADE', 'EPU_ECONOMY'],
  WB_CCDFS_GGDY:               ['WB_450_DEBT', 'ECON_DEBT'],
  WB_WDI_GC_XPN_INTP_RV_ZS:    ['GENERAL_GOVERNMENT', 'ECON_DEBT'],
  WB_WDI_SI_POV_GINI:          ['POVERTY', 'WB_695_POVERTY'],
  WB_WDI_SI_POV_DDAY:          ['POVERTY', 'WB_695_POVERTY'],
  WB_WDI_SE_SEC_ENRR:          ['EDUCATION', 'WB_470_EDUCATION'],
  WB_WDI_SH_STA_MMRT:          ['WB_639_REPRODUCTIVE_MATERNAL_AND_CHILD_HEALTH', 'GENERAL_HEALTH'],
  WB_WDI_SH_DYN_MORT:          ['WB_642_CHILD_HEALTH', 'GENERAL_HEALTH'],
  WB_WDI_SL_TLF_CACT_FE_ZS:    ['WB_2748_EMPLOYMENT', 'UNGP_JOB_OPPORTUNITIES_EMPLOYMENT'],
  WB_WDI_SL_UEM_TOTL_ZS:       ['UNEMPLOYMENT', 'WB_2748_EMPLOYMENT'],
  GOV_WGI_GE:                  ['CORRUPTION', 'WB_831_GOVERNANCE'],
  GOV_WGI_CC:                  ['CORRUPTION', 'WB_832_ANTI_CORRUPTION'],
};

const ANNUAL_INDICATOR_IDS = Object.keys(INDICATOR_GDELT_THEMES);

function themesForIndicator(idno) {
  return INDICATOR_GDELT_THEMES[idno] || [];
}

function themesForAnnualWatchlist() {
  return [...PRIMARY_ANNUAL_GDELT_THEMES];
}

function buildThemeClause(themes) {
  if (!themes.length) return '';
  if (themes.length === 1) return `theme:${themes[0]}`;
  return `(${themes.map((t) => `theme:${t}`).join(' OR ')})`;
}

function buildCountryNewsQuery(country, { themes = null, theme = null, language = 'Spanish' } = {}) {
  const gdeltCountry = COUNTRY_GDELT[country];
  if (!gdeltCountry) throw new Error(`Unknown country: ${country}`);

  const parts = [
    `SOURCECOUNTRY:${gdeltCountry}`,
    `SOURCELANG:${language}`,
  ];
  if (theme) {
    parts.push(`theme:${theme}`);
  } else {
    const themeList = themes || themesForAnnualWatchlist();
    const themeClause = buildThemeClause(themeList);
    if (themeClause) parts.push(themeClause);
  }
  return parts.join(' ');
}

function indicatorHintsFromThemes(themes) {
  if (!themes || !themes.length) return [];
  const hints = new Set();
  for (const theme of themes) {
    for (const [idno, idThemes] of Object.entries(INDICATOR_GDELT_THEMES)) {
      if (idThemes.includes(theme)) hints.add(idno);
    }
  }
  return [...hints].sort();
}

module.exports = {
  INDICATOR_GDELT_THEMES,
  PRIMARY_ANNUAL_GDELT_THEMES,
  ANNUAL_INDICATOR_IDS,
  themesForIndicator,
  themesForAnnualWatchlist,
  buildThemeClause,
  buildCountryNewsQuery,
  indicatorHintsFromThemes,
};
