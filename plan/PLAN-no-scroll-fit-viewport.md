# Plan: No-Scroll Fit-to-Viewport

## Goal

Ensure the entire Sudoku UI fits within the viewport on all devices — laptop, desktop, iPad (portrait/landscape), and mobile (portrait/landscape) — with zero scrolling.

## Problem

The board has a fixed `450px` height. Combined with ~300px of chrome (h1, controls, status bar, number pad, action buttons, gaps, padding), the total height is ~750px. Most laptop browser viewports are ~650px, requiring ~100px of scroll.

## Strategy

**CSS-only solution — no HTML or JavaScript changes needed.**

1. **Board size via `min()`**: The board scales to the smallest of max size, available width, or available height minus chrome
2. **`overflow: hidden` on body**: Hard-prevents scrolling
3. **`clamp()` on gaps/padding**: Spaces shrink on shorter screens, freeing vertical room
4. **Scale cell fonts with board size**: Text stays proportional as the board grows/shrinks
5. **`100dvh` (dynamic viewport height)**: Adapts to mobile browser UI appearing/disappearing

## CSS Variable Design

```css
:root {
    --board-max: 450px;
    --board-size: min(var(--board-max), 92vw, calc(100dvh - 310px));
    --gap: clamp(6px, 2vh, 16px);
    --pad: clamp(8px, 2vh, 20px);
}
```

- `--board-size`: At most 450px, at most 92% of viewport width, at most viewport height minus ~310px of chrome
- `--gap`: 16px on tall screens, scales down to 6px on short screens
- `--pad`: 20px on tall screens, scales down to 8px on short screens

The 310px chrome estimate is conservative (actual chrome is ~300px on desktop, ~250px on mobile with clamped gaps). Using a slightly larger value ensures the board never overflows.

## Scope of Changes

- **`style.css`**: All changes here — new CSS variables, `min()`/`clamp()` sizing, `overflow: hidden`, scaled fonts
- **`index.html`**: No changes
- **`script.js`**: No changes
- **Tests**: No changes (pure CSS, no logic)

---

## Tasks

### Task 1 — Add viewport-fit CSS variables and overflow control

Add to `:root`:
- `--board-max: 450px`
- `--board-size: min(var(--board-max), 92vw, calc(100dvh - 310px))`
- `--gap: clamp(6px, 2vh, 16px)`
- `--pad: clamp(8px, 2vh, 20px)`

Update `body`:
- `height: 100vh; height: 100dvh;` (vh fallback + dvh)
- `overflow: hidden;`
- `padding: var(--pad);`

Update `.container`:
- `gap: var(--gap);`

**Commit:** `Add viewport-fit CSS variables and overflow control`

### Task 2 — Apply board-size to board, number-pad, and status-bar

- `.board`: `width: var(--board-size); height: var(--board-size);`
- `.status-bar`: `width: var(--board-size);`
- `.number-pad`: `width: var(--board-size); gap: clamp(2px, 1vh, 6px);`

**Commit:** `Apply responsive board size to board, number-pad, status-bar`

### Task 3 — Scale cell and pencil mark fonts with board size

- `.cell`: `font-size: calc(var(--board-size) / 20);` (450px → 22.5px ≈ current 1.4rem)
- `.pencil-grid span`: `font-size: calc(var(--board-size) / 50);` (450px → 9px ≈ current 0.55rem)
- Remove the fixed font-size overrides from the mobile media query (now scales automatically)

**Commit:** `Scale cell and pencil mark fonts with board size`

### Task 4 — Scale UI element sizes with clamp

- `h1`: `font-size: clamp(1.2rem, 4vh, 2rem);`
- `.num-btn`: `padding: clamp(6px, 1.5vh, 12px) 0; font-size: clamp(0.8rem, 2vh, 1.2rem);`
- `.action-btn`: `padding: clamp(5px, 1.2vh, 8px) clamp(14px, 3vh, 24px); font-size: clamp(0.8rem, 2vh, 1rem);`
- `.diff-btn`: `padding: clamp(5px, 1.2vh, 8px) clamp(12px, 3vh, 20px);`
- `.timer`: `font-size: clamp(0.9rem, 2.5vh, 1.3rem);`

**Commit:** `Scale UI element sizes with clamp for short screens`

### Task 5 — Update mobile media query

Replace the old `@media (max-width: 520px)` block:
- Remove fixed board/status-bar/number-pad widths (now use `--board-size`)
- Remove fixed cell/pencil font sizes (now use calc with `--board-size`)
- Adjust `--board-size` chrome offset for mobile (smaller chrome → `calc(100dvh - 260px)`)
- Keep win banner responsive sizing

**Commit:** `Update mobile media query for viewport-fit sizing`

### Task 6 — Update README

- Document the viewport-fit approach
- Update CSS variables reference
- Update Responsive Design section

**Commit:** `Update README for viewport-fit layout`

---

## Expected Results by Device

| Device | Viewport height | Board size | Fits? |
|---|---|---|---|
| Laptop (1366×768) | ~650px | ~340px | ✅ |
| Desktop (1080p) | ~950px | 450px (capped) | ✅ |
| iPad portrait (768×1024) | ~1000px | 450px (capped) | ✅ |
| iPad landscape (1024×768) | ~740px | ~430px | ✅ |
| Mobile portrait (390×844) | ~800px | ~360px (width-limited) | ✅ |
| Mobile landscape (844×390) | ~370px | ~110px (height-limited) | ✅ (small but usable) |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Very short screen (mobile landscape) | Board shrinks to fit; cells remain tappable at ~12px minimum |
| Browser UI appears/disappears (mobile) | `100dvh` adjusts dynamically |
| Zoomed-in browser | `overflow: hidden` prevents scroll; board may clip if viewport is extremely small |
| Old browser without dvh support | `vh` fallback provided |

---

## Out of Scope

- JavaScript-based viewport measurement
- Detecting device orientation and rearranging layout
- Collapsible/hideable UI sections
- Landscape-specific layout (side-by-side board and pad)