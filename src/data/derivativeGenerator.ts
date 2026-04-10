/**
 * Procedural Derivative Generator
 * 
 * Generates derivative questions with randomized parameters to prevent
 * pattern memorization with randomized parameters.
 */

import {
    DerivativeQuestion,
    DerivativeRuleType,
    DifficultyLevel,
} from './derivativeQuestions';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate a random integer in range [min, max] inclusive
 */
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Pick a random element from an array
 */
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

/**
 * Convert a number to superscript string
 */
const toSuperscript = (n: number): string => {
    const superscripts: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '-': '⁻',
    };
    return String(n).split('').map(c => superscripts[c] || c).join('');
};

/**
 * Format polynomial term coefficient*x^exp (without showing x¹)
 */
const formatPowerTerm = (coefficient: number, exponent: number): string => {
    if (exponent === 0) return `${coefficient}`;
    if (exponent === 1) return coefficient === 1 ? 'x' : `${coefficient}x`;
    return coefficient === 1
        ? `x${toSuperscript(exponent)}`
        : `${coefficient}x${toSuperscript(exponent)}`;
};

/**
 * Generate explanation for a derivative
 */
const generateExplanation = (
    rule: DerivativeRuleType,
    func: string,
    deriv: string
): string => {
    const explanations: Record<DerivativeRuleType, string> = {
        constant: `A derivada de qualquer constante é 0.`,
        power: `Aplicando d/dx[axⁿ] = n·a·xⁿ⁻¹`,
        sum: `Derivando termo a termo pela regra da soma`,
        product: `Aplicando f'g + fg' (regra do produto)`,
        quotient: `Aplicando (f'g - fg')/g² (regra do quociente)`,
        chain: `Aplicando f'(g)·g' (regra da cadeia)`,
        exp: `d/dx[eᵘ] = eᵘ·u' (exponencial)`,
        ln: `d/dx[ln(u)] = u'/u (logaritmo)`,
        sin: `d/dx[sin(u)] = cos(u)·u'`,
        cos: `d/dx[cos(u)] = -sin(u)·u'`,
        tan: `d/dx[tan(x)] = sec²(x)`,
    };
    return explanations[rule];
};

// ============================================================
// QUESTION GENERATORS BY RULE TYPE
// ============================================================

let questionCounter = 0;
const generateId = (prefix: string) => `${prefix}_gen_${++questionCounter}`;

/**
 * Generate a constant derivative question
 * d/dx[c] = 0
 */
export const generateConstantQuestion = (): DerivativeQuestion => {
    const constants = [
        ...Array.from({ length: 19 }, (_, i) => String(i + 2)), // 2-20
        'π',
        'e',
        '√2',
    ];
    const c = randomChoice(constants);

    return {
        id: generateId('const'),
        function: c,
        derivative: '0',
        rule: 'constant',
        difficulty: 'basico',
        explanation: generateExplanation('constant', c, '0'),
    };
};

/**
 * Generate a power rule question
 * d/dx[ax^n] = n*a*x^(n-1)
 */
export const generatePowerQuestion = (): DerivativeQuestion => {
    const hasCoefficient = Math.random() > 0.3;
    const a = hasCoefficient ? randomInt(2, 9) : 1;
    const n = randomInt(2, 7);

    // Build expression for mathjs
    const expr = hasCoefficient ? `${a}*x^${n}` : `x^${n}`;

    // Calculate derivative
    const derivCoeff = n * a;
    const newExp = n - 1;

    let derivDisplay: string;
    if (newExp === 0) {
        derivDisplay = String(derivCoeff);
    } else if (newExp === 1) {
        derivDisplay = derivCoeff === 1 ? 'x' : `${derivCoeff}x`;
    } else {
        derivDisplay = derivCoeff === 1
            ? `x${toSuperscript(newExp)}`
            : `${derivCoeff}x${toSuperscript(newExp)}`;
    }

    const funcDisplay = hasCoefficient
        ? `${a}x${toSuperscript(n)}`
        : `x${toSuperscript(n)}`;

    return {
        id: generateId('pow'),
        function: funcDisplay,
        derivative: derivDisplay,
        rule: 'power',
        difficulty: 'basico',
        explanation: generateExplanation('power', funcDisplay, derivDisplay),
    };
};

