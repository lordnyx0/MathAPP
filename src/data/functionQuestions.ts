// Function Questions - Data for the Function Lab minigame
// Covers: Domain, Image, Codomain, and Function Types

// ============================================================
// TYPES
// ============================================================

export type FunctionDifficulty = 'basico' | 'intermediario' | 'avancado';
export type QuestionType = 'domain' | 'image' | 'codomain' | 'match';

export interface GraphPoint {
    x: number;
    y: number;
}

export interface MathFunction {
    id: string;
    expression: string;        // LaTeX: x^2, \\sqrt{x}, \\frac{1}{x}
    displayName: string;       // "Quadrática", "Raiz Quadrada"
    domain: string;            // "ℝ" or "[0, +∞)"
    image: string;             // "[0, +∞)"
    codomain: string;          // "ℝ"
    domainExplanation: string; // Why this domain
    imageExplanation: string;  // Why this image
    restrictions: string[];    // ["x ≥ 0", "sem raiz de negativo"]
    isInjective: boolean;
    isSurjective: boolean;
    difficulty: FunctionDifficulty;
    graphPoints: GraphPoint[]; // For SVG rendering
    graphDomain: [number, number]; // x range for graph
    graphRange: [number, number];  // y range for graph
}

export interface FunctionQuestion {
    type: QuestionType;
    function: MathFunction;
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
}

// ============================================================
// HELPER: Generate graph points
// ============================================================

const generatePoints = (
    fn: (x: number) => number | null,
    start: number,
    end: number,
    step: number = 0.1
): GraphPoint[] => {
    const points: GraphPoint[] = [];
    for (let x = start; x <= end; x += step) {
        const y = fn(x);
        if (y !== null && isFinite(y) && Math.abs(y) < 100) {
            points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
        }
    }
    return points;
};

// ============================================================
// FUNCTION DATA
// ============================================================

