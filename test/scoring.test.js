// ============================================================
//  Tests for scoring.js — score computation and time formatting
// ============================================================
//  Run with:  npm run test:scoring
//  Uses Node's built-in assert module — no external dependencies.
//  Tests the pure scoring logic without any browser or localStorage
//  dependencies (getBestScores/saveBestScore are not tested here
//  as they require localStorage).
// ============================================================
const assert = require('node:assert');
const {
    DIFFICULTY_BASE,
    TIME_PENALTY_PER_SECOND,
    MISTAKE_PENALTY_PER,
    PENALTY_CAP_FRACTION,
    MIN_SCORE_FRACTION,
    computeScore,
    formatTime,
    getBestScore,
} = require('../scoring.js');

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
//  Constants
// ============================================================
section('Constants');

test('1. base scores are correct for each difficulty', () => {
    assert.strictEqual(DIFFICULTY_BASE.easy, 1000);
    assert.strictEqual(DIFFICULTY_BASE.medium, 2000);
    assert.strictEqual(DIFFICULTY_BASE.hard, 3000);
});

test('2. penalty rates are correct', () => {
    assert.strictEqual(TIME_PENALTY_PER_SECOND, 1);
    assert.strictEqual(MISTAKE_PENALTY_PER, 30);
    assert.strictEqual(PENALTY_CAP_FRACTION, 0.5);
    assert.strictEqual(MIN_SCORE_FRACTION, 0.1);
});

// ============================================================
//  computeScore
// ============================================================
section('computeScore');

test('3. perfect game (0s, 0 mistakes) returns full base', () => {
    const result = computeScore('easy', 0, 0);
    assert.strictEqual(result.base, 1000);
    assert.strictEqual(result.timePenalty, 0);
    assert.strictEqual(result.mistakePenalty, 0);
    assert.strictEqual(result.final, 1000);
    assert.strictEqual(result.breakdown, '1000 - 0 - 0 - 0 = 1000');
});

test('4. perfect game for each difficulty', () => {
    assert.strictEqual(computeScore('easy', 0, 0).final, 1000);
    assert.strictEqual(computeScore('medium', 0, 0).final, 2000);
    assert.strictEqual(computeScore('hard', 0, 0).final, 3000);
});

test('5. time penalty is 1 point per second', () => {
    const result = computeScore('easy', 180, 0);
    assert.strictEqual(result.timePenalty, 180);
    assert.strictEqual(result.final, 820);
});

test('6. mistake penalty is 30 points per mistake', () => {
    const result = computeScore('easy', 0, 2);
    assert.strictEqual(result.mistakePenalty, 60);
    assert.strictEqual(result.final, 940);
});

test('7. combined penalties subtract from base', () => {
    const result = computeScore('easy', 300, 2);
    assert.strictEqual(result.timePenalty, 300);
    assert.strictEqual(result.mistakePenalty, 60);
    assert.strictEqual(result.final, 640);
    assert.strictEqual(result.breakdown, '1000 - 300 - 60 - 0 = 640');
});

test('8. time penalty is capped at 50% of base', () => {
    // easy base = 1000, cap = 500
    const result = computeScore('easy', 999, 0);
    assert.strictEqual(result.timePenalty, 500);
    assert.strictEqual(result.final, 500);
});

test('9. mistake penalty is capped at 50% of base', () => {
    // easy base = 1000, cap = 500, 20 mistakes = 600 but capped to 500
    const result = computeScore('easy', 0, 20);
    assert.strictEqual(result.mistakePenalty, 500);
    assert.strictEqual(result.final, 500);
});

test('10. both penalties capped at 50% each', () => {
    // easy base = 1000, time cap = 500, mistake cap = 500
    const result = computeScore('easy', 999, 20);
    assert.strictEqual(result.timePenalty, 500);
    assert.strictEqual(result.mistakePenalty, 500);
    // 1000 - 500 - 500 - 0 = 0, but minimum is 10% = 100
    assert.strictEqual(result.final, 100);
});

test('10b. hint penalty is 50 points per hint', () => {
    const result = computeScore('easy', 0, 0, 2);
    assert.strictEqual(result.hintPenalty, 100);
    assert.strictEqual(result.final, 900);
});

test('10c. hint penalty is capped at 50% of base', () => {
    // easy base = 1000, cap = 500, 20 hints = 1000 but capped to 500
    const result = computeScore('easy', 0, 0, 20);
    assert.strictEqual(result.hintPenalty, 500);
    assert.strictEqual(result.final, 500);
});

test('10d. all three penalties combined', () => {
    // easy base = 1000, 300s, 2 mistakes, 1 hint
    // 1000 - 300 - 60 - 50 = 590
    const result = computeScore('easy', 300, 2, 1);
    assert.strictEqual(result.timePenalty, 300);
    assert.strictEqual(result.mistakePenalty, 60);
    assert.strictEqual(result.hintPenalty, 50);
    assert.strictEqual(result.final, 590);
    assert.strictEqual(result.breakdown, '1000 - 300 - 60 - 50 = 590');
});

