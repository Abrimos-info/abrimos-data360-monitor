# Referencia de funcionalidades — Data360 Monitor

> Catálogo técnico de capacidades implementadas en el demo (2026-05-22).  
> Guía orientada a redacciones: [user-guide.md](./user-guide.md).

---

## 1. Servidor web

**Entrada**: `data360-monitor.js`  
**Puerto**: 8090 (por defecto)  
**Stack**: Node.js, Pug, vanilla JS, sin bundler.

| Ruta | Vista | Módulo |
|------|-------|--------|
| `/` | Monitor | `lib/views.js` → `dashboardPage` |
| `/chat` | Chat | `lib/views.js` → `chatPage` |
| `/about` | About | `lib/views.js` → `aboutPage` |
| `/api/chat` | SSE agente | `lib/chat/api.js` |
| `/api/alerts` | JSON alertas | `lib/alerts-api.js` |
| `/static/*` | Assets | `lib/router.js` |

Configuración de rutas: `config/routes.json`.  
i18n: `config/strings.es.json`, `config/strings.en.json`, `lib/i18n.js`.

Hot reload en desarrollo: invalidación de templates, strings y `alerts.json` vía `chokidar` (ver `data360-monitor.js`).

---

## 2. Monitor — funcionalidades UI

### 2.1 Feed SSR

- Renderiza **todas** las alertas en HTML al cargar (`templates/dashboard.pug`).
- Orden server-side por fecha del dato (`lib/alert-display.js` → `sortAlertsByDataDate`).
- Datos inyectados: `window.D360_ALERTS`, `window.D360_FILTERS`.

### 2.2 Filtros cliente

Implementación: `static/js/behavior.js`

- País (`#d360-filter-country`)
- Categoría (`#d360-filter-category`)
- Variante (`#d360-filter-variant`) → recarga con query `?variant=narr|num|news`
- Contador visible (`#d360-event-count`)
- Estado vacío filtrado (`#d360-empty-filtered`)
- Sync URL con `history.replaceState`

### 2.3 Variantes de tarjeta

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
fetch → fetch:news (opcional) → analyze
```

Scripts CLI:

| Script npm | Binario | Rol |
|------------|---------|-----|
| `fetch` / `fetch:probe` | `bin/fetch-data.js` | Freshness probe + descarga CSVs |
| `fetch:news` | `bin/fetch-news.js` | Titulares GDELT → JSONL |
| `analyze` | `bin/generate-analysis.js` | Orquesta `lib/analysis/runner.js` (detect + narrativa + emisión) |

Detección y narrativa viven en `lib/analysis/runner.js`; no hay bins separados `detect-changes`, `narrate-indicators` ni `emit-alerts`.

### 5.2 Detección

| Estrategia | Módulo |
|------------|--------|
| 1 — Cambio abrupto | `lib/detect/z-score.js` |
| 4 — Cross-indicator | `lib/detect/cross-indicator.js` |

Filtros: `OBS_STATUS = A`, disagg `_Z`/`_T` excluidas, valores `Decimal`.

### 5.3 Narrativa LLM

- Un call por indicador con candidatos agrupados
- Prompts: `lib/prompts/analysis-{system,task,template,quality}.md`
- Parser: `lib/analysis/alert-extractor.js`
- Validación: `lib/analysis/quality-validator.js`
- PCN: `lib/pcn-claims.js`

### 5.4 Contexto omnibus

- `lib/analysis/context-builder.js` — CSVs, metadata `.md`, titulares §6 GDELT (max ~8 headlines)
- Salida análisis: `data/analyses/{IDNO}.md`, `data/analyses/{IDNO}.llm-call.md`

### 5.5 Emisión

- Por indicador: `data/alerts/{IDNO}.json`
- Agregado: `data/alerts.json` (consumido por UI)
- Enriquecimiento: `lib/alert-display.js` → `enrichAlert`, period narratives, stale flag

---

## 6. Datos y archivos

| Path | Contenido |
|------|-----------|
| `data/alerts.json` | Feed unificado |
| `data/alerts/{IDNO}.json` | Alertas por indicador |
| `data/analyses/{IDNO}.md` | Contexto + narrativa |
| `data/context/{COUNTRY}/{tier}.csv` | Series watchlist |
| `data/indicators/{IDNO}.md` | Metadata indicador |
| `data/news/{COUNTRY}/{YYYY-MM}.jsonl` | Titulares GDELT |
| `data/changed-since.json` | Resultado freshness probe |
| `data/index.json` | Índice indicadores watchlist |
| `lib/watchlist.js` | Watchlist canónico (~35 indicadores × tiers) |
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
| D-021 | Tiers pulse / annual / forecast |
| D-028 | Análisis: 4 prompts, validación claim traceability |
| D-029–D-030 | News = titulares reales GDELT; pulse ≠ news |
| D-017 | LLM narrativa vía Claude Opus / Agent SDK |

Lista completa: `CLAUDE.md`.

---

## 10. Funcionalidades explícitamente fuera del demo

- Apache NiFi / OpenSearch runtime
- Strategy 2 (divergencia titular-dato) en detección
- Newsletter backend
- Tiempo real continuo
- Cobertura fuera de los 5 países / watchlist
- Modo bilingüe simultáneo en UI (removido)
