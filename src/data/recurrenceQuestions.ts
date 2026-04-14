export interface RecurrenceBlank {
    id: string; // blank identifier within the line
    correctPieceId: string; // piece that must go here
}

export interface RecurrenceLine {
    id: string;
    textParts: string[]; // text divided by blanks. length is blanks.length + 1
    blanks: RecurrenceBlank[]; // blanks interleaving textParts
}

export interface RecurrencePiece {
    id: string;
    math: string; // what is rendered in the pill
}

export interface RecurrenceProof {
    id: string;
    title: string;
    integralTarget: string; // The parent integral being proved
    lines: RecurrenceLine[]; // sequential lines of the proof
    pool: RecurrencePiece[]; // options at the bottom
}

export const recurrenceQuestions: RecurrenceProof[] = [
    {
        id: 'r1',
        title: 'Fórmula de Recorrência do Seno',
        integralTarget: '\\int \\sin^n(x) dx',
        lines: [
            {
                id: 'l1',
                textParts: ['Separamos um seno: \\int \\sin^{n-1}(x)', ' dx'],
                blanks: [{ id: 'b1_1', correctPieceId: 'p_sinx' }]
            },
            {
                id: 'l2',
                textParts: ['Por integração por partes, u = \\sin^{n-1}(x) e dv = ', ''],
                blanks: [{ id: 'b2_1', correctPieceId: 'p_sinxdx' }]
            },
            {
                id: 'l3',
                textParts: ['Temos du = ', '\\sin^{n-2}(x)\\cos(x) dx e v = ', ''],
                blanks: [
                    { id: 'b3_1', correctPieceId: 'p_n_minus_1' },
                    { id: 'b3_2', correctPieceId: 'p_minus_cosx' }
                ]
            },
            {
                id: 'l4',
                textParts: ['A integral se torna: -\\sin^{n-1}(x)\\cos(x) + (n-1)\\int \\sin^{n-2}(x)', ' dx'],
                blanks: [{ id: 'b4_1', correctPieceId: 'p_cos2x' }]
            },
            {
                id: 'l5',
                textParts: ['Usando a identidade trigonométrica, trocamos \\cos^2(x) por ', ''],
                blanks: [{ id: 'b5_1', correctPieceId: 'p_1_minus_sin2x' }]
            },
            {
                id: 'l6',
                textParts: ['Resolvendo a equação para a integral original, obtemos a fórmula geral com fator ', ''],
                blanks: [{ id: 'b6_1', correctPieceId: 'p_1_over_n' }]
            }
        ],
        pool: [
            { id: 'p_sinx', math: '\\sin(x)' },
            { id: 'p_sinxdx', math: '\\sin(x)dx' },
            { id: 'p_n_minus_1', math: '(n-1)' },
            { id: 'p_n', math: 'n' },
            { id: 'p_minus_cosx', math: '-\\cos(x)' },
            { id: 'p_cosx', math: '\\cos(x)' },
            { id: 'p_cos2x', math: '\\cos^2(x)' },
            { id: 'p_1_minus_sin2x', math: '1 - \\sin^2(x)' },
            { id: 'p_1_over_n', math: '\\frac{1}{n}' },
            { id: 'p_1_plus_sin2x', math: '1 + \\sin^2(x)' }
        ]
    },
    {
        id: 'r2',
        title: 'Fórmula de Recorrência da Secante',
        integralTarget: '\\int \\sec^n(x) dx',
        lines: [
            {
                id: 'l1',
                textParts: ['Fatoramos a expressão como: \\int \\sec^{n-2}(x)', ' dx'],
                blanks: [{ id: 'b1_1', correctPieceId: 'p_sec2x' }]
            },
            {
                id: 'l2',
                textParts: ['Por partes, seja dv = \\sec^2(x) dx. Logo, v = ', ''],
                blanks: [{ id: 'b2_1', correctPieceId: 'p_tanx' }]
            },
            {
                id: 'l3',
                textParts: ['Derivamos u = \\sec^{n-2}(x) obtendo du = ', '\\sec^{n-2}(x)\\tan(x) dx'],
                blanks: [{ id: 'b3_1', correctPieceId: 'p_n_minus_2' }]
            },
            {
                id: 'l4',
                textParts: ['Ficamos com \\sec^{n-2}(x)\\tan(x) - (n-2)\\int \\sec^{n-2}(x)', ' dx'],
                blanks: [{ id: 'b4_1', correctPieceId: 'p_tan2x' }]
            },
            {
                id: 'l5',
                textParts: ['Substituímos \\tan^2(x) por ', ''],
                blanks: [{ id: 'b5_1', correctPieceId: 'p_sec2x_minus_1' }]
            }
        ],
        pool: [
            { id: 'p_secx', math: '\\sec(x)' },
            { id: 'p_sec2x', math: '\\sec^2(x)' },
            { id: 'p_tanx', math: '\\tan(x)' },
            { id: 'p_n_minus_2', math: '(n-2)' },
            { id: 'p_n_minus_1', math: '(n-1)' },
            { id: 'p_tan2x', math: '\\tan^2(x)' },
            { id: 'p_sec2x_minus_1', math: '\\sec^2(x) - 1' },
            { id: 'p_1_minus_sec2x', math: '1 - \\sec^2(x)' }
        ]
    }
];

export const getRandomRecurrenceProof = (): RecurrenceProof => {
    return recurrenceQuestions[Math.floor(Math.random() * recurrenceQuestions.length)];
};
