
# Newsletter diario LAC — tarea

Producís el JSON estructurado de la edición del día siguiendo el shape de `newsletter-template.md`. Aplicás las reglas de `newsletter-system.md` y el andamiaje de bloques de este archivo.

## Pasos en orden

1. **Validar el pool**: filtrá §7 por `verification_trace_ok = true` y `mag ≥ 0,4`. Si el pool filtrado queda vacío, activá fallback de día seco (newsletter-system §Fallback) y saltá al paso 4.

2. **Seleccionar piezas** según reglas de newsletter-system §Selección:
   - **Hero**: top `score` entre las no marcadas como huérfana protagonista (`bonus_orphan > 0` Y `cov_inv ≥ 0,95`).
   - **Huérfana**: mayor `bonus_orphan > 0` entre las no seleccionadas como hero.
   - **Destacadas**: 2 o 3 siguientes en `score`, respetando diversidad país (solo `scope = LAC`).
   - Si una pieza falla diversidad, saltar a la siguiente y registrar el `noticia_id` saltado en `_metadata.diversity_skips`.

3. **Construir bloques editoriales** siguiendo el andamiaje de la sección siguiente.

4. **Calcular `orphan_ratio`** y elegir cierre default vs temático según newsletter-system §Cierre.

5. **Emitir JSON** según `newsletter-template.md` con bloque `quality` completo y self-reported.

## Andamiaje de bloques

### Bloque 1 — `subject`
- Longitud objetivo: ≤ 70 caracteres. Tolerado: 60-75.
- AP: nunca empezar con cifra.
- Estructura sugerida: `[Sujeto + acción + cifra del hero] — y [N] [otros|otras] hallazgo[s]`.
- Sin emoji, sin signos de exclamación, sin emoji-prefijo.
- Ejemplo ES: `"Honduras retrocede 12 puestos en estado de derecho — y otros cuatro hallazgos"`.

### Bloque 2 — `preheader`
- Longitud: ≤ 110 caracteres.
- Complementa el subject; **no repite el hecho del hero**.
- Estructura sugerida: `[Síntesis del hero en 4-6 palabras]. Más: [hecho corto featured 1], [hecho corto featured 2 u orphan].`
- Ejemplo ES: `"El mayor descenso regional del año. Más: México alcanza a Brasil en internet rural, Guatemala recorta gasto educativo por 3er año."`

### Bloque 3 — `greeting`
- Una sola frase.
- Estructura ES: `"[Día y mes en letra, sin coma Oxford]. [N en letra si ≤ nueve, cifra si ≥ 10] indicadores se movieron en América Latina y el Caribe el día de ayer."`
- Si `edition.scope` es código ISO-3: reemplazar `"América Latina y el Caribe"` por el nombre completo del país.
- Si `is_dry_day = true`: `"[Día y mes]. Sin movimientos significativos en los indicadores LAC; revisitamos una pieza huérfana de los últimos días."`

### Bloque 4 — `hero`
- **Sin label de sección encima** (regla de presentación: el hero abre por jerarquía visual del H3).
- Componentes:
  - **`title`** (H3): heredar literal del `title.es` de la noticia seleccionada.
  - **`lede_absorbed`** (primer párrafo, 60-90 palabras): el editor escribe este párrafo. Estructura obligatoria de **tres frases**:
    1. Encuadre del día: `"Entre los [N] movimientos del día, el más significativo viene de [país]."` o variante equivalente.
    2. Cifra principal: presenta el dato con claim token `{{claim:CLAIM_ID|valor}}` y enlace markdown al dataset Data360.
    3. Hito o comparación: cuantifica el contexto (mayor pérdida desde X, mayor descenso regional, primera vez desde Y).
  - **`story_excerpt`** (segundo párrafo, 60-90 palabras): heredar/adaptar uno o dos párrafos del `story.es` de la noticia. **Permitido recortar y fusionar; prohibido reescribir cifras o añadir interpretación nueva.**
  - **`cta_link`**: `[Leer la nota completa →](/?noticia=NXXXXX)` con el `noticia_id` real.
- Total hero: 120-180 palabras.

### Bloque 5 — `featured` (2 o 3 piezas)
- Encabezado del bloque: `## 📌 Destacadas`
- Por pieza:
  - **Línea 1**: `flag_emoji` + `**título corto en negrita**` (heredado del `title.es`; recortar a ≤ 120 chars truncando palabra completa + `"…"` si excede).
  - **Línea 2** (`one_liner`): una sola frase factual con cifra principal + claim token + enlace al dataset si está disponible. 25-50 palabras.
  - **`cta_link`**: `[Leer →](/?noticia=NXXXXX)`.
- Mapping `flag_emoji` por `country_iso`: 🇲🇽 MEX · 🇨🇴 COL · 🇦🇷 ARG · 🇭🇳 HND · 🇬🇹 GTM · 🇧🇷 BRA · 🇨🇱 CHL · 🇵🇪 PER · 🇪🇨 ECU · 🇩🇴 DOM · 🇨🇷 CRI · 🇺🇾 URY · 🇵🇾 PRY · 🇧🇴 BOL · 🇸🇻 SLV · 🇳🇮 NIC · 🇭🇹 HTI · 🇵🇦 PAN · 🇻🇪 VEN · 🇯🇲 JAM. (Lista completa en repo, archivo `lib/util/country-flags.js`.)

