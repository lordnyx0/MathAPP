/**
 * Derivative Questions - Data for the Derivadas Trainer minigame
 * Covers: Power rule, Chain rule, Product rule, Quotient rule, Trig, Exp, Ln
 */

// ============================================================
// TYPES
// ============================================================

export type DerivativeRuleType =
    | 'power'      // d/dx[xⁿ] = n·xⁿ⁻¹
    | 'constant'   // d/dx[c] = 0
    | 'sum'        // d/dx[f+g] = f'+g'
    | 'product'    // d/dx[f·g] = f'g + fg'
    | 'quotient'   // d/dx[f/g] = (f'g - fg')/g²
    | 'chain'      // d/dx[f(g)] = f'(g)·g'
    | 'exp'        // d/dx[eˣ] = eˣ
    | 'ln'         // d/dx[ln(x)] = 1/x
    | 'sin'        // d/dx[sin(x)] = cos(x)
    | 'cos'        // d/dx[cos(x)] = -sin(x)
    | 'tan';       // d/dx[tan(x)] = sec²(x)

export type DifficultyLevel = 'basico' | 'intermediario' | 'avancado';

export interface DerivativeRule {
    id: DerivativeRuleType;
    name: string;
    formula: string;           // e.g., "d/dx[xⁿ] = n·xⁿ⁻¹"
    description: string;
    examples: string[];
    difficulty: DifficultyLevel;
}

export interface DerivativeQuestion {
    id: string;
    function: string;          // e.g., "x³"
    derivative: string;        // e.g., "3x²"
    rule: DerivativeRuleType;
    difficulty: DifficultyLevel;
    explanation: string;
}

// ============================================================
// RULES DATA
// ============================================================

export const derivativeRules: DerivativeRule[] = [
    // BÁSICO
    {
        id: 'constant',
        name: 'Constante',
        formula: 'd/dx[c] = 0',
        description: 'A derivada de uma constante é sempre zero.',
        examples: ['d/dx[5] = 0', 'd/dx[π] = 0'],
        difficulty: 'basico',
    },
    {
        id: 'power',
        name: 'Potência',
        formula: 'd/dx[xⁿ] = n·xⁿ⁻¹',
        description: 'Multiplica pelo expoente e reduz o expoente em 1.',
        examples: ['d/dx[x³] = 3x²', 'd/dx[x⁵] = 5x⁴'],
        difficulty: 'basico',
    },
    {
        id: 'sum',
        name: 'Soma',
        formula: "d/dx[f+g] = f'+g'",
        description: 'A derivada da soma é a soma das derivadas.',
        examples: ["d/dx[x²+x] = 2x+1"],
        difficulty: 'basico',
    },

    // INTERMEDIÁRIO
    {
        id: 'product',
        name: 'Produto',
        formula: "d/dx[f·g] = f'g + fg'",
        description: 'Derivada do primeiro vezes o segundo, mais o primeiro vezes derivada do segundo.',
        examples: ["d/dx[x·sin(x)] = sin(x) + x·cos(x)"],
        difficulty: 'intermediario',
    },
    {
        id: 'quotient',
        name: 'Quociente',
        formula: "d/dx[f/g] = (f'g - fg')/g²",
        description: 'Derivada do numerador vezes denominador, menos numerador vezes derivada do denominador, tudo sobre denominador ao quadrado.',
        examples: ["d/dx[x/sin(x)] = (sin(x) - x·cos(x))/sin²(x)"],
        difficulty: 'intermediario',
    },
    {
        id: 'exp',
        name: 'Exponencial',
        formula: 'd/dx[eˣ] = eˣ',
        description: 'A exponencial é sua própria derivada!',
        examples: ['d/dx[e²ˣ] = 2e²ˣ (regra da cadeia)'],
        difficulty: 'intermediario',
    },
    {
        id: 'ln',
        name: 'Logaritmo Natural',
        formula: 'd/dx[ln(x)] = 1/x',
        description: 'A derivada do logaritmo natural é 1 sobre x.',
        examples: ['d/dx[ln(2x)] = 1/x (regra da cadeia)'],
        difficulty: 'intermediario',
    },

    // AVANÇADO
    {
        id: 'chain',
        name: 'Regra da Cadeia',
        formula: "d/dx[f(g(x))] = f'(g(x))·g'(x)",
        description: 'Deriva a função externa avaliada na interna, vezes a derivada da interna.',
        examples: ["d/dx[sin(x²)] = cos(x²)·2x"],
        difficulty: 'avancado',
    },
    {
        id: 'sin',
        name: 'Seno',
        formula: 'd/dx[sin(x)] = cos(x)',
        description: 'A derivada do seno é o cosseno.',
        examples: ['d/dx[sin(2x)] = 2cos(2x)'],
        difficulty: 'intermediario',
    },
    {
        id: 'cos',
        name: 'Cosseno',
        formula: 'd/dx[cos(x)] = -sin(x)',
        description: 'A derivada do cosseno é menos seno.',
        examples: ['d/dx[cos(3x)] = -3sin(3x)'],
        difficulty: 'intermediario',
    },
    {
        id: 'tan',
        name: 'Tangente',
        formula: 'd/dx[tan(x)] = sec²(x)',
        description: 'A derivada da tangente é secante ao quadrado.',
        examples: ['d/dx[tan(x)] = sec²(x) = 1/cos²(x)'],
        difficulty: 'avancado',
    },
];

