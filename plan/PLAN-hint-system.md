# Plan: Hint System

## Goal

Add a hint system that reveals the correct value for one empty cell when the player is stuck. Hints are scored with a penalty to discourage overuse, and hinted cells are visually distinct from user-input and locked cells.

---

## Design

### How Hints Work

1. Player clicks the **Hint** button (or presses `H`)
2. If a cell is selected and it's empty → hint that cell
3. If no cell selected (or selected cell is filled) → pick a random empty cell
4. Solve the current board to find the correct value for that cell
5. Place the correct value, mark the cell as "hinted" (blue styling)
6. Push to undo history (undoable like any other placement)
7. Auto-clear pencil marks from peers (same as `placeNumber`)
8. Increment hint counter

### Solving the Board

Add `solveBoard(board)` to `generator.js` — a pure function that returns the full solution for a given board state, or `null` if no solution exists (e.g. the player has conflicting placements). Based on the existing bitmask + MRV solver infrastructure.

### Conflict Guard

If any filled cell on the board has a conflict, hints are disabled — the player must fix their mistakes first. A brief "Fix conflicts first" message appears in the hint button area.

### Hint Cell Selection

- **Selected cell is empty** → hint that cell
- **No selection or selected cell is filled** → pick a random empty cell
- Cells that are locked (pre-filled) are never hinted

### Scoring Impact

```
HINT_PENALTY_PER = 50  (higher than mistakes at 30, discourages overuse)

hintPenalty = min(hintCount * HINT_PENALTY_PER, base * PENALTY_CAP_FRACTION)

Final score = max(base × 0.1, base − timePenalty − mistakePenalty − hintPenalty)
```

The hint penalty gets its own cap (50% of base), same as time and mistake penalties.

### Visual Design

- **Hinted cells**: Blue text (`#5dade2`), distinct from:
  - Locked cells: gray, bold, dark background
  - User-input cells: green (`#4ecca3`)
  - Conflict cells: red (`#e94560`)
- **Hint button**: Added to the action buttons row, styled with a blue border
- **Hint counter**: Shown in the status bar as "Hints: N" next to "Mistakes: N"

---

## State to Add

| Variable | Type | Purpose | Persisted? |
|---|---|---|---|
| `hintCount` | `number` | Total hints used this game | ✅ via save/load |
| `hintedCells` | `Set` | Indices of cells revealed via hint (for styling) | ✅ via save/load |

---

## Tasks

### Task 1 — Add `solveBoard()` to `generator.js`

Pure function using existing bitmask + MRV solver. Returns solution array or `null`. Includes conflict validation (same as `countSolutions`). Export for Node testing.

**Commit:** `Add solveBoard() function to generator.js`

### Task 2 — Add hint penalty to `scoring.js`

- Add `HINT_PENALTY_PER = 50` constant
- Update `computeScore()` to accept `hintCount` parameter and compute `hintPenalty`
- Update return to include `hintPenalty` and updated `breakdown`
- Export new constant

**Commit:** `Add hint penalty to scoring system`

### Task 3 — Add hint UI to `index.html`

- Hint button in action buttons row: `<button id="btn-hint">💡 Hint</button>`
- Hint counter in status bar: `<span id="hints">Hints: 0</span>`
- Hint conflict message element (hidden by default)

**Commit:** `Add hint button and counter to HTML`

### Task 4 — Add CSS for hinted cells and hint button

- `.cell.hinted` — blue text color
- `.hint-btn` — blue-bordered button
- `.hints` — status bar hint counter styling
- `.hint-message` — conflict warning message styling
- Responsive adjustments

**Commit:** `Add CSS styling for hint feature`

### Task 5 — Integrate hint logic into `script.js`

- Add `hintCount`, `hintedCells` state variables
- `giveHint()` function:
  1. Check for conflicts on board → if any, show message, return
  2. Determine target cell (selected if empty, else random empty)
  3. Call `solveBoard(board)` to get solution
  4. Place correct value, add to `hintedCells`
  5. Push to undo with `hinted: true` flag
  6. Clear pencil marks from peers
  7. Increment `hintCount`, update display
  8. `renderBoard()`, `checkWin()`, `saveGame()`
- `updateHintDisplay()` — updates `#hints` element
- Update `renderBoard()` to apply `.hinted` class
- Update `placeNumber()` — if overwriting a hinted cell, remove from `hintedCells`
- Update undo handler — restore `hintedCells` state
- Update `newGame()` — reset `hintCount = 0`, clear `hintedCells`
- Update `checkWin()` — pass `hintCount` to `computeScore()`, add hint count to win banner
- Keyboard `H` key handler
- Hint button click handler

**Commit:** `Integrate hint logic into game`

### Task 6 — Integrate with save/load system

- Update `serialize.js`: add `hintCount` and `hintedCells` (Set → array) to serialize/deserialize
- Update `script.js`: include in `saveGame()` state, restore in `loadGame()`

**Commit:** `Integrate hint state with save/load system`

### Task 7 — Add tests

- `test/generator.test.js`: add tests for `solveBoard()` (valid solution, null on conflict, null on unsolvable, already-complete board)
- `test/scoring.test.js`: add tests for hint penalty (penalty amount, cap, breakdown, combined with other penalties)

**Commit:** `Add tests for solveBoard and hint penalty`

### Task 8 — Update README

- Bump version to `1.5.0`
- Add "Hint System" to Capabilities section
- Add `solveBoard()` to generator.js functions reference
- Add `HINT_PENALTY_PER` and updated `computeScore` to scoring.js reference
- Add `hintCount`, `hintedCells` to game state reference
- Add `giveHint()` to script.js functions reference
- Add `.cell.hinted`, `.hint-btn`, `.hints` to CSS reference
- Remove "Hint system" from Future Enhancements
- Update test counts

**Commit:** `Update README for v1.5.0: document hint system`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Board has conflicts | Hint disabled, show "Fix conflicts first" message |
| No empty cells | Hint button does nothing (board is complete) |
| Solve returns null | Same as conflicts — show message |
| Undo a hint | Cell value reverts to empty, removed from `hintedCells` |
| Overwrite a hinted cell with own input | Cell removed from `hintedCells`, styled as `user-input` |
| Clear button | Hinted cells cleared, `hintedCells` emptied, `hintCount` stays |
| New game | `hintCount` reset to 0, `hintedCells` cleared |
| Old save (no hint data) | `deserializeState` defaults `hintCount` to 0, `hintedCells` to empty Set |

---

## Out of Scope

- Smart hint selection (naked singles, hidden singles, etc.)
- Hint history / replay
- Limiting number of hints per game
- Hint explanations (just reveals the value)