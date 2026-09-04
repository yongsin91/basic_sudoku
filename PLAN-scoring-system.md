# Plan: Timer & Scoring System

## Goal

Add a live timer and scoring system to the Sudoku game. The timer runs from when a new game starts until the puzzle is solved. The final score is computed from difficulty, elapsed time, and number of mistakes (conflicting placements). Best scores per difficulty are persisted in localStorage.

---

## Design

### Timer

- **Display format:** `MM:SS` (e.g. `05:32`)
- **Behavior:** Starts when a new game begins (via `newGame()`). Stops when the puzzle is solved (via `checkWin()`). Does not stop on undo, clear, or page reload.
- **Implementation:** `setInterval` ticking every 1 second, incrementing `elapsedSeconds`. Simple and sufficient for a casual game (minor inaccuracy in background-tab throttling is acceptable).
- **Persistence:** `elapsedSeconds` is saved/restored via the existing save/load system so the timer resumes across browser restarts.

### Mistake Tracking

- **What counts as a mistake:** Each time a player places a number (pen mode) that creates a conflict with an existing cell in the same row, column, or 3×3 box.
- **Pencil marks do not count** — they are notes, not commitments.
- **Undo does not reverse mistakes** — mistakes are cumulative per game.
- **Clear does not reset mistakes** — Clear only wipes the board, not the game session.
- Only a new game (new puzzle) resets the mistake count.

### Scoring Formula

```
Base score by difficulty:
  Easy   → 1000
  Medium → 2000
  Hard   → 3000

Time penalty:   1 point per elapsed second (capped at 50% of base)
Mistake penalty: 30 points per mistake (capped at 50% of base)

Final score = max(base × 0.1, base − timePenalty − mistakePenalty)
```

**Examples (Easy, base 1000):**
- 3 min (180s), 0 mistakes → 1000 − 180 − 0 = **820**
- 5 min (300s), 2 mistakes → 1000 − 300 − 60 = **640**
- 15 min (900s), 8 mistakes → 1000 − 500 − 240 = **260** (both penalties capped)

**Examples (Hard, base 3000):**
- 10 min (600s), 1 mistake → 3000 − 600 − 30 = **2370**
- 30 min (1800s), 5 mistakes → 3000 − 1500 − 150 = **1350**

### Best Scores

- Stored in `localStorage` under key `sudoku-best-scores` as `{ easy: 820, medium: 1500, hard: 2370 }`.
- Only the highest score per difficulty is kept.
- Displayed in the win banner alongside the current game's results.
- Separate from the game-save key — best scores persist even after the game save is cleared on win.

---

## State to Add

| Variable | Type | Purpose | Persisted? |
|---|---|---|---|
| `elapsedSeconds` | `number` | Accumulated seconds since game start | ✅ via save/load |
| `mistakeCount` | `number` | Total conflicting placements this game | ✅ via save/load |
| `timerInterval` | `number \| null` | `setInterval` ID for ticking | ❌ (runtime only) |
| `timerRunning` | `boolean` | Whether timer is actively ticking | ❌ (derived from game state) |

---

## Tasks

### Task 1 — Add `scoring.js` module (pure logic, testable in Node)

Create `scoring.js` with pure functions:

- `DIFFICULTY_BASE` — constant map `{ easy: 1000, medium: 2000, hard: 3000 }`
- `TIME_PENALTY_PER_SECOND` — `1`
- `MISTAKE_PENALTY` — `30`
- `PENALTY_CAP_FRACTION` — `0.5` (max 50% of base per penalty type)
- `MIN_SCORE_FRACTION` — `0.1` (minimum 10% of base)
- `computeScore(difficulty, elapsedSeconds, mistakeCount)` → `{ base, timePenalty, mistakePenalty, final, breakdown }`
- `formatTime(seconds)` → `"MM:SS"` string
- `getBestScores()` → reads from `localStorage` (safe try/catch, returns `{}` if none)
- `saveBestScore(difficulty, score)` → updates best score in `localStorage` if higher
- Node exports for testing

**Commit:** `Add scoring.js module with pure score computation logic`

---

### Task 2 — Add timer & score display to HTML

