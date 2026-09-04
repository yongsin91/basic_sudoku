# Plan: Save / Load Game Progress (localStorage)

## Goal

Allow players to close the browser and resume their Sudoku puzzle exactly where they left off — board state, pencil marks, undo history, difficulty, and pen/pencil mode all restored.

## Background

The game runs as a static site on GitHub Pages with no backend. All game state lives in 7 global variables in `script.js`. The browser's `localStorage` API provides persistent on-disk storage that survives browser restarts and machine reboots.

---

## State to Persist

| Variable | Type | Serialization |
|---|---|---|
| `originalPuzzle` | `number[81]` | Direct (plain array) |
| `board` | `number[81]` | Direct (plain array) |
| `pencilMarks` | `Set[81]` | Convert each Set → array for save; array → Set on load |
| `moveHistory` | `object[]` | Direct (plain objects with serializable values) |
| `currentDifficulty` | `string` | Direct |
| `pencilMode` | `boolean` | Direct |
| `selectedCell` | `object \| null` | Direct (optional — skip to avoid restoring selection) |

**Decision:** Save `selectedCell` too — it's a small object and restoring selection improves UX. If null, it stays null.

---

## Storage Key

```
sudoku-save
```

Single JSON object, ~1–3 KB. Well within localStorage's ~5 MB limit.

---

## Tasks

### Task 1 — Add `saveGame()` and `loadGame()` functions

Add two functions to `script.js`:

- **`saveGame()`** — Serializes all 7 variables into a JSON object, writes to `localStorage['sudoku-save']`. Includes a `try/catch` for safety (quota exceeded, disabled storage, etc.).
- **`loadGame()`** — Reads and parses `localStorage['sudoku-save']`. Reconstructs Sets from arrays. Restores all variables. Returns `true` if a save was loaded, `false` if none exists or parsing failed.

Also add a **`clearSave()`** helper that removes the key — used when starting a fresh new game.

**Commit:** `Add save/load/clear localStorage helper functions`

---

### Task 2 — Hook `saveGame()` into all state-changing actions

Call `saveGame()` at the end of every function that modifies game state:

- `placeNumber()` — after `renderBoard()` / `checkWin()`
- `eraseSelected()` — after `renderBoard()`
- `togglePencilMark()` — after `renderBoard()`
- `togglePencilMode()` — after updating button label
- Undo button handler — after `renderBoard()`
- Clear button handler — after `renderBoard()`
- `newGame()` — after `renderBoard()` (saves the fresh puzzle state)

**Commit:** `Wire saveGame() into all state-changing actions`

---

### Task 3 — Auto-load on page startup

Replace the final line `newGame('easy')` at the bottom of `script.js` with:

```js
if (!loadGame()) {
    newGame('easy');
}
```

This tries to restore a saved game first; if none exists (or it fails), it starts a fresh easy game as before.

**Commit:** `Auto-load saved game on page startup`

---

### Task 4 — Clear save on win

When the player solves the puzzle, the save should be cleared so that reloading the page starts a fresh game instead of showing the completed board.

Modify `checkWin()`:
- If `isBoardComplete()` is true → show win banner AND call `clearSave()`

**Commit:** `Clear save when puzzle is solved`

---

### Task 5 — Add tests for save/load serialization

Add a test file `test/save-load.test.js` that tests the serialization logic in isolation (the pure data transformation, not DOM/localStorage):

- Round-trip: save → load produces identical state
- Pencil marks Sets survive round-trip
- Empty/missing save returns false
- Corrupted JSON returns false (doesn't throw)

Since `saveGame`/`loadGame` reference `localStorage` and DOM, extract the **serialization/deserialization** logic into pure helper functions (`serializeState()` / `deserializeState()`) that can be tested in Node without a browser.

**Commit:** `Add tests for save/load state serialization`

---

### Task 6 — Update README

- Bump version to `1.3.0`
- Add "Save / Load Game Progress" to the Capabilities section
- Add `saveGame()`, `loadGame()`, `clearSave()`, `serializeState()`, `deserializeState()` to the Functions Reference
- Move "Save / load game progress" from Future Enhancements to implemented

**Commit:** `Update README for v1.3.0: document save/load feature`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| No save exists | `loadGame()` returns false → `newGame('easy')` |
| Corrupted JSON | `try/catch` in `loadGame()` → returns false → fresh game |
| localStorage disabled (private mode) | `try/catch` in `saveGame()` → silently skip |
| Game already won on load | `checkWin()` called in `loadGame()` → win banner shows, save cleared |
| Different browser/device | No save → fresh game (expected behavior) |

---

## Out of Scope

- Cross-device sync (requires backend)
- Multiple save slots
- Manual save/load buttons (auto-save/load is sufficient)
- Export/import save file