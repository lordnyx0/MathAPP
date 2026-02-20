/**
 * Answer Validator Tests
 * Tests for normalizing and comparing math answers
 */
const {
    normalizeAnswer,
    compareAnswers,
    checkAnswer,
} = require('../../src/utils/answerValidator');

describe('Answer Validator', () => {
    describe('normalizeAnswer', () => {
        it('should handle null and undefined', () => {
            expect(normalizeAnswer(null)).toBe('');
            expect(normalizeAnswer(undefined)).toBe('');
        });

        it('should lowercase and trim', () => {
            expect(normalizeAnswer('  HELLO  ')).toBe('hello');
        });

        it('should remove spaces', () => {
            expect(normalizeAnswer('1 / 2')).toBe('1/2');
            expect(normalizeAnswer('x + 1')).toBe('x+1');
        });

        it('should normalize math symbols', () => {
            expect(normalizeAnswer('√9')).toBe('sqrt9');
            expect(normalizeAnswer('π')).toBe('pi');
            expect(normalizeAnswer('∞')).toBe('inf');
        });

        it('should normalize comparison operators', () => {
            expect(normalizeAnswer('x ≤ 5')).toBe('x<=5');
            expect(normalizeAnswer('x ≥ 5')).toBe('x>=5');
            expect(normalizeAnswer('x ≠ 5')).toBe('x!=5');
        });

        it('should normalize minus signs', () => {
            expect(normalizeAnswer('−1')).toBe('-1'); // unicode minus
            expect(normalizeAnswer('–1')).toBe('-1'); // en dash
            expect(normalizeAnswer('—1')).toBe('-1'); // em dash
        });

        it('should normalize boolean answers', () => {
            expect(normalizeAnswer('SIM')).toBe('sim');
            expect(normalizeAnswer('Yes')).toBe('sim');
            expect(normalizeAnswer('verdadeiro')).toBe('sim');
            expect(normalizeAnswer('NÃO')).toBe('nao');
            expect(normalizeAnswer('No')).toBe('nao');
            expect(normalizeAnswer('falso')).toBe('nao');
        });
    });

    describe('compareAnswers', () => {
        describe('string matching', () => {
            it('should match identical strings', () => {
                expect(compareAnswers('42', '42')).toBe(true);
                expect(compareAnswers('x+1', 'x+1')).toBe(true);
            });

            it('should ignore case', () => {
                expect(compareAnswers('SIM', 'sim')).toBe(true);
            });

            it('should ignore spaces', () => {
                expect(compareAnswers('1 / 2', '1/2')).toBe(true);
            });
        });

        describe('fraction comparison', () => {
            it('should compare equivalent fractions', () => {
                expect(compareAnswers('1/2', '2/4')).toBe(true);
                expect(compareAnswers('1/2', '0.5')).toBe(true);
                expect(compareAnswers('2/3', '0.667')).toBe(true); // within tolerance
            });

            it('should handle negative fractions', () => {
                expect(compareAnswers('-1/2', '-0.5')).toBe(true);
                expect(compareAnswers('1/-2', '-0.5')).toBe(true);
            });
        });

        describe('numeric comparison', () => {
            it('should compare with tolerance', () => {
                expect(compareAnswers('3.14', '3.141')).toBe(true);
                expect(compareAnswers('3.14', '3.2')).toBe(false);
            });

            it('should use relative tolerance for large numbers', () => {
                expect(compareAnswers('1000', '1001')).toBe(true); // 0.1% diff
                expect(compareAnswers('1000', '1050')).toBe(false); // 5% diff
            });
        });

        describe('bracket removal', () => {
            it('should match with or without brackets', () => {
                expect(compareAnswers('3, 2187', '{3, 2187}')).toBe(true);
                expect(compareAnswers('[1, 2]', '1, 2')).toBe(true);
            });
        });

        describe('edge cases', () => {
            it('should handle empty inputs', () => {
                expect(compareAnswers('', '')).toBe(true);
                expect(compareAnswers(null, null)).toBe(true);
            });

            it('should not match clearly different answers', () => {
                expect(compareAnswers('1', '2')).toBe(false);
                expect(compareAnswers('sim', 'nao')).toBe(false);
            });
        });
    });

    describe('checkAnswer', () => {
        it('should return correct: true for matching answers', () => {
            const result = checkAnswer('42', '42');
            expect(result.correct).toBe(true);
            expect(result.feedback).toBeUndefined();
        });

        it('should return correct: false for non-matching answers', () => {
            const result = checkAnswer('5', '42');
            expect(result.correct).toBe(false);
        });

        it('should provide "close" feedback for near misses', () => {
            // Diff of 0.05 is > 0.01 tolerance but < 0.1 threshold for "close" feedback
            const result = checkAnswer('3.19', '3.14');
            expect(result.correct).toBe(false);
            expect(result.feedback).toContain('Quase');
        });
    });
});
