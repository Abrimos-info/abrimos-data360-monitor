# Tarea: redactar una Noticia (solo español)

Generá **solo los campos en español** (`.es`). Dejá los campos `.en` como string vacío `""`.

Pasos:
1. Elegí el candidato de mayor |z| como protagonista. Copiá sus campos `observation`, `previous` y la línea `REDACTAR CON ESTOS VALORES`.
2. `title.es`: máximo 12 palabras, verbo alineado al signo del cambio, **sin cifras**.
3. `lead.es`: máximo 2 oraciones, ≤ 60 palabras; incluí valor actual y anterior (si hay) con claim tokens.
4. `story.es`: 250–600 palabras — (a) hecho + Δ, (b) comparación solo entre candidatos listados, (c) cierre concreto sin relleno genérico. Todos los números en `{{claim:CLAIM_ID|valor}}`.
5. `observation`: mismo value/period/unit que el candidato protagonista.
6. `countries`: países con candidato detectado.
7. `claim_tokens`: todos los claim_id usados; `value` = string crudo del candidato, no el display formateado.
8. `chart_series`: serie del protagonista desde la tabla del contexto.
9. Bloque `quality` opcional.

Usá únicamente los `claim_id` de `### allowed_claim_ids`. No inventes campos extra.
