# Referencia de funcionalidades — Data360 News Agent

> Catálogo técnico de capacidades implementadas en el demo (2026-05-29).  
> Producto: **Data360 News Agent** — agencia de noticias con IA sobre indicadores Data360.  
> Guía orientada a redacciones: [user-guide.md](./user-guide.md).

---

## 1. Servidor web

**Entrada**: `data360-monitor.js`  
**Puerto**: 8090 (por defecto, `D360_PORT`)  
**Stack**: Node.js, Pug, vanilla JS, sin bundler.

| Ruta | Vista | Template / módulo |
|------|-------|-------------------|
| `/` | Selector de país | `countryPickerPage` → `country-picker.pug` |
| `/{countrySlug}` | Portada LAC | `frontpagePage` → `frontpage.pug` |
| `/{countrySlug}/{noticia\|reportaje}/{y}/{m}/{slug}` | Artículo | `alertPage` → `alert-page.pug` |
| `/indicadores`, `/indicators` | Hub indicadores | `indicatorsHubPage` → `indicators-hub.pug` |
| `/indicador/{idno}` | Detalle indicador | `indicatorDetailPage` → `indicator-page.pug` |
| `/chat` | Chat global | `chatPage` → `chat.pug` |
| `/about` | About | `aboutPage` → `about.pug` |
| `/metodologia`, `/privacidad`, `/terminos`, `/uso` | Páginas estáticas | `metodologiaPage`, `privacidadPage`, `terminosPage`, `usoPage` → `static-prose.pug` + `config/copy/` |
| (fallback) | 404 | `notFoundPage` → `not-found.pug` |
| `/newsletter` | Redirect edición LAC | `newsletterIndexPage` |
| `/newsletter/lac/{date}` | Edición newsletter | `newsletterEditionPage` → `newsletter-edition.pug` |
| `/alertas/{countrySlug}/ejemplo` | Preview alertas | `alertsSamplePage` → `alerts-sample.pug` |
| `/dev/feed` | Feed legacy | `legacyDashboardPage` → `dashboard.pug` |
| `?legacy=1` en portada | Mismo feed legacy | `legacyDashboardPage` |
| `/api/chat` | SSE agente | `lib/chat/api.js` |
| `/api/alerts` | JSON alertas | `lib/alerts-api.js` |
| `POST /api/subscribe` | Suscripción demo | `lib/subscribe.js` |
| `/static/*` | Assets | `lib/router.js` |

Configuración de rutas: `config/routes.json` vía `lib/route-registry.js`.  
Handlers: `lib/views.js`.  
i18n UI: `config/strings.{es,en}.json`, `lib/i18n.js`.  
Copy legal/estático: `config/copy/{page}.{es,en}.json`, `lib/static-copy.js`.

Hot reload en desarrollo: invalidación de templates, strings, copy y `alerts.json` vía `chokidar`.

Deep links: `/?alert={id}` en home redirige al `_path` canónico del artículo (`lib/url-slug.js`).

---

## 2. Portada por país

Implementación: `lib/views.js` → `frontpagePage`, `frontpageData()`, `templates/frontpage.pug`.

- **Hero reportaje** — reportaje más reciente para el ISO3 de la portada.
- **Titulares** — noticias intercaladas con reportajes (`interleaveHeadlines()`).
- **Ticker** — indicadores actualizados con sparkline SVG (`lib/sparkline.js`, `renderSparklineSvg`).
- **Masthead** — `editionLabel()`, antigüedad de datos (`getDataAgeSeconds`).
- **Selector de país** — popup (`static/js/country-menu.js`).

Orden server-side por fecha del dato (`lib/alert-display.js`).

### 2.1 Vista legacy (feed con filtros)

`legacyDashboardPage` → `dashboard.pug`. Acceso: `/dev/feed` o `?legacy=1`.

