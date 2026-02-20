/**
 * Procedural Function Question Generator
 * 
 * Generates questions about function properties (domain, image, injectivity)
 * using randomized coefficients and function types.
 */

import {
    randomInt,
    randomChoice,
    generateId,
    formatCoefficient,
    DOMAIN_FORMATS,
} from '../core/utils';
import {
    DifficultyLevel,
    FunctionGeneratorOptions,
} from '../core/types';

// ============================================================
// TYPES
// ============================================================

export interface GeneratedFunctionQuestion {
    id: string;
    /** Function expression for display, e.g. "2x² - 3x + 1" */
    expression: string;
    /** Function name, e.g. "Quadrática" */
    displayName: string;
    /** Domain in set notation */
    domain: string;
    /** Image/range in set notation */
    image: string;
    /** Codomain (usually ℝ) */
    codomain: string;
    /** Explanation of why the domain is what it is */
    domainExplanation: string;
    /** Explanation of why the image is what it is */
    imageExplanation: string;
    /** Restrictions list */
    restrictions: string[];
    /** Is the function injective? */
    isInjective: boolean;
    /** Is the function surjective? */
    isSurjective: boolean;
    difficulty: DifficultyLevel;
    /** Function type for categorization */
    functionType: FunctionType;
    /** Parameters used to generate this function */
    params: Record<string, number>;
}

export type FunctionType =
    | 'linear'
    | 'quadratic'
    | 'polynomial'
    | 'rational'
    | 'radical'
    | 'exponential'
    | 'logarithmic'
    | 'trigonometric'
    | 'absolute';

export type QuestionType = 'domain' | 'image' | 'injectivity' | 'surjectivity';

export interface FunctionQuizQuestion {
    id: string;
    type: QuestionType;
    function: GeneratedFunctionQuestion;
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    difficulty: DifficultyLevel;
}

// ============================================================
// FUNCTION GENERATORS BY TYPE
// ============================================================

/**
 * Generate a linear function: f(x) = ax + b
 */
const generateLinear = (): GeneratedFunctionQuestion => {
    const a = randomChoice([-3, -2, -1, 1, 2, 3, 4, 5]);
    const b = randomInt(-5, 5);

    const aStr = formatCoefficient(a);
    const bStr = b === 0 ? '' : (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`);
    const expression = `${aStr}x${bStr}` || 'x';

    return {
        id: generateId('linear'),
        expression,
        displayName: 'Linear',
        domain: DOMAIN_FORMATS.ALL_REALS,
        image: DOMAIN_FORMATS.ALL_REALS,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: 'Uma função linear aceita qualquer valor real como entrada.',
        imageExplanation: 'Uma função linear (a ≠ 0) pode produzir qualquer valor real.',
        restrictions: [],
        isInjective: true,
        isSurjective: true,
        difficulty: 'basico',
        functionType: 'linear',
        params: { a, b },
    };
};

/**
 * Generate a quadratic function: f(x) = ax² + bx + c
 */
const generateQuadratic = (): GeneratedFunctionQuestion => {
    const a = randomChoice([-3, -2, -1, 1, 2, 3]);
    const b = randomInt(-4, 4);
    const c = randomInt(-5, 5);

    // Build expression
    const aStr = formatCoefficient(a);
    let expression = `${aStr}x²`;
    if (b !== 0) expression += b > 0 ? ` + ${formatCoefficient(b)}x` : ` - ${formatCoefficient(Math.abs(b))}x`;
    if (c !== 0) expression += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;

    // Calculate vertex y-coordinate for image
    const vertexY = c - (b * b) / (4 * a);
    const vertexYRounded = Math.round(vertexY * 100) / 100;

    // Image depends on whether parabola opens up or down
    const image = a > 0
        ? `[${vertexYRounded}, +∞)`
        : `(-∞, ${vertexYRounded}]`;

    return {
        id: generateId('quad'),
        expression,
        displayName: 'Quadrática',
        domain: DOMAIN_FORMATS.ALL_REALS,
        image,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: 'Uma função quadrática aceita qualquer valor real.',
        imageExplanation: a > 0
            ? `Parábola abre para cima, mínimo no vértice y = ${vertexYRounded}.`
            : `Parábola abre para baixo, máximo no vértice y = ${vertexYRounded}.`,
        restrictions: [],
        isInjective: false, // Quadratics are never injective on ℝ
        isSurjective: false, // Never surjective onto ℝ
        difficulty: 'basico',
        functionType: 'quadratic',
        params: { a, b, c },
    };
};

/**
 * Generate a rational function: f(x) = a / (bx + c)
 */
const generateRational = (): GeneratedFunctionQuestion => {
    const a = randomChoice([1, 2, 3, -1, -2]);
    const b = randomChoice([1, 2, 3]);
    const c = randomInt(-5, 5);

    // Restriction: bx + c ≠ 0 → x ≠ -c/b
    const restriction = -c / b;
    const restrictionRounded = Math.round(restriction * 100) / 100;

    const bxStr = b === 1 ? 'x' : `${b}x`;
    const cStr = c === 0 ? '' : (c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`);
    const expression = `${a}/(${bxStr}${cStr})`;

    const domainStr = restrictionRounded === 0
        ? DOMAIN_FORMATS.EXCEPT_ZERO
        : `ℝ - {${restrictionRounded}}`;

    return {
        id: generateId('rational'),
        expression,
        displayName: 'Racional',
        domain: domainStr,
        image: DOMAIN_FORMATS.EXCEPT_ZERO,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: `O denominador não pode ser zero: ${bxStr}${cStr} ≠ 0 → x ≠ ${restrictionRounded}`,
        imageExplanation: 'A função nunca atinge zero, mas pode se aproximar de qualquer outro valor.',
        restrictions: [`x ≠ ${restrictionRounded}`],
        isInjective: true,
        isSurjective: false,
        difficulty: 'intermediario',
        functionType: 'rational',
        params: { a, b, c },
    };
};

