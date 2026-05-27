# Plantilla del análisis de indicador

El output es un único documento markdown con cinco secciones y bloques fenced intercalados. No agregues secciones adicionales. No agregues introducción ni cierre. Empieza directamente con `# §1`.

Las cifras numéricas dentro de prosa (no dentro de bloques fenced JSON) deben envolverse con `{{claim:CLAIM_ID|valor}}` cuando refieran a observaciones del contexto. Las cifras de estadísticos derivados (z-score, percentiles) no requieren claim si las computas vos.

---

## §1. Ficha del indicador

Tabla compacta con estos campos. Léelos del contexto, sección `## Indicador`.

| Campo | Valor |
|-------|-------|
| Nombre | (del contexto) |
| idno | (del contexto) |
| Database | (del contexto) |
| Periodicidad | (del contexto) |
| Unidad | (del contexto) |
| Licencia | (del contexto) |
| Último año cubierto | (del último período común) |

Bloque `source` al final de la sección.

---

## §2. Resumen ejecutivo

Un solo párrafo de 3 a 5 oraciones. Responde:

- Qué cuenta este indicador sobre los 5 países del scope LAC.
- Qué patrón comparativo emerge (quién está alto, quién bajo, quién cambió rápido).
- Cuál es la señal noticiosa principal del último año disponible.

Toda cifra que cites va envuelta en `{{claim:...}}`. Si no hay señal noticiosa relevante, dilo explícitamente.

Bloque `source` al final.

---

## §3. Análisis por país

Una subsección por país, en orden alfabético ISO3: ARG, ECU, GTM, HND, MEX.

Cada subsección de 2 a 4 oraciones. Responde, en este orden:

1. Trayectoria histórica reciente del indicador en ese país (último valor, comparación con el de hace 5 años o el primero disponible).
2. Si hay cambio abrupto (estrategia 1) reciente, descríbelo con z-score numérico aproximado.
3. Si el país está fuera del patrón regional (estrategia 4), descríbelo con la diferencia a la mediana.
4. Una conexión con el background narrativo del país si el contexto la incluye.

Bloque `source` al final de cada subsección de país.

---

## §4. Alertas detectadas

Por cada país que cumpla las reglas de detección, emite un bloque fenced `alert` con el schema definido en el system prompt. Si no se detecta nada en ningún país, escribe "Sin alertas en este ciclo" y no emitas bloques `alert`.

Reglas:

- Máximo 2 alertas por país.
- Máximo 7 alertas totales.
- Cada `alert.claim_tokens` referencia los `claim_id` usados en el texto de la alerta.

No incluyas bloque `source` aquí. Las alertas son auto-suficientes con su `verification_trace`.

---

## §5. Auto-verificación

Un bloque fenced `quality` con los resultados del protocolo. Schema en el system prompt. Si algún check falla, agrega `notes` explicando el motivo.

Tras el bloque `quality`, termina el documento sin texto adicional.