/**
 * Generate a sum/difference rule question
 * d/dx[ax^n ± bx^m] = n*a*x^(n-1) ± m*b*x^(m-1)
 */
export const generateSumQuestion = (): DerivativeQuestion => {
    const a = randomInt(2, 5);
    const n = randomInt(3, 5);
    const b = randomInt(2, 5);
    const m = randomInt(1, n - 1); // Ensure m < n for variety
    const isAddition = Math.random() > 0.5;
    const op = isAddition ? '+' : '-';

    const expr = `${a}*x^${n} ${op} ${b}*x^${m}`;
    const funcDisplay = `${a}x${toSuperscript(n)} ${op} ${b}x${toSuperscript(m)}`;

    // Calculate derivative terms
    const term1Coeff = n * a;
    const term1Exp = n - 1;
    const term2Coeff = m * b;
    const term2Exp = m - 1;

    const formatTerm = (coeff: number, exp: number): string => {
        if (exp === 0) return String(coeff);
        if (exp === 1) return `${coeff}x`;
        return `${coeff}x${toSuperscript(exp)}`;
    };

    const derivDisplay = `${formatTerm(term1Coeff, term1Exp)} ${op} ${formatTerm(term2Coeff, term2Exp)}`;

    return {
        id: generateId('sum'),
        function: funcDisplay,
        derivative: derivDisplay,
        rule: 'sum',
        difficulty: 'basico',
        explanation: generateExplanation('sum', funcDisplay, derivDisplay),
    };
};

/**
 * Generate an exponential derivative question
 * d/dx[a*e^(bx)] = a*b*e^(bx)
 */
export const generateExpQuestion = (): DerivativeQuestion => {
    const hasCoefficient = Math.random() > 0.4;
    const a = hasCoefficient ? randomInt(2, 5) : 1;
    const hasInnerCoeff = Math.random() > 0.4;
    const b = hasInnerCoeff ? randomInt(2, 4) : 1;

    let funcDisplay: string;
    if (a === 1 && b === 1) {
        funcDisplay = 'eˣ';
    } else if (a === 1) {
        funcDisplay = `e^(${b}x)`;
    } else if (b === 1) {
        funcDisplay = `${a}eˣ`;
    } else {
        funcDisplay = `${a}e^(${b}x)`;
    }

    const derivCoeff = a * b;
    let derivDisplay: string;
    if (b === 1) {
        derivDisplay = derivCoeff === 1 ? 'eˣ' : `${derivCoeff}eˣ`;
    } else {
        derivDisplay = derivCoeff === 1
            ? `e^(${b}x)`
            : `${derivCoeff}e^(${b}x)`;
    }

    return {
        id: generateId('exp'),
        function: funcDisplay,
        derivative: derivDisplay,
        rule: 'exp',
        difficulty: 'intermediario',
        explanation: generateExplanation('exp', funcDisplay, derivDisplay),
    };
};

/**
 * Generate a logarithm derivative question
 * d/dx[a*ln(x)] = a/x
 */
export const generateLnQuestion = (): DerivativeQuestion => {
    const hasCoefficient = Math.random() > 0.3;
    const a = hasCoefficient ? randomInt(2, 6) : 1;

    const funcDisplay = a === 1 ? 'ln(x)' : `${a}ln(x)`;
    const derivDisplay = a === 1 ? '1/x' : `${a}/x`;

    return {
        id: generateId('ln'),
        function: funcDisplay,
        derivative: derivDisplay,
        rule: 'ln',
        difficulty: 'intermediario',
        explanation: generateExplanation('ln', funcDisplay, derivDisplay),
    };
};

/**
 * Generate a sine derivative question
 * d/dx[sin(ax)] = a*cos(ax)
 */
export const generateSinQuestion = (): DerivativeQuestion => {
    const hasInnerCoeff = Math.random() > 0.5;
    const a = hasInnerCoeff ? randomInt(2, 5) : 1;

    const funcDisplay = a === 1 ? 'sin(x)' : `sin(${a}x)`;
    const derivDisplay = a === 1 ? 'cos(x)' : `${a}cos(${a}x)`;

    return {
        id: generateId('sin'),
        function: funcDisplay,
        derivative: derivDisplay,
        rule: 'sin',
        difficulty: 'intermediario',
        explanation: generateExplanation('sin', funcDisplay, derivDisplay),
    };
};

