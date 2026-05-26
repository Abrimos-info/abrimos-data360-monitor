# Referencia de funcionalidades — Data360 News Agent

> Catálogo técnico de capacidades implementadas en el demo (2026-05-22).  
> Producto: **Data360 News Agent** — agencia de noticias con IA sobre indicadores Data360.  
> Guía orientada a redacciones: [user-guide.md](./user-guide.md).

---

## 1. Servidor web

**Entrada**: `data360-monitor.js`  
**Puerto**: 8090 (por defecto)  
**Stack**: Node.js, Pug, vanilla JS, sin bundler.

| Ruta | Vista | Módulo |
|------|-------|--------|
| `/` | Country picker / home | `lib/views.js` → `dashboardPage` |
| `/chat` | Chat | `lib/views.js` → `chatPage` |
| `/about` | About | `lib/views.js` → `aboutPage` |
| `/api/chat` | SSE agente | `lib/chat/api.js` |
| `/api/alerts` | JSON alertas | `lib/alerts-api.js` |
| `/static/*` | Assets | `lib/router.js` |

Configuración de rutas: `config/routes.json`.  
i18n: `config/strings.es.json`, `config/strings.en.json`, `lib/i18n.js`.

Hot reload en desarrollo: invalidación de templates, strings y `alerts.json` vía `chokidar` (ver `data360-monitor.js`).

---

## 2. Portada — funcionalidades UI

### 2.1 Feed SSR

- Renderiza **todas** las alertas en HTML al cargar (`templates/dashboard.pug`).
- Orden server-side por fecha del dato (`lib/alert-display.js` → `sortAlertsByDataDate`).
- Datos inyectados: `window.D360_ALERTS`, `window.D360_FILTERS`.

### 2.2 Filtros cliente

Implementación: `static/js/behavior.js`

- País (`#d360-filter-country`)
- Categoría (`#d360-filter-category`)
- Tipo de contenido (`#d360-filter-content-type`) → Noticia / Reportaje / Todos
- Variante (`#d360-filter-variant`) → recarga con query `?variant=narr|num|news`
- Contador visible (`#d360-event-count`)
- Estado vacío filtrado (`#d360-empty-filtered`)
- Sync URL con `history.replaceState`

### 2.3 Variantes de tarjeta

Dos **tipos de contenido** (filtrables vía `content_type`):

| Tipo | Origen | Mixin | Layout |
|------|--------|-------|--------|
| **Noticia** | Fase 1 — una por indicador/país a partir de un candidato de detección | `+cardNewspaper` | tarjeta estándar |
| **Reportaje** | Fase 2 — uno por `dataset_id` cuando ≥2 Noticias lo comparten | `+cardReportaje` | `grid-column: span 2` |

Badge de tipo: mixin `+contentTypeBadge` (`templates/mixins.pug`).

Variantes visuales históricas (compatibilidad):

| Variante | Clase CSS | Contenido principal |
|----------|-----------|---------------------|
| narr | `d360-card--narr` | `narrative_citizen` |
| num | `d360-card--num` | Valor grande + metadatos |
| news | `d360-card--news` | Titular + lede periodística |

Mixins: `templates/mixins.pug`, `templates/cards.pug`.

### 2.4 Panel de detalle

Implementación: `static/js/detail-panel.js`, template en `templates/partials/detail-panel.pug`.

Bindings: país, categoría, type chip, título, IDNO, valor, periodo, magnitud, sparkline, narrativas citizen/journalist, verification trace, meta (score, detected_at), copiar cita.

Deep link: `?alert={id}` abre panel al cargar.

PCN: `renderNarrativeText()` resuelve `{{claim:id|fallback}}` contra `claim_tokens`.

### 2.5 Sparklines

- Server: mixin `+chart` en Pug (SVG inline).
- Cliente: `static/js/charts.js` → `renderChartSvg(series)`.
- Usado en panel detalle y chat (markdown sparkline blocks).

### 2.6 Sincronización post-chat

`static/js/alerts-feed.js`:

- `upsertAlertsInFeed(alerts, lang)` — merge en `D360_ALERTS` + insertar tarjetas nuevas en `.d360-feed`.
- `refreshAlertsFromServer()` — `GET /api/alerts`.
- `bindRefreshOnFocus()` — refresh al foco + `BroadcastChannel('d360-alerts')`.
- Cargado en dashboard vía `templates/dashboard.pug`.

---

## 3. Chat — funcionalidades UI

### 3.1 Agente SSE

