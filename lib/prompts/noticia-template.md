# Template de salida para Noticia

Emitís exactamente este bloque fenced (sin texto adicional antes o después, excepto el bloque `quality`):

```noticia
{
  "content_type": "noticia",
  "id": "noticia_{type}_{country}_{idno}_{time_period}_{seq}",
  "title": {
    "es": "Titular en español (máx 12 palabras, sin cifras ni %)",
    "en": "Headline in English (max 12 words, no digits or %)"
  },
  "lead": {
    "es": "Lede en español (máx 60 palabras).",
    "en": "Lead in English (max 60 words)."
  },
  "story": {
    "es": "Cuerpo completo de la noticia en español (350–500 palabras, andamiaje 6 bloques). Incluye {{claim:CLAIM_ID|valor}} para cada número citado y enlace markdown a toda fuente periodística mencionada.",
    "en": "Full story body in English (350–500 words, 6-block scaffold). Include {{claim:CLAIM_ID|value}} for each number cited and markdown links for every news source mentioned."
  },
  "countries": ["ISO3"],
  "dataset_id": "DATABASE_ID",
  "indicator": {
    "idno": "INDICATOR_IDNO",
    "database_id": "DATABASE_ID",
    "name": {
      "es": "Nombre del indicador en español",
      "en": "Indicator name in English"
    }
  },
  "observation": {
    "value": "123.45",
    "time_period": "YYYY o YYYY-MM",
    "unit": "unidad"
  },
  "magnitude": "+2.3σ o Δ+5.2%",
  "chart_series": [
    { "period": "YYYY", "value": 0.0 }
  ],
  "claim_tokens": [
    { "claim_id": "CLAIM_ID", "value": "123.45" }
  ],
  "verification_trace": {
    "data360_dataset_url": "https://data360.worldbank.org/en/int/dataset/DATABASE_ID",
    "csv_link": "https://data360files.worldbank.org/data360-data/data/DATABASE_ID/INDICATOR_IDNO.csv"
  },
  "score": 0.0,
  "detected_at": "ISO8601",
  "data_period_stale": false
}
```

```quality
Q1: [OK|FAIL] — todos los claim_id en story están en claim_tokens y en el contexto §5
Q2: [OK|FAIL] — JSON válido con todos los campos requeridos
Q4: [OK|FAIL] — story.es entre 350 y 500 palabras (300-550 tolerado); lead.es ≤ 60 palabras
Q10: [OK|FAIL] — toda mención a una noticia (prensa GDELT §8 o archivo §9) lleva enlace markdown a la URL original; ninguna URL fue inventada; el dataset Data360 está enlazado en el cuerpo
Q11: [OK|FAIL] — los tres ejes país/LAC/mundo están presentes en story.es; si falta contexto mundo, está declarado explícitamente
Q5: [OK|FAIL] — observaciones citadas con su time_period correcto
Q6: [OK|FAIL] — locale numérico consistente (es: coma decimal; en: punto decimal)
Q7: [OK|FAIL] — hipótesis marcadas con [HIPÓTESIS] donde corresponde
Q8: [OK|FAIL] — title.es y title.en sin dígitos, % ni símbolos de moneda
Q9: [OK|FAIL] — observation.value y claim del protagonista coinciden con ## Candidatos detectados; si hay previous, lead/story citan ambos y Δ coherente con el titular
```

## Tipos críticos (errores Q2 frecuentes)

- `observation.value` — **STRING** entre comillas dobles, ej. `"123.45"`. Nunca un número crudo. Convención Data360: `OBS_VALUE` es decimal-precision string.
- `claim_tokens[].value` — **STRING**, mismo formato que `observation.value`.
- `chart_series[].value` — **NUMBER** sin comillas, ej. `1234.56`. Este es el único campo `value` numérico del esquema; el resto son strings.
- No agregues campos fuera del template; el validador rechaza `additionalProperties`.
