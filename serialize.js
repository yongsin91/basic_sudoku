// ============================================================
//  Sudoku — State Serialization (pure logic, no DOM/globals)
// ============================================================
//
//  Pure functions for converting game state to and from a
//  JSON-serializable plain object. Extracted from script.js so
//  they can be unit-tested in Node.js without a browser.
//
//  Works in both Node.js (module.exports) and browser (global).

/**
 * Convert live game state (with Sets) into a JSON-safe plain object.
 *
 * @param {Object} state - { originalPuzzle, board, pencilMarks,
 *   moveHistory, currentDifficulty, pencilMode, selectedCell,
 *   elapsedSeconds, mistakeCount, hintCount, hintedCells }
 * @returns {Object} JSON-safe plain object
 */
function serializeState(state) {
    return {
        originalPuzzle: [...state.originalPuzzle],
        board: [...state.board],
        pencilMarks: state.pencilMarks.map(s => [...s]),
        moveHistory: state.moveHistory.map(m => ({
            row: m.row,
            col: m.col,
            prevValue: m.prevValue,
            newValue: m.newValue,
            pencilSnapshot: { ...m.pencilSnapshot },
        })),
        currentDifficulty: state.currentDifficulty,
        pencilMode: state.pencilMode,
        selectedCell: state.selectedCell ? { ...state.selectedCell } : null,
        elapsedSeconds: state.elapsedSeconds || 0,
        mistakeCount: state.mistakeCount || 0,
        hintCount: state.hintCount || 0,
        hintedCells: [...(state.hintedCells || [])],
    };
}

/**
 * Convert a plain serialized object back into live game state
 * (reconstructing Sets from arrays).
 *
 * @param {Object} data - plain object from serializeState
 * @returns {Object|null} restored state object, or null on bad data
 */
function deserializeState(data) {
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.originalPuzzle) || !Array.isArray(data.board)) return null;
    if (!Array.isArray(data.pencilMarks) || !Array.isArray(data.moveHistory)) return null;

    try {
        return {
            originalPuzzle: [...data.originalPuzzle],
            board: [...data.board],
            pencilMarks: data.pencilMarks.map(arr => new Set(arr)),
            moveHistory: data.moveHistory.map(m => ({
                row: m.row,
                col: m.col,
                prevValue: m.prevValue,
                newValue: m.newValue,
                pencilSnapshot: { ...m.pencilSnapshot },
            })),
            currentDifficulty: data.currentDifficulty || 'easy',
            pencilMode: !!data.pencilMode,
            selectedCell: data.selectedCell ? { ...data.selectedCell } : null,
            elapsedSeconds: data.elapsedSeconds || 0,
            mistakeCount: data.mistakeCount || 0,
            hintCount: data.hintCount || 0,
            hintedCells: new Set(data.hintedCells || []),
        };
    } catch (e) {
        return null;
    }
}

// ---- Exports ------------------------------------------------
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { serializeState, deserializeState };
}