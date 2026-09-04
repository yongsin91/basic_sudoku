# Plan: Random Puzzle Generation

## Branch
`feature/random-puzzle-generation`

## Goal
Replace the current static puzzle bank (15 hardcoded puzzles) with a procedural puzzle generator that creates a new, unique, solvable Sudoku puzzle on every "New Game" — while preserving the existing difficulty system (Easy / Medium / Hard).

---

## Current State

- `PUZZLES` object in `script.js` holds 5 puzzles per difficulty (15 total), stored as 81-char strings.
- `newGame()` picks a random puzzle **from the hardcoded list** for the selected difficulty.
- No puzzle generation logic exists — the game is limited to the 15 pre-made puzzles.

---

## Design

### High-Level Approach

1. **Generate a complete, valid Sudoku solution** using a randomized backtracking algorithm.
2. **Remove cells** from the solved board to create a puzzle, stopping when the desired number of clues for the difficulty level is reached.
3. **Verify uniqueness** — ensure the puzzle has exactly one solution (optional but recommended for quality).

### Algorithm Details

#### Step 1: Generate Full Solution

```
function generateFullSolution():
    - Start with an empty 9×9 board (all zeros)
    - Use backtracking with randomized number order:
        - For each empty cell (scanned left-to-right, top-to-bottom):
            - Try digits 1–9 in random order
            - Recursively attempt to fill the rest
            - Backtrack on failure
    - Return the fully solved board
```

- Randomization of digit order ensures a different solution every run.
- Standard backtracking is fast enough for 9×9 (typically < 50ms).

#### Step 2: Remove Cells

```
function createPuzzle(solution, numCluesToRemove):
    - Copy the solution into a puzzle array
    - Create a shuffled list of all 81 cell indices
    - Remove cells one by one (set to 0):
        - After each removal, check the puzzle still has a unique solution
        - If removing a cell creates multiple solutions, restore it and skip
        - Stop when enough cells have been removed (target clue count reached)
    - Return the puzzle
```

**Target clue counts per difficulty:**

| Difficulty | Clues (filled cells) | Cells Removed |
|-----------|----------------------|---------------|
| Easy      | ~40–45               | ~36–41        |
| Medium    | ~32–36               | ~45–49        |
| Hard      | ~25–30               | ~51–56        |

#### Step 3: Uniqueness Check

```
function countSolutions(board, limit=2):
    - Backtracking solver that counts solutions
    - Stops early once it finds 2 solutions (we only need to know if it's unique)
    - Returns 0, 1, or 2 (2 meaning "not unique")
```

- This is the most expensive part. To keep it performant:
  - Use efficient backtracking with constraint propagation
  - Early-exit at 2 solutions
  - For Easy/Medium, uniqueness checks are fast; Hard may take slightly longer

---

## Implementation Plan

### Files to Modify

| File | Changes |
|------|---------|
| `script.js` | Import generator from `generator.js`; update `newGame()` to use generated puzzles; keep `PUZZLES` as a fallback |
| `generator.js` | **New file** — pure logic module containing all generator functions (no DOM dependencies) |
| `test/generator.test.js` | **New file** — test cases for all generator functions using `node:test` and `node:assert` |
| `package.json` | **New file** — minimal, just `"test": "node --test test/"` script entry |

### New Functions in `script.js`

| Function | Purpose |
|----------|---------|
| `generateFullSolution()` | Backtracking solver that fills an empty board with a random valid solution |
| `countSolutions(board, limit)` | Counts solutions (up to `limit`) for uniqueness checking |
| `createPuzzle(solution, targetClues)` | Removes cells from a full solution to create a puzzle with unique solution |
| `generatePuzzle(difficulty)` | Orchestrates: generate solution → remove cells → return puzzle array |
| `getTargetClueCount(difficulty)` | Returns the target number of clues for a given difficulty |

### Changes to Existing Code

