# Refactor Opportunities

> Analysis of structural issues and duplication in the current codebase. Not scheduled — evaluate before or after the 2026-05-31 deadline depending on scope.

## Quick wins (low effort, zero behavior change)

### 1. `lib/paths.js` — centralize directory constants

`REPO_ROOT`, `ALERTS_DIR`, and `ANALYSES_DIR` are re-derived independently in at least four files:

- `lib/analysis/runner.js:31-34`
- `lib/analysis/reportaje-runner.js:17-18`
- `lib/context-fetch.js` (inline)
- `bin/fetch-data.js:33`

Extract to a single `lib/paths.js` module and import everywhere.

### 2. `lib/file-utils.js` — deduplicate filesystem helpers

Seven instances of `fs.mkdirSync(..., { recursive: true })` across the codebase. `runner.js:44` defines `ensureDir()` but does not export it. Five additional instances of JSON read-with-fallback (`JSON.parse(fs.readFileSync(...))` in a try/catch) are reimplemented independently.

Extract:

```js
ensureDir(dir)
readJsonSafe(filepath, defaultValue)
writeJson(filepath, data)
```

### 3. `lib/config.js` — single source for env-based settings

Some thresholds are read from `process.env` (`runner.js:28-29`, `context-builder.js:23-24`), others are hardcoded (`quality-validator.js:35`: `STORY_MIN_LEN = 200`, `ai-client.js:44-46`). No single source of truth.

---

## Medium impact, medium effort

### 4. Split `lib/analysis/runner.js` (475 lines)

Two functions are doing too much:

- `processOneIndicator()` (lines 235-343, 109 lines): mixes LLM call, translation, validation, and caching.
- `runAnalysis()` (lines 374-466, 93 lines): mixes detection, filtering, and orchestration.

Suggested extraction:
- `enrichNoticiasWithTranslation()` from lines 300-315
- `validateAndAnnotateAlert()` from lines 316-333
- Optionally move orchestration logic to `lib/analysis/orchestrator.js`

### 5. `lib/analysis/prompt-builder.js` — unify three parallel builders

Three functions manually assemble identical `[{ role, content }]` arrays by reading `.md` files:

- `runner.js:128` (`buildLlmPrompt`)
- `reportaje-runner.js:82` (`buildReportajePrompt`)
- `noticia-translate.js:20` (`buildTranslatePrompt`)

A shared builder reduces the pattern to a single implementation.

### 6. Merge bilingual check

`alert-extractor.js:130` (`ensureBilingual`) and `quality-validator.js:37` (`checkBilingual`) implement the same check independently. One should import the other, or both should import from a shared `lib/analysis/normalizers.js`.

### 7. Country initialization helper

`for (const country of COUNTRIES) { obj[country] = ... }` appears seven times across `runner.js` (3x) and `context-builder.js` (4x). Extract to `initCountryMap(initialValueFn)`.

---

## Lower priority

### 8. Standardize LLM error handling

Three different recovery strategies for LLM failures:

- `runner.js:278` — logs warning, returns empty array
- `reportaje-runner.js:221` — tracks failure count, continues
- `noticia-translate.js:71` — returns original noticia unchanged

A shared `callLlmWithFallback(messages, opts)` in `lib/analysis/llm-call.js` would normalize behavior and make retry logic easier to add later.

### 9. Narrow exported API surface

`runner.js:472` exports ~6 internal helpers (`loadAllSeries`, `detectAllCandidates`, `processOneIndicator`, etc.) that are never imported from outside the module. Removing these exports shrinks the public API and makes future refactors safer.

### 10. Unified logger

Log tag format varies: `[analysis]`, `[reportaje-runner]`, `[AI-ANALYSIS]`, `[AI-COST-NARRATE]`. A `lib/logger.js` with `createLogger(tag)` would normalize output without changing behavior.

---

## Recommended sequence

1. `lib/paths.js` + `lib/file-utils.js` + `lib/config.js` — pure extraction, safe to do first, unblocks everything else.
2. Merge bilingual check + country init helper — small, independently testable.
3. Split `runner.js` — largest readable payoff, do after the above to reduce blast radius.
4. Unify prompt builders — requires understanding all five `.md` prompt files before touching.

Total estimated deduplication: ~300 lines removed across the pipeline modules.
