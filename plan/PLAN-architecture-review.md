# Plan: Architecture Review & README Sync

## Goal

Full architecture review of the codebase, then update the README and minor code docs to accurately reflect the current state after 16 merged PRs.

## Architecture Review Findings

### 1. Layered Architecture (sound, no changes needed)

```
Pure logic modules (testable in Node, no DOM):
  generator.js  — puzzle generation, solving, validation
  serialize.js  — state serialization (Sets ↔ arrays)
  scoring.js    — score computation, time formatting, best scores
  storage.js    — localStorage safe-access helper

Orchestrator (DOM + localStorage + game state):
  script.js     — wires pure modules into DOM, manages state, events

Presentation:
  index.html    — page structure
  style.css     — all styling, responsive layout, 4 themes

Tests:
  test/generator.test.js   — 29 tests
  test/save-load.test.js   — 21 tests
  test/scoring.test.js     — 35 tests
  Total: 85 tests
```

### 2. README Issues Found

| # | Issue | Details |
|---|---|---|
| 1 | **File structure outdated** | Plan files listed at root (`PLAN-*.md`) but were moved to `plan/` directory. Missing 6 newer plan files. |
| 2 | **Version history outdated** | Stops at v1.6.0. Missing: viewport fit, mobile spacing, browser layout, selected cell color, highlight colors, click-outside-clears. |
| 3 | **CSS Classes Reference outdated** | `.board` says "450×450px" (now `var(--board-size)`). `.cell` says "1.4rem" (now `calc()`). `.pencil-grid span` says "0.55rem" (now `calc()`). `.timer` says "green (#4ecca3)" (now `var(--color-secondary)`). Missing `.controls`, `.action-buttons`, `.number-pad`, `.theme-select` classes. |
| 4 | **No CSS Variables reference** | 13 theme variables + 4 viewport-fit variables are undocumented. |
| 5 | **Event Listeners outdated** | Missing `#btn-hint` click, `#theme-select` change, `document` click (clear selection), `H` key. |
| 6 | **Timer & Display outdated** | Missing `updateHintDisplay()`. |
| 7 | **Scoring formula outdated** | Description doesn't mention hint penalty (50 pts/hint, capped at 50%). |
| 8 | **Tech Stack outdated** | Says "CSS3 (CSS Grid, media queries)" — missing CSS custom properties, `clamp()`, `dvh` units. |
| 9 | **Overview outdated** | Doesn't mention no-scroll fit-to-viewport, win overlay, or hint system. |
| 10 | **package.json version** | Still `1.6.0`, needs bump. |

### 3. Code Issue Found

| # | Issue | Details |
|---|---|---|
| 11 | **`serialize.js` JSDoc outdated** | `@param` description lists 9 fields but `serializeState` now handles 11 (missing `hintCount`, `hintedCells`). |

---

## Tasks

### Task 1 — Fix serialize.js JSDoc

Add `hintCount, hintedCells` to the `@param` description in `serializeState`.

**Commit:** `Fix serialize.js JSDoc: add hintCount and hintedCells to param description`

### Task 2 — Comprehensive README update

- Fix file structure (plan/ directory, all 12 plan files)
- Add version entries for all merged fix PRs
- Bump version to 1.7.0
- Update overview to mention all features
- Update Tech Stack to include CSS custom properties, clamp, dvh
- Add CSS Variables reference section (13 theme + 4 viewport-fit)
- Update CSS Classes Reference (responsive sizes, missing classes, theme-dependent colors)
- Update Event Listeners table (hint, theme, click-outside, H key)
- Update Timer & Display section (add updateHintDisplay)
- Update scoring formula (add hint penalty)
- Update test counts
- Update package.json version

**Commit:** `Comprehensive README sync: reflect current architecture after 16 PRs`