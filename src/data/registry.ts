// Topic Registry - Single Source of Truth for all content
// This eliminates switch statements and enables easy content addition
// MIGRATED: Now uses JSON content files instead of JS files
// REFACTORED: Uses factory functions to reduce boilerplate

import { colors } from '../styles/theme';
import type { MCQ } from '../types';

// =============================================================================
// IMPORTS - JSON Content Files
// =============================================================================

// Lessons
import logaritmosLessonsData from '../content/lessons/logaritmos.json';
import trigonometriaLessonsData from '../content/lessons/trigonometria.json';
import funcoesElementarLessonsData from '../content/lessons/funcoes-elementar.json';
import calculoLimitesLessonsData from '../content/lessons/calculo-limites.json';
import calculoDerivadasLessonsData from '../content/lessons/calculo-derivadas.json';
import calculoRevisaoLessonsData from '../content/lessons/calculo-revisao.json';

// MCQ
import logaritmosMCQData from '../content/mcq/logaritmos.json';
import quadrantesMCQData from '../content/mcq/quadrantes.json';

// Exercises
import matElemAP1Data from '../content/exercises/mat-elem-ap1.json';
import matElemAP2Data from '../content/exercises/mat-elem-ap2.json';
import matElemAP3Data from '../content/exercises/mat-elem-ap3.json';
import matElemAP2_1Data from '../content/exercises/mat-elem-ap2.1.json';
import matElemAP3_1Data from '../content/exercises/mat-elem-ap3.1.json';
import exerciciosClassicosData from '../content/exercises/exercicios-classicos.json';
import calcAP1Data from '../content/exercises/calc-ap1.json';
import calcAP2Data from '../content/exercises/calc-ap2.json';
import calcAP4Data from '../content/exercises/calc-ap4.json';
import calcAP4_1Data from '../content/exercises/calc-ap4.1.json';
import calcRevisaoData from '../content/exercises/calc-revisao.json';
import calcFinalData from '../content/exercises/calc-final.json';

// =============================================================================
// EXTRACT ARRAYS - Maintain backward compatibility
// =============================================================================

const logaritmosLessons = logaritmosLessonsData.lessons;
const trigonometriaLessons = trigonometriaLessonsData.lessons;
const funcoesElementarLessons = funcoesElementarLessonsData.lessons;
const calculoLimitesLessons = calculoLimitesLessonsData.lessons;
const calculoDerivadasLessons = calculoDerivadasLessonsData.lessons;
const calculoRevisaoLessons = calculoRevisaoLessonsData.lessons;

const logaritmosMCQ = logaritmosMCQData.questions;
const quadrantesMCQ = quadrantesMCQData.questions;

const matElemAP1Exercises = matElemAP1Data.exercises;
const matElemAP2Exercises = matElemAP2Data.exercises;
const matElemAP3Exercises = matElemAP3Data.exercises;
const matElemAP2_1Exercises = matElemAP2_1Data.exercises;
const matElemAP3_1Exercises = matElemAP3_1Data.exercises;
const exerciciosClassicos = exerciciosClassicosData.exercises;
const calcAP1Exercises = calcAP1Data.exercises;
const calcAP2Exercises = calcAP2Data.exercises;
const calcAP4Exercises = calcAP4Data.exercises;
const calcAP4_1Exercises = calcAP4_1Data.exercises;
const calcRevisaoExercises = calcRevisaoData.exercises;
const calcFinalExercises = calcFinalData.exercises;

// =============================================================================
// FACTORY FUNCTIONS - DRY principle
// =============================================================================

interface TopicConfig {
    id: string;
    mainCategory: string;
    title: string;
    icon: string;
    color: string;
    lessons: unknown[];
    mcq: MCQ[] | null;
}

interface ExerciseTopicConfig {
    id: string;
    mainCategory: string;
    title: string;
    icon: string;
    color: string;
    exercises: unknown[];
}

/**
 * Factory function for creating topic entries with computed properties
 */
const createTopic = <T extends TopicConfig>(config: T) => ({
    ...config,
    get lessonCount() { return this.lessons.length; },
    get mcqCount() { return this.mcq ? this.mcq.length : 0; },
});

/**
 * Factory function for creating exercise topic entries with computed properties
 */
const createExerciseTopic = <T extends ExerciseTopicConfig>(config: T) => ({
    ...config,
    get exerciseCount() { return this.exercises.length; },
});

// =============================================================================
// MAIN CATEGORIES - Top level organization
// =============================================================================

export const mainCategories = [
    {
        id: 'mat-elementar',
        title: 'Matemática Elementar',
        icon: '🧮',
        color: colors.primary,
        description: 'Fundamentos para Cálculo',
    },
    {
        id: 'calculo-i',
        title: 'Cálculo I',
        icon: '📈',
        color: colors.elementar,
        description: 'Limites e Derivadas',
    },
];

