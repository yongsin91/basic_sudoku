# Plan: Fix Browser Layout — Button Wrapping

## Goal

Fix two issues visible in desktop/laptop browsers:
1. **Hint button wraps to next line** — The 4th action button ("💡 Hint") wraps below the others, touching the bottom screen edge
2. **Difficulty and theme not on same row** — The theme select wraps below the difficulty buttons

## Root Cause

- `flex-wrap: wrap` was added globally (for mobile) but also applies on desktop
- On short laptop screens, `--board-size` is height-constrained (~340px), but button padding uses `2vw` (viewport width ~1366px → 24px per side), so 4 buttons total ~416px and exceed the 340px row
- Buttons don't shrink because padding is tied to viewport width, not board size

## Fix

1. **`flex-wrap: nowrap` by default** — buttons stay on one row on desktop
2. **`flex-wrap: wrap` only in mobile media query** (≤520px) — wrapping allowed only on narrow screens
3. **Proportional button padding** — use `calc(var(--board-size) * N)` so padding shrinks with the board
4. **Reduce gap** — from `clamp(4px, 1vw, 10px)` to `clamp(3px, 1vw, 8px)`

### Proportional Padding Calculation

| Element | Formula | 450px board | 340px board |
|---|---|---|---|
| `.diff-btn` horizontal | `calc(var(--board-size) * 0.025)` | 11.25px | 8.5px |
| `.action-btn` horizontal | `calc(var(--board-size) * 0.03)` | 13.5px | 10.2px |
| `.theme-select` horizontal | `calc(var(--board-size) * 0.02)` | 9px | 6.8px |

At 340px board with proportional padding:
- Action buttons: 4 × (~45px text + ~20px padding + 4px border) + 3 × 8px gap = ~300px ✅ fits in 340px
- Controls: 3 × (~40px + ~17px + 4px) + ~70px theme + 3 × 8px = ~265px ✅ fits in 340px

---

## Tasks

### Task 1 — Fix flex-wrap and proportional padding in CSS

- `.controls` and `.action-buttons`: change `flex-wrap: wrap` → `flex-wrap: nowrap` (default)
- `.diff-btn` horizontal padding: `calc(var(--board-size) * 0.025)` (was `clamp(8px, 2vw, 20px)`)
- `.action-btn` horizontal padding: `calc(var(--board-size) * 0.03)` (was `clamp(8px, 2vw, 24px)`)
- `.theme-select` horizontal padding: `calc(var(--board-size) * 0.02)` (was `12px`)
- `.controls` and `.action-buttons` gap: `clamp(3px, 1vw, 8px)` (was `clamp(4px, 1vw, 10px)`)

### Task 2 — Add flex-wrap: wrap to mobile media query only

In `@media (max-width: 520px)`:
- `.controls { flex-wrap: wrap; }`
- `.action-buttons { flex-wrap: wrap; }`

### Task 3 — Update README

- Note that button rows use nowrap on desktop, wrap on mobile
- Update padding description (proportional to board size)

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Very short laptop (board = 300px) | Proportional padding shrinks → buttons still fit in one row |
| Mobile (≤520px) | flex-wrap: wrap allows wrapping if needed |
| Very wide desktop (board = 450px) | Padding = 13.5px max → comfortable spacing |
| Theme select with long text | Proportional padding keeps it compact on small boards |