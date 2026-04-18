import { recurrenceQuestions } from '../../src/data/recurrenceQuestions';

describe('Recurrence Builder Audit', () => {
  it('uses well-formed line segmentation (textParts = blanks + 1)', () => {
    recurrenceQuestions.forEach((proof) => {
      proof.lines.forEach((line) => {
        expect(line.textParts.length).toBe(line.blanks.length + 1);
      });
    });
  });

  it('contains explicit final recurrence coefficients for seno and secante', () => {
    const seno = recurrenceQuestions.find((proof) => proof.id === 'r1');
    const secante = recurrenceQuestions.find((proof) => proof.id === 'r2');

    expect(seno).toBeDefined();
    expect(secante).toBeDefined();

    const senoPool = seno.pool.map((piece) => piece.id);
    expect(senoPool).toEqual(
      expect.arrayContaining(['p_minus_sin_pow_cos_over_n', 'p_n_minus_1_over_n'])
    );

    const secantePool = secante.pool.map((piece) => piece.id);
    expect(secantePool).toEqual(
      expect.arrayContaining(['p_sec_pow_tan_over_n_minus_1', 'p_n_minus_2_over_n_minus_1'])
    );
  });
});
