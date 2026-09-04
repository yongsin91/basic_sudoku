// ============================================================
//  Tests for serialize.js — save/load state serialization
// ============================================================
//  Run with:  npm run test:save
//  Uses Node's built-in assert module — no external dependencies.
//  Tests the pure serialization/deserialization logic without any
//  browser or localStorage dependencies.
// ============================================================
const assert = require('node:assert');
const { serializeState, deserializeState } = require('../serialize.js');

// ---- Helpers ------------------------------------------------
function makeSampleState() {
    return {
        originalPuzzle: [
            5, 3, 0, 0, 7, 0, 0, 0, 0,
            6, 0, 0, 1, 9, 5, 0, 0, 0,
            0, 9, 8, 0, 0, 0, 0, 6, 0,
            8, 0, 0, 0, 6, 0, 0, 0, 3,
            4, 0, 0, 8, 0, 3, 0, 0, 1,
            7, 0, 0, 0, 2, 0, 0, 0, 6,
            0, 6, 0, 0, 0, 0, 2, 8, 0,
            0, 0, 0, 4, 1, 9, 0, 0, 5,
            0, 0, 0, 0, 8, 0, 0, 7, 9,
        ],
        board: [
            5, 3, 4, 0, 7, 0, 0, 0, 0,
            6, 0, 0, 1, 9, 5, 0, 0, 0,
            0, 9, 8, 0, 0, 0, 0, 6, 0,
            8, 0, 0, 0, 6, 0, 0, 0, 3,
            4, 0, 0, 8, 0, 3, 0, 0, 1,
            7, 0, 0, 0, 2, 0, 0, 0, 6,
            0, 6, 0, 0, 0, 0, 2, 8, 0,
            0, 0, 0, 4, 1, 9, 0, 0, 5,
            0, 0, 0, 0, 8, 0, 0, 7, 9,
        ],
        pencilMarks: [
            new Set([1, 2]), new Set(), new Set([3, 5, 7]),
            ...Array(78).fill(null).map(() => new Set()),
        ],
        moveHistory: [
            { row: 0, col: 2, prevValue: 0, newValue: 4, pencilSnapshot: { 0: [1, 2], 2: [3, 5, 7] } },
            { row: 0, col: 3, prevValue: 0, newValue: 0, pencilSnapshot: {} },
        ],
        currentDifficulty: 'medium',
        pencilMode: true,
        selectedCell: { row: 0, col: 2 },
        elapsedSeconds: 185,
        mistakeCount: 3,
    };
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
//  serializeState
// ============================================================
section('serializeState');

test('1. returns a plain object (not null)', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    assert.ok(serialized && typeof serialized === 'object');
});

test('2. output is JSON-serializable (no Sets)', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    const json = JSON.stringify(serialized);
    assert.ok(typeof json === 'string');
    // Sets would serialize to {} — verify pencilMarks are arrays
    assert.ok(Array.isArray(serialized.pencilMarks[0]));
    assert.deepStrictEqual(serialized.pencilMarks[0], [1, 2]);
});

test('3. originalPuzzle and board are copied as arrays', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    assert.deepStrictEqual(serialized.originalPuzzle, state.originalPuzzle);
    assert.deepStrictEqual(serialized.board, state.board);
    // Verify it's a copy, not the same reference
    assert.notStrictEqual(serialized.board, state.board);
});

test('4. pencilMarks Sets are converted to arrays', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    assert.deepStrictEqual(serialized.pencilMarks[0], [1, 2]);
    assert.deepStrictEqual(serialized.pencilMarks[1], []);
    assert.deepStrictEqual(serialized.pencilMarks[2], [3, 5, 7]);
});

test('5. moveHistory entries are copied with pencilSnapshot spread', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    assert.strictEqual(serialized.moveHistory.length, 2);
    assert.strictEqual(serialized.moveHistory[0].newValue, 4);
    assert.deepStrictEqual(serialized.moveHistory[0].pencilSnapshot, { 0: [1, 2], 2: [3, 5, 7] });
});

test('6. scalar fields are preserved', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    assert.strictEqual(serialized.currentDifficulty, 'medium');
    assert.strictEqual(serialized.pencilMode, true);
    assert.deepStrictEqual(serialized.selectedCell, { row: 0, col: 2 });
});

test('7. null selectedCell serializes to null', () => {
    const state = makeSampleState();
    state.selectedCell = null;
    const serialized = serializeState(state);
    assert.strictEqual(serialized.selectedCell, null);
});

test('7b. elapsedSeconds and mistakeCount are preserved', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    assert.strictEqual(serialized.elapsedSeconds, 185);
    assert.strictEqual(serialized.mistakeCount, 3);
});

// ============================================================
//  deserializeState
// ============================================================
section('deserializeState');

