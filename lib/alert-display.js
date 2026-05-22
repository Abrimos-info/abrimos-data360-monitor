'use strict';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_ES_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CLAIM_MARKER_RE = /\{\{claim:([^}|]+)\|([^}]*)\}\}/g;

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/[)\],.;]+$/, '');
}

function isClaimMarker(text) {
  return typeof text === 'string' && text.includes('{{claim:');
}

function looksLikeRawNumber(text) {
  return typeof text === 'string' && /^-?\d+(\.\d+)?$/.test(text.trim());
}

function formatNumber(value, lang, decimals) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  const dec = decimals != null ? decimals : 2;
  const locale = lang === 'en' ? 'en-US' : 'es-AR';
  return n.toLocaleString(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function unitSuffix(unit, lang) {
  if (!unit) return '';
  if (unit === '%' || unit === 'PT' || String(unit).toLowerCase().includes('percent')) return ' %';
  if (unit === 'USD') return ' USD';
  if (unit === 'IX') return lang === 'es' ? ' (índice)' : ' (index)';
  if (unit === 'U' || unit === 'unitless') return '';
  return ` ${unit}`;
}

function formatObservationValue(value, unit, lang) {
  return `${formatNumber(value, lang)}${unitSuffix(unit, lang)}`;
}

function fallbackFromClaimMarker(text) {
  if (!isClaimMarker(text)) return text;
  const m = text.match(/\{\{claim:[^|]+\|([^}]*)\}\}/);
  return m ? m[1] : text;
}

function resolveClaimDisplay(token, lang) {
  const field = lang === 'en' ? 'display_en' : 'display_es';
  const raw = token[field];
  if (raw && !isClaimMarker(raw) && !looksLikeRawNumber(raw)) return raw;
  const fromMarker = raw ? fallbackFromClaimMarker(raw) : null;
  if (fromMarker && !isClaimMarker(fromMarker) && !looksLikeRawNumber(fromMarker)) {
    return fromMarker;
  }
  const n = Number(token.value);
  if (Number.isFinite(n)) return formatNumber(n, lang);
  return fromMarker || String(token.value ?? '');
}

function sanitizeClaimTokens(tokens) {
  if (!Array.isArray(tokens)) return tokens;
  return tokens.map((token) => ({
    ...token,
    display_es: resolveClaimDisplay(token, 'es'),
    display_en: resolveClaimDisplay(token, 'en'),
  }));
}

function claimTokenMap(alert) {
  return new Map((alert.claim_tokens || []).map((t) => [String(t.claim_id), t]));
}

function renderClaimMarkers(text, alert, lang) {
  if (!text || typeof text !== 'string') return text;
  const map = claimTokenMap(alert);
  return text.replace(CLAIM_MARKER_RE, (_, id, fallback) => {
    const token = map.get(String(id));
    if (token) return resolveClaimDisplay(token, lang);
    return fallback || id;
  });
}

function displayFromClaimTokens(alert) {
  const tokens = alert.claim_tokens;
  if (!Array.isArray(tokens) || tokens.length === 0) return null;
  const primary = tokens[0];
  return {
    es: resolveClaimDisplay(primary, 'es'),
    en: resolveClaimDisplay(primary, 'en'),
  };
}

function formatPeriodDisplay(period, lang) {
  if (!period) return '';
  const lng = lang === 'en' ? 'en' : 'es';
  const monthMatch = period.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (monthMatch) {
    const idx = parseInt(monthMatch[2], 10) - 1;
    const months = lng === 'en' ? MONTHS_EN : MONTHS_ES;
    if (idx >= 0 && idx < 12) return `${months[idx]} ${monthMatch[1]}`;
  }
  const quarterMatch = period.match(/^(\d{4})-Q(\d)$/i);
  if (quarterMatch) {
    return lng === 'en'
      ? `Q${quarterMatch[2]} ${quarterMatch[1]}`
      : `T${quarterMatch[2]} ${quarterMatch[1]}`;
  }
  return period;
}

function observationDate(period) {
  if (!period) return null;
  const iso = period.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const ym = period.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, 1);
  const y = period.match(/^(\d{4})$/);
  if (y) return new Date(Number(y[1]), 11, 31);
  const q = period.match(/^(\d{4})-Q(\d)$/i);
  if (q) return new Date(Number(q[1]), (Number(q[2]) - 1) * 3 + 2, 1);
  return null;
}

function isStaleDataPeriod(period, staleMonths = 15) {
  const d = observationDate(period);
  if (!d) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - staleMonths);
  return d < cutoff;
}

