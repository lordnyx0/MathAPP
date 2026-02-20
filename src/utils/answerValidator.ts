// Answer Validator - Normalize and compare user answers
// Handles fractions, decimals, math symbols, and tolerance

export interface CheckAnswerResult {
    correct: boolean;
    feedback?: string;
}

/**
 * Normalize a math answer string for comparison
 */
export const normalizeAnswer = (answer: string | null | undefined): string => {
    if (!answer || typeof answer !== 'string') return '';

    let normalized = answer
        .toLowerCase()
        .trim()
        // Remove ALL spaces (fixes "1 / 2" vs "1/2")
        .replace(/\s+/g, '')
        // Normalize math symbols
        .replace(/√/g, 'sqrt')
        .replace(/π/g, 'pi')
        .replace(/∞/g, 'inf')
        .replace(/≤/g, '<=')
        .replace(/≥/g, '>=')
        .replace(/≠/g, '!=')
        // Normalize minus signs (different unicode chars)
        .replace(/[−–—]/g, '-')
        // Remove parentheses around simple expressions
        .replace(/^\((.+)\)$/, '$1')
        // Normalize "sim" variations
        .replace(/^(sim|yes|s|y|verdadeiro|true)$/i, 'sim')
        // Normalize "não" variations  
        .replace(/^(nao|não|no|n|falso|false)$/i, 'nao');

    return normalized;
};

/**
 * Try to convert a fraction string to decimal
 * Handles: "1/2", "-3/4", "1/-2", "5/10", mixed numbers "1 1/2"
 */
const fractionToDecimal = (str: string): number | null => {
    // Match patterns: "1/2", "-3/4", "1/-2", "-1/-2"
    const fractionMatch = str.match(/^(-?\d+)\/(-?\d+)$/);
    if (fractionMatch) {
        const numerator = Number(fractionMatch[1]);
        const denominator = Number(fractionMatch[2]);
        if (denominator !== 0) {
            return numerator / denominator;
        }
    }
    return null;
};

/**
 * Try to parse mixed number like "1 1/2" = 1.5
 */
const parseMixedNumber = (str: string): number | null => {
    // Match "1 1/2", "-2 3/4", etc
    const mixedMatch = str.trim().match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
        const whole = Number(mixedMatch[1]);
        const numerator = Number(mixedMatch[2]);
        const denominator = Number(mixedMatch[3]);
        if (denominator !== 0) {
            const sign = whole < 0 ? -1 : 1;
            return whole + sign * (numerator / denominator);
        }
    }
    return null;
};

/**
 * Try to parse as number (handles decimals, fractions, mixed numbers)
 */
const parseNumeric = (str: string, originalStr: string = str): number | null => {
    // Try mixed number first (needs original string with spaces)
    const mixedValue = parseMixedNumber(originalStr);
    if (mixedValue !== null) return mixedValue;

    // Try as fraction
    const fractionValue = fractionToDecimal(str);
    if (fractionValue !== null) return fractionValue;

    // Try as regular number
    const num = parseFloat(str);
    if (!isNaN(num)) return num;

    return null;
};

/**
 * Compare two answers with smart matching
 */
export const compareAnswers = (
    userAnswer: string | null | undefined,
    correctAnswer: string | null | undefined,
    tolerance: number = 0.01
): boolean => {
    // Keep original for mixed number parsing
    const originalUser = userAnswer || '';
    const originalCorrect = correctAnswer || '';

    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);

    // Direct string match
    if (normalizedUser === normalizedCorrect) {
        return true;
    }

    // Try numeric comparison (pass both normalized and original)
    const userNum = parseNumeric(normalizedUser, originalUser);
    const correctNum = parseNumeric(normalizedCorrect, originalCorrect);

    if (userNum !== null && correctNum !== null) {
        // Use relative tolerance for larger numbers
        const relTolerance = Math.max(tolerance, Math.abs(correctNum) * 0.01);
        return Math.abs(userNum - correctNum) < relTolerance;
    }

    // Check if user answer is contained in correct (for partial matches)
    // e.g., correct = "{3, 2187}" and user types "3, 2187"
    const cleanUser = normalizedUser.replace(/[{}\[\]()]/g, '');
    const cleanCorrect = normalizedCorrect.replace(/[{}\[\]()]/g, '');

    if (cleanUser === cleanCorrect) {
        return true;
    }

    return false;
};

/**
 * Check answer with detailed feedback
 */
export const checkAnswer = (
    userAnswer: string | null | undefined,
    correctAnswer: string | null | undefined
): CheckAnswerResult => {
    const isCorrect = compareAnswers(userAnswer, correctAnswer);

    if (isCorrect) {
        return { correct: true };
    }

    // Keep original for mixed number parsing
    const originalUser = userAnswer || '';
    const originalCorrect = correctAnswer || '';

    // Provide helpful feedback
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);

    // Check if it's a numeric near-miss
    const userNum = parseNumeric(normalizedUser, originalUser);
    const correctNum = parseNumeric(normalizedCorrect, originalCorrect);

    if (userNum !== null && correctNum !== null) {
        const diff = Math.abs(userNum - correctNum);
        if (diff < 0.1) {
            return {
                correct: false,
                feedback: `Quase! Sua resposta está próxima. Verifique os cálculos.`
            };
        }
    }

    return { correct: false };
};
