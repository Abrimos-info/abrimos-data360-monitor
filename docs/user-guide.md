# Guía de usuario — Data360 News Agent

> **Audiencia**: redacciones de América Latina y el Caribe.  
> **Estado**: borrador funcional al 2026-05-22 (demo fase 2, entrega 2026-05-31).

## Qué hace esta herramienta

**Data360 News Agent** es una agencia de noticias basada en inteligencia artificial que vigila indicadores económicos, sociales y de gobernanza en **Guatemala, Honduras, Argentina, Ecuador y México**. Cuando detecta un hecho estadísticamente notable, publica dos tipos de contenido verificado:

- **Noticia**. Pieza bilingüe (250–600 palabras) por indicador y país, disparada por un candidato de detección.
- **Reportaje**. Pieza bilingüe larga (500–1200 palabras) por *dataset*, generada solo cuando dos o más Noticias comparten el mismo `dataset_id`. Sintetiza una mirada regional con secciones por país y reutiliza los `claim_id` de las Noticias que sintetiza.

Cada pieza queda enlazada a su fuente en [data360.worldbank.org](https://data360.worldbank.org).

El producto tiene dos caras:

| Vista | URL | Para qué sirve |
|-------|-----|----------------|
| **Portada** | `/` (por país) | Portada de periódico: reportajes destacados, titulares e indicadores actualizados |
| **Chat por pieza** | en cada noticia/reportaje | Profundizar en datos y fuentes de esa pieza |

Ambas leen el mismo archivo de alertas (`data/alerts.json`) y comparten la vista de artículo y las tarjetas de pieza.

---

## Alcance del demo

- **Países**: GTM, HND, ARG, ECU, MEX (no sustituir por BRA, CHL, COL, etc.).
- **Indicadores**: dos modos de selección.
  - **Watchlist estático**: ~35 indicadores en tres tiers de fetch (pulse, annual, forecast). Lista canónica en `lib/watchlist.js`. El tier `pulse` ya no entra en detección ni verificación PCN.
  - **Modo dinámico** (recomendado): indicadores descubiertos en vivo desde `/data360/searchv2`, expandidos vía `/data360/indicators?datasetId=…`, persistidos en `data/dynamic-watchlist.json` y escritos en `data/context/{PAÍS}/dynamic.csv`. Es la fuente que usa el pipeline por defecto (`NOTICIA_TIERS = ['dynamic']`).
- **Detección**: estrategias **1** (cambios abruptos, z-score) y **4** (anomalías cross-indicador).
- **Modo**: replay histórico sobre snapshots CSV, no tiempo real continuo (D-007).
- **Titulares**: GDELT en español, almacenados en `data/news/{PAÍS}/{YYYY-MM}.jsonl` (contexto pasivo para narrativas; divergencia narrativa-dato queda en roadmap).

---

## Interfaz web

### Navegación

Barra superior con tres secciones:

- **Portada** — agencia por país: reportajes, titulares e indicadores
- **About** — metodología, límites, equipo, licencia

Botón **Suscribirse** (placeholder visual, sin backend en el demo).

### Idiomas

Selector **ES / EN** en la barra. Cambia la interfaz y el idioma de las narrativas mostradas. Las piezas guardan texto en ambos idiomas en el JSON; la UI muestra **un idioma a la vez** (no hay modo bilingüe simultáneo en pantalla).

Parámetros URL: `?lang=es` o `?lang=en`.

### Onboarding

Modal de bienvenida en la primera visita (dismissible). Presenta **Data360 News Agent** como agencia de noticias con IA: detecta hechos noticiosos en los 12.000 indicadores de Data360 y los entrega verificados con perspectiva local a newsrooms LAC.

---

## Portada (`/{país}`)

### Layout de periódico

La portada por país muestra:

- **Reportaje destacado** — pieza de profundidad en hero
- **Titulares** — listado de noticias (enlace al artículo)
- **Indicadores actualizados** — barra horizontal con chips (valor + magnitud; enlace a la misma noticia)

Orden por **fecha del dato** (`time_period`), no por fecha de detección.

Cada titular o chip muestra:

- País (ISO3)
- Código de indicador (IDNO)
- **Fecha del dato** (badge; marcada si el periodo es stale)
- Tipo: **cambio abrupto** o **anomalía**
- Narrativa ciudadana (según variante)
- Valor observado, nombre del indicador y magnitud

### Filtros (sin recarga de página)

| Filtro | Opciones |
|--------|----------|
| **País** | ALL o un ISO3 del feed |
| **Categoría** | ALL o categoría temática (economy, social, etc.) |
| **Tipo de contenido** | ALL · Noticia · Reportaje |
| **Variante de tarjeta** | Narrative · Number · Newspaper |

Los filtros ocultan tarjetas con CSS (`.d360-card--hidden`); el contador de eventos se actualiza al instante. El estado se refleja en la URL (`?country=ARG&category=economy&variant=narr`).

### Tipos de tarjeta

- **Noticia** (per indicador). Tarjeta estándar tipo newspaper con titular, bajada, valor observado y trazabilidad.
- **Reportaje** (per dataset). Tarjeta más ancha (`grid-column: span 2`) que destaca visualmente la síntesis regional sobre el mismo dataset.

Ambos comparten el panel de detalle, los enlaces de fuente y la verificación PCN. Las variantes históricas Narrative · Number · Newspaper siguen disponibles vía el filtro `?variant=…`.

### Panel de detalle

Clic en una tarjeta (o `/?alert=ID`) abre un panel lateral con:

- Narrativa **ciudadana** y **periodista**
- Sparkline histórico (SVG)
- Valor, periodo, magnitud, score de detección
- **Trazabilidad**: enlace al dataset Data360, CSV descargable, metodología, licencia
- Botón **Copiar cita** (texto + URL fuente)
- Resolución de tokens PCN `{{claim:…}}` en las narrativas

### Última actualización

Encabezado con timestamp de la detección más reciente en el feed.

### Sincronización con el chat

Si el chat genera alertas nuevas (`run_analysis`), el monitor las incorpora al volver el foco a la pestaña o al refrescar, vía `GET /api/alerts` y `alerts-feed.js` (sin duplicar tarjetas existentes).

---

## Chat analítico (`/chat`)

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
| **Titulares recientes** | Leer GDELT en disco |
| **Alertas del monitor** | Listar alertas por fecha del dato |
| **Comparar países (MCP)** | Deuda pública % PIB en los 5 países |
| **Buscar indicador** | Búsqueda semántica Data360 |
| **Actualizar noticias** | Fetch GDELT + resumen |

### País foco

Dropdown **Todos** o un país (GTM · Guatemala, etc.). En cada consulta:

- Se envía `focus_countries` al servidor.
- Si cambiaste el foco desde la última pregunta, el agente recibe una nota explícita.
- El sufijo `[Países foco: …]` se agrega al mensaje solo cuando el foco cambió.

### Catálogo freshness

Botón **Datos recién publicados (N)** abre un panel con indicadores cuyo CSV cambió en la última sonda (`data/changed-since.json`). Por fila:

- Tier (pulse / annual / forecast), IDNO, fecha blob
- Botones **Gráfica** y **Análisis** (inyectan prompt al chat)

### Respuesta del agente

- **Markdown** con prosa, listas y bloques de código.
- **Sparklines** SVG cuando pedís gráfica (`mcp_get_data` + bloque ` ```sparkline``` `).
- **Tarjetas de alerta** inline (mismo componente que el monitor).
- **Actividad** (pasos colapsados): llamadas LLM y tools con duración, tokens, request/response de debug.
- **Fuentes usadas**: cadena de tools y si consultó Data360.

### Píldoras de indicador

Los códigos IDNO en el texto se renderizan como:

**Nombre legible** `WB_… · Data360` (enlace a `https://data360.worldbank.org/en/indicator/{IDNO}` vía `lib/data360-urls.js`).

### Chat por pieza (página de artículo)

Cada noticia y reportaje incluye un chat acotado a esa pieza (`static/js/alert-chat.js`). La conversación se guarda en `sessionStorage` por `alert_id` y, al recargar, se restauran markdown, trace de tools, sparklines en caché y pasos de actividad colapsados (no solo el texto plano).

### Exportar conversación

Botones en el encabezado del chat:

| Acción | Formato |
|--------|---------|
| Copiar markdown | Portapapeles |
| Descargar .md | `data360-chat-YYYY-MM-DD.md` |
| Descargar PDF | Vista de impresión del navegador |

Cada turno exportado incluye pregunta, respuesta, trace de tools e indicadores consultados.

### Reglas del agente (resumen)

- **No inventa cifras** del Banco Mundial; debe llamar tools Data360 antes de afirmar números.
- **Titulares**: debe llamar `fetch_news` / `read_news`; no escribe JSON de tools ni titulares ficticios.
- **Análisis de indicador**: primero `list_alerts`; solo `run_analysis` si no hay alertas en disco.
- **Gráficas**: `mcp_get_data` + bloque sparkline; no placeholders de imagen.
- Enlaces al monitor: `[ver alerta](/?alert=ID)`.

---

## About (`/about`)

Página estática con: qué es el producto, alcance LAC, metodología de detección, verificación PCN, limitaciones del demo, roadmap (NiFi, OpenSearch, Strategy 2), equipo Abrimos.info y licencia GPLv3.

---

## Anatomía de una alerta

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador único (deep link `/?alert=`) |
| `content_type` | `noticia` o `reportaje` |
| `title` / `lead` / `story` | Texto bilingüe `{ es, en }` (la UI muestra un idioma a la vez) |
| `countries` | ISO3 (lista). En **Noticia** suele tener 1 país; en **Reportaje** puede incluir varios |
| `dataset_id` | Identificador del dataset Data360 (agrupa Noticias y Reportajes) |
| `indicator` | (Solo **Noticia**) IDNO, `database_id`, `name` bilingüe |
| `indicators` | (Solo **Reportaje**) lista de IDNO cubiertos (≥2) |
| `noticia_ids` | (Solo **Reportaje**) ids de las Noticias sintetizadas |
| `observation` | (Opcional) valor, `time_period`, unit (y displays localizados derivados) |
| `magnitude` | (Opcional) magnitud formateada (ej. delta o σ) |
| `claim_tokens` | Valores verificables con `claim_id` y displays localizados |
| `verification_trace` | URLs Data360: dataset + CSV(s) + referencia metodológica (según tipo) |
| `chart_series` | (Opcional) puntos `{period, value}` para sparkline |
| `score` | Severidad normalizada (0–1) |
| `detected_at` | Timestamp ISO de generación |
| `data_period_stale` | Si el dato es anterior al umbral de frescura (derivado del `time_period`) |

Esquema formal: `docs/alert-schema.json`.

---

## Verificación antes de publicar

1. Abrí la alerta en el **panel de detalle**.
2. Revisá la narrativa periodista y los **claim tokens** resueltos.
3. Seguí **Sources**: dataset Data360 → CSV → metodología.
4. Contrastá `time_period` con lo que publicás (fecha del **dato**, no del pipeline).
5. Usá **Copiar cita** para pegar texto + URL en el CMS.

Más contexto: metodología PCN del Banco Mundial y `docs/data360-integration-methodology.md`.

---

## Fuentes de datos

| Fuente | Uso en el demo |
|--------|----------------|
| **Data360 API v3** (REST + MCP opcional) | Indicadores, series, comparaciones |
| **CSVs locales** `data/context/` | Detección y narrativa offline |
| **GDELT DOC API v2** | Titulares prensa en español (única fuente implementada; RSS en roadmap) |
| **Freshness probe** | `data/changed-since.json`, `data/index.json` |

---

## Pipeline (operadores / desarrollo)

Replay histórico en Node.js (CommonJS):

```bash
npm run fetch                    # descarga CSV + data dictionary + meta.json (con probe previo)
npm run fetch:probe              # solo sonda de cambios (~2 s)
npm run fetch:news               # titulares GDELT → data/news/{PAÍS}/{YYYY-MM}.jsonl
npm run analyze                  # detección + Fase 1 Noticias + Fase 2 Reportajes → data/alerts.json
npm run analyze:no-llm           # mismo pipeline sin llamadas LLM (solo detección)
npm run discover                 # modo dinámico: /searchv2 → data/dynamic-watchlist.json
npm run pipeline:dynamic         # discover → fetch → analyze (modo dinámico)
npm run pipeline:dynamic:force   # igual, pero pasa --force al fetch (bypass ETag)
npm run dev                      # servidor web :8090 (desarrollo)
npm run start                    # producción
npm test                         # tests Node
```

Flujo típico estático: `fetch` → `fetch:news` (opcional) → `analyze`.
Flujo típico dinámico: `pipeline:dynamic` (o `pipeline:dynamic:force` cuando hace falta un refresh limpio).

El paso `analyze` delega en `lib/analysis/runner.js` para Noticias (una por indicador) y luego en `lib/analysis/reportaje-runner.js` para Reportajes (uno por dataset cuando ≥2 Noticias comparten `dataset_id`). Consolida `data/alerts/{IDNO}.json`, `data/alerts/reportaje_{dataset}.json` y `data/alerts.json`.

Salida principal: **`data/alerts.json`** consumido por la portada y el chat por pieza.

Variables de entorno: pipeline en `.env.example` (`AI_PROVIDER`, `AI_MODEL`); chat en `lib/ai-client.js` (`CHAT_AI_PROVIDER`, default `vllm`; `CHAT_MAX_TURNS`, default `8`).

---

## API HTTP (demo)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Selector de país (HTML) |
| GET | `/{país}` | Portada (HTML) |
| GET | `/chat` | Chat (HTML) |
| GET | `/about` | About (HTML) |
| GET | `/api/alerts` | JSON `{ alerts: [...] }` (recarga store) |
| POST | `/api/chat` | SSE agente (`messages`, `focus_countries`, `focus_changed`) |
| GET | `/static/*` | Assets estáticos |

---

## Tools del agente (chat)

| Tool | Función |
|------|---------|
| `list_alerts` | Alertas locales filtradas por país, idno, categoría |
| `run_analysis` | Pipeline detección+narrativa por IDNO; **reutiliza alertas existentes** salvo `force: true` |
| `read_news` | Titulares GDELT en disco |
| `fetch_news` | Actualizar titulares GDELT |
| `read_freshness` | Catálogo de indicadores con CSV actualizado |
| `mcp_search_indicators` | Búsqueda Data360 |
| `mcp_get_data` | Serie por indicador y país |
| `mcp_compare_countries` | Comparación LAC (fallback REST) |
| `mcp_rank_countries` | Ranking países |
| `mcp_summarize_data` | Resumen estadístico Data360 |

Definiciones: `lib/chat/tools.js`. Prompt del sistema: `lib/prompts/chat-system.md`.

---

## Portada vs chat por pieza — cuándo usar cada uno

| Necesidad | Portada | Chat por pieza |
|-----------|---------|------|
| Browse rápido de alertas | ✓ | |
| Verificación PCN completa | ✓ | parcial (tarjetas + enlace) |
| Filtros categoría / 3 variantes visuales | ✓ | |
| Pregunta libre / explorar 12k indicadores | | ✓ |
| Gráfica indicador sin alerta previa | | ✓ |
| Titulares GDELT | | ✓ |
| Re-análisis bajo demanda | | ✓ (`run_analysis`) |
| Exportar sesión de investigación | | ✓ |

---

## Limitaciones conocidas (demo)

- Sin orquestación NiFi ni OpenSearch en runtime.
- Chat depende de LLM configurado (`vllm`, Claude, etc.); puede alucinar si no usa tools.
- GDELT: cobertura desigual (HND/GTM más débil).
- Newsletter y suscripción: solo UI.
- Strategy 2 (divergencia titular-dato): diseñada, no activa en detección.
- `run_analysis` por indicador puede tardar minutos y tiene costo LLM.

Roadmap: `docs/architecture-overview.md`, `docs/sustainability-plan.md`.

---

## Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| [features-reference.md](./features-reference.md) | Referencia técnica exhaustiva de funcionalidades |
| [architecture-overview.md](./architecture-overview.md) | Arquitectura demo vs producción |
| [frontend-architecture.md](./frontend-architecture.md) | Pug, JS, filtros, panel detalle |
| [data-fetcher-architecture.md](./data-fetcher-architecture.md) | Freshness probe y fetch |
| [data360-integration-methodology.md](./data360-integration-methodology.md) | Integración API Data360 |
| [news-architecture.md](./news-architecture.md) | Subsistema GDELT |
| [security-data-handling.md](./security-data-handling.md) | Manejo de datos |
| [CLAUDE.md](../CLAUDE.md) | Decisiones internas del repo |

---

## Contacto y licencia

**Abrimos.info** — [abrimos.info](https://abrimos.info)  
Repositorio: [abrimos-info/abrimos-data360-monitor](https://github.com/abrimos-info/abrimos-data360-monitor)  
Licencia: **GPLv3**
