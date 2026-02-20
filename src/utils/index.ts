// Utils - Error handling, state migration, and helpers
import { DEFAULT_COMPLETED_LESSONS, CompletedLessons } from '../constants';
import type { Exercise } from '../types';

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(jsonString: string | null | undefined, fallback: T): T => {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.warn('[safeJsonParse] Failed to parse JSON:', (error as Error).message);
        return fallback;
    }
};

/**
 * Log error with context (can be extended to send to analytics)
 */
export const logError = (
    context: string,
    error: Error | string | unknown,
    meta: Record<string, unknown> = {}
): void => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${context}]`, message, meta);
    // TODO: Send to Sentry/Firebase Crashlytics in production
};

/**
 * Migrate learning progress state to include new topics
 */
export const migrateLearningProgress = (savedState: unknown): CompletedLessons => {
    if (!savedState || typeof savedState !== 'object') {
        return { ...DEFAULT_COMPLETED_LESSONS };
    }

    // Merge with defaults to ensure all keys exist
    const migrated: CompletedLessons = { ...DEFAULT_COMPLETED_LESSONS };

    for (const key of Object.keys(DEFAULT_COMPLETED_LESSONS)) {
        const value = (savedState as Record<string, unknown>)[key];
        // Validate that it's an array of numbers before assigning
        if (Array.isArray(value) && value.every(item => typeof item === 'number')) {
            migrated[key] = value;
        }
    }

    return migrated;
};

export interface ValidationResult {
    valid: boolean;
    duplicates: string[];
}

/**
 * Validate that all exercise IDs are unique
 */
export const validateExerciseIds = (exercises: Exercise[]): ValidationResult => {
    const ids = new Set<string>();
    const duplicates: string[] = [];

    for (const exercise of exercises) {
        if (ids.has(exercise.id)) {
            duplicates.push(exercise.id);
        }
        ids.add(exercise.id);
    }

    return {
        valid: duplicates.length === 0,
        duplicates,
    };
};

export interface AsyncCleanup {
    isMounted: () => boolean;
    cleanup: () => void;
}

/**
 * Create async effect cleanup handler
 */
export const createAsyncCleanup = (): AsyncCleanup => {
    let mounted = true;
    return {
        isMounted: () => mounted,
        cleanup: () => { mounted = false; },
    };
};
