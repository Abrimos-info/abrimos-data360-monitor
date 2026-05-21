# Frontend architecture, abrimos-data360-monitor

Status: design doc, implementation in progress. Reviewed against `CLAUDE.md` (D-008/009/011/017/019) and `sociedad-web-front` reference stack.

> **Post-migration cleanup (TODO)**: una vez completada la implementación (paso 11 del implementation order), reescribir este documento como spec autocontenida del proyecto. Quitar todas las referencias a `design/`, `sociedad-web-front`, "JSX", "React UMD", "qué se hereda/qué no", el mapping JSX → mixins Pug, y el implementation order. El doc final debe leerse como arquitectura de un proyecto nuevo, no como diff contra otros repos. Borrar también el directorio `design/` del repo si los assets que valga la pena conservar (svgs, fonts) ya están migrados a `static/`.

## Progress

Actualizado: 2026-05-21. Commit `553dd89` (bootstrap server + cards SSR).

| # | Tarea                                                                          | Estado |
| - | ------------------------------------------------------------------------------ | ------ |
| 1 | Scaffold server + minimal router                                               | ✅      |
| 2 | Alert schema + fixture                                                         | ✅      |
| 3 | i18n + strings.{es,en}.json                                                    | ⏸ pospuesto (después de cerrar visual) |
| 4 | CSS desde cero (tokens + main)                                                 | ✅      |
| 5 | Layout + dashboard shell                                                       | ✅      |
| 6 | Base mixins (countryTag, typeChip, magnitude, verificationMark, chart, claim)  | ✅      |
| 7 | Card variants + feed                                                           | ✅      |
| 8 | Detail panel via template binding                                              | ⏳ siguiente |
| 9 | behavior.js (filtros, lang toggle, copy quote, deep link, Escape)              | ⏳      |
| 10 | Pipeline integration (real alerts.json)                                       | ⏳ depende de Fer |
| 11 | QA (Playwright + Lighthouse + copy linter)                                    | ⏳      |
| 12 | Post-migration cleanup de este documento                                      | ⏳ al final |

## Goals

1. Render the static dashboard defined in `design/` (3 card variants, side detail panel, country/category filters, ES/EN toggle, demo states).
2. Read alerts from a precomputed `data/alerts.json` produced by the detection pipeline (`bin/detect-changes.js`, `bin/narrate-indicators.js`, `bin/emit-alerts.js`).
3. Stay coherent with the rest of Abrimos infra (D-019): Node.js CommonJS, server-side Pug, custom HTTP router driven by `config/routes.json`, no Express.
4. Replace the React + Babel UMD prototype in `design/` with Pug + vanilla JS, keeping the same DOM/CSS contract so the existing `ds-tokens.css`, `styles.css`, `styles-feed.css` survive untouched.

## Stack

| Capa | Pieza | Origen |
|---|---|---|
| HTTP server | `http.createServer` + `lib/router.js` (custom) | adaptado de `sociedad-web-front` |
| Routing config | `config/routes.json` | sociedad pattern, sin subroutes complejos |
| Templating | Pug 3.x, precompiled and cached per template | sociedad |
| i18n | `lib/i18n.js` + `config/strings.es.json` / `strings.en.json` | sociedad (sin `pt`) |
| Static assets | `static/css/`, `static/js/`, `static/img/`, on-demand minify | sociedad |
| Client JS | Vanilla (no React, no jQuery, no build step) | nuevo |
| Hot reload (dev) | chokidar watches `.pug`/`.css`/`.js`/config | sociedad |
| Data source | `data/alerts.json` leído al startup, recargado on file change | nuevo |
| Logging | `logs/lastlog.log` symlink en dev, stdout en prod | sociedad |

Lo que **no** se toma de sociedad: OpenSearch (`db3.js`), PostgreSQL (`db-postgres.js`), `auth*`, `payments.js`, `subscriptions.js`, `brevo.js`, `rate-limiter.js`, three-tier cache, `userAccessLevel`, `authSection` mixin. El demo no tiene usuarios, base de datos, ni pagos (D-009).

