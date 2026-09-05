# Sudoku - Documentation

## Version

**v1.7.0** — Architecture review, README sync, JSDoc fix (2026-09-06)

**v1.6.1** — Fix highlight/selected cell colors, clear selection on outside click (2026-09-06)

**v1.6.0** — Adds color theme system with 4 selectable themes (2026-09-05)

**v1.5.0** — Adds hint system with scoring penalty (2026-09-05)

**v1.4.0** — Adds timer & scoring system with best score persistence (2026-09-05)

**v1.3.0** — Adds save/load game progress via localStorage (2026-09-05)

**v1.2.1** — Remove hardcoded puzzle fallback, generator is sole source (2026-09-04)

**v1.2.0** — Adds pencil marks (candidate notes) (2026-09-04)

**v1.1.0** — Adds random puzzle generation (2026-09-03)

**v1.0.0** — Initial release (2026-08-31)

---

## Overview

A browser-based Sudoku game built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies — just open and play. Features three difficulty levels, algorithmic random puzzle generation, real-time conflict detection, pencil marks (candidate notes), full undo history, automatic save/load via localStorage, a live timer and scoring system with best-score persistence, a hint system that reveals correct cell values, four selectable color themes, a win overlay modal, and a responsive no-scroll fit-to-viewport layout that works on desktop, laptop, iPad, and mobile.

### 🎮 Play Now

