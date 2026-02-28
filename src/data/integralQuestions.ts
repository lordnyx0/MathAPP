/**
 * Integral Questions - Data for the Integrals Trainer minigame
 * Covers: Power rule, Constants, Inverse, Exp, Sin, Cos
 */

export type IntegralRuleType =
    | 'power'      // ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C
    | 'constant'   // ∫ c dx = cx + C
    | 'inverse'    // ∫ 1/x dx = ln|x| + C
    | 'exp'        // ∫ eˣ dx = eˣ + C
    | 'sin'        // ∫ sin(x) dx = -cos(x) + C
    | 'cos';       // ∫ cos(x) dx = sin(x) + C

export type DifficultyLevel = 'basico' | 'intermediario' | 'avancado';

export interface IntegralRule {
    id: IntegralRuleType;
    name: string;
    formula: string;
    description: string;
    examples: string[];
    difficulty: DifficultyLevel;
}

export interface IntegralQuestion {
    id: string;
    function: string;
    integral: string;
    rule: IntegralRuleType;
    difficulty: DifficultyLevel;
    explanation: string;
}

// ============================================================
// RULES DATA
// ============================================================

export const integralRules: IntegralRule[] = [
    // BÁSICO
    {
        id: 'constant',
        name: 'Constante',
        formula: '∫ c dx = cx + C',
        description: 'A integral de uma constante é a constante multiplicada por x.',
        examples: ['∫ 5 dx = 5x + C', '∫ π dx = πx + C'],
        difficulty: 'basico',
    },
    {
        id: 'power',
        name: 'Potência',
        formula: '∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C, n ≠ -1',
        description: 'Aumenta o expoente em 1 e divide pelo novo expoente.',
        examples: ['∫ x² dx = x³/3 + C', '∫ x⁵ dx = x⁶/6 + C'],
        difficulty: 'basico',
    },
    {
        id: 'inverse',
        name: 'Inversa (1/x)',
        formula: '∫ 1/x dx = ln|x| + C',
        description: 'A integral de 1/x (que é x⁻¹) resulta no logaritmo natural do módulo de x.',
        examples: ['∫ 1/x dx = ln|x| + C', '∫ 3/x dx = 3ln|x| + C'],
        difficulty: 'basico',
    },

    // INTERMEDIÁRIO
    {
        id: 'exp',
        name: 'Exponencial',
        formula: '∫ eˣ dx = eˣ + C',
        description: 'A integral da função exponencial de base e é ela mesma.',
        examples: ['∫ eˣ dx = eˣ + C', '∫ 2eˣ dx = 2eˣ + C'],
        difficulty: 'intermediario',
    },
    {
        id: 'sin',
        name: 'Seno',
        formula: '∫ sin(x) dx = -cos(x) + C',
        description: 'A primitiva do seno é o cosseno negativo.',
        examples: ['∫ sin(x) dx = -cos(x) + C'],
        difficulty: 'intermediario',
    },
    {
        id: 'cos',
        name: 'Cosseno',
        formula: '∫ cos(x) dx = sin(x) + C',
        description: 'A primitiva do cosseno é o seno positivo.',
        examples: ['∫ cos(x) dx = sin(x) + C'],
        difficulty: 'intermediario',
    },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

import {
    generateRandomQuestion,
    generateWrongAnswers,
} from './integralGenerator';

export const getRules = (difficulty?: DifficultyLevel): IntegralRule[] => {
    if (!difficulty) return integralRules;
    return integralRules.filter(r => r.difficulty === difficulty);
};

export const getRandomQuestion = (
    difficulty?: DifficultyLevel,
    rule?: IntegralRuleType
): IntegralQuestion => {
    return generateRandomQuestion(difficulty, rule);
};

export const getWrongIntegrals = (
    correct: IntegralQuestion,
    count: number = 3
): string[] => {
    return generateWrongAnswers(correct, count);
};

export const getRuleById = (id: IntegralRuleType): IntegralRule | undefined => {
    return integralRules.find(r => r.id === id);
};

// ============================================================
// STORAGE KEY
// ============================================================

export const INTEGRAL_TRAINER_STATS_KEY = '@math_app_integral_trainer_stats';
