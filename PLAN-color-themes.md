# Plan: Color Theme System

## Goal

Replace all hardcoded colors in `style.css` with CSS custom properties (variables), define multiple theme variants, and add a theme selector dropdown so the player can choose their preferred color scheme. The selected theme persists across sessions via `localStorage`.

---

## Design

### CSS Variables Approach

All colors currently hardcoded in `style.css` will be replaced with semantic CSS custom properties defined on `:root`. Each theme overrides these variables via a `[data-theme="name"]` selector on `<body>`. This requires zero JavaScript for the actual styling — JS only handles the dropdown and persistence.

### Semantic Variables

| Variable | Purpose | Midnight (default) |
|---|---|---|
| `--bg-page` | Page background | `#1a1a2e` |
| `--color-text` | Main text color | `#eee` |
| `--color-text-dim` | Dimmed text (labels, counters, pencil marks) | `#888` |
| `--color-accent` | Primary accent (h1, diff buttons, board border, pencil button, conflict text, best score) | `#e94560` |
| `--color-secondary` | Secondary accent (action buttons, timer, user-input, win text, score) | `#4ecca3` |
| `--color-hint` | Hint color (hinted cells, hint button) | `#5dade2` |
| `--bg-board` | Board background, num-btn background, win banner background | `#16213e` |
| `--bg-cell-locked` | Locked cell background | `#0f1628` |
| `--color-cell-locked` | Locked cell text | `#aaa` |
| `--bg-cell-selected` | Selected cell background | `#2a2a5a` |
| `--bg-cell-highlight` | Highlighted cell background | `#1f2745` |
| `--color-cell-border` | Cell border, num-btn border | `#2a2a4a` |
| `--bg-conflict` | Conflict cell background | `#3a1a2a` |

### Themes

1. **🌙 Midnight** (current default) — dark blue/purple with red-pink accent
2. **☀️ Light** — clean white with blue accent (high contrast, daylight-friendly)
3. **🌲 Forest** — dark green with amber/gold accent
4. **🌊 Ocean** — dark teal with cyan accent

### Theme Selector

A `<select>` dropdown placed in a theme bar above the difficulty buttons. Styled to match the current theme. Changes apply instantly (no reload needed).

### Persistence

Theme preference stored in `localStorage['sudoku-theme']` (separate key from game save). On page load, the saved theme is applied before the board renders. Default: `midnight`.

---

## Tasks

### Task 1 — Convert hardcoded colors to CSS variables

Replace every hardcoded hex color in `style.css` with `var(--variable-name)`. Define all variables on `:root` with the current Midnight values. No visual change — pure refactoring.

**Commit:** `Convert hardcoded colors to CSS custom properties`

### Task 2 — Define theme variants in CSS

Add `[data-theme="light"]`, `[data-theme="forest"]`, `[data-theme="ocean"]` selectors, each overriding the CSS variables with their palette. Verify contrast and readability for each theme.

**Commit:** `Define light, forest, and ocean theme variants`

### Task 3 — Add theme selector UI to HTML

Add a theme bar with a `<select id="theme-select">` dropdown between the h1 and difficulty buttons. Options: Midnight, Light, Forest, Ocean.

**Commit:** `Add theme selector dropdown to HTML`

### Task 4 — Add CSS for theme selector

Style the `.theme-bar` and `#theme-select` to match the existing design, using CSS variables so it adapts to the active theme.

**Commit:** `Add CSS styling for theme selector`

### Task 5 — Add theme switching logic to script.js

- `THEME_KEY = 'sudoku-theme'`
- `applyTheme(themeName)` — sets `data-theme` on `document.body`, updates select dropdown
- `getSavedTheme()` — reads from localStorage via `withLocalStorage`, defaults to `'midnight'`
- `saveTheme(themeName)` — writes to localStorage via `withLocalStorage`
- Event listener on `#theme-select` change
- On startup: apply saved theme before `loadGame()` / `newGame()`

**Commit:** `Add theme switching logic with localStorage persistence`

### Task 6 — Update README

- Bump version to `1.6.0`
- Add "Color Themes" to Capabilities section
- Add CSS variables reference table
- Add `applyTheme`, `getSavedTheme`, `saveTheme` to script.js functions reference
- Add `.theme-bar`, `#theme-select` to CSS reference
- Update Future Enhancements (remove nothing — this is a new feature, not previously listed)

**Commit:** `Update README for v1.6.0: document color theme system`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| No saved theme | Default to `midnight` |
| Saved theme name is invalid | Default to `midnight` |
| localStorage unavailable (private mode) | Default to `midnight`, changes are session-only |
| Theme changes mid-game | Applied instantly, no game state impact |
| Old saves (pre-theme) | No conflict — theme uses separate localStorage key |

---

## Out of Scope

- Custom theme editor / color picker
- Auto theme based on system preference (prefers-color-scheme)
- Theme transitions/animations
- Additional themes beyond the four defined