# Frontend Architecture Specification: Data360 News Agent

This document defines the structural, functional, and layout architecture of the frontend for the `abrimos-data360-monitor` web application (**Data360 News Agent**).

---

## 1. Core Architecture Goals

1. **Aesthetic Excellence & Premium Visuals**: Render a highly polished, responsive dashboard with two content types (Noticia and Reportaje) rendered through distinct card variants — `+cardNewspaper` for Noticia, `+cardReportaje` (wider, `grid-column: span 2`) for Reportaje — plus the historical Narrative/Number/Newspaper layout variants, an interactive analytics sidebar drawer, live sparkline trend charts, and clear verification marks.
2. **Deterministic Data Consumption**: Load all detected events from a precomputed `data/alerts.json` produced by the data processing pipeline into the client window space on page paint.
3. **High-Performance Architecture**: Built as a standalone Node.js and CommonJS web app utilizing server-side Pug templates, direct vanilla JavaScript UI routines, and unified vanilla CSS variables for immediate responsiveness. No complex frameworks, Express wrappers, or heavy client build steps are utilized. Visual theme follows `design/v2` via `static/css/wb-theme.css` (World Bank palette, Open Sans + Lora); the React files in `design/v2/` are reference-only.
4. **Immediate Client-Side Responsiveness**: Perform visual card filtering in the browser using hybrid DOM toggles to achieve zero-latency updates without roundtrip server calls.

---

## 2. Directory Layout

The frontend components are cleanly integrated into the standalone workspace:

```
data360/
├── data360-monitor.js     # Standalone HTTP web server entrypoint
├── package.json           # Standalone dependencies and build scripts
├── config/
│   ├── routes.json        # Unified routes configuration mapping paths to views
│   ├── strings.es.json    # Spanish translation key-value mappings
│   ├── strings.en.json    # English translation key-value mappings
│   └── chat-presets.json  # Chat preset prompts
├── lib/
│   ├── router.js          # HTTP router and static asset handler
│   ├── views.js           # Server-side compilers (dashboard, chat, about)
│   ├── i18n.js            # Bilingual string resolver
│   ├── alerts-store.js    # In-memory alerts parser and hot-reloader
│   ├── alerts-api.js      # GET /api/alerts JSON handler
│   └── chat/              # SSE agent, tools, focus countries
├── templates/
│   ├── layout.pug         # Base HTML5 shell (nav, onboarding, newsletter modal)
│   ├── dashboard.pug      # Monitor feed + filters
│   ├── chat.pug           # Chat UI
│   ├── about.pug          # About page
│   ├── mixins.pug         # Reusable Pug components (tags, chips, charts)
│   ├── cards.pug          # Card format helpers
│   └── partials/          # site-nav, detail-panel, onboarding, chat-freshness
├── static/
│   ├── css/
│   │   ├── tokens.css
│   │   └── main.css
│   ├── js/
│   │   ├── behavior.js        # Monitor filters, URL sync
│   │   ├── detail-panel.js    # Side drawer + PCN claim resolution
│   │   ├── charts.js          # Sparkline SVG renderer
│   │   ├── alerts-feed.js     # Merge chat alerts into monitor feed
│   │   ├── chat.js            # SSE chat client (global /chat)
│   │   ├── alert-chat.js      # Scoped chat on article pages (sessionStorage restore)
│   │   ├── chat-turn-ui.js    # Shared SSE turn UI (activity, trace, markdown)
│   │   ├── alert-page.js      # Article page: story PCN, sparklines, chat init
│   │   ├── data360-urls.js    # indicatorUrl() → /en/indicator/{IDNO}
│   │   ├── pcn-claims.js      # Client-side PCN claim markers
│   │   ├── chat-cards.js      # Inline alert cards in chat
│   │   ├── markdown.js        # Markdown + sparkline blocks
│   │   ├── onboarding.js      # First-visit welcome modal
│   │   └── lang-toggle.js     # ES / EN switcher
│   └── vendor/
│       └── marked.min.js
```

---

## 3. Server Lifecycle & Routing

### Lifecycle
1. The server loads configurations from `.env` and boots the application.
2. The `lib/i18n.js` module parses bilingual localization sheets.
3. The `lib/alerts-store.js` engine reads the precompiled `data/alerts.json` payload, mapping it to local arrays.
4. File change hooks trigger cache invalidation: updates to Pug templates, strings, or alerts automatically refresh the in-memory store.
5. In production mode, the server initializes on a configured port (default `8090`) driving `http.createServer`. In development mode, integrated watchers track files for instant dev feedback.

### Routing
Driven by `config/routes.json` via `lib/route-registry.js`, plus explicit API routes in `lib/router.js`:

