
# Adaptación ES → EN del Newsletter diario LAC

Esta **no es traducción literal**. Producís el espejo EN de la edición ya validada en ES, con AP Stylebook y Reuters Handbook como referencia. El lector implícito ya no vive en la región LAC — es audiencia anglosajona global (newsrooms internacionales, fact-checkers, jurados, multilaterales).

## Claim tokens (PCN) — preservar literal

- Los tokens `{{claim:CLAIM_ID|valor}}` presentes en cualquier campo `.es` deben reaparecer en su par `.en` con el **mismo `CLAIM_ID` literal**.
- Reformatear solo el `valor` al locale EN (punto decimal, coma de miles, `%` pegado al número).
- Los arrays `claim_tokens[]` y los flags `verification_trace_ok` permanecen idénticos entre `.es` y `.en`.
- **No inventar, renombrar ni eliminar claim_id.**

## Adaptación periodística (no traducción)

- **Reordená** frases si el inglés periodístico lo pide. Reuters: ledes con sujeto + verbo + cifra, sin subordinadas largas al inicio.
- **Sustituí** modismos LAC por equivalentes neutros AP:
  - `"se disparó"` → `"climbed sharply"` (no `"shot up"`).
  - `"se desplomó"` → `"fell sharply"` (no `"plunged"` salvo magnitud extrema).
  - `"récord"` → `"record"` o `"all-time"` según contexto.
- **Conservá** títulos y nombres oficiales en inglés del Banco Mundial sin traducir (`"World Justice Project Rule of Law Index"` ya está en EN).
- **Explicitá** `"Latin America and the Caribbean"` en primera mención (subject, preheader o greeting); en menciones posteriores `"the region"` o `"LAC"`.
- **Voz activa** por defecto (Reuters norm).
- **Números AP en EN**:
  - Zero through nine en letra (`zero, three, eight`); 10+ en cifra.
  - Excepción: cifras con unidad siempre en cifra (`5%`, `3 percentage points`, `12 countries`).
  - `%` pegado al número, sin espacio (`78.4%`).
  - Decimal con punto (`4.2`), miles con coma (`12,000`).
- **Coma decimal ES → punto EN**: `4,2 puntos` → `4.2 percentage points`.
- **Espacio % ES → sin espacio EN**: `5 %` → `5%`.

## Por bloque

### `subject.en`
- Mismo target de longitud (60-75 chars).
- AP: nunca empezar con cifra.
- Estructura wire-style: sujeto + verbo + delta + `"— and N more findings"`.
- Ejemplo: `"Honduras drops 12 spots in rule of law — and four more findings"`.

### `preheader.en`
- ≤ 110 chars.
- Mantener estructura: síntesis del hero + `". Plus: "` + dos hechos cortos.
- Ejemplo: `"The region's biggest annual drop. Plus: Mexico catches Brazil in rural internet, Guatemala cuts education spending for a 3rd year."`

### `greeting.en`
- Una sola frase.
- Día de la semana + mes inglés + número + año implícito.
- Ejemplo: `"Wednesday, May 27. Five indicators shifted across Latin America and the Caribbean yesterday."`
- Si `is_dry_day = true`: `"Wednesday, May 27. No significant movements in LAC indicators; we revisit an underreported finding from recent days."`

### `hero.title.en` · `orphan.title.en` · `featured[].title.en`
- **Heredar literal** del campo `.en` ya producido por `noticia-translate` para esa pieza. **No retraducir.**

### `hero.lede_absorbed.en`
- Reescribir el lede absorbido en wire EN (no traducir literal del ES).
- Estructura obligatoria de tres frases:
  1. Encuadre del día: `"Among the day's [N] movements, the most significant comes from [country]."` o variante equivalente.
  2. Cifra principal con claim token + enlace al dataset Data360.
  3. Hito o comparación: cuantifica el contexto regional o histórico.
- 60-90 palabras.

### `orphan.lede_absorbed.en`
- Reescribir en wire EN, sin frase de encuadre del día.
- Arranca directo: `"[Country] [verb] [fact]…"` con cifra + claim token + enlace dataset.
- 60-90 palabras, dos o tres frases.

### `hero.story_excerpt.en` · `orphan.story_excerpt.en`
- Heredar/adaptar uno o dos párrafos de `noticia.story.en` ya producido por `noticia-translate`. **No retraducir; solo recortar para extensión.**

### `featured[].one_liner.en`
- Adaptar la primera frase del `lead.en` de la noticia para que quepa en una línea (25-50 palabras).
- Mantener claim token y enlace al dataset si están en el ES.

### `orphan.coverage_note.en`
- Tres variantes según `gdelt_mentions_7d`:
  - `0`: `"The data did not appear in regional press during the last seven days, according to GDELT monitoring."`
  - `1`: `"The data appeared once in regional press during the last seven days, according to GDELT monitoring."`
  - `≥ 2`: `"The data appeared {{gdelt_mentions_7d}} times in regional press during the last seven days, according to GDELT monitoring."`

### `close.en`
- Reescribir wire EN coherente con `close.type`.
- Si `close.type = default`: una frase. Ejemplo: `"Another edition lands tomorrow with the day's indicator movements."`
- Si `close.type = thematic`: dos o tres frases. Citar `orphan_ratio` real con verbalización admitida: `"Three of today's five findings"`, `"Half of today's findings"`, `"Four of today's six findings"`. Ejemplo: `"Three of today's five findings did not appear in any regional headline. That is the distance between reading newspapers and reading the data. Why this email goes out every morning."`

### `cta.label.en`
- String fijo: `"See the full edition →"`.

### `footer.pcn_note.en` · `footer.license_note.en`
- Strings fijos heredados del template (`newsletter-template.md`). **No reescribir.**

## Validador

El espejo EN pasa el **mismo bloque `quality` Q1-Q13** del template. Cualquier `FAIL` bloquea publicación bilingüe.

## Prohibiciones duras

- No traducir literalmente cuando el inglés periodístico pide otra estructura.
- No inventar cifras, claim_ids, fechas, fuentes ni países en el EN.
- No usar imperativos de marketing (`subscribe now`, `don't miss`, `click here`, `read more`).
- No usar coloquialismos ni clichés periodísticos en EN:
  - Evitar: `"hot off the press"`, `"must-read"`, `"groundbreaking"`, `"unprecedented"` (salvo que el dato lo respalde literal).
  - Preferir: voz activa, cifras directas, atribución explícita.
- No nombrar aliados en copy externo (mismo principio que el ES — regla V2 del `product-marketing-context`).