## Folder structure

```
data360/
├── bin/
│   ├── fetch-data.js
│   ├── detect-changes.js
│   ├── narrate-indicators.js
│   └── emit-alerts.js
├── lib/
│   ├── router.js          # HTTP + static + route dispatch (adapted)
│   ├── views.js           # render functions per route
│   ├── i18n.js            # _("key", lang) helper, hot-reloadable
│   ├── alerts-store.js    # loads/reloads data/alerts.json into memory
│   └── ai-client.js       # Claude / LAIA / OpenRouter (separate from frontend)
├── config/
│   ├── routes.json
│   ├── strings.es.json
│   └── strings.en.json
├── templates/
│   ├── layout.pug         # html shell, head, scripts
│   ├── dashboard.pug      # main view (feed + optional detail)
│   ├── mixins.pug         # card variants, verification mark, country tag
│   ├── card-narrative.pug # variant: narrative-forward
│   ├── card-number.pug    # variant: number-forward
│   ├── card-newspaper.pug # variant: newspaper
│   ├── detail.pug         # side panel
│   ├── chart.pug          # inline SVG sparkline
│   └── verification.pug   # PCN mark
├── static/
│   ├── css/
│   │   ├── ds-tokens.css      # from design/
│   │   ├── styles.css         # from design/
│   │   └── styles-feed.css    # from design/
│   ├── js/
│   │   ├── behavior.js        # filters, detail open/close, lang toggle, copy
│   │   └── initialBehavior.js # DOMContentLoaded bootstrap
│   └── img/
├── data/
│   ├── snapshots/         # gitignored CSVs
│   └── alerts.json        # consumed by frontend
├── docs/
│   └── frontend-architecture.md (this file)
├── data360-monitor.js     # entry point
└── package.json
```

## Server lifecycle

`data360-monitor.js` (adaptado de `sociedad-web-front.js`):

1. Load `.env` con `override: true`.
2. `require('./lib/i18n')` lee `config/strings.{es,en}.json`.
3. `require('./lib/alerts-store')` lee `data/alerts.json`.
4. `i18n.onReload(views.clearTemplateCache)` y `alertsStore.onReload(views.clearTemplateCache)` para que cambios en strings o datos invaliden el render cache.
5. `http.createServer(router.requestListener).listen(process.env.D360_PORT || 8090)`.
6. En dev: chokidar observa `templates/`, `static/`, `config/`, `data/alerts.json`. `.pug` y `data/alerts.json` solo limpian cache; cambios en `.js` reinician el proceso (igual que sociedad).

## Routing

`config/routes.json` formato sociedad simplificado:

```json
{
  "meta": { "site": "data360" },
  "": { "viewType": "function", "viewName": "dashboardPage" },
  "alert": { "viewType": "function", "viewName": "alertPage" },
  "about": { "viewType": "function", "viewName": "aboutPage" },
  "static": { "viewType": "function", "viewName": "sendStatic" }
}
```

- `/` → `dashboardPage(req, res)` renderiza `dashboard.pug` con la lista completa de alertas + filtros aplicables.
- `/alert/:id` → render server-side del detail panel embebido en el layout (deep-link a un evento). Cuando se abre vía clic en el feed, no se navega: `behavior.js` toma el HTML via `fetch('/alert/:id?partial=1')` e inyecta en el `<aside>`.
- `/static/*` → `lib/router.js` `sendStatic()` sirve `static/` con minify on-demand para `.js`/`.css` (igual que sociedad).
- `/about` → página de "Acerca de" estática.

No hay `/api/*` en el demo. El "newsletter" botón es no funcional (D-009): `<button onclick="alert(...)">Próximamente</button>` o un `data-coming-soon` que el JS atrapa.

## Templating contract

### Layout

`templates/layout.pug` expone `block content`, recibe locals:

```
{
  lang,              // 'es' | 'en'
  langMode,          // 'es' | 'en' | 'both'
  T,                 // strings[lang] for client (window.D360_T)
  alerts,            // full list (JSON, dumped to window.D360_ALERTS)
  filters: { country, category },
  selectedAlert,     // optional, for deep links
  demoState          // 'populated' | 'loading' | 'empty-all' (dev only)
}
```

