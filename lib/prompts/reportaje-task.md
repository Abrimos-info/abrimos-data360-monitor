# Tarea: redactar un Reportaje

El contexto §7 contiene las Noticias ya generadas para los indicadores de este dataset. Tu trabajo es integrarlas en un reportaje de profundidad.

Pasos:
1. Leé todas las Noticias del §7.
2. Identificá el hilo narrativo común: ¿qué cuenta el conjunto de cambios sobre este dataset y estos países?
3. Redactá el `title` (máx 15 palabras) y `lead` (máx 80 palabras).
4. Redactá el `story` con panorama regional + secciones por país + conclusión (500–1200 palabras).
5. Completá `countries` con todos los países que aparecen en alguna Noticia de §7.
6. Completá `indicators` con los IDNO de las Noticias del §7.
7. Completá `noticia_ids` con los `id` de las Noticias del §7.
8. Completá `claim_tokens` con todos los claim_id usados en el `story`. Cada `value` es un string.
9. Emití el bloque `quality`.

```reportaje
{
  "content_type": "reportaje",
  "id": "reportaje_{dataset_id}_{YYYY-MM-DD}",
  "title": { "es": "...", "en": "..." },
  "lead": { "es": "...", "en": "..." },
  "story": { "es": "...", "en": "..." },
  "countries": ["ISO3"],
  "dataset_id": "DATABASE_ID",
  "indicators": ["IDNO1", "IDNO2"],
  "noticia_ids": ["noticia_id1", "noticia_id2"],
  "claim_tokens": [{ "claim_id": "...", "value": "..." }],
  "verification_trace": {
    "data360_dataset_url": "https://data360.worldbank.org/en/int/dataset/DATABASE_ID",
    "csv_links": ["..."]
  },
  "score": 0.0,
  "detected_at": "ISO8601"
}
```

```quality
Q1: [OK|FAIL] — todos los claim_id en story están en el contexto
Q2: [OK|FAIL] — JSON válido con todos los campos requeridos
Q4: [OK|FAIL] — story.es entre 500 y 1200 palabras
Q5: [OK|FAIL] — datos correctamente citados con time_period
Q6: [OK|FAIL] — locale numérico consistente
Q7: [OK|FAIL] — hipótesis marcadas con [HIPÓTESIS]
```
