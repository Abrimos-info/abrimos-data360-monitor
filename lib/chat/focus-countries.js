'use strict';

const { DEMO_COUNTRIES } = require('./freshness-preset');

function normalizeFocusCountries(list) {
  if (!Array.isArray(list)) return [...DEMO_COUNTRIES];
  const valid = list.filter((c) => typeof c === 'string' && DEMO_COUNTRIES.includes(c));
  return valid.length ? valid : [...DEMO_COUNTRIES];
}

function appendFocusToSystemPrompt(system, focusCountries, focusChanged) {
  const valid = normalizeFocusCountries(focusCountries);
  const joined = valid.join(', ');
  const changedNote = focusChanged
    ? 'El usuario **acaba de cambiar** el foco geográfico en esta consulta. '
    : '';
  if (valid.length === DEMO_COUNTRIES.length) {
    return `${system}\n\n## Países foco (consulta actual)\n`
      + `${changedNote}El usuario tiene seleccionados los cinco países demo: **${joined}**.\n`;
  }
  return `${system}\n\n## Países foco (consulta actual)\n`
    + `${changedNote}El usuario restringió el foco a: **${joined}**. `
    + 'Usá solo estos países en tools (`country`, `country_code`, `country_codes`, `fetch_news`) '
    + 'salvo que el mensaje pida explícitamente otro país.\n';
}

module.exports = {
  DEMO_COUNTRIES,
  normalizeFocusCountries,
  appendFocusToSystemPrompt,
};