/**
 * Generate a cosine derivative question
 * d/dx[cos(ax)] = -a*sin(ax)
 */
export const generateCosQuestion = (): DerivativeQuestion => {
    const hasInnerCoeff = Math.random() > 0.5;
    const a = hasInnerCoeff ? randomInt(2, 5) : 1;

    const funcDisplay = a === 1 ? 'cos(x)' : `cos(${a}x)`;
    const derivDisplay = a === 1 ? '-sin(x)' : `-${a}sin(${a}x)`;

    return {
        id: generateId('cos'),
        function: funcDisplay,
        derivative: derivDisplay,
        rule: 'cos',
        difficulty: 'intermediario',
        explanation: generateExplanation('cos', funcDisplay, derivDisplay),
    };
};

/**
 * Generate a tangent derivative question
 * d/dx[tan(x)] = sec²(x)
 */
export const generateTanQuestion = (): DerivativeQuestion => {
    return {
        id: generateId('tan'),
        function: 'tan(x)',
        derivative: 'sec²(x)',
        rule: 'tan',
        difficulty: 'avancado',
        explanation: generateExplanation('tan', 'tan(x)', 'sec²(x)'),
    };
};

/**
 * Generate a chain rule question with various compositions
 */
export const generateChainQuestion = (): DerivativeQuestion => {
    const patterns = [
        // sin(x^n)
        () => {
            const n = randomInt(2, 4);
            const func = `sin(x${toSuperscript(n)})`;
            const deriv = `${formatPowerTerm(n, n - 1)}cos(x${toSuperscript(n)})`;
            return { func, deriv };
        },
        // cos(x^n)
        () => {
            const n = randomInt(2, 4);
            const func = `cos(x${toSuperscript(n)})`;
            const deriv = `-${formatPowerTerm(n, n - 1)}sin(x${toSuperscript(n)})`;
            return { func, deriv };
        },
        // e^(x^n)
        () => {
            const n = randomInt(2, 3);
            const func = `e^(x${toSuperscript(n)})`;
            const deriv = `${formatPowerTerm(n, n - 1)}·e^(x${toSuperscript(n)})`;
            return { func, deriv };
        },
        // ln(x^n) - simplifies nicely
        () => {
            const n = randomInt(2, 5);
            const func = `ln(x${toSuperscript(n)})`;
            const deriv = `${n}/x`;
            return { func, deriv };
        },
        // (ax + b)^n
        () => {
            const a = randomInt(2, 4);
            const b = randomInt(1, 5);
            const n = randomInt(2, 4);
            const func = `(${a}x + ${b})${toSuperscript(n)}`;
            const innerDeriv = a;
            const deriv = `${n * innerDeriv}(${a}x + ${b})${toSuperscript(n - 1)}`;
            return { func, deriv };
        },
    ];

    const { func, deriv } = randomChoice(patterns)();

    return {
        id: generateId('chain'),
        function: func,
        derivative: deriv,
        rule: 'chain',
        difficulty: 'avancado',
        explanation: generateExplanation('chain', func, deriv),
    };
};

/**
 * Generate a product rule question
 * d/dx[f*g] = f'g + fg'
 */
