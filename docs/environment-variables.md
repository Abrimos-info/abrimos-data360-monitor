# Variables de entorno

> **Estado**: referencia al 2026-05-29 para el demo fase 2 (entrega 2026-05-31).  
> Copiá `.env.example` → `.env` y ajustá según tu entorno. El archivo `.env` está en `.gitignore`.

Todas las variables se leen vía `dotenv` al arrancar scripts Node (`require('dotenv').config()`). Los valores booleanos suelen usar la convención `!== 'false'` (solo la cadena literal `false` desactiva la opción).

---

## Servidor y runtime

| Variable | Propósito | Default |
|----------|-----------|---------|
| `D360_PORT` | Puerto HTTP del monitor (`data360-monitor.js`) | `8090` |
| `NODE_ENV` | `production` desactiva recarga en caliente y ajusta caché de assets | *(no definido → dev)* |
| `MCP_URL` | Endpoint Streamable HTTP del servidor Data360 MCP (chat tools) | `http://127.0.0.1:8021/mcp` |

---

## LLM — proveedor y modelos

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `AI_PROVIDER` | Proveedor del pipeline de análisis: `claude-code`, `vllm`, `nvidia` | `claude-code` | — |
| `AI_MODE` | Alias legacy de `AI_PROVIDER` | — | — |
| `AI_ENABLED` | `false` omite llamadas LLM (útil con `--no-llm`) | `true` | — |
| `AI_MODEL` | Modelo por defecto para vLLM/LAIA y fallback genérico | `Qwen/Qwen2.5-14B-Instruct-AWQ` | — |
| `AI_MODEL_NOTICIA` | Modelo para Fase 1 (Noticias) | hereda `AI_MODEL` | — |
| `AI_MODEL_TRANSLATE` | Modelo para traducción ES→EN de Noticias | hereda `AI_MODEL_NOTICIA` | — |
| `AI_MODEL_REPORTAJE` | Modelo para Fase 2 (Reportajes) | — | — |
| `AI_MODEL_NEWSLETTER` | Modelo para `bin/generate-newsletter.js` | hereda `AI_MODEL_NOTICIA` | — |
| `NOTICIA_TRANSLATE` | `true`: genera Noticia solo en ES y luego traduce en llamada aparte | `true` | — |

### Anthropic API (recomendado)

