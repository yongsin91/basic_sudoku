# Sudoku — Documentation

## Version

**v1.0.0** — Initial release (2026-08-31)

---

## Overview

A browser-based Sudoku game built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open and play. Features three difficulty levels, real-time conflict detection, full undo history, and a responsive layout that works on desktop and mobile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (CSS Grid, media queries) |
| Logic | Vanilla JavaScript (ES6) |
| Dependencies | None |

---

## File Structure

```
basic_sudoku/
├── index.html      # Page structure & DOM elements
├── style.css       # All styling, responsive layout
├── script.js       # Game logic, puzzle data, event handling
└── README.md       # This documentation
```

---

## Capabilities

### Core Gameplay
- **9×9 Sudoku grid** with standard rules (row, column, 3×3 box uniqueness)
- **3 difficulty levels** — Easy, Medium, Hard (selected via buttons)
- **15 pre-made puzzles** — 5 per difficulty level, stored inline as 81-char strings
- **Random puzzle selection** — each new game picks a random puzzle from the chosen difficulty

### Input Methods
- **Keyboard input** — Press 1–9 to place a number in the selected cell
- **On-screen number pad** — Click buttons 1–9 (essential for touch devices)
- **Erase** — Backspace, Delete, or 0 key removes the selected cell's value
- **Arrow keys** — Navigate between cells without clicking

### Visual Aids
- **Row / column / box highlighting** — Selecting a cell highlights its entire row, column, and 3×3 box
- **Selected cell indicator** — Active cell gets a distinct background color
- **Conflict highlighting** — Cells that violate Sudoku rules (duplicate in row/column/box) turn red in real-time
- **Locked cell styling** — Pre-filled puzzle cells are visually distinct (bold, darker background) and cannot be edited

### Game Controls
- **Undo** — Full move history; undo step-by-step back to the original puzzle state
- **Clear** — Wipes all user-entered values, restoring the original puzzle in one action
- **New Game** — Starts a new puzzle at the current difficulty (also accessible via the win banner)

### Win State
- **Auto-detection** — Game detects completion when all 81 cells are filled with no conflicts
- **Win banner** — Styled in-page "🎉 You solved it!" message with a "New Game" button (no browser alerts)

### Responsive Design
- **Desktop** — Fixed 450×450px board with full-size number pad
- **Mobile/tablet** — Board and number pad scale to 90vw, font sizes reduce for smaller screens

---

## Functions Reference (`script.js`)

### Puzzle Data & State

| Function / Variable | Description |
|---|---|
| `PUZZLES` | Object with `easy`, `medium`, `hard` arrays, each containing 5 puzzle strings (81 chars, `0` = empty) |
| `board` | Array of 81 integers representing the current board state (0 = empty) |
| `originalPuzzle` | Snapshot of the starting puzzle; used to identify locked cells |
| `moveHistory` | Stack of `{ row, col, prevValue, newValue }` objects for undo support |
| `selectedCell` | `{ row, col }` of the currently selected cell, or `null` |
| `currentDifficulty` | String tracking the active difficulty (`'easy'`, `'medium'`, `'hard'`) |
| `parsePuzzle(str)` | Converts an 81-char puzzle string into an array of 81 integers |

### Rendering

| Function | Description |
|---|---|
| `renderBoard()` | Clears and rebuilds the 9×9 grid DOM, populates values, marks locked/user-input cells, applies highlights |
| `applyHighlights()` | Highlights the selected cell's row, column, and 3×3 box; calls conflict highlighting |

### Selection & Navigation

| Function | Description |
|---|---|
| `selectCell(row, col)` | Selects a cell if it's not locked; updates `selectedCell` and triggers highlights |
| `moveSelection(dr, dc)` | Moves the selection by `dr` rows and `dc` columns (clamped to 0–8); used by arrow keys |

### Input

| Function | Description |
|---|---|
| `placeNumber(num)` | Places a number (1–9) in the selected cell; pushes to undo stack; re-renders; checks win |
| `eraseSelected()` | Clears the selected cell's value; pushes to undo stack; re-renders |

### Validation

| Function | Description |
|---|---|
| `applyConflictHighlighting()` | Scans all filled cells and adds the `conflict` CSS class to any with duplicates in their row/column/box |
| `hasConflict(row, col, val)` | Returns `true` if `val` at `(row, col)` conflicts with another cell in the same row, column, or 3×3 box |
| `isBoardComplete()` | Returns `true` if all 81 cells are filled and there are zero conflicts |
| `checkWin()` | Calls `isBoardComplete()` and shows/hides the win banner accordingly |

### Game Management

| Function | Description |
|---|---|
| `newGame(difficulty)` | Picks a random puzzle from the given difficulty, resets all state, re-renders the board, updates active button styling |

### Event Listeners

| Element | Trigger | Action |
|---|---|---|
| `.cell` (each) | `click` | Calls `selectCell(row, col)` |
| `.num-btn` (each) | `click` | Calls `placeNumber(num)` |
| `#btn-undo` | `click` | Pops last move from history, restores previous value |
| `#btn-clear` | `click` | Resets all user-entered cells to empty, clears history |
| `#btn-easy` | `click` | Calls `newGame('easy')` |
| `#btn-medium` | `click` | Calls `newGame('medium')` |
| `#btn-hard` | `click` | Calls `newGame('hard')` |
| `#btn-new-game` | `click` | Calls `newGame(currentDifficulty)` |
| `document` | `keydown` | Handles 1–9 input, erase (Backspace/Delete/0), and arrow key navigation |

---

## CSS Classes Reference (`style.css`)

| Class | Element | Description |
|---|---|---|
| `.board` | Grid container | 9-column CSS grid, 450×450px, dark background |
| `.cell` | Each grid cell | Flex-centered, 1.4rem font, border, pointer cursor |
| `.cell.locked` | Pre-filled cells | Bold, darker background, default cursor (not editable) |
| `.cell.user-input` | User-entered values | Green text color |
| `.cell.selected` | Active cell | Distinct background highlight |
| `.cell.highlight` | Row/col/box peers | Subtle background highlight |
| `.cell.conflict` | Rule-violating cells | Red text + red-tinted background (overrides other classes) |
| `.num-btn` | Number pad buttons | Grid of 9 buttons, hover effect |
| `.diff-btn` | Difficulty buttons | Bordered buttons with active state |
| `.action-btn` | Undo/Clear/New Game | Bordered buttons with hover fill |
| `.win-banner` | Win message container | Centered, bordered box; hidden when `.hidden` added |
| `.hidden` | Any element | `display: none` |

---

## How to Run

1. Open `index.html` directly in a browser, **or**
2. Serve via a local HTTP server:
   ```bash
   cd basic_sudoku
   python3 -m http.server 8765
   ```
   Then visit `http://localhost:8765/index.html`

---

## Future Enhancements (Not Yet Implemented)

- Random puzzle generation (algorithmic, no pre-made set)
- Timer / scoring system
- Hint system (reveal one correct cell)
- Save / load game progress (localStorage)
- Puzzle import / export
- Pencil marks (candidate notes per cell)