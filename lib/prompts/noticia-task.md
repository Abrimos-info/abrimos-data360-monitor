# Tarea: redactar una Noticia

Usá el contexto integrado para producir una noticia periodística completa y verificada.

Pasos:
1. Identificá el candidato protagonista (mayor |z|) y anotá su `observation`, `previous` (si hay) y `claim_id`.
2. Redactá el `title` (titular) en es y en — máximo 12 palabras, **sin cifras**, verbo coherente con el cambio real (`RANK`: empeoró/mejoró posición; otros: sube/baja/se mantiene). Copiá la línea `REDACTAR CON ESTOS VALORES` del candidato protagonista.
3. Redactá el `lead` (lede) en es y en — máximo 2 oraciones, ≤ 60 palabras, con valor actual **y** anterior (si existe) en claim tokens.
4. Redactá el `story` (cuerpo) en es y en, siguiendo este andamiaje de **6 bloques** (350–500 palabras totales):
   - **Bloque 1 — Lede (1 párrafo, 40-60 palabras)**: cifra principal con claim token + variación respecto al período anterior + fuente (indicador, fecha, Data360 con enlace al dataset).
   - **Bloque 2 — Contexto país (1 párrafo, 50-80 palabras)**: trayectoria histórica de este país en este indicador (3-5 años, mínimo dos puntos anteriores citados con claim tokens).
   - **Bloque 3 — Contexto LAC (1 párrafo, 60-90 palabras)**: posición regional + al menos 2 países comparables (solo si tienen candidato en el contexto). Citar con claim tokens.
   - **Bloque 4 — Contexto mundo (1 párrafo o frase, 30-60 palabras)**: rank global o mediana mundial si están en el contexto. Si no, declarar la ausencia explícitamente.
   - **Bloque 5 — Implicancia concreta (1 párrafo, 40-60 palabras)**: una sola consecuencia anclada al delta, sin generalidades. Marcar con [HIPÓTESIS] si no está respaldada por datos.
   - **Bloque 6 — Metodología compacta (1 frase final)**: qué mide el indicador, frecuencia, fuente. Una sola oración.
   - Incluí todos los números con sus `{{claim:CLAIM_ID|valor}}`.
   - Si citás prensa externa (§8) o noticia previa (§9), enlace markdown a la URL original es obligatorio.
5. Completá `countries` con los países que tengan al menos un candidato detectado.
6. Completá `claim_tokens` con todos los claim_id usados en `story`. Cada `value` debe ser el **string numérico crudo** del candidato (ej. `"10"`, no el texto formateado del token).
7. Completá `observation` copiando verbatim el candidato protagonista (`value` string, `time_period`, `unit`).
8. Completá `chart_series` con la serie del país protagonista desde la tabla del contexto (últimos puntos visibles).
9. Ejecutá el protocolo de auto-verificación (bloque `quality`).

El `id` de la noticia sigue el patrón: `noticia_{type}_{country}_{idno}_{time_period}_{seq}`.
Usá los `claim_id` de `### allowed_claim_ids` — nunca los inventes.

Importante: el JSON debe contener EXACTAMENTE los campos del template. No agregues campos no listados; el validador los rechaza.
