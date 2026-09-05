// ============================================================
//  Sudoku — Puzzle Generator (pure logic, no DOM dependencies)
// ============================================================
//
//  Uses bitmask-based constraint tracking and the MRV (minimum
//  remaining values) heuristic for fast solving and generation.
//  All functions are pure (no DOM access) so they can be tested
//  in Node.js and loaded directly in the browser via <script>.

// ---- Bitmask helpers ----------------------------------------
// Each row, column, and 3×3 box tracks which digits (1–9) are
// already used via a 9-bit bitmask.  Bit position d → (1 << d).
function bit(d) { return 1 << d; }
const ALL_BITS = 0b1111111110; // bits 1–9 set (bit 0 unused)

function boxIndex(r, c) { return Math.floor(r / 3) * 3 + Math.floor(c / 3); }

// ---- Utility: shuffle an array (Fisher-Yates) ---------------
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ---- Build constraint masks from a board --------------------
function buildMasks(board) {
    const rows = new Array(9).fill(0);
    const cols = new Array(9).fill(0);
    const boxes = new Array(9).fill(0);
    for (let i = 0; i < 81; i++) {
        const v = board[i];
        if (v === 0) continue;
        const r = Math.floor(i / 9);
        const c = i % 9;
        const b = boxIndex(r, c);
        const m = bit(v);
        rows[r] |= m;
        cols[c] |= m;
        boxes[b] |= m;
    }
    return { rows, cols, boxes };
}

// ---- Check if a value can be placed at (row, col) -----------
function isValid(board, row, col, val) {
    const { rows, cols, boxes } = buildMasks(board);
    const used = rows[row] | cols[col] | boxes[boxIndex(row, col)];
    return (used & bit(val)) === 0;
}

// ---- Step 1: Generate a complete, valid solution ------------
// Uses randomized backtracking with bitmask constraints and
// MRV (minimum remaining values) heuristic for speed.
function generateFullSolution() {
    const board = new Array(81).fill(0);
    const { rows, cols, boxes } = buildMasks(board);

    function solve() {
        // Find the empty cell with the fewest candidates (MRV)
        let bestIdx = -1;
        let bestCount = 10;
        let bestCandidates = 0;

        for (let i = 0; i < 81; i++) {
            if (board[i] !== 0) continue;
            const r = Math.floor(i / 9);
            const c = i % 9;
            const b = boxIndex(r, c);
            const used = rows[r] | cols[c] | boxes[b];
            const available = ALL_BITS & ~used;

            // Count candidates (popcount)
            let count = 0;
            let temp = available;
            while (temp) {
                count += temp & 1;
                temp >>>= 1;
            }

            if (count === 0) return false; // dead end
            if (count < bestCount) {
                bestCount = count;
                bestIdx = i;
                bestCandidates = available;
                if (count === 1) break; // can't do better
            }
        }

        if (bestIdx === -1) return true; // all filled

        const r = Math.floor(bestIdx / 9);
        const c = bestIdx % 9;
        const b = boxIndex(r, c);

        // Extract candidate digits and shuffle
        const candidates = [];
        let temp = bestCandidates;
        while (temp) {
            const trailing = temp & (-temp);
            const d = Math.log2(trailing);
            candidates.push(d);
            temp ^= trailing;
        }
        const shuffled = shuffle(candidates);

        for (const num of shuffled) {
            const m = bit(num);
            board[bestIdx] = num;
            rows[r] |= m;
            cols[c] |= m;
            boxes[b] |= m;

            if (solve()) return true;

            board[bestIdx] = 0;
            rows[r] &= ~m;
            cols[c] &= ~m;
            boxes[b] &= ~m;
        }

        return false;
    }

    solve();
    return board;
}

// ---- Step 3: Count solutions (up to limit) ------------------
// Optimized backtracking solver with bitmask constraints and
// MRV heuristic.  Stops early once `limit` solutions are found.
// Returns 0, 1, or `limit` (meaning "at least limit").
function countSolutions(board, limit = 2) {
    const work = [...board];

    // Validate pre-existing values for conflicts — if the board
    // already has a duplicate in any row/col/box, there are 0
    // solutions.  Without this check the solver would try every
    // combination of the remaining empty cells before giving up.
    for (let i = 0; i < 81; i++) {
        const v = work[i];
        if (v === 0) continue;
        const r = Math.floor(i / 9);
        const c = i % 9;
        // Check row for duplicate
        for (let cc = 0; cc < 9; cc++) {
            if (cc === c) continue;
            if (work[r * 9 + cc] === v) return 0;
        }
        // Check column for duplicate
        for (let rr = 0; rr < 9; rr++) {
            if (rr === r) continue;
            if (work[rr * 9 + c] === v) return 0;
        }
        // Check 3x3 box for duplicate
        const boxRow = Math.floor(r / 3) * 3;
        const boxCol = Math.floor(c / 3) * 3;
        for (let rr = boxRow; rr < boxRow + 3; rr++) {
            for (let cc = boxCol; cc < boxCol + 3; cc++) {
                if (rr === r && cc === c) continue;
                if (work[rr * 9 + cc] === v) return 0;
            }
        }
    }

    const { rows, cols, boxes } = buildMasks(work);
    let count = 0;

    function solve() {
        if (count >= limit) return;

        // Find the empty cell with the fewest candidates (MRV)
        let bestIdx = -1;
        let bestCount = 10;

        for (let i = 0; i < 81; i++) {
            if (work[i] !== 0) continue;
            const r = Math.floor(i / 9);
            const c = i % 9;
            const b = boxIndex(r, c);
            const used = rows[r] | cols[c] | boxes[b];
            const available = ALL_BITS & ~used;

            let cnt = 0;
            let temp = available;
            while (temp) {
                cnt += temp & 1;
                temp >>>= 1;
            }

            if (cnt === 0) return; // dead end
            if (cnt < bestCount) {
                bestCount = cnt;
                bestIdx = i;
                if (cnt === 1) break;
            }
        }

        if (bestIdx === -1) {
            count++;
            return;
        }

        const r = Math.floor(bestIdx / 9);
        const c = bestIdx % 9;
        const b = boxIndex(r, c);
        const used = rows[r] | cols[c] | boxes[b];
        const available = ALL_BITS & ~used;

        let temp = available;
        while (temp) {
            const trailing = temp & (-temp);
            const d = Math.log2(trailing);
            const m = bit(d);

            work[bestIdx] = d;
            rows[r] |= m;
            cols[c] |= m;
            boxes[b] |= m;

            solve();

            work[bestIdx] = 0;
            rows[r] &= ~m;
            cols[c] &= ~m;
            boxes[b] &= ~m;

            if (count >= limit) return;
            temp ^= trailing;
        }
    }

    solve();
    return count;
}

