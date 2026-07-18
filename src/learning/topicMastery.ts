// Topic Mastery Module — lightweight per-topic accuracy tracking for the
// arcade-style trainers.
//
// The trainers generate questions procedurally, so their question IDs don't
// recur and per-question SRS cards would just pollute the review store. Instead
// we aggregate correctness at the *topic* level. This powers the progress
// dashboard and gives every trainer a shared, comparable notion of mastery.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface TopicMastery {
    topic: string;
    correct: number;
    total: number;
    /** Longest run of consecutive correct answers ever achieved for this topic. */
    bestStreak: number;
    lastPracticed: number;
}

export type MasteryMap = Record<string, TopicMastery>;

export interface MasteryLevel {
    topic: string;
    accuracy: number;      // 0-100
    total: number;
    bestStreak: number;
    /** Coarse bucket derived from accuracy + volume, for UI grouping. */
    level: 'novato' | 'aprendiz' | 'competente' | 'mestre';
}

// ============================================================
// PURE HELPERS
// ============================================================

const emptyTopic = (topic: string): TopicMastery => ({
    topic,
    correct: 0,
    total: 0,
    bestStreak: 0,
    lastPracticed: 0,
});

/**
 * Apply one answer to a mastery map, returning a new map (pure).
 * `currentStreak` is the trainer's live streak so we can track the best run.
 */
export const applyAnswer = (
    map: MasteryMap,
    topic: string,
    isCorrect: boolean,
    currentStreak: number = 0
): MasteryMap => {
    const prev = map[topic] ?? emptyTopic(topic);
    const updated: TopicMastery = {
        topic,
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        bestStreak: Math.max(prev.bestStreak, currentStreak),
        lastPracticed: Date.now(),
    };
    return { ...map, [topic]: updated };
};

/**
 * Derive a display-friendly mastery level from raw counts.
 */
export const toMasteryLevel = (m: TopicMastery): MasteryLevel => {
    const accuracy = m.total > 0 ? (m.correct / m.total) * 100 : 0;
    let level: MasteryLevel['level'] = 'novato';
    if (m.total >= 5 && accuracy >= 85) level = 'mestre';
    else if (m.total >= 5 && accuracy >= 65) level = 'competente';
    else if (m.total >= 1) level = 'aprendiz';
    return { topic: m.topic, accuracy, total: m.total, bestStreak: m.bestStreak, level };
};

export const getMasteryLevels = (map: MasteryMap): MasteryLevel[] =>
    Object.values(map)
        .map(toMasteryLevel)
        .sort((a, b) => b.total - a.total);

// ============================================================
// STORAGE
// ============================================================

export const loadMastery = async (): Promise<MasteryMap> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.TOPIC_MASTERY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to load topic mastery:', error);
        return {};
    }
};

export const saveMastery = async (map: MasteryMap): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(map));
    } catch (error) {
        console.error('Failed to save topic mastery:', error);
    }
};

/**
 * Record one trainer answer for a topic. Fire-and-forget from trainer UIs.
 * Load-modify-save so concurrent trainers don't clobber each other's totals
 * beyond the last write (acceptable for a local single-user store).
 */
export const recordTopicAnswer = async (
    topic: string,
    isCorrect: boolean,
    currentStreak: number = 0
): Promise<void> => {
    const map = await loadMastery();
    await saveMastery(applyAnswer(map, topic, isCorrect, currentStreak));
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export interface TopicMasteryAPI {
    applyAnswer: typeof applyAnswer;
    toMasteryLevel: typeof toMasteryLevel;
    getMasteryLevels: typeof getMasteryLevels;
    loadMastery: typeof loadMastery;
    saveMastery: typeof saveMastery;
    recordTopicAnswer: typeof recordTopicAnswer;
}

const topicMastery: TopicMasteryAPI = {
    applyAnswer,
    toMasteryLevel,
    getMasteryLevels,
    loadMastery,
    saveMastery,
    recordTopicAnswer,
};

export default topicMastery;