* `/`: Country picker + hero; links to five country front pages.
* `/{countrySlug}`: Country front page (reportajes, headlines, indicator ticker).
* `/indicador/{idno}`: Indicator detail hub page.
* `/{country}/{tipo}/{slug}/{id}`: Article page — noticia/reportaje with scoped chat.
* `/chat`, `/about`, `/indicadores`, `/metodologia`, `/privacidad`, `/terminos`, `/uso`: Static pages.
* `/newsletter`, `/newsletter/lac/{date}`: Newsletter preview (fixture editions).
* `/alertas/{countrySlug}/ejemplo`: Indicator-alerts subscription preview.
* `/dev/feed`: Legacy card feed (dev-only).
* `POST /api/subscribe`: Append subscription to local TSV.
* `GET /api/alerts`, `POST /api/chat`: JSON/SSE APIs.
* Fallback: `notFoundPage` for unmatched paths.
* `/static/*`: CSS, JS, vendor assets with cache-control headers.

---

## 4. Templating & Component Design

### Layout Context
The `templates/layout.pug` provides the base HTML shell on every page. Monitor-specific globals are injected from `dashboard.pug` / `chat.pug` in their `block scripts`:

```pug
// layout.pug (all pages)
script.
  window.D360_LANG = !{JSON.stringify(lang)};
  window.D360_LANG_MODE = !{JSON.stringify(langMode || lang)};
  window.D360_STRINGS = { es: !{JSON.stringify(stringsEs)}, en: !{JSON.stringify(stringsEn)} };

// layout.pug — all pages (defer)
// script(src="/static/js/data360-urls.js")

// dashboard.pug (monitor only)
script.
  window.D360_ALERTS = !{JSON.stringify(allAlerts)};
  window.D360_FILTERS = !{JSON.stringify(filters)};
```

The language toggle switches **ES or EN** (`?lang=es|en`). Narratives in `data/alerts.json` store both languages; the UI renders **one language at a time** (no simultaneous bilingual card layout).

> [!IMPORTANT]
> Always use Pug's unescaped string injection `!{JSON.stringify(...)}` instead of standard text interpolation to ensure strings containing apostrophes or quotes parse successfully without syntax errors.

### Pug Mixins
Dynamic UI components are compiled server-side into lightweight HTML:
* `+countryTag(iso3)`: Renders a standardized, localized geographical label.
* `+typeChip(type)`: Draws a visual status chip for abrupt changes vs. cross-country anomalies.
* `+contentTypeBadge(contentType)`: Renders a Noticia or Reportaje badge on the card head.
* `+cardNewspaper(alert)`: Card variant for **Noticia** content. Standard grid cell.
* `+cardReportaje(alert)`: Card variant for **Reportaje** content. Spans two grid columns (`grid-column: span 2`) to make the dataset-level synthesis visually distinct.
* `+magnitude(val)`: Renders color-coded arrows or delta percentages.
* `+chart(chartData)`: Emits a pure, standalone vector **SVG Sparkline** with change-point indicators, completely eliminating heavy external charting libraries.

### In-Memory Feed Filtering (Hybrid Toggling)
Rather than executing expensive server queries or running redundant JavaScript rendering steps, the layout compiles **every alert card** inside the SSR feed.

When a user switches filters (e.g., changing country, category, or content type), the client JavaScript loops through the cards and toggles a `.d360-card--hidden` class based on matches:

```js
function applyFilters() {
  const country = document.getElementById('d360-filter-country').value;
  const category = document.getElementById('d360-filter-category').value;
  const contentType = document.getElementById('d360-filter-content-type').value;

  let visibleCount = 0;
  document.querySelectorAll('.d360-card').forEach(card => {
    const cMatch = country === 'ALL' || card.dataset.country === country;
    const catMatch = category === 'ALL' || card.dataset.category === category;
    const ctMatch = contentType === 'ALL' || card.dataset.contentType === contentType;

    if (cMatch && catMatch && ctMatch) {
      card.classList.remove('d360-card--hidden');
      visibleCount++;
    } else {
      card.classList.add('d360-card--hidden');
    }
  });

  document.getElementById('d360-event-count').textContent = visibleCount;
}
```
This achieves `0ms` response times for a smooth user experience.

---

## 5. Sidebar Detail Drawer & Template Binding

The detail drawer template lives in `templates/partials/detail-panel.pug` and is included from `dashboard.pug` (and reused by chat alert cards via `detail-panel.js`):

```pug
template#d360-detail-tpl
  aside.d360-detail(role="dialog" aria-modal="true")
    button.d360-detail__close(type="button" aria-label="Close")
      // inline close SVG icon
    div.d360-detail__head
      div.d360-detail__metaL
        span(data-bind="countryTag")
        span.d360-card__divider ·
        span(data-bind="category")
        span.d360-card__divider ·
        span(data-bind="typeChip")
      h2.d360-detail__title(data-bind="title")
      div.d360-detail__sub(data-bind="idno")
      div.d360-detail__numblock
        span.d360-detail__num(data-bind="value")
        span.d360-detail__period(data-bind="period")
        span(data-bind="magnitude")
    div.d360-detail__section
      div.d360-detail__seclabel Historical trend
      div(data-bind="chart")
    div.d360-detail__section
      div.d360-detail__seclabel Analysis
      p.d360-narr.d360-narr--citizen(data-bind="narrativeCitizen")
      p.d360-narr.d360-narr--journalist(data-bind="narrativeJournalist")
    div.d360-detail__section
      div.d360-detail__seclabel Sources
      ul.d360-trace(data-bind="trace")
    div.d360-detail__section
      div.d360-detail__seclabel Details
      dl.d360-meta(data-bind="meta")
    div.d360-detail__footer
      button.d360-copy.d360-detail__copy-btn(type="button") Copy quote
      span.d360-copy__preview(data-bind="copyPreview")
```

