// ============================================================
//  Sudoku — localStorage Safe Access (shared helper)
// ============================================================
//
//  Wraps localStorage access in a try/catch + Storage availability
//  check so callers don't need to repeat the guard pattern.
//
//  Works in both Node.js (module.exports) and browser (global).

/**
 * Execute fn with localStorage access, returning fallback if
 * localStorage is unavailable (private mode, disabled, etc.)
 * or if fn throws.
 *
 * @param {Function} fn - function that accesses localStorage
 * @param {*} fallback - value to return if storage is unavailable
 * @returns {*} return value of fn, or fallback
 */
function withLocalStorage(fn, fallback) {
    try {
        if (typeof Storage === 'undefined') return fallback;
        return fn();
    } catch (e) {
        return fallback;
    }
}

// ---- Exports ------------------------------------------------
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { withLocalStorage };
}