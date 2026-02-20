// MCQ Index - Re-exports from registry
// REFACTORED: Now uses registry as single source of truth

import { getMCQForTopic, getAllMCQ } from '../registry';
import type { MCQ } from '../../types';

// Re-export for backward compatibility
// These are derived from registry, not duplicated
export const logaritmosMCQ: MCQ[] = getMCQForTopic('logaritmos');
export const quadrantesMCQ: MCQ[] = getMCQForTopic('trigonometria');

// Get all MCQ questions
export const getAllMCQQuestions = (): MCQ[] => {
    return getAllMCQ();
};

// Get MCQ for a specific topic
export const getMCQQuestionsForTopic = (topicId: string): MCQ[] => {
    return getMCQForTopic(topicId);
};

export default { logaritmosMCQ, quadrantesMCQ, getAllMCQQuestions, getMCQQuestionsForTopic };
