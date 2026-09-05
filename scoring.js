// ============================================================
//  Sudoku — Scoring System (pure logic, no DOM/globals)
// ============================================================
//
//  Computes final scores based on difficulty, elapsed time, and
//  mistake count. Also provides time formatting and best-score
//  persistence via localStorage.
//
//  Works in both Node.js (module.exports) and browser (global).
//  In Node, auto-loads storage.js for the withLocalStorage helper.
//  In browser, withLocalStorage is available as a global from <script>.

if (typeof require !== 'undefined' && typeof withLocalStorage === 'undefined') {
    require('./storage.js');
}

// ---- Constants ----------------------------------------------
const DIFFICULTY_BASE = {
    easy:   1000,
    medium: 2000,
    hard:   3000,
};

const TIME_PENALTY_PER_SECOND = 1;    // 1 point per second
const MISTAKE_PENALTY_PER = 30;       // 30 points per mistake
const HINT_PENALTY_PER = 50;         // 50 points per hint
const PENALTY_CAP_FRACTION = 0.5;     // each penalty capped at 50% of base
const MIN_SCORE_FRACTION = 0.1;       // minimum score is 10% of base

const BEST_SCORES_KEY = 'sudoku-best-scores';

// ---- Score Computation --------------------------------------
/**
 * Compute the final score for a completed puzzle.
 *
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {number} elapsedSeconds - total seconds taken
 * @param {number} mistakeCount - number of conflicting placements
 * @param {number} hintCount - number of hints used (default 0)
 * @returns {Object} { base, timePenalty, mistakePenalty, hintPenalty, final, breakdown }
 */
function computeScore(difficulty, elapsedSeconds, mistakeCount, hintCount = 0) {
    const base = DIFFICULTY_BASE[difficulty] || DIFFICULTY_BASE.easy;
    const maxPenalty = Math.floor(base * PENALTY_CAP_FRACTION);

    const timePenalty = Math.min(
        Math.floor(elapsedSeconds * TIME_PENALTY_PER_SECOND),
        maxPenalty
    );

    const mistakePenalty = Math.min(
        mistakeCount * MISTAKE_PENALTY_PER,
        maxPenalty
    );

    const hintPenalty = Math.min(
        hintCount * HINT_PENALTY_PER,
        maxPenalty
    );

    const minScore = Math.floor(base * MIN_SCORE_FRACTION);
    const final = Math.max(minScore, base - timePenalty - mistakePenalty - hintPenalty);
    const breakdown = `${base} - ${timePenalty} - ${mistakePenalty} - ${hintPenalty} = ${final}`;

    return { base, timePenalty, mistakePenalty, hintPenalty, final, breakdown };
}

// ---- Time Formatting ----------------------------------------
/**
 * Format seconds as MM:SS.
 *
 * @param {number} seconds - elapsed seconds
 * @returns {string} formatted time string, e.g. "05:32"
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ---- Best Scores (localStorage) -----------------------------
/**
 * Read best scores from localStorage.
 * Returns an object like { easy: 820, medium: 1500, hard: 2370 }
 * or {} if none exist or storage is unavailable.
 */
function getBestScores() {
    return withLocalStorage(() => {
        const raw = localStorage.getItem(BEST_SCORES_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    }, {});
}

/**
 * Save a score as the best for its difficulty if it's higher
 * than the existing best (or no best exists yet).
 *
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {number} score - the score to potentially save
 * @returns {boolean} true if a new best was saved, false otherwise
 */
function saveBestScore(difficulty, score) {
    const scores = getBestScores();
    if (!scores[difficulty] || score > scores[difficulty]) {
        scores[difficulty] = score;
        return withLocalStorage(() => {
            localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(scores));
            return true;
        }, false);
    }
    return false;
}

/**
 * Read the best score for a single difficulty.
 *
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {number} best score, or 0 if none exists
 */
function getBestScore(difficulty) {
    const scores = getBestScores();
    return scores[difficulty] || 0;
}

// ---- Exports ------------------------------------------------
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DIFFICULTY_BASE,
        TIME_PENALTY_PER_SECOND,
        MISTAKE_PENALTY_PER,
        HINT_PENALTY_PER,
        PENALTY_CAP_FRACTION,
        MIN_SCORE_FRACTION,
        computeScore,
        formatTime,
        getBestScores,
        getBestScore,
        saveBestScore,
    };
}