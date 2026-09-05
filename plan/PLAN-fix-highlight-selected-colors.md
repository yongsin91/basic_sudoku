# Plan: Fix Highlight and Selected Cell Colors — Three-Way Distinction

## Goal

Make three cell states visually distinct in all four themes:
1. **Empty/unfilled cell** — board background (baseline, no class)
2. **Highlighted cell** (row/column/box peers) — subtle but clearly visible tint, different from empty
3. **Selected cell** (active cell) — clearly the brightest, different from both empty and highlight

## Problem

`--bg-cell-highlight` is barely distinguishable from `--bg-board` (empty cells):

| Theme | Board bg | Highlight | RGB diff | Selected |
|---|---|---|---|---|
| Midnight | `#16213e` | `#1f2745` | +9,+6,+7 (barely) | `#3d3a78` ✓ |
| Light | `#ffffff` | `#f0f7ff` | -15,-8,0 (barely) | `#b3d4f5` ✓ |
| Forest | `#1e3a1e` | `#1f3a1f` | +1,0,+1 (invisible) | `#3a6a3a` ✓ |
| Ocean | `#142b3d` | `#122540` | -2,-6,+3 (darker!) | `#1e4a6e` ✓ |

The selected cell was already fixed in the previous PR. Now the highlight needs to be made visible while staying clearly below the selected cell brightness.

## Fix

Update `--bg-cell-highlight` in each theme to sit clearly between the board background and the selected cell:

| Theme | Board bg | New Highlight | New Selected | Visual gap |
|---|---|---|---|---|
| Midnight | `#16213e` | `#252d54` | `#3d3a78` | 3 distinct levels |
| Light | `#ffffff` | `#e0ecf8` | `#b3d4f5` | 3 distinct levels |
| Forest | `#1e3a1e` | `#284d28` | `#3a6a3a` | 3 distinct levels |
| Ocean | `#142b3d` | `#1a3850` | `#1e4a6e` | 3 distinct levels |

Each level is clearly separated by ~15-25 RGB units, ensuring all three states are visually distinguishable.

---

## Tasks

### Task 1 — Update --bg-cell-highlight in all four themes

Change the CSS variable in `:root` and each `[data-theme]` selector.

**Commit:** `Make highlighted cells clearly visible — distinct from both empty and selected`

### Task 2 — Update README

Update highlight and selected cell descriptions to reflect the three-way distinction.

**Commit:** `Update README for three-way cell color distinction`