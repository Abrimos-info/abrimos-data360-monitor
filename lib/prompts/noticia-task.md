# Tarea: redactar una Noticia

Usá el contexto integrado para producir una noticia periodística completa y verificada.

Pasos:
1. Identificá el candidato (o candidatos si hay varios países) con mayor magnitud de cambio.
2. Redactá el `title` (titular) en es y en — máximo 12 palabras.
3. Redactá el `lead` (lede) en es y en — máximo 2 oraciones, ≤ 60 palabras.
4. Redactá el `story` (cuerpo) en es y en:
   - Abrí con contexto histórico del país líder.
   - Sumá comparación regional entre los 5 países del demo.
   - Cerrá con implicancias para la ciudadanía o las redacciones.
   - Incluí todos los números con sus `{{claim:CLAIM_ID|valor}}`.
5. Completá `countries` con los países que tengan al menos un candidato detectado.
6. Completá `claim_tokens` con todos los claim_id usados en `story`. Cada `value` debe ser un string.
7. Completá `chart_series` con la serie histórica del país líder (del contexto §2).
8. Ejecutá el protocolo de auto-verificación (bloque `quality`).

El `id` de la noticia sigue el patrón: `noticia_{type}_{country}_{idno}_{time_period}_{seq}`.
Usá los `claim_id` del contexto §5 — nunca los inventes.

Importante: el JSON debe contener EXACTAMENTE los campos del template. No agregues campos no listados; el validador los rechaza.