Con `AI_PROVIDER=claude-code`, el pipeline llama a la [Messages API de Anthropic](https://docs.anthropic.com/en/api/messages) cuando `ANTHROPIC_API_KEY` está definida. Es la vía prevista para desarrollo local y producción (pm2).

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `ANTHROPIC_API_KEY` | API key del workspace Anthropic | *(vacío → error si `AI_PROVIDER=claude-code`)* | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_API_URL` | Base URL de la API | `https://api.anthropic.com` | — |
| `ANTHROPIC_VERSION` | Header `anthropic-version` | `2023-06-01` | — |
| `ANTHROPIC_MODEL` | ID de modelo explícito (anula alias de `CLAUDE_MODEL`) | — | — |
| `ANTHROPIC_MODEL_OPUS` | ID Opus si `CLAUDE_MODEL` contiene `opus` | `claude-opus-4-20250514` | — |
| `ANTHROPIC_MODEL_SONNET` | ID Sonnet si `CLAUDE_MODEL` contiene `sonnet` | `claude-sonnet-4-20250514` | — |
| `ANTHROPIC_MODEL_HAIKU` | ID Haiku si `CLAUDE_MODEL` contiene `haiku` | `claude-haiku-3-5-20241022` | — |
| `CLAUDE_MODEL` | Alias del modelo principal (`opus`, `sonnet`, `haiku`) | `opus` | — |
| `CLAUDE_MODEL_FALLBACKS` | Modelos de respaldo separados por coma si falla cuota (429/529) | `sonnet,haiku` | — |

### Claude Code CLI (opcional)

Si no hay `ANTHROPIC_API_KEY`, el cliente intenta invocar el binario `claude` vía `execFile` (suscripción Claude Code). Solo para entornos donde ya tengas el CLI autenticado.

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `CLAUDE_BIN` | Ruta al binario CLI | `claude` | Suscripción Claude Code |
| `CLAUDE_EFFORT` | Nivel de esfuerzo: `low`, `medium`, `high` (pasa `--effort=` al CLI; **no aplica a la API REST**) | *(vacío → sin flag)* | — |

### LAIA / vLLM

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `AI_API_URL` | Base URL OpenAI-compatible | `https://llms.laia.ar/v1` | — |
| `AI_API_KEY` | Bearer token LAIA (si el endpoint lo exige) | *(vacío)* | [llms.laia.ar](https://llms.laia.ar) |
| `AI_FALLBACK_VLLM_ON_CLAUDE_QUOTA` | `true`: ante cuota Claude, reintenta con vLLM | `false` | — |

### NVIDIA NIM

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `NVIDIA_API_URL` | Base URL NIM OpenAI-compatible | `https://integrate.api.nvidia.com/v1` | — |
| `NVIDIA_API_KEY` | API key NVIDIA | *(vacío)* | [build.nvidia.com](https://build.nvidia.com/) |
| `AI_MODEL_NVIDIA` | Modelo NIM (ej. Kimi) | `moonshotai/kimi-k2.6` | — |

### Timeouts, reintentos y costos

| Variable | Propósito | Default |
|----------|-----------|---------|
| `AI_TIMEOUT_MS` | Timeout llamadas análisis (Noticias) | `120000` (2 min) |
| `AI_CHAT_TIMEOUT_MS` | Timeout chat global y por artículo | `300000` (5 min) |
| `AI_REPORT_TIMEOUT_MS` | Timeout Reportajes y newsletter | `300000` (5 min) |
| `AI_FETCH_RETRIES` | Reintentos HTTP en cliente OpenAI-compatible | `3` |
| `AI_TRACK_COSTS` | `false` silencia logs `[AI-COST]` | `true` |

---

## Análisis (pipeline)

| Variable | Propósito | Default |
|----------|-----------|---------|
| `ANALYSIS_CHANGED_ONLY` | `true`: salta indicadores cuyo fingerprint no cambió (`data/alerts/{IDNO}.meta.json`) | `false` |
| `ANALYSIS_MAX_INDICATORS` | Tope de indicadores por \|z\| en Fase 1 (`0` = sin límite) | `0` |
| `ANALYSIS_MAX_NOTICIAS_PER_COUNTRY` | Máx. noticias por país protagonista (`pickPrimaryCountry`); skip pre-LLM | `0` |
| `ANALYSIS_MAX_NOTICIAS_PER_RUN` | Máx. noticias totales por corrida/día; stop al alcanzar cupo | `0` |
| `ANALYSIS_REPLAY_STRICT_BLOB` | Con `--as-of`: `true` = solo indicadores cuyo `last_modified` del CSV cae ese día | `false` |
| `AI_SLIM_CONTEXT` | `false`: contexto omnibus completo (más tokens) | `true` |
| `CONTEXT_SLIM_SERIES_POINTS` | Puntos de serie en contexto slim | `12` |
| `CONTEXT_SLIM_BASELINE_INDICATORS` | Indicadores baseline en contexto slim | `12` |
| `CONTEXT_SLIM_DATADICT_LINES` | Líneas de data dictionary en contexto slim | `15` |

---

## Chat

| Variable | Propósito | Default |
|----------|-----------|---------|
| `CHAT_AI_PROVIDER` | Proveedor LLM del chat (hereda `AI_PROVIDER` si no se define) | `vllm` |
| `CHAT_MAX_TURNS` | Máximo de turnos agente por sesión SSE | `8` |
| `CHAT_GENERATION_CONTEXT_MAX_CHARS` | Máx. caracteres de `data/analyses/{IDNO}.md` inyectados en chat por pieza | `48000` |

---

## Data360 API y rutas de datos

| Variable | Propósito | Default |
|----------|-----------|---------|
| `DATA360_API_BASE` | Base REST Data360 v3 | `https://data360api.worldbank.org` |
| `DATA360_FILES_BASE` | Base de archivos CSV públicos (referencia; no leída en runtime demo) | `https://data360files.worldbank.org` |
| `D360_DATA_DIR` | Directorio raíz de datos alternativo (busca `dynamic-watchlist.json` dentro) | `./data` |
| `D360_DYNAMIC_WATCHLIST_PATH` | Ruta absoluta a `dynamic-watchlist.json` | `data/dynamic-watchlist.json` |
| `OUTPUT_DIR` | Directorio de salida del pipeline (convención documentada; rutas actuales usan `data/` fijo) | `./data` |

---

## Titulares — pool, GDELT y Gemini

| Variable | Propósito | Default |
|----------|-----------|---------|
| `NEWS_MODE` | Modo fetch: `pool` (default), `indicator`, `gdelt` | `pool` |
| `NEWS_SKIP_COVERED` | `false`: siempre fetch aunque el pool esté lleno | `true` |
| `NEWS_MIN_ACCEPTED_PER_COUNTRY` | Mín. titulares aceptados/país para skip | `8` |
| `NEWS_LOOKBACK_DAYS` | Días hacia atrás desde `--from` en replay | `30` |
| `NEWS_GDELT_FALLBACK` | `false`: no cae a GDELT tras fallo Gemini | `true` |
| `NEWS_GEMINI_FIRST` | `false`: solo GDELT en pool mode | `true` |
| `NEWS_MAX_ARTICLES_PER_COUNTRY` | Máx. artículos por país (pool) | `8` |
| `NEWS_MIN_GEMINI_ACCEPTED` | Mín. aceptados Gemini antes de saltar GDELT | `1` |
| `NEWS_FROM` / `NEWS_TO` | Ventana ISO (alternativa a `--from`/`--to`) | — |
| `D360_RUN_EPOCH` | *(auto)* epoch ms de corrida; heredado a subprocessos | — |

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `GEMINI_API_KEY` | Gemini en pool mode (1 call/país) | *(vacío → solo GDELT)* | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_NEWS_MODEL` | Modelo principal búsqueda de titulares | hereda `GEMINI_MODEL` o `gemini-2.5-flash-lite` | — |
| `GEMINI_MODEL` | Modelo Gemini genérico | `gemini-2.5-flash` | — |
| `GEMINI_MODEL_FALLBACK` | Modelo de respaldo ante fallo del principal | `gemini-2.5-flash` | — |
| `GEMINI_SEARCH_GROUNDING` | `false`: desactiva Google Search grounding | `true` | — |
| `GEMINI_PACE_MS` | Pausa entre llamadas Gemini (ms) | `6000` | — |
| `GEMINI_MAX_RETRIES` | Reintentos por llamada Gemini | `3` | — |
| `GEMINI_429_MAX_RETRIES` | Reintentos extra ante HTTP 429 | `1` | — |
| `GEMINI_ABORT_AFTER_429` | Corta fase news tras N 429 consecutivos | `3` | — |
| `GEMINI_SKIP_COVERED` | Solo modo `indicator`: skip indicadores cubiertos | `true` |
| `GEMINI_NEWS_MIN_ACCEPTED` | Solo modo `indicator`: mín. por indicador | `1` |
| `GEMINI_NEWS_BATCH` | Solo modo `indicator`: batch LAC por indicador | `true` |
| `GEMINI_SKIP_FALLBACK_ON_429` | `false`: reintenta modelo fallback tras 429 | `true` | — |
| `GEMINI_SAVE_RAW` | `false`: no guarda prompt/respuesta en `data/news/raw/` | `true` | — |
| `GEMINI_RESOLVE_GROUNDING_URLS` | `false`: no resuelve URLs de grounding | `true` | — |
| `GEMINI_RESOLVE_TIMEOUT_MS` | Timeout resolución URL grounding | `8000` | — |
| `GEMINI_NEWS_FROM` | Inicio ventana búsqueda (ISO date) | `2026-04-01` | — |
| `GEMINI_NEWS_TO` | Fin ventana búsqueda (ISO date) | `2026-05-21` | — |
| `GEMINI_FALLBACK_TO_GDELT` | `false`: no cae a GDELT si Gemini falla | `true` | — |
| `GDELT_PACE_MS` | Pausa entre consultas GDELT | `8000` | — |
| `GDELT_MAX_ATTEMPTS` | Reintentos por consulta GDELT | `2` | — |
| `GDELT_FALLBACK_MAX_RECORDS` | Máx. registros GDELT en fallback | `15` | — |
| `NEWS_FETCH_BODY` | `false`: no descarga cuerpo HTML de artículos | `true` | — |
| `NEWS_ARTICLE_MAX_CHARS` | Máx. caracteres extraídos por artículo | `2500` | — |
| `NEWS_ARTICLE_READ_BYTES` | Bytes leídos del HTML | `600000` | — |
| `NEWS_ARTICLE_TIMEOUT_MS` | Timeout fetch artículo | `15000` | — |
| `NEWS_FETCH_USER_AGENT` | User-Agent HTTP para fetch de titulares/artículos | `Mozilla/5.0 (compatible; Data360NewsAgent/1.0; …)` | — |

---

## Suscripciones y salida

| Variable | Propósito | Default |
|----------|-----------|---------|
| `SUBSCRIBERS_TSV` | Ruta al TSV de suscriptores (`POST /api/subscribe`) | `data/newsletter/subscribers.tsv` |

---

## Roadmap (documentadas, no usadas en runtime demo)

| Variable | Propósito | Default | Clave API |
|----------|-----------|---------|-----------|
| `OPENSEARCH_URI` | Cluster OpenSearch para búsqueda semántica | *(vacío)* | — |
| `BREVO_API_KEY` | Envío real de newsletter vía Brevo | *(vacío)* | [Brevo API keys](https://app.brevo.com/settings/keys/api) |
| `BREVO_FROM_EMAIL` | Remitente Brevo | *(vacío)* | — |

---

## Ejemplos rápidos

```bash
# Pipeline con Anthropic Opus (API)
AI_PROVIDER=claude-code ANTHROPIC_API_KEY=sk-ant-... CLAUDE_MODEL=opus npm run analyze

# Chat con LAIA gratis
CHAT_AI_PROVIDER=vllm AI_API_URL=https://llms.laia.ar/v1 npm run dev

# Titulares Gemini + monitor en producción con PM2
cp .env.example .env   # editar ANTHROPIC_API_KEY, GEMINI_API_KEY
pm2 start ecosystem.config.js
```

---

## Anthropic API — configuración mínima

1. Creá una API key en [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. En `.env`:

```bash
AI_PROVIDER=claude-code
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=opus
```

3. Verificá:

```bash
node -e "require('./lib/ai-client').logAnalysisLlm('test')"
# [test] LLM: Anthropic | claude-opus-4-20250514 (Anthropic API)
```

Los costos se estiman en consola con el prefijo `[AI-COST]` usando `MODEL_PRICING` en `lib/ai-client.js`.

---

## Documentación relacionada

- [`.env.example`](../.env.example) — plantilla comentada
- [security-data-handling.md](./security-data-handling.md) — manejo de secretos y PII
- [user-guide.md](./user-guide.md) — guía de operador (ES)

---

# Environment variables (English)

> **Status**: reference as of 2026-05-29 for phase 2 demo (submission 2026-05-31).  
> Copy `.env.example` → `.env` and adjust for your environment. `.env` is gitignored.

All variables are read via `dotenv` when Node scripts start. Boolean flags typically use `!== 'false'` (only the literal string `false` disables the option).

See the Spanish sections above for the full variable tables. Key groups:

| Group | Main variables |
|-------|----------------|
| Server | `D360_PORT`, `NODE_ENV`, `MCP_URL` |
| LLM provider | `AI_PROVIDER`, `AI_MODEL_*`, `AI_ENABLED` |
| Claude / Anthropic | `ANTHROPIC_API_KEY`, `ANTHROPIC_API_URL`, `ANTHROPIC_VERSION`, `ANTHROPIC_MODEL*`, `CLAUDE_MODEL`, `CLAUDE_MODEL_FALLBACKS`, `CLAUDE_BIN`, `CLAUDE_EFFORT` |
| LAIA / vLLM | `AI_API_URL`, `AI_API_KEY`, `AI_FALLBACK_VLLM_ON_CLAUDE_QUOTA` |
| NVIDIA NIM | `NVIDIA_API_URL`, `NVIDIA_API_KEY`, `AI_MODEL_NVIDIA` |
| Timeouts | `AI_TIMEOUT_MS`, `AI_CHAT_TIMEOUT_MS`, `AI_REPORT_TIMEOUT_MS`, `AI_FETCH_RETRIES` |
| Analysis | `ANALYSIS_CHANGED_ONLY`, `ANALYSIS_MAX_INDICATORS`, `AI_SLIM_CONTEXT`, `CONTEXT_SLIM_*` |
| Chat | `CHAT_AI_PROVIDER`, `CHAT_MAX_TURNS`, `CHAT_GENERATION_CONTEXT_MAX_CHARS` |
| Data paths | `DATA360_API_BASE`, `D360_DATA_DIR`, `D360_DYNAMIC_WATCHLIST_PATH`, `OUTPUT_DIR` |
| News | `GEMINI_*`, `GDELT_*`, `NEWS_*` |
| Subscriptions | `SUBSCRIBERS_TSV` |
| Roadmap | `OPENSEARCH_URI`, `BREVO_*` |

Related: [`.env.example`](../.env.example), [security-data-handling.md](./security-data-handling.md), [user-guide.en.md](./user-guide.en.md).
