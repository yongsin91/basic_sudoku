// ============================================================
//  Sudoku — Vanilla JS
// ============================================================

// ---- 3b. Game State -----------------------------------------
let board = [];          // current 9x9 array of values (0 = empty)
let originalPuzzle = [];  // snapshot of the starting puzzle
let moveHistory = [];     // stack of { row, col, prevValue, newValue, pencilSnapshot }
let selectedCell = null;  // { row, col } or null
let currentDifficulty = 'easy';
let pencilMarks = [];     // array of 81 Sets, each containing candidate digits (1-9)
let pencilMode = false;   // false = pen mode (place numbers), true = pencil mode (toggle candidates)
let elapsedSeconds = 0;   // accumulated time for the current game (persisted)
let mistakeCount = 0;     // number of conflicting placements this game (persisted)
let timerInterval = null; // setInterval ID for the timer (runtime only)
let timerRunning = false; // whether the timer is actively ticking (runtime only)

// ---- Timer & Display ----------------------------------------
const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');

function tickTimer() {
    updateTimerDisplay();
    updateMistakeDisplay();
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
    timerRunning = true;
}

function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    tickTimer();
}

function resumeTimer() {
    stopTimer();
    tickTimer();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerRunning = false;
}

function updateTimerDisplay() {
    timerEl.textContent = formatTime(elapsedSeconds);
}

function updateMistakeDisplay() {
    mistakesEl.textContent = `Mistakes: ${mistakeCount}`;
}

// ---- 3c. Render Board ---------------------------------------
const boardEl = document.getElementById('board');

function renderBoard() {
    boardEl.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const idx = row * 9 + col;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const val = board[idx];
            if (val !== 0) {
                cell.textContent = val;
            } else if (pencilMarks[idx] && pencilMarks[idx].size > 0) {
                // Render pencil marks as a 3x3 mini-grid
                const grid = document.createElement('div');
                grid.className = 'pencil-grid';
                for (let n = 1; n <= 9; n++) {
                    const span = document.createElement('span');
                    span.textContent = pencilMarks[idx].has(n) ? n : '';
                    grid.appendChild(span);
                }
                cell.appendChild(grid);
            }

            if (originalPuzzle[idx] !== 0) {
                cell.classList.add('locked');
            } else if (val !== 0) {
                cell.classList.add('user-input');
            }

            cell.addEventListener('click', () => selectCell(row, col));
            boardEl.appendChild(cell);
        }
    }
    applyHighlights();
}

// ---- 3d. Cell Selection & Highlighting ----------------------
function selectCell(row, col) {
    // Can't select locked cells
    if (originalPuzzle[row * 9 + col] !== 0) {
        selectedCell = null;
        applyHighlights();
        return;
    }
    selectedCell = { row, col };
    applyHighlights();
}

function applyHighlights() {
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach(c => {
        c.classList.remove('selected', 'highlight', 'conflict');
    });

    // Highlight row / col / box of selected cell
    if (selectedCell) {
        const { row, col } = selectedCell;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        cells.forEach(c => {
            const r = parseInt(c.dataset.row, 10);
            const cc = parseInt(c.dataset.col, 10);
            if (r === row || cc === col ||
                (r >= boxRow && r < boxRow + 3 && cc >= boxCol && cc < boxCol + 3)) {
                c.classList.add('highlight');
            }
            if (r === row && cc === col) {
                c.classList.add('selected');
            }
        });
    }

    // Conflict highlighting
    applyConflictHighlighting();
}

// ---- 3f. Validation -----------------------------------------
function applyConflictHighlighting() {
    const cells = boardEl.querySelectorAll('.cell');

    for (let i = 0; i < 81; i++) {
        const val = board[i];
        if (val === 0) continue;

        const row = Math.floor(i / 9);
        const col = i % 9;
        if (hasConflict(row, col, val)) {
            cells[i].classList.add('conflict');
        }
    }
}

function hasConflict(row, col, val) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (c === col) continue;
        if (board[row * 9 + c] === val) return true;
    }
    // Check column
    for (let r = 0; r < 9; r++) {
        if (r === row) continue;
        if (board[r * 9 + col] === val) return true;
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (r === row && c === col) continue;
            if (board[r * 9 + c] === val) return true;
        }
    }
    return false;
}

function isBoardComplete() {
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) return false;
    }
    // Check no conflicts
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (hasConflict(row, col, board[i])) return false;
    }
    return true;
}

