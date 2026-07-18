// Adaptive difficulty — nudges question difficulty toward the learner's edge.
//
// Rule: three correct answers in a row step difficulty up; two wrong in a row
// step it down. Keeps beginners from stalling on hard items and stops advanced
// learners from grinding trivial ones. The generators already filter by these
// difficulty strings, so a trainer only needs to feed answers in and read the
// current difficulty back out.
import { useState, useCallback } from 'react';

export type DifficultyLevel = 'basico' | 'intermediario' | 'avancado';

export const DIFFICULTY_ORDER: DifficultyLevel[] = ['basico', 'intermediario', 'avancado'];

export const UP_THRESHOLD = 3;
export const DOWN_THRESHOLD = 2;

export interface AdaptiveState {
    difficulty: DifficultyLevel;
    correctRun: number;
    wrongRun: number;
}

const step = (difficulty: DifficultyLevel, delta: number): DifficultyLevel => {
    const idx = DIFFICULTY_ORDER.indexOf(difficulty);
    const next = Math.min(DIFFICULTY_ORDER.length - 1, Math.max(0, idx + delta));
    return DIFFICULTY_ORDER[next];
};

/**
 * Pure state transition: apply one answer to the adaptive state.
 */
export const advance = (state: AdaptiveState, isCorrect: boolean): AdaptiveState => {
    const correctRun = isCorrect ? state.correctRun + 1 : 0;
    const wrongRun = isCorrect ? 0 : state.wrongRun + 1;

    if (correctRun >= UP_THRESHOLD) {
        return { difficulty: step(state.difficulty, +1), correctRun: 0, wrongRun: 0 };
    }
    if (wrongRun >= DOWN_THRESHOLD) {
        return { difficulty: step(state.difficulty, -1), correctRun: 0, wrongRun: 0 };
    }
    return { difficulty: state.difficulty, correctRun, wrongRun };
};

export interface UseAdaptiveDifficulty {
    difficulty: DifficultyLevel;
    /** Feed the result of the latest answer; returns the (possibly new) difficulty. */
    register: (isCorrect: boolean) => DifficultyLevel;
    /** Reset back to the starting difficulty (e.g. when a new session begins). */
    reset: (to?: DifficultyLevel) => void;
}

export const useAdaptiveDifficulty = (
    initial: DifficultyLevel = 'basico'
): UseAdaptiveDifficulty => {
    const [state, setState] = useState<AdaptiveState>({
        difficulty: initial,
        correctRun: 0,
        wrongRun: 0,
    });

    const register = useCallback((isCorrect: boolean): DifficultyLevel => {
        const next = advance(state, isCorrect);
        setState(next);
        return next.difficulty;
    }, [state]);

    const reset = useCallback((to: DifficultyLevel = initial) => {
        setState({ difficulty: to, correctRun: 0, wrongRun: 0 });
    }, [initial]);

    return { difficulty: state.difficulty, register, reset };
};

export default useAdaptiveDifficulty;
