// Metacognition Module - Confidence tracking and calibration
// Helps students develop self-awareness about their knowledge
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface MetacognitionEntry {
    questionId: string;
    topic: string;
    confidence: number;
    correct: boolean;
    calibration: CalibrationType;
    timestamp: number;
}

export interface CalibrationFeedback {
    emoji: string;
    message: string;
    tip: string;
}

export interface MetacognitionStats {
    totalAnswers: number;
    accuracyRate: string | number;
    overconfidenceRate: string | number;
    underconfidenceRate: string | number;
    avgConfidence: string | number;
    calibrationScore: string | number;
}

export interface TopicWeakness {
    topic: string;
    overconfidenceRate: number;
    accuracyRate: number;
    total: number;
}

// ============================================================
// CONFIDENCE LEVELS
// ============================================================

export const Confidence = {
    VERY_UNSURE: 1,      // "Não faço ideia"
    UNSURE: 2,           // "Acho que não sei"
    SOMEWHAT_SURE: 3,    // "Talvez eu saiba"
    CONFIDENT: 4,        // "Acho que sei"
    VERY_CONFIDENT: 5,   // "Tenho certeza"
} as const;

export type ConfidenceType = typeof Confidence[keyof typeof Confidence];

export const ConfidenceLabels: Record<number, string> = {
    1: 'Não faço ideia',
    2: 'Acho que não sei',
    3: 'Talvez eu saiba',
    4: 'Acho que sei',
    5: 'Tenho certeza',
};

// ============================================================
// CALIBRATION
// ============================================================

export const Calibration = {
    ACCURATE_HIGH: 'accurate_high',         // Confident and correct ✓
    ACCURATE_LOW: 'accurate_low',           // Unsure and wrong ✓
    OVERCONFIDENT: 'overconfident',         // Confident but wrong ✗
    UNDERCONFIDENT: 'underconfident',       // Unsure but correct ✗
} as const;

export type CalibrationType = typeof Calibration[keyof typeof Calibration];

/**
 * Analyze the calibration of a response
 */
export const analyzeCalibration = (confidence: number, correct: boolean): CalibrationType => {
    const isConfident = confidence >= 4;
    const isUnsure = confidence <= 2;

    if (correct && isConfident) return Calibration.ACCURATE_HIGH;
    if (!correct && isUnsure) return Calibration.ACCURATE_LOW;
    if (!correct && isConfident) return Calibration.OVERCONFIDENT;
    if (correct && isUnsure) return Calibration.UNDERCONFIDENT;

    // Middle ground (confidence 3)
    return correct ? Calibration.ACCURATE_HIGH : Calibration.ACCURATE_LOW;
};

/**
 * Get feedback message based on calibration
 */
export const getCalibrationFeedback = (calibration: CalibrationType): CalibrationFeedback => {
    switch (calibration) {
        case Calibration.ACCURATE_HIGH:
            return {
                emoji: '🎯',
                message: 'Você sabe que sabe!',
                tip: 'Continue assim, sua autoavaliação está precisa.'
            };
        case Calibration.ACCURATE_LOW:
            return {
                emoji: '💡',
                message: 'Você identificou uma área para melhorar.',
                tip: 'Revise este conceito com mais atenção.'
            };
        case Calibration.OVERCONFIDENT:
            return {
                emoji: '⚠️',
                message: 'Cuidado! Você pensou que sabia, mas errou.',
                tip: 'Revise este conceito - você pode estar com uma falsa impressão de conhecimento.'
            };
        case Calibration.UNDERCONFIDENT:
            return {
                emoji: '🌟',
                message: 'Você sabe mais do que pensa!',
                tip: 'Confie mais no seu conhecimento. Você acertou mesmo duvidando!'
            };
        default:
            return { emoji: '📊', message: '', tip: '' };
    }
};

/**
 * Create a metacognition entry
 */