**[https://yongsin91.github.io/basic_sudoku/](https://yongsin91.github.io/basic_sudoku/)**

No installation required - just click and start solving!

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (CSS Grid, custom properties, `clamp()`, `dvh` units, media queries) |
| Logic | Vanilla JavaScript (ES6) |
| Dependencies | None |

---

## Architecture

The codebase follows a clean layered architecture where pure logic modules are separated from DOM-coupled code, enabling unit testing in Node.js without a browser:

```
Pure logic modules (no DOM, no globals, testable in Node):
  generator.js  — puzzle generation, solving, validation (29 tests)
  serialize.js  — state serialization: Sets ↔ arrays (21 tests)
  scoring.js    — score computation, time formatting, best scores (35 tests)
  storage.js    — shared localStorage safe-access helper

Orchestrator (DOM + localStorage + game state):
  script.js     — wires pure modules into the DOM, manages all game state,
                   handles keyboard/mouse input, timer, themes, save/load

Presentation:
  index.html    — page structure & DOM elements
  style.css     — all styling, 4 color themes, responsive fit-to-viewport layout
```

All pure modules use a dual-environment pattern: loaded via `<script>` in the browser (globals) and via `require()` in Node tests (`module.exports`).

---

## File Structure

```
basic_sudoku/
├── index.html                  # Page structure & DOM elements
├── style.css                   # All styling, themes, responsive layout
├── script.js                   # Game logic, event handling, save/load, timer, hints, themes
├── serialize.js                # Pure state serialization (Sets ↔ arrays)
├── scoring.js                  # Pure score computation, time formatting, best scores
├── storage.js                  # Shared localStorage safe-access helper
├── generator.js                # Puzzle generator (backtracking + MRV solver)
├── package.json                # npm metadata & test scripts
├── test/
│   ├── generator.test.js       # 29 assert-based tests for generator.js
│   ├── save-load.test.js       # 21 assert-based tests for serialize.js
│   └── scoring.test.js         # 35 assert-based tests for scoring.js
├── plan/                       # Design documents for all features and fixes
│   ├── PLAN-random-puzzle-generation.md
│   ├── PLAN-pencil-marks.md
│   ├── PLAN-save-load.md
│   ├── PLAN-scoring-system.md
│   ├── PLAN-hint-system.md
│   ├── PLAN-color-themes.md
│   ├── PLAN-win-overlay-compact-layout.md
│   ├── PLAN-no-scroll-fit-viewport.md
│   ├── PLAN-mobile-spacing-min-size.md
│   ├── PLAN-fix-browser-layout.md
│   ├── PLAN-fix-selected-cell-color.md
│   ├── PLAN-fix-highlight-selected-colors.md
│   └── PLAN-architecture-review.md
└── README.md                   # This documentation
```

---

## Capabilities

### Core Gameplay
- **9×9 Sudoku grid** with standard rules (row, column, 3×3 box uniqueness)
- **3 difficulty levels** - Easy, Medium, Hard (selected via buttons)
- **Algorithmic random puzzle generation** - each new game generates a unique puzzle on-the-fly using a backtracking solver with bitmask constraints and the MRV (minimum remaining values) heuristic
- **Unique-solution guarantee** - cells are removed only if the puzzle retains a single solution
- **Difficulty-scaled clue counts** - Easy (40-45 clues), Medium (32-36), Hard (25-30)

### Input Methods
- **Keyboard input** - Press 1-9 to place a number in the selected cell
- **On-screen number pad** - Click buttons 1-9 (essential for touch devices)
- **Erase** - Backspace, Delete, or 0 key removes the selected cell's value
- **Arrow keys** - Navigate between cells without clicking
- **Pen / Pencil toggle** - Press `P` or click the toggle button to switch between placing numbers and toggling candidate notes
- **Hint** - Press `H` or click the 💡 Hint button to reveal a correct value
- **Click outside board** - Clicking anywhere outside the board clears the current selection and highlights

### Visual Aids
- **Row / column / box highlighting** - Selecting a cell highlights its entire row, column, and 3×3 box with a subtle but clearly visible tint — distinct from both empty cells and the selected cell
- **Selected cell indicator** - Active cell gets a clearly distinct, brighter background color — the brightest of three visual levels (empty → highlight → selected), making it easy to identify which cell is selected
- **Conflict highlighting** - Cells that violate Sudoku rules (duplicate in row/column/box) turn red in real-time
- **Locked cell styling** - Pre-filled puzzle cells are visually distinct (bold, darker background) and cannot be edited
- **Hinted cell styling** - Cells revealed via hints are shown in blue, distinct from user-input (green) and locked (gray)

### Pencil Marks (Candidate Notes)
- **Pen / Pencil mode toggle** - Switch between placing numbers (pen) and toggling candidate notes (pencil) via the button or `P` key
- **3×3 mini-grid display** - Candidate digits are shown as small numbers in a 3×3 grid within each empty cell
- **Auto-clear on placement** - When a number is placed, that digit is automatically removed from pencil marks of all peer cells (same row, column, and 3×3 box)
- **Undo restores pencil marks** - Undoing a placement restores the pencil marks that were auto-cleared
- **Erase in pencil mode** - Clears all candidate notes in the selected cell

### Game Controls
- **Undo** - Full move history; undo step-by-step back to the original puzzle state (restores pencil marks too)
- **Clear** - Wipes all user-entered values and pencil marks, restoring the original puzzle in one action
- **Hint** - Reveals the correct value for one empty cell (selected cell if empty, otherwise random)
- **New Game** - Starts a new puzzle at the current difficulty (also accessible via the win overlay)

### Save / Load Game Progress
- **Automatic save** - The full game state (board, pencil marks, undo history, difficulty, pen/pencil mode, cell selection, timer, mistakes, hints) is saved to `localStorage` after every move - no manual save button needed
- **Automatic load** - On page load, the saved game is restored automatically; if no save exists (or it's corrupted), a fresh game starts
- **Persists across sessions** - Saved data survives browser restarts, machine reboots, and tab closures; it remains until the puzzle is solved or the browser's site data is cleared
- **Clears on win** - When the puzzle is solved, the save is removed so the next visit starts a fresh game
- **Graceful degradation** - If `localStorage` is unavailable (e.g. private browsing mode), save/load is silently skipped without errors

### Timer & Scoring System
- **Live timer** — Counts elapsed time from when a new game starts until the puzzle is solved, displayed in MM:SS format above the board
- **Mistake counter** — Tracks each time a player places a number that creates a conflict; displayed alongside the timer
- **Hint counter** — Tracks number of hints used; displayed alongside mistakes
- **Scoring formula** — Final score is computed from difficulty base (Easy: 1000, Medium: 2000, Hard: 3000) minus time penalty (1 pt/sec, capped at 50% of base) minus mistake penalty (30 pts/mistake, capped at 50% of base) minus hint penalty (50 pts/hint, capped at 50% of base), with a minimum of 10% of base
- **Best score persistence** — The highest score per difficulty is saved to `localStorage` and displayed in the win overlay; a "🏆 New!" badge appears when a new best is achieved
- **Timer persists across sessions** — Elapsed time is saved/restored via the save/load system, so the timer resumes correctly after a browser restart

### Hint System
- **On-demand hints** — Click the 💡 Hint button or press `H` to reveal the correct value for one empty cell; if a cell is selected and empty, that cell is hinted, otherwise a random empty cell is chosen
- **Conflict guard** — Hints are disabled when the board has conflicting placements; a "Fix conflicts first" message appears briefly
- **Hint penalty** — Each hint adds a 50-point penalty to the final score (capped at 50% of base), encouraging players to solve independently
- **Undoable** — Hint placements can be undone like any other move
- **Persists across sessions** — Hint count and hinted cells are saved/restored via the save/load system

### Color Themes
- **4 selectable themes** — Midnight (default dark), Light (high-contrast daytime), Forest (dark green), Ocean (dark teal)
- **Instant switching** — Select from the dropdown in the controls row; the theme applies immediately without reloading the page
- **CSS custom properties** — All colors are defined as semantic CSS variables on `:root`, overridden per-theme via `[data-theme]` attribute on `<body>`
- **Persistent preference** — The selected theme is saved to `localStorage['sudoku-theme']` (separate from game save) and restored on next visit
- **Graceful fallback** — If localStorage is unavailable or the saved theme is invalid, defaults to Midnight

### Win State
- **Auto-detection** — Game detects completion when all 81 cells are filled with no conflicts
- **Win overlay** — Styled modal "🎉 You solved it!" overlay centered on screen with a dimmed backdrop, showing time, mistakes, hints, final score, and best score, with a "New Game" button (no browser alerts, no scrolling needed)

### Responsive Design — Fit-to-Viewport (No Scrolling)
- **Viewport-height sizing** — Board size is `max(240px, min(450px, 92vw, 100dvh − 310px))`, so it scales to fit both width and height of any screen — laptop, desktop, iPad, or mobile — with zero scrolling on normal screens
- **Minimum board size** — Board never shrinks below 240px (~26px per cell, the minimum for playable touch interaction). Below this, the game is not playable
- **Three-tier viewport handling**:
  - **Normal screens (height ≥ 550px)**: Board scales to fit, `overflow: hidden`, no scrolling
  - **Short screens (height < 550px)**: Board clamped to 240px minimum, `overflow: auto` allows scrolling to reach content that doesn't fit
  - **Extremely small screens (height < 320px or width < 280px)**: Error overlay shown ("Screen too small. Please rotate your device or use a larger screen."), game hidden entirely
- **`100dvh`** (dynamic viewport height) adapts to mobile browser UI appearing/disappearing
- **`clamp()` scaling** — Gaps (6–16px), body padding (8–20px), button fonts, and cell fonts all scale with viewport height, shrinking on shorter screens to maximize board space
- **Proportional cell fonts** — Cell and pencil mark font sizes are `calc(var(--board-size) / N)`, so text stays in proportion as the board grows or shrinks
- **Board, number pad, status bar, controls, and action buttons** all share the same `--board-size` width, keeping the layout aligned at any size
- **Proportional button padding** — Button horizontal padding is `calc(var(--board-size) * N)`, so it shrinks proportionally with the board. On desktop, buttons stay on one row (`flex-wrap: nowrap`); on mobile (≤520px), wrapping is allowed (`flex-wrap: wrap`) to prevent edge-touching

---

## CSS Variables Reference (`style.css`)

### Theme Variables (defined per theme via `[data-theme]`)

| Variable | Purpose |
|---|---|
| `--bg-page` | Page background |
| `--color-text` | Main text color |
| `--color-text-dim` | Dimmed text (labels, counters, pencil marks) |
| `--color-accent` | Primary accent (h1, difficulty buttons, board border, pencil button, conflict text, best score) |
| `--color-secondary` | Secondary accent (action buttons, timer, user-input text, win text, score) |
| `--color-hint` | Hint color (hinted cells, hint button) |
| `--bg-board` | Board background, number pad button background, win banner background |
| `--bg-cell-locked` | Locked cell background |
| `--color-cell-locked` | Locked cell text color |
| `--bg-cell-selected` | Selected cell background (brightest of three levels) |
| `--bg-cell-highlight` | Highlighted cell background (subtle tint, between empty and selected) |
| `--color-cell-border` | Cell border, number pad button border |
| `--bg-conflict` | Conflict cell background |

### Viewport-Fit Variables (defined on `:root`)

| Variable | Formula | Purpose |
|---|---|---|
| `--board-max` | `450px` | Maximum board size |
| `--board-min` | `240px` | Minimum playable board size |
| `--board-size` | `max(--board-min, min(--board-max, 92vw, 100dvh − 310px))` | Actual board size (constrained by width, height, and min/max) |
| `--gap` | `clamp(6px, 2vh, 16px)` | Gap between UI elements in the container |
| `--pad` | `clamp(8px, 2vh, 20px)` | Body padding |

---

## Functions Reference (`generator.js`)

| Function | Description |
|---|---|
| `bit(d)` | Returns `1 << d` - bitmask for digit `d` |
| `buildMasks(board)` | Builds row/column/box constraint bitmasks from the current board |
| `isValid(board, row, col, val)` | Checks if `val` can be legally placed at `(row, col)` |
| `generateFullSolution()` | Generates a complete, valid 9×9 solution using randomized backtracking with MRV |
| `countSolutions(board, limit)` | Counts solutions up to `limit` (default 2); returns 0, 1, or `limit` |
| `solveBoard(board)` | Solves a board and returns the full 81-cell solution, or `null` if no solution exists (conflicts or unsolvable) |
| `createPuzzle(solution, targetClues)` | Removes cells from a full solution while maintaining a unique solution |
| `getTargetClueCount(difficulty)` | Returns a random clue count within the difficulty's range |
| `generatePuzzle(difficulty)` | Orchestrator: generates a complete puzzle for the given difficulty |
| `shuffle(arr)` | Fisher-Yates shuffle (used for randomization) |

---

## Functions Reference (`serialize.js`)

| Function | Description |
|---|---|
| `serializeState(state)` | Converts a game state object (with `Set` arrays) into a plain JSON-serializable object |
| `deserializeState(data)` | Converts a plain serialized object back into a game state object (reconstructs `Set`s from arrays); returns `null` on invalid input |

---

## Functions Reference (`scoring.js`)

| Function | Description |
|---|---|
| `computeScore(difficulty, elapsedSeconds, mistakeCount, hintCount)` | Computes final score from difficulty, time, mistakes, and hints; returns `{ base, timePenalty, mistakePenalty, hintPenalty, final, breakdown }` |
| `formatTime(seconds)` | Formats seconds as `MM:SS` string |
| `getBestScores()` | Reads all best scores from `localStorage`; returns `{ easy, medium, hard }` or `{}` |
| `getBestScore(difficulty)` | Reads the best score for a single difficulty; returns `0` if none exists |
| `saveBestScore(difficulty, score)` | Saves score as best for its difficulty if higher than existing; returns `true` if new best |

---

## Functions Reference (`storage.js`)

| Function | Description |
|---|---|
| `withLocalStorage(fn, fallback)` | Executes `fn` with localStorage access, returning `fallback` if storage is unavailable or `fn` throws |

---

## Functions Reference (`script.js`)

### Game State

| Function / Variable | Description |
|---|---|
| `board` | Array of 81 integers representing the current board state (0 = empty) |
| `originalPuzzle` | Snapshot of the starting puzzle; used to identify locked cells |
| `moveHistory` | Stack of `{ row, col, prevValue, newValue, pencilSnapshot, hinted? }` objects for undo support |
| `selectedCell` | `{ row, col }` of the currently selected cell, or `null` |
| `currentDifficulty` | String tracking the active difficulty (`'easy'`, `'medium'`, `'hard'`) |
| `pencilMarks` | Array of 81 `Set` objects, each containing candidate digits (1-9) for that cell |
| `pencilMode` | Boolean — `false` = pen mode (place numbers), `true` = pencil mode (toggle candidates) |
| `elapsedSeconds` | Number — accumulated seconds for the current game (persisted via save/load) |
| `mistakeCount` | Number — total conflicting placements this game (persisted via save/load) |
| `hintCount` | Number — total hints used this game (persisted via save/load) |
| `hintedCells` | `Set` — indices of cells revealed via hint (persisted via save/load) |
| `timerInterval` | `setInterval` ID for the timer tick (runtime only, not persisted) |
| `timerRunning` | Boolean — whether the timer is actively ticking (runtime only, not persisted) |
| `initPencilMarks()` | Initializes the `pencilMarks` array with 81 empty Sets |

### Rendering

| Function | Description |
|---|---|
| `renderBoard()` | Clears and rebuilds the 9×9 grid DOM, populates values, renders pencil mark mini-grids, marks locked/user-input/hinted cells, applies highlights |
| `applyHighlights()` | Highlights the selected cell's row, column, and 3×3 box; selected cell gets `.selected` class, peers get `.highlight`; calls conflict highlighting |

### Selection & Navigation

| Function | Description |
|---|---|
| `selectCell(row, col)` | Selects a cell if it's not locked; updates `selectedCell` and triggers highlights |
| `moveSelection(dr, dc)` | Moves the selection by `dr` rows and `dc` columns (clamped to 0-8); used by arrow keys |

### Input & Pencil Marks

| Function | Description |
|---|---|
| `placeNumber(num)` | In pen mode: places a number, auto-clears peer pencil marks, pushes to undo stack, tracks mistakes. In pencil mode: delegates to `togglePencilMark()` |
| `togglePencilMark(num)` | Toggles a candidate digit in the selected cell's pencil mark Set |
| `clearPencilMarksFromPeers(row, col, num)` | Removes `num` from pencil marks of all peer cells (row, column, box); returns a snapshot for undo |
| `eraseSelected()` | In pen mode: clears the selected cell's value. In pencil mode: clears all pencil marks in the selected cell |
| `togglePencilMode()` | Switches between pen and pencil mode; updates button label and styling |

### Timer & Display

| Function | Description |
|---|---|
| `tickTimer()` | Shared timer logic: updates displays, starts 1-second interval, sets `timerRunning` |
| `startTimer()` | Resets `elapsedSeconds` to 0, calls `tickTimer()` |
| `resumeTimer()` | Calls `tickTimer()` without resetting (used on save/load restore) |
| `stopTimer()` | Clears the timer interval, sets `timerRunning` to false |
| `updateTimerDisplay()` | Updates the `#timer` element text with formatted elapsed time |
| `updateMistakeDisplay()` | Updates the `#mistakes` element text with current mistake count |
| `updateHintDisplay()` | Updates the `#hints` element text with current hint count |

### Hint System

| Function | Description |
|---|---|
| `giveHint()` | Finds an empty cell, solves the board, places the correct value, marks it as hinted, pushes to undo, increments hint counter |
| `updateHintDisplay()` | Updates the `#hints` element text with current hint count |

### Theme System

| Function | Description |
|---|---|
| `applyTheme(themeName)` | Sets `data-theme` attribute on `<body>`, syncs the select dropdown |
| `getSavedTheme()` | Reads theme from `localStorage`, validates against known themes, defaults to `'midnight'` |
| `saveTheme(themeName)` | Writes theme name to `localStorage` |

### Validation

| Function | Description |
|---|---|
| `applyConflictHighlighting()` | Scans all filled cells and adds the `conflict` CSS class to any with duplicates in their row/column/box |
| `hasConflict(row, col, val)` | Returns `true` if `val` at `(row, col)` conflicts with another cell in the same row, column, or 3×3 box |
| `isBoardComplete()` | Returns `true` if all 81 cells are filled and there are zero conflicts |
| `checkWin()` | On win: stops timer, computes score, saves best score, populates win overlay with results, clears save |

### Save / Load

| Function | Description |
|---|---|
| `saveGame()` | Serializes the full game state and writes it to `localStorage['sudoku-save']`; called after every state-changing action |
| `loadGame()` | Reads and parses the save from `localStorage`, restores all state variables, syncs UI buttons, calls `checkWin()` to handle already-solved games; returns `false` if no save or parse error |
| `clearSave()` | Removes the save entry from `localStorage`; called on win and before a fresh new game |

### Game Management

| Function | Description |
|---|---|
| `newGame(difficulty)` | Generates a random puzzle via `generatePuzzle()`, resets all state (board, pencil marks, mistakes, hints, timer), re-renders the board, updates active button styling |

### Event Listeners

| Element | Trigger | Action |
|---|---|---|
| `.cell` (each) | `click` | Calls `selectCell(row, col)` |
| `.num-btn` (each) | `click` | Calls `placeNumber(num)` |
| `#btn-undo` | `click` | Pops last move from history, restores previous value and pencil marks |
| `#btn-clear` | `click` | Resets all user-entered cells to empty, clears pencil marks and history |
| `#btn-pencil` | `click` | Toggles between pen and pencil mode |
| `#btn-hint` | `click` | Calls `giveHint()` |
| `#btn-easy` | `click` | Calls `newGame('easy')` |
| `#btn-medium` | `click` | Calls `newGame('medium')` |
| `#btn-hard` | `click` | Calls `newGame('hard')` |
| `#btn-new-game` | `click` | Calls `newGame(currentDifficulty)` |
| `#theme-select` | `change` | Calls `applyTheme()` and `saveTheme()` |
| `document` | `click` | If click target is not a `.cell`, clears `selectedCell` and removes highlights |
| `document` | `keydown` | Handles 1-9 input, erase (Backspace/Delete/0), arrow key navigation, `P` to toggle pen/pencil, `H` for hint |

---

## CSS Classes Reference (`style.css`)

| Class | Element | Description |
|---|---|---|
| `.container` | Main wrapper | Flex column, centered, `gap: var(--gap)` |
| `.controls` | Difficulty + theme row | Flex row, `width: var(--board-size)`, `nowrap` on desktop, `wrap` on mobile |
| `.diff-btn` | Difficulty buttons | Accent border, proportional horizontal padding `calc(var(--board-size) * 0.025)` |
| `.theme-select` | Theme dropdown | Pill-shaped (16px radius), dim border, `margin-left: auto`, proportional padding |
| `.status-bar` | Timer + counters | Flex row, `width: var(--board-size)`, space-between |
| `.timer` | Timer span | Bold, `var(--color-secondary)`, tabular-nums, `clamp()` font size |
| `.mistakes` | Mistakes span | `var(--color-text-dim)` |
| `.hints` | Hints span | `var(--color-text-dim)` |
| `.board` | Grid container | 9-column CSS grid, `var(--board-size)` × `var(--board-size)`, accent border |
| `.cell` | Each grid cell | Flex-centered, `font-size: calc(var(--board-size) / 20)`, cell border |
| `.cell.locked` | Pre-filled cells | Bold, `var(--bg-cell-locked)` background, `var(--color-cell-locked)` text, not editable |
| `.cell.user-input` | User-entered values | `var(--color-secondary)` text color |
| `.cell.hinted` | Hint-revealed cells | `var(--color-hint)` text color |
| `.cell.highlight` | Row/col/box peers | `var(--bg-cell-highlight)` — visible tint between empty and selected |
| `.cell.selected` | Active cell | `var(--bg-cell-selected)` — brightest of three levels (must come after `.highlight` in CSS) |
| `.cell.conflict` | Rule-violating cells | `var(--color-accent)` text + `var(--bg-conflict)` background (`!important`, overrides all) |
| `.pencil-grid` | Mini-grid inside cells | 3×3 CSS grid for displaying candidate digits |
| `.pencil-grid span` | Each candidate slot | `font-size: calc(var(--board-size) / 50)`, `var(--color-text-dim)` |
| `.number-pad` | Number pad grid | 9-column grid, `width: var(--board-size)`, `gap: clamp(2px, 1vh, 6px)` |
| `.num-btn` | Number pad buttons | `var(--bg-board)` background, `clamp()` padding and font size |
| `.action-buttons` | Action button row | Flex row, `width: var(--board-size)`, `nowrap` on desktop, `wrap` on mobile |
| `.action-btn` | Undo/Clear/Pen/Hint/New Game | Secondary accent border, proportional padding `calc(var(--board-size) * 0.03)` |
| `.pencil-btn` | Pen/Pencil toggle | Accent border color, `.active` fills with accent |
| `.pencil-btn.active` | Pencil mode active | Accent-filled button |
| `.hint-btn` | Hint button | Hint color border, hover fills with hint color |
| `.hint-message` | Conflict warning | Accent color text, hidden by default |
| `.win-overlay` | Win overlay backdrop | Full-viewport fixed overlay, semi-transparent background, flex-centers win banner |
| `.win-banner` | Win message container | Centered inside overlay, themed background, box-shadow, hidden when overlay has `.hidden` |
| `.win-stats` | Score breakdown container | Column layout in win banner |
| `.win-stat-row` | Score row | Label-value flex row |
| `.win-stat-label` | Row label | `var(--color-text-dim)` |
| `.win-stat-value` | Row value | Bold, tabular-nums, `var(--color-text)` |
| `.win-score-row` | Score row | `var(--color-secondary)` value, larger font |
| `.win-best-row` | Best score row | `var(--color-accent)` value |
| `.screen-error` | Screen-too-small error | Centered error message, shown via media query when viewport is extremely small |
| `.hidden` | Any element | `display: none` |

---

## How to Run

1. **Play online** - Visit [https://yongsin91.github.io/basic_sudoku/](https://yongsin91.github.io/basic_sudoku/) (hosted via GitHub Pages)
2. **Run locally** - Open `index.html` directly in a browser, **or**
3. **Serve via a local HTTP server:**
   ```bash
   cd basic_sudoku
   python3 -m http.server 8765
   ```
   Then visit `http://localhost:8765/index.html`

### Run Tests

```bash
cd basic_sudoku
npm test               # 29 generator tests
npm run test:save      # 21 save/load serialization tests
npm run test:scoring   # 35 scoring tests
npm run test:all       # all 85 tests
```
All tests use Node's built-in `assert` module — no external dependencies.

---

## Future Enhancements (Not Yet Implemented)

- Puzzle import / export