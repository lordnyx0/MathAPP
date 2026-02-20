/**
 * Procedural Quadrant Question Generator
 * 
 * Generates questions about which quadrant an angle falls into,
 * using randomized numerators and denominators for infinite variety.
 */

import {
    randomInt,
    randomChoice,
    generateId,
    formatPiMultiple,
    gcd,
} from '../core/utils';
import {
    DifficultyLevel,
    QuadrantGeneratorOptions,
} from '../core/types';

// ============================================================
// TYPES
// ============================================================

export interface GeneratedQuadrantQuestion {
    id: string;
    /** Angle in LaTeX format, e.g. "$5\\pi/6$" */
    angle: string;
    /** Fraction of 2π (0 to 2), e.g. 0.833 for 5π/6 */
    fraction: number;
    /** Quadrant number (1-4) or 'eixo' for axis */
    quadrant: number | 'eixo';
    /** Display string (same as angle for base questions) */
    display: string;
    /** Axis name if on axis */
    axis?: 'x+' | 'x-' | 'y+' | 'y-';
    /** Difficulty level */
    difficulty: DifficultyLevel;
    /** Original numerator */
    numerator: number;
    /** Original denominator */
    denominator: number;
}

export interface GeneratedIntervalQuestion {
    id: string;
    type: 'interval';
    /** Start angle in LaTeX */
    start: string;
    /** End angle in LaTeX */
    end: string;
    /** Start fraction of 2π */
    startFraction: number;
    /** End fraction of 2π */
    endFraction: number;
    /** Quadrant the interval is in */
    quadrant: number;
    /** Display string */
    display: string;
    difficulty: DifficultyLevel;
}

export type GeneratedQuestion = GeneratedQuadrantQuestion | GeneratedIntervalQuestion;

// ============================================================
// CONSTANTS
// ============================================================

/** Common denominators in trigonometry sorted by difficulty */
const DENOMINATORS_BY_DIFFICULTY: Record<DifficultyLevel, number[]> = {
    basico: [2, 4],              // π/2, π/4, 3π/4, etc.
    intermediario: [3, 6],       // π/3, π/6, 2π/3, etc.
    avancado: [5, 8, 12],        // π/5, π/8, π/12, etc.
};

// Note: Axis angle detection is handled dynamically in fractionToQuadrant
// using the "halves trick" (0.5, 1, 1.5, 2 are axes)

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Convert fraction of π to quadrant
 * @param fraction - The angle as a multiple of π (e.g., 0.5 for π/2)
 */
const fractionToQuadrant = (fraction: number): number | 'eixo' => {
    // Normalize to [0, 2)
    const normalized = ((fraction % 2) + 2) % 2;

    // Check for axis (with small epsilon for floating point)
    const eps = 0.001;
    if (Math.abs(normalized - 0) < eps || Math.abs(normalized - 2) < eps) return 'eixo';
    if (Math.abs(normalized - 0.5) < eps) return 'eixo';
    if (Math.abs(normalized - 1) < eps) return 'eixo';
    if (Math.abs(normalized - 1.5) < eps) return 'eixo';

    // Determine quadrant
    if (normalized < 0.5) return 1;
    if (normalized < 1) return 2;
    if (normalized < 1.5) return 3;
    return 4;
};

/**
 * Get axis name for axis angles
 */
const getAxisName = (fraction: number): 'x+' | 'x-' | 'y+' | 'y-' | undefined => {
    const normalized = ((fraction % 2) + 2) % 2;
    const eps = 0.001;

    if (Math.abs(normalized - 0) < eps || Math.abs(normalized - 2) < eps) return 'x+';
    if (Math.abs(normalized - 0.5) < eps) return 'y+';
    if (Math.abs(normalized - 1) < eps) return 'x-';
    if (Math.abs(normalized - 1.5) < eps) return 'y-';
    return undefined;
};

// ============================================================
// GENERATOR
// ============================================================

/**
 * Generate a single angle question with random parameters
 */
