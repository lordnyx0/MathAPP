// Interleaving Module - Mix questions from different topics
// Research shows +40-50% retention vs blocked practice
// Now uses registry for auto-discovery!

import { getAllMCQ } from '../data/registry';
import type { MCQ } from '../types';
import type { MetacognitionEntry } from './metacognition';

/**
 * Get all available MCQ questions from registry
 * This auto-discovers all MCQ from all registered topics!
 */
export { getAllMCQ };

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export interface TopicDistribution {
    [topic: string]: number;
}

interface WeightedQuestion {
    question: MCQ;
    weight: number;
}

/**
 * Create an interleaved practice session
 */
export const createInterleavedSession = (
    count: number = 10,
    topics: string[] = [],
    difficulties: string[] = []
): MCQ[] => {
    let questions = getAllMCQ();

    // Filter by topics if specified
    if (topics.length > 0) {
        questions = questions.filter(q => topics.includes(q.topic));
    }

    // Filter by difficulty if specified
    if (difficulties.length > 0) {
        questions = questions.filter(q => difficulties.includes(q.difficulty));
    }

    // Shuffle and take requested count
    const shuffled = shuffle(questions);
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Create a session that prioritizes weak topics
 */
export const createAdaptiveSession = (
    metacognitionEntries: MetacognitionEntry[],
    count: number = 10
): MCQ[] => {
    const allQuestions = getAllMCQ();

    // Calculate error rates per topic
    const topicErrors: Record<string, { errors: number; total: number }> = {};
    metacognitionEntries.forEach(entry => {
        if (!topicErrors[entry.topic]) {
            topicErrors[entry.topic] = { errors: 0, total: 0 };
        }
        topicErrors[entry.topic].total++;
        if (!entry.correct) {
            topicErrors[entry.topic].errors++;
        }
    });

    // Weight questions: higher weight for error-prone topics
    const weightedQuestions: WeightedQuestion[] = allQuestions.map(q => {
        const topicData = topicErrors[q.topic];
        let weight = 1;

        if (topicData && topicData.total >= 3) {
            const errorRate = topicData.errors / topicData.total;
            weight = 1 + (errorRate * 2); // Up to 3x weight for 100% error rate
        }

        return { question: q, weight };
    });

    // Weighted random selection
    const selected: MCQ[] = [];
    const remaining = [...weightedQuestions];

    while (selected.length < count && remaining.length > 0) {
        const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < remaining.length; i++) {
            random -= remaining[i].weight;
            if (random <= 0) {
                selected.push(remaining[i].question);
                remaining.splice(i, 1);
                break;
            }
        }
    }

    // Final shuffle to avoid predictable order
    return shuffle(selected);
};

/**
 * Get topic distribution for a session
 */
export const getSessionDistribution = (questions: MCQ[]): TopicDistribution => {
    const distribution: TopicDistribution = {};
    questions.forEach(q => {
        distribution[q.topic] = (distribution[q.topic] || 0) + 1;
    });
    return distribution;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export interface InterleavingAPI {
    getAllMCQ: typeof getAllMCQ;
    createInterleavedSession: typeof createInterleavedSession;
    createAdaptiveSession: typeof createAdaptiveSession;
    getSessionDistribution: typeof getSessionDistribution;
}

const interleaving: InterleavingAPI = {
    getAllMCQ,
    createInterleavedSession,
    createAdaptiveSession,
    getSessionDistribution,
};

export default interleaving;