// ---- 3e. Input Handling -------------------------------------
function placeNumber(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const idx = row * 9 + col;

    // Can't edit locked cells
    if (originalPuzzle[idx] !== 0) return;

    if (pencilMode) {
        togglePencilMark(num);
        return;
    }

    const prevValue = board[idx];
    if (prevValue === num) return; // no change

    // Save pencil mark snapshot before placement (for undo restore)
    const pencilSnapshot = {};

    // Clear pencil marks in this cell (it now has a value)
    if (pencilMarks[idx].size > 0) {
        pencilSnapshot[idx] = [...pencilMarks[idx]];
        pencilMarks[idx].clear();
    }

    // Auto-clear this digit from pencil marks of peers
    const peerSnapshot = clearPencilMarksFromPeers(row, col, num);
    Object.assign(pencilSnapshot, peerSnapshot);

    // Push to undo stack with pencil snapshot
    moveHistory.push({ row, col, prevValue, newValue: num, pencilSnapshot });

    board[idx] = num;

    // Track mistakes: if the placed number creates a conflict, count it
    if (hasConflict(row, col, num)) {
        mistakeCount++;
        updateMistakeDisplay();
    }

    renderBoard();
    checkWin();
    saveGame();
}

function togglePencilMark(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const idx = row * 9 + col;

    // Can't add pencil marks to locked cells or cells with a value
    if (originalPuzzle[idx] !== 0) return;
    if (board[idx] !== 0) return;

    if (pencilMarks[idx].has(num)) {
        pencilMarks[idx].delete(num);
    } else {
        pencilMarks[idx].add(num);
    }
    renderBoard();
    saveGame();
}

function clearPencilMarksFromPeers(row, col, num) {
    const snapshot = {};
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    const peers = new Set();
    // Row peers
    for (let c = 0; c < 9; c++) peers.add(row * 9 + c);
    // Column peers
    for (let r = 0; r < 9; r++) peers.add(r * 9 + col);
    // Box peers
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            peers.add(r * 9 + c);
        }
    }

    for (const pIdx of peers) {
        if (pencilMarks[pIdx] && pencilMarks[pIdx].has(num)) {
            if (!snapshot[pIdx]) {
                snapshot[pIdx] = [...pencilMarks[pIdx]];
            }
            pencilMarks[pIdx].delete(num);
        }
    }

    return snapshot;
}

function eraseSelected() {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const idx = row * 9 + col;

    if (originalPuzzle[idx] !== 0) return;

    if (pencilMode) {
        // Clear all pencil marks in the selected cell
        if (pencilMarks[idx].size > 0) {
            pencilMarks[idx].clear();
            renderBoard();
            saveGame();
        }
        return;
    }

    if (board[idx] === 0) return;

    moveHistory.push({ row, col, prevValue: board[idx], newValue: 0, pencilSnapshot: {} });
    board[idx] = 0;
    renderBoard();
    saveGame();
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        togglePencilMode();
        return;
    }

    if (!selectedCell) return;

    if (e.key >= '1' && e.key <= '9') {
        placeNumber(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        eraseSelected();
    } else if (e.key === 'ArrowUp') {
        moveSelection(-1, 0);
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        moveSelection(1, 0);
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        moveSelection(0, -1);
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        moveSelection(0, 1);
        e.preventDefault();
    }
});

function moveSelection(dr, dc) {
    if (!selectedCell) return;
    let { row, col } = selectedCell;
    row = Math.max(0, Math.min(8, row + dr));
    col = Math.max(0, Math.min(8, col + dc));
    selectCell(row, col);
}

// Number pad buttons
document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        placeNumber(parseInt(btn.dataset.num, 10));
    });
});

// ---- 3g. Pencil Mode Toggle ---------------------------------
const pencilBtn = document.getElementById('btn-pencil');

function togglePencilMode() {
    pencilMode = !pencilMode;
    if (pencilMode) {
        pencilBtn.textContent = '✏️ Pencil';
        pencilBtn.classList.add('active');
    } else {
        pencilBtn.textContent = '🖊️ Pen';
        pencilBtn.classList.remove('active');
    }
    saveGame();
}

pencilBtn.addEventListener('click', togglePencilMode);

// ---- 3h. Undo ------------------------------------------------
document.getElementById('btn-undo').addEventListener('click', () => {
    if (moveHistory.length === 0) return;
    const last = moveHistory.pop();
    board[last.row * 9 + last.col] = last.prevValue;
    selectedCell = { row: last.row, col: last.col };

    // Restore pencil marks from snapshot (if any)
    if (last.pencilSnapshot) {
        for (const [idxStr, marks] of Object.entries(last.pencilSnapshot)) {
            const idx = parseInt(idxStr, 10);
            pencilMarks[idx] = new Set(marks);
        }
    }

    renderBoard();
    saveGame();
});

// ---- 3i. Clear -----------------------------------------------
document.getElementById('btn-clear').addEventListener('click', () => {
    for (let i = 0; i < 81; i++) {
        if (originalPuzzle[i] !== 0) continue;
        board[i] = 0;
        pencilMarks[i].clear();
    }
    moveHistory = [];
    renderBoard();
    saveGame();
});

// ---- 3j. Win Detection --------------------------------------
const winBanner = document.getElementById('win-banner');

