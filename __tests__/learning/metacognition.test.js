/**
 * Metacognition Module Tests
 * Tests for confidence tracking and calibration
 */
const {
    Confidence,
    Calibration,
    analyzeCalibration,
    getCalibrationFeedback,
    createEntry,
    getStats,
    getWeaknesses,
} = require('../../src/learning/metacognition');

describe('Metacognition Module', () => {
    describe('analyzeCalibration', () => {
        it('should return ACCURATE_HIGH when confident and correct', () => {
            expect(analyzeCalibration(5, true)).toBe(Calibration.ACCURATE_HIGH);
            expect(analyzeCalibration(4, true)).toBe(Calibration.ACCURATE_HIGH);
        });

        it('should return ACCURATE_LOW when unsure and wrong', () => {
            expect(analyzeCalibration(1, false)).toBe(Calibration.ACCURATE_LOW);
            expect(analyzeCalibration(2, false)).toBe(Calibration.ACCURATE_LOW);
        });

        it('should return OVERCONFIDENT when confident but wrong', () => {
            expect(analyzeCalibration(5, false)).toBe(Calibration.OVERCONFIDENT);
            expect(analyzeCalibration(4, false)).toBe(Calibration.OVERCONFIDENT);
        });

        it('should return UNDERCONFIDENT when unsure but correct', () => {
            expect(analyzeCalibration(1, true)).toBe(Calibration.UNDERCONFIDENT);
            expect(analyzeCalibration(2, true)).toBe(Calibration.UNDERCONFIDENT);
        });

        it('should handle middle ground (confidence 3)', () => {
            expect(analyzeCalibration(3, true)).toBe(Calibration.ACCURATE_HIGH);
            expect(analyzeCalibration(3, false)).toBe(Calibration.ACCURATE_LOW);
        });
    });

    describe('getCalibrationFeedback', () => {
        it('should return positive feedback for ACCURATE_HIGH', () => {
            const feedback = getCalibrationFeedback(Calibration.ACCURATE_HIGH);
            expect(feedback.emoji).toBe('🎯');
            expect(feedback.message).toContain('sabe');
        });

        it('should return encouraging feedback for UNDERCONFIDENT', () => {
            const feedback = getCalibrationFeedback(Calibration.UNDERCONFIDENT);
            expect(feedback.emoji).toBe('🌟');
            expect(feedback.message).toContain('mais do que pensa');
        });

        it('should return warning feedback for OVERCONFIDENT', () => {
            const feedback = getCalibrationFeedback(Calibration.OVERCONFIDENT);
            expect(feedback.emoji).toBe('⚠️');
            expect(feedback.message).toContain('Cuidado');
        });
    });

    describe('createEntry', () => {
        it('should create entry with all fields', () => {
            const entry = createEntry('q1', 'logaritmos', 4, true);

            expect(entry.questionId).toBe('q1');
            expect(entry.topic).toBe('logaritmos');
            expect(entry.confidence).toBe(4);
            expect(entry.correct).toBe(true);
            expect(entry.calibration).toBe(Calibration.ACCURATE_HIGH);
            expect(entry.timestamp).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('getStats', () => {
        it('should return zero stats for empty entries', () => {
            const stats = getStats([]);
            expect(stats.totalAnswers).toBe(0);
            expect(stats.calibrationScore).toBe(0);
        });

        it('should calculate correct statistics', () => {
            const entries = [
                createEntry('q1', 't', 5, true),  // accurate_high
                createEntry('q2', 't', 1, false), // accurate_low
                createEntry('q3', 't', 5, false), // overconfident
                createEntry('q4', 't', 1, true),  // underconfident
            ];

            const stats = getStats(entries);

            expect(stats.totalAnswers).toBe(4);
            expect(parseFloat(stats.accuracyRate)).toBe(50); // 2/4 correct
            expect(parseFloat(stats.overconfidenceRate)).toBe(25); // 1/4
            expect(parseFloat(stats.underconfidenceRate)).toBe(25); // 1/4
            expect(parseFloat(stats.calibrationScore)).toBe(50); // 2/4 accurate
        });

        it('should calculate average confidence', () => {
            const entries = [
                createEntry('q1', 't', 5, true),
                createEntry('q2', 't', 3, true),
                createEntry('q3', 't', 1, false),
            ];

            const stats = getStats(entries);
            expect(parseFloat(stats.avgConfidence)).toBe(3); // (5+3+1)/3
        });
    });

    describe('getWeaknesses', () => {
        it('should identify topics with high overconfidence', () => {
            const entries = [
                // Topic A: 2 overconfident out of 4
                createEntry('q1', 'topicA', 5, false), // overconfident
                createEntry('q2', 'topicA', 5, false), // overconfident
                createEntry('q3', 'topicA', 5, true),
                createEntry('q4', 'topicA', 5, true),
                // Topic B: 0 overconfident out of 3
                createEntry('q5', 'topicB', 1, false),
                createEntry('q6', 'topicB', 5, true),
                createEntry('q7', 'topicB', 5, true),
            ];

            const weaknesses = getWeaknesses(entries);

            expect(weaknesses.length).toBe(2);
            expect(weaknesses[0].topic).toBe('topicA'); // higher overconfidence
            expect(weaknesses[0].overconfidenceRate).toBe(50);
            expect(weaknesses[1].overconfidenceRate).toBe(0);
        });

        it('should filter out topics with insufficient data', () => {
            const entries = [
                createEntry('q1', 'topicA', 5, false),
                createEntry('q2', 'topicA', 5, false), // only 2 entries
            ];

            const weaknesses = getWeaknesses(entries);
            expect(weaknesses.length).toBe(0); // needs >= 3
        });
    });
});

describe('Confidence levels', () => {
    it('should have correct values', () => {
        expect(Confidence.VERY_UNSURE).toBe(1);
        expect(Confidence.UNSURE).toBe(2);
        expect(Confidence.SOMEWHAT_SURE).toBe(3);
        expect(Confidence.CONFIDENT).toBe(4);
        expect(Confidence.VERY_CONFIDENT).toBe(5);
    });
});
