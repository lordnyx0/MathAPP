// High-score persistence shared by the trainer screens.
// Each trainer stores its stats under its own AsyncStorage key as
// JSON of the form { highScore: number }.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from './index';

interface TrainerStats {
    highScore?: number;
}

/** Load the persisted high score for a trainer, defaulting to 0. */
export const loadHighScore = async (storageKey: string): Promise<number> => {
    try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
            const stats: TrainerStats | number = JSON.parse(saved);
            // Accept both the current { highScore } shape and the legacy
            // raw-number format some trainers persisted, so existing records
            // survive the migration to this util.
            const value = typeof stats === 'number' ? stats : stats.highScore;
            return value || 0;
        }
    } catch (error) {
        logError('loadHighScore', error);
    }
    return 0;
};

/**
 * Persist `score` as the new high score only if it strictly beats
 * `currentHighScore`. Returns the resulting high score — the caller can
 * compare it against `currentHighScore` to know whether a record was set.
 */
export const persistHighScore = async (
    storageKey: string,
    score: number,
    currentHighScore: number
): Promise<number> => {
    if (score <= currentHighScore) return currentHighScore;
    try {
        await AsyncStorage.setItem(storageKey, JSON.stringify({ highScore: score }));
    } catch (error) {
        logError('persistHighScore', error);
    }
    return score;
};
