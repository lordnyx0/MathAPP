/**
 * SRS Algorithm Tests
 * Tests for the Spaced Repetition System based on SM-2 algorithm
 */
const {
    createCard,
    calculateNextReview,
    isDue,
    getDueCards,
    getStats,
    Quality,
} = require('../../src/learning/srs');

describe('SRS Algorithm', () => {
    describe('createCard', () => {
        it('should create a card with default values', () => {
            const card = createCard('q1', 'logaritmos');

            expect(card.questionId).toBe('q1');
            expect(card.topic).toBe('logaritmos');
            expect(card.easeFactor).toBe(2.5);
            expect(card.interval).toBe(0);
            expect(card.repetitions).toBe(0);
            expect(card.history).toEqual([]);
            expect(card.nextReview).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('calculateNextReview', () => {
        it('should set interval to 1 day on first correct answer', () => {
            const card = createCard('q1', 'test');
            const updated = calculateNextReview(card, Quality.PERFECT);

            expect(updated.repetitions).toBe(1);
            expect(updated.interval).toBe(1);
            expect(updated.history.length).toBe(1);
            expect(updated.history[0].correct).toBe(true);
        });

        it('should set interval to 3 days on second correct answer', () => {
            let card = createCard('q1', 'test');
            card = calculateNextReview(card, Quality.PERFECT);
            card = calculateNextReview(card, Quality.CORRECT_HESITANT);

            expect(card.repetitions).toBe(2);
            expect(card.interval).toBe(3);
        });

        it('should multiply interval by ease factor on subsequent correct answers', () => {
            let card = createCard('q1', 'test');
            card = calculateNextReview(card, Quality.PERFECT); // rep 1, int 1
            card = calculateNextReview(card, Quality.PERFECT); // rep 2, int 3
            card = calculateNextReview(card, Quality.PERFECT); // rep 3, int 3*2.5 = 8

            expect(card.repetitions).toBe(3);
            expect(card.interval).toBeGreaterThanOrEqual(7); // ~8 with ease adjustments
        });

        it('should reset repetitions and interval on wrong answer', () => {
            let card = createCard('q1', 'test');
            card = calculateNextReview(card, Quality.PERFECT);
            card = calculateNextReview(card, Quality.PERFECT);
            card = calculateNextReview(card, Quality.WRONG_HARD);

            expect(card.repetitions).toBe(0);
            expect(card.interval).toBe(0);
        });

        it('should decrease ease factor on difficult answers', () => {
            const card = createCard('q1', 'test');
            const updated = calculateNextReview(card, Quality.CORRECT_DIFFICULT);

            expect(updated.easeFactor).toBeLessThan(2.5);
            expect(updated.easeFactor).toBeGreaterThanOrEqual(1.3); // minimum
        });

        it('should increase ease factor on perfect answers', () => {
            const card = createCard('q1', 'test');
            const updated = calculateNextReview(card, Quality.PERFECT);

            expect(updated.easeFactor).toBe(2.6); // 2.5 + 0.1
        });

        it('should never let ease factor go below 1.3', () => {
            let card = createCard('q1', 'test');
            card.easeFactor = 1.4;
            card = calculateNextReview(card, Quality.BLACKOUT);

            expect(card.easeFactor).toBe(1.3);
        });
    });

    describe('isDue', () => {
        it('should return true for cards with past nextReview', () => {
            const card = createCard('q1', 'test');
            card.nextReview = Date.now() - 1000;

            expect(isDue(card)).toBe(true);
        });

        it('should return false for cards with future nextReview', () => {
            const card = createCard('q1', 'test');
            card.nextReview = Date.now() + 86400000; // tomorrow

            expect(isDue(card)).toBe(false);
        });
    });

    describe('getDueCards', () => {
        it('should return only due cards sorted by priority', () => {
            const now = Date.now();
            const cards = [
                { ...createCard('q1', 't'), nextReview: now + 1000 },      // not due
                { ...createCard('q2', 't'), nextReview: now - 2000, interval: 1 },  // due, overdue 2s
                { ...createCard('q3', 't'), nextReview: now - 5000, interval: 2 },  // due, overdue 5s
            ];

            const due = getDueCards(cards);

            expect(due.length).toBe(2);
            expect(due[0].questionId).toBe('q3'); // more overdue first
            expect(due[1].questionId).toBe('q2');
        });
    });

    describe('getStats', () => {
        it('should calculate correct statistics', () => {
            const cards = [
                { ...createCard('q1', 't'), repetitions: 0, history: [] },
                { ...createCard('q2', 't'), repetitions: 3, history: [{ correct: true }, { correct: false }] },
                { ...createCard('q3', 't'), repetitions: 6, history: [{ correct: true }, { correct: true }] },
            ];
            cards[0].nextReview = Date.now() - 1000; // due
            cards[1].nextReview = Date.now() + 1000; // not due
            cards[2].nextReview = Date.now() - 1000; // due

            const stats = getStats(cards);

            expect(stats.total).toBe(3);
            expect(stats.due).toBe(2);
            expect(stats.learning).toBe(1);  // repetitions < 2
            expect(stats.reviewing).toBe(1); // 2 <= repetitions < 5
            expect(stats.mature).toBe(1);    // repetitions >= 5
            expect(parseFloat(stats.accuracy)).toBe(75); // 3/4 correct
        });
    });
});

describe('Quality ratings', () => {
    it('should have correct values', () => {
        expect(Quality.BLACKOUT).toBe(0);
        expect(Quality.WRONG_RECOGNIZED).toBe(1);
        expect(Quality.WRONG_HARD).toBe(2);
        expect(Quality.CORRECT_DIFFICULT).toBe(3);
        expect(Quality.CORRECT_HESITANT).toBe(4);
        expect(Quality.PERFECT).toBe(5);
    });
});