function observationSortKey(alert) {
  return alert?.observation?.time_period || '';
}

function sortAlertsByDataDate(alerts) {
  return [...alerts].sort((a, b) => {
    const periodCmp = observationSortKey(b).localeCompare(observationSortKey(a));
    if (periodCmp !== 0) return periodCmp;
    return String(b.detected_at || '').localeCompare(String(a.detected_at || ''));
  });
}

function formatPeriodNarrative(period, lang) {
  if (!period) return '';
  const monthMatch = period.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (monthMatch) {
    const idx = parseInt(monthMatch[2], 10) - 1;
    if (idx >= 0 && idx < 12) {
      return lang === 'en'
        ? `${MONTHS_EN_LONG[idx]} ${monthMatch[1]}`
        : `${MONTHS_ES_LONG[idx]} de ${monthMatch[1]}`;
    }
  }
  const quarterMatch = period.match(/^(\d{4})-Q(\d)$/i);
  if (quarterMatch) {
    return lang === 'en'
      ? `Q${quarterMatch[2]} ${quarterMatch[1]}`
      : `T${quarterMatch[2]} de ${quarterMatch[1]}`;
  }
  return period;
}

function enrichBilingualField(field, alert, lang) {
  if (!field || typeof field !== 'object') return field;
  return {
    es: renderClaimMarkers(field.es, alert, 'es'),
    en: renderClaimMarkers(field.en, alert, 'en'),
  };
}

function enrichAlert(alert) {
  if (!alert || typeof alert !== 'object') return alert;
  const enriched = { ...alert };

  if (enriched.verification_trace?.methodology_ref) {
    enriched.verification_trace = {
      ...enriched.verification_trace,
      methodology_ref: sanitizeUrl(enriched.verification_trace.methodology_ref),
    };
  }

  if (Array.isArray(enriched.claim_tokens)) {
    enriched.claim_tokens = sanitizeClaimTokens(enriched.claim_tokens);
  }

  if (enriched.observation) {
    const obs = { ...enriched.observation };
    const fromClaims = displayFromClaimTokens(enriched);
    if (fromClaims) {
      obs.display = fromClaims;
    } else if (obs.display) {
      obs.display = {
        es: renderClaimMarkers(obs.display.es, enriched, 'es'),
        en: renderClaimMarkers(obs.display.en, enriched, 'en'),
      };
    }
    if (!obs.display && obs.value != null) {
      obs.display = {
        es: formatObservationValue(obs.value, obs.unit, 'es'),
        en: formatObservationValue(obs.value, obs.unit, 'en'),
      };
    }
    obs.period_display = {
      es: formatPeriodDisplay(obs.time_period, 'es'),
      en: formatPeriodDisplay(obs.time_period, 'en'),
    };
    obs.period_narrative = {
      es: formatPeriodNarrative(obs.time_period, 'es'),
      en: formatPeriodNarrative(obs.time_period, 'en'),
    };
    enriched.observation = obs;
    enriched.data_period_stale = isStaleDataPeriod(obs.time_period);
  }

  if (enriched.narrative_citizen) {
    enriched.narrative_citizen = enrichBilingualField(enriched.narrative_citizen, enriched, 'es');
  }
  if (enriched.narrative_journalist) {
    enriched.narrative_journalist = enrichBilingualField(enriched.narrative_journalist, enriched, 'es');
  }

  return enriched;
}

function latestDetectedAt(alerts) {
  if (!Array.isArray(alerts) || alerts.length === 0) return null;
  let latest = null;
  for (const alert of alerts) {
    if (!alert.detected_at) continue;
    const ts = Date.parse(alert.detected_at);
    if (!Number.isFinite(ts)) continue;
    if (!latest || ts > latest) latest = ts;
  }
  return latest ? new Date(latest).toISOString() : null;
}

function formatLastUpdate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return `${date} · ${time} UTC`;
}

function formatScore(score) {
  if (score == null || !Number.isFinite(Number(score))) return '';
  return (Math.round(Number(score) * 100) / 100).toFixed(2);
}

module.exports = {
  sanitizeUrl,
  formatPeriodDisplay,
  formatPeriodNarrative,
  formatObservationValue,
  isClaimMarker,
  resolveClaimDisplay,
  renderClaimMarkers,
  sanitizeClaimTokens,
  displayFromClaimTokens,
  enrichAlert,
  sortAlertsByDataDate,
  isStaleDataPeriod,
  observationSortKey,
  latestDetectedAt,
  formatLastUpdate,
  formatScore,
};
