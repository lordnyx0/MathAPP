const {
  generateExpQuestion,
  generateChainQuestion,
} = require('../../src/data/derivativeGenerator');

describe('Derivative generator formatting sanity', () => {
  it('uses explicit e^(bx) notation for exponential chain cases', () => {
    for (let i = 0; i < 60; i++) {
      const q = generateExpQuestion();
      if (q.function.includes('^(')) {
        expect(q.function).toMatch(/e\^\(\d+x\)/);
        expect(q.derivative).toMatch(/e\^\(\d+x\)/);
      }
    }
  });

  it('avoids x¹ artifacts in chain-rule derivatives', () => {
    for (let i = 0; i < 120; i++) {
      const q = generateChainQuestion();
      expect(q.derivative.includes('x¹')).toBe(false);
    }
  });
});
