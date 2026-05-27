# Protocolo de auto-verificación

Ejecuta estos siete checks sobre tu propio output antes de cerrar el documento. Emite el bloque `quality` final con un resultado por cada check.

---

## Q1. Trazabilidad de claims

Cada `claim_id` que aparezca en una narrativa (`{{claim:ID|valor}}`) debe:

1. Aparecer también en el `claim_tokens` array del bloque `alert` correspondiente.
2. Referirse a una observación que existe en la sección `## Países y trayectorias` del contexto.

Si un claim no es rastreable al contexto, eliminá esa narrativa o reescribíla.

---

## Q2. Forma de los bloques `alert`

Cada bloque `alert` tiene todos los campos del schema definido en el system prompt. Faltantes posibles:

- `id` único dentro del análisis.
- `type` con uno de los dos valores permitidos.
- `country` en código ISO3.
- `observation.value` como string.
- `observation.time_period` con el período cubierto.
- `claim_tokens` no vacío.
- `claim_tokens` con al menos un token verificable.
- `verification_trace.csv_link` y `verification_trace.data360_url`.

---

## Q3. Volumen de alertas

- Máximo 2 alertas por país.
- Máximo 7 alertas totales.
- Si hay más, recortá quedando las de mayor `score`.

---

---

## Q5. Citas de observaciones

Toda observación citada en `alert.observation` debe corresponder a una fila real de la serie en el contexto. Si no encontrás la fila correspondiente al `time_period` que pusiste, descartá la alerta.

---

## Q6. Locale numérico consistente

Verificá que todas las cifras en prosa usen formato `es-419` (miles con coma, decimales con punto, dos decimales por defecto). Los `value` crudos dentro de los JSON van con el formato del API (string sin reformatear).

---

## Q7. Marcas de hipótesis presentes donde corresponde

Buscá en el análisis afirmaciones causales, predictivas o inferenciales que no estén envueltas en `[HIPÓTESIS] ... [/HIPÓTESIS]`. Si encontrás alguna, agregá los delimitadores antes de emitir.

---

## Formato del bloque `quality` de salida

```yaml
- check: Q1
  ok: true
  notes: ""
- check: Q2
  ok: true
  notes: ""
- check: Q3
  ok: true
  notes: ""
- check: Q4
  ok: true
  notes: ""
- check: Q5
  ok: true
  notes: ""
- check: Q6
  ok: true
  notes: ""
- check: Q7
  ok: true
  notes: ""
```

Si algún check falla, `ok: false` y `notes` explica qué se corrigió o qué quedó pendiente.
