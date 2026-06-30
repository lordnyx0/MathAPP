export interface SymmetryQuestion {
    id: string;
    integral: string;
    functionText: string;
    intervalText: string;
    correctAnswer: 'zero' | 'double' | 'neither';
    explanation: string;
}

export const symmetryQuestions: SymmetryQuestion[] = [
    {
        id: 'sym-q1',
        integral: '\\int_{-2}^{2} x^3 \\, dx',
        functionText: 'f(x) = x^3',
        intervalText: '[-2, 2]',
        correctAnswer: 'zero',
        explanation: 'A função f(x) = x³ é ímpar porque f(-x) = -f(x). Como o intervalo é simétrico, a integral é zero.'
    },
    {
        id: 'sym-q2',
        integral: '\\int_{-3}^{3} x^2 \\, dx',
        functionText: 'f(x) = x^2',
        intervalText: '[-3, 3]',
        correctAnswer: 'double',
        explanation: 'A função f(x) = x² é par porque f(-x) = f(x). Como o intervalo é simétrico, a integral é o dobro da integral de 0 a 3.'
    },
    {
        id: 'sym-q3',
        integral: '\\int_{-\\pi}^{\\pi} \\sin(x) \\, dx',
        functionText: 'f(x) = \\sin(x)',
        intervalText: '[-\\pi, \\pi]',
        correctAnswer: 'zero',
        explanation: 'A função f(x) = sin(x) é ímpar pois \\sin(-x) = -\\sin(x). Em um intervalo simétrico, sua integral é zero.'
    },
    {
        id: 'sym-q4',
        integral: '\\int_{-\\pi/2}^{\\pi/2} \\cos(x) \\, dx',
        functionText: 'f(x) = \\cos(x)',
        intervalText: '[-\\pi/2, \\pi/2]',
        correctAnswer: 'double',
        explanation: 'A função f(x) = cos(x) é par pois \\cos(-x) = \\cos(x). Em um intervalo simétrico, sua integral é o dobro da integral de 0 a \\pi/2.'
    },
    {
        id: 'sym-q5',
        integral: '\\int_{-1}^{1} x^5 \\cos(x) \\, dx',
        functionText: 'f(x) = x^5 \\cos(x)',
        intervalText: '[-1, 1]',
        correctAnswer: 'zero',
        explanation: 'O integrando é o produto de uma função ímpar (x⁵) e uma par (cos(x)). Ímpar × Par = Ímpar, logo a integral em [-1, 1] é zero.'
    },
    {
        id: 'sym-q6',
        integral: '\\int_{-2}^{2} x^2 \\sin(x) \\, dx',
        functionText: 'f(x) = x^2 \\sin(x)',
        intervalText: '[-2, 2]',
        correctAnswer: 'zero',
        explanation: 'O integrando é o produto de uma função par (x²) e uma ímpar (sin(x)). Par × Ímpar = Ímpar, logo a integral em [-2, 2] é zero.'
    },
    {
        id: 'sym-q7',
        integral: '\\int_{-1}^{1} (x^3 - x) \\, dx',
        functionText: 'f(x) = x^3 - x',
        intervalText: '[-1, 1]',
        correctAnswer: 'zero',
        explanation: 'Tanto x³ quanto x são ímpares, logo a soma de duas funções ímpares é ímpar, resultando em integral nula.'
    },
    {
        id: 'sym-q8',
        integral: '\\int_{-2}^{2} (x^2 + 4) \\, dx',
        functionText: 'f(x) = x^2 + 4',
        intervalText: '[-2, 2]',
        correctAnswer: 'double',
        explanation: 'Tanto x² quanto a constante 4 são funções pares. A soma de funções pares é par, logo a integral é o dobro de 0 a 2.'
    },
    {
        id: 'sym-q9',
        integral: '\\int_{-1}^{1} e^{x^2} \\sin(x) \\, dx',
        functionText: 'f(x) = e^{x^2} \\sin(x)',
        intervalText: '[-1, 1]',
        correctAnswer: 'zero',
        explanation: 'e^{x²} é par e sin(x) é ímpar. O produto é uma função ímpar, logo a integral em [-1, 1] é zero.'
    },
    {
        id: 'sym-q10',
        integral: '\\int_{-\\pi}^{\\pi} x^4 \\sin(x) \\, dx',
        functionText: 'f(x) = x^4 \\sin(x)',
        intervalText: '[-\\pi, \\pi]',
        correctAnswer: 'zero',
        explanation: 'x⁴ é par e sin(x) é ímpar. O produto é ímpar, resultando em integral nula no intervalo simétrico.'
    },
    {
        id: 'sym-q11',
        integral: '\\int_{-1}^{1} \\frac{\\sin(x)}{x^2 + 1} \\, dx',
        functionText: 'f(x) = \\frac{\\sin(x)}{x^2 + 1}',
        intervalText: '[-1, 1]',
        correctAnswer: 'zero',
        explanation: 'O numerador é ímpar e o denominador é par. Ímpar dividido por par é ímpar, portanto a integral é zero.'
    },
    {
        id: 'sym-q12',
        integral: '\\int_{-2}^{2} x^2 \\cos(x) \\, dx',
        functionText: 'f(x) = x^2 \\cos(x)',
        intervalText: '[-2, 2]',
        correctAnswer: 'double',
        explanation: 'Tanto x² quanto cos(x) são funções pares. O produto Par × Par é par, logo a integral é o dobro da integral de 0 a 2.'
    },
    {
        id: 'sym-q13',
        integral: '\\int_{-1}^{1} (x^3 + x^2) \\, dx',
        functionText: 'f(x) = x^3 + x^2',
        intervalText: '[-1, 1]',
        correctAnswer: 'neither',
        explanation: 'Temos uma soma de termo ímpar (x³) com termo par (x²). A função resultante não tem paridade definida (não é par nem ímpar).'
    },
    {
        id: 'sym-q14',
        integral: '\\int_{0}^{2} x^3 \\, dx',
        functionText: 'f(x) = x^3',
        intervalText: '[0, 2]',
        correctAnswer: 'neither',
        explanation: 'Atenção! Embora x³ seja uma função ímpar, o intervalo de integração [0, 2] não é simétrico. Portanto, a integral não é nula.'
    },
    {
        id: 'sym-q15',
        integral: '\\int_{-1}^{2} x^3 \\, dx',
        functionText: 'f(x) = x^3',
        intervalText: '[-1, 2]',
        correctAnswer: 'neither',
        explanation: 'Embora x³ seja ímpar, o intervalo [-1, 2] não é simétrico em relação à origem. A propriedade de simetria não se aplica.'
    },
    {
        id: 'sym-q16',
        integral: '\\int_{-\\pi/4}^{\\pi/4} \\tan(x) \\, dx',
        functionText: 'f(x) = \\tan(x)',
        intervalText: '[-\\pi/4, \\pi/4]',
        correctAnswer: 'zero',
        explanation: 'A função tangente é ímpar (\\tan(-x) = -\\tan(x)). Como o intervalo é simétrico, a integral é zero.'
    },
    {
        id: 'sym-q17',
        integral: '\\int_{-5}^{5} |x| \\, dx',
        functionText: 'f(x) = |x|',
        intervalText: '[-5, 5]',
        correctAnswer: 'double',
        explanation: 'A função valor absoluto é par, pois |-x| = |x|. Logo, a integral em [-5, 5] é o dobro de 0 a 5.'
    },
    {
        id: 'sym-q18',
        integral: '\\int_{-\\pi}^{\\pi} \\cos^2(x) \\, dx',
        functionText: 'f(x) = \\cos^2(x)',
        intervalText: '[-\\pi, \\pi]',
        correctAnswer: 'double',
        explanation: 'Como cos(x) é par, cos²(x) também é par. A integral em um intervalo simétrico equivale ao dobro da integral de 0 a \\pi.'
    },
    {
        id: 'sym-q19',
        integral: '\\int_{-1}^{1} x |x| \\, dx',
        functionText: 'f(x) = x |x|',
        intervalText: '[-1, 1]',
        correctAnswer: 'zero',
        explanation: 'x é ímpar e |x| é par. O produto é uma função ímpar, portanto a integral no intervalo simétrico [-1, 1] é zero.'
    },
    {
        id: 'sym-q20',
        integral: '\\int_{-2}^{2} \\frac{x^3}{x^4 + 1} \\, dx',
        functionText: 'f(x) = \\frac{x^3}{x^4 + 1}',
        intervalText: '[-2, 2]',
        correctAnswer: 'zero',
        explanation: 'O numerador x³ é ímpar e o denominador x⁴ + 1 é par. A fração é ímpar, logo a integral em [-2, 2] é zero.'
    }
];

export const getRandomSymmetryQuestion = (excludeList: SymmetryQuestion[] = []): SymmetryQuestion => {
    const excludeIds = new Set(excludeList.map(ex => ex.id));
    const available = symmetryQuestions.filter(q => !excludeIds.has(q.id));
    const list = available.length > 0 ? available : symmetryQuestions;
    return list[Math.floor(Math.random() * list.length)];
};
