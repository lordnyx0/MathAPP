/**
 * Adaptive difficulty transition tests (pure `advance`).
 */
const {
    advance,
    UP_THRESHOLD,
    DOWN_THRESHOLD,
} = require('../../src/hooks/useAdaptiveDifficulty');

const start = (difficulty = 'basico') => ({ difficulty, correctRun: 0, wrongRun: 0 });

describe('advance', () => {
    it('steps up after UP_THRESHOLD consecutive correct', () => {
        let s = start('basico');
        for (let i = 0; i < UP_THRESHOLD; i++) s = advance(s, true);
        expect(s.difficulty).toBe('intermediario');
        expect(s.correctRun).toBe(0);
    });

    it('steps down after DOWN_THRESHOLD consecutive wrong', () => {
        let s = start('intermediario');
        for (let i = 0; i < DOWN_THRESHOLD; i++) s = advance(s, false);
        expect(s.difficulty).toBe('basico');
        expect(s.wrongRun).toBe(0);
    });

    it('resets the correct run when an answer is wrong', () => {
        let s = start('basico');
        s = advance(s, true);
        s = advance(s, false);
        expect(s.correctRun).toBe(0);
        expect(s.wrongRun).toBe(1);
    });

    it('never steps above avancado', () => {
        let s = start('avancado');
        for (let i = 0; i < UP_THRESHOLD; i++) s = advance(s, true);
        expect(s.difficulty).toBe('avancado');
    });

    it('never steps below basico', () => {
        let s = start('basico');
        for (let i = 0; i < DOWN_THRESHOLD; i++) s = advance(s, false);
        expect(s.difficulty).toBe('basico');
    });

    it('does not move before reaching a threshold', () => {
        let s = start('intermediario');
        s = advance(s, true); // 1 correct
        s = advance(s, false); // resets, 1 wrong
        expect(s.difficulty).toBe('intermediario');
    });
});