function checkWin() {
    if (isBoardComplete()) {
        stopTimer();
        const result = computeScore(currentDifficulty, elapsedSeconds, mistakeCount);
        const isNewBest = saveBestScore(currentDifficulty, result.final);
        const bestScores = getBestScores();
        const best = bestScores[currentDifficulty] || 0;

        // Populate win banner
        document.getElementById('win-time').textContent = formatTime(elapsedSeconds);
        document.getElementById('win-mistakes').textContent = mistakeCount;
        document.getElementById('win-score').textContent = result.final;
        document.getElementById('win-best').textContent = best;

        // Show "New Best!" badge if applicable
        const bestLabel = document.querySelector('.win-best-row .win-stat-label');
        if (isNewBest) {
            bestLabel.textContent = 'Best 🏆 New!';
        } else {
            bestLabel.textContent = 'Best';
        }

        winBanner.classList.remove('hidden');
        clearSave();
    } else {
        winBanner.classList.add('hidden');
    }
}

// ---- 3k. New Game -------------------------------------------
function initPencilMarks() {
    pencilMarks = [];
    for (let i = 0; i < 81; i++) {
        pencilMarks.push(new Set());
    }
}

function newGame(difficulty) {
    currentDifficulty = difficulty;

    originalPuzzle = generatePuzzle(difficulty);

    board = [...originalPuzzle];
    moveHistory = [];
    selectedCell = null;
    initPencilMarks();
    mistakeCount = 0;
    winBanner.classList.add('hidden');

    // Update active button styling
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${difficulty}`).classList.add('active');

    renderBoard();
    startTimer();
    saveGame();
}

document.getElementById('btn-easy').addEventListener('click', () => newGame('easy'));
document.getElementById('btn-medium').addEventListener('click', () => newGame('medium'));
document.getElementById('btn-hard').addEventListener('click', () => newGame('hard'));
document.getElementById('btn-new-game').addEventListener('click', () => newGame(currentDifficulty));

// ---- 3l. Save / Load (localStorage) -------------------------
// The browser's localStorage API persists data to disk, surviving
// browser restarts and machine reboots. We serialize the full game
// state into a single JSON object under the key 'sudoku-save'.

const SAVE_KEY = 'sudoku-save';

// serializeState / deserializeState are imported from serialize.js
// (loaded via <script> in the browser, or require'd in Node tests).
// They are pure functions that accept/return a state object, keeping
// the serialization logic testable without DOM access.

/**
 * Save the current game state to localStorage.
 * Silently fails if localStorage is unavailable (e.g. private mode).
 */
function saveGame() {
    withLocalStorage(() => {
        const state = {
            originalPuzzle,
            board,
            pencilMarks,
            moveHistory,
            currentDifficulty,
            pencilMode,
            selectedCell,
            elapsedSeconds,
            mistakeCount,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState(state)));
    }, undefined);
}

/**
 * Load a saved game from localStorage into the live state variables.
 * Does NOT re-render — caller must call renderBoard() afterwards.
 * Returns true if a save was loaded, false otherwise.
 */
function loadGame() {
    return withLocalStorage(() => {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        const restored = deserializeState(data);
        if (!restored) return false;

        // Restore all global state variables
        originalPuzzle = restored.originalPuzzle;
        board = restored.board;
        pencilMarks = restored.pencilMarks;
        moveHistory = restored.moveHistory;
        currentDifficulty = restored.currentDifficulty;
        pencilMode = restored.pencilMode;
        selectedCell = restored.selectedCell;
        elapsedSeconds = restored.elapsedSeconds || 0;
        mistakeCount = restored.mistakeCount || 0;

        // Sync pencil mode button UI with restored state
        if (pencilMode) {
            pencilBtn.textContent = '✏️ Pencil';
            pencilBtn.classList.add('active');
        } else {
            pencilBtn.textContent = '🖊️ Pen';
            pencilBtn.classList.remove('active');
        }

        // Sync difficulty button styling
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        const diffBtn = document.getElementById(`btn-${currentDifficulty}`);
        if (diffBtn) diffBtn.classList.add('active');

        // Check if the restored game is already won (shows win banner,
        // computes score, clears save — per PLAN-save-load.md edge cases)
        checkWin();

        return true;
    }, false);
}

/**
 * Remove the saved game from localStorage.
 * Called when a puzzle is solved or a brand-new game is started.
 */
function clearSave() {
    withLocalStorage(() => {
        localStorage.removeItem(SAVE_KEY);
    }, undefined);
}

// ---- Start --------------------------------------------------
if (!loadGame()) {
    newGame('easy');
} else {
    renderBoard();
    // Only resume the timer if the game isn't already solved
    // (checkWin inside loadGame handles the won case)
    if (!isBoardComplete()) {
        resumeTimer();
    }
}