export const mathFunctions: MathFunction[] = [
    // =========================================================
    // BÁSICO
    // =========================================================
    {
        id: 'linear',
        expression: 'x',
        displayName: 'Identidade',
        domain: 'ℝ',
        image: 'ℝ',
        codomain: 'ℝ',
        domainExplanation: 'Qualquer número real pode ser usado como entrada.',
        imageExplanation: 'A função retorna todos os números reais.',
        restrictions: [],
        isInjective: true,
        isSurjective: true,
        difficulty: 'basico',
        graphPoints: generatePoints(x => x, -5, 5),
        graphDomain: [-5, 5],
        graphRange: [-5, 5],
    },
    {
        id: 'quadratica',
        expression: 'x^2',
        displayName: 'Quadrática',
        domain: 'ℝ',
        image: '[0, +∞)',
        codomain: 'ℝ',
        domainExplanation: 'Qualquer número pode ser elevado ao quadrado.',
        imageExplanation: 'x² sempre resulta em valores ≥ 0.',
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'basico',
        graphPoints: generatePoints(x => x * x, -3, 3),
        graphDomain: [-3, 3],
        graphRange: [0, 9],
    },
    {
        id: 'raiz',
        expression: '√x',
        displayName: 'Raiz Quadrada',
        domain: '[0, +∞)',
        image: '[0, +∞)',
        codomain: 'ℝ',
        domainExplanation: 'Não existe raiz quadrada de números negativos em ℝ.',
        imageExplanation: 'A raiz quadrada sempre retorna valores ≥ 0.',
        restrictions: ['x ≥ 0'],
        isInjective: true,
        isSurjective: false,
        difficulty: 'basico',
        graphPoints: generatePoints(x => x >= 0 ? Math.sqrt(x) : null, 0, 9),
        graphDomain: [0, 9],
        graphRange: [0, 3],
    },
    {
        id: 'modulo',
        expression: '|x|',
        displayName: 'Módulo',
        domain: 'ℝ',
        image: '[0, +∞)',
        codomain: 'ℝ',
        domainExplanation: 'O módulo está definido para todos os reais.',
        imageExplanation: '|x| sempre retorna valores ≥ 0.',
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'basico',
        graphPoints: generatePoints(x => Math.abs(x), -5, 5),
        graphDomain: [-5, 5],
        graphRange: [0, 5],
    },
    {
        id: 'constante',
        expression: '2',
        displayName: 'Constante',
        domain: 'ℝ',
        image: '{2}',
        codomain: 'ℝ',
        domainExplanation: 'Uma função constante aceita qualquer entrada.',
        imageExplanation: 'A função sempre retorna o mesmo valor: 2.',
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'basico',
        graphPoints: generatePoints(() => 2, -5, 5),
        graphDomain: [-5, 5],
        graphRange: [0, 4],
    },

    // =========================================================
    // INTERMEDIÁRIO
    // =========================================================
    {
        id: 'inversa',
        expression: '1/x',
        displayName: 'Inversa',
        domain: 'ℝ - {0}',
        image: 'ℝ - {0}',
        codomain: 'ℝ',
        domainExplanation: 'Divisão por zero é indefinida.',
        imageExplanation: '1/x nunca resulta em zero.',
        restrictions: ['x ≠ 0'],
        isInjective: true,
        isSurjective: false,
        difficulty: 'intermediario',
        graphPoints: [
            ...generatePoints(x => x < -0.2 ? 1 / x : null, -5, -0.2),
            ...generatePoints(x => x > 0.2 ? 1 / x : null, 0.2, 5),
        ],
        graphDomain: [-5, 5],
        graphRange: [-5, 5],
    },
    {
        id: 'cubica',
        expression: 'x^3',
        displayName: 'Cúbica',
        domain: 'ℝ',
        image: 'ℝ',
        codomain: 'ℝ',
        domainExplanation: 'Qualquer número pode ser elevado ao cubo.',
        imageExplanation: 'x³ atinge todos os valores reais (bijetora).',
        restrictions: [],
        isInjective: true,
        isSurjective: true,
        difficulty: 'intermediario',
        graphPoints: generatePoints(x => x * x * x, -2, 2),
        graphDomain: [-2, 2],
        graphRange: [-8, 8],
    },
    {
        id: 'seno',
        expression: 'sin(x)',
        displayName: 'Seno',
        domain: 'ℝ',
        image: '[-1, 1]',
        codomain: 'ℝ',
        domainExplanation: 'O seno está definido para qualquer ângulo.',
        imageExplanation: 'O seno oscila entre -1 e 1.',
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'intermediario',
        graphPoints: generatePoints(x => Math.sin(x), -6.28, 6.28, 0.2),
        graphDomain: [-6.28, 6.28],
        graphRange: [-1.5, 1.5],
    },
    {
        id: 'cosseno',
        expression: 'cos(x)',
        displayName: 'Cosseno',
        domain: 'ℝ',
        image: '[-1, 1]',
        codomain: 'ℝ',
        domainExplanation: 'O cosseno está definido para qualquer ângulo.',
        imageExplanation: 'O cosseno oscila entre -1 e 1.',
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'intermediario',
        graphPoints: generatePoints(x => Math.cos(x), -6.28, 6.28, 0.2),
        graphDomain: [-6.28, 6.28],
        graphRange: [-1.5, 1.5],
    },

    // =========================================================
    // AVANÇADO
    // =========================================================
    {
        id: 'exponencial',
        expression: 'eˣ',
        displayName: 'Exponencial',
        domain: 'ℝ',
        image: '(0, +∞)',
        codomain: 'ℝ',
        domainExplanation: 'A exponencial aceita qualquer expoente real.',
        imageExplanation: 'eˣ é sempre positivo, nunca zero ou negativo.',
        restrictions: [],
        isInjective: true,
        isSurjective: false,
        difficulty: 'avancado',
        graphPoints: generatePoints(x => Math.exp(x), -3, 2),
        graphDomain: [-3, 2],
        graphRange: [0, 8],
    },
    {
        id: 'logaritmo',
        expression: 'ln(x)',
        displayName: 'Logaritmo Natural',
        domain: '(0, +∞)',
        image: 'ℝ',
        codomain: 'ℝ',
        domainExplanation: 'Logaritmo de zero ou negativo não existe.',
        imageExplanation: 'ln(x) atinge todos os reais quando x percorre (0, +∞).',
        restrictions: ['x > 0'],
        isInjective: true,
        isSurjective: true,
        difficulty: 'avancado',
        graphPoints: generatePoints(x => x > 0 ? Math.log(x) : null, 0.1, 8),
        graphDomain: [0, 8],
        graphRange: [-3, 3],
    },
    {
        id: 'tangente',
        expression: 'tan(x)',
        displayName: 'Tangente',
        domain: 'ℝ - {π/2 + kπ}',
        image: 'ℝ',
        codomain: 'ℝ',
        domainExplanation: 'Tangente é indefinida onde cos(x) = 0.',
        imageExplanation: 'A tangente atinge todos os valores reais.',
        restrictions: ['x ≠ π/2 + kπ'],
        isInjective: false,
        isSurjective: true,
        difficulty: 'avancado',
        graphPoints: [
            ...generatePoints(x => Math.abs(Math.cos(x)) > 0.1 ? Math.tan(x) : null, -1.4, 1.4, 0.1),
        ],
        graphDomain: [-1.57, 1.57],
        graphRange: [-5, 5],
    },
];

// ============================================================
// DOMAIN/IMAGE OPTIONS
// ============================================================

