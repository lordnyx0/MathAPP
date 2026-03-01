const { generateRandomQuestion: genDerivQ, generateWrongAnswers: genDerivWrong } = require('../../src/data/derivativeGenerator');
const { generateRandomQuestion: genIntQ, generateWrongAnswers: genIntWrong } = require('../../src/data/integralGenerator');

const hasAwkwardArtifacts = (s) => {
    const checks = [
        /\+\s*\+/,
        /-\s*-/,
        /\(\s*\)/,
        /^\s*$/,
        /^\+/,
        /\+\s*C\s*\+\s*C/,
    ];
    return checks.some((rx) => rx.test(s));
};

describe('Generator distractor quality', () => {
    it('derivative wrong answers are unique, non-empty, and not malformed', () => {
        for (let i = 0; i < 30; i++) {
            const q = genDerivQ();
            const wrong = genDerivWrong(q, 3);

            expect(wrong).toHaveLength(3);
            expect(new Set(wrong).size).toBe(3);

            wrong.forEach((w) => {
                expect(w).not.toBe(q.derivative);
                expect(w.trim().length).toBeGreaterThan(0);
                expect(hasAwkwardArtifacts(w)).toBe(false);
            });
        }
    });

    it('integral wrong answers are unique, non-empty, and not malformed', () => {
        for (let i = 0; i < 30; i++) {
            const q = genIntQ();
            const wrong = genIntWrong(q, 3);

            expect(wrong).toHaveLength(3);
            expect(new Set(wrong).size).toBe(3);

            wrong.forEach((w) => {
                expect(w).not.toBe(q.integral);
                expect(w.trim().length).toBeGreaterThan(0);
                expect(hasAwkwardArtifacts(w)).toBe(false);
            });
        }
    });
});
