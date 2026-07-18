/**
 * Interleaving / session-builder tests
 *
 * The content registry pulls in JSON that doesn't resolve under Jest, so we mock
 * it with a small fake MCQ pool. This keeps the session-builder logic testable
 * without loading the whole content graph.
 */
const fakePool = [
    { id: 'q1', topic: 'logaritmos', question: '', options: [], correctAnswer: 'a', difficulty: 'Básico' },
    { id: 'q2', topic: 'trigonometria', question: '', options: [], correctAnswer: 'a', difficulty: 'Básico' },
    { id: 'q3', topic: 'limites', question: '', options: [], correctAnswer: 'a', difficulty: 'Intermediário' },
    { id: 'q4', topic: 'derivadas', question: '', options: [], correctAnswer: 'a', difficulty: 'Avançado' },
];

jest.mock('../../src/data/registry', () => ({
    getAllMCQ: () => fakePool,
}));

const {
    createInterleavedSession,
    createReviewSession,
} = require('../../src/learning/interleaving');

// Minimal SRS card factory for tests
const card = (questionId, overrides = {}) => ({
    questionId,
    topic: 'test',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    lastReview: null,
    history: [],
    ...overrides,
});

describe('createReviewSession', () => {
    it('maps due cards back to their MCQ in the given order', () => {
        const ids = ['q3', 'q1', 'q2'];
        const dueCards = ids.map(id => card(id));

        const session = createReviewSession(dueCards, 10);

        expect(session.map(q => q.id)).toEqual(ids);
    });

    it('caps the session at the requested count', () => {
        const dueCards = fakePool.map(q => card(q.id));

        const session = createReviewSession(dueCards, 2);

        expect(session.length).toBe(2);
    });

    it('drops cards whose question no longer exists in the registry', () => {
        const dueCards = [card('does-not-exist'), card('q2')];

        const session = createReviewSession(dueCards, 10);

        expect(session.map(q => q.id)).toEqual(['q2']);
    });

    it('returns an empty array when there are no due cards', () => {
        expect(createReviewSession([], 10)).toEqual([]);
    });
});

describe('createInterleavedSession', () => {
    it('never returns more questions than requested', () => {
        expect(createInterleavedSession(2).length).toBe(2);
        expect(createInterleavedSession(100).length).toBe(fakePool.length);
    });
});
