# Tarea: redactar un Reportaje

El contexto §7 contiene las Noticias ya generadas para los indicadores de este dataset. Si existe §8, incluye prensa reciente para citar en el reportaje (no para inventar noticias propias).

Al referenciar prensa del §8, citá textualmente el extracto (`body_excerpt` o `snippet`) entre comillas, con medio (`source.name`), autor (`author`) y enlace markdown `[medio](url)`.

Pasos:
1. Leé todas las Noticias del §7 (solo `observation`, `chart_series`, `claim_tokens` — no hay story previo).
2. Identificá el hilo narrativo común: ¿qué cuenta el conjunto de cambios sobre este dataset y estos países?
3. Redactá el `title` (máx 15 palabras) y `lead` (máx 80 palabras).
4. Redactá el `story` siguiendo este andamiaje de **8 bloques** (1200–1800 palabras):
   - **Bloque 1 — Lede narrativo (100-150 palabras)**: una cifra-ancla o hallazgo del país protagonista que sintetice la tesis del perfil. No es resumen; es entrada con impacto. Enlace al dataset Data360 en el primer párrafo.
   - **Bloque 2 — Síntesis de hallazgos (80-120 palabras)**: 3-5 hallazgos clave del dataset en bullets o párrafo único, cada uno con su claim token.
   - **Bloque 3 — Cuerpo por dimensiones (3-5 sub-secciones de 150-250 palabras)**: una sub-sección por sub-indicador o factor relevante del dataset. **Subtítulo H3 explícito**. Cada dimensión con su Δ y comparación intra-LAC. Verbos coherentes con la unidad (`RANK`: menor=mejor).
   - **Bloque 4 — Comparación LAC dedicada (150-200 palabras)**: posición país-por-país en los indicadores del dataset. Tabla markdown si aporta.
   - **Bloque 5 — Contexto mundo (80-120 palabras)**: posición mundial — mejores, peores, comparables fuera de la región si el contexto los lista. Declarar ausencia honestamente si falta.
   - **Bloque 6 — Trayectoria histórica y noticias previas (150-250 palabras)**:
     - Si §8 (prensa GDELT) trae cobertura, citá al menos un titular. Formato obligatorio: `"[extracto entre comillas]" — [autor], [Medio](url), [fecha]`.
     - Si §9 (archivo Abrimos.info) trae noticias previas sobre el mismo `idno` o `dataset_id`, citá con `[ver nota previa](/?noticia=ID)` enlazando al `noticia_id` real.
     - **Nunca** citar una noticia sin enlace. Si el contexto trae el titular pero no la URL, omitir la cita.
     - **Nunca** inventar URL, medio, autor ni fecha.
   - **Bloque 7 — Cierre con perspectiva (100-150 palabras)**: no resumen — kicker AP / close Reuters. Conecta el conjunto con un fenómeno más amplio o plantea pregunta abierta. Sin "en conclusión", "como hemos visto".
   - **Bloque 8 — Caja metodológica (50-80 palabras)**: una sola caja con qué mide el dataset, número de sub-indicadores, frecuencia, fuente, link a Data360.
   - No repitas párrafos entre bloques. Cada cifra en `{{claim:CLAIM_ID|valor}}`.
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
Q4: [OK|FAIL] — story.es entre 1200 y 1800 palabras (1000-2000 tolerado)
Q10: [OK|FAIL] — toda mención a una noticia (prensa GDELT §8 o archivo §9) lleva enlace markdown a la URL original; ninguna URL fue inventada; el dataset Data360 está enlazado en el cuerpo
Q11: [OK|FAIL] — los tres ejes país/LAC/mundo están presentes en story.es; si falta contexto mundo, está declarado explícitamente
Q12: [OK|FAIL] — el reportaje sigue los 8 bloques del andamiaje (lede, síntesis, cuerpo por dimensiones, LAC dedicada, mundo, trayectoria+previas, cierre con perspectiva, caja metodológica)
Q5: [OK|FAIL] — datos correctamente citados con time_period
Q6: [OK|FAIL] — locale numérico consistente
Q7: [OK|FAIL] — hipótesis marcadas con [HIPÓTESIS]
Q8: [OK|FAIL] — title sin cifras ni símbolos numéricos
```
