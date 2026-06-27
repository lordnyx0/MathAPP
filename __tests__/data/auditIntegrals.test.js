const {
  generateConstantQuestion,
  generatePowerQuestion,
  generateInverseQuestion,
  generateExpQuestion,
  generateSinQuestion,
  generateCosQuestion,
  generateWrongAnswers,
} = require('../../src/data/integralGenerator');

describe('Comprehensive audit of generated integrals and options', () => {
  it('validates 5000 iterations for each generator', () => {
    const generators = [
      { name: 'constant', fn: generateConstantQuestion },
      { name: 'power', fn: generatePowerQuestion },
      { name: 'inverse', fn: generateInverseQuestion },
      { name: 'exp', fn: generateExpQuestion },
      { name: 'sin', fn: generateSinQuestion },
      { name: 'cos', fn: generateCosQuestion },
    ];

    generators.forEach(({ name, fn }) => {
      for (let i = 0; i < 5000; i++) {
        const q = fn();
        
        // Basic correctness
        expect(q.id).toBeDefined();
        expect(q.function).toBeDefined();
        expect(q.integral).toBeDefined();
        expect(q.rule).toBe(name);
        expect(q.explanation).toBeDefined();
        
        // Formatting check
        expect(q.integral).not.toContain('NaN');
        expect(q.integral).not.toContain('undefined');
        expect(q.function).not.toContain('NaN');
        expect(q.function).not.toContain('undefined');
        
        // No 1x or -1x
        expect(q.integral).not.toMatch(/\b1x\b/);
        expect(q.integral).not.toMatch(/\b-1x\b/);
        
        // Distractors check
        const wrong = generateWrongAnswers(q, 3);
        expect(wrong.length).toBe(3);
        
        wrong.forEach(w => {
          expect(w).toBeDefined();
          expect(w.trim()).not.toBe('');
          
          // Distractor must not be equal to the correct answer
          expect(w).not.toBe(q.integral);
          
          // No malformed coefficient sign placements (e.g., "2-sin", "4-cos")
          expect(w).not.toMatch(/\d-sin/);
          expect(w).not.toMatch(/\d-cos/);
          expect(w).not.toMatch(/\d-e/);
          
          // No 1x or -1x in distractors
          expect(w).not.toMatch(/\b1x\b/);
          expect(w).not.toMatch(/\b-1x\b/);
        });
        
        // Specific checks for trigonometric rules
        if (name === 'sin') {
          // If coefficient a > 1, check that we successfully generated distinct sin/cos distractors
          // E.g., for -2cos(x) + C, distractors should contain 2cos(x) + C, -2sin(x) + C, or 2sin(x) + C
          const hasCoeff = q.function !== 'sin(x)';
          if (hasCoeff) {
            const hasCorrectDistractors = wrong.some(w => w.includes('sin(x)') || w.includes('cos(x)'));
            expect(hasCorrectDistractors).toBe(true);
          }
        }
        
        if (name === 'cos') {
          const hasCoeff = q.function !== 'cos(x)';
          if (hasCoeff) {
            const hasCorrectDistractors = wrong.some(w => w.includes('sin(x)') || w.includes('cos(x)'));
            expect(hasCorrectDistractors).toBe(true);
          }
        }
      }
    });
  });
});