export const domainOptions = [
    'ℝ',
    'ℝ - {0}',
    '[0, +∞)',
    '(0, +∞)',
    '(-∞, 0]',
    '[-1, 1]',
    'ℝ - {π/2 + kπ}',
    '{2}',
];

export const imageOptions = [
    'ℝ',
    'ℝ - {0}',
    '[0, +∞)',
    '(0, +∞)',
    '[-1, 1]',
    '{2}',
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

import {
    generateFunction,
    generateQuizQuestion as generateProceduralQuestion,
    GeneratedFunctionQuestion,
    FunctionQuizQuestion as GeneratedQuizQuestion,
} from './generators/function/functionGenerator';

/**
 * Get functions by difficulty (from static list)
 */
export const getFunctions = (difficulty?: FunctionDifficulty): MathFunction[] => {
    if (!difficulty) return mathFunctions;
    return mathFunctions.filter(f => f.difficulty === difficulty);
};

/**
 * Domains that DomainBuilder can construct
 */
const BUILDABLE_DOMAINS = [
    'ℝ',
    'ℝ - {0}',
    '[0, +∞)',
    '(0, +∞)',
];

/**
 * Get functions that are compatible with Build Domain mode
 */
export const getBuildableFunctions = (): MathFunction[] => {
    return mathFunctions.filter(f => BUILDABLE_DOMAINS.includes(f.domain));
};

/**
 * Get a random function from static list (for modes requiring graph)
 * Maintains backward compatibility with FunctionLabScreen
 */
export const getRandomFunction = (() => {
    let lastIndex = -1;
    return (difficulty?: FunctionDifficulty, buildableOnly?: boolean): MathFunction => {
        let filtered = getFunctions(difficulty);
        if (buildableOnly) {
            filtered = filtered.filter(f => BUILDABLE_DOMAINS.includes(f.domain));
        }
        let index: number;
        do {
            index = Math.floor(Math.random() * filtered.length);
        } while (index === lastIndex && filtered.length > 1);
        lastIndex = index;
        return filtered[index];
    };
})();

/**
 * Generate a procedural function with randomized coefficients
 * Use this for quiz modes that don't need graph rendering
 */
export const getProceduralFunction = (
    difficulty?: FunctionDifficulty
): GeneratedFunctionQuestion => {
    return generateFunction({ difficulty });
};

/**
 * Generate a procedural quiz question about functions
 */
export const getRandomQuizQuestion = (
    difficulty?: FunctionDifficulty
): GeneratedQuizQuestion => {
    return generateProceduralQuestion({ difficulty });
};

/**
 * Generate a question about a function
 */
export const generateQuestion = (
    fn: MathFunction,
    type: QuestionType
): FunctionQuestion => {
    let question: string;
    let correctAnswer: string;
    let wrongOptions: string[];

    switch (type) {
        case 'domain':
            question = `Qual é o DOMÍNIO de f(x) = ${fn.expression}?`;
            correctAnswer = fn.domain;
            wrongOptions = domainOptions.filter(o => o !== correctAnswer);
            break;
        case 'image':
            question = `Qual é a IMAGEM de f(x) = ${fn.expression}?`;
            correctAnswer = fn.image;
            wrongOptions = imageOptions.filter(o => o !== correctAnswer);
            break;
        case 'codomain':
            question = `Qual é o CONTRADOMÍNIO usual de f(x) = ${fn.expression}?`;
            correctAnswer = fn.codomain;
            wrongOptions = ['ℝ', 'ℝ⁺', 'ℤ', 'ℕ'].filter(o => o !== correctAnswer);
            break;
        case 'match':
        default:
            question = `Qual função tem Domínio: ${fn.domain} e Imagem: ${fn.image}?`;
            correctAnswer = fn.expression;
            wrongOptions = mathFunctions
                .filter(f => f.id !== fn.id)
                .map(f => f.expression)
                .slice(0, 5);
            break;
    }

    // Shuffle and pick 3 wrong answers
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

    return {
        type,
        function: fn,
        question,
        correctAnswer,
        wrongAnswers: shuffledWrong,
    };
};

/**
 * Get explanation based on question type
 */
export const getExplanation = (question: FunctionQuestion): string => {
    const fn = question.function;
    switch (question.type) {
        case 'domain':
            return fn.domainExplanation;
        case 'image':
            return fn.imageExplanation;
        case 'codomain':
            return `O contradomínio usual é ${fn.codomain}.`;
        case 'match':
            return `${fn.displayName}: Domínio = ${fn.domain}, Imagem = ${fn.image}`;
        default:
            return '';
    }
};

// ============================================================
// STORAGE KEY
// ============================================================

export const FUNCTION_LAB_STATS_KEY = '@math_app_function_lab_stats';