/**
 * Generate a radical function: f(x) = √(ax + b)
 */
const generateRadical = (): GeneratedFunctionQuestion => {
    const a = randomChoice([1, 2, 3]);
    const b = randomInt(-6, 6);

    // Domain: ax + b ≥ 0 → x ≥ -b/a
    const restriction = -b / a;
    const restrictionRounded = Math.round(restriction * 100) / 100;

    const axStr = a === 1 ? 'x' : `${a}x`;
    const bStr = b === 0 ? '' : (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`);
    const expression = `√(${axStr}${bStr})`;

    return {
        id: generateId('radical'),
        expression,
        displayName: 'Raiz Quadrada',
        domain: `[${restrictionRounded}, +∞)`,
        image: DOMAIN_FORMATS.NON_NEGATIVE,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: `O radicando deve ser ≥ 0: ${axStr}${bStr} ≥ 0 → x ≥ ${restrictionRounded}`,
        imageExplanation: 'Raiz quadrada sempre retorna valores não-negativos.',
        restrictions: [`x ≥ ${restrictionRounded}`],
        isInjective: true,
        isSurjective: false,
        difficulty: 'intermediario',
        functionType: 'radical',
        params: { a, b },
    };
};

/**
 * Generate an exponential function: f(x) = a * e^(bx)
 */
const generateExponential = (): GeneratedFunctionQuestion => {
    const a = randomChoice([1, 2, 3, -1, -2]);
    const b = randomChoice([1, 2, -1, -2]);

    const aStr = a === 1 ? '' : (a === -1 ? '-' : `${a}·`);
    const bStr = b === 1 ? 'x' : (b === -1 ? '-x' : `${b}x`);
    const expression = `${aStr}e^(${bStr})`;

    // Image depends on sign of a
    const image = a > 0 ? DOMAIN_FORMATS.POSITIVE_REALS : '(-∞, 0)';

    return {
        id: generateId('exp'),
        expression,
        displayName: 'Exponencial',
        domain: DOMAIN_FORMATS.ALL_REALS,
        image,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: 'A exponencial está definida para todos os reais.',
        imageExplanation: a > 0
            ? 'Exponencial com coeficiente positivo: sempre positiva.'
            : 'Exponencial com coeficiente negativo: sempre negativa.',
        restrictions: [],
        isInjective: true,
        isSurjective: false,
        difficulty: 'avancado',
        functionType: 'exponential',
        params: { a, b },
    };
};

/**
 * Generate a logarithmic function: f(x) = a * ln(bx + c)
 */
const generateLogarithmic = (): GeneratedFunctionQuestion => {
    const a = randomChoice([1, 2, -1]);
    const b = randomChoice([1, 2]);
    const c = randomInt(0, 5);

    // Domain: bx + c > 0 → x > -c/b
    const restriction = -c / b;

    const aStr = a === 1 ? '' : (a === -1 ? '-' : `${a}·`);
    const bxStr = b === 1 ? 'x' : `${b}x`;
    const cStr = c === 0 ? '' : ` + ${c}`;
    const expression = `${aStr}ln(${bxStr}${cStr})`;

    return {
        id: generateId('log'),
        expression,
        displayName: 'Logaritmo Natural',
        domain: `(${restriction}, +∞)`,
        image: DOMAIN_FORMATS.ALL_REALS,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: `Logaritmo exige argumento positivo: ${bxStr}${cStr} > 0`,
        imageExplanation: 'O logaritmo pode produzir qualquer valor real.',
        restrictions: [`x > ${restriction}`],
        isInjective: true,
        isSurjective: true,
        difficulty: 'avancado',
        functionType: 'logarithmic',
        params: { a, b, c },
    };
};

/**
 * Generate an absolute value function: f(x) = |ax + b|
 */
const generateAbsolute = (): GeneratedFunctionQuestion => {
    const a = randomChoice([1, 2, 3, -1]);
    const b = randomInt(-5, 5);

    const aStr = formatCoefficient(a);
    const bStr = b === 0 ? '' : (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`);
    const expression = `|${aStr}x${bStr}|`;

    return {
        id: generateId('abs'),
        expression,
        displayName: 'Módulo',
        domain: DOMAIN_FORMATS.ALL_REALS,
        image: DOMAIN_FORMATS.NON_NEGATIVE,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: 'O módulo está definido para todos os reais.',
        imageExplanation: 'O módulo sempre retorna valores não-negativos.',
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'basico',
        functionType: 'absolute',
        params: { a, b },
    };
};

