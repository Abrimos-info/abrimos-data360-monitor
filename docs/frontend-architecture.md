# Frontend Architecture Specification: Data360 Monitor

This document defines the structural, functional, and layout architecture of the frontend dashboard for the `abrimos-data360-monitor` web application.

---

## 1. Core Architecture Goals

1. **Aesthetic Excellence & Premium Visuals**: Render a highly polished, responsive dashboard with three card layouts (Narrative-forward, Number-highlight, and Newspaper format), an interactive analytics sidebar drawer, live sparkline trend charts, and clear verification marks.
2. **Deterministic Data Consumption**: Load all detected events from a precomputed `data/alerts.json` produced by the data processing pipeline into the client window space on page paint.
3. **High-Performance Architecture**: Built as a standalone Node.js and CommonJS web app utilizing server-side Pug templates, direct vanilla JavaScript UI routines, and unified vanilla CSS variables for immediate responsiveness. No complex frameworks, Express wrappers, or heavy client build steps are utilized.
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
│   └── strings.en.json    # English translation key-value mappings
├── lib/
│   ├── router.js          # Fast, custom HTTP router and static asset minifier
│   ├── views.js           # Server-side route compilers for dashboard/about views
│   ├── i18n.js            # Standalone bilingual string resolver
│   └── alerts-store.js    # In-memory alerts parser and hot-reloader
├── templates/
│   ├── layout.pug         # Base HTML5 shell with global head assets
│   ├── dashboard.pug      # Main view containing feed listings and detail drawer templates
│   ├── mixins.pug         # Dynamic reusable Pug components (Tags, Chips, Charts)
│   └── cards.pug          # Sub-templates compiling the card formats (narr, num, news)
├── static/
│   ├── css/
│   │   ├── tokens.css      # Core style guides (harmonized HSL colors, typography, spacing)
│   │   └── main.css        # Clean grid layout, card designs, drawer positioning, and controls
│   └── js/
│       └── behavior.js     # Vanilla JS controlling interactive states and drawers
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
Driven by a structured route manifest (`config/routes.json`):
* `/`: Resolves to the compiled HTML of `dashboard.pug`, loading the SSR-rendered alert grid populated with filters and cards.
* `/static/*`: Resolves static assets (minified vanilla CSS, JS behavior files, image resources) using standard cache-control headers.
* `/about`: Serves a clean, descriptive stand-alone information page.

---

## 4. Templating & Component Design

### Layout Context
The `templates/layout.pug` provides the base HTML shell. It takes dynamic arguments populated by the view controller and registers them directly into the document window context:

```pug
script.
  window.D360_ALERTS = !{JSON.stringify(allAlerts)};
  window.D360_T = { es: !{JSON.stringify(stringsEs)}, en: !{JSON.stringify(stringsEn)} };
  window.D360_LANG = !{JSON.stringify(lang)};
  window.D360_LANG_MODE = !{JSON.stringify(langMode)};
  window.D360_FILTERS = !{JSON.stringify(filters)};
```

> [!IMPORTANT]
> Always use Pug's unescaped string injection `!{JSON.stringify(...)}` instead of standard text interpolation to ensure strings containing apostrophes or quotes parse successfully without syntax errors.

### Pug Mixins
Dynamic UI components are compiled server-side into lightweight HTML:
* `+countryTag(iso3)`: Renders a standardized, localized geographical label.
* `+typeChip(type)`: Draws a visual status chip for abrupt changes vs. cross-country anomalies.
* `+magnitude(val)`: Renders color-coded arrows or delta percentages.
* `+chart(chartData)`: Emits a pure, standalone vector **SVG Sparkline** with change-point indicators, completely eliminating heavy external charting libraries.

### In-Memory Feed Filtering (Hybrid Toggling)
Rather than executing expensive server queries or running redundant JavaScript rendering steps, the layout compiles **every alert card** inside the SSR feed.

When a user switches filters (e.g., changing country or category), the client JavaScript loops through the cards and toggles a `.d360-card--hidden` class based on matches:

```js
function applyFilters() {
  const country = document.getElementById('d360-filter-country').value;
  const category = document.getElementById('d360-filter-category').value;
  
  let visibleCount = 0;
  document.querySelectorAll('.d360-card').forEach(card => {
    const cMatch = country === 'ALL' || card.dataset.country === country;
    const catMatch = category === 'ALL' || card.dataset.category === category;
    
    if (cMatch && catMatch) {
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

To maintain dry, centralized code, the side analytics drawer is defined exactly once in `dashboard.pug` inside an HTML5 `<template>` element with `data-bind` target attributes:

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

Dynamic page narratives (citizen and journalist copies) are pre-translated and stored directly inside the alert JSON schema:
* `alert.narrative_citizen.es` and `alert.narrative_citizen.en`
* `alert.narrative_journalist.es` and `alert.narrative_journalist.en`

The active display language is managed via standard styling tags on the global app element (e.g. `d360-app--lang-es` vs `d360-app--lang-en`).

---

## 7. Canonical Alert JSON Schema

The frontend components parse a robust, schema-compliant JSON format from `data/alerts.json`. Each entry implements the following strict layout:

```json
{
  "id": "alert_2026-05-21_001",
  "type": "abrupt_change",
  "country": "ARG",
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
    "unit": "index",
    "disaggregation": { "SEX": "_T", "AGE": "_T" }
  },
  "narrative_citizen": {
    "es": "Argentina registró 11322.29 en Índices de Precios al Consumidor...",
    "en": "Argentina recorded 11322.29 in Consumer Prices, General Indices..."
  },
  "narrative_journalist": {
    "es": "Detección automática: Argentina 11322.29 (2025-09-01). z-score +2.1σ...",
    "en": "Auto-detected: Argentina 11322.29 (2025-09-01). z-score +2.1σ against baseline."
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
  "score": 2.14,
  "detected_at": "2026-05-21T14:32:00Z",
  "license": "CC BY-4.0",
  "chart_series": [
    { "period": "2020-01-01", "value": 100.0 },
    { "period": "2025-09-01", "value": 11322.289801 }
  ],
  "magnitude": {
    "es": "+2.1σ",
    "en": "+2.1σ"
  },
  "category": "economy"
}
```
This self-contained structure ensures that frontend layout renderers never need to compute raw mathematical averages, parse dirty indicators, or guess categories at runtime, maximizing speed and client render stability.
