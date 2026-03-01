/**
 * Procedural Integral Generator (Primitives)
 * 
 * Generates integral questions focused on primitive functions
 * and basic integration rules.
 */

import { IntegralQuestion, IntegralRuleType, DifficultyLevel } from './integralQuestions';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

const toSuperscript = (n: number): string => {
    const superscripts: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '-': '⁻',
    };
    return String(n).split('').map(c => superscripts[c] || c).join('');
};

/**
 * Format math expression for display
 */
const formatTerm = (coeff: number | string, varPart: string): string => {
    if (coeff === 1 || coeff === '1') return varPart;
    if (coeff === -1 || coeff === '-1') return `-${varPart}`;
    return `${coeff}${varPart}`;
};

// ============================================================
// QUESTION GENERATORS BY RULE TYPE
// ============================================================

let questionCounter = 0;
const generateId = (prefix: string) => `${prefix}_gen_${++questionCounter}`;

/**
 * Constant Rule: ∫ a dx = ax + C
 */
export const generateConstantQuestion = (): IntegralQuestion => {
    const a = randomInt(2, 20);
    const isNegative = Math.random() > 0.5;
    const val = isNegative ? -a : a;

    return {
        id: generateId('const'),
        function: String(val),
        integral: `${formatTerm(val, 'x')} + C`,
        rule: 'constant',
        difficulty: 'basico',
        explanation: 'A integral de uma constante "a" é "ax + C".',
    };
};

/**
 * Power Rule: ∫ x^n dx = (x^{n+1})/(n+1) + C
 */
export const generatePowerQuestion = (): IntegralQuestion => {
    const n = randomInt(1, 6);

    let funcDisplay = n === 1 ? 'x' : `x${toSuperscript(n)}`;

    // Sometimes add a coefficient that cancels out nicely
    const hasCoeff = Math.random() > 0.5;
    const a = hasCoeff ? (n + 1) * randomInt(1, 3) : 1;

    if (hasCoeff) {
        funcDisplay = `${a}${funcDisplay}`;
    }

    const newExp = n + 1;
    let integralDisplay: string;

    if (hasCoeff) {
        const resultCoeff = a / newExp;
        integralDisplay = `${formatTerm(resultCoeff, `x${toSuperscript(newExp)}`)} + C`;
    } else {
        integralDisplay = `(x${toSuperscript(newExp)})/${newExp} + C`;
        if (newExp === 2) integralDisplay = `x²/2 + C`;
    }

    return {
        id: generateId('pow'),
        function: funcDisplay,
        integral: integralDisplay,
        rule: 'power',
        difficulty: 'basico',
        explanation: 'Soma 1 ao expoente e divide pelo novo expoente.',
    };
};

/**
 * 1/x Rule: ∫ 1/x dx = ln|x| + C
 */
export const generateInverseQuestion = (): IntegralQuestion => {
    const hasCoeff = Math.random() > 0.4;
    const a = hasCoeff ? randomInt(2, 7) : 1;

    const funcDisplay = a === 1 ? '1/x' : `${a}/x`;
    const integralDisplay = a === 1 ? 'ln|x| + C' : `${a}ln|x| + C`;

    return {
        id: generateId('inv'),
        function: funcDisplay,
        integral: integralDisplay,
        rule: 'inverse',
        difficulty: 'basico',
        explanation: 'A integral de 1/x é ln|x| + C.',
    };
};

/**
 * Exponential: ∫ e^x dx = e^x + C
 */
export const generateExpQuestion = (): IntegralQuestion => {
    const hasCoeff = Math.random() > 0.5;
    const a = hasCoeff ? randomInt(2, 9) : 1;

    const funcDisplay = a === 1 ? 'eˣ' : `${a}eˣ`;
    const integralDisplay = a === 1 ? 'eˣ + C' : `${a}eˣ + C`;

    return {
        id: generateId('exp'),
        function: funcDisplay,
        integral: integralDisplay,
        rule: 'exp',
        difficulty: 'intermediario',
        explanation: 'A integral de eˣ é eˣ + C.',
    };
};

/**
 * Sine Rule: ∫ sin(x) dx = -cos(x) + C
 */
export const generateSinQuestion = (): IntegralQuestion => {
    const hasCoeff = Math.random() > 0.4;
    const a = hasCoeff ? randomInt(2, 5) : 1;

    const funcDisplay = a === 1 ? 'sin(x)' : `${a}sin(x)`;
    const integralDisplay = a === 1 ? '-cos(x) + C' : `-${a}cos(x) + C`;

    return {
        id: generateId('sin'),
        function: funcDisplay,
        integral: integralDisplay,
        rule: 'sin',
        difficulty: 'intermediario',
        explanation: 'A integral do seno é -cosseno. Lembre do sinal negativo!',
    };
};