- Cliente: `static/js/chat.js`
- Servidor: `lib/chat/agent.js`, `lib/chat/api.js`
- Eventos SSE: `llm_start`, `llm_end`, `tool_start`, `tool_result`, `token`, `done`, `error`
- Historial enviado completo al servidor; `compactHistoryForLlm` recorta a **16** mensajes (+ system) antes de cada llamada LLM
- Max turns: `CHAT_MAX_TURNS` (default 8)

### 3.2 Presets

Config: `config/chat-presets.json` + preset dinámico freshness (`lib/chat/freshness-preset.js`).

### 3.3 País foco

- UI: `#d360-focus-country` (ALL + 5 ISO3 con nombre humano).
- Cliente: `getFocusCountries()`, `appendFocusToQuery()`, `lastSentFocusKey`.
- Servidor: `lib/chat/focus-countries.js` → inyecta sección en system prompt; flag `focus_changed`.

### 3.4 Freshness panel

- Template: `templates/partials/chat-freshness.pug`
- Datos: `data/changed-since.json`, `data/index.json`
- Acciones: gráfica / análisis por fila → prompt al chat

### 3.5 Markdown y sparklines

- `static/js/markdown.js` — `marked` vía `static/vendor/marked.min.js`, post-proceso sparklines, strip imágenes fake, auto-inject desde cache MCP.
- Cache series: `window.D360_SPARKLINE_CACHE`

### 3.6 Píldoras de indicador

- `static/js/indicator-pills.js`
- Registro desde catálogo freshness + tool results
- Layout: nombre humano + pill `IDNO · Data360`

### 3.7 Tarjetas en respuestas

- `static/js/chat-cards.js` → `renderAlertCards`
- Enriquecimiento desde `D360_ALERTS` por `alert.id`
- Integración panel detalle: `D360DetailPanel.bindCard`, `mergeAlerts`

### 3.8 Debug / actividad

- Pasos `<details>` colapsados por defecto
- Grid: modelo, provider, tokens, duración, TPS
- Bloques request/response JSON

### 3.9 Exportación

- `static/js/chat-export.js`
- `buildConversationMarkdown()`, copy, download `.md`, print PDF
- Toolbar: `#d360-export-copy`, `#d360-export-md`, `#d360-export-pdf`

### 3.10 Anti-patrones mitigados

| Problema | Mitigación |
|----------|------------|
| Context overflow LLM | `trimToolResultForLlm`, `compactHistoryForLlm` |
| JSON tools fake en markdown | `stripFakeToolBlocks`, retry agente, `tool_choice: required` (news) |
| Sparkline omitido | auto-inject desde `mcp_get_data` |
| Re-run análisis innecesario | cache en `run_analysis` si alertas existen |

---

## 4. Tools del agente (servidor)

Implementación: `lib/chat/tools.js`, formato SSE: `lib/chat/tool-format.js`.

### 4.1 list_alerts

- Fuente: `lib/alerts-store.js`
- Filtros: `country`, `idno`, `category`, `limit`
- Devuelve: `alerts` (resumen LLM), `alerts_cards` (objetos completos para UI)

### 4.2 run_analysis

- Delega: `lib/analysis/runner.js` → `analyzeIndicator(idno)`
- **Cache**: si hay alertas para `idno` (y opcional `country`), devuelve existentes (`cached: true`) sin LLM
- `force: true` fuerza re-ejecutar
- Post-run: `alertsStore.reload()`, escribe `data/alerts/{idno}.json`, merge en `data/alerts.json`

### 4.3 read_news / fetch_news

- Fetch: `lib/news-fetch.js` (solo GDELT; Google News RSS previsto en D-030, no implementado)
- Read: `lib/news.js` → `data/news/{COUNTRY}/{YYYY-MM}.jsonl`
- Países default: `DEFAULT_COUNTRIES` (5 LAC)

### 4.4 read_freshness

- `lib/chat/freshness-preset.js` → `loadFreshnessReport`, `summarizeForTool`
- Formato línea: `@IDNO|database|tier|label|blob-date`

### 4.5 MCP Data360 (+ REST fallback)

| Tool MCP | Fallback REST |
|----------|---------------|
| `mcp_search_indicators` | `data360-client.search` |
| `mcp_get_data` | `getData` + `buildChartSeriesFromGetData` |
| `mcp_compare_countries` | compare vía REST |
| `mcp_rank_countries` | idem |
| `mcp_summarize_data` | summarize REST |