### Bloque 6 — `orphan`
- Encabezado: `## 🔍 Indicador huérfano`
- Subtítulo en blockquote: `> *Datos que se actualizaron y casi nadie cubrió.*`
- Componentes:
  - **`badge`**: `"Indicador huérfano"` (ES) / `"Underreported indicator"` (EN). Renderer lo aplica como etiqueta visual.
  - **`title`** (H3): heredar literal del `title.es` de la huérfana.
  - **`lede_absorbed`** (60-90 palabras): similar al hero pero **sin frase de encuadre del día**. Arranca directo: `"[País] [verbo] [hecho]…"` con cifra + claim token + enlace dataset. Dos a tres frases.
  - **`story_excerpt`** (60-90 palabras): heredar/adaptar del `story.es`. Trayectoria + contexto LAC + contexto global.
  - **`coverage_note`** (una frase final): `"El dato circuló [N] vez/veces en prensa regional durante los últimos siete días, según el monitoreo de GDELT."` Usar el campo `gdelt_mentions_7d` de la pieza. Si N = 0: `"El dato no apareció en prensa regional durante los últimos siete días, según el monitoreo de GDELT."` Si N = 1: `"vez"`. Si N ≥ 2: `"veces"`.
  - **`cta_link`**: `[Leer la nota completa →](/?noticia=NXXXXX)`.
- Total huérfana: 130-200 palabras.

### Bloque 7 — `close`
- Sin encabezado de sección. Separado del bloque anterior por `---`.
- Lógica dual:
  - Si `orphan_ratio < 0,40` → `close.type = "default"`. Una sola frase. Ejemplo base: `"Mañana sale otra edición con los movimientos del día."` Permitido variar la formulación, manteniendo: una frase, sin meta-comentario, sin imperativo.
  - Si `orphan_ratio ≥ 0,40` → `close.type = "thematic"`. Dos o tres frases. Estructura sugerida: `[Frase 1: cuantifica proporción real]. [Frase 2: enuncia distancia conceptual entre datos y cobertura]. [Frase 3: nombra el oficio del newsletter como afirmación, no imperativo].`
- La proporción citada en cierre temático debe ser **literalmente verdadera**. Verbalizaciones admitidas: `"tres de los cinco"`, `"la mitad de"`, `"cuatro de los seis"`, etc.

### Bloque 8 — `cta`
- Una sola línea en negrita: `[**Ver la edición completa en abrimos.info →**](URL_de_la_edición)`.
- URL viene del campo §9 del contexto.

### Bloque 9 — `footer`
- Tres bloques en cursiva, separados por línea en blanco:
  1. **`pcn_note`**: `"Cada cifra de este correo lleva un enlace directo al dataset original del Banco Mundial. Es lo que llamamos PCN (Public Citation Network). Si una cita no aguanta el click, no la publicamos. [Cómo lo verificamos →](URL_metodologia)"`
  2. **Personalización** (string fijo del renderer): `"Te suscribiste con [email]. [Darte de baja](url) · [Preferencias](url)"` — el renderer inyecta los tokens.
  3. **`license_note`**: `"Abrimos.info — agencia de noticias para datos de desarrollo. Open source, GPLv3. Gratis para newsrooms y NPOs en países en desarrollo, siempre."`

## Heredar sin reescribir

- **Cifras**: literal del claim token. Nunca redondear, transformar ni recalcular.
- **Títulos**: literal del `title.es`. Recortar solo si excede el límite del bloque (truncar palabra completa, añadir `"…"`).
- **Leads de destacadas (`one_liner`)**: pueden recortar/adaptar la primera frase del `lead.es` para que quepa en una línea (25-50 palabras).
- **Story del hero/huérfana (`story_excerpt`)**: heredar uno o dos párrafos; **permitido fusionar y recortar**, prohibido añadir interpretación nueva o cifras nuevas.
- **Lede absorbido del hero/huérfana**: **el editor escribe libre** dentro de la estructura obligatoria de tres frases, **usando solo cifras presentes en el `story.es`** de la pieza.

## Prohibiciones duras

- No inventar cifras, fechas, países ni hallazgos no presentes en el pool.
- No añadir contexto factual no presente en el `story.es` de la pieza original.
- No usar adjetivos valorativos sin respaldo (`dramático`, `preocupante`, `alarmante`, `histórico` solo si el dato lo respalda literalmente — ej. `"el mayor descenso desde el inicio de la serie"`).
- No usar imperativos de marketing en ningún campo (`suscríbete`, `no te pierdas`, `haz click aquí`, `descúbrelo ahora`).
- No nombrar aliados en copy externo (Animal Político, Quinto Elemento Lab, Ojoconmipisto u otros). Regla de copy V2 del `product-marketing-context`.
- No usar emoji fuera de: `⭐` (reservado, no usar en este draft), `📌` (header destacadas), `🔍` (header huérfana), banderas ISO en línea de cada destacada.

## Orden de emisión del JSON

Emitir los bloques en este orden estricto dentro del JSON: `edition` → `subject` → `preheader` → `greeting` → `hero` → `featured` → `orphan` → `close` → `cta` → `footer` → `quality` → `_metadata`. El validador upstream usa este orden para parsing rápido.