// =============================================================================
// TOPIC REGISTRY - Learning topics with lessons and MCQ
// =============================================================================

export const topicRegistry = {
    // -------------------------------------------------------------------------
    // MATEMÁTICA ELEMENTAR
    // -------------------------------------------------------------------------
    logaritmos: createTopic({
        id: 'logaritmos',
        mainCategory: 'mat-elementar',
        title: 'Logaritmos',
        icon: '📊',
        color: colors.logaritmos,
        lessons: logaritmosLessons,
        mcq: logaritmosMCQ,
    }),
    trigonometria: createTopic({
        id: 'trigonometria',
        mainCategory: 'mat-elementar',
        title: 'Trigonometria',
        icon: '📐',
        color: colors.trigonometria,
        lessons: trigonometriaLessons,
        mcq: quadrantesMCQ,
    }),
    elementar: createTopic({
        id: 'elementar',
        mainCategory: 'mat-elementar',
        title: 'Funções e Prostaférese',
        icon: '🔗',
        color: colors.elementar,
        lessons: funcoesElementarLessons,
        mcq: null,
    }),

    // -------------------------------------------------------------------------
    // CÁLCULO I
    // -------------------------------------------------------------------------
    limites: createTopic({
        id: 'limites',
        mainCategory: 'calculo-i',
        title: 'Limites',
        icon: '🎯',
        color: colors.limites,
        lessons: calculoLimitesLessons,
        mcq: null,
    }),
    derivadas: createTopic({
        id: 'derivadas',
        mainCategory: 'calculo-i',
        title: 'Derivadas',
        icon: '📈',
        color: colors.derivadas,
        lessons: calculoDerivadasLessons,
        mcq: null,
    }),
    revisao: createTopic({
        id: 'revisao',
        mainCategory: 'calculo-i',
        title: 'Revisão Geral',
        icon: '🔄',
        color: '#F97316',
        lessons: calculoRevisaoLessons,
        mcq: null,
    }),
};

// =============================================================================
// EXERCISE REGISTRY - Provas organized by exam
// =============================================================================

