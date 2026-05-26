# Traducción ES → EN de Noticia (preservar claims PCN)

Traducí fielmente al inglés los campos de una noticia ya validada en español.

## Reglas de claim tokens (PCN)

- Los tokens `{{claim:CLAIM_ID|valor}}` en `story.es` deben reaparecer en `story.en` con el **mismo CLAIM_ID literal**.
- Podés reformatear solo el `valor` al locale inglés (punto decimal, coma de miles).
- No elimines, inventes ni renombres claim_id.
- `claim_tokens[].claim_id` y `claim_tokens[].value` deben coincidir con la lista provista (mismos ids; `value` en formato EN donde aplique).

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
