// useQuestionGenerator - Hook-based question selection without global state
import { useState, useCallback } from 'react';
import { quadrantQuestions, getQuestionsByDifficulty, QuadrantQuestion } from '../data/quadrantQuestions';

export interface UseQuestionGeneratorReturn {
    currentQuestion: QuadrantQuestion | null;
    nextQuestion: () => QuadrantQuestion | null;
    resetGenerator: () => void;
    totalQuestions: number;
}

/**
 * Hook for generating random questions without consecutive duplicates
 * Replaces the global mutable state pattern in quadrantQuestions.js
 */
export const useQuestionGenerator = (difficulty?: string): UseQuestionGeneratorReturn => {
    const [lastIndex, setLastIndex] = useState<number>(-1);
    const [currentQuestion, setCurrentQuestion] = useState<QuadrantQuestion | null>(null);

    const questions: QuadrantQuestion[] = difficulty
        ? getQuestionsByDifficulty(difficulty)
        : quadrantQuestions;

    const nextQuestion = useCallback((): QuadrantQuestion | null => {
        if (questions.length === 0) {
            setCurrentQuestion(null);
            return null;
        }

        let index: number;
        do {
            index = Math.floor(Math.random() * questions.length);
        } while (index === lastIndex && questions.length > 1);

        setLastIndex(index);
        const question = questions[index];
        setCurrentQuestion(question);
        return question;
    }, [questions, lastIndex]);

    const resetGenerator = useCallback((): void => {
        setLastIndex(-1);
        setCurrentQuestion(null);
    }, []);

    return {
        currentQuestion,
        nextQuestion,
        resetGenerator,
        totalQuestions: questions.length,
    };
};

export default useQuestionGenerator;
