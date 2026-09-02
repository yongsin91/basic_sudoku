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
| `script.js` | Add generator functions; update `newGame()` to use generated puzzles; keep `PUZZLES` as a fallback |

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

Since there's no test framework, testing will be manual:

1. **Solubility** — Generate 10 puzzles per difficulty; manually verify each is solvable.
2. **Uniqueness** — For each generated puzzle, run `countSolutions` and confirm it returns 1.
3. **Difficulty feel** — Play through generated puzzles at each level; confirm Easy feels easy, Hard feels hard.
4. **Performance** — Time `generatePuzzle()` for each difficulty; confirm it completes in under 500ms.
5. **Integration** — Verify the full game flow: select difficulty → new game → play → win → new game.

---

## Out of Scope (Future Enhancements)

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