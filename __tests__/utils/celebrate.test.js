/**
 * Streak-milestone predicate tests.
 *
 * celebrate.ts imports the Toast component (React Native) for its side effect;
 * mock that and haptics so the pure predicate can be tested without RN.
 */
jest.mock('../../src/components/Toast', () => ({ showToast: jest.fn() }));
jest.mock('../../src/utils/haptics', () => ({ tapHeavy: jest.fn() }));

const { isStreakMilestone, STREAK_MILESTONES } = require('../../src/utils/celebrate');

describe('isStreakMilestone', () => {
    it('is true for each defined milestone', () => {
        STREAK_MILESTONES.forEach(m => expect(isStreakMilestone(m)).toBe(true));
    });

    it('is false for non-milestones', () => {
        [0, 1, 2, 3, 4, 6, 7, 9, 11, 24, 26].forEach(n =>
            expect(isStreakMilestone(n)).toBe(false)
        );
    });
});
