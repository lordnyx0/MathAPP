export interface SubstitutionChunk {
    id: string; // e.g., 'c1'
    text: string; // the math text for this block
    isSelectable: boolean; 
}

export interface SubstitutionQuestion {
    id: string;
    integral: string;
    chunks: SubstitutionChunk[]; // To render dynamically
    correctUId: string; // The chunk id that should be selected as U
    correctUText: string; 
    duText: string;
    remainingAfterDu: string; // What the integral becomes after canceling
    finalUIntegral: string; // The integral in terms of U
    explanation: string;
}

export const substitutionQuestions: SubstitutionQuestion[] = [
    {
        id: 's1',
        integral: '$\\int \\frac{\\sin(x)}{\\cos^5(x)} dx$',
        chunks: [
            { id: 'int', text: '∫ ', isSelectable: false },
            { id: 'num', text: 'sin(x)', isSelectable: true },
            { id: 'div', text: ' / ', isSelectable: false },
            { id: 'den', text: 'cos⁵(x)', isSelectable: true },
            { id: 'dx', text: ' dx', isSelectable: false }
        ],
        correctUId: 'den',
        correctUText: '$\\cos(x)$',
        duText: '$-\\sin(x)\\, dx$',
        remainingAfterDu: '$\\int -\\frac{1}{u^5}\\, du$',
        finalUIntegral: '$-\\int u^{-5}\\, du$',
        explanation: 'Escolhemos $u = \\cos(x)$ porque a derivada $(-\\sin(x))$ cancela perfeitamente o $\\sin(x)$ no numerador.',
    },
    {
        id: 's2',
        integral: '$\\int 2x\\, e^{x^2}\\, dx$',
        chunks: [
            { id: 'int', text: '∫ ', isSelectable: false },
            { id: 'x2', text: '2x', isSelectable: true },
            { id: 'e', text: ' · e^(', isSelectable: false },
            { id: 'pow', text: 'x²', isSelectable: true },
            { id: 'end', text: ') dx', isSelectable: false }
        ],
        correctUId: 'pow',
        correctUText: '$x^2$',
        duText: '$2x\\, dx$',
        remainingAfterDu: '$\\int e^u\\, du$',
        finalUIntegral: '$\\int e^u\\, du$',
        explanation: 'Escolhemos $u = x^2$ porque a derivada $(2x\\, dx)$ cancela o fator que multiplica a exponencial.',
    },
    {
        id: 's3',
        integral: '$\\int \\frac{\\ln(x)}{x}\\, dx$',
        chunks: [
            { id: 'int', text: '∫ ', isSelectable: false },
            { id: 'num', text: 'ln(x)', isSelectable: true },
            { id: 'div', text: ' / ', isSelectable: false },
            { id: 'den', text: 'x', isSelectable: true },
            { id: 'dx', text: ' dx', isSelectable: false }
        ],
        correctUId: 'num',
        correctUText: '$\\ln(x)$',
        duText: '$\\frac{1}{x}\\, dx$',
        remainingAfterDu: '$\\int u\\, du$',
        finalUIntegral: '$\\int u\\, du$',
        explanation: 'Escolhemos $u = \\ln(x)$ porque a derivada $\\left(\\frac{1}{x}\\right)$ cancela perfeitamente o $x$ do denominador.',
    },
    {
        id: 's4',
        integral: '$\\int x^2 \\sqrt{x^3 + 1}\\, dx$',
        chunks: [
            { id: 'int', text: '∫ ', isSelectable: false },
            { id: 'mul', text: 'x²', isSelectable: true },
            { id: 'sqrt', text: ' √( ', isSelectable: false },
            { id: 'inner', text: 'x³ + 1', isSelectable: true },
            { id: 'end', text: ' ) dx', isSelectable: false }
        ],
        correctUId: 'inner',
        correctUText: '$x^3 + 1$',
        duText: '$3x^2\\, dx$',
        remainingAfterDu: '$\\frac{1}{3} \\int \\sqrt{u}\\, du$',
        finalUIntegral: '$\\frac{1}{3} \\int u^{1/2}\\, du$',
        explanation: 'Escolhemos $u = x^3 + 1$. Como $du = 3x^2\\, dx$, o $x^2$ presente na integral cancela com o do $du$, restando apenas $\\frac{1}{3}.$',
    },
    {
        id: 's5',
        integral: '$\\int \\frac{\\cos(x)}{1 + \\sin^2(x)} dx$',
        chunks: [
            { id: 'int', text: '∫ ', isSelectable: false },
            { id: 'num', text: 'cos(x)', isSelectable: true },
            { id: 'div', text: ' / ( 1 + ', isSelectable: false },
            { id: 'den', text: 'sin(x)', isSelectable: true },
            { id: 'pow', text: '² ) dx', isSelectable: false }
        ],
        correctUId: 'den',
        correctUText: '$\\sin(x)$',
        duText: '$\\cos(x)\\, dx$',
        remainingAfterDu: '$\\int \\frac{1}{1 + u^2}\\, du$',
        finalUIntegral: '$\\int \\frac{1}{1 + u^2}\\, du$',
        explanation: 'Escolhemos $u = \\sin(x)$ pois sua derivada é exatamente $\\cos(x)\\, dx$, convertendo a integral no padrão imediato do arco tangente.',
    },
    {
        id: 's6',
        integral: '$\\int \\frac{\\sin(\\ln(x))}{x} dx$',
        chunks: [
            { id: 'int', text: '∫ ', isSelectable: false },
            { id: 'sin', text: 'sin( ', isSelectable: false },
            { id: 'ln', text: 'ln(x)', isSelectable: true },
            { id: 'div', text: ' ) / ', isSelectable: false },
            { id: 'den', text: 'x', isSelectable: true },
            { id: 'end', text: ' dx', isSelectable: false }
        ],
        correctUId: 'ln',
        correctUText: '$\\ln(x)$',
        duText: '$\\frac{1}{x}\\, dx$',
        remainingAfterDu: '$\\int \\sin(u)\\, du$',
        finalUIntegral: '$\\int \\sin(u)\\, du$',
        explanation: 'Escolhemos $u = \\ln(x)$ pois sua derivada $\\frac{1}{x}\\, dx$ cancela perfeitamente o $x$ divisor do denominador.',
    }
];

export const getRandomSubstitutionQuestion = (): SubstitutionQuestion => {
    return substitutionQuestions[Math.floor(Math.random() * substitutionQuestions.length)];
};