test('10e. all three penalties capped at 50% each', () => {
    // easy base = 1000, all caps = 500
    // 1000 - 500 - 500 - 500 = -500, but min = 100
    const result = computeScore('easy', 999, 20, 20);
    assert.strictEqual(result.timePenalty, 500);
    assert.strictEqual(result.mistakePenalty, 500);
    assert.strictEqual(result.hintPenalty, 500);
    assert.strictEqual(result.final, 100);
});

test('10f. hintCount defaults to 0 when omitted', () => {
    const result = computeScore('easy', 180, 0);
    assert.strictEqual(result.hintPenalty, 0);
    assert.strictEqual(result.final, 820);
});

test('11. minimum score is 10% of base', () => {
    // easy base = 1000, min = 100
    const result = computeScore('easy', 999, 20);
    assert.strictEqual(result.final, 100);
});

test('12. minimum score for medium and hard', () => {
    assert.strictEqual(computeScore('medium', 9999, 100).final, 200);
    assert.strictEqual(computeScore('hard', 9999, 100).final, 300);
});

test('13. hard difficulty: realistic scenario', () => {
    // hard base = 3000, 600s, 1 mistake
    const result = computeScore('hard', 600, 1);
    assert.strictEqual(result.timePenalty, 600);
    assert.strictEqual(result.mistakePenalty, 30);
    assert.strictEqual(result.final, 2370);
});

test('14. hard difficulty: slow game with mistakes', () => {
    // hard base = 3000, 1800s, 5 mistakes
    const result = computeScore('hard', 1800, 5);
    assert.strictEqual(result.timePenalty, 1500);
    assert.strictEqual(result.mistakePenalty, 150);
    assert.strictEqual(result.final, 1350);
});

test('15. unknown difficulty defaults to easy base', () => {
    const result = computeScore('unknown', 0, 0);
    assert.strictEqual(result.base, 1000);
    assert.strictEqual(result.final, 1000);
});

test('16. just under the time penalty cap', () => {
    // easy base = 1000, cap = 500, 499 seconds = 499 (not capped)
    const result = computeScore('easy', 499, 0);
    assert.strictEqual(result.timePenalty, 499);
    assert.strictEqual(result.final, 501);
});

test('17. exactly at the time penalty cap', () => {
    // easy base = 1000, cap = 500, 500 seconds = 500 (at cap)
    const result = computeScore('easy', 500, 0);
    assert.strictEqual(result.timePenalty, 500);
    assert.strictEqual(result.final, 500);
});

test('18. just above the time penalty cap', () => {
    // easy base = 1000, cap = 500, 501 seconds = capped to 500
    const result = computeScore('easy', 501, 0);
    assert.strictEqual(result.timePenalty, 500);
    assert.strictEqual(result.final, 500);
});

test('19. just under the mistake penalty cap', () => {
    // easy base = 1000, cap = 500, 16 mistakes = 480 (not capped)
    const result = computeScore('easy', 0, 16);
    assert.strictEqual(result.mistakePenalty, 480);
    assert.strictEqual(result.final, 520);
});

test('20. exactly at the mistake penalty cap', () => {
    // easy base = 1000, cap = 500, ~16.67 mistakes → 17 = 510 capped to 500
    const result = computeScore('easy', 0, 17);
    assert.strictEqual(result.mistakePenalty, 500);
    assert.strictEqual(result.final, 500);
});

test('20b. breakdown reflects capped penalties', () => {
    // easy base = 1000, 999s capped to 500, 20 mistakes capped to 500
    const result = computeScore('easy', 999, 20);
    assert.strictEqual(result.breakdown, '1000 - 500 - 500 - 0 = 100');
});

test('20c. breakdown reflects minimum score floor', () => {
    // When base - penalties < min, breakdown shows the min value
    const result = computeScore('medium', 9999, 100);
    assert.strictEqual(result.final, 200);
    assert.strictEqual(result.breakdown, '2000 - 1000 - 1000 - 0 = 200');
});

// ============================================================
//  getBestScore
// ============================================================
section('getBestScore');

test('28. returns 0 when no best score exists (no localStorage)', () => {
    // In Node, localStorage is undefined so getBestScore returns 0
    assert.strictEqual(getBestScore('easy'), 0);
    assert.strictEqual(getBestScore('medium'), 0);
    assert.strictEqual(getBestScore('hard'), 0);
});

// ============================================================
//  formatTime
// ============================================================
section('formatTime');

test('21. 0 seconds formats as 00:00', () => {
    assert.strictEqual(formatTime(0), '00:00');
});

test('22. under a minute pads seconds', () => {
    assert.strictEqual(formatTime(5), '00:05');
    assert.strictEqual(formatTime(30), '00:30');
});

test('23. exactly one minute', () => {
    assert.strictEqual(formatTime(60), '01:00');
});

test('24. minutes and seconds', () => {
    assert.strictEqual(formatTime(65), '01:05');
    assert.strictEqual(formatTime(125), '02:05');
    assert.strictEqual(formatTime(599), '09:59');
});

test('25. ten minutes', () => {
    assert.strictEqual(formatTime(600), '10:00');
});

test('26. one hour', () => {
    assert.strictEqual(formatTime(3600), '60:00');
});

test('27. large values still format correctly', () => {
    assert.strictEqual(formatTime(5400), '90:00');
    assert.strictEqual(formatTime(3599), '59:59');
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