Cliente MCP: `lib/mcp-client.js`. Normalización args: `normalizeMcpArgs` (country_codes comma-separated).

---

## 5. Pipeline de análisis

### 5.1 Etapas npm

```
(discover) → fetch → fetch:news (opcional) → analyze
```

Scripts CLI:

| Script npm | Binario | Rol |
|------------|---------|-----|
| `discover` | `bin/discover-indicators.js` | Modo dinámico: `/searchv2` → `data/dynamic-watchlist.json` |
| `fetch` / `fetch:probe` | `bin/fetch-data.js` | Freshness probe + descarga CSV + DATADICT + meta.json |
| `fetch:news` | `bin/fetch-news.js` | Titulares GDELT → JSONL |
| `analyze` | `bin/generate-analysis.js` | Orquesta `lib/analysis/runner.js` (detect + Noticias + Reportajes) |
| `pipeline:dynamic` | (script) | `discover` → `fetch` → `analyze` con watchlist dinámico |
| `pipeline:dynamic:force` | (script) | Igual, pero pasa `--force` al `fetch` (bypass ETag) |

Detección y narrativa viven en `lib/analysis/runner.js` (Fase 1, Noticias) y `lib/analysis/reportaje-runner.js` (Fase 2, Reportajes). No hay bins separados `detect-changes`, `narrate-indicators` ni `emit-alerts`.

### 5.2 Detección

| Estrategia | Módulo |
|------------|--------|
| 1 — Cambio abrupto | `lib/detect/z-score.js` |
| 4 — Cross-indicator | `lib/detect/cross-indicator.js` |

Filtros: `OBS_STATUS = A`, disagg `_Z`/`_T` excluidas, valores `Decimal`.

### 5.3 Narrativa LLM (dos fases)

**Fase 1 — Noticia** (`lib/analysis/runner.js`)
- Un call por indicador/país a partir de candidatos de detección.
- Prompts: `lib/prompts/noticia-{system,task,template}.md`.
- Salida: historia bilingüe completa (250–600 palabras `story.es` + `story.en`).
- Bloque fenced ` ```noticia ` con JSON.

**Fase 2 — Reportaje** (`lib/analysis/reportaje-runner.js`)
- Disparada al final del análisis, solo cuando ≥2 Noticias comparten `dataset_id`.
- Un call por dataset; sintetiza una visión regional + secciones por país.
- Reutiliza los `claim_id` de las Noticias que sintetiza.
- Salida: historia bilingüe larga (500–1200 palabras), bloque ` ```reportaje `.
- Prompts: `lib/prompts/reportaje-{system,task}.md`.

**Común a ambas fases**
- Parser: `lib/analysis/alert-extractor.js` → `extractJsonObject`, escáner brace-balanceado con conciencia de strings. Tolera triple-backticks dentro de valores string y respuestas truncadas sin fence de cierre.
- Validación: `lib/analysis/quality-validator.js`. Códigos:
  - **Q1** — traceability: `claim_id` presente en contexto numerado del indicador.
  - **Q2** — JSON schema (Ajv).
  - **Q4** — campos bilingües presentes + longitud `story` 250–4000 chars.
  - (no hay Q3 en esta versión.)
- En fallo Q1 los logs incluyen el `notes` (ej. `Q1 (claim_id xyz not in context)`).
- Si el LLM emite el fence-opener pero `extractJsonObject` devuelve 0 ítems, la respuesta cruda se persiste en `data/alerts/{idno}.raw.txt` (o `reportaje_{dataset}.raw.txt`).
- PCN: `lib/pcn-claims.js`.

### 5.4 Contexto omnibus

- `lib/analysis/context-builder.js` — CSVs, metadata `.md`, **data dictionary** `{IDNO}_DATADICT.csv` (capado a 80 líneas, 20 para modelos pequeños), titulares §6 GDELT (max ~8 headlines).
- Última sección de candidatos cierra con `### allowed_claim_ids`, lista literal de los únicos `claim_id` aceptables (defensa contra alucinación en modelos pequeños). Para Reportaje: misma lógica en §7 (`lib/analysis/reportaje-runner.js`).
- Prompts del sistema (`noticia-system.md`, `reportaje-system.md`) prohíben triple-backticks dentro de valores string (defense in depth con el extractor).
- Salida análisis: `data/analyses/{IDNO}.md`, `data/analyses/{IDNO}.llm-call.md`.

### 5.5 Emisión