Server-side filtering for the SSR pass: cuando llega `/?country=GTM&category=health`, `views.dashboardPage` filtra `alerts` antes de pasar. El cliente puede re-filtrar sin round-trip leyendo el JSON inline.

### Inline JSON

El layout dumpea, en el shell:

```pug
script.
  window.D360_ALERTS = !{JSON.stringify(alerts)};
  window.D360_T = { es: !{JSON.stringify(stringsEs)}, en: !{JSON.stringify(stringsEn)} };
  window.D360_LANG = !{JSON.stringify(lang)};
```

Esto reemplaza `data.js` del `design/` (que era un archivo separado con `window.D360_DATA = (...)`). Mantenemos la convención `window.D360_*`.

**Importante**: usar `!{JSON.stringify(...)}` (no `#{...}`) por la regla de `sociedad-web-front` CLAUDE.md: evita romper si una traducción tiene apóstrofes.

### Mixins

`templates/mixins.pug` reemplaza los componentes JSX por mixins Pug. Mapping uno a uno:

| JSX componente | Pug mixin |
|---|---|
| `<CountryTag iso3 lang>` | `+countryTag(iso3, lang)` |
| `<TypeChip type T>` | `+typeChip(type)` |
| `<Magnitude text type>` | `+magnitude(text, type)` |
| `<VerificationMark state lang size>` | `+verificationMark(state, lang, size)` |
| `<Chart {...ev.chart} lang>` | `+chart(chartData, lang)` (SVG inline) |
| `<Claim state lang>{tok}</Claim>` | `+claim(state, lang, token)` |
| `<CardNumberForward ev lang>` | `+cardNumber(ev, lang, langMode)` |
| `<CardNarrativeForward ev lang>` | `+cardNarrative(ev, lang, langMode)` |
| `<CardNewspaper ev lang>` | `+cardNewspaper(ev, lang, langMode)` |
| `<Feed events variant density>` | `+feed(events, variant, density, lang)` |
| `<Detail event lang>` | bloque en `detail.pug` |

La variante de card y la densidad se eligen vía body class (`d360-app--density-comfortable`, etc.) y vía clase en cada `.d360-card--narr|num|news`, exactamente como hace `app.jsx` hoy. No hay que mover lógica al server.

### Narrativa con claim tokens

La función `canonicalTokens(ev, lang)` de `detail.jsx` queda como helper Pug: recorre `ev.narrative[lang][variant]`, busca tokens por substring exacto, los envuelve en `+claim(...)`. Lo escribimos en Pug puro (con `- var ...`) o en un helper JS expuesto vía `pugLocals`. **Recomendado**: helper JS `wrapClaims(narrativeText, tokens, state, lang)` en `lib/views.js`, retorna HTML pre-escapado que el template incluye con `!{...}`.

## i18n

`lib/i18n.js` igual al de sociedad, simplificado a `es` y `en`. Función pública:

```js
_("section.key", lang, params?)
```

`pugLocals._ = i18n.getString` queda inyectado en todos los renders. Para uso client-side, `window.D360_T[lang]` tiene el bundle completo (los strings actuales del `design/data.js` viven ahora en `config/strings.{es,en}.json`).

Validación: `npm run i18n:unused` toma el script de sociedad y se adapta a las extensiones `.pug` y `.js` de este repo.

## Client JS (behavior.js)

Un solo archivo `static/js/behavior.js` con vanilla JS, organizado igual que el de sociedad (`POPOVER_IDS` constants arriba, `initializeBehavior()` al final, atado a `DOMContentLoaded`).

### Lo que NO copiamos de behavior.js de sociedad

- `track()` / PiTrack / Brevo CRM forwarding (no analytics en el demo).
- `setupAutocompleteFilters()`, `setupClearFilterButtons()` complejo (filtros del demo son `<select>` simples).
- `loadStripeJS()`, `setupLoginForm()`, `setupAbandonedDownloadCookie()`, todo lo de checkout y auth.
- `setupStickyActionBar()`, `initializeObservers()` para ads.
- `applyStoredConsent()`, `initializeConsent()`: el demo no muestra ads ni hace tracking, no necesita banner GDPR.

