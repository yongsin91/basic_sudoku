# Plan: Fix Selected Cell Color Distinction

## Goal

Make the selected cell visually distinct from the highlighted row/column/box cells. Currently both use nearly identical background colors in all four themes, making it hard to tell which cell is actively selected.

## Problem

The `--bg-cell-selected` and `--bg-cell-highlight` CSS variables are too close in brightness in every theme:

| Theme | Highlight | Selected | Difference |
|---|---|---|---|
| Midnight | `#1f2745` | `#2a2a5a` | Barely noticeable |
| Light | `#f0f7ff` | `#dbeafe` | Subtle, both very light |
| Forest | `#1f3a1f` | `#2a4a2a` | Nearly identical |
| Ocean | `#122540` | `#1a3a5a` | Nearly identical |

## Fix

Update `--bg-cell-selected` in each theme to a noticeably brighter shade that:
- Is clearly distinguishable from `--bg-cell-highlight`
- Stays harmonious with the theme's color palette
- Doesn't clash with text, user-input, or conflict colors

### New Selected Cell Colors

| Theme | Highlight (unchanged) | New Selected | Rationale |
|---|---|---|---|
| Midnight | `#1f2745` | `#3d3a78` | Brighter purple-blue, clearly above highlight |
| Light | `#f0f7ff` | `#b3d4f5` | More saturated blue, clearly visible on white |
| Forest | `#1f3a1f` | `#3a6a3a` | Brighter green, clearly above the subtle highlight |
| Ocean | `#122540` | `#1e4a6e` | Brighter blue, clearly above the dark highlight |

---

## Tasks

### Task 1 — Update --bg-cell-selected in all four themes

Change the CSS variable in `:root` (Midnight) and each `[data-theme]` selector.

**Commit:** `Make selected cell color clearly distinct from highlight in all themes`

### Task 2 — Update README

Note the visual distinction between selected and highlight cells.

**Commit:** `Update README for selected cell color fix`