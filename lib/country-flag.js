'use strict';

/** ISO3 codes used in the LAC demo watchlist. */
const ISO3_TO_ISO2 = {
  ARG: 'AR',
  ECU: 'EC',
  GTM: 'GT',
  HND: 'HN',
  MEX: 'MX',
};

function iso3ToFlagEmoji(iso3) {
  const iso2 = ISO3_TO_ISO2[String(iso3 || '').toUpperCase()];
  if (!iso2 || iso2.length !== 2) return '';
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65),
  );
}

module.exports = {
  ISO3_TO_ISO2,
  iso3ToFlagEmoji,
};