/**
 * Cosine Rule: ∫ cos(x) dx = sin(x) + C
 */
export const generateCosQuestion = (): IntegralQuestion => {
    const hasCoeff = Math.random() > 0.4;
    const a = hasCoeff ? randomInt(2, 5) : 1;

    const funcDisplay = a === 1 ? 'cos(x)' : `${a}cos(x)`;
    const integralDisplay = a === 1 ? 'sin(x) + C' : `${a}sin(x) + C`;

    return {
        id: generateId('cos'),
        function: funcDisplay,
        integral: integralDisplay,
        rule: 'cos',
        difficulty: 'intermediario',
        explanation: 'A integral de cos(x) é sin(x) + C.',
    };
};

// ============================================================
// MAIN GENERATOR API
// ============================================================

type GeneratorFunction = () => IntegralQuestion;

const generatorsByRule: Record<IntegralRuleType, GeneratorFunction> = {
    constant: generateConstantQuestion,
    power: generatePowerQuestion,
    inverse: generateInverseQuestion,
    exp: generateExpQuestion,
    sin: generateSinQuestion,
    cos: generateCosQuestion,
};

const generatorsByDifficulty: Record<DifficultyLevel, IntegralRuleType[]> = {
    basico: ['constant', 'power', 'inverse'],
    intermediario: ['exp', 'sin', 'cos'],
    avancado: ['exp', 'sin', 'cos', 'power'], // Reusing for now as we only have primitives
};

export const generateRandomQuestion = (
    difficulty?: DifficultyLevel,
    rule?: IntegralRuleType
): IntegralQuestion => {
    if (rule) {
        return generatorsByRule[rule]();
    }

    if (difficulty) {
        const rules = generatorsByDifficulty[difficulty];
        const selectedRule = randomChoice(rules);
        return generatorsByRule[selectedRule]();
    }

    const allRules: IntegralRuleType[] = [
        ...generatorsByDifficulty.basico,
        ...generatorsByDifficulty.intermediario,
    ];
    const selectedRule = randomChoice(allRules);
    return generatorsByRule[selectedRule]();
};


const stripConstantTerm = (expr: string): string => expr.replace(/\s*\+\s*C\s*$/, '');

const flipLeadingSign = (expr: string): string => {
    if (expr.startsWith('-')) return expr.slice(1);
    return `-${expr}`;
};

const withConstant = (expr: string): string => `${stripConstantTerm(expr)} + C`;

export const generateWrongAnswers = (
    correct: IntegralQuestion,
    count: number = 3
): string[] => {
    const wrongAnswers: Set<string> = new Set();
    const correctIntegral = correct.integral;

    const addDistractor = (distractor: string) => {
        const cleaned = distractor.trim();
        if (cleaned && cleaned !== correctIntegral) {
            wrongAnswers.add(cleaned);
        }
    };

    switch (correct.rule) {
        case 'constant':
            addDistractor(withConstant(flipLeadingSign(correctIntegral)));
            addDistractor(withConstant('x'));
            addDistractor(stripConstantTerm(correctIntegral));
            break;

        case 'power':
            // Typical errors: forget divide-by-new-exponent, sign flip, omit integration constant
            addDistractor(stripConstantTerm(correctIntegral));
            addDistractor(withConstant(flipLeadingSign(correctIntegral)));
            addDistractor(withConstant(stripConstantTerm(correctIntegral).replace(/\/(\d+)/, '/1')));
            break;

        case 'sin':
            addDistractor(withConstant(correctIntegral.replace('-cos', 'cos')));
            addDistractor(withConstant(correctIntegral.replace('-cos', 'sin')));
            addDistractor(stripConstantTerm(correctIntegral));
            break;

        case 'cos':
            addDistractor(withConstant(correctIntegral.replace('sin', '-sin')));
            addDistractor(withConstant(correctIntegral.replace('sin', '-cos')));
            addDistractor(stripConstantTerm(correctIntegral));
            break;

        case 'inverse':
            addDistractor('1/x² + C');
            addDistractor('x + C');
            addDistractor('ln|x|');
            break;

        case 'exp':
            addDistractor('xeˣ + C');
            addDistractor(withConstant(flipLeadingSign(correctIntegral)));
            addDistractor(stripConstantTerm(correctIntegral));
            break;

        default:
            addDistractor(stripConstantTerm(correctIntegral));
            addDistractor(withConstant(flipLeadingSign(correctIntegral)));
            addDistractor(withConstant('0'));
    }

    while (wrongAnswers.size < count) {
        const randomQ = generateRandomQuestion();
        if (randomQ.integral !== correctIntegral) {
            wrongAnswers.add(randomQ.integral);
        }
    }

    return Array.from(wrongAnswers).slice(0, count);
};