### Lo que SÍ tomamos como patrón

1. **`POPOVER_IDS` + `openPopover`/`closePopover`** — adaptamos para el side panel `d360-detail` y eventuales modales (newsletter "Próximamente"). Cierre con Escape, click fuera, mutual exclusion.
2. **`toggleSection(sectionId)`** — útil si plegamos secciones en el detail panel.
3. **`initializeBehavior()` al final con `DOMContentLoaded` guard** — patrón limpio para el bootstrap.
4. **`document.addEventListener('keydown', ...)` para Escape** — ya está en `detail.jsx`, lo reusamos.
5. **`fetch(...).catch(...)`** para el botón newsletter — POST a `/api/newsletter` que devuelve 501; el cliente muestra "Próximamente". (Alternativa más simple: `alert()` directo, sin red.)

### Funciones a portar desde `design/*.jsx`

| Hoy en JSX | Mañana en behavior.js |
|---|---|
| `useState(country)`, `useState(category)` | leer `<select>` value, re-renderizar feed con `renderFeed()` |
| `useMemo(events filter)` | `filterAlerts(country, category)` puro sobre `window.D360_ALERTS` |
| `onOpen(ev)` | `openDetail(id)`: fetch `/alert/:id?partial=1` o leer JSON in-memory + render template client-side (decisión abajo) |
| `onClose()` | `closeDetail()` |
| `langMode` toggle | `setLangMode(mode)`: cambia clase en root y reescribe textos visibles |
| `useTweaks` | DEV-ONLY, gated detrás de `?dev=1` query string. En prod no se incluye el panel. |
| `navigator.clipboard.writeText` en `Detail` | función `copyQuote(id)`, idéntica |

### Decisión clave: cómo re-renderizar el feed cuando cambia el filtro

Tres opciones:

**A. SSR con `<form>` submit** (más simple, sin JS).
- Cambiar filtro → `form.submit()` → reload con query string → SSR vuelve a renderizar.
- Pro: cero JS para la lógica de feed. Funciona sin JS (a11y).
- Contra: parpadeo en cada cambio. No es UX dashboard moderna.

**B. Client-side render** (lo que hace React hoy).
- behavior.js mantiene una función `renderCardHTML(alert, variant, lang)` que devuelve string HTML.
- `applyFilters()` filtra `window.D360_ALERTS`, vacía y rellena el contenedor `.d360-main__feed`.
- Pro: instantáneo, sin reload.
- Contra: hay que duplicar el HTML de las cards entre Pug (SSR) y JS (re-render).

**C. Hybrid show/hide** (recomendado).
- SSR renderiza **todas** las cards (todas las alertas) ocultas con CSS.
- `applyFilters()` solo agrega/quita la clase `.d360-card--hidden` según matchea.
- Pro: cero duplicación. Pug es la única fuente de HTML. Instantáneo.
- Contra: el DOM trae todas las cards desde el inicio (10-50 cards, no es problema).

**Decisión: C** (hybrid show/hide). Es lo que mejor encaja con "render todo en Pug, JS solo decora", y evita mantener dos versiones del template de card.

Para el detail panel: sin fetch, sin endpoint. Se usa un `<template id="d360-detail-tpl">` único en Pug; el JS lo clona y rellena desde `window.D360_ALERTS`. Ver sección "Template binding pattern" más abajo.

## Estado del dashboard como state machine

| State | Trigger | DOM |
|---|---|---|
| `populated` | server tiene `alerts.length > 0` y ningún filtro filtra todo | feed con cards visibles |
| `empty-filtered` | filtros activos y ninguna card matchea | `.d360-empty--filtered` visible, feed oculto |
| `empty-all` | server tiene `alerts.length === 0` | `.d360-empty--all` visible, feed oculto |
| `loading` | dev tweak only | skeleton |
| `detail-open` | hay `?alert=:id` o el JS abrió uno | añade `.d360-main--detail-open` al `<main>` |

