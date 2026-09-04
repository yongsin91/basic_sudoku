# Plan: Pencil Marks (Candidate Notes)

## Feature Summary

Allow players to jot down candidate digits (1–9) in empty cells as small
notes — commonly called "pencil marks" or "candidate notes." This is a
standard feature in serious Sudoku apps and is essential for solving
harder puzzles using techniques like naked/hidden singles, pointing pairs,
etc.

---

## Design Decisions

### 1. Mode Toggle (Pen / Pencil)
- A toggle button switches between **Pen mode** (place numbers — existing
  behavior) and **Pencil mode** (toggle candidate notes).
- The current mode is visually indicated on the button.
- Keyboard shortcut: **`P`** toggles between pen and pencil mode.

### 2. Data Structure
- `pencilMarks` — array of 81 `Set` objects, each containing the candidate
  digits (1–9) for that cell.
- Only meaningful for empty cells (where `board[i] === 0`). Locked cells
  and cells with a placed value are never shown with pencil marks.

### 3. Input Behavior
| Action | Pen mode | Pencil mode |
|---|---|---|
| Press 1–9 / click number pad | Place number | Toggle candidate note |
| Backspace / Delete / 0 | Erase placed value | Clear all pencil marks in cell |

### 4. Auto-Clear on Placement
When a number is placed in a cell (pen mode):
- Clear pencil marks **in that cell** (it now has a value).
- Remove that digit from pencil marks of all **peer cells** (same row,
  column, and 3×3 box) — placing a 5 means 5 is no longer a candidate
  for peers.

### 5. Undo
- Pencil mark toggles are **not** individually undoable (they are ephemeral
  notes, not moves — this matches most Sudoku apps).
- However, when placing a number triggers auto-clearing of pencil marks
  from peers, that snapshot is saved in the undo entry so undoing a
  placement **restores** the cleared pencil marks.
- Undo entry shape changes from `{ row, col, prevValue, newValue }` to
  `{ row, col, prevValue, newValue, pencilSnapshot }` where
  `pencilSnapshot` is a map of `{ cellIndex: [digits] }` for cells whose
  marks were modified.

### 6. Rendering
- Empty cells with pencil marks display a **3×3 mini-grid** of small
  digits. Only marked digits are shown; unmarked positions are blank.
- Pencil mark digits use a dimmer color (e.g. `#888`) and smaller font
  (e.g. `0.55rem`) to distinguish from placed values.
- The mini-grid is a CSS grid overlaid inside the cell.

### 7. Clear Button
- Clears all user-entered values **and** all pencil marks.

### 8. New Game
- Resets all pencil marks (fresh empty Sets for all 81 cells).

### 9. Edge Cases
- **Locked cells**: Cannot be selected, cannot have pencil marks.
- **Cells with a placed value**: Cannot have pencil marks. If a value is
  erased (pen mode), the cell becomes eligible for pencil marks again.
- **Selecting a cell in pencil mode**: Works the same as pen mode — only
  empty, non-locked cells can be selected.

---

## Implementation Steps

### Step 1: HTML — Add pencil mode toggle button
- Add a `<button id="btn-pencil">` in the action buttons row alongside
  Undo and Clear.
- Label shows current mode: "✏️ Pencil" when pencil mode is active,
  "🖊️ Pen" when pen mode is active.

### Step 2: CSS — Pencil mark display and toggle button styling
- `.pencil-grid` — 3×3 CSS grid inside a cell, absolutely positioned to
  fill the cell.
- `.pencil-grid span` — small font, dim color, centered in each sub-cell.
- `.cell.has-pencil` — ensures the cell doesn't show the big number font.
- `.pencil-btn` / `.pencil-btn.active` — styling for the toggle button.
- Responsive: reduce pencil mark font size on mobile.

### Step 3: JavaScript — State and core logic
- Add `pencilMarks` array (81 Sets) and `pencilMode` boolean.
- Add `initPencilMarks()` — creates 81 empty Sets.
- Add `togglePencilMode()` — flips `pencilMode`, updates button UI.

### Step 4: JavaScript — Rendering pencil marks
- Update `renderBoard()`:
  - If cell is empty and has pencil marks, create the mini-grid DOM.
  - If cell is empty with no pencil marks, show nothing (as before).

### Step 5: JavaScript — Input handling
- Refactor `placeNumber()`:
  - If `pencilMode`: call `togglePencilMark(num)` instead.
  - If pen mode: existing behavior + auto-clear pencil marks from peers.
- Add `togglePencilMark(num)` — toggles a digit in the selected cell's
  pencil mark Set.
- Update `eraseSelected()`:
  - If `pencilMode`: clear all marks in the selected cell.
  - If pen mode: existing behavior.

### Step 6: JavaScript — Auto-clear logic
- Add `clearPencilMarksFromPeers(row, col, num)`:
  - Iterates row, column, and box peers.
  - Removes `num` from each peer's pencil mark Set.
  - Returns a snapshot of what was removed (for undo).
- Update `placeNumber()` (pen mode) to call this and save snapshot.

### Step 7: JavaScript — Undo with pencil snapshot
- Update undo handler:
  - Restore `prevValue` (existing).
  - If `pencilSnapshot` exists, restore those pencil marks.

### Step 8: JavaScript — Clear and New Game
- Update clear button handler: also reset all pencil marks.
- Update `newGame()`: call `initPencilMarks()`.

### Step 9: JavaScript — Keyboard shortcut
- Add `p` / `P` key handler to toggle pencil mode.

### Step 10: Update README
- Add pencil marks to Capabilities section.
- Document new functions and event listeners.
- Remove "Pencil marks" from Future Enhancements.
- Bump version to v1.2.0.

---

## Testing Considerations

- Manual testing in browser (no test runner for DOM-based code).
- Test cases to verify:
  1. Toggle pencil mode, add candidates, verify mini-grid renders.
  2. Toggle a candidate off — verify it disappears.
  3. Place a number in pen mode — verify peer pencil marks auto-cleared.
  4. Undo a placement — verify peer pencil marks restored.
  5. Clear button — verify all pencil marks wiped.
  6. New game — verify all pencil marks reset.
  7. Pencil mode + locked cell — cannot add marks.
  8. Pencil mode + cell with value — cannot add marks.
  9. 'P' keyboard shortcut toggles mode.
  10. Responsive layout — pencil marks visible on small screens.