- Renderiza **todas** las alertas en HTML al cargar.
- Orden: `sortAlertsByDataDate`.
- Datos inyectados: `window.D360_ALERTS`, `window.D360_FILTERS`.
- Filtros cliente: `static/js/behavior.js` (país, categoría, content_type, variant).
- Panel de detalle: `static/js/detail-panel.js`, `templates/partials/detail-panel.pug`.
- Deep link: `?alert={id}`.

---

## 3. Artículo y chat scoped

**Template**: `alert-page.pug`  
**JS**: `static/js/alert-page.js`, `static/js/alert-chat.js`, `static/js/floating-chat.js`, `static/js/chat-turn-ui.js`

- Story con PCN: `static/js/pcn-claims.js`, `renderNarrativeText()`.
- Sparkline en artículo: `charts.js` / mixin `+chart`.
- Chat FAB scoped: `templates/partials/floating-chat.pug` (`d360-floating-chat--scoped`).
- Presets por artículo: `templates/partials/alert-chat.pug`.
- Historial: `sessionStorage` keyed por `alert_id`.
- Contexto generación: `data/analyses/{IDNO}.md` inyectado vía `CHAT_GENERATION_CONTEXT_MAX_CHARS`.
- Pie: `templates/partials/article-footer.pug` (disclaimer, reuse, newsletter CTA).

URLs: `buildAlertPath()` / `parseArticlePath()` en `lib/url-slug.js`.

---

## 4. Newsletter y suscripción

### 4.1 Modal UI

- Template: `templates/partials/newsletter-modal.pug` (incluido desde `layout.pug`).
- Cliente: `static/js/newsletter-modal.js`.
- Trigger: `[data-open-subscribe]`, `#d360-subscribe-btn`.

### 4.2 API suscripción

`lib/subscribe.js` → `POST /api/subscribe`

| Campo | Tipo | Notas |
|-------|------|-------|
| `email` | string | Validación regex básica |
| `subscription_type` | `newsletter_lac` \| `indicator_alerts` | Obligatorio |
| `countries` | string[] ISO3 | Opcional; filtrado a 5 LAC |
| `topics` | string[] | macro, fiscal, social, food_security, governance |
| `lang` | `es` \| `en` | Default `es` |

Persistencia: append TSV en `data/newsletter/subscribers.tsv` (gitignored). Columnas: timestamp, email, type, countries, topics, lang, user-agent, referer.

Respuesta: `{ ok: true, preview_url }` — `/newsletter` o `/indicadores?countries=…&topics=…`.

**Demo**: sin SMTP ni confirmación por correo (D-009).

### 4.3 Ediciones newsletter

- Fixtures: `data/newsletter/editions/lac-{YYYY-MM-DD}.json`.
- Loader: `lib/newsletter/editions.js` (`loadEdition`, `loadLatestEditionDate`, `renderEditionHtml`).
- Rutas: `/newsletter` → redirect última fecha; `/newsletter/lac/{date}` HTML.

Schema edición (campos principales): `edition`, `subject`, `preheader`, `greeting`, `hero`, `featured`, `close`, `cta`.

---

## 5. Páginas estáticas

Handlers: `lib/pages/static-pages.js` → `static-prose.pug`.

| pageId | Ruta | Copy |
|--------|------|------|
| metodologia | `/metodologia` | `config/copy/metodologia.{es,en}.json` |
| privacidad | `/privacidad` | `config/copy/privacidad.{es,en}.json` |
| terminos | `/terminos` | `config/copy/terminos.{es,en}.json` |
| uso | `/uso` | `config/copy/uso.{es,en}.json` |

Loader: `lib/static-copy.js` — fallback ES si falta EN.

Tests: `test/static-copy.test.js`.

---

## 6. Hub de indicadores

`indicatorsHubPage` → `indicators-hub.pug`

- Tiers desde `lib/watchlist.js` (`watchlistByTier`, `HUB_TIER_ORDER`).
- Conteos de alertas: `buildIndicatorAlertCounts()`.
- Recientes: `recentUpdatedIndicators()`.
- Filtros URL: `countries`, `topics` (consumidos por hub y preview de alertas).

Detalle: `indicatorDetailPage` → `indicator-page.pug` (`indicatorPageData()`).

