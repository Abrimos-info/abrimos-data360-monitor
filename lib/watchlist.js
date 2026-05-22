'use strict';

/**
 * Demo watchlist: ~35 indicators across three tiers × 5 LAC countries (D-021, D-024).
 * Each entry: { database_id, idno, label, tier, expectedSex, expectedCb1 }
 */

const COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

const TIER1 = [
  ['FAO_CP', 'FAO_CP_23012', 'Consumer Prices, General Indices', '_T', null],
  ['FAO_CP', 'FAO_CP_23013', 'Consumer Prices, Food Indices', '_T', null],
  ['FAO_CP', 'FAO_CP_23014', 'Food price inflation', '_T', null],
  ['IPC_IPC', 'IPC_IPC_PHASE', 'People in each phase of food insecurity classification', '_T', null],
  ['IPC_IPC', 'IPC_IPC_P3PLUS', 'People in Phase 3 food insecurity or above', '_T', null],
  ['IMF_BOP', 'IMF_BOP_BTCC_BP6', 'Total current and capital account balance', '_T', null],
  ['IMF_BOP', 'IMF_BOP_IR_BP6', 'Reserve assets (IIP)', '_T', null],
  ['IMF_BOP', 'IMF_BOP_BFP_BP6', 'Portfolio investment, net (BOP financial account)', '_T', null],
  ['IMF_BOP', 'IMF_BOP_IPDG_BP6', 'Government debt securities held by foreigners (IIP)', '_T', null],
  ['IMF_BOP', 'IMF_BOP_IPE_BP6', 'Foreign-held equity and investment fund shares (IIP)', '_T', null],
];

const TIER2 = [
  ['WB_WDI', 'WB_WDI_NY_GDP_PCAP_CD', 'GDP per capita, current USD', '_T', null],
  ['WB_WDI', 'WB_WDI_NY_GDP_MKTP_KD_ZG', 'GDP growth, annual %', '_T', null],
  ['WB_WDI', 'WB_WDI_FP_CPI_TOTL_ZG', 'Inflation, CPI annual %', '_T', null],
  ['WB_WDI', 'WB_WDI_BX_KLT_DINV_WD_GD_ZS', 'FDI net inflows, % of GDP', '_T', null],
  ['WB_WDI', 'WB_WDI_BN_CAB_XOKA_GD_ZS', 'Current account balance, % of GDP', '_T', null],
  ['WB_CCDFS', 'WB_CCDFS_GGDY', 'General government gross debt, % of GDP', '_T', null],
  ['WB_WDI', 'WB_WDI_GC_XPN_INTP_RV_ZS', 'Interest payments, % of revenue', '_T', null],
  ['WB_WDI', 'WB_WDI_SI_POV_GINI', 'Gini index', '_T', null],
  ['WB_WDI', 'WB_WDI_SI_POV_DDAY', 'Poverty headcount at $2.15/day', '_T', null],
  ['WB_WDI', 'WB_WDI_SE_SEC_ENRR', 'Secondary enrolment, gross %', '_T', null],
  ['WB_WDI', 'WB_WDI_SH_STA_MMRT', 'Maternal mortality ratio', '_T', null],
  ['WB_WDI', 'WB_WDI_SH_DYN_MORT', 'Under-five mortality', '_T', null],
  ['WB_WDI', 'WB_WDI_SL_TLF_CACT_FE_ZS', 'Female labour force participation, 15+', 'F', null],
  ['WB_WDI', 'WB_WDI_SL_UEM_TOTL_ZS', 'Unemployment, total %', '_T', null],
  ['WB_WGI', 'GOV_WGI_GE', 'Government effectiveness', '_Z', 'WGI_EST'],
  ['WB_WGI', 'GOV_WGI_CC', 'Control of corruption', '_Z', 'WGI_EST'],
];

const TIER3 = [
  ['IMF_WEO', 'IMF_WEO_NGDP_RPCH', 'GDP growth, constant prices, percent change', '_T', null],
  ['IMF_WEO', 'IMF_WEO_PCPIPCH', 'Inflation, average consumer prices, percent change', '_T', null],
  ['IMF_WEO', 'IMF_WEO_LUR', 'Unemployment rate, percent of total labor force', '_T', null],
  ['IMF_WEO', 'IMF_WEO_GGXWDG_NGDP', 'General government gross debt, percent of GDP', '_T', null],
  ['IMF_WEO', 'IMF_WEO_BCA_NGDPD', 'Current account balance, percent of GDP', '_T', null],
  ['IMF_WEO', 'IMF_WEO_GGXONLB_NGDP', 'Primary fiscal balance, percent of GDP', '_T', null],
  ['IMF_WEO', 'IMF_WEO_NGDPDPC', 'GDP per capita, current USD', '_T', null],
  ['WB_MPO', 'WB_MPO_POV1', 'International poverty rate, percent of population', '_T', null],
  ['WB_MPO', 'WB_MPO_POV2', 'Lower middle-income poverty rate, percent of population', '_T', null],
];

const TIER_FILES = {
  pulse: 'pulse.csv',
  annual: 'annual.csv',
  forecast: 'forecast.csv',
};

function toEntries(rows, tier) {
  return rows.map(([database_id, idno, label, expectedSex, expectedCb1]) => ({
    database_id,
    idno,
    label,
    tier,
    expectedSex,
    expectedCb1,
  }));
}

const WATCHLIST = [
  ...toEntries(TIER1, 'pulse'),
  ...toEntries(TIER2, 'annual'),
  ...toEntries(TIER3, 'forecast'),
];

function getWatchlist() {
  return WATCHLIST;
}

function getTierFile(tier) {
  return TIER_FILES[tier] || `${tier}.csv`;
}

module.exports = {
  COUNTRIES,
  WATCHLIST,
  getWatchlist,
  getTierFile,
  TIER_FILES,
};