export const exerciseRegistry = {
    // -------------------------------------------------------------------------
    // MATEMÁTICA ELEMENTAR
    // -------------------------------------------------------------------------
    'mat-elem-r1': createExerciseTopic({
        id: 'mat-elem-r1',
        mainCategory: 'mat-elementar',
        title: 'R1 - Revisão',
        icon: '📚',
        color: colors.success,
        exercises: exerciciosClassicos,
    }),
    'mat-elem-ap1': createExerciseTopic({
        id: 'mat-elem-ap1',
        mainCategory: 'mat-elementar',
        title: 'AP1 - Funções',
        icon: '📝',
        color: colors.primary,
        exercises: matElemAP1Exercises,
    }),
    'mat-elem-ap2': createExerciseTopic({
        id: 'mat-elem-ap2',
        mainCategory: 'mat-elementar',
        title: 'AP2 - Funções Avançado',
        icon: '📝',
        color: colors.primaryLight,
        exercises: matElemAP2Exercises,
    }),
    'mat-elem-ap2.1': createExerciseTopic({
        id: 'mat-elem-ap2.1',
        mainCategory: 'mat-elementar',
        title: 'AP2.1 - Funções',
        icon: '📝',
        color: colors.primary,
        exercises: matElemAP2_1Exercises,
    }),
    'mat-elem-ap3': createExerciseTopic({
        id: 'mat-elem-ap3',
        mainCategory: 'mat-elementar',
        title: 'AP3 - Trigonometria',
        icon: '📝',
        color: colors.secondary,
        exercises: matElemAP3Exercises,
    }),
    'mat-elem-ap3.1': createExerciseTopic({
        id: 'mat-elem-ap3.1',
        mainCategory: 'mat-elementar',
        title: 'AP3.1 - Log/Trig',
        icon: '📝',
        color: colors.secondary,
        exercises: matElemAP3_1Exercises,
    }),

    // -------------------------------------------------------------------------
    // CÁLCULO I
    // -------------------------------------------------------------------------
    'calc-ap1': createExerciseTopic({
        id: 'calc-ap1',
        mainCategory: 'calculo-i',
        title: 'AP1 - Limites I',
        icon: '📝',
        color: colors.elementar,
        exercises: calcAP1Exercises,
    }),
    'calc-ap2': createExerciseTopic({
        id: 'calc-ap2',
        mainCategory: 'calculo-i',
        title: 'AP2 - Limites II',
        icon: '📝',
        color: colors.elementarLight,
        exercises: calcAP2Exercises,
    }),
    'calc-ap4': createExerciseTopic({
        id: 'calc-ap4',
        mainCategory: 'calculo-i',
        title: 'AP4 - Derivadas',
        icon: '📝',
        color: colors.derivadas,
        exercises: calcAP4Exercises,
    }),
    'calc-ap4.1': createExerciseTopic({
        id: 'calc-ap4.1',
        mainCategory: 'calculo-i',
        title: 'AP4.1 - Derivadas',
        icon: '📝',
        color: colors.derivadas,
        exercises: calcAP4_1Exercises,
    }),
    'calc-revisao': createExerciseTopic({
        id: 'calc-revisao',
        mainCategory: 'calculo-i',
        title: 'Revisão Geral',
        icon: '🔄',
        color: '#F97316',
        exercises: calcRevisaoExercises,
    }),
    'calc-final': createExerciseTopic({
        id: 'calc-final',
        mainCategory: 'calculo-i',
        title: 'Avaliação Final',
        icon: '🎯',
        color: colors.derivadasLight,
        exercises: calcFinalExercises,
    }),
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type TopicId = keyof typeof topicRegistry;
type ExerciseTopicId = keyof typeof exerciseRegistry;

// =============================================================================
// HELPER FUNCTIONS - No switch statements!
// =============================================================================

/**
 * Get a topic by ID
 */
export const getTopic = (topicId: string) =>
    topicId in topicRegistry ? topicRegistry[topicId as TopicId] : null;

/**
 * Get lessons for a topic
 */
export const getLessonsForTopic = (topicId: string) => {
    if (!(topicId in topicRegistry)) return [];
    const topic = topicRegistry[topicId as TopicId];
    return topic?.lessons || [];
};

/**
 * Get MCQ for a topic
 */
export const getMCQForTopic = (topicId: string) => {
    if (!(topicId in topicRegistry)) return [];
    const topic = topicRegistry[topicId as TopicId];
    return topic?.mcq || [];
};

/**
 * Get color for a topic
 */
export const getTopicColor = (topicId: string): string => {
    if (!(topicId in topicRegistry)) return colors.primary;
    const topic = topicRegistry[topicId as TopicId];
    return topic?.color || colors.primary;
};

/**
 * Get title for a topic
 */
export const getTopicTitle = (topicId: string): string => {
    if (!(topicId in topicRegistry)) return '';
    const topic = topicRegistry[topicId as TopicId];
    return topic ? `${topic.icon} ${topic.title}` : '';
};

/**
 * Get all topics for a main category
 */
export const getTopicsForCategory = (categoryId: string) => {
    return Object.values(topicRegistry).filter(t => t.mainCategory === categoryId);
};

/**
 * Get all exercise topics for a main category
 */
export const getExerciseTopicsForCategory = (categoryId: string) => {
    return Object.values(exerciseRegistry).filter(t => t.mainCategory === categoryId);
};

/**
 * Get exercises for a topic
 */
export const getExercisesForTopic = (topicId: string) => {
    if (!(topicId in exerciseRegistry)) return [];
    const topic = exerciseRegistry[topicId as ExerciseTopicId];
    return topic?.exercises || [];
};

/**
 * Get ALL exercises flat array
 */
export const getAllExercises = () => {
    return Object.values(exerciseRegistry).flatMap(t => t.exercises);
};

/**
 * Get ALL MCQ questions
 */
export const getAllMCQ = (): MCQ[] => {
    return Object.values(topicRegistry)
        .filter((t): t is typeof t & { mcq: MCQ[] } => t.mcq !== null && t.mcq !== undefined)
        .flatMap(t => t.mcq);
};

/**
 * Get ALL lessons
 */
export const getAllLessons = () => {
    return Object.values(topicRegistry).flatMap(t => t.lessons);
};

/**
 * Get statistics
 */
export const getContentStats = () => ({
    totalTopics: Object.keys(topicRegistry).length,
    totalLessons: getAllLessons().length,
    totalMCQ: getAllMCQ().length,
    totalExercises: getAllExercises().length,
    totalExams: Object.keys(exerciseRegistry).length,
});

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================

export const learningTopics = Object.values(topicRegistry);
export const exerciseTopics = Object.values(exerciseRegistry);
export const exercises = getAllExercises();

export default {
    mainCategories,
    topicRegistry,
    exerciseRegistry,
    getTopic,
    getLessonsForTopic,
    getMCQForTopic,
    getTopicColor,
    getTopicTitle,
    getTopicsForCategory,
    getExerciseTopicsForCategory,
    getExercisesForTopic,
    getAllExercises,
    getAllMCQ,
    getAllLessons,
    getContentStats,
};
