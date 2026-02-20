// Spaced Repetition System (SRS) - SM-2 Inspired Algorithm
// Based on Ebbinghaus forgetting curve research
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface SRSHistory {
    date: number;
    quality: number;
    correct: boolean;
}

export interface SRSCard {
    questionId: string;
    topic: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: number;
    lastReview: number | null;
    history: SRSHistory[];
}

export interface SRSStats {
    total: number;
    due: number;
    learning: number;
    reviewing: number;
    mature: number;
    accuracy: string | number;
    streak: number;
}

// ============================================================
// QUALITY RATINGS
// ============================================================

/**
 * Quality ratings for answers
 * 0 - Complete blackout, no recall
 * 1 - Wrong answer, but recognized after seeing correct
 * 2 - Wrong answer, hard to recall
 * 3 - Correct with difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect recall, instant answer
 */
export const Quality = {
    BLACKOUT: 0,
    WRONG_RECOGNIZED: 1,
    WRONG_HARD: 2,
    CORRECT_DIFFICULT: 3,
    CORRECT_HESITANT: 4,
    PERFECT: 5,
} as const;

export type QualityType = typeof Quality[keyof typeof Quality];

// ============================================================
// CARD FUNCTIONS
// ============================================================

/**
 * Default values for a new SRS card
 */
export const createCard = (questionId: string, topic: string): SRSCard => ({
    questionId,
    topic,
    easeFactor: 2.5,      // Difficulty multiplier (1.3 - 2.5+)
    interval: 0,          // Days until next review
    repetitions: 0,       // Consecutive correct answers
    nextReview: Date.now(), // When to show next
    lastReview: null,
    history: [],          // Array of {date, quality, correct}
});

/**
 * Calculate next review based on SM-2 algorithm
 */
export const calculateNextReview = (card: SRSCard, quality: number): SRSCard => {
    const updatedCard = { ...card };
    const now = Date.now();

    // Record history
    updatedCard.history = [
        ...updatedCard.history,
        {
            date: now,
            quality,
            correct: quality >= 3,
        }
    ];
    updatedCard.lastReview = now;

    if (quality >= 3) {
        // Correct answer
        if (updatedCard.repetitions === 0) {
            updatedCard.interval = 1; // 1 day
        } else if (updatedCard.repetitions === 1) {
            updatedCard.interval = 3; // 3 days
        } else {
            // interval * easeFactor
            updatedCard.interval = Math.round(updatedCard.interval * updatedCard.easeFactor);
        }
        updatedCard.repetitions++;
    } else {
        // Wrong answer - reset
        updatedCard.repetitions = 0;
        updatedCard.interval = 0; // Show again soon (within session)
    }

    // Update ease factor based on quality
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    updatedCard.easeFactor = Math.max(1.3, updatedCard.easeFactor + efChange);

    // Calculate next review date
    if (updatedCard.interval === 0) {
        // Show again in this session (10 minutes)
        updatedCard.nextReview = now + 10 * 60 * 1000;
    } else {
        // Convert days to milliseconds
        updatedCard.nextReview = now + updatedCard.interval * 24 * 60 * 60 * 1000;
    }

    return updatedCard;
};

/**
 * Check if a card is due for review
 */
export const isDue = (card: SRSCard): boolean => {
    return Date.now() >= card.nextReview;
};

/**
 * Get cards due for review from a collection
 */
export const getDueCards = (cards: SRSCard[]): SRSCard[] => {
    const now = Date.now();
    return cards
        .filter(card => card.nextReview <= now)
        .sort((a, b) => {
            // Priority: overdue cards first, then by interval (shorter = higher priority)
            const overdueA = now - a.nextReview;
            const overdueB = now - b.nextReview;
            if (overdueA !== overdueB) return overdueB - overdueA;
            return a.interval - b.interval;
        });
};

/**
 * Calculate current learning streak (consecutive days with reviews)
 */
const calculateStreak = (cards: SRSCard[]): number => {
    const reviews = cards
        .flatMap(c => c.history)
        .map(h => new Date(h.date).toDateString())
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (reviews.length === 0) return 0;

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (reviews[0] !== today && reviews[0] !== yesterday) return 0;

    for (let i = 0; i < reviews.length; i++) {
        const expected = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
        if (reviews[i] === expected) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Get learning statistics for a collection of cards
 */
export const getStats = (cards: SRSCard[]): SRSStats => {
    const now = Date.now();
    const due = cards.filter(c => c.nextReview <= now);
    const learning = cards.filter(c => c.repetitions < 2);
    const reviewing = cards.filter(c => c.repetitions >= 2 && c.repetitions < 5);
    const mature = cards.filter(c => c.repetitions >= 5);

    const totalReviews = cards.reduce((sum, c) => sum + c.history.length, 0);
    const correctReviews = cards.reduce(
        (sum, c) => sum + c.history.filter(h => h.correct).length,
        0
    );

    return {
        total: cards.length,
        due: due.length,
        learning: learning.length,
        reviewing: reviewing.length,
        mature: mature.length,
        accuracy: totalReviews > 0 ? (correctReviews / totalReviews * 100).toFixed(1) : 0,
        streak: calculateStreak(cards),
    };
};

// ============================================================
// STORAGE FUNCTIONS
// ============================================================

export const saveCards = async (cards: SRSCard[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SRS_CARDS, JSON.stringify(cards));
    } catch (error) {
        console.error('Failed to save SRS cards:', error);
    }
};

export const loadCards = async (): Promise<SRSCard[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SRS_CARDS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load SRS cards:', error);
        return [];
    }
};

export const getOrCreateCard = (cards: SRSCard[], questionId: string, topic: string): SRSCard => {
    const existing = cards.find(c => c.questionId === questionId);
    if (existing) return existing;
    return createCard(questionId, topic);
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export interface SRSAPI {
    createCard: typeof createCard;
    calculateNextReview: typeof calculateNextReview;
    isDue: typeof isDue;
    getDueCards: typeof getDueCards;
    getStats: typeof getStats;
    saveCards: typeof saveCards;
    loadCards: typeof loadCards;
    getOrCreateCard: typeof getOrCreateCard;
    Quality: typeof Quality;
}

const srs: SRSAPI = {
    createCard,
    calculateNextReview,
    isDue,
    getDueCards,
    getStats,
    saveCards,
    loadCards,
    getOrCreateCard,
    Quality,
};

export default srs;