---

## 7. Chat global

### 7.1 Agente SSE

- Cliente: `static/js/chat.js`
- Servidor: `lib/chat/agent.js`, `lib/chat/api.js`
- Eventos: `llm_start`, `llm_end`, `tool_start`, `tool_result`, `token`, `done`, `error`
- Historial: `compactHistoryForLlm` → 16 mensajes (+ system)
- Max turns: `CHAT_MAX_TURNS` (default 8)

### 7.2 Presets y freshness

- Presets: `config/chat-presets.json`, `lib/chat/freshness-preset.js`
- País foco: `lib/chat/focus-countries.js`
- Panel freshness: `templates/partials/chat-freshness.pug`

### 7.3 Markdown, sparklines, tarjetas

- `static/js/markdown.js`, `static/js/chat-cards.js`, `static/js/indicator-pills.js`
- Export: `static/js/chat-export.js`
- Cache sparklines: `window.D360_SPARKLINE_CACHE`

### 7.4 MCP + REST fallback

| Tool MCP | Fallback REST |
|----------|---------------|
| `mcp_search_indicators` | `data360-client.search` |
| `mcp_get_data` | `getData` + chart series |
| `mcp_compare_countries` | REST compare |
| `mcp_rank_countries` | idem |
| `mcp_summarize_data` | REST summarize |

Cliente MCP: `lib/mcp-client.js`. Eval smoke: `bin/evaluate-mcp.js`.

---

## 8. Tools del agente (servidor)

Implementación: `lib/chat/tools.js`

| Tool | Fuente |
|------|--------|
| `list_alerts` | `lib/alerts-store.js` |
| `run_analysis` | `lib/analysis/runner.js` (cache si alertas existen) |
| `read_news` / `fetch_news` | `lib/news.js`, `lib/news-fetch.js` |
| `read_freshness` | `lib/chat/freshness-preset.js` |
| MCP tools | `lib/mcp-client.js` + fallback REST |

---

## 9. Pipeline de análisis

### 9.1 Scripts npm

| Script | Binario | Rol |
|--------|---------|-----|
| `discover` | `bin/discover-indicators.js` | `/searchv2` → `dynamic-watchlist.json` |
| `fetch` / `fetch:probe` | `bin/fetch-data.js` | Probe + CSV + DATADICT |
| `fetch:news` | `bin/fetch-news.js` | Titulares (Gemini, watchlist dinámico) |
| `analyze` | `bin/generate-analysis.js` | Detect + Noticias + Reportajes |
| `analyze:changed` | idem `--changed-only` | |
| `analyze:noticias` / `analyze:reportajes` | fases separadas | |
| `generate:newsletter` | `bin/generate-newsletter.js` | Edición LAC del día |
| `pipeline` | `bin/pipeline.js` | discover → fetch → news → analyze → newsletter |
| `build` | alias de `pipeline` | |
| `pipeline:news-gdelt` | GDELT + watchlist | |

Orquestación: `lib/analysis/runner.js` (Fase 1) + `lib/analysis/reportaje-runner.js` (Fase 2).

### 9.2 Detección

| Estrategia | Módulo |
|------------|--------|
| 1 — Cambio abrupto | `lib/detect/z-score.js` |
| 4 — Cross-indicator | `lib/detect/cross-indicator.js` |

### 9.3 Narrativa LLM

- Prompts Noticia: `lib/prompts/noticia-{system,task,template}.md`
- Prompts Reportaje: `lib/prompts/reportaje-{system,task}.md`
- Extractor: `lib/analysis/alert-extractor.js`
- Validación Q1/Q2/Q4: `lib/analysis/quality-validator.js`
- PCN: `lib/pcn-claims.js`, verificación `lib/pcn-verify.js`
- Contexto: `lib/analysis/context-builder.js` (+ DATADICT, GDELT §6, `allowed_claim_ids`)

### 9.4 Salida

- `data/alerts/{IDNO}.json`, `data/alerts/reportaje_{dataset}.json`
- Agregado: `data/alerts.json`
- Enriquecimiento UI: `lib/alert-display.js`