- **`newGame()`** — Replace `PUZZLES[difficulty][randomIndex]` lookup with `generatePuzzle(difficulty)`.
- **`PUZZLES`** — Keep as a fallback in case generation fails (shouldn't happen, but safety net).
- **`currentDifficulty`** — No change needed; already tracks difficulty.

---

## Edge Cases & Risks

| Risk | Mitigation |
|------|-----------|
| Generation takes too long | Set a timeout/fallback to static puzzles; backtracking is typically fast |
| Uniqueness check is slow on Hard | Early-exit at 2 solutions; consider skipping uniqueness for Hard if performance is an issue |
| Generated puzzle is unsolvable | Shouldn't happen — we start from a valid solution and only remove cells |
| Browser freezes during generation | Run synchronously (fast enough for 9×9); if needed, could use a Web Worker in the future |

---

## Testing Plan

### Test Framework Setup

Since the project has no existing test framework, we'll add a lightweight setup:

- **Test runner** — Use Node.js's built-in `node:test` and `node:assert` (no external dependencies, consistent with the vanilla JS philosophy).
- **Test file** — `test/generator.test.js` — tests for the puzzle generation functions.
- **Script entry** — Add `"test": "node --test test/"` to a minimal `package.json` so tests run with `npm test`.
- **Module export** — The generator functions in `script.js` need to be importable. Since `script.js` currently runs in the browser with top-level DOM code, we'll either:
  - **Option A (preferred):** Extract generator functions into a separate `generator.js` module that both `script.js` and the test file import. This keeps browser code clean and testable.
  - **Option B:** Add a `module.exports` guard at the bottom of `script.js` (e.g., `if (typeof module !== 'undefined') module.exports = { ... }`). Less clean but avoids restructuring.

  **Recommendation:** Option A — extract to `generator.js`. This is a natural separation of concerns (pure logic vs. DOM/UI code) and makes testing straightforward.

### Test Cases for Random Puzzle Generation

#### `generateFullSolution()`

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Returns an array of 81 integers | Length === 81 |
| 2 | All values are 1–9 (no zeros) | Every element in range [1, 9] |
| 3 | Each row contains digits 1–9 exactly once | All 9 rows are valid |
| 4 | Each column contains digits 1–9 exactly once | All 9 columns are valid |
| 5 | Each 3×3 box contains digits 1–9 exactly once | All 9 boxes are valid |
| 6 | Two consecutive calls produce different boards | Not deep-equal (randomness check) |

#### `countSolutions(board, limit)`

| # | Test | Expected Result |
|---|------|-----------------|
| 7 | Empty board (all zeros) → `countSolutions(board, 2)` | Returns 2 (many solutions, early-exit) |
| 8 | Fully solved board → `countSolutions(board, 2)` | Returns 1 (exactly one solution) |
| 9 | Board with a conflict (duplicate in a row) → `countSolutions(board, 2)` | Returns 0 (no valid solutions) |

#### `createPuzzle(solution, targetClues)`

| # | Test | Expected Result |
|---|------|-----------------|
| 10 | Returned puzzle has exactly `targetClues` non-zero cells | Count of non-zero === targetClues |
| 11 | All non-zero cells match the original solution | Puzzle is a subset of the solution |
| 12 | Puzzle has a unique solution | `countSolutions(puzzle, 2)` === 1 |

#### `generatePuzzle(difficulty)`

| # | Test | Expected Result |
|---|------|-----------------|
| 13 | Returns an array of 81 integers | Length === 81 |
| 14 | Clue count is within the expected range for the difficulty | Easy: 40–45, Medium: 32–36, Hard: 25–30 |
| 15 | Puzzle has a unique solution | `countSolutions(puzzle, 2)` === 1 |
| 16 | Puzzle is solvable (solution matches) | Solver can complete it |
| 17 | Two consecutive calls produce different puzzles | Not deep-equal (randomness check) |
| 18 | Works for all three difficulties | No errors for 'easy', 'medium', 'hard' |

#### Performance

| # | Test | Expected Result |
|---|------|-----------------|
| 19 | `generatePuzzle('easy')` completes in < 500ms | `performance.now()` delta < 500 |
| 20 | `generatePuzzle('hard')` completes in < 1000ms | `performance.now()` delta < 1000 |

### Manual / Integration Testing

Since the game logic interacts with the DOM, integration tests remain manual for now:

1. **Difficulty feel** — Play through generated puzzles at each level; confirm Easy feels easy, Hard feels hard.
2. **Full game flow** — Select difficulty → new game → play → win → new game; verify no regressions.
3. **Fallback** — If generation fails, confirm the game falls back to a static puzzle without crashing.

### Testing Scope Note

> **This testing plan covers only the random puzzle generation feature.**
> A comprehensive test suite for the existing Sudoku game (rendering, input handling, conflict detection, undo, win detection, etc.) is **out of scope** for this branch and will be reviewed and added as a separate effort after this feature is merged.

---

## Out of Scope (Future Enhancements)

- **Test suite for existing Sudoku game** — rendering, input handling, conflict detection, undo, win detection. Will be reviewed and added as a separate effort after this feature merges.
- Web Worker for non-blocking generation
- Difficulty based on solving techniques required (not just clue count)
- Puzzle validation UI (show user if puzzle has unique solution)
- Export/import puzzles
- Timer and statistics

---

## Review Checklist

- [ ] Algorithm design is sound (backtracking + cell removal + uniqueness check)
- [ ] Target clue counts are reasonable for each difficulty
- [ ] Fallback to static puzzles is in place
- [ ] No breaking changes to existing game flow
- [ ] Performance is acceptable for a browser game
- [ ] Code follows existing style (vanilla JS, no dependencies)
- [ ] Generator functions are extracted into a testable module (`generator.js`)
- [ ] Test framework setup (`node:test`) is minimal and dependency-free
- [ ] All 20 test cases pass for the generator functions
- [ ] Manual integration testing confirms no regressions in game flow