When a user clicks a feed card, the client-side JavaScript clones this template node, executes a simple `renderBindings(node, alert, lang)` to fill simple text nodes and SVGs, pushes it into the DOM, and fires the sliding animation:

```js
function openDetail(alertId) {
  const alert = window.D360_ALERTS.find(a => a.id === alertId);
  if (!alert) return;
  
  // Close any open drawer
  closeDetail();
  
  const tpl = document.getElementById('d360-detail-tpl');
  const clone = tpl.content.cloneNode(true);
  
  // Populate the clone
  populateDetailBindings(clone, alert);
  
  document.querySelector('.d360-main').appendChild(clone);
  document.querySelector('.d360-main').classList.add('d360-main--detail-open');
}
```

---

## 6. Bilingual Translations & i18n Engine

The localization subsystem (`lib/i18n.js`) parses `strings.es.json` and `strings.en.json` to resolve localized phrases. 

Dynamic content is pre-translated and stored directly inside the alert JSON schema:
* `alert.title.es` / `alert.title.en`
* `alert.lead.es` / `alert.lead.en`
* `alert.story.es` / `alert.story.en`

The active display language is managed via standard styling tags on the global app element (e.g. `d360-app--lang-es` vs `d360-app--lang-en`). Alert JSON always carries `es` and `en` text; filters and chrome follow the selected UI language. `lib/alerts-store.js` `normalizeItem` reads `ev.lead?.[langKey]` and `ev.title?.[langKey]` directly so the active language drives the rendered lead/title — there is no Spanish-by-default hardcoding.

### Onboarding

`templates/partials/onboarding.pug` + `static/js/onboarding.js`: modal on first visit (`localStorage` key `d360_onboarding_seen`), dismissible, CTAs to Home / About. Introduces **Data360 News Agent** as an AI news agency. Force with `?onboarding=1`.

---

## 7. Canonical Alert JSON Schema

The frontend components parse a robust, schema-compliant JSON format from `data/alerts.json`. The feed mixes two content types — **Noticia** (per indicator) and **Reportaje** (per dataset, synthesised from multiple Noticias). Both share the core shape below; Reportajes additionally carry `content_type: "reportaje"`, a `dataset_id`, a longer bilingual `story`, and reuse the `claim_id`s of the Noticias they synthesise. The full per-content-type contract lives in [`docs/alert-schema.json`](alert-schema.json).

Example (Noticia):

```json
{
  "content_type": "noticia",
  "id": "alert_2026-05-21_001",
  "countries": ["ARG"],
  "dataset_id": "FAO_CP",
  "title": {
    "es": "Inflación en Argentina alcanza un nuevo máximo",
    "en": "Argentina inflation reaches a new high"
  },
  "lead": {
    "es": "Los precios al consumidor se aceleraron en el último período observado…",
    "en": "Consumer prices accelerated in the latest observed period…"
  },
  "story": {
    "es": "…",
    "en": "…"
  },
  "indicator": {
    "idno": "FAO_CP_23012",
    "database_id": "FAO_CP",
    "name": {
      "es": "Índice de Precios al Consumidor, Índices Generales",
      "en": "Consumer Prices, General Indices (2015 = 100)"
    }
  },
  "observation": {
    "value": 11322.289801,
    "time_period": "2025-09-01",
    "unit": "index"
  },
  "claim_tokens": [
    {
      "claim_id": "FAO_CP_23012@ARG@2025-09-01",
      "value": 11322.289801,
      "display_es": "11322,29",
      "display_en": "11322.29"
    }
  ],
  "verification_trace": {
    "data360_dataset_url": "https://data360.worldbank.org/en/int/dataset/FAO_CP",
    "csv_link": "https://data360files.worldbank.org/data360-data/data/FAO_CP/FAO_CP_23012.csv",
    "methodology_ref": "https://www.fao.org"
  },
  "score": 0.78,
  "detected_at": "2026-05-21T14:32:00Z",
  "license": "CC BY-4.0",
  "chart_series": [
    { "period": "2020-01-01", "value": 100.0 },
    { "period": "2025-09-01", "value": 11322.289801 }
  ],
  "magnitude": "+2.1σ",
  "category": "economy"
}
```
This self-contained structure ensures that frontend layout renderers never need to compute raw mathematical averages, parse dirty indicators, or guess categories at runtime, maximizing speed and client render stability.