/**
 * Generate a trigonometric function: f(x) = a * sin(bx) or a * cos(bx)
 */
const generateTrigonometric = (): GeneratedFunctionQuestion => {
    const func = randomChoice(['sin', 'cos']);
    const a = randomChoice([1, 2, -1]);
    const b = randomChoice([1, 2, 3]);

    const aStr = a === 1 ? '' : (a === -1 ? '-' : `${a}·`);
    const bStr = b === 1 ? 'x' : `${b}x`;
    const expression = `${aStr}${func}(${bStr})`;

    const amplitude = Math.abs(a);
    const image = `[-${amplitude}, ${amplitude}]`;

    return {
        id: generateId('trig'),
        expression,
        displayName: func === 'sin' ? 'Seno' : 'Cosseno',
        domain: DOMAIN_FORMATS.ALL_REALS,
        image,
        codomain: DOMAIN_FORMATS.ALL_REALS,
        domainExplanation: `${func === 'sin' ? 'Seno' : 'Cosseno'} está definido para todos os reais.`,
        imageExplanation: `Amplitude ${amplitude}: valores entre -${amplitude} e ${amplitude}.`,
        restrictions: [],
        isInjective: false,
        isSurjective: false,
        difficulty: 'intermediario',
        functionType: 'trigonometric',
        params: { func: func === 'sin' ? 1 : 0, a, b },
    };
};

// ============================================================
// MAIN GENERATOR
// ============================================================

const GENERATORS_BY_DIFFICULTY: Record<DifficultyLevel, (() => GeneratedFunctionQuestion)[]> = {
    basico: [generateLinear, generateQuadratic, generateAbsolute],
    intermediario: [generateRational, generateRadical, generateTrigonometric],
    avancado: [generateExponential, generateLogarithmic],
};

/**
 * Generate a random function with specified options
 */