// ---- Solve a board (returns solution or null) --------------
// Uses the same bitmask + MRV backtracking solver as
// countSolutions, but captures and returns the first solution
// found instead of counting. Returns null if the board has
// conflicts or no solution exists.
function solveBoard(board) {
    const work = [...board];

    // Validate pre-existing values for conflicts (same as countSolutions)
    for (let i = 0; i < 81; i++) {
        const v = work[i];
        if (v === 0) continue;
        const r = Math.floor(i / 9);
        const c = i % 9;
        for (let cc = 0; cc < 9; cc++) {
            if (cc === c) continue;
            if (work[r * 9 + cc] === v) return null;
        }
        for (let rr = 0; rr < 9; rr++) {
            if (rr === r) continue;
            if (work[rr * 9 + c] === v) return null;
        }
        const boxRow = Math.floor(r / 3) * 3;
        const boxCol = Math.floor(c / 3) * 3;
        for (let rr = boxRow; rr < boxRow + 3; rr++) {
            for (let cc = boxCol; cc < boxCol + 3; cc++) {
                if (rr === r && cc === c) continue;
                if (work[rr * 9 + cc] === v) return null;
            }
        }
    }

    const { rows, cols, boxes } = buildMasks(work);
    let solution = null;

    function solve() {
        if (solution) return; // already found

        // Find the empty cell with the fewest candidates (MRV)
        let bestIdx = -1;
        let bestCount = 10;

        for (let i = 0; i < 81; i++) {
            if (work[i] !== 0) continue;
            const r = Math.floor(i / 9);
            const c = i % 9;
            const b = boxIndex(r, c);
            const used = rows[r] | cols[c] | boxes[b];
            const available = ALL_BITS & ~used;

            let cnt = 0;
            let temp = available;
            while (temp) {
                cnt += temp & 1;
                temp >>>= 1;
            }

            if (cnt === 0) return; // dead end
            if (cnt < bestCount) {
                bestCount = cnt;
                bestIdx = i;
                if (cnt === 1) break;
            }
        }

        if (bestIdx === -1) {
            solution = [...work];
            return;
        }

        const r = Math.floor(bestIdx / 9);
        const c = bestIdx % 9;
        const b = boxIndex(r, c);
        const used = rows[r] | cols[c] | boxes[b];
        const available = ALL_BITS & ~used;

        let temp = available;
        while (temp) {
            const trailing = temp & (-temp);
            const d = Math.log2(trailing);
            const m = bit(d);

            work[bestIdx] = d;
            rows[r] |= m;
            cols[c] |= m;
            boxes[b] |= m;

            solve();

            if (solution) return;

            work[bestIdx] = 0;
            rows[r] &= ~m;
            cols[c] &= ~m;
            boxes[b] &= ~m;

            temp ^= trailing;
        }
    }

    solve();
    return solution;
}

// ---- Step 2: Remove cells to create a puzzle ----------------
// Starts from a full solution and removes cells one by one,
// checking after each removal that the puzzle still has a
// unique solution.  Stops when the target clue count is reached.
function createPuzzle(solution, targetClues) {
    const puzzle = [...solution];
    const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));
    let cluesRemaining = 81;

    for (const idx of indices) {
        if (cluesRemaining <= targetClues) break;

        const saved = puzzle[idx];
        puzzle[idx] = 0;

        if (countSolutions(puzzle, 2) === 1) {
            cluesRemaining--;
        } else {
            // Removing this cell makes the puzzle ambiguous — restore it
            puzzle[idx] = saved;
        }
    }

    return puzzle;
}

// ---- Target clue counts per difficulty ----------------------
function getTargetClueCount(difficulty) {
    const ranges = {
        easy:   { min: 40, max: 45 },
        medium: { min: 32, max: 36 },
        hard:   { min: 25, max: 30 },
    };
    const range = ranges[difficulty] || ranges.easy;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// ---- Orchestrator: generate a puzzle for a difficulty -------
function generatePuzzle(difficulty) {
    const solution = generateFullSolution();
    const targetClues = getTargetClueCount(difficulty);
    const puzzle = createPuzzle(solution, targetClues);
    return puzzle;
}

// ---- Exports ------------------------------------------------
// Works in both Node.js (module.exports) and browser (global scope)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        shuffle,
        isValid,
        generateFullSolution,
        countSolutions,
        solveBoard,
        createPuzzle,
        getTargetClueCount,
        generatePuzzle,
    };
}