Server determina state inicial. Cliente transiciona entre `populated` y `empty-filtered` aplicando clases. `empty-all` y `loading` no transicionan client-side.

## Alerts contract

El servidor lee `data/alerts.json` con el shape canónico (sección 6 de la nota de Obsidian). Los templates se escriben directo contra este shape; no hay adapter.

```json
{
  "id": "alert_2026-05-21_001",
  "type": "abrupt_change | anomaly",
  "country": "GTM",
  "indicator": {
    "idno": "IPC_IPC_PHASE",
    "database_id": "IPC_IPC",
    "name": { "es": "...", "en": "..." }
  },
  "observation": {
    "value": 4.2,
    "time_period": "2024",
    "unit": "millions",
    "disaggregation": { "SEX": "_T", "AGE": "_T" }
  },
  "narrative_citizen": { "es": "...", "en": "..." },
  "narrative_journalist": { "es": "...", "en": "..." },
  "claim_tokens": [
    { "claim_id": "IPC_IPC_PHASE@GTM@2024", "value": 4.2, "display_es": "4,2 millones", "display_en": "4.2 million" }
  ],
  "verification_trace": {
    "data360_dataset_url": "https://data360.worldbank.org/en/int/dataset/IPC_IPC",
    "csv_link": "https://data360files.worldbank.org/data360-data/data/IPC_IPC/IPC_IPC_PHASE.csv",
    "methodology_ref": "https://www.ipcinfo.org/..."
  },
  "score": 0.87,
  "detected_at": "2026-05-21T16:00:00Z",
  "license": "CC BY-NC-SA 3.0 IGO",

  "chart_series": [
    { "period": "2019", "value": 2.1 },
    { "period": "2020", "value": 2.8 }
  ],
  "magnitude": { "es": "+38%", "en": "+38%" },
  "category": "food_security"
}
```

**Campos canónicos del contrato Obsidian**: hasta `license`.

**Campos derivados que el pipeline debe agregar** para que los templates funcionen sin lógica de presentación en runtime:
- `chart_series`: array de puntos para el sparkline.
- `magnitude`: string formateada bilingüe (delta relativo, σ, pp, etc.).
- `category`: clave del enum de categorías UI (`economy | health | education | environment | labor | poverty | governance | demography | food_security | ...`).
- `indicator.name`, `narrative_*`: objetos `{es, en}`, no strings.

Estos campos se agregan en `bin/emit-alerts.js`, no se calculan en el frontend. Si después se descubre que faltan otros (por ejemplo `regional_avg` para anomalías cross-país), se agregan al schema y se commitea como parte del contrato.

