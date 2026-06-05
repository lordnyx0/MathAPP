import { GraphPoint } from './functionQuestions';

export interface AreaQuestion {
    id: string;
    curvesDescription: string; // e.g. "y = x e y = x²"
    fText: string;             // f(x) label
    gText: string;             // g(x) label
    a: number;                 // lower limit
    b: number;                 // upper limit
    boundsOptions: string[];   // choices for limits [a, b]
    correctBounds: string;     // correct limits choice
    integrandOptions: string[];// choices for f(x) - g(x) or g(x) - f(x)
    correctIntegrand: string;  // correct integrand expression
    areaOptions: string[];     // choices for area value
    correctArea: string;       // correct area value
    explanation: string;       // explanation of the solution
    graphDomain: [number, number];
    graphImage: [number, number];
    // Numerical evaluators for rendering
    f: (x: number) => number;
    g: (x: number) => number;
}

export const areaQuestions: AreaQuestion[] = [
    {
        id: 'area1',
        curvesDescription: '$y = x^2$ e $y = x$',
        fText: '$f(x) = x$',
        gText: '$g(x) = x^2$',
        a: 0,
        b: 1,
        boundsOptions: ['[0, 1]', '[0, 2]', '[-1, 1]', '[1, 2]'],
        correctBounds: '[0, 1]',
        integrandOptions: ['x - x²', 'x² - x', 'x - x³', 'x² + x'],
        correctIntegrand: 'x - x²',
        areaOptions: ['1/6', '1/3', '5/6', '1/12'],
        correctArea: '1/6',
        explanation: 'Igualando as curvas: $x^2 = x \\implies x^2 - x = 0 \\implies x(x-1) = 0$, obtendo os limites $[0, 1]$. No intervalo $[0, 1]$, a reta $y = x$ está acima da parábola $y = x^2$. Integramos $\\int_0^1 (x - x^2) dx = \\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_0^1 = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}$.',
        graphDomain: [-0.2, 1.4],
        graphImage: [-0.2, 1.4],
        f: (x) => x,
        g: (x) => x * x,
    },
    {
        id: 'area2',
        curvesDescription: '$y = x^2$ e $y = x^3$',
        fText: '$f(x) = x^2$',
        gText: '$g(x) = x^3$',
        a: 0,
        b: 1,
        boundsOptions: ['[0, 1]', '[0, 2]', '[-1, 1]', '[1, 3]'],
        correctBounds: '[0, 1]',
        integrandOptions: ['x² - x³', 'x³ - x²', 'x - x²', 'x² + x³'],
        correctIntegrand: 'x² - x³',
        areaOptions: ['1/12', '1/6', '1/4', '1/3'],
        correctArea: '1/12',
        explanation: 'Igualando as curvas: $x^3 = x^2 \\implies x^2(x-1) = 0$, o que nos dá as interseções em $x=0$ e $x=1$. No intervalo $[0, 1]$, a parábola $y = x^2$ está acima da cúbica $y = x^3$ (pois para $x=0.5$, $0.25 > 0.125$). Integramos $\\int_0^1 (x^2 - x^3) dx = \\left[\\frac{x^3}{3} - \\frac{x^4}{4}\\right]_0^1 = \\frac{1}{3} - \\frac{1}{4} = \\frac{1}{12}$.',
        graphDomain: [-0.2, 1.4],
        graphImage: [-0.2, 1.4],
        f: (x) => x * x,
        g: (x) => x * x * x,
    },
    {
        id: 'area3',
        curvesDescription: '$y = 4 - x^2$ e $y = 0$',
        fText: '$f(x) = 4 - x^2$',
        gText: '$g(x) = 0$',
        a: -2,
        b: 2,
        boundsOptions: ['[-2, 2]', '[0, 2]', '[-4, 4]', '[-1, 1]'],
        correctBounds: '[-2, 2]',
        integrandOptions: ['4 - x²', 'x² - 4', '4 + x²', '2 - x'],
        correctIntegrand: '4 - x²',
        areaOptions: ['32/3', '16/3', '8', '24'],
        correctArea: '32/3',
        explanation: 'As interseções com o eixo x ($y = 0$) são: $4 - x^2 = 0 \\implies x^2 = 4 \\implies x = \\pm 2$. A parábola $y = 4 - x^2$ está acima de $y = 0$ nesse intervalo. Calculamos $\\int_{-2}^2 (4 - x^2) dx = \\left[4x - \\frac{x^3}{3}\\right]_{-2}^2 = \\left(8 - \\frac{8}{3}\\right) - \\left(-8 + \\frac{8}{3}\\right) = \\frac{16}{3} - \\left(-\\frac{16}{3}\\right) = \\frac{32}{3}$.',
        graphDomain: [-3, 3],
        graphImage: [-1, 5],
        f: (x) => 4 - x * x,
        g: (x) => 0,
    },
    {
        id: 'area4',
        curvesDescription: '$y = x^2 - 2x$ e $y = x$',
        fText: '$f(x) = x$',
        gText: '$g(x) = x^2 - 2x$',
        a: 0,
        b: 3,
        boundsOptions: ['[0, 3]', '[0, 2]', '[-1, 3]', '[1, 3]'],
        correctBounds: '[0, 3]',
        integrandOptions: ['3x - x²', 'x² - 3x', 'x - x²', 'x² - 2x'],
        correctIntegrand: '3x - x²',
        areaOptions: ['9/2', '9/4', '3', '6'],
        correctArea: '9/2',
        explanation: 'Igualando as curvas: $x^2 - 2x = x \\implies x^2 - 3x = 0 \\implies x(x-3) = 0$, obtendo os limites $[0, 3]$. No intervalo $[0, 3]$, a reta $y=x$ está acima da parábola $y=x^2-2x$ (por exemplo, em $x=1$, $1 > -1$). Integramos $\\int_0^3 (x - (x^2 - 2x)) dx = \\int_0^3 (3x - x^2) dx = \\left[\\frac{3x^2}{2} - \\frac{x^3}{3}\\right]_0^3 = \\frac{27}{2} - 9 = \\frac{9}{2}$.',
        graphDomain: [-1, 4],
        graphImage: [-2, 4],
        f: (x) => x,
        g: (x) => x * x - 2 * x,
    }
];

export const getRandomAreaQuestion = (): AreaQuestion => {
    return areaQuestions[Math.floor(Math.random() * areaQuestions.length)];
};
