export interface PartialFractionsQuestion {
    id: string;
    expressionText: string;        // e.g. "\\frac{2x}{x^2 - 5x + 6}"
    denominatorFactored: string;   // e.g. "(x-2)(x-3)"
    templateOptions: string[];     // choices of decomposition templates
    correctTemplate: string;       // e.g. "\\frac{A}{x-2} + \\frac{B}{x-3}"
    coeffRootsText: string;        // e.g. "x = 2 e x = 3"
    correctCoeffs: { A: string; B: string };
    coeffOptionsA: string[];
    coeffOptionsB: string[];
    integralOptions: string[];
    correctIntegral: string;
    explanation: string;
}

export const partialFractionsQuestions: PartialFractionsQuestion[] = [
    {
        id: 'frac-q1',
        expressionText: '\\frac{2x}{x^2 - 5x + 6}',
        denominatorFactored: '(x-2)(x-3)',
        templateOptions: [
            '\\frac{A}{x-2} + \\frac{B}{x-3}',
            '\\frac{A}{x-2} + \\frac{Bx + C}{x-3}',
            '\\frac{A}{(x-2)^2} + \\frac{B}{x-3}',
            '\\frac{A}{x-2} + \\frac{B}{(x-3)^2}'
        ],
        correctTemplate: '\\frac{A}{x-2} + \\frac{B}{x-3}',
        coeffRootsText: 'x = 2 e x = 3',
        correctCoeffs: { A: '-4', B: '6' },
        coeffOptionsA: ['-4', '4', '-2', '2'],
        coeffOptionsB: ['6', '-6', '3', '-3'],
        integralOptions: [
            '6\\ln|x-3| - 4\\ln|x-2| + C',
            '-4\\ln|x-3| + 6\\ln|x-2| + C',
            '2\\ln|x-2| - 3\\ln|x-3| + C',
            '6\\ln|x-2| - 4\\ln|x-3| + C'
        ],
        correctIntegral: '6\\ln|x-3| - 4\\ln|x-2| + C',
        explanation: 'Fatorando o denominador temos $x^2-5x+6 = (x-2)(x-3)$. A decomposição é $\\frac{2x}{(x-2)(x-3)} = \\frac{A}{x-2} + \\frac{B}{x-3}$. Multiplicando pelo denominador comum: $2x = A(x-3) + B(x-2)$. Avaliando em $x=2 \\implies 4 = -A \\implies A = -4$. Avaliando em $x=3 \\implies 6 = B$. Integrando: $-4\\ln|x-2| + 6\\ln|x-3| + C$.'
    },
    {
        id: 'frac-q2',
        expressionText: '\\frac{5x + 3}{x^2 - 3x + 2}',
        denominatorFactored: '(x-1)(x-2)',
        templateOptions: [
            '\\frac{A}{x-1} + \\frac{B}{x-2}',
            '\\frac{A}{x-1} + \\frac{Bx + C}{x-2}',
            '\\frac{A}{x-1} + \\frac{B}{(x-2)^2}',
            '\\frac{A}{(x-1)^2} + \\frac{B}{x-2}'
        ],
        correctTemplate: '\\frac{A}{x-1} + \\frac{B}{x-2}',
        coeffRootsText: 'x = 1 e x = 2',
        correctCoeffs: { A: '-8', B: '13' },
        coeffOptionsA: ['-8', '8', '-5', '5'],
        coeffOptionsB: ['13', '-13', '10', '-10'],
        integralOptions: [
            '13\\ln|x-2| - 8\\ln|x-1| + C',
            '-8\\ln|x-2| + 13\\ln|x-1| + C',
            '13\\ln|x-1| - 8\\ln|x-2| + C',
            '8\\ln|x-1| + 13\\ln|x-2| + C'
        ],
        correctIntegral: '13\\ln|x-2| - 8\\ln|x-1| + C',
        explanation: 'Fatorando o denominador temos $x^2-3x+2 = (x-1)(x-2)$. A decomposição é $\\frac{5x+3}{(x-1)(x-2)} = \\frac{A}{x-1} + \\frac{B}{x-2}$. Multiplicando pelo denominador comum: $5x+3 = A(x-2) + B(x-1)$. Avaliando em $x=1 \\implies 8 = -A \\implies A = -8$. Avaliando em $x=2 \\implies 13 = B$. Integrando: $-8\\ln|x-1| + 13\\ln|x-2| + C$.'
    },
    {
        id: 'frac-q3',
        expressionText: '\\frac{1}{x^2 - 4}',
        denominatorFactored: '(x-2)(x+2)',
        templateOptions: [
            '\\frac{A}{x-2} + \\frac{B}{x+2}',
            '\\frac{A}{x-2} + \\frac{B}{(x-2)^2}',
            '\\frac{A}{x-2} + \\frac{Bx + C}{x+2}',
            '\\frac{A}{(x-2)^2} + \\frac{B}{x+2}'
        ],
        correctTemplate: '\\frac{A}{x-2} + \\frac{B}{x+2}',
        coeffRootsText: 'x = 2 e x = -2',
        correctCoeffs: { A: '1/4', B: '-1/4' },
        coeffOptionsA: ['1/4', '-1/4', '1/2', '-1/2'],
        coeffOptionsB: ['-1/4', '1/4', '-1/2', '1/2'],
        integralOptions: [
            '\\frac{1}{4}\\ln|x-2| - \\frac{1}{4}\\ln|x+2| + C',
            '\\frac{1}{4}\\ln|x+2| - \\frac{1}{4}\\ln|x-2| + C',
            '\\frac{1}{2}\\ln|x-2| - \\frac{1}{2}\\ln|x+2| + C',
            '\\ln|x-2| - \\ln|x+2| + C'
        ],
        correctIntegral: '\\frac{1}{4}\\ln|x-2| - \\frac{1}{4}\\ln|x+2| + C',
        explanation: 'Fatorando o denominador temos $x^2-4 = (x-2)(x+2)$. A decomposição é $\\frac{1}{(x-2)(x+2)} = \\frac{A}{x-2} + \\frac{B}{x+2}$. Multiplicando pelo denominador comum: $1 = A(x+2) + B(x-2)$. Avaliando em $x=2 \\implies 1 = 4A \\implies A = 1/4$. Avaliando em $x=-2 \\implies 1 = -4B \\implies B = -1/4$. Integrando: $\\frac{1}{4}\\ln|x-2| - \\frac{1}{4}\\ln|x+2| + C$.'
    },
    {
        id: 'frac-q4',
        expressionText: '\\frac{3x - 1}{x^2 - 1}',
        denominatorFactored: '(x-1)(x+1)',
        templateOptions: [
            '\\frac{A}{x-1} + \\frac{B}{x+1}',
            '\\frac{A}{x-1} + \\frac{B}{(x-1)^2}',
            '\\frac{A}{x-1} + \\frac{Bx + C}{x+1}',
            '\\frac{A}{(x-1)^2} + \\frac{B}{x+1}'
        ],
        correctTemplate: '\\frac{A}{x-1} + \\frac{B}{x+1}',
        coeffRootsText: 'x = 1 e x = -1',
        correctCoeffs: { A: '1', B: '2' },
        coeffOptionsA: ['1', '-1', '2', '-2'],
        coeffOptionsB: ['2', '-2', '1', '-1'],
        integralOptions: [
            '\\ln|x-1| + 2\\ln|x+1| + C',
            '2\\ln|x-1| + \\ln|x+1| + C',
            '\\ln|x-1| - 2\\ln|x+1| + C',
            '2\\ln|x-1| - \\ln|x+1| + C'
        ],
        correctIntegral: '\\ln|x-1| + 2\\ln|x+1| + C',
        explanation: 'Fatorando o denominador temos $x^2-1 = (x-1)(x+1)$. A decomposição é $\\frac{3x-1}{(x-1)(x+1)} = \\frac{A}{x-1} + \\frac{B}{x+1}$. Multiplicando pelo denominador comum: $3x-1 = A(x+1) + B(x-1)$. Avaliando em $x=1 \\implies 2 = 2A \\implies A = 1$. Avaliando em $x=-1 \\implies -4 = -2B \\implies B = 2$. Integrando: $\\ln|x-1| + 2\\ln|x+1| + C$.'
    }
];

export const getRandomPartialFractionsQuestion = (excludeList: PartialFractionsQuestion[] = []): PartialFractionsQuestion => {
    const available = partialFractionsQuestions.filter(q => !excludeList.some(e => e.id === q.id));
    const list = available.length > 0 ? available : partialFractionsQuestions;
    return list[Math.floor(Math.random() * list.length)];
};
