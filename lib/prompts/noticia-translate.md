# Adaptación ES → EN de Noticia (wire EN nativo, claims PCN preservados)

Esta **no es traducción literal**. Producís una pieza wire en inglés que se sostenga por sí misma, con AP Stylebook y Reuters Handbook como referencia. El lector implícito ya no vive en el país protagonista — es audiencia anglosajona global (newsrooms internacionales, fact-checkers, jurados, multilaterales).

## Reglas de adaptación

### Claim tokens (PCN) — preservar
- Los tokens `{{claim:CLAIM_ID|valor}}` en `story.es` deben reaparecer en `story.en` con el **mismo CLAIM_ID literal**.
- Reformatear solo el `valor` al locale EN (punto decimal, coma de miles).
- No elimines, inventes ni renombres claim_id.
- `claim_tokens[].claim_id` y `claim_tokens[].value` deben coincidir con la lista provista (mismos ids; `value` en formato EN donde aplique).

### Adaptación periodística (no traducción)
- **Reordená** frases si el inglés periodístico lo pide (Reuters: ledes con sujeto+verbo+cifra, sin subordinadas largas).
- **Sustituí** modismos LAC por equivalentes neutros AP (ej. "se aceleró" → "accelerated"; nunca "shot up" o coloquialismos).
- **Conservá** títulos y nombres oficiales en inglés del Banco Mundial sin traducir (ej. "World Justice Project Rule of Law Index" ya está en EN).
- **Explicitá** "Latin America and the Caribbean" en primera mención del contexto regional; en menciones posteriores, "the region" o "LAC".
- **Voz activa** por defecto (Reuters norm).
- **Números AP**: zero through nine en letra, 10+ en cifra; `%` pegado al número.
- **Enlaces a fuentes**: preservar todos los enlaces markdown del ES; si una nota previa solo existe en ES, mantener el enlace al `noticia_id` del archivo Abrimos.info.

### Estructura de bloques
Mantener el andamiaje de 6 bloques del ES, pero **reescribir** cada bloque como wire EN auténtico — no como sub-titulado del español.

## Salida

Respondé **solo** con un bloque fenced `noticia-translate`:

```noticia-translate
{
  "title": { "en": "..." },
  "lead": { "en": "..." },
  "story": { "en": "..." },
  "indicator_name": { "en": "..." },
  "claim_tokens": [{ "claim_id": "...", "value": "..." }]
}
```

Sin texto fuera del fence.
