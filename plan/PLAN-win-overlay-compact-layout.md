# Plan: Win Overlay + Compact Layout

## Goal

Two UI improvements:
1. **Win banner as overlay** — Replace the in-flow win banner (which appears at the bottom, requiring scroll) with a centered modal overlay on top of the board
2. **Compact controls row** — Move the theme selector onto the same row as the difficulty buttons, with a distinct visual design to differentiate it from the game-action buttons

---

## Design

### Win Overlay

Currently the `#win-banner` is a flex item in `.container`, appearing after the action buttons. When the puzzle is solved, it renders at the bottom of the page, often below the fold.

**New approach:**
- Wrap the win banner in a `#win-overlay` div that covers the full viewport with a semi-transparent backdrop
- The banner itself is centered (both horizontally and vertically) within the overlay
- A dark semi-transparent backdrop dims the board behind it, making it clear the game is over
- Clicking the backdrop does nothing — the only option is "New Game" (as the user specified)
- Toggle: `#win-overlay.hidden { display: none }` — same pattern as current

### Compact Controls Row

Currently the theme selector sits in its own `.theme-bar` row above the `.controls` row. This adds vertical space.

**New approach:**
- Remove the `.theme-bar` wrapper
- Move `<select id="theme-select">` into the `.controls` div alongside the difficulty buttons
- The `.controls` flex row already uses `gap: 10px`, so they'll lay out naturally
- Differentiate the theme select visually:
  - **Difficulty buttons**: Bold, 2px accent border, transparent background, 1rem font — primary game actions
  - **Theme select**: Smaller font (0.85rem), thinner border (1px dim), subtle filled background, pill-shaped (more rounded) — secondary settings control
  - A `margin-left: auto` on the select pushes it to the right end of the row, visually separating it from the difficulty group

---

## Tasks

### Task 1 — Restructure win banner as overlay in HTML

- Wrap `#win-banner` in a new `#win-overlay` div
- Move the overlay outside the `.container` (direct child of `<body>`) so it can cover the full viewport
- Remove `hidden` class from the inner banner (the overlay handles visibility)

**Commit:** `Restructure win banner as full-viewport overlay in HTML`

### Task 2 — Add overlay CSS + compact controls CSS

- `.win-overlay`: `position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6)`
- `.win-overlay.hidden`: `display: none`
- `.win-banner`: Remove old positioning, it's now centered by the overlay flex
- Remove `.theme-bar` styles, add `#theme-select` styles for inline placement in `.controls`
- Responsive adjustments

**Commit:** `Add overlay CSS and compact controls styling`

### Task 3 — Update script.js to toggle overlay instead of banner

- Change `winBanner` reference to `winOverlay`
- `checkWin()`: show/hide `winOverlay` instead of `winBanner`
- `newGame()`: hide `winOverlay`
- `loadGame()`: `checkWin()` already handles it via the overlay

**Commit:** `Update script.js to toggle win overlay`

### Task 4 — Update README

- Update Win State description to mention overlay/modal
- Update CSS classes reference (.win-overlay, #theme-select changes)
- Remove .theme-bar from CSS reference

**Commit:** `Update README for overlay and compact layout changes`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Overlay on mobile | Banner scales down via responsive CSS, backdrop still covers viewport |
| Overlay while board is scrolled | `position: fixed` ensures overlay is always centered in viewport regardless of scroll |
| Theme select on narrow screens | Flex wraps or shrinks; select is compact enough to fit alongside 3 buttons |

---

## Out of Scope

- Animations (fade-in, slide-up) — could be added later
- Click-outside-to-dismiss — user specified only option is New Game
- Backdrop blur (backdrop-filter) — inconsistent browser support