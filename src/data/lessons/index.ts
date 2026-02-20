// Lessons Index - Re-exports from registry
// REFACTORED: Now uses registry as single source of truth
// No more switch statements or duplicate definitions

import { getLessonsForTopic as getFromRegistry, topicRegistry } from '../registry';

// Re-export the registry function directly
export const getLessonsForTopic = getFromRegistry;

// Get all lessons from a specific topic
export const getAllLessonsForTopic = getLessonsForTopic;

// Re-export individual lesson arrays for backward compatibility
// These are derived from the registry, not duplicated
export const logaritmosLessons = getLessonsForTopic('logaritmos');
export const trigonometriaLessons = getLessonsForTopic('trigonometria');
export const funcoesElementarLessons = getLessonsForTopic('elementar');
export const calculoLimitesLessons = getLessonsForTopic('limites');
export const calculoDerivadasLessons = getLessonsForTopic('derivadas');
export const calculoRevisaoLessons = getLessonsForTopic('revisao');

// Learning categories and topics are now sourced from registry
// Use: import { mainCategories, topicRegistry } from '../registry'
// These exports are kept for backward compatibility but marked as deprecated

/** @deprecated Use mainCategories from registry instead */
export const learningMainCategories = [
    { id: 'mat-elementar', title: 'Matemática Elementar', icon: '🧮', color: '#6366F1' },
    { id: 'calculo-i', title: 'Cálculo I', icon: '📈', color: '#EC4899' },
];

/** @deprecated Use getTopicsForCategory from registry instead */
export const learningTopics = Object.values(topicRegistry).map(topic => ({
    id: topic.id,
    mainCategory: topic.mainCategory,
    title: topic.title,
    icon: topic.icon,
    color: topic.color,
    lessonCount: topic.lessons.length,
}));
