# Guía de usuario — Data360 News Agent

> **Audiencia**: redacciones de América Latina y el Caribe.  
> **Estado**: borrador funcional al 2026-05-29 (demo fase 2, entrega 2026-05-31).

## Qué hace esta herramienta

**Data360 News Agent** es una agencia de noticias basada en inteligencia artificial que vigila indicadores económicos, sociales y de gobernanza en **Guatemala, Honduras, Argentina, Ecuador y México**. Cuando detecta un hecho estadísticamente notable, publica dos tipos de contenido verificado:

- **Noticia**. Pieza bilingüe (250–600 palabras) por indicador y país, disparada por un candidato de detección.
- **Reportaje**. Pieza bilingüe larga (500–1200 palabras) por *dataset*, generada solo cuando dos o más Noticias comparten el mismo `dataset_id`. Sintetiza una mirada regional con secciones por país y reutiliza los `claim_id` de las Noticias que sintetiza.

Cada pieza queda enlazada a su fuente en [data360.worldbank.org](https://data360.worldbank.org).

El producto tiene tres caras principales:

| Vista | URL | Para qué sirve |
|-------|-----|----------------|
| **Selector de país** | `/` | Elegir país y ver indicadores recientemente actualizados |
| **Portada por país** | `/{país}` (ej. `/mexico`) | Layout de periódico: reportaje destacado, titulares, ticker de indicadores |
| **Artículo** | `/{país}/{noticia\|reportaje}/{año}/{mes}/{slug}` | Lectura completa + chat acotado a la pieza |
| **Indicadores globales** | `/indicadores` | Hub por tier con conteos de alertas y filtros |
| **Chat global** | `/chat` | Exploración libre con presets, freshness y tools Data360 |

Todas leen el mismo archivo de alertas (`data/alerts.json`).

---

## Alcance del demo

- **Países**: GTM, HND, ARG, ECU, MEX (no sustituir por BRA, CHL, COL, etc.).
- **Indicadores**: dos modos de selección.
  - **Watchlist estático**: ~35 indicadores en tres tiers de fetch (pulse, annual, forecast). Lista canónica en `lib/watchlist.js`. El tier `pulse` ya no entra en detección ni verificación PCN.
  - **Modo dinámico** (recomendado): indicadores descubiertos en vivo desde `/data360/searchv2`, expandidos vía `/data360/indicators?datasetId=…`, persistidos en `data/dynamic-watchlist.json` y escritos en `data/context/{PAÍS}/dynamic.csv`. Es la fuente que usa el pipeline por defecto (`NOTICIA_TIERS = ['dynamic']`).
- **Detección**: estrategias **1** (cambios abruptos, z-score) y **4** (anomalías cross-indicador).
- **Modo**: replay histórico sobre snapshots CSV, no tiempo real continuo (D-007).
- **Titulares**: GDELT y/o Gemini (según script), almacenados en `data/news/{PAÍS}/{YYYY-MM}.jsonl` (contexto pasivo para narrativas; divergencia narrativa-dato queda en roadmap).

---

## Interfaz web

### Navegación

Barra superior (tema World Bank):

- **Portada** — selector de país y portadas LAC
- **Indicadores globales** — hub `/indicadores`
- **About** — metodología, límites, equipo, licencia
- **Suscribirse** — modal de suscripción (newsletter LAC o alertas por indicador)
- **ES / EN** — selector de idioma de interfaz y narrativas

Páginas legales e informativas: `/metodologia`, `/privacidad`, `/terminos`, `/uso` (contenido en `config/copy/`, no en esta guía).

### Idiomas

Selector **ES / EN** en la barra. Cambia la interfaz y el idioma de las narrativas mostradas. Las piezas guardan texto en ambos idiomas en el JSON; la UI muestra **un idioma a la vez** (no hay modo bilingüe simultáneo en pantalla).

Parámetros URL: `?lang=es` o `?lang=en`.

### Onboarding

Modal de bienvenida en la primera visita (dismissible). Presenta **Data360 News Agent** como agencia de noticias con IA: detecta hechos noticiosos en los 12.000 indicadores de Data360 y los entrega verificados con perspectiva local a newsrooms LAC. Forzar con `?onboarding=1`.

### Suscripciones

Botón **Suscribirse** abre un modal con dos tipos:

| Tipo | Qué recibirías en producción | Preview en demo |
|------|------------------------------|-----------------|
| **Newsletter diario LAC** | Un hallazgo verificado por correo cada mañana | `/newsletter` → última edición fixture |
| **Alertas por indicador** | Aviso cuando se actualiza un indicador o dataset que te interesa | `/indicadores` con filtros de país/tema |

En el demo, el formulario guarda email + tipo (+ países/temas opcionales para alertas) en `data/newsletter/subscribers.tsv` vía `POST /api/subscribe`. **No se envía correo real** ni confirmación SMTP (roadmap).

Temas válidos para alertas: macro, fiscal, social, food_security, governance.

---

## Selector de país (`/`)

- Enlaces a las cinco portadas LAC (`/guatemala`, `/honduras`, …).
- Lista de indicadores recientemente actualizados con enlace al hub o al artículo.
- Deep link legacy: `/?alert={id}` redirige al artículo canónico si existe `_path`.

---

## Portada por país (`/{país}`)

Layout de periódico (template `frontpage.pug`):

- **Reportaje destacado** — pieza de profundidad en hero (si hay reportaje para ese país).
- **Titulares** — noticias intercaladas con reportajes (`interleaveHeadlines()`); enlace al artículo.
- **Indicadores actualizados** — barra horizontal con chips (valor + magnitud + sparkline); enlace a la noticia.
- **Masthead** — etiqueta de edición (mes · año) y antigüedad de datos.

Orden por **fecha del dato** (`time_period`), no por fecha de detección.

Cada titular o chip muestra código de indicador (IDNO), fecha del dato (badge stale si aplica), tipo de detección y narrativa según idioma activo.

Selector de país en popup (`country-menu.js`) para saltar entre portadas LAC.

### Vista legacy (grid de tarjetas con filtros)

Disponible en `/dev/feed` o añadiendo `?legacy=1` a una portada de país. Renderiza el feed SSR clásico (`dashboard.pug`) con filtros cliente:

| Filtro | Opciones |
|--------|----------|
| **País** | ALL o un ISO3 del feed |
| **Categoría** | ALL o categoría temática |
| **Tipo de contenido** | ALL · Noticia · Reportaje |
| **Variante de tarjeta** | Narrative · Number · Newspaper |

Los filtros ocultan tarjetas con CSS; el contador de eventos se actualiza al instante. Estado en URL (`?country=ARG&category=economy&variant=narr`).

---

## Artículo (`/{país}/{tipo}/{año}/{mes}/{slug}`)

Página de lectura con:

- Titular, lead, story completa con tokens PCN resueltos
- Sparkline histórico, valor, periodo, magnitud
- Trazabilidad: enlace Data360, CSV, metodología
- Disclaimer de uso editorial y metadatos de producción
- CTA de suscripción al newsletter en el pie

### Chat por pieza (primario)

Cada artículo incluye un **FAB de chat acotado** (`floating-chat.pug` + `alert-chat.js`). La conversación se guarda en `sessionStorage` por `alert_id` y, al recargar, se restauran markdown, trace de tools, sparklines en caché y pasos de actividad.

El agente usa `lib/prompts/chat-scoped-system.md` y recibe:

1. **Pieza publicada** — titular, lead, story y `claim_id`s del JSON.
2. **Contexto de generación** — markdown omnibus de `data/analyses/{IDNO}.md` (fallback `*.llm-call.md`). En reportajes se concatenan los `.md` de cada indicador del dataset.

Límite: `CHAT_GENERATION_CONTEXT_MAX_CHARS` (default 48000).

---

## Indicadores globales (`/indicadores`)

Hub con indicadores agrupados por tier (annual, forecast, dynamic), conteo de alertas por IDNO, indicadores recientes y filtros URL (`?countries=ARG,MEX&topics=macro`).

Detalle por indicador: `/indicador/{IDNO}` — metadata, alertas por país, enlaces a artículos.

---

## Newsletter (`/newsletter`, `/newsletter/lac/{fecha}`)

- `/newsletter` redirige a la edición LAC más reciente en `data/newsletter/editions/`.
- Cada edición fixture incluye hero, titulares secundarios, subject/preheader bilingüe y CTA a portada o artículo.
- Enlace desde el modal de suscripción y desde el pie de artículos.

---

## Chat analítico global (`/chat`)

### Flujo general

1. Elegí un **preset** o escribí una pregunta.
2. Opcional: ajustá **País foco** (dropdown).
3. El agente llama **tools** del pipeline (SSE en vivo).
4. La respuesta incluye markdown, sparklines, tarjetas de alerta y trazabilidad de fuentes.

### Presets integrados

| Preset | Acción típica |
|--------|----------------|
| **Actualizados Data360** | Catálogo freshness + cómo pedir gráfica/análisis |
| **Analizar indicador** | Pipeline sobre un IDNO (ej. FAO_CP_23012) |
| **Titulares recientes** | Leer titulares en disco |
| **Alertas del monitor** | Listar alertas por fecha del dato |
| **Comparar países (MCP)** | Deuda pública % PIB en los 5 países |
| **Buscar indicador** | Búsqueda semántica Data360 |
| **Actualizar noticias** | Fetch titulares + resumen |

### País foco

Dropdown **Todos** o un país (GTM · Guatemala, etc.). En cada consulta se envía `focus_countries` al servidor; si cambiaste el foco, el agente recibe una nota explícita.

### Catálogo freshness

Botón **Datos recién publicados (N)** abre panel con indicadores cuyo CSV cambió (`data/changed-since.json`). Por fila: tier, IDNO, fecha blob, botones **Gráfica** y **Análisis**.

### Exportar conversación

Copiar markdown, descargar `.md`, imprimir PDF (`chat-export.js`).

### Reglas del agente (resumen)

- **No inventa cifras**; debe llamar tools Data360 antes de afirmar números.
- **Titulares**: debe llamar `fetch_news` / `read_news`.
- **Análisis**: primero `list_alerts`; solo `run_analysis` si no hay alertas en disco.
- **Gráficas**: `mcp_get_data` + bloque sparkline.
- Enlaces al monitor: deep link al artículo canónico o `/?alert=ID`.

---

## About (`/about`)

Página estática con: qué es el producto, alcance LAC, metodología de detección, verificación PCN, limitaciones del demo, roadmap (NiFi, OpenSearch, Strategy 2), equipo Abrimos.info y licencia GPLv3.

---

## Anatomía de una alerta

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador único |
| `content_type` | `noticia` o `reportaje` |
| `title` / `lead` / `story` | Texto bilingüe `{ es, en }` |
| `countries` | ISO3 (lista) |
| `dataset_id` | Identificador del dataset Data360 |
| `indicator` | (Solo **Noticia**) IDNO, `database_id`, `name` bilingüe |
| `indicators` | (Solo **Reportaje**) lista de IDNO cubiertos (≥2) |
| `noticia_ids` | (Solo **Reportaje**) ids de las Noticias sintetizadas |
| `observation` | valor, `time_period`, unit |
| `claim_tokens` | Valores verificables con `claim_id` |
| `verification_trace` | URLs Data360: dataset + CSV(s) + metodología |
| `chart_series` | Puntos `{period, value}` para sparkline |
| `score` | Severidad normalizada (0–1) |
| `detected_at` | Timestamp ISO de generación |
| `data_period_stale` | Si el dato es anterior al umbral de frescura |

Esquema formal: `docs/alert-schema.json`.

URLs canónicas: `/{countrySlug}/{noticia|reportaje}/{year}/{month}/{slug}` (`lib/url-slug.js`).

---

## Verificación antes de publicar

1. Abrí el artículo o el panel de detalle (vista legacy).
2. Revisá la narrativa y los **claim tokens** resueltos.
3. Seguí **Sources**: dataset Data360 → CSV → metodología.
4. Contrastá `time_period` con lo que publicás (fecha del **dato**, no del pipeline).
5. Usá **Copiar cita** para pegar texto + URL en el CMS.

Más contexto: `docs/data360-integration-methodology.md`.

---

## Fuentes de datos

| Fuente | Uso en el demo |
|--------|----------------|
| **Data360 API v3** (REST + MCP opcional) | Indicadores, series, comparaciones |
| **CSVs locales** `data/context/` | Detección y narrativa offline |
| **GDELT DOC API v2** / **Gemini** | Titulares prensa (script dependiente) |
| **Freshness probe** | `data/changed-since.json`, `data/index.json` |

---

## Pipeline (operadores / desarrollo)

```bash
npm run fetch                    # descarga CSV + data dictionary + meta.json
npm run fetch:probe              # solo sonda de cambios (~2 s)
npm run fetch:news               # titulares (Gemini por defecto)
npm run fetch:news:dynamic       # titulares contra watchlist dinámico
npm run analyze                  # detección + Noticias + Reportajes → data/alerts.json
npm run analyze:dynamic          # analyze solo indicadores changed-since
npm run analyze:noticias         # solo Fase 1
npm run analyze:reportajes       # solo Fase 2
npm run analyze:no-llm           # pipeline sin LLM
npm run discover                 # modo dinámico: /searchv2 → dynamic-watchlist.json
npm run pipeline:dynamic         # discover → fetch → analyze
npm run pipeline:dynamic:force   # igual, bypass ETag en fetch
npm run pipeline:dynamic:news-gdelt  # fetch GDELT contra watchlist dinámico
npm run dev                      # servidor web :8090 (desarrollo)
npm run start                    # producción
npm test                         # tests Node
```

Flujo estático: `fetch` → `fetch:news` (opcional) → `analyze`.  
Flujo dinámico: `pipeline:dynamic`.

Salida principal: **`data/alerts.json`**.

Variables: pipeline en `.env.example` (`AI_PROVIDER`, `AI_MODEL`, `AI_PROVIDER=nvidia`); chat en `CHAT_AI_PROVIDER`, `CHAT_MAX_TURNS`.

---

## API HTTP (demo)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Selector de país (HTML) |
| GET | `/{país}` | Portada por país (HTML) |
| GET | `/{país}/{tipo}/{y}/{m}/{slug}` | Artículo (HTML) |
| GET | `/indicadores`, `/indicators` | Hub indicadores (HTML) |
| GET | `/indicador/{IDNO}` | Detalle indicador (HTML) |
| GET | `/chat` | Chat global (HTML) |
| GET | `/about` | About (HTML) |
| GET | `/metodologia`, `/privacidad`, `/terminos`, `/uso` | Páginas estáticas (HTML) |
| GET | `/newsletter` | Redirect a última edición LAC |
| GET | `/newsletter/lac/{date}` | Edición newsletter (HTML) |
| GET | `/alertas/{país}/ejemplo` | Preview suscripción alertas |
| GET | `/dev/feed` | Feed legacy con filtros (HTML) |
| GET | `/api/alerts` | JSON `{ alerts: [...] }` |
| POST | `/api/subscribe` | JSON `{ email, subscription_type, countries?, topics?, lang? }` |
| POST | `/api/chat` | SSE agente |
| GET | `/static/*` | Assets estáticos |

---

## Tools del agente (chat)

| Tool | Función |
|------|---------|
| `list_alerts` | Alertas locales filtradas |
| `run_analysis` | Pipeline por IDNO; cache salvo `force: true` |
| `read_news` / `fetch_news` | Titulares en disco / actualizar |
| `read_freshness` | Catálogo indicadores actualizados |
| `mcp_search_indicators` | Búsqueda Data360 |
| `mcp_get_data` | Serie por indicador y país |
| `mcp_compare_countries` | Comparación LAC |
| `mcp_rank_countries` | Ranking países |
| `mcp_summarize_data` | Resumen estadístico |

Definiciones: `lib/chat/tools.js`.

---

## Cuándo usar cada vista

| Necesidad | Portada | Artículo + chat | Chat global |
|-----------|---------|-----------------|-------------|
| Browse rápido por país | ✓ | | |
| Lectura editorial completa | | ✓ | |
| Verificación PCN | ✓ (legacy panel) | ✓ | parcial |
| Pregunta sobre una pieza publicada | | ✓ | |
| Explorar 12k indicadores | | | ✓ |
| Gráfica sin alerta previa | | | ✓ |
| Re-análisis bajo demanda | | ✓ | ✓ |
| Exportar sesión | | ✓ | ✓ |

---

## Limitaciones conocidas (demo)

- Sin orquestación NiFi ni OpenSearch en runtime.
- Chat depende de LLM configurado; puede alucinar si no usa tools.
- Cobertura GDELT desigual (HND/GTM más débil).
- Suscripción guarda email en TSV local; **sin envío ni desuscripción automatizada por correo**.
- Strategy 2 (divergencia titular-dato): diseñada, no activa en detección.
- `run_analysis` puede tardar minutos y tiene costo LLM.

Roadmap: `docs/architecture-overview.md`, `docs/sustainability-plan.md`.

---

## Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| [features-reference.md](./features-reference.md) | Referencia técnica exhaustiva |
| [architecture-overview.md](./architecture-overview.md) | Arquitectura demo vs producción |
| [frontend-architecture.md](./frontend-architecture.md) | Pug, JS, rutas |
| [data-fetcher-architecture.md](./data-fetcher-architecture.md) | Freshness probe y fetch |
| [data360-integration-methodology.md](./data360-integration-methodology.md) | Integración API Data360 |
| [news-architecture.md](./news-architecture.md) | Subsistema de titulares |
| [security-data-handling.md](./security-data-handling.md) | Manejo de datos |
| [CLAUDE.md](../CLAUDE.md) | Decisiones internas del repo |

---

## Contacto y licencia

**Abrimos.info** — [abrimos.info](https://abrimos.info)  
Repositorio: [abrimos-info/abrimos-data360-monitor](https://github.com/abrimos-info/abrimos-data360-monitor)  
Licencia: **GPLv3**
