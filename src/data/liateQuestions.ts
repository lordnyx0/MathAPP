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
    }
];

export const getRandomLiateQuestion = (): LiateQuestion => {
    return liateQuestions[Math.floor(Math.random() * liateQuestions.length)];
};