Add to `index.html`:

- A **status bar** between difficulty buttons and the board, containing:
  - Timer display: `<span id="timer">00:00</span>`
  - Mistake counter: `<span id="mistakes">Mistakes: 0</span>`
- Update **win banner** to show final results:
  - Time, mistakes, score breakdown, best score
  - New elements: `#win-time`, `#win-mistakes`, `#win-score`, `#win-best`

**Commit:** `Add timer, mistake counter, and score display to HTML`

---

### Task 3 — Add CSS for timer, mistake counter, and win banner results

Add to `style.css`:

- `.status-bar` — flex row between difficulty buttons and board
- `.timer`, `.mistakes` — styled spans matching the dark theme
- Updated `.win-banner` — accommodate score breakdown lines
- Responsive adjustments for mobile

**Commit:** `Add CSS styling for timer, mistake counter, and score display`

---

### Task 4 — Integrate timer & scoring into `script.js`

In `script.js`:

- Add `elapsedSeconds`, `mistakeCount`, `timerInterval` state variables
- `startTimer()` — resets `elapsedSeconds` to 0, starts `setInterval` ticking every 1s, updates display
- `stopTimer()` — clears the interval
- `resumeTimer()` — restores from `elapsedSeconds` (for save/load), starts interval without resetting
- `updateTimerDisplay()` — updates `#timer` element text
- `updateMistakeDisplay()` — updates `#mistakes` element text
- Modify `placeNumber()` — after placing a number, check `hasConflict(row, col, num)`; if true, increment `mistakeCount` and update display
- Modify `newGame()` — call `startTimer()`, reset `mistakeCount = 0`
- Modify `checkWin()` — on win, call `stopTimer()`, compute score, save best score, populate win banner with results
- Include `scoring.js` in `index.html` before `script.js`

**Commit:** `Integrate timer, mistake tracking, and scoring into game logic`

---

### Task 5 — Integrate with save/load system

Update `serialize.js`:
- Add `elapsedSeconds` and `mistakeCount` to `serializeState()` / `deserializeState()`

Update `script.js`:
- `saveGame()` — include `elapsedSeconds` and `mistakeCount` in the state object
- `loadGame()` — restore `elapsedSeconds` and `mistakeCount`; call `resumeTimer()` and `updateMistakeDisplay()`

**Commit:** `Integrate timer and mistakes with save/load system`

---

### Task 6 — Add tests for `scoring.js`

Create `test/scoring.test.js`:

- `computeScore()`:
  - Base scores correct per difficulty
  - Time penalty capped at 50% of base
  - Mistake penalty capped at 50% of base
  - Minimum score is 10% of base
  - Perfect game (0 seconds, 0 mistakes) returns full base
  - Various realistic scenarios produce expected values
- `formatTime()`:
  - 0s → "00:00"
  - 65s → "01:05"
  - 3600s → "60:00"
  - Pads single digits with leading zero

**Commit:** `Add tests for scoring.js (computeScore and formatTime)`

---

### Task 7 — Update README

- Bump version to `1.4.0`
- Add "Timer & Scoring System" to Capabilities section
- Add `scoring.js` to file structure and functions reference
- Update win state description to mention score display
- Remove "Timer / scoring system" from Future Enhancements
- Update test instructions (3 test files now)

**Commit:** `Update README for v1.4.0: document timer and scoring system`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Page reload mid-game | Timer resumes from saved `elapsedSeconds` |
| Background tab (interval throttled) | Minor time inaccuracy — acceptable for casual game |
| Win banner shown, user clicks New Game | Timer resets, new score tracked |
| Clear button pressed | Timer keeps running, mistakes stay (board is wiped but game session continues) |
| Undo after a mistake placement | Mistake count stays (mistakes are cumulative) |
| No localStorage (private mode) | Best scores silently skipped |
| Old save from v1.3.0 (no timer data) | `deserializeState` defaults `elapsedSeconds` to 0, `mistakeCount` to 0 |

---

## Out of Scope

- Leaderboards (requires backend)
- Average solve time tracking
- Pause button (timer can be implicitly paused by solving)
- Per-move scoring (only final score matters)