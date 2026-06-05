import { GraphPoint } from './functionQuestions';

export interface TVMLevel {
    id: string;
    title: string;
    description: string;
    functionEquation: string; // e.g. 'f(x) = \\sqrt{x}'
    derivativeEquation: string;
    a: number;
    b: number;
    expectedC: number;
    points: GraphPoint[]; // Points to draw the curve
    graphDomain: [number, number];
    graphImage: [number, number];
    // Evaluate functions
    f: (x: number) => number;
    df: (x: number) => number;
}

export const tvmQuestions: TVMLevel[] = [
    {
        id: 'tvm1',
        title: 'Estimar \\sqrt{x}',
        description: 'Usando o TVM na função f(x) = \\sqrt{x} no intervalo [0, 4].',
        functionEquation: 'f(x) = \\sqrt{x}',
        derivativeEquation: 'f\\\'(x) = \\frac{1}{2\\sqrt{x}}',
        a: 0,
        b: 4,
        expectedC: 1, // slope = (2-0)/4 = 0.5. 1/(2sqrt(c)) = 0.5 => sqrt(c) = 1 => c = 1
        graphDomain: [-1, 5],
        graphImage: [-1, 3],
        f: (x) => Math.sqrt(x),
        df: (x) => 1 / (2 * Math.sqrt(x)),
        points: Array.from({ length: 50 }).map((_, i) => {
            const x = i * 0.1;
            return { x, y: Math.sqrt(x) };
        }),
    },
    {
        id: 'tvm2',
        title: 'Parábola Padrão',
        description: 'Encontre o ponto c garantido pelo Teorema de Rolle/TVM para f(x) = x^2 - 4x.',
        functionEquation: 'f(x) = x^2 - 4x',
        derivativeEquation: 'f\\\'(x) = 2x - 4',
        a: 0,
        b: 4,
        expectedC: 2, // Rolle, slope = 0 => 2c-4=0 => c=2
        graphDomain: [-1, 5],
        graphImage: [-5, 5],
        f: (x) => x*x - 4*x,
        df: (x) => 2*x - 4,
        points: Array.from({ length: 60 }).map((_, i) => {
            const x = -1 + i * 0.1;
            return { x, y: x*x - 4*x };
        }),
    },
    {
        id: 'tvm3',
        title: 'Função Cúbica',
        description: 'TVM para f(x) = x^3 - x no intervalo [0, 2].',
        functionEquation: 'f(x) = x^3 - x',
        derivativeEquation: 'f\\\'(x) = 3x^2 - 1',
        a: 0,
        b: 2,
        expectedC: Math.sqrt(4/3), // f(2)=6, f(0)=0. slope=3. 3c^2-1=3 => 3c^2=4 => c=sqrt(4/3) ~ 1.15
        graphDomain: [-1, 3],
        graphImage: [-2, 8],
        f: (x) => x*x*x - x,
        df: (x) => 3*x*x - 1,
        points: Array.from({ length: 40 }).map((_, i) => {
            const x = -1 + i * 0.1;
            return { x, y: x*x*x - x };
        }),
    },
    {
        id: 'tvm4',
        title: 'Tangente Cubica',
        description: 'Sintonize a reta tangente de f(x) = x^3 - 3x + 2 no intervalo [0, 2] para achar c.',
        functionEquation: 'f(x) = x^3 - 3x + 2',
        derivativeEquation: 'f\\\'(x) = 3x^2 - 3',
        a: 0,
        b: 2,
        expectedC: 2 / Math.sqrt(3), // slope = (4-2)/2 = 1. 3c^2-3=1 => 3c^2=4 => c=sqrt(4/3) ~ 1.15
        graphDomain: [-0.5, 2.5],
        graphImage: [-1, 6],
        f: (x) => x*x*x - 3*x + 2,
        df: (x) => 3*x*x - 3,
        points: Array.from({ length: 40 }).map((_, i) => {
            const x = -0.5 + i * 0.1;
            return { x, y: x*x*x - 3*x + 2 };
        }),
    },
    {
        id: 'tvm5',
        title: 'Crescimento e TVM',
        description: 'Sintonize c para f(x) = 2x^3 - 3x^2 - 12x + 5 no intervalo [-2, 3].',
        functionEquation: 'f(x) = 2x^3 - 3x^2 - 12x + 5',
        derivativeEquation: 'f\\\'(x) = 6x^2 - 6x - 12',
        a: -2,
        b: 3,
        expectedC: 0.5 + (5 * Math.sqrt(3)) / 6, // slope = -1. 6c^2-6c-12=-1 => 6c^2-6c-11=0 => c = 0.5 + 5sqrt(3)/6 ~ 1.943375...
        graphDomain: [-2.5, 3.5],
        graphImage: [-15, 15],
        f: (x) => 2*x*x*x - 3*x*x - 12*x + 5,
        df: (x) => 6*x*x - 6*x - 12,
        points: Array.from({ length: 60 }).map((_, i) => {
            const x = -2.5 + i * 0.1;
            return { x, y: 2*x*x*x - 3*x*x - 12*x + 5 };
        }),
    },
    {
        id: 'tvm6',
        title: 'Rolle e Extremos',
        description: 'Ache c para f(x) = x^4 - 4x^3 + 4x^2 no intervalo [0, 2] onde a reta tangente e horizontal.',
        functionEquation: 'f(x) = x^4 - 4x^3 + 4x^2',
        derivativeEquation: 'f\\\'(x) = 4x^3 - 12x^2 + 8x',
        a: 0,
        b: 2,
        expectedC: 1.0, // Rolle, slope = 0 => 4c(c-1)(c-2)=0 => c=1 in (0,2)
        graphDomain: [-0.5, 2.5],
        graphImage: [-0.5, 2.0],
        f: (x) => Math.pow(x, 4) - 4*Math.pow(x, 3) + 4*x*x,
        df: (x) => 4*x*x*x - 12*x*x + 8*x,
        points: Array.from({ length: 35 }).map((_, i) => {
            const x = -0.5 + i * 0.1;
            return { x, y: Math.pow(x, 4) - 4*Math.pow(x, 3) + 4*x*x };
        }),
    }
];

export const getRandomTVMLevel = (): TVMLevel => {
    return tvmQuestions[Math.floor(Math.random() * tvmQuestions.length)];
};