export const createEntry = (
    questionId: string,
    topic: string,
    confidence: number,
    correct: boolean
): MetacognitionEntry => ({
    questionId,
    topic,
    confidence,
    correct,
    calibration: analyzeCalibration(confidence, correct),
    timestamp: Date.now(),
});

/**
 * Calculate metacognition statistics
 */
export const getStats = (entries: MetacognitionEntry[]): MetacognitionStats => {
    if (entries.length === 0) {
        return {
            totalAnswers: 0,
            accuracyRate: 0,
            overconfidenceRate: 0,
            underconfidenceRate: 0,
            avgConfidence: 0,
            calibrationScore: 0,
        };
    }

    const total = entries.length;
    const correct = entries.filter(e => e.correct).length;
    const overconfident = entries.filter(e => e.calibration === Calibration.OVERCONFIDENT).length;
    const underconfident = entries.filter(e => e.calibration === Calibration.UNDERCONFIDENT).length;
    const avgConfidence = entries.reduce((s, e) => s + e.confidence, 0) / total;

    // Calibration score: 100 = perfect calibration, 0 = always wrong calibration
    const accurateCount = entries.filter(e =>
        e.calibration === Calibration.ACCURATE_HIGH ||
        e.calibration === Calibration.ACCURATE_LOW
    ).length;
    const calibrationScore = (accurateCount / total) * 100;

    return {
        totalAnswers: total,
        accuracyRate: ((correct / total) * 100).toFixed(1),
        overconfidenceRate: ((overconfident / total) * 100).toFixed(1),
        underconfidenceRate: ((underconfident / total) * 100).toFixed(1),
        avgConfidence: avgConfidence.toFixed(1),
        calibrationScore: calibrationScore.toFixed(1),
    };
};

/**
 * Get topic-specific weaknesses (overconfident topics)
 */
export const getWeaknesses = (entries: MetacognitionEntry[]): TopicWeakness[] => {
    const topicStats: Record<string, { total: number; overconfident: number; correct: number }> = {};

    entries.forEach(entry => {
        if (!topicStats[entry.topic]) {
            topicStats[entry.topic] = {
                total: 0,
                overconfident: 0,
                correct: 0,
            };
        }
        topicStats[entry.topic].total++;
        if (entry.calibration === Calibration.OVERCONFIDENT) {
            topicStats[entry.topic].overconfident++;
        }
        if (entry.correct) {
            topicStats[entry.topic].correct++;
        }
    });

    // Sort by overconfidence rate
    return Object.entries(topicStats)
        .map(([topic, stats]) => ({
            topic,
            overconfidenceRate: (stats.overconfident / stats.total) * 100,
            accuracyRate: (stats.correct / stats.total) * 100,
            total: stats.total,
        }))
        .filter(t => t.total >= 3) // Only topics with enough data
        .sort((a, b) => b.overconfidenceRate - a.overconfidenceRate);
};

// ============================================================
// STORAGE FUNCTIONS
// ============================================================

export const saveEntries = async (entries: MetacognitionEntry[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.METACOGNITION, JSON.stringify(entries));
    } catch (error) {
        console.error('Failed to save metacognition entries:', error);
    }
};

export const loadEntries = async (): Promise<MetacognitionEntry[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.METACOGNITION);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load metacognition entries:', error);
        return [];
    }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export interface MetacognitionAPI {
    Confidence: typeof Confidence;
    ConfidenceLabels: typeof ConfidenceLabels;
    Calibration: typeof Calibration;
    analyzeCalibration: typeof analyzeCalibration;
    getCalibrationFeedback: typeof getCalibrationFeedback;
    createEntry: typeof createEntry;
    getStats: typeof getStats;
    getWeaknesses: typeof getWeaknesses;
    saveEntries: typeof saveEntries;
    loadEntries: typeof loadEntries;
}

const metacognition: MetacognitionAPI = {
    Confidence,
    ConfidenceLabels,
    Calibration,
    analyzeCalibration,
    getCalibrationFeedback,
    createEntry,
    getStats,
    getWeaknesses,
    saveEntries,
    loadEntries,
};

export default metacognition;