export const generateAngleQuestion = (
    options: QuadrantGeneratorOptions = {}
): GeneratedQuadrantQuestion => {
    const {
        difficulty = randomChoice(['basico', 'intermediario', 'avancado'] as DifficultyLevel[]),
        includeAxes = false,
    } = options;

    // Get appropriate denominators for difficulty
    const allDenominators = [
        ...DENOMINATORS_BY_DIFFICULTY.basico,
        ...(difficulty !== 'basico' ? DENOMINATORS_BY_DIFFICULTY.intermediario : []),
        ...(difficulty === 'avancado' ? DENOMINATORS_BY_DIFFICULTY.avancado : []),
    ];

    const denominator = randomChoice(allDenominators);

    // Generate numerator that gives a valid angle in [0, 2π)
    // Numerator range: 1 to 2*denominator - 1
    let numerator: number;
    let fraction: number;
    let attempts = 0;

    do {
        numerator = randomInt(1, 2 * denominator - 1);
        fraction = numerator / denominator;
        attempts++;

        // Skip axis angles if not wanted
        const isAxis = fractionToQuadrant(fraction) === 'eixo';
        if (isAxis && !includeAxes && attempts < 20) continue;

        break;
    } while (attempts < 20);

    // Simplify the fraction for display
    const g = gcd(numerator, denominator);
    const displayNum = numerator / g;
    const displayDen = denominator / g;

    const quadrant = fractionToQuadrant(fraction);
    const axis = getAxisName(fraction);

    return {
        id: generateId('quad'),
        angle: formatPiMultiple(displayNum, displayDen),
        fraction,
        quadrant,
        display: formatPiMultiple(displayNum, displayDen),
        axis,
        difficulty,
        numerator: displayNum,
        denominator: displayDen,
    };
};

/**
 * Generate an interval question
 */
export const generateIntervalQuestion = (
    options: QuadrantGeneratorOptions = {}
): GeneratedIntervalQuestion => {
    const difficulty = options.difficulty || 'intermediario';

    // Pick a random quadrant (1-4)
    const quadrant = randomInt(1, 4);

    // Calculate the bounds for this quadrant
    const startFraction = (quadrant - 1) * 0.5;
    const endFraction = quadrant * 0.5;

    // Convert to pi multiples
    const startNum = quadrant - 1;
    const endNum = quadrant;

    const start = startNum === 0 ? '$0$' : formatPiMultiple(startNum, 2);
    const end = formatPiMultiple(endNum, 2);

    return {
        id: generateId('interval'),
        type: 'interval',
        start,
        end,
        startFraction,
        endFraction,
        quadrant,
        display: `${start.replace('$', '')} \\leq \\theta \\leq ${end.replace(/\$/g, '')}`,
        difficulty,
    };
};

/**
 * Generate a random quadrant question (angle or interval)
 */
export const generateRandomQuestion = (
    options: QuadrantGeneratorOptions = {}
): GeneratedQuestion => {
    const { includeIntervals = true } = options;

    // 70% angle questions, 30% interval questions
    if (includeIntervals && Math.random() < 0.3) {
        return generateIntervalQuestion(options);
    }

    return generateAngleQuestion(options);
};

/**
 * Generate wrong answer choices for a quadrant question
 */
export const generateDistractors = (
    correct: GeneratedQuestion,
    count: number = 3
): string[] => {
    const correctQuadrant = 'type' in correct && correct.type === 'interval'
        ? correct.quadrant
        : (correct as GeneratedQuadrantQuestion).quadrant;

    const allOptions = [1, 2, 3, 4];

    // For axis questions, add 'eixo' as an option
    if (correctQuadrant === 'eixo') {
        return allOptions.slice(0, count).map(String);
    }

    // Filter out correct answer and shuffle
    const wrong = allOptions
        .filter(q => q !== correctQuadrant)
        .slice(0, count);

    return wrong.map(String);
};

/**
 * Check if a question is an interval type
 */
export const isIntervalQuestion = (q: GeneratedQuestion): q is GeneratedIntervalQuestion => {
    return 'type' in q && q.type === 'interval';
};
