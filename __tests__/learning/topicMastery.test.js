/**
 * Topic mastery aggregation tests
 */
const {
    applyAnswer,
    toMasteryLevel,
    getMasteryLevels,
} = require('../../src/learning/topicMastery');

describe('applyAnswer', () => {
    it('creates a topic entry on first answer', () => {
        const map = applyAnswer({}, 'derivadas', true, 1);
        expect(map.derivadas.correct).toBe(1);
        expect(map.derivadas.total).toBe(1);
        expect(map.derivadas.bestStreak).toBe(1);
    });

    it('accumulates correct/total across answers', () => {
        let map = applyAnswer({}, 'derivadas', true, 1);
        map = applyAnswer(map, 'derivadas', false, 0);
        map = applyAnswer(map, 'derivadas', true, 1);
        expect(map.derivadas.total).toBe(3);
        expect(map.derivadas.correct).toBe(2);
    });

    it('tracks the best streak seen', () => {
        let map = applyAnswer({}, 'integrais', true, 3);
        map = applyAnswer(map, 'integrais', true, 1);
        expect(map.integrais.bestStreak).toBe(3);
    });

    it('keeps topics independent', () => {
        let map = applyAnswer({}, 'a', true, 1);
        map = applyAnswer(map, 'b', false, 0);
        expect(map.a.correct).toBe(1);
        expect(map.b.correct).toBe(0);
    });

    it('does not mutate the input map', () => {
        const original = {};
        applyAnswer(original, 'a', true, 1);
        expect(original).toEqual({});
    });
});

describe('toMasteryLevel', () => {
    it('is novato with no data', () => {
        expect(toMasteryLevel({ topic: 't', correct: 0, total: 0, bestStreak: 0, lastPracticed: 0 }).level)
            .toBe('novato');
    });

    it('is mestre with high accuracy and enough volume', () => {
        expect(toMasteryLevel({ topic: 't', correct: 9, total: 10, bestStreak: 5, lastPracticed: 0 }).level)
            .toBe('mestre');
    });

    it('is competente for mid accuracy', () => {
        expect(toMasteryLevel({ topic: 't', correct: 7, total: 10, bestStreak: 3, lastPracticed: 0 }).level)
            .toBe('competente');
    });

    it('is aprendiz with little data', () => {
        expect(toMasteryLevel({ topic: 't', correct: 1, total: 2, bestStreak: 1, lastPracticed: 0 }).level)
            .toBe('aprendiz');
    });
});

describe('getMasteryLevels', () => {
    it('sorts by total practiced, descending', () => {
        const map = {
            a: { topic: 'a', correct: 1, total: 2, bestStreak: 1, lastPracticed: 0 },
            b: { topic: 'b', correct: 5, total: 8, bestStreak: 3, lastPracticed: 0 },
        };
        expect(getMasteryLevels(map).map(l => l.topic)).toEqual(['b', 'a']);
    });
});