test('8. round-trip: serialize → deserialize produces identical state', () => {
    const original = makeSampleState();
    const serialized = serializeState(original);
    const restored = deserializeState(serialized);

    assert.deepStrictEqual(restored.originalPuzzle, original.originalPuzzle);
    assert.deepStrictEqual(restored.board, original.board);
    assert.strictEqual(restored.currentDifficulty, original.currentDifficulty);
    assert.strictEqual(restored.pencilMode, original.pencilMode);
    assert.deepStrictEqual(restored.selectedCell, original.selectedCell);
    assert.strictEqual(restored.elapsedSeconds, original.elapsedSeconds);
    assert.strictEqual(restored.mistakeCount, original.mistakeCount);
});

test('9. round-trip: pencilMarks are restored as Sets with same contents', () => {
    const original = makeSampleState();
    const serialized = serializeState(original);
    const restored = deserializeState(serialized);

    assert.ok(restored.pencilMarks[0] instanceof Set);
    assert.deepStrictEqual([...restored.pencilMarks[0]], [1, 2]);
    assert.deepStrictEqual([...restored.pencilMarks[1]], []);
    assert.deepStrictEqual([...restored.pencilMarks[2]], [3, 5, 7]);
});

test('10. round-trip: moveHistory is fully restored', () => {
    const original = makeSampleState();
    const serialized = serializeState(original);
    const restored = deserializeState(serialized);

    assert.strictEqual(restored.moveHistory.length, 2);
    assert.strictEqual(restored.moveHistory[0].row, 0);
    assert.strictEqual(restored.moveHistory[0].col, 2);
    assert.strictEqual(restored.moveHistory[0].newValue, 4);
    assert.deepStrictEqual(restored.moveHistory[0].pencilSnapshot, { 0: [1, 2], 2: [3, 5, 7] });
});

test('11. round-trip: JSON stringification preserves everything', () => {
    const original = makeSampleState();
    const json = JSON.stringify(serializeState(original));
    const restored = deserializeState(JSON.parse(json));

    assert.deepStrictEqual(restored.board, original.board);
    assert.deepStrictEqual([...restored.pencilMarks[0]], [1, 2]);
    assert.strictEqual(restored.currentDifficulty, 'medium');
    assert.strictEqual(restored.pencilMode, true);
    assert.deepStrictEqual(restored.selectedCell, { row: 0, col: 2 });
});

test('12. returns null for null input', () => {
    assert.strictEqual(deserializeState(null), null);
});

test('13. returns null for undefined input', () => {
    assert.strictEqual(deserializeState(undefined), null);
});

test('14. returns null for non-object input', () => {
    assert.strictEqual(deserializeState('not an object'), null);
    assert.strictEqual(deserializeState(42), null);
    assert.strictEqual(deserializeState(true), null);
});

test('15. returns null for object missing required arrays', () => {
    assert.strictEqual(deserializeState({}), null);
    assert.strictEqual(deserializeState({ originalPuzzle: [], board: [] }), null);
    assert.strictEqual(deserializeState({ originalPuzzle: [], board: [], pencilMarks: [] }), null);
});

test('16. handles empty game state (all zeros, empty Sets)', () => {
    const empty = {
        originalPuzzle: new Array(81).fill(0),
        board: new Array(81).fill(0),
        pencilMarks: Array(81).fill(null).map(() => new Set()),
        moveHistory: [],
        currentDifficulty: 'easy',
        pencilMode: false,
        selectedCell: null,
    };
    const serialized = serializeState(empty);
    const restored = deserializeState(serialized);

    assert.deepStrictEqual(restored.board, empty.board);
    assert.strictEqual(restored.moveHistory.length, 0);
    assert.strictEqual(restored.pencilMode, false);
    assert.strictEqual(restored.selectedCell, null);
});

test('17. defaults currentDifficulty to "easy" if missing', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    delete serialized.currentDifficulty;
    const restored = deserializeState(serialized);
    assert.strictEqual(restored.currentDifficulty, 'easy');
});

test('17b. defaults elapsedSeconds and mistakeCount to 0 if missing', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    delete serialized.elapsedSeconds;
    delete serialized.mistakeCount;
    const restored = deserializeState(serialized);
    assert.strictEqual(restored.elapsedSeconds, 0);
    assert.strictEqual(restored.mistakeCount, 0);
});

test('17c. handles elapsedSeconds and mistakeCount in JSON round-trip', () => {
    const state = makeSampleState();
    const json = JSON.stringify(serializeState(state));
    const restored = deserializeState(JSON.parse(json));
    assert.strictEqual(restored.elapsedSeconds, 185);
    assert.strictEqual(restored.mistakeCount, 3);
});

test('18. coerces pencilMode to boolean', () => {
    const state = makeSampleState();
    const serialized = serializeState(state);
    serialized.pencilMode = 0;
    const restored = deserializeState(serialized);
    assert.strictEqual(restored.pencilMode, false);
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