---

## 10. Datos y archivos

| Path | Contenido |
|------|-----------|
| `data/alerts.json` | Feed unificado |
| `data/alerts/{IDNO}.json` | Noticia por indicador |
| `data/alerts/reportaje_{dataset}.json` | Reportaje por dataset |
| `data/analyses/{IDNO}.md` | Contexto + narrativa |
| `data/context/{COUNTRY}/{tier}.csv` | Series (`annual`, `forecast`, `dynamic`; `pulse` legacy) |
| `data/news/{COUNTRY}/{YYYY-MM}.jsonl` | Titulares |
| `data/newsletter/editions/` | Ediciones fixture LAC |
| `data/newsletter/subscribers.tsv` | Suscriptores demo (gitignored) |
| `data/changed-since.json` | Freshness probe |
| `data/dynamic-watchlist.json` | Discovery dinámico |
| `lib/watchlist.js` | Watchlist estático ~35 indicadores |

---

## 11. AI / LLM

**Cliente**: `lib/ai-client.js`

| Uso | Env | Proveedores |
|-----|-----|-------------|
| Pipeline análisis | `AI_PROVIDER`, `AI_MODEL` | `claude-code`, `vllm`, `nvidia`, OpenRouter |
| Chat | `CHAT_AI_PROVIDER` | idem (default `vllm`) |

NVIDIA NIM: `AI_PROVIDER=nvidia`, `NVIDIA_API_KEY`, `AI_MODEL_NVIDIA`.

Tracking: `[AI-COST]`, `[AI-COST-NARRATE]`.

---

## 12. Frontend assets

| Archivo | Rol |
|---------|-----|
| `static/css/wb-theme.css` | Paleta World Bank v2, tipografía |
| `static/css/wb-chrome.css` | Header, nav, footer WB |
| `static/css/main.css` | Layout app, cards, artículo |
| `static/js/data360-urls.js` | `indicatorUrl()` → `/en/indicator/{IDNO}` |
| `static/js/alerts-feed.js` | Merge post-chat en feed legacy |
| `static/js/onboarding.js` | Modal bienvenida |
| `static/js/lang-toggle.js` | ES/EN |

Tema de referencia: `design/v2/` (React, no runtime).

---

## 13. Tests

`npm test` → `node --test test/*.test.js`

**Estado 2026-05-29**: 61 archivos, 291 tests (289 pass, 2 skipped).

Suites relevantes recientes:

- `test/routes.test.js` — match de rutas y viewNames
- `test/server.test.js` — HTTP, newsletter, subscribe, traversal
- `test/static-copy.test.js` — páginas legales
- `test/url-slug.test.js` — paths de artículo
- `test/indicators-hub.test.js` — hub tiers
- `test/i18n.test.js` — strings + newsletter keys
- `test/chat.test.js` — tools, markdown, export
- `test/e2e-deferred.test.js` — Playwright TBD (skipped)

CI: `.github/workflows/test.yml`.

---

## 14. Decisiones de producto (resumen)

| ID | Decisión |
|----|----------|
| D-003 | 5 países LAC demo |
| D-007 | Replay histórico |
| D-008 | Dashboard estático lee `alerts.json` |
| D-009 | Suscripción demo → TSV local; sin email send |
| D-010 | Estrategias 1 y 4 |
| D-021 | Tiers: pulse legacy; análisis usa annual + forecast + dynamic |
| D-028–D-034 | Noticia/Reportaje, extractor, Q1/Q2/Q4, dynamic discovery |
| D-035 | Enlaces indicador `/en/indicator/{IDNO}` |

Lista completa: `CLAUDE.md`.

---

## 15. Funcionalidades explícitamente fuera del demo

- Apache NiFi / OpenSearch runtime
- Strategy 2 (divergencia titular-dato) en detección
- **Envío real de email** y desuscripción automatizada por SMTP
- Tiempo real continuo
- Cobertura fuera de los 5 países / watchlist
- Modo bilingüe simultáneo en UI
