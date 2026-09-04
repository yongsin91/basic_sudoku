# Sudoku — Documentation

## Version

**v1.3.0** — Adds save/load game progress via localStorage (2026-09-05)
**v1.2.1** — Remove hardcoded puzzle fallback, generator is sole source (2026-09-04)
**v1.2.0** — Adds pencil marks (candidate notes) (2026-09-04)
**v1.1.0** — Adds random puzzle generation (2026-09-03)
**v1.0.0** — Initial release (2026-08-31)

---

## Overview

A browser-based Sudoku game built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open and play. Features three difficulty levels, algorithmic random puzzle generation, real-time conflict detection, pencil marks (candidate notes), full undo history, automatic save/load via localStorage, and a responsive layout that works on desktop and mobile.

### 🎮 Play Now

**[https://yongsin91.github.io/basic_sudoku/](https://yongsin91.github.io/basic_sudoku/)**

No installation required — just click and start solving!

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
├── index.html                  # Page structure & DOM elements
├── style.css                   # All styling, responsive layout
├── script.js                   # Game logic, event handling, pencil marks, save/load
├── serialize.js                # Pure state serialization (Sets ↔ arrays)
├── generator.js                # Puzzle generator (backtracking + MRV solver)
├── package.json                # npm metadata & test scripts
├── test/
│   ├── generator.test.js       # 20 assert-based tests for generator.js
│   └── save-load.test.js       # 18 assert-based tests for serialize.js
├── PLAN-random-puzzle-generation.md  # Design notes for the generator
├── PLAN-pencil-marks.md             # Design notes for pencil marks
├── PLAN-save-load.md                # Design notes for save/load feature
└── README.md                   # This documentation
```

---

## Capabilities

### Core Gameplay
- **9×9 Sudoku grid** with standard rules (row, column, 3×3 box uniqueness)
- **3 difficulty levels** — Easy, Medium, Hard (selected via buttons)
- **Algorithmic random puzzle generation** — each new game generates a unique puzzle on-the-fly using a backtracking solver with bitmask constraints and the MRV (minimum remaining values) heuristic
- **Unique-solution guarantee** — cells are removed only if the puzzle retains a single solution
- **Difficulty-scaled clue counts** — Easy (40–45 clues), Medium (32–36), Hard (25–30)

### Input Methods
- **Keyboard input** — Press 1–9 to place a number in the selected cell
- **On-screen number pad** — Click buttons 1–9 (essential for touch devices)
- **Erase** — Backspace, Delete, or 0 key removes the selected cell's value
- **Arrow keys** — Navigate between cells without clicking
- **Pen / Pencil toggle** — Press `P` or click the toggle button to switch between placing numbers and toggling candidate notes

### Visual Aids
- **Row / column / box highlighting** — Selecting a cell highlights its entire row, column, and 3×3 box
- **Selected cell indicator** — Active cell gets a distinct background color
- **Conflict highlighting** — Cells that violate Sudoku rules (duplicate in row/column/box) turn red in real-time
- **Locked cell styling** — Pre-filled puzzle cells are visually distinct (bold, darker background) and cannot be edited

### Pencil Marks (Candidate Notes)
- **Pen / Pencil mode toggle** — Switch between placing numbers (pen) and toggling candidate notes (pencil) via the button or `P` key
- **3×3 mini-grid display** — Candidate digits are shown as small numbers in a 3×3 grid within each empty cell
- **Auto-clear on placement** — When a number is placed, that digit is automatically removed from pencil marks of all peer cells (same row, column, and 3×3 box)
- **Undo restores pencil marks** — Undoing a placement restores the pencil marks that were auto-cleared
- **Erase in pencil mode** — Clears all candidate notes in the selected cell

### Game Controls
- **Undo** — Full move history; undo step-by-step back to the original puzzle state (restores pencil marks too)
- **Clear** — Wipes all user-entered values and pencil marks, restoring the original puzzle in one action
- **New Game** — Starts a new puzzle at the current difficulty (also accessible via the win banner)

### Save / Load Game Progress
- **Automatic save** — The full game state (board, pencil marks, undo history, difficulty, pen/pencil mode, cell selection) is saved to `localStorage` after every move — no manual save button needed
- **Automatic load** — On page load, the saved game is restored automatically; if no save exists (or it's corrupted), a fresh game starts
- **Persists across sessions** — Saved data survives browser restarts, machine reboots, and tab closures; it remains until the puzzle is solved or the browser's site data is cleared
- **Clears on win** — When the puzzle is solved, the save is removed so the next visit starts a fresh game
- **Graceful degradation** — If `localStorage` is unavailable (e.g. private browsing mode), save/load is silently skipped without errors

### Win State
- **Auto-detection** — Game detects completion when all 81 cells are filled with no conflicts
- **Win banner** — Styled in-page "🎉 You solved it!" message with a "New Game" button (no browser alerts)

### Responsive Design
- **Desktop** — Fixed 450×450px board with full-size number pad
- **Mobile/tablet** — Board and number pad scale to 90vw, font sizes reduce for smaller screens

---

## Functions Reference (`serialize.js`)

| Function | Description |
|---|---|
| `serializeState(state)` | Converts a game state object (with `Set` arrays) into a plain JSON-serializable object |
| `deserializeState(data)` | Converts a plain serialized object back into a game state object (reconstructs `Set`s from arrays); returns `null` on invalid input |

---

## Functions Reference (`generator.js`)

| Function | Description |
|---|---|
| `bit(d)` | Returns `1 << d` — bitmask for digit `d` |
| `buildMasks(board)` | Builds row/column/box constraint bitmasks from the current board |
| `isValid(board, row, col, val)` | Checks if `val` can be legally placed at `(row, col)` |
| `generateFullSolution()` | Generates a complete, valid 9×9 solution using randomized backtracking with MRV |
| `countSolutions(board, limit)` | Counts solutions up to `limit` (default 2); returns 0, 1, or `limit` |
| `createPuzzle(solution, targetClues)` | Removes cells from a full solution while maintaining a unique solution |
| `getTargetClueCount(difficulty)` | Returns a random clue count within the difficulty's range |
| `generatePuzzle(difficulty)` | Orchestrator: generates a complete puzzle for the given difficulty |
| `shuffle(arr)` | Fisher-Yates shuffle (used for randomization) |

---

## Functions Reference (`script.js`)

### Game State

| Function / Variable | Description |
|---|---|
| `board` | Array of 81 integers representing the current board state (0 = empty) |
| `originalPuzzle` | Snapshot of the starting puzzle; used to identify locked cells |
| `moveHistory` | Stack of `{ row, col, prevValue, newValue, pencilSnapshot }` objects for undo support |
| `selectedCell` | `{ row, col }` of the currently selected cell, or `null` |
| `currentDifficulty` | String tracking the active difficulty (`'easy'`, `'medium'`, `'hard'`) |
| `pencilMarks` | Array of 81 `Set` objects, each containing candidate digits (1–9) for that cell |
| `pencilMode` | Boolean — `false` = pen mode (place numbers), `true` = pencil mode (toggle candidates) |
| `initPencilMarks()` | Initializes the `pencilMarks` array with 81 empty Sets |

### Rendering

| Function | Description |
|---|---|
| `renderBoard()` | Clears and rebuilds the 9×9 grid DOM, populates values, renders pencil mark mini-grids, marks locked/user-input cells, applies highlights |
| `applyHighlights()` | Highlights the selected cell's row, column, and 3×3 box; calls conflict highlighting |

### Selection & Navigation

| Function | Description |
|---|---|
| `selectCell(row, col)` | Selects a cell if it's not locked; updates `selectedCell` and triggers highlights |
| `moveSelection(dr, dc)` | Moves the selection by `dr` rows and `dc` columns (clamped to 0–8); used by arrow keys |

### Input & Pencil Marks

| Function | Description |
|---|---|
| `placeNumber(num)` | In pen mode: places a number, auto-clears peer pencil marks, pushes to undo stack. In pencil mode: delegates to `togglePencilMark()` |
| `togglePencilMark(num)` | Toggles a candidate digit in the selected cell's pencil mark Set |
| `clearPencilMarksFromPeers(row, col, num)` | Removes `num` from pencil marks of all peer cells (row, column, box); returns a snapshot for undo |
| `eraseSelected()` | In pen mode: clears the selected cell's value. In pencil mode: clears all pencil marks in the selected cell |
| `togglePencilMode()` | Switches between pen and pencil mode; updates button label and styling |

### Validation

| Function | Description |
|---|---|
| `applyConflictHighlighting()` | Scans all filled cells and adds the `conflict` CSS class to any with duplicates in their row/column/box |
| `hasConflict(row, col, val)` | Returns `true` if `val` at `(row, col)` conflicts with another cell in the same row, column, or 3×3 box |
| `isBoardComplete()` | Returns `true` if all 81 cells are filled and there are zero conflicts |
| `checkWin()` | Calls `isBoardComplete()` and shows/hides the win banner accordingly |

### Save / Load

| Function | Description |
|---|---|
| `saveGame()` | Serializes the full game state and writes it to `localStorage['sudoku-save']`; called after every state-changing action |
| `loadGame()` | Reads and parses the save from `localStorage`, restores all state variables, syncs UI buttons; returns `false` if no save or parse error |
| `clearSave()` | Removes the save entry from `localStorage`; called on win and before a fresh new game |

### Game Management

| Function | Description |
|---|---|
| `newGame(difficulty)` | Generates a random puzzle via `generatePuzzle()`, resets all state, re-renders the board, updates active button styling |

### Event Listeners

| Element | Trigger | Action |
|---|---|---|
| `.cell` (each) | `click` | Calls `selectCell(row, col)` |
| `.num-btn` (each) | `click` | Calls `placeNumber(num)` |
| `#btn-undo` | `click` | Pops last move from history, restores previous value and pencil marks |
| `#btn-clear` | `click` | Resets all user-entered cells to empty, clears pencil marks and history |
| `#btn-pencil` | `click` | Toggles between pen and pencil mode |
| `#btn-easy` | `click` | Calls `newGame('easy')` |
| `#btn-medium` | `click` | Calls `newGame('medium')` |
| `#btn-hard` | `click` | Calls `newGame('hard')` |
| `#btn-new-game` | `click` | Calls `newGame(currentDifficulty)` |
| `document` | `keydown` | Handles 1–9 input, erase (Backspace/Delete/0), arrow key navigation, and `P` to toggle pen/pencil mode |

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
| `.pencil-grid` | Mini-grid inside cells | 3×3 CSS grid for displaying candidate digits |
| `.pencil-grid span` | Each candidate slot | Small font (0.55rem), dim color (#888) |
| `.pencil-btn` | Pen/Pencil toggle | Red-bordered toggle button |
| `.pencil-btn.active` | Pencil mode active | Red-filled button indicating pencil mode |
| `.action-btn` | Undo/Clear/New Game | Bordered buttons with hover fill |
| `.win-banner` | Win message container | Centered, bordered box; hidden when `.hidden` added |
| `.hidden` | Any element | `display: none` |

---

## How to Run

1. **Play online** — Visit [https://yongsin91.github.io/basic_sudoku/](https://yongsin91.github.io/basic_sudoku/) (hosted via GitHub Pages)
2. **Run locally** — Open `index.html` directly in a browser, **or**
3. **Serve via a local HTTP server:**
   ```bash
   cd basic_sudoku
   python3 -m http.server 8765
   ```
   Then visit `http://localhost:8765/index.html`

### Run Tests

```bash
cd basic_sudoku
npm test          # 20 generator tests
npm run test:save # 18 save/load serialization tests
npm run test:all  # all 38 tests
```
All tests use Node's built-in `assert` module — no external dependencies.

---

## Future Enhancements (Not Yet Implemented)

- Timer / scoring system
- Hint system (reveal one correct cell)
- Puzzle import / export