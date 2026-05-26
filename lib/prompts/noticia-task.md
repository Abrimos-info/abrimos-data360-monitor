# Tarea: redactar una Noticia

Usá el contexto integrado para producir una noticia periodística completa y verificada.

Pasos:
1. Identificá el candidato protagonista (mayor |z|) y anotá su `observation`, `previous` (si hay) y `claim_id`.
2. Redactá el `title` (titular) en es y en — máximo 12 palabras, **sin cifras**, verbo coherente con el cambio real (`RANK`: empeoró/mejoró posición; otros: sube/baja/se mantiene). Copiá la línea `REDACTAR CON ESTOS VALORES` del candidato protagonista.
3. Redactá el `lead` (lede) en es y en — máximo 2 oraciones, ≤ 60 palabras, con valor actual **y** anterior (si existe) en claim tokens.
4. Redactá el `story` (cuerpo) en es y en:
   - Primer párrafo: hecho principal con Δ explícito (ej. "de X a Y, +Z unidades").
   - Segundo párrafo: comparación regional breve usando **solo** candidatos listados.
   - Cierre: una implicancia concreta ligada al delta o al z-score; sin párrafos de definición metodológica genérica.
   - Incluí todos los números con sus `{{claim:CLAIM_ID|valor}}`.
5. Completá `countries` con los países que tengan al menos un candidato detectado.
6. Completá `claim_tokens` con todos los claim_id usados en `story`. Cada `value` debe ser el **string numérico crudo** del candidato (ej. `"10"`, no el texto formateado del token).
7. Completá `observation` copiando verbatim el candidato protagonista (`value` string, `time_period`, `unit`).
8. Completá `chart_series` con la serie del país protagonista desde la tabla del contexto (últimos puntos visibles).
9. Ejecutá el protocolo de auto-verificación (bloque `quality`).

El `id` de la noticia sigue el patrón: `noticia_{type}_{country}_{idno}_{time_period}_{seq}`.
Usá los `claim_id` de `### allowed_claim_ids` — nunca los inventes.

Importante: el JSON debe contener EXACTAMENTE los campos del template. No agregues campos no listados; el validador los rechaza.
