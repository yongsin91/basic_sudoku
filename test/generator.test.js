// ============================================================
//  Tests for generator.js — plain assert-based (no test runner)
// ============================================================
//  Run with:  npm test
//  Uses Node's built-in assert module — no external dependencies.
//  Each test prints PASS/FAIL and the script exits non-zero on
//  any failure.
// ============================================================
const assert = require('node:assert');
const {
    generateFullSolution,
    countSolutions,
    createPuzzle,
    getTargetClueCount,
    generatePuzzle,
} = require('../generator.js');

// ---- Helpers ------------------------------------------------
function emptyBoard() {
    return new Array(81).fill(0);
}

function isRowValid(board, row) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
        const val = board[row * 9 + col];
        if (val < 1 || val > 9 || seen.has(val)) return false;
        seen.add(val);
    }
    return true;
}

function isColValid(board, col) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
        const val = board[row * 9 + col];
        if (val < 1 || val > 9 || seen.has(val)) return false;
        seen.add(val);
    }
    return true;
}

function isBoxValid(board, boxRow, boxCol) {
    const seen = new Set();
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            const val = board[r * 9 + c];
            if (val < 1 || val > 9 || seen.has(val)) return false;
            seen.add(val);
        }
    }
    return true;
}

function countNonZero(board) {
    return board.filter(v => v !== 0).length;
}

// ---- Test runner --------------------------------------------
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  \u2714 ${name}`);
    } catch (err) {
        failed++;
        console.error(`  \u2716 ${name}`);
        console.error(`    ${err.message}`);
    }
}

function section(title) {
    console.log(`\n${title}`);
}

// ============================================================
//  generateFullSolution()
// ============================================================
section('generateFullSolution');

test('1. returns an array of 81 integers', () => {
    const board = generateFullSolution();
    assert.strictEqual(board.length, 81);
    assert.ok(board.every(v => Number.isInteger(v)));
});

test('2. all values are 1\u20139 (no zeros)', () => {
    const board = generateFullSolution();
    assert.ok(board.every(v => v >= 1 && v <= 9));
});

test('3. each row contains digits 1\u20139 exactly once', () => {
    const board = generateFullSolution();
    for (let row = 0; row < 9; row++) {
        assert.ok(isRowValid(board, row), `Row ${row} is invalid`);
    }
});

test('4. each column contains digits 1\u20139 exactly once', () => {
    const board = generateFullSolution();
    for (let col = 0; col < 9; col++) {
        assert.ok(isColValid(board, col), `Column ${col} is invalid`);
    }
});

test('5. each 3\u00d73 box contains digits 1\u20139 exactly once', () => {
    const board = generateFullSolution();
    for (let br = 0; br < 9; br += 3) {
        for (let bc = 0; bc < 9; bc += 3) {
            assert.ok(isBoxValid(board, br, bc), `Box (${br},${bc}) is invalid`);
        }
    }
});

test('6. two consecutive calls produce different boards', () => {
    const board1 = generateFullSolution();
    const board2 = generateFullSolution();
    assert.notDeepStrictEqual(board1, board2);
});

// ============================================================
//  countSolutions(board, limit)
// ============================================================
section('countSolutions');

test('7. empty board returns 2 (many solutions, early-exit)', () => {
    const result = countSolutions(emptyBoard(), 2);
    assert.strictEqual(result, 2);
});

test('8. fully solved board returns 1', () => {
    const solved = generateFullSolution();
    const result = countSolutions(solved, 2);
    assert.strictEqual(result, 1);
});

test('9. board with a conflict returns 0', () => {
    const board = emptyBoard();
    board[0] = 5;
    board[1] = 5;
    const result = countSolutions(board, 2);
    assert.strictEqual(result, 0);
});

// ============================================================
//  createPuzzle(solution, targetClues)
// ============================================================
section('createPuzzle');

test('10. returned puzzle has exactly targetClues non-zero cells', () => {
    const solution = generateFullSolution();
    const targetClues = 40;
    const puzzle = createPuzzle(solution, targetClues);
    assert.strictEqual(countNonZero(puzzle), targetClues);
});

test('11. all non-zero cells match the original solution', () => {
    const solution = generateFullSolution();
    const puzzle = createPuzzle(solution, 35);
    for (let i = 0; i < 81; i++) {
        if (puzzle[i] !== 0) {
            assert.strictEqual(puzzle[i], solution[i], `Cell ${i} mismatch`);
        }
    }
});

test('12. puzzle has a unique solution', () => {
    const solution = generateFullSolution();
    const puzzle = createPuzzle(solution, 40);
    const numSolutions = countSolutions(puzzle, 2);
    assert.strictEqual(numSolutions, 1);
});

// ============================================================
//  generatePuzzle(difficulty)
// ============================================================
section('generatePuzzle');

test('13. returns an array of 81 integers', () => {
    const puzzle = generatePuzzle('easy');
    assert.strictEqual(puzzle.length, 81);
    assert.ok(puzzle.every(v => Number.isInteger(v)));
});

test('14. clue count is within expected range for each difficulty', () => {
    const ranges = {
        easy:   { min: 40, max: 45 },
        medium: { min: 32, max: 36 },
        hard:   { min: 25, max: 30 },
    };
    for (const [diff, range] of Object.entries(ranges)) {
        const puzzle = generatePuzzle(diff);
        const clues = countNonZero(puzzle);
        assert.ok(clues >= range.min && clues <= range.max,
            `${diff}: expected ${range.min}-${range.max} clues, got ${clues}`);
    }
});

test('15. puzzle has a unique solution', () => {
    for (const diff of ['easy', 'medium', 'hard']) {
        const puzzle = generatePuzzle(diff);
        const numSolutions = countSolutions(puzzle, 2);
        assert.strictEqual(numSolutions, 1, `${diff} puzzle not unique`);
    }
});

test('16. puzzle is solvable (solver can complete it)', () => {
    const puzzle = generatePuzzle('easy');
    const numSolutions = countSolutions(puzzle, 1);
    assert.ok(numSolutions >= 1);
});

test('17. two consecutive calls produce different puzzles', () => {
    const puzzle1 = generatePuzzle('easy');
    const puzzle2 = generatePuzzle('easy');
    assert.notDeepStrictEqual(puzzle1, puzzle2);
});

test('18. works for all three difficulties without errors', () => {
    for (const diff of ['easy', 'medium', 'hard']) {
        assert.doesNotThrow(() => generatePuzzle(diff));
    }
});

// ============================================================
//  Performance
// ============================================================
section('Performance');

test('19. generatePuzzle("easy") completes in < 500ms', () => {
    const start = performance.now();
    generatePuzzle('easy');
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 500, `Easy took ${elapsed.toFixed(0)}ms`);
});

test('20. generatePuzzle("hard") completes in < 1000ms', () => {
    const start = performance.now();
    generatePuzzle('hard');
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 1000, `Hard took ${elapsed.toFixed(0)}ms`);
});

// ============================================================
//  Summary
// ============================================================
console.log(`\n----------------------------------------`);
console.log(`  Passed: ${passed}  |  Failed: ${failed}  |  Total: ${passed + failed}`);
console.log(`----------------------------------------`);

if (failed > 0) {
    process.exit(1);
}