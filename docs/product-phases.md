# Plan de producto — Data360 News Agent

Documento de referencia derivado de las notas del 2026-05-26.

**Estado:** Fases 1–5 implementadas en código (mayo 2026). Fase 6 es operación editorial continua.

---

## Fase 0 — Seguridad y operación ✅

| Tarea | Estado |
|-------|--------|
| Secretos en `.env` (gitignored) | Hecho |
| Instrucciones MCP en `README.md` | Hecho |

---

## Fase 1 — Bugs de datos y verificación ✅

| # | Fix |
|---|-----|
| Claims sin marcas | `pcn-claims.js`, `alert-page.js` |
| Paths por país | `_paths` en `url-slug.js`, `pathForCountry` en portada |
| MCP | Deploy separado documentado; fallback REST en chat |

---

## Fase 2 — Portada de país ✅

| Cambio | Implementación |
|--------|----------------|
| Sidebar = indicadores actualizados + sparkline | `frontpage.pug`, `lib/sparkline.js` |
| Reportajes entre titulares | `interleaveHeadlines()` en `lib/views.js` |
| Masthead edición · mes · año | `editionLabel()` |
| Sin botón actualizar | Eliminado de portada |
| Sin tag país en titulares | Removido del meta |

---

## Fase 3 — Información y rutas ✅

| Ruta | Template |
|------|----------|
| `/` | `country-picker.pug` + indicadores recientes |
| `/{país}` | `frontpage.pug` |
| `/indicadores` | `indicators-hub.pug` |
| `/indicador/{IDNO}` | `indicator-page.pug` |

Nav: enlace **Indicadores globales**. Selector de país: popup en portada (`country-menu.js`).

---

## Fase 4 — Artículo y onboarding ✅

| Cambio | Implementación |
|--------|----------------|
| Breadcrumb | `Edición: {país} · Noticia/Reportaje` (sin Portada) |
| Onboarding bilingüe | Columnas ES + EN en `onboarding.pug` |

---

## Fase 5 — LLM NVIDIA NIM ✅

Provider `AI_PROVIDER=nvidia` y `CHAT_AI_PROVIDER=nvidia` en `lib/ai-client.js`. Variables en `.env.example`.

---

## Fase 6 — Pipeline de contenido (ops, continuo)

| Tarea | Nota |
|-------|------|
| Titulares Gemini | `GEMINI_API_KEY` en server |
| Reportajes Q2 `csv_links` | `sanitizeReportajeItem` |
| Re-narrar `incomplete` | `node bin/generate-analysis.js --only IDNO` |
| Sin pulse en PCN | `CONTEXT_TIERS` sin pulse |

---

## Referencias de bugs (2026-05-26)

- Claims: `/argentina/noticia/2026/05/cpi-en-argentina-alcanza-nuevo-maximo`
- País equivocado: `/ecuador` → enlace corregido vía `_paths`
