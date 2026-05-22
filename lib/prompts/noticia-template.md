# Template de salida para Noticia

Emitís exactamente este bloque fenced (sin texto adicional antes o después, excepto el bloque `quality`):

```noticia
{
  "content_type": "noticia",
  "id": "noticia_{type}_{country}_{idno}_{time_period}_{seq}",
  "title": {
    "es": "Titular en español (máx 12 palabras)",
    "en": "Headline in English (max 12 words)"
  },
  "lead": {
    "es": "Lede en español (máx 60 palabras).",
    "en": "Lead in English (max 60 words)."
  },
  "story": {
    "es": "Cuerpo completo de la noticia en español (250–600 palabras). Incluye {{claim:CLAIM_ID|valor}} para cada número citado.",
    "en": "Full story body in English (250–600 words). Include {{claim:CLAIM_ID|value}} for each number cited."
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
    "value": "valor_más_reciente",
    "time_period": "YYYY o YYYY-MM",
    "unit": "unidad"
  },
  "magnitude": "+2.3σ o Δ+5.2%",
  "chart_series": [
    { "period": "YYYY", "value": 0.0 }
  ],
  "claim_tokens": [
    { "claim_id": "CLAIM_ID", "value": "valor" }
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
Q4: [OK|FAIL] — story.es entre 250 y 600 palabras; lead.es ≤ 60 palabras
Q5: [OK|FAIL] — observaciones citadas con su time_period correcto
Q6: [OK|FAIL] — locale numérico consistente (es: coma decimal; en: punto decimal)
Q7: [OK|FAIL] — hipótesis marcadas con [HIPÓTESIS] donde corresponde
```
