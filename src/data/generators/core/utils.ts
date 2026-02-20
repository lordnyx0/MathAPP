/**
 * Shared Utility Functions for Procedural Generators
 * 
 * Common functions used across all generators for random generation,
 * math formatting, and validation.
 */

// ============================================================
// RANDOM UTILITIES
// ============================================================

/**
 * Generate a random integer in range [min, max] inclusive
 */
export const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Pick a random element from an array
 */
export const randomChoice = <T>(arr: readonly T[]): T =>
    arr[randomInt(0, arr.length - 1)];

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffle = <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

/**
 * Generate a unique ID with prefix
 */
let idCounter = 0;
export const generateId = (prefix: string): string =>
    `${prefix}_gen_${++idCounter}_${Date.now()}`;

// ============================================================
// MATH FORMATTING
// ============================================================

/**
 * Map of digits to their superscript equivalents
 */
const SUPERSCRIPTS: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '-': '⁻', '+': '⁺',
};

/**
 * Map of digits to their subscript equivalents
 */
const SUBSCRIPTS: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '-': '₋', '+': '₊',
};

/**
 * Convert a number to superscript string
 * @example toSuperscript(2) → "²"
 * @example toSuperscript(-3) → "⁻³"
 */
export const toSuperscript = (n: number): string =>
    String(n).split('').map(c => SUPERSCRIPTS[c] || c).join('');

/**
 * Convert a number to subscript string
 * @example toSubscript(1) → "₁"
 */
export const toSubscript = (n: number): string =>
    String(n).split('').map(c => SUBSCRIPTS[c] || c).join('');

/**
 * Format a fraction as LaTeX
 * @example formatFraction(3, 4) → "$\\frac{3}{4}$"
 */
export const formatFraction = (num: number, den: number): string => {
    if (den === 1) return `$${num}$`;
    return `$\\frac{${num}}{${den}}$`;
};

/**
 * Format a pi multiple as LaTeX
 * @example formatPiMultiple(3, 4) → "$3\\pi/4$"
 * @example formatPiMultiple(1, 1) → "$\\pi$"
 * @example formatPiMultiple(2, 1) → "$2\\pi$"
 */
export const formatPiMultiple = (num: number, den: number): string => {
    if (num === 0) return '$0$';

    const piPart = num === 1 ? '\\pi' : `${num}\\pi`;

    if (den === 1) return `$${piPart}$`;
    return `$${piPart}/${den}$`;
};

/**
 * Format coefficient for display (omits 1, handles -1)
 * @example formatCoefficient(1) → ""
 * @example formatCoefficient(-1) → "-"
 * @example formatCoefficient(3) → "3"
 */
export const formatCoefficient = (n: number): string => {
    if (n === 1) return '';
    if (n === -1) return '-';
    return String(n);
};

/**
 * Format a polynomial term
 * @example formatTerm(3, 2) → "3x²"
 * @example formatTerm(1, 1) → "x"
 * @example formatTerm(5, 0) → "5"
 */
export const formatTerm = (coeff: number, exp: number): string => {
    if (coeff === 0) return '';
    if (exp === 0) return String(coeff);

    const coeffStr = formatCoefficient(coeff);
    if (exp === 1) return `${coeffStr}x`;
    return `${coeffStr}x${toSuperscript(exp)}`;
};

// ============================================================
// MATH UTILITIES
// ============================================================

/**
 * Greatest common divisor using Euclidean algorithm
 */
export const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
};

/**
 * Simplify a fraction
 * @example simplifyFraction(4, 8) → [1, 2]
 */
export const simplifyFraction = (num: number, den: number): [number, number] => {
    const d = gcd(num, den);
    return [num / d, den / d];
};

/**
 * Check if a number is "nice" for display (small integer or simple fraction)
 */
export const isNiceNumber = (n: number): boolean => {
    if (Number.isInteger(n) && Math.abs(n) <= 10) return true;
    // Check common fractions
    const niceFractions = [0.5, 0.25, 0.75, 0.333, 0.667];
    return niceFractions.some(f => Math.abs(n - f) < 0.01 || Math.abs(n + f) < 0.01);
};

// ============================================================
// DOMAIN/SET UTILITIES
// ============================================================

/**
 * Common domain representations
 */
export const DOMAIN_FORMATS = {
    ALL_REALS: 'ℝ',
    POSITIVE_REALS: '(0, +∞)',
    NON_NEGATIVE: '[0, +∞)',
    NEGATIVE_REALS: '(-∞, 0)',
    NON_POSITIVE: '(-∞, 0]',
    EXCEPT_ZERO: 'ℝ - {0}',
} as const;

/**
 * Format an interval
 * @example formatInterval(-1, 1, true, true) → "[-1, 1]"
 * @example formatInterval(0, Infinity, false, false) → "(0, +∞)"
 */
export const formatInterval = (
    start: number,
    end: number,
    closedStart: boolean,
    closedEnd: boolean
): string => {
    const startStr = start === -Infinity ? '-∞' : String(start);
    const endStr = end === Infinity ? '+∞' : String(end);
    const leftBracket = closedStart && start !== -Infinity ? '[' : '(';
    const rightBracket = closedEnd && end !== Infinity ? ']' : ')';
    return `${leftBracket}${startStr}, ${endStr}${rightBracket}`;
};
