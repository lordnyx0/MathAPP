export type LiateCategory = 'l' | 'i' | 'a' | 't' | 'e';

export interface LiateQuestion {
    id: string;
    integral: string;
    parts: string[]; // Options to pick from
    correctU: string[]; // What needs to go in U box
    correctDv: string[]; // What needs to go in dV box
    uCategory: LiateCategory;
    dvCategory: LiateCategory;
    du: string;
    v: string;
    explanation: string;
}

export const liateQuestions: LiateQuestion[] = [
    {
        id: 'q1',
        integral: '$\\int x e^x dx$',
        parts: ['$x$', '$e^x$', '$dx$'],
        correctU: ['$x$'],
        correctDv: ['$e^x$', '$dx$'],
        uCategory: 'a',
        dvCategory: 'e',
        du: '$dx$',
        v: '$e^x$',
        explanation: 'LIATE: Algébrica (x) precede Exponencial (e^x). Escolhemos u = x.',
    },
    {
        id: 'q2',
        integral: '$\\int x \\ln(x) dx$',
        parts: ['$x$', '$\\ln(x)$', '$dx$'],
        correctU: ['$\\ln(x)$'],
        correctDv: ['$x$', '$dx$'],
        uCategory: 'l',
        dvCategory: 'a',
        du: '$\\frac{1}{x} dx$',
        v: '$\\frac{x^2}{2}$',
        explanation: 'LIATE: Logarítmica (ln(x)) precede Algébrica (x). Escolhemos u = ln(x).',
    },
    {
        id: 'q3',
        integral: '$\\int x^2 \\sin(x) dx$',
        parts: ['$x^2$', '$\\sin(x)$', '$dx$'],
        correctU: ['$x^2$'],
        correctDv: ['$\\sin(x)$', '$dx$'],
        uCategory: 'a',
        dvCategory: 't',
        du: '$2x dx$',
        v: '$-\\cos(x)$',
        explanation: 'LIATE: Algébrica (x^2) precede Trigonométrica (sin(x)). Escolhemos u = x^2.',
    },
    {
        id: 'q4',
        integral: '$\\int e^{3x} \\cos(3x) dx$',
        parts: ['$e^{3x}$', '$\\cos(3x)$', '$dx$'],
        correctU: ['$\\cos(3x)$'],
        correctDv: ['$e^{3x}$', '$dx$'],
        uCategory: 't',
        dvCategory: 'e',
        du: '$-3\\sin(3x) dx$',
        v: '$\\frac{1}{3}e^{3x}$',
        explanation: 'LIATE: Trigonométrica (cos(3x)) precede Exponencial (e^{3x}).',
    },
    {
        id: 'q5',
        integral: '$\\int \\arctan(x) dx$',
        parts: ['$\\arctan(x)$', '$1$', '$dx$'],
        correctU: ['$\\arctan(x)$'],
        correctDv: ['$1$', '$dx$'],
        uCategory: 'i',
        dvCategory: 'a',
        du: '$\\frac{1}{1+x^2} dx$',
        v: '$x$',
        explanation: 'LIATE: Inversa Trigonométrica. O termo "dx" é considerado com coeficiente 1 (Algébrica constante).',
    },
    {
        id: 'q6',
        integral: '$\\int x \\cos(x) dx$',
        parts: ['$x$', '$\\cos(x)$', '$dx$'],
        correctU: ['$x$'],
        correctDv: ['$\\cos(x)$', '$dx$'],
        uCategory: 'a',
        dvCategory: 't',
        du: '$dx$',
        v: '$\\sin(x)$',
        explanation: 'LIATE: Algébrica (x) precede Trigonométrica (cos(x)). Escolhemos u = x.',
    },
    {
        id: 'q7',
        integral: '$\\int e^x \\sin(x) dx$',
        parts: ['$e^x$', '$\\sin(x)$', '$dx$'],
        correctU: ['$\\sin(x)$'],
        correctDv: ['$e^x$', '$dx$'],
        uCategory: 't',
        dvCategory: 'e',
        du: '$\\cos(x) dx$',
        v: '$e^x$',
        explanation: 'LIATE: Trigonométrica (sin(x)) vem antes de Exponencial (e^x). Escolhemos u = sin(x).',
    },
    {
        id: 'q8',
        integral: '$\\int x^2 e^{2x} dx$',
        parts: ['$x^2$', '$e^{2x}$', '$dx$'],
        correctU: ['$x^2$'],
        correctDv: ['$e^{2x}$', '$dx$'],
        uCategory: 'a',
        dvCategory: 'e',
        du: '$2x dx$',
        v: '$\\frac{1}{2}e^{2x}$',
        explanation: 'LIATE: Algébrica (x^2) precede Exponencial (e^{2x}). Escolhemos u = x^2.',
    },
    {
        id: 'q9',
        integral: '$\\int x \\sec^2(x) dx$',
        parts: ['$x$', '$\\sec^2(x)$', '$dx$'],
        correctU: ['$x$'],
        correctDv: ['$\\sec^2(x)$', '$dx$'],
        uCategory: 'a',
        dvCategory: 't',
        du: '$dx$',
        v: '$\\tan(x)$',
        explanation: 'LIATE: Algébrica (x) precede Trigonométrica (sec^2(x)). Escolhemos u = x.',
    },
    {
        id: 'q10',
        integral: '$\\int \\ln^2(x) dx$',
        parts: ['$\\ln^2(x)$', '$1$', '$dx$'],
        correctU: ['$\\ln^2(x)$'],
        correctDv: ['$1$', '$dx$'],
        uCategory: 'l',
        dvCategory: 'a',
        du: '$\\frac{2\\ln(x)}{x} dx$',
        v: '$x$',
        explanation: 'LIATE: Logarítmica (ln^2(x)) precede Algébrica constante (1). Escolhemos u = ln^2(x).',
    },
    {
        id: 'q11',
        integral: '$\\int \\arcsin(x) dx$',
        parts: ['$\\arcsin(x)$', '$1$', '$dx$'],
        correctU: ['$\\arcsin(x)$'],
        correctDv: ['$1$', '$dx$'],
        uCategory: 'i',
        dvCategory: 'a',
        du: '$\\frac{1}{\\sqrt{1-x^2}} dx$',
        v: '$x$',
        explanation: 'LIATE: Inversa Trigonométrica (arcsin(x)) precede Algébrica constante (1). Escolhemos u = arcsin(x).',
    },
    {
        id: 'q12',
        integral: '$\\int x^3 \\ln(x) dx$',
        parts: ['$x^3$', '$\\ln(x)$', '$dx$'],
        correctU: ['$\\ln(x)$'],
        correctDv: ['$x^3$', '$dx$'],
        uCategory: 'l',
        dvCategory: 'a',
        du: '$\\frac{1}{x} dx$',
        v: '$\\frac{x^4}{4}$',
        explanation: 'LIATE: Logarítmica (ln(x)) precede Algébrica (x^3). Escolhemos u = ln(x).',
    }
];

export const getRandomLiateQuestion = (): LiateQuestion => {
    return liateQuestions[Math.floor(Math.random() * liateQuestions.length)];
};
