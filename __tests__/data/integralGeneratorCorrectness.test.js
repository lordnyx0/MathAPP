const {
  generateConstantQuestion,
  generatePowerQuestion,
  generateInverseQuestion,
  generateExpQuestion,
  generateSinQuestion,
  generateCosQuestion,
} = require('../../src/data/integralGenerator');

const superscriptMap = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻',
};

const toSuperscript = (n) => String(n).split('').map((d) => superscriptMap[d] || d).join('');

const parseCoeffAndExp = (expr) => {
  const m = expr.match(/^(-?\d+)?x([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?$/);
  if (!m) return null;
  const coeff = m[1] ? parseInt(m[1], 10) : 1;
  const exp = m[2]
    ? parseInt(m[2].replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (c) => ({
      '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
      '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
    }[c])), 10)
    : 1;
  return { coeff, exp };
};

describe('Integral generator correctness sanity', () => {
  it('constant generator computes ax + C exactly', () => {
    for (let i = 0; i < 80; i++) {
      const q = generateConstantQuestion();
      const a = parseInt(q.function, 10);
      expect(q.integral).toBe(`${a}x + C`);
    }
  });

  it('power generator follows ∫ax^n dx = (a/(n+1))x^(n+1) + C', () => {
    for (let i = 0; i < 120; i++) {
      const q = generatePowerQuestion();
      const parsed = parseCoeffAndExp(q.function);
      expect(parsed).not.toBeNull();

      const { coeff: a, exp: n } = parsed;
      const newExp = n + 1;
      const resultCoeff = a / newExp;
      const expectedSup = toSuperscript(newExp);

      if (a === 1) {
        const expectedFraction = `(x${expectedSup})/${newExp} + C`;
        if (newExp === 2) {
          expect([expectedFraction, 'x²/2 + C']).toContain(q.integral);
        } else {
          expect(q.integral).toBe(expectedFraction);
        }
      } else {
        expect(Number.isInteger(resultCoeff)).toBe(true);
        const expectedTerm = resultCoeff === 1
          ? `x${expectedSup}`
          : `${resultCoeff}x${expectedSup}`;
        expect(q.integral).toBe(`${expectedTerm} + C`);
      }
    }
  });

  it('inverse/exp/sin/cos generators keep mathematically correct primitive forms', () => {
    for (let i = 0; i < 80; i++) {
      const inv = generateInverseQuestion();
      expect(inv.integral).toMatch(/^\d*ln\|x\| \+ C$|^ln\|x\| \+ C$/);

      const exp = generateExpQuestion();
      expect(exp.integral).toMatch(/^\d*eˣ \+ C$|^eˣ \+ C$/);

      const sin = generateSinQuestion();
      expect(sin.integral).toMatch(/^-\d*cos\(x\) \+ C$|^-cos\(x\) \+ C$/);

      const cos = generateCosQuestion();
      expect(cos.integral).toMatch(/^\d*sin\(x\) \+ C$|^sin\(x\) \+ C$/);
    }
  });
});
