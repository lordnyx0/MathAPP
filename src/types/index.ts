// Type definitions for Math App
// Central type definitions for all data structures

// =============================================================================
// EXERCISE TYPES
// =============================================================================

export interface ExerciseStep {
    title: string;
    explanation: string;
    content: string;
}

export interface Exercise {
    id: string;
    topicId: string;
    category: string;
    title: string;
    difficulty: string; // 'Básico', 'Intermediário', 'Avançado', etc.
    problem: string;
    finalAnswer: string;
    steps: ExerciseStep[];
    tips: string[];
}

export interface ExerciseFile {
    topicId?: string;
    title: string;
    description?: string;
    exercises: Exercise[];
}

// =============================================================================
// LESSON TYPES
// =============================================================================

export interface LessonQuestion {
    q: string;
    a: string;
    hint: string;
}

export interface Lesson {
    id: string;
    title: string;
    level: 'Básico' | 'Intermediário' | 'Avançado';
    content: string;
    questions: LessonQuestion[];
}

export interface LessonFile {
    topic: string;
    title: string;
    lessons: Lesson[];
}

// =============================================================================
// MCQ TYPES
// =============================================================================

export interface MCQOption {
    id: string;
    text: string;
    explanation: string;
}

export interface MCQ {
    id: string;
    question: string;
    topic: string;
    difficulty: string; // 'basico', 'intermediario', 'avancado'
    options: MCQOption[];
    correctAnswer: string;
    concept: string;
}

export interface MCQFile {
    topic: string;
    title: string;
    questions: MCQ[];
}

// =============================================================================
// SRS TYPES
// =============================================================================

export interface SRSCard {
    id: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
    lastReviewDate: string;
}

export interface SRSResponse {
    card: SRSCard;
    wasCorrect: boolean;
    responseTime?: number;
}

// =============================================================================
// METACOGNITION TYPES
// =============================================================================

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface MetacognitionEntry {
    questionId: string;
    confidence: ConfidenceLevel;
    wasCorrect: boolean;
    timestamp: string;
}

export interface CalibrationResult {
    isOverconfident: boolean;
    isUnderconfident: boolean;
    calibrationScore: number;
    feedback: string;
}

// =============================================================================
// THEME TYPES
// =============================================================================

export interface ThemeColors {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    border: string;
    cardBackground: string;
    // Topic colors
    logaritmos: string;
    trigonometria: string;
    elementar: string;
    limites: string;
    derivadas: string;
    [key: string]: string;
}

export interface Theme {
    colors: ThemeColors;
    isDark: boolean;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export type RootStackParamList = {
    Home: undefined;
    Exercises: { topicId?: string };
    Learning: { topicId?: string };
    MCQPractice: { topicId?: string };
    QuadrantTraining: undefined;
    Settings: undefined;
};

// =============================================================================
// STORAGE TYPES
// =============================================================================

export interface LearningProgress {
    [lessonId: string]: boolean;
}

export interface ExerciseProgress {
    [exerciseId: string]: {
        completed: boolean;
        lastAttempt: string;
        attempts: number;
    };
}

export interface AppSettings {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    darkMode: boolean;
}
