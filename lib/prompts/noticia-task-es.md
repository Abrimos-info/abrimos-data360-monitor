# Tarea: redactar una Noticia (solo español)

Generá **solo los campos en español** (`.es`). Dejá los campos `.en` como string vacío `""`.

Pasos:
1. Elegí el candidato de mayor |z| como protagonista. Copiá sus campos `observation`, `previous` y la línea `REDACTAR CON ESTOS VALORES`.
2. `title.es`: máximo 12 palabras, verbo alineado al signo del cambio, **sin cifras**.
3. `lead.es`: máximo 2 oraciones, ≤ 60 palabras; incluí valor actual y anterior (si hay) con claim tokens.
4. `story.es`: 350–500 palabras siguiendo andamiaje de 6 bloques —
   (1) Lede con cifra + variación + fuente con enlace Data360;
   (2) Contexto país con trayectoria 3-5 años;
   (3) Contexto LAC con ≥ 2 países comparables (solo candidatos listados);
   (4) Contexto mundo con rank/mediana global o declaración de ausencia;
   (5) Implicancia concreta anclada al delta (marcar [HIPÓTESIS] si no está respaldada);
   (6) Metodología compacta en una frase final.
   Todos los números en `{{claim:CLAIM_ID|valor}}`. Toda cita a prensa o noticia previa con enlace markdown a URL original.
5. `observation`: mismo value/period/unit que el candidato protagonista.
6. `countries`: países con candidato detectado.
7. `claim_tokens`: todos los claim_id usados; `value` = string crudo del candidato, no el display formateado.
8. `chart_series`: serie del protagonista desde la tabla del contexto.
9. Bloque `quality` opcional.

Usá únicamente los `claim_id` de `### allowed_claim_ids`. No inventes campos extra.