export const generateProductQuestion = (): DerivativeQuestion => {
    const patterns = [
        // x^n * e^x
        () => {
            const n = randomInt(1, 3);
            const func = n === 1 ? 'x·eˣ' : `x${toSuperscript(n)}·eˣ`;
            const term1 = n === 1 ? 'eˣ' : `${n}x${toSuperscript(n - 1)}·eˣ`;
            const term2 = n === 1 ? 'x·eˣ' : `x${toSuperscript(n)}·eˣ`;
            const deriv = `${term1} + ${term2}`;
            return { func, deriv };
        },
        // x * sin(x)
        () => {
            const func = 'x·sin(x)';
            const deriv = 'sin(x) + x·cos(x)';
            return { func, deriv };
        },
        // x * cos(x)
        () => {
            const func = 'x·cos(x)';
            const deriv = 'cos(x) - x·sin(x)';
            return { func, deriv };
        },
        // x^n * ln(x)
        () => {
            const n = randomInt(1, 3);
            const func = n === 1 ? 'x·ln(x)' : `x${toSuperscript(n)}·ln(x)`;
            const deriv = n === 1
                ? 'ln(x) + 1'
                : `${n}x${toSuperscript(n - 1)}·ln(x) + x${toSuperscript(n - 1)}`;
            return { func, deriv };
        },
    ];

    const { func, deriv } = randomChoice(patterns)();

    return {
        id: generateId('prod'),
        function: func,
        derivative: deriv,
        rule: 'product',
        difficulty: 'avancado',
        explanation: generateExplanation('product', func, deriv),
    };
};

/**
 * Generate a quotient rule question
 * d/dx[f/g] = (f'g - fg')/g²
 */
export const generateQuotientQuestion = (): DerivativeQuestion => {
    const patterns = [
        // 1/x^n (power rule shortcut)
        () => {
            const n = randomInt(1, 3);
            const func = n === 1 ? '1/x' : `1/x${toSuperscript(n)}`;
            const deriv = n === 1 ? '-1/x²' : `-${n}/x${toSuperscript(n + 1)}`;
            return { func, deriv };
        },
        // x/e^x
        () => {
            const func = 'x/eˣ';
            const deriv = '(1-x)/eˣ';
            return { func, deriv };
        },
        // sin(x)/x
        () => {
            const func = 'sin(x)/x';
            const deriv = '(x·cos(x) - sin(x))/x²';
            return { func, deriv };
        },
        // x^n/e^x
        () => {
            const n = randomInt(2, 3);
            const func = `x${toSuperscript(n)}/eˣ`;
            const deriv = `(${n}x${toSuperscript(n - 1)} - x${toSuperscript(n)})/eˣ`;
            return { func, deriv };
        },
    ];

    const { func, deriv } = randomChoice(patterns)();

    return {
        id: generateId('quot'),
        function: func,
        derivative: deriv,
        rule: 'quotient',
        difficulty: 'avancado',
        explanation: generateExplanation('quotient', func, deriv),
    };
};

// ============================================================
// MAIN GENERATOR API
// ============================================================

type GeneratorFunction = () => DerivativeQuestion;

const generatorsByRule: Record<DerivativeRuleType, GeneratorFunction> = {
    constant: generateConstantQuestion,
    power: generatePowerQuestion,
    sum: generateSumQuestion,
    product: generateProductQuestion,
    quotient: generateQuotientQuestion,
    chain: generateChainQuestion,
    exp: generateExpQuestion,
    ln: generateLnQuestion,
    sin: generateSinQuestion,
    cos: generateCosQuestion,
    tan: generateTanQuestion,
};

const generatorsByDifficulty: Record<DifficultyLevel, DerivativeRuleType[]> = {
    basico: ['constant', 'power', 'sum'],
    intermediario: ['exp', 'ln', 'sin', 'cos'],
    avancado: ['chain', 'product', 'quotient', 'tan'],
};

/**
 * Generate a random derivative question
 */
export const generateRandomQuestion = (
    difficulty?: DifficultyLevel,
    rule?: DerivativeRuleType
): DerivativeQuestion => {
    // If specific rule requested, use that generator
    if (rule) {
        return generatorsByRule[rule]();
    }

    // If difficulty specified, pick from that pool
    if (difficulty) {
        const rules = generatorsByDifficulty[difficulty];
        const selectedRule = randomChoice(rules);
        return generatorsByRule[selectedRule]();
    }

    // Otherwise, pick any rule with weighted probability
    // Favor basic questions slightly for better learning curve
    const allRules: DerivativeRuleType[] = [
        ...generatorsByDifficulty.basico,
        ...generatorsByDifficulty.basico, // Double weight for basic
        ...generatorsByDifficulty.intermediario,
        ...generatorsByDifficulty.avancado,
    ];
    const selectedRule = randomChoice(allRules);
    return generatorsByRule[selectedRule]();
};

/**
 * Generate plausible wrong answers for a question
 * Creates distractors that look similar but are mathematically wrong
 */

