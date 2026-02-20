// Questions for the Quadrant Training module
// Based on the "Halves Trick" (0.5 - 1 - 1.5 - 2)
// Using LaTeX notation for math expressions

// ============================================================
// TYPES
// ============================================================

export interface BaseQuadrantQuestion {
    angle?: string;
    fraction: number;  // Required - all base questions have a fraction
    quadrant: number | 'eixo';
    display: string;
    axis?: string;  // Only present when quadrant === 'eixo'
}

export interface IntervalQuadrantQuestion {
    type: 'interval';
    start: string;
    end: string;
    startFraction: number;
    endFraction: number;
    quadrant: number;
    display: string;
}

export type QuadrantQuestion = BaseQuadrantQuestion | IntervalQuadrantQuestion;

export interface QuadrantSigns {
    sin: string;
    cos: string;
    tan: string;
}

export interface QuadrantInfoItem {
    name: string;
    range: string;
    decimal: string;
    degrees: string;
    signs: QuadrantSigns;
    color: string;
    mnemonic: string;
}

export interface HalvesReferenceItem {
    position: string;
    fraction: string;
    decimal: number;
}

// ============================================================
// DATA
// ============================================================

export const quadrantQuestions: QuadrantQuestion[] = [
    // Basic questions - single fractions
    { angle: '$\\pi/4$', fraction: 0.25, quadrant: 1, display: '$\\pi/4$' },
    { angle: '$\\pi/3$', fraction: 0.333, quadrant: 1, display: '$\\pi/3$' },
    { angle: '$\\pi/6$', fraction: 0.167, quadrant: 1, display: '$\\pi/6$' },

    { angle: '$2\\pi/3$', fraction: 0.667, quadrant: 2, display: '$2\\pi/3$' },
    { angle: '$3\\pi/4$', fraction: 0.75, quadrant: 2, display: '$3\\pi/4$' },
    { angle: '$5\\pi/6$', fraction: 0.833, quadrant: 2, display: '$5\\pi/6$' },

    { angle: '$7\\pi/6$', fraction: 1.167, quadrant: 3, display: '$7\\pi/6$' },
    { angle: '$5\\pi/4$', fraction: 1.25, quadrant: 3, display: '$5\\pi/4$' },
    { angle: '$4\\pi/3$', fraction: 1.333, quadrant: 3, display: '$4\\pi/3$' },

    { angle: '$5\\pi/3$', fraction: 1.667, quadrant: 4, display: '$5\\pi/3$' },
    { angle: '$7\\pi/4$', fraction: 1.75, quadrant: 4, display: '$7\\pi/4$' },
    { angle: '$11\\pi/6$', fraction: 1.833, quadrant: 4, display: '$11\\pi/6$' },

    // Special angles on axes (boundary cases)
    { angle: '$\\pi/2$', fraction: 0.5, quadrant: 'eixo', display: '$\\pi/2$', axis: 'y+' },
    { angle: '$\\pi$', fraction: 1, quadrant: 'eixo', display: '$\\pi$', axis: 'x-' },
    { angle: '$3\\pi/2$', fraction: 1.5, quadrant: 'eixo', display: '$3\\pi/2$', axis: 'y-' },
    { angle: '$2\\pi$', fraction: 2, quadrant: 'eixo', display: '$2\\pi$', axis: 'x+' },

    // Interval questions
    {
        type: 'interval',
        start: '$3\\pi/2$',
        end: '$2\\pi$',
        startFraction: 1.5,
        endFraction: 2,
        quadrant: 4,
        display: '$3\\pi/2 \\leq \\theta \\leq 2\\pi$'
    },
    {
        type: 'interval',
        start: '$\\pi/2$',
        end: '$\\pi$',
        startFraction: 0.5,
        endFraction: 1,
        quadrant: 2,
        display: '$\\pi/2 \\leq \\theta \\leq \\pi$'
    },
    {
        type: 'interval',
        start: '$\\pi$',
        end: '$3\\pi/2$',
        startFraction: 1,
        endFraction: 1.5,
        quadrant: 3,
        display: '$\\pi \\leq \\theta \\leq 3\\pi/2$'
    },
    {
        type: 'interval',
        start: '0',
        end: '$\\pi/2$',
        startFraction: 0,
        endFraction: 0.5,
        quadrant: 1,
        display: '$0 \\leq \\theta \\leq \\pi/2$'
    },
];

