# Frontend Architecture Specification: Data360 News Agent

This document defines the structural, functional, and layout architecture of the frontend for the `abrimos-data360-monitor` web application (**Data360 News Agent**).

> Last updated: 2026-05-29.

---

## 1. Core Architecture Goals

1. **Newspaper UX**: Country front pages with hero reportaje, interleaved headlines, and indicator ticker; full article pages with scoped chat FAB.
2. **Deterministic Data Consumption**: Alerts from precomputed `data/alerts.json` injected at SSR where needed; article paths from `lib/url-slug.js`.
3. **High-Performance Architecture**: Node.js + Pug + vanilla JS + CSS variables. No client bundler. Theme: World Bank palette v2 via `static/css/wb-theme.css`, chrome in `wb-chrome.css`, app layout in `main.css`. React files in `design/v2/` are reference-only.
4. **Legacy feed**: Card grid with client-side filters remains at `/dev/feed` and `?legacy=1` for debugging and power users.

---

## 2. Directory Layout

```
data360/
├── data360-monitor.js     # HTTP server entrypoint
├── config/
│   ├── routes.json        # viewName routing
│   ├── strings.es.json    # UI i18n (Spanish)
│   ├── strings.en.json    # UI i18n (English)
│   ├── copy/              # Static legal/prose JSON (privacidad, terminos, …)
│   └── chat-presets.json
├── lib/
│   ├── router.js
│   ├── route-registry.js
│   ├── views.js           # All page handlers
│   ├── pages/static-pages.js
│   ├── static-copy.js
│   ├── url-slug.js
│   ├── subscribe.js
│   ├── newsletter/editions.js
│   ├── i18n.js
│   ├── alerts-store.js
│   └── chat/
├── templates/
│   ├── layout.pug         # Shell: nav, onboarding, newsletter modal
│   ├── country-picker.pug
│   ├── frontpage.pug      # Primary country home
│   ├── alert-page.pug     # Article + chat
│   ├── indicators-hub.pug
│   ├── indicator-page.pug
│   ├── newsletter-edition.pug
│   ├── static-prose.pug
│   ├── dashboard.pug      # Legacy feed
│   ├── chat.pug
│   ├── about.pug
│   ├── mixins.pug
│   ├── cards.pug
│   └── partials/
│       ├── wb-header.pug, wb-nav.pug, wb-footer.pug
│       ├── site-nav.pug
│       ├── detail-panel.pug
│       ├── floating-chat.pug
│       ├── alert-chat.pug
│       ├── article-footer.pug
│       ├── newsletter-modal.pug
│       ├── onboarding.pug
│       └── chat-freshness.pug
├── static/
│   ├── css/
│   │   ├── wb-theme.css
│   │   ├── wb-chrome.css
│   │   └── main.css
│   └── js/
│       ├── alert-page.js
│       ├── alert-chat.js
│       ├── floating-chat.js
│       ├── chat-turn-ui.js
│       ├── country-menu.js
│       ├── newsletter-modal.js
│       ├── behavior.js        # Legacy feed filters
│       ├── detail-panel.js
│       ├── charts.js
│       ├── alerts-feed.js
│       ├── chat.js
│       ├── markdown.js
│       ├── onboarding.js
│       └── lang-toggle.js
```

---

## 3. Server Lifecycle & Routing

### Lifecycle

1. Load `.env`, boot `data360-monitor.js`.
2. Parse `strings.*` via `lib/i18n.js`; static pages load `config/copy/` via `lib/static-copy.js`.
3. `lib/alerts-store.js` reads `data/alerts.json`, enriches display fields and `_path`.
4. Chokidar invalidates templates, strings, copy, alerts in development.

### Routing (`config/routes.json`)

| Path | Handler |
|------|---------|
| `/` | Country picker |
| `/{countrySlug}` | Front page (`frontpage.pug`) |
| `/{country}/{tipo}/{y}/{m}/{slug}` | Article (`alert-page.pug`) |
| `/indicadores`, `/indicators` | Indicators hub |
| `/indicador/{idno}` | Indicator detail |
| `/chat`, `/about` | Chat, About |
| `/metodologia`, `/privacidad`, `/terminos`, `/uso` | Static prose |
| `/newsletter` | Redirect to latest LAC edition |
| `/newsletter/lac/{date}` | Newsletter HTML |
| `/alertas/{country}/ejemplo` | Alerts subscription preview |
| `/dev/feed` | Legacy dashboard |
| `?legacy=1` on country page | Same legacy dashboard |
| `/?alert={id}` on `/` | Redirect to article `_path` |
| `POST /api/subscribe` | Subscription TSV append |
| `GET /api/alerts`, `POST /api/chat` | JSON / SSE |
| `/static/*` | Assets |

---

## 4. Templating & Components

### Layout globals

```pug
// layout.pug — all pages
script.
  window.D360_LANG = !{JSON.stringify(lang)};
  window.D360_STRINGS = { es: !{JSON.stringify(stringsEs)}, en: !{JSON.stringify(stringsEn)} };

// dashboard.pug only (legacy)
script.
  window.D360_ALERTS = !{JSON.stringify(allAlerts)};
  window.D360_FILTERS = !{JSON.stringify(filters)};
```

Language: ES or EN via `?lang=`. One narrative language at a time.

### Key mixins (`mixins.pug`, `cards.pug`)

- `+contentTypeBadge`, `+countryTag`, `+typeChip`, `+chart`
- `+cardNewspaper`, `+cardReportaje` (legacy feed)

### Front page (`frontpage.pug`)

Server-rendered hero, headline list, indicator ticker with inline sparklines. No client-side filter loop.

### Legacy feed filtering (`behavior.js`)

Hybrid CSS toggle on `.d360-card--hidden` for country, category, content_type, variant — only on `dashboard.pug`.

---

## 5. Article page & scoped chat

- **Template**: `alert-page.pug` — story, PCN narrative, sparkline, verification, `article-footer.pug`.
- **Chat FAB**: `floating-chat.pug` with `d360-floating-chat--scoped`; opens panel with `alert-chat.pug` presets.
- **JS**: `D360Chat.initScoped` pattern via `floating-chat.js` + `alert-chat.js` + shared `chat-turn-ui.js`.
- **Persistence**: `sessionStorage` keyed by `alert_id` (markdown, tool trace, sparkline cache).
- **Context**: generation markdown from `data/analyses/{IDNO}.md` capped by `CHAT_GENERATION_CONTEXT_MAX_CHARS`.

---

## 6. Newsletter modal

Included from `layout.pug` on all pages. `newsletter-modal.js` handles open/close, type toggle (`newsletter_lac` vs `indicator_alerts`), country/topic filters, `fetch('/api/subscribe')`, success preview link.

---

## 7. Detail drawer (legacy)

`detail-panel.pug` + `detail-panel.js` — used by legacy dashboard and chat inline cards. Article pages use full-page layout instead.

---

## 8. Alert JSON schema

See [`docs/alert-schema.json`](alert-schema.json). Frontend reads bilingual `title`, `lead`, `story` by active `lang`. Reportajes span wider in legacy grid; front page uses hero + list layout.

---

## Related docs

- [User guide](./user-guide.md)
- [Features reference](./features-reference.md)
