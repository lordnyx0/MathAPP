export interface TrigCard {
    id: string;
    label: string; // The formula identity rule name or string
    math: string; // the mathematical rendering of the card's action
}

export interface TrigSprintLevel {
    id: string;
    fallingExpression: string; // e.g. '\sin(6x)\cos(x)'
    correctCardId: string; // the id of the card that simplifies this
    options: TrigCard[]; // The 3 cards available in hand for this level
    simplifiedResult: string; // what it becomes if correct, e.g. '\frac{1}{2}(\sin(7x) + \sin(5x))'
}

export const trigSprintQuestions: TrigSprintLevel[] = [
    {
        id: 'ts1',
        fallingExpression: '\\sin(6x)\\cos(x)',
        correctCardId: 'prod_sum',
        simplifiedResult: '\\frac{1}{2}(\\sin(7x) + \\sin(5x))',
        options: [
            { id: 'arco_duplo', label: 'Arco Duplo', math: '\\sin(2a) = 2\\sin(a)\\cos(a)' },
            { id: 'fundamental', label: 'Relação Fundamental', math: '\\sin^2(x) + \\cos^2(x) = 1' },
            { id: 'prod_sum', label: 'Produto em Soma', math: '\\sin(a)\\cos(b) = \\frac{\\sin(a+b) + \\sin(a-b)}{2}' }
        ]
    },
    {
        id: 'ts2',
        fallingExpression: '\\cos^2(x)',
        correctCardId: 'arco_metade',
        simplifiedResult: '\\frac{1 + \\cos(2x)}{2}',
        options: [
            { id: 'arco_metade', label: 'Arco Metade', math: '\\cos^2(x) = \\frac{1+\\cos(2x)}{2}' },
            { id: 'fundamental', label: 'Relação Fundamental', math: '\\sin^2(x) + \\cos^2(x) = 1' },
            { id: 'tan_sec', label: 'Tangente e Secante', math: '1 + \\tan^2(x) = \\sec^2(x)' }
        ]
    },
    {
        id: 'ts3',
        fallingExpression: '\\sin^2(x) + \\cos^2(x)',
        correctCardId: 'fundamental',
        simplifiedResult: '1',
        options: [
            { id: 'arco_duplo', label: 'Arco Duplo', math: '\\sin(2a)' },
            { id: 'arco_metade', label: 'Arco Metade', math: '\\frac{1-\\cos(2x)}{2}' },
            { id: 'fundamental', label: 'R. Fundamental', math: '\\sin^2 + \\cos^2 = 1' }
        ]
    },
    {
        id: 'ts4',
        fallingExpression: '\\tan^2(x)',
        correctCardId: 'tan_sec',
        simplifiedResult: '\\sec^2(x) - 1',
        options: [
            { id: 'prod_sum', label: 'Produto em Soma', math: '\\sin(a)\\cos(b)' },
            { id: 'tan_sec', label: 'Tangente e Secante', math: '1 + \\tan^2(x) = \\sec^2(x)' },
            { id: 'arco_duplo', label: 'Arco Duplo', math: '\\cos(2a)' }
        ]
    },
    {
        id: 'ts5',
        fallingExpression: '2\\sin(3x)\\cos(3x)',
        correctCardId: 'arco_duplo',
        simplifiedResult: '\\sin(6x)',
        options: [
            { id: 'fundamental', label: 'R. Fundamental', math: '\\sin^2 + \\cos^2 = 1' },
            { id: 'tan_sec', label: 'Tg Sec', math: '1 + \\tan^2(x) = \\sec^2(x)' },
            { id: 'arco_duplo', label: 'Arco Duplo', math: '\\sin(2a) = 2\\sin(a)\\cos(a)' }
        ]
    }
];

export const getRandomTrigSprintLevel = (): TrigSprintLevel => {
    return trigSprintQuestions[Math.floor(Math.random() * trigSprintQuestions.length)];
};