export const quadrantInfo: Record<number, QuadrantInfoItem> = {
    1: {
        name: '1º Quadrante',
        range: '$0 < \\theta < \\pi/2$',
        decimal: '< 0.5',
        degrees: '0° a 90°',
        signs: { sin: '+', cos: '+', tan: '+' },
        color: '#10B981', // green
        mnemonic: 'Todos positivos'
    },
    2: {
        name: '2º Quadrante',
        range: '$\\pi/2 < \\theta < \\pi$',
        decimal: '0.5 a 1.0',
        degrees: '90° a 180°',
        signs: { sin: '+', cos: '-', tan: '-' },
        color: '#3B82F6', // blue
        mnemonic: 'Seno positivo'
    },
    3: {
        name: '3º Quadrante',
        range: '$\\pi < \\theta < 3\\pi/2$',
        decimal: '1.0 a 1.5',
        degrees: '180° a 270°',
        signs: { sin: '-', cos: '-', tan: '+' },
        color: '#F59E0B', // orange
        mnemonic: 'Tangente positiva'
    },
    4: {
        name: '4º Quadrante',
        range: '$3\\pi/2 < \\theta < 2\\pi$',
        decimal: '1.5 a 2.0',
        degrees: '270° a 360°',
        signs: { sin: '-', cos: '+', tan: '-' },
        color: '#EF4444', // red
        mnemonic: 'Cosseno positivo'
    }
};

export const halvesReference: HalvesReferenceItem[] = [
    { position: 'Topo (90°)', fraction: '$\\pi/2$', decimal: 0.5 },
    { position: 'Esquerda (180°)', fraction: '$\\pi$', decimal: 1.0 },
    { position: 'Baixo (270°)', fraction: '$3\\pi/2$', decimal: 1.5 },
    { position: 'Direita (360°)', fraction: '$2\\pi$', decimal: 2.0 },
];

// ============================================================
// FUNCTIONS
// ============================================================

import {
    generateAngleQuestion,
    generateIntervalQuestion,
    generateRandomQuestion as generateProceduralQuestion,
    generateDistractors,
    GeneratedQuadrantQuestion,
    GeneratedIntervalQuestion,
    GeneratedQuestion,
} from './generators/quadrant/quadrantGenerator';

/**
 * Type guard to check if question is an interval type
 */
export const isIntervalQuestion = (q: QuadrantQuestion | GeneratedQuestion): q is IntervalQuadrantQuestion | GeneratedIntervalQuestion => {
    return 'type' in q && q.type === 'interval';
};

/**
 * Type guard to check if question is a base question (not interval)
 */
export const isBaseQuestion = (q: QuadrantQuestion): q is BaseQuadrantQuestion => {
    return !('type' in q);
};

/**
 * Get a random question - NOW USES PROCEDURAL GENERATION
 * Each call generates a unique question with randomized angle parameters
 */
export const getRandomQuestion = (): QuadrantQuestion | GeneratedQuestion => {
    return generateProceduralQuestion({ includeIntervals: false });
};

/**
 * Get a random question avoiding repeat - NOW USES PROCEDURAL GENERATION
 * Since questions are procedurally generated, repeats are extremely unlikely
 */
export const getRandomQuestionNoRepeat = (): QuadrantQuestion | GeneratedQuestion => {
    return generateProceduralQuestion({ includeIntervals: true });
};

/**
 * Get wrong answer choices for a question
 */
export const getWrongAnswers = (correct: GeneratedQuestion, count: number = 3): string[] => {
    return generateDistractors(correct, count);
};

export const getQuestionsByDifficulty = (difficulty: string): QuadrantQuestion[] => {
    switch (difficulty) {
        case 'easy':
            return quadrantQuestions.filter(q => !('type' in q) && q.quadrant !== 'eixo');
        case 'medium':
            return quadrantQuestions.filter(q => 'type' in q && q.type === 'interval');
        case 'hard':
            return quadrantQuestions;
        default:
            return quadrantQuestions;
    }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export interface QuadrantQuestionsAPI {
    quadrantQuestions: QuadrantQuestion[];
    quadrantInfo: Record<number, QuadrantInfoItem>;
    halvesReference: HalvesReferenceItem[];
    getRandomQuestion: typeof getRandomQuestion;
    getRandomQuestionNoRepeat: typeof getRandomQuestionNoRepeat;
    getQuestionsByDifficulty: typeof getQuestionsByDifficulty;
}

const quadrantQuestionsAPI: QuadrantQuestionsAPI = {
    quadrantQuestions,
    quadrantInfo,
    halvesReference,
    getRandomQuestion,
    getRandomQuestionNoRepeat,
    getQuestionsByDifficulty,
};

export default quadrantQuestionsAPI;
