# Plan: Mobile Button Spacing + Minimum Board Size

## Goal

Two fixes:
1. **Button spacing on mobile** — Buttons (Easy, Medium, Hard, Undo, Clear, Pen, Hint) and theme select are touching the viewport edges on narrow screens. Constrain button rows to board width, allow wrapping, and scale padding with viewport width.
2. **Minimum board size** — The board can shrink to 0px on very short viewports. Set a minimum playable size (240px). When the viewport can't fit the minimum layout, allow scrolling. When the viewport is extremely small, show an error message instead of an unplayable game.

---

## Issue 1: Button Spacing

### Root Cause

- `.controls` and `.action-buttons` have no `width` constraint — they size to content, which can exceed the viewport
- Button horizontal padding uses `clamp(14px, 3vh, 24px)` — `vh` scales with viewport **height**, not width, so it doesn't shrink on narrow screens
- No `flex-wrap` — buttons can't wrap to a second row

### Fix

1. Set `width: var(--board-size)` on `.controls` and `.action-buttons` (same width as the board)
2. Add `flex-wrap: wrap` and `justify-content: center` — buttons wrap to a second row if needed, centered
3. Change horizontal padding from `3vh` to `2vw` — scales with viewport **width** so buttons shrink on narrow screens
4. Reduce gap on mobile via `clamp(4px, 1vw, 10px)`

---

## Issue 2: Minimum Board Size

### Root Cause

`--board-size: min(450px, 92vw, calc(100dvh - 310px))` — the `calc()` term can be 0 or negative on short screens. CSS clamps negative sizes to 0, making the board invisible.

### Fix

**Three-tier approach:**

1. **Normal screens (height ≥ 550px)**: Board scales as before, `overflow: hidden`, no scrolling
2. **Short screens (height < 550px)**: Board is clamped to minimum (240px), `overflow: auto` allows scrolling to reach the content that doesn't fit
3. **Extremely small screens (height < 320px or width < 280px)**: Show error overlay, hide the game entirely — it's not playable

### CSS Implementation

```css
:root {
    --board-min: 240px;
    --board-size: max(var(--board-min), min(var(--board-max), 92vw, calc(100dvh - 310px)));
}

/* Short screens: allow scrolling */
@media (max-height: 550px) {
    body {
        overflow: auto;
        height: auto;
        min-height: 100dvh;
        align-items: flex-start;
    }
}

/* Extremely small: show error, hide game */
@media (max-height: 320px), (max-width: 280px) {
    .container { display: none; }
    .screen-error { display: flex; }
}
```

### HTML Addition

A hidden error div, shown only via media query:

```html
<div id="screen-error" class="screen-error">
    <p>📱 Screen too small</p>
    <p>Please rotate your device or use a larger screen.</p>
</div>
```

### Minimum Board Size Rationale

240px board → ~26px per cell. This is the minimum for comfortable touch interaction (Apple recommends 44px, but 26px is the practical minimum for a 9×9 grid on a phone). Below this, the puzzle is not playable.

---

## Tasks

### Task 1 — Fix button row constraints and padding

CSS changes:
- `.controls`: add `width: var(--board-size); flex-wrap: wrap; justify-content: center;`
- `.action-buttons`: add `width: var(--board-size); flex-wrap: wrap; justify-content: center;`
- `.diff-btn` horizontal padding: `clamp(8px, 2vw, 20px)` (was `3vh`)
- `.action-btn` horizontal padding: `clamp(8px, 2vw, 24px)` (was `3vh`)
- `.controls` gap: `clamp(4px, 1vw, 10px)` (was fixed `10px`)
- `.action-buttons` gap: `clamp(4px, 1vw, 10px)` (was fixed `10px`)

**Commit:** `Fix button rows: constrain to board width, wrap, scale padding with viewport width`

### Task 2 — Add minimum board size and scroll fallback

CSS changes:
- Add `--board-min: 240px` to `:root`
- Change `--board-size` to `max(var(--board-min), min(...))`
- Add `@media (max-height: 550px)`: `body { overflow: auto; height: auto; min-height: 100dvh; align-items: flex-start; }`
- Update mobile media query `--board-size` similarly

**Commit:** `Add minimum board size (240px) with scroll fallback for short screens`

### Task 3 — Add screen-too-small error display

HTML:
- Add `#screen-error` div (hidden by default) after `.container`

CSS:
- `.screen-error`: centered flex column, hidden by default
- `@media (max-height: 320px), (max-width: 280px)`: hide `.container`, show `.screen-error`
- Style with theme variables (accent color, centered text)

**Commit:** `Add screen-too-small error overlay for extremely small viewports`

### Task 4 — Update README

- Update Responsive Design section to mention minimum board size, scroll fallback, and error display
- Add `.screen-error` to CSS classes reference

**Commit:** `Update README for mobile spacing and minimum board size`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Mobile landscape (390px height) | Board = 240px (min), `overflow: auto` allows scroll |
| iPhone SE landscape (320px height) | Error overlay shown (below 320px threshold) |
| Very narrow screen (250px width) | Error overlay shown (below 280px threshold) |
| Normal desktop | No change — board is 450px, no scroll |
| Buttons wrapping on mobile | `flex-wrap: wrap` + `justify-content: center` — buttons arrange on 2 rows neatly |

---

## Out of Scope

- Device rotation detection/encouragement (the error message suggests rotation, but no JS detection)
- Collapsible UI sections for very small screens
- Separate landscape layout (side-by-side board and pad)