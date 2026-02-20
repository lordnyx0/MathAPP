// Constants - Centralized magic strings and configuration

// ============================================================
// ENUMS - Use these instead of magic strings
// ============================================================

// Screen modes for navigation state
export const ScreenMode = Object.freeze({
    MENU: 'menu',
    PRACTICE: 'practice',
    RESULTS: 'results',
    LEARN: 'learn',
} as const);

export type ScreenModeType = typeof ScreenMode[keyof typeof ScreenMode];

// Toast notification types
export const ToastType = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
} as const);

export type ToastTypeType = typeof ToastType[keyof typeof ToastType];

// Difficulty levels
export const Difficulty = Object.freeze({
    BASICO: 'Básico',
    INTERMEDIARIO: 'Intermediário',
    AVANCADO: 'Avançado',
} as const);

export type DifficultyType = typeof Difficulty[keyof typeof Difficulty];

// Confidence levels for metacognition (1-5)
export const ConfidenceLevel = Object.freeze({
    VERY_LOW: 1,
    LOW: 2,
    MEDIUM: 3,
    HIGH: 4,
    VERY_HIGH: 5,
} as const);

export type ConfidenceLevelType = typeof ConfidenceLevel[keyof typeof ConfidenceLevel];

// Quadrant values
export const Quadrant = Object.freeze({
    FIRST: 1,
    SECOND: 2,
    THIRD: 3,
    FOURTH: 4,
    AXIS: 'eixo',
} as const);

export type QuadrantType = typeof Quadrant[keyof typeof Quadrant];

// ============================================================
// STORAGE KEYS - Centralized for all AsyncStorage usage
// ============================================================
export const STORAGE_KEYS = Object.freeze({
    LEARNING_PROGRESS: 'learning_progress',
    EXERCISE_PROGRESS: 'exercise_progress',
    QUADRANT_STATS: 'quadrant_stats',
    QUADRANT_HIGH_SCORE: '@math_app_quadrant_high_score',
    SRS_CARDS: '@math_app_srs_cards',
    METACOGNITION: '@math_app_metacognition',
    USER_THEME: '@math_app_user_theme',
    DATA_VERSION: '@math_app_data_version',  // For migrations
} as const);

export type StorageKeyType = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Current data version (increment when schema changes)
export const DATA_VERSION = 1;

// ============================================================
// TOPIC & CATEGORY IDS
// ============================================================

// Topic IDs - Mat. Elementar
export const TOPIC_IDS = Object.freeze({
    // Mat. Elementar
    MAT_ELEM_R1: 'mat-elem-r1',
    MAT_ELEM_AP1: 'mat-elem-ap1',
    MAT_ELEM_AP2: 'mat-elem-ap2',
    MAT_ELEM_AP3: 'mat-elem-ap3',
    // Cálculo I
    CALC_AP1: 'calc-ap1',
    CALC_AP2: 'calc-ap2',
    CALC_AP4: 'calc-ap4',
    CALC_FINAL: 'calc-final',
} as const);

export type TopicIdType = typeof TOPIC_IDS[keyof typeof TOPIC_IDS];

// Main Categories
export const MAIN_CATEGORIES = Object.freeze({
    MAT_ELEMENTAR: 'mat-elementar',
    CALCULO_I: 'calculo-i',
} as const);

export type MainCategoryType = typeof MAIN_CATEGORIES[keyof typeof MAIN_CATEGORIES];

// Learning Topics
export const LEARNING_TOPICS = Object.freeze({
    LOGARITMOS: 'logaritmos',
    TRIGONOMETRIA: 'trigonometria',
    ELEMENTAR: 'elementar',
    LIMITES: 'limites',
    DERIVADAS: 'derivadas',
} as const);

export type LearningTopicType = typeof LEARNING_TOPICS[keyof typeof LEARNING_TOPICS];

// NOTE: Colors are centralized in src/styles/theme.js
// Import { colors } from '../styles/theme' for color usage

// ============================================================
// DEFAULT STATES
// ============================================================

export interface CompletedLessons {
    [key: string]: number[];  // Stores lesson indices as numbers
}

// Default state for completed lessons (for migration)
export const DEFAULT_COMPLETED_LESSONS: CompletedLessons = Object.freeze({
    [LEARNING_TOPICS.LOGARITMOS]: [],
    [LEARNING_TOPICS.TRIGONOMETRIA]: [],
    [LEARNING_TOPICS.ELEMENTAR]: [],
    [LEARNING_TOPICS.LIMITES]: [],
    [LEARNING_TOPICS.DERIVADAS]: [],
});

export interface CompletedExercises {
    [key: string]: boolean;
}

// Default state for completed exercises
export const DEFAULT_COMPLETED_EXERCISES: CompletedExercises = Object.freeze({});