Versionar el schema en `docs/alert-schema.json` (mencionado en la nota de Obsidian como acción inmediata #2).

## Tagline y reglas de copy

Las restricciones del proyecto (memorias `feedback_public_artifacts_english`, `feedback_punctuation_public_texts`):

- Strings públicos: inglés en el repo + español para la UI (toggle).
- Sin em-dashes ni punto y coma en textos públicos. Hay que pasar un linter sobre `config/strings.*.json` antes de cada release.
- Tagline D-006 va literal en home/about/footer: *"Autonomous monitor that detects newsworthy events across the 12,000 indicators of Data360 and delivers them verified to LAC newsrooms."*

## Hosting

- Hetzner (D-012). Mismo entorno que `sociedad-web-front`.
- Port configurable via `D360_PORT` (sociedad usa `SOCIEDAD_PORT`).
- `npm start` con `NODE_ENV=production`. `npm run dev` con file watching.
- Nginx reverse-proxy delante (igual que sociedad). No GeoIP, no rate-limit por país.

## Test scaffold

- `test/run-all-tests.js` con sub-suites `unit` y `server` (patrón sociedad).
- Unit: render de cada mixin con un fixture de alerta, validar HTML output.
- Server: Playwright contra `localhost:8090`, golden path = "abrir dashboard, filtrar por país, abrir detail, copiar cita".
- Lighthouse + axe en S4 (semana de pulido).

## Decisiones cerradas (2026-05-21)

1. **Shape canónico, no adapter.** Templates se escriben directo contra el contrato definido en Obsidian (`id`, `type`, `country`, `indicator.{idno,database_id,name}`, `observation.{value,time_period,unit,disaggregation}`, `narrative_citizen`, `narrative_journalist`, `verification_trace.{data360_dataset_url,csv_link,methodology_ref}`, `claim_tokens`, `score`, `detected_at`, `license`). Si después hacen falta campos del prototipo (serie histórica para charts, magnitude formateada, etc.), se agregan al schema canónico antes de generar `alerts.json`, no se traducen en runtime.

2. **Charts: SVG inline a mano.** Mixin Pug `+chart(series, lang)` emite un sparkline con axis, change-point marker y promedio regional cuando aplique. Sin D3 ni librerías. Series vienen como array `[{period, value}, ...]` en `alerts.json` (campo a agregar al schema canónico).

3. **URL refleja filtros.** SSR respeta `?country=GTM&category=health&lang=es&alert=alert_xxx`. Cliente sincroniza con `history.replaceState` cuando cambia un select o se abre/cierra el detail. Permite compartir feeds filtrados y deep-link a un evento puntual.

4. **Sin fetch en runtime.** Todo `data/alerts.json` se serializa en `window.D360_ALERTS` inline al primer paint. El detail panel se renderiza client-side desde el JSON en memoria; no existe endpoint `/alert/:id`. Para no duplicar HTML entre Pug y JS, se usa el patrón `<template>` descripto abajo.

5. **Newsletter botón: `alert()` directo.** Sin endpoint, sin log. Texto sale de `_("newsletter.coming_soon", lang)`.

6. **CSS reescrito desde cero, simplificado.** No copiar literalmente `ds-tokens.css`/`styles.css`/`styles-feed.css`. Reescribir usando solo las clases que efectivamente emiten los mixins Pug, manteniendo el lenguaje visual del prototipo. Después comparación visual contra `Data360 Monitor.html` y ajuste. Los archivos viejos quedan en `design/` solo como referencia.

7. **`design/Data360 Monitor.zip`**: ignorado.

## Implicaciones de "sin fetch"

- **Tamaño del JSON inline**: con 10 alertas × ~3KB cada una (narrativa + serie + metadata) ≈ 30KB. Aceptable. Si crece a 50+ alertas con series largas, evaluar fetch lazy de las series. Por ahora no.
- **Bootstrap order**:
  1. `<head>` carga CSS.
  2. Body llega con SSR del feed completo (cards visibles según filtros del query string).
  3. `<script>` inline define `window.D360_ALERTS`, `window.D360_T`, `window.D360_LANG`, `window.D360_FILTERS`.
  4. `<script src="/static/js/behavior.js">` al final del body.
  5. `DOMContentLoaded` → `initializeBehavior()` ata listeners, lee `?alert=` si existe, abre detail.
- **`lib/views.js` solo expone `dashboardPage` y `aboutPage`.** El detail no es ruta, es un estado del dashboard.
- **Deep link sin JS**: degrada a feed filtrado, sin detail abierto. Aceptable para demo.

## Template binding pattern para el detail panel

`templates/dashboard.pug` incluye, antes del cierre del body, un `<template>` con la estructura del panel y `data-bind` en cada slot:

```pug
template#d360-detail-tpl
  aside.d360-detail(role="dialog" aria-modal="true")
    button.d360-detail__close(aria-label="Close")
      // svg close icon inline
    header.d360-detail__head
      div.d360-detail__metaL
        span.d360-country(data-bind="country")
        span.d360-card__divider ·
        span.d360-detail__cat(data-bind="category")
        span.d360-card__divider ·
        span.d360-typechip(data-bind="type")
      h2.d360-detail__title(data-bind="indicator.name")
      div.d360-detail__sub(data-bind="indicator.dataset")
      div.d360-detail__numblock
        span.d360-detail__num(data-bind="observation.value")
        span(data-bind="verification_mark")
        span(data-bind="magnitude")
        span.d360-detail__period(data-bind="observation.time_period")
    section.d360-detail__chart(data-bind="chart")
    section.d360-detail__narratives
      div.d360-narrblock--citizen(data-bind="narrative_citizen")
      div.d360-narrblock--journalist(data-bind="narrative_journalist")
    section.d360-detail__trace(data-bind="verification_trace")
    section.d360-detail__meta(data-bind="metadata")
    div.d360-detail__footer
      button.d360-copy(data-bind="copy_button")
```

`behavior.js`:

```js
function openDetail(alertId) {
  const alert = window.D360_ALERTS.find(a => a.id === alertId);
  if (!alert) return;
  const tpl = document.getElementById('d360-detail-tpl');
  const node = tpl.content.cloneNode(true);
  renderBindings(node, alert, window.D360_LANG);
  document.querySelector('.d360-main').appendChild(node);
  document.querySelector('.d360-main').classList.add('d360-main--detail-open');
  updateQueryParam('alert', alertId);
  document.addEventListener('keydown', escToCloseDetail);
}
```

`renderBindings(node, alert, lang)` recorre los `[data-bind]` y aplica un switch:

- Campos simples (`indicator.name`, `observation.time_period`) → `el.textContent = path(alert, key)`.
- Campos compuestos (`country`, `magnitude`, `type`, `verification_mark`) → construyen su sub-DOM (icono + texto + clase de color).
- `chart` → construye SVG inline desde `alert.chart_series`.
- `narrative_citizen` / `narrative_journalist` → texto + wrapping de `claim_tokens` en `<span class="d360-claim">` para mostrar la verification mark inline.
- `verification_trace` / `metadata` → listas, iteran sobre los campos del objeto.
- `copy_button` → atado a `copyQuote(alertId)`.

Una sola función ~100 líneas. Sin duplicación de HTML.

Lo mismo aplicaría a las cards si quisiéramos render client-side, pero como las cards van SSR (hybrid show/hide), no hace falta `<template>` para ellas.

## Implementation order

1. **Scaffold**: `package.json`, `data360-monitor.js`, `lib/router.js` minimal (adaptado de sociedad), `lib/views.js` con `dashboardPage` que renderice "hello".
2. **Schema**: `docs/alert-schema.json` con el shape canónico + campos derivados. Fixture `data/alerts.fixture.json` con 5-6 alertas inventadas para desarrollo.
3. **i18n**: `lib/i18n.js` + `config/strings.{es,en}.json` extraídos de `design/data.js` `T.es` y `T.en`.
4. **CSS reescrito desde cero**: `static/css/tokens.css` (colores, tipografías, spacing) + `static/css/main.css` (layout, cards, detail, controls). Sin copia literal de `design/`.
5. **Layout + dashboard shell**: `templates/layout.pug` con head, scripts, `window.D360_*` inline. `templates/dashboard.pug` con header (filtros + lang toggle) y main vacío.
6. **Mixins base**: `countryTag`, `typeChip`, `magnitude`, `verificationMark`, `chart` (SVG inline). Render con fixture, validar visualmente contra `Data360 Monitor.html`.
7. **Cards**: `+cardNarrative`, `+cardNumber`, `+cardNewspaper`, `+feed`. SSR todas las cards visibles, variante elegida vía clase en el `<body>`.
8. **Detail panel**: `<template id="d360-detail-tpl">` en `dashboard.pug` + `renderBindings()` en `behavior.js`. Validar abrir/cerrar y rellenado de cada campo.
9. **behavior.js completo**: filtros hybrid show/hide, lang toggle, copy quote, Escape, `?alert=` deep link, sincronización `history.replaceState`.
10. **Pipeline integration**: cuando Fer entregue `data/alerts.json` real, swap el fixture. Si falta algún campo derivado, agregarlo en `bin/emit-alerts.js`.
11. **QA**: Playwright golden path, Lighthouse, linter de em-dashes/punto y coma sobre `strings.*.json`, comparación visual final contra `design/`.

Estimado: 3-4 días (semana S3 del roadmap, 20-26 mayo).