- Noticia por indicador: `data/alerts/{IDNO}.json`.
- Reportaje por dataset: `data/alerts/reportaje_{dataset}.json`.
- Agregado: `data/alerts.json` (Noticias + Reportajes, consumido por UI).
- Enriquecimiento: `lib/alert-display.js` → `enrichAlert`, period narratives, stale flag.
- `lib/alerts-store.js` `normalizeItem` usa `ev.lead?.[langKey]` directamente (no hardcodea `_lead`/`_title` a español).

---

## 6. Datos y archivos

| Path | Contenido |
|------|-----------|
| `data/alerts.json` | Feed unificado (Noticias + Reportajes) |
| `data/alerts/{IDNO}.json` | Noticia por indicador |
| `data/alerts/reportaje_{dataset}.json` | Reportaje por dataset (≥2 Noticias) |
| `data/alerts/{IDNO}.raw.txt` | Respuesta cruda del LLM cuando el extractor devolvió 0 ítems (diagnóstico) |
| `data/analyses/{IDNO}.md` | Contexto + narrativa |
| `data/context/{COUNTRY}/{tier}.csv` | Series por tier. **Análisis/PCN**: `annual`, `forecast`, `dynamic` (`CONTEXT_TIERS`). `pulse` = legacy fetch, excluido del pipeline |
| `data/indicators/{IDNO}.md` | Metadata indicador |
| `data/snapshots/{IDNO}.csv` | CSV crudo del blob host |
| `data/snapshots/{IDNO}_DATADICT.csv` | Data dictionary del indicador |
| `data/snapshots/{IDNO}.meta.json` | Metadata JSON (fallback si no hay entrada en `lib/watchlist.js`) |
| `data/news/{COUNTRY}/{YYYY-MM}.jsonl` | Titulares GDELT |
| `data/changed-since.json` | Resultado freshness probe |
| `data/index.json` | Índice indicadores watchlist |
| `data/dynamic-watchlist.json` | Lista descubierta dinámicamente (modo dinámico) |
| `lib/watchlist.js` | Watchlist canónico estático (~35 indicadores × tiers) |
| `lib/dynamic-watchlist.js` | Discovery + expansión dataset→indicadores |
| `connector/watchlist.json` | Probe preliminar (20 candidatos; referencia histórica) |

---

## 7. AI / LLM

**Cliente**: `lib/ai-client.js`

Proveedores vía env:

- **Chat** (`CHAT_AI_PROVIDER`, default `vllm`): `claude-code`, `vllm` (LAIA), OpenRouter vía `AI_API_URL`
- **Pipeline análisis** (`AI_PROVIDER` / `AI_MODEL` en `.env.example`, default `claude-code` + Opus 4.7, D-017)
- Tracking coste: prefijos `[AI-COST]`, `[AI-COST-NARRATE]`

Chat: streaming + tool calls (requiere LLM con soporte de tools).

---

## 8. Tests

`npm test` → `node --test test/*.test.js`

Cobertura relevante:

- `test/chat.test.js` — tools, markdown, sparklines, export, focus countries, run_analysis cache
- `test/server.test.js` — rutas, strings
- Otros módulos detect/fetch según existan

---

## 9. Decisiones de producto (resumen)

| ID | Decisión |
|----|----------|
| D-003 | 5 países LAC demo |
| D-007 | Replay histórico, no real-time |
| D-008 | Dashboard estático lee `alerts.json` |
| D-010 | Estrategias 1 y 4 |
| D-021 | Tiers fetch: pulse / annual / forecast (+ `dynamic` con discovery). Análisis y PCN: `CONTEXT_TIERS` = annual + forecast + dynamic (sin pulse) |
| D-035 | Enlaces indicador → `/en/indicator/{IDNO}` (`lib/data360-urls.js`, `static/js/data360-urls.js`) |
| D-028 | Análisis: prompts + validación claim traceability (Q1/Q2/Q4) |
| D-029–D-030 | News = titulares reales GDELT; pulse ≠ news |
| D-017 | LLM narrativa vía Claude Opus / Agent SDK |
| D-031–D-034 | Modo dinámico (discovery por searchv2), Noticia/Reportaje, DATADICT en contexto, extractor robusto. Ver `CLAUDE.md`. |

Lista completa: `CLAUDE.md`.

---

## 10. Funcionalidades explícitamente fuera del demo

- Apache NiFi / OpenSearch runtime
- Strategy 2 (divergencia titular-dato) en detección
- Newsletter backend
- Tiempo real continuo
- Cobertura fuera de los 5 países / watchlist
- Modo bilingüe simultáneo en UI (removido)