// ============================================================
// QUESTIONS DATA
// ============================================================

export const derivativeQuestions: DerivativeQuestion[] = [
    // BÁSICO - Constantes
    {
        id: 'const1',
        function: '7',
        derivative: '0',
        rule: 'constant',
        difficulty: 'basico',
        explanation: 'A derivada de qualquer constante é 0.',
    },
    {
        id: 'const2',
        function: 'π',
        derivative: '0',
        rule: 'constant',
        difficulty: 'basico',
        explanation: 'π é uma constante, então sua derivada é 0.',
    },

    // BÁSICO - Potência
    {
        id: 'pow1',
        function: 'x',
        derivative: '1',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[x¹] = 1·x⁰ = 1',
    },
    {
        id: 'pow2',
        function: 'x²',
        derivative: '2x',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[x²] = 2·x¹ = 2x',
    },
    {
        id: 'pow3',
        function: 'x³',
        derivative: '3x²',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[x³] = 3·x² = 3x²',
    },
    {
        id: 'pow4',
        function: 'x⁴',
        derivative: '4x³',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[x⁴] = 4·x³ = 4x³',
    },
    {
        id: 'pow5',
        function: 'x⁵',
        derivative: '5x⁴',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[x⁵] = 5·x⁴ = 5x⁴',
    },
    {
        id: 'pow6',
        function: '3x²',
        derivative: '6x',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[3x²] = 3·2x = 6x',
    },
    {
        id: 'pow7',
        function: '5x³',
        derivative: '15x²',
        rule: 'power',
        difficulty: 'basico',
        explanation: 'd/dx[5x³] = 5·3x² = 15x²',
    },

    // BÁSICO - Soma
    {
        id: 'sum1',
        function: 'x² + x',
        derivative: '2x + 1',
        rule: 'sum',
        difficulty: 'basico',
        explanation: 'd/dx[x²] + d/dx[x] = 2x + 1',
    },
    {
        id: 'sum2',
        function: 'x³ + 2x',
        derivative: '3x² + 2',
        rule: 'sum',
        difficulty: 'basico',
        explanation: 'd/dx[x³] + d/dx[2x] = 3x² + 2',
    },
    {
        id: 'sum3',
        function: 'x⁴ - x²',
        derivative: '4x³ - 2x',
        rule: 'sum',
        difficulty: 'basico',
        explanation: 'd/dx[x⁴] - d/dx[x²] = 4x³ - 2x',
    },

    // INTERMEDIÁRIO - Exponencial
    {
        id: 'exp1',
        function: 'eˣ',
        derivative: 'eˣ',
        rule: 'exp',
        difficulty: 'intermediario',
        explanation: 'A exponencial é sua própria derivada!',
    },
    {
        id: 'exp2',
        function: '3eˣ',
        derivative: '3eˣ',
        rule: 'exp',
        difficulty: 'intermediario',
        explanation: 'd/dx[3eˣ] = 3·eˣ = 3eˣ',
    },

    // INTERMEDIÁRIO - Logaritmo
    {
        id: 'ln1',
        function: 'ln(x)',
        derivative: '1/x',
        rule: 'ln',
        difficulty: 'intermediario',
        explanation: 'd/dx[ln(x)] = 1/x',
    },
    {
        id: 'ln2',
        function: '2ln(x)',
        derivative: '2/x',
        rule: 'ln',
        difficulty: 'intermediario',
        explanation: 'd/dx[2ln(x)] = 2·(1/x) = 2/x',
    },

    // INTERMEDIÁRIO - Seno/Cosseno
    {
        id: 'sin1',
        function: 'sin(x)',
        derivative: 'cos(x)',
        rule: 'sin',
        difficulty: 'intermediario',
        explanation: 'd/dx[sin(x)] = cos(x)',
    },
    {
        id: 'cos1',
        function: 'cos(x)',
        derivative: '-sin(x)',
        rule: 'cos',
        difficulty: 'intermediario',
        explanation: 'd/dx[cos(x)] = -sin(x)',
    },

    // AVANÇADO - Regra da Cadeia
    {
        id: 'chain1',
        function: '(x²)³',
        derivative: '6x⁵',
        rule: 'chain',
        difficulty: 'avancado',
        explanation: 'd/dx[(x²)³] = 3(x²)²·2x = 3x⁴·2x = 6x⁵',
    },
    {
        id: 'chain2',
        function: 'sin(x²)',
        derivative: '2x·cos(x²)',
        rule: 'chain',
        difficulty: 'avancado',
        explanation: "d/dx[sin(x²)] = cos(x²)·d/dx[x²] = cos(x²)·2x",
    },
    {
        id: 'chain3',
        function: 'e²ˣ',
        derivative: '2e²ˣ',
        rule: 'chain',
        difficulty: 'avancado',
        explanation: 'd/dx[e²ˣ] = e²ˣ·d/dx[2x] = e²ˣ·2 = 2e²ˣ',
    },
    {
        id: 'chain4',
        function: 'ln(x²)',
        derivative: '2/x',
        rule: 'chain',
        difficulty: 'avancado',
        explanation: 'd/dx[ln(x²)] = (1/x²)·2x = 2x/x² = 2/x',
    },

    // AVANÇADO - Produto
    {
        id: 'prod1',
        function: 'x·eˣ',
        derivative: 'eˣ + x·eˣ',
        rule: 'product',
        difficulty: 'avancado',
        explanation: "f'g + fg' = 1·eˣ + x·eˣ = eˣ(1 + x)",
    },
    {
        id: 'prod2',
        function: 'x·sin(x)',
        derivative: 'sin(x) + x·cos(x)',
        rule: 'product',
        difficulty: 'avancado',
        explanation: "f'g + fg' = 1·sin(x) + x·cos(x)",
    },

    // AVANÇADO - Quociente
    {
        id: 'quot1',
        function: '1/x',
        derivative: '-1/x²',
        rule: 'quotient',
        difficulty: 'avancado',
        explanation: "d/dx[x⁻¹] = -1·x⁻² = -1/x²",
    },
    {
        id: 'quot2',
        function: 'x/eˣ',
        derivative: '(1-x)/eˣ',
        rule: 'quotient',
        difficulty: 'avancado',
        explanation: "(f'g - fg')/g² = (eˣ - x·eˣ)/e²ˣ = (1-x)/eˣ",
    },

    // AVANÇADO - Tangente
    {
        id: 'tan1',
        function: 'tan(x)',
        derivative: 'sec²(x)',
        rule: 'tan',
        difficulty: 'avancado',
        explanation: 'd/dx[tan(x)] = sec²(x) = 1/cos²(x)',
    },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

import {
    generateRandomQuestion,
    generateWrongAnswers,
} from './derivativeGenerator';

/**
 * Get rules by difficulty
 */
export const getRules = (difficulty?: DifficultyLevel): DerivativeRule[] => {
    if (!difficulty) return derivativeRules;
    return derivativeRules.filter(r => r.difficulty === difficulty);
};

/**
 * Get questions by difficulty or rule (legacy - kept for compatibility)
 * @deprecated Use getRandomQuestion() for procedural generation
 */
export const getQuestions = (
    difficulty?: DifficultyLevel,
    rule?: DerivativeRuleType
): DerivativeQuestion[] => {
    return derivativeQuestions.filter(q => {
        if (difficulty && q.difficulty !== difficulty) return false;
        if (rule && q.rule !== rule) return false;
        return true;
    });
};

/**
 * Get a random question - NOW USES PROCEDURAL GENERATION
 * Each call generates a unique question with randomized parameters
 */
export const getRandomQuestion = (
    difficulty?: DifficultyLevel,
    rule?: DerivativeRuleType
): DerivativeQuestion => {
    return generateRandomQuestion(difficulty, rule);
};

/**
 * Get wrong answers for a question - NOW GENERATES PLAUSIBLE DISTRACTORS
 * Creates mathematically similar but incorrect answers
 */
export const getWrongDerivatives = (
    correct: DerivativeQuestion,
    count: number = 3
): string[] => {
    return generateWrongAnswers(correct, count);
};

/**
 * Get rule by ID
 */
export const getRuleById = (id: DerivativeRuleType): DerivativeRule | undefined => {
    return derivativeRules.find(r => r.id === id);
};

// ============================================================
// STORAGE KEY
// ============================================================

export const DERIVATIVE_TRAINER_STATS_KEY = '@math_app_derivative_trainer_stats';
