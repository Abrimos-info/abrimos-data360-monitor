# Tarea: redactar un Reportaje

El contexto §7 contiene las Noticias ya generadas para los indicadores de este dataset. Si existe §8, incluye prensa reciente para citar en el reportaje (no para inventar noticias propias).

Al referenciar prensa del §8, citá textualmente el extracto (`body_excerpt` o `snippet`) entre comillas, con medio (`source.name`), autor (`author`) y enlace markdown `[medio](url)`.

Pasos:
1. Leé todas las Noticias del §7 (solo `observation`, `chart_series`, `claim_tokens` — no hay story previo).
2. Identificá el hilo narrativo común: ¿qué cuenta el conjunto de cambios sobre este dataset y estos países?
3. Redactá el `title` (máx 15 palabras) y `lead` (máx 80 palabras).
4. Redactá el `story` con panorama regional + secciones por país + conclusión (500–1200 palabras):
   - Panorama: síntesis regional sin copiar párrafos enteros a las secciones por país.
   - Por país: Δ explícito (valor anterior → actual) con claim tokens; verbos coherentes con la unidad (`RANK`: menor=mejor).
   - No repitas el mismo párrafo en panorama y en un país.
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
Q8: [OK|FAIL] — title sin cifras ni símbolos numéricos
```