const wrapIfNeeded = (expr: string): string => {
    return /[\s+\-]/.test(expr) ? `(${expr})` : expr;
};

const multiplyExpression = (expr: string, factor: number): string => {
    if (factor === 1) return expr;
    return `${factor}${wrapIfNeeded(expr)}`;
};

const invertSign = (expr: string): string => {
    if (expr.startsWith('-')) return expr.slice(1);
    return `-${expr}`;
};

const mutatePowerExponent = (expr: string): string => {
    const superscriptDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const match = expr.match(new RegExp(`[${superscriptDigits}]+$`));
    if (!match) return `${expr}²`;
    const current = match[0];
    const options = ['¹', '²', '³', '⁴', '⁵'].filter(v => v !== current);
    return expr.replace(new RegExp(`${current}$`), randomChoice(options));
};

export const generateWrongAnswers = (
    correct: DerivativeQuestion,
    count: number = 3
): string[] => {
    const wrongAnswers: Set<string> = new Set();
    const correctDeriv = correct.derivative;

    const addDistractor = (distractor: string) => {
        const cleaned = distractor.trim();
        if (cleaned && cleaned !== correctDeriv) {
            wrongAnswers.add(cleaned);
        }
    };

    switch (correct.rule) {
        case 'constant':
            addDistractor('1');
            addDistractor('-1');
            addDistractor('x');
            break;

        case 'power':
            addDistractor(mutatePowerExponent(correctDeriv));
            addDistractor(correctDeriv.replace(/^\d+/, m => String(Math.max(1, parseInt(m) - 1))));
            addDistractor(correctDeriv.replace(/^\d+/, m => String(parseInt(m) + 1)));
            break;

        case 'sum':
            addDistractor(correctDeriv.replace(' + ', ' - '));
            addDistractor(correctDeriv.replace(' - ', ' + '));
            addDistractor(invertSign(correctDeriv));
            break;

        case 'sin':
            addDistractor(correctDeriv.replace('cos', 'sin'));
            addDistractor(invertSign(correctDeriv));
            addDistractor(correctDeriv.replace(/^\d+/, m => String(parseInt(m) + 1)));
            break;

        case 'cos':
            addDistractor(correctDeriv.replace('-', ''));
            addDistractor(correctDeriv.replace('sin', 'cos'));
            addDistractor(correctDeriv.replace(/\d+/, m => String(parseInt(m) + 1)));
            break;

        case 'tan':
            addDistractor('sec(x)');
            addDistractor('tan(x)');
            addDistractor('cos²(x)');
            break;

        case 'exp':
            addDistractor(multiplyExpression(correctDeriv, 2));
            addDistractor(multiplyExpression(correctDeriv, 3));
            if (/^\d+/.test(correctDeriv)) {
                addDistractor(correctDeriv.replace(/^\d+/, ''));
            }
            break;

        case 'ln':
            addDistractor('1/x²');
            addDistractor('x');
            addDistractor('ln(x)');
            break;

        case 'chain':
            addDistractor(invertSign(correctDeriv));
            addDistractor(`${wrapIfNeeded(correctDeriv)} + 1`);
            addDistractor(multiplyExpression(correctDeriv, 2));
            break;

        case 'product':
            addDistractor(correctDeriv.replace(' + ', '·'));
            addDistractor(invertSign(correctDeriv));
            addDistractor(`${wrapIfNeeded(correctDeriv)} + 1`);
            break;

        case 'quotient':
            addDistractor(correctDeriv.replace('/', '·'));
            addDistractor(invertSign(correctDeriv));
            addDistractor(`${wrapIfNeeded(correctDeriv)} + 1`);
            break;

        default:
            addDistractor(invertSign(correctDeriv));
            addDistractor(multiplyExpression(correctDeriv, 2));
            addDistractor(`${wrapIfNeeded(correctDeriv)} + 1`);
    }

    while (wrongAnswers.size < count) {
        const randomQ = generateRandomQuestion();
        if (randomQ.derivative !== correctDeriv) {
            wrongAnswers.add(randomQ.derivative);
        }
    }

    return Array.from(wrongAnswers).slice(0, count);
};
