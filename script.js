// ============================================================
//  Sudoku — Vanilla JS
// ============================================================

// ---- 3a. Puzzle Data ----------------------------------------
// Each puzzle is an 81-char string: digits 1-9 for pre-filled
// cells, '0' or '.' for empty cells.
// 5 per difficulty (15 total).

const PUZZLES = {
    easy: [
        "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
        "002608000040020010008000300600702005007000800805030900003000200050090060000405300",
        "100400006090030010000008020000007000400000003000500000080200000050060070200003004",
        "000900002050123400030000160908000000070000090000000205091000050007439020400007000",
        "300000000050703008000028070700000043000000000003904105400300000061000080000702000"
    ],
    medium: [
        "000002000004500300700000080000040003030000060400080000020000005006007400000300000",
        "000000000000003085001020000000507000004000100090000000500000073002010000000040009",
        "200300010050000007000004000800000050003020060000700000004000900060000080000005000",
        "000000000000010604000400000000080010020000030040070000000005000905080000000000000",
        "000000080000007000050000200000400007800000005600100000009000030000500000060000000"
    ],
    hard: [
        "800000000003600000070090200050007000000045700000100030001000068008500010090000400",
        "000000010400000000020000000000050407008000300001090000300400200050100000000806000",
        "000000000000003085001020000000507000004000100090000000500000073002010000000040009",
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    ]
};

// ---- 3b. Game State -----------------------------------------
let board = [];          // current 9x9 array of values (0 = empty)
let originalPuzzle = [];  // snapshot of the starting puzzle
let moveHistory = [];     // stack of { row, col, prevValue, newValue }
let selectedCell = null;  // { row, col } or null
let currentDifficulty = 'easy';

// ---- 3c. Render Board ---------------------------------------
const boardEl = document.getElementById('board');

function parsePuzzle(str) {
    const arr = [];
    for (let i = 0; i < 81; i++) {
        const ch = str[i];
        arr.push(ch === '.' || ch === '0' ? 0 : parseInt(ch, 10));
    }
    return arr;
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const val = board[row * 9 + col];
            if (val !== 0) {
                cell.textContent = val;
            }

            if (originalPuzzle[row * 9 + col] !== 0) {
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

    const prevValue = board[idx];
    if (prevValue === num) return; // no change

    // Push to undo stack
    moveHistory.push({ row, col, prevValue, newValue: num });

    board[idx] = num;
    renderBoard();
    checkWin();
}

function eraseSelected() {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const idx = row * 9 + col;

    if (originalPuzzle[idx] !== 0) return;
    if (board[idx] === 0) return;

    moveHistory.push({ row, col, prevValue: board[idx], newValue: 0 });
    board[idx] = 0;
    renderBoard();
}

// Keyboard input
document.addEventListener('keydown', (e) => {
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

// ---- 3g. Undo ------------------------------------------------
document.getElementById('btn-undo').addEventListener('click', () => {
    if (moveHistory.length === 0) return;
    const last = moveHistory.pop();
    board[last.row * 9 + last.col] = last.prevValue;
    selectedCell = { row: last.row, col: last.col };
    renderBoard();
});

// ---- 3h. Clear -----------------------------------------------
document.getElementById('btn-clear').addEventListener('click', () => {
    for (let i = 0; i < 81; i++) {
        if (originalPuzzle[i] !== 0) continue;
        board[i] = 0;
    }
    moveHistory = [];
    renderBoard();
});

// ---- 3i. Win Detection --------------------------------------
const winBanner = document.getElementById('win-banner');

function checkWin() {
    if (isBoardComplete()) {
        winBanner.classList.remove('hidden');
    } else {
        winBanner.classList.add('hidden');
    }
}

// ---- 3j. New Game -------------------------------------------
function newGame(difficulty) {
    currentDifficulty = difficulty;

    // Try to generate a random puzzle; fall back to static puzzles on failure
    try {
        if (typeof generatePuzzle === 'function') {
            originalPuzzle = generatePuzzle(difficulty);
        } else {
            throw new Error('Generator not available');
        }
    } catch (err) {
        console.warn('Puzzle generation failed, falling back to static puzzles:', err);
        const puzzles = PUZZLES[difficulty];
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        originalPuzzle = parsePuzzle(randomPuzzle);
    }

    board = [...originalPuzzle];
    moveHistory = [];
    selectedCell = null;
    winBanner.classList.add('hidden');

    // Update active button styling
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${difficulty}`).classList.add('active');

    renderBoard();
}

document.getElementById('btn-easy').addEventListener('click', () => newGame('easy'));
document.getElementById('btn-medium').addEventListener('click', () => newGame('medium'));
document.getElementById('btn-hard').addEventListener('click', () => newGame('hard'));
document.getElementById('btn-new-game').addEventListener('click', () => newGame(currentDifficulty));

// ---- Start --------------------------------------------------
newGame('easy');