export const generateFunction = (
    options: FunctionGeneratorOptions = {}
): GeneratedFunctionQuestion => {
    const { difficulty, functionType } = options;

    // If specific function type requested
    if (functionType) {
        const generators: Record<string, () => GeneratedFunctionQuestion> = {
            linear: generateLinear,
            quadratic: generateQuadratic,
            polynomial: generateQuadratic, // Use quadratic for polynomial
            rational: generateRational,
            radical: generateRadical,
            exponential: generateExponential,
            logarithmic: generateLogarithmic,
            trigonometric: generateTrigonometric,
        };
        return generators[functionType]?.() || generateLinear();
    }

    // If difficulty specified, use generators from that level
    if (difficulty) {
        const generators = GENERATORS_BY_DIFFICULTY[difficulty];
        return randomChoice(generators)();
    }

    // Random difficulty with weight towards basic
    const allGenerators = [
        ...GENERATORS_BY_DIFFICULTY.basico,
        ...GENERATORS_BY_DIFFICULTY.basico, // Double weight
        ...GENERATORS_BY_DIFFICULTY.intermediario,
        ...GENERATORS_BY_DIFFICULTY.avancado,
    ];
    return randomChoice(allGenerators)();
};

/**
 * Generate a quiz question about a function
 */
export const generateQuizQuestion = (
    options: FunctionGeneratorOptions = {}
): FunctionQuizQuestion => {
    const func = generateFunction(options);
    const questionType = options.questionType || randomChoice(['domain', 'image', 'injectivity', 'surjectivity'] as QuestionType[]);

    let question: string;
    let correctAnswer: string;
    let wrongAnswers: string[];

    switch (questionType) {
        case 'domain':
            question = `Qual é o domínio de f(x) = ${func.expression}?`;
            correctAnswer = func.domain;
            wrongAnswers = generateDomainDistractors(func.domain);
            break;

        case 'image':
            question = `Qual é a imagem de f(x) = ${func.expression}?`;
            correctAnswer = func.image;
            wrongAnswers = generateImageDistractors(func.image);
            break;

        case 'injectivity':
            question = `A função f(x) = ${func.expression} é injetora?`;
            correctAnswer = func.isInjective ? 'Sim' : 'Não';
            wrongAnswers = [func.isInjective ? 'Não' : 'Sim', 'Depende do domínio', 'Impossível determinar'];
            break;

        case 'surjectivity':
            question = `A função f(x) = ${func.expression} é sobrejetora em ℝ?`;
            correctAnswer = func.isSurjective ? 'Sim' : 'Não';
            wrongAnswers = [func.isSurjective ? 'Não' : 'Sim', 'Depende do codomínio', 'Impossível determinar'];
            break;
    }

    return {
        id: generateId('quiz'),
        type: questionType,
        function: func,
        question,
        correctAnswer,
        wrongAnswers: wrongAnswers.slice(0, 3),
        difficulty: func.difficulty,
    };
};

/**
 * Generate plausible wrong domain answers
 */
const generateDomainDistractors = (correct: string): string[] => {
    const allDomains = [
        DOMAIN_FORMATS.ALL_REALS,
        DOMAIN_FORMATS.POSITIVE_REALS,
        DOMAIN_FORMATS.NON_NEGATIVE,
        DOMAIN_FORMATS.EXCEPT_ZERO,
        '(-∞, 0)',
        '[-1, 1]',
        'ℝ - {1}',
    ];
    return allDomains.filter(d => d !== correct).slice(0, 4);
};

/**
 * Generate plausible wrong image answers
 */
const generateImageDistractors = (correct: string): string[] => {
    const allImages = [
        DOMAIN_FORMATS.ALL_REALS,
        DOMAIN_FORMATS.POSITIVE_REALS,
        DOMAIN_FORMATS.NON_NEGATIVE,
        DOMAIN_FORMATS.EXCEPT_ZERO,
        '[-1, 1]',
        '[0, 1]',
        '(-∞, 0]',
    ];
    return allImages.filter(i => i !== correct).slice(0, 4);
};

/**
 * Generate wrong answers for a question
 */
export const generateDistractors = (
    question: FunctionQuizQuestion,
    count: number = 3
): string[] => {
    return question.wrongAnswers.slice(0, count);
};
