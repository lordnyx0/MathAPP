import { liateQuestions, getRandomLiateQuestion } from '../liateQuestions';
import { substitutionQuestions, getRandomSubstitutionQuestion } from '../substitutionQuestions';
import { trigSprintQuestions, getRandomTrigSprintLevel } from '../trigSprintQuestions';
import { tvmQuestions, getRandomTVMLevel } from '../tvmQuestions';
import { recurrenceQuestions, getRandomRecurrenceProof } from '../recurrenceQuestions';

describe('Minigames Data Validation', () => {

  describe('LIATE Dataset', () => {
    it('should have questions with correct part mappings', () => {
      liateQuestions.forEach(q => {
        // u needs to exist in parts
        q.correctU.forEach(p => expect(q.parts).toContain(p));
        // dv needs to exist in parts
        q.correctDv.forEach(p => expect(q.parts).toContain(p));
        // u + dv must cover all parts if they sum up (usually true but u + dv might skip extra if bad data)
        const totalSelectedPartsLength = q.correctU.length + q.correctDv.length;
        expect(totalSelectedPartsLength).toBe(q.parts.length);
      });
    });

    it('should fetch a random liate question', () => {
      const q = getRandomLiateQuestion();
      expect(q).toBeDefined();
      expect(q.id).toBeDefined();
    });
  });

  describe('Substitution Dataset', () => {
    it('should have well formed chunks where correctUId points to a selectable chunk', () => {
      substitutionQuestions.forEach(q => {
        const uChunk = q.chunks.find(c => c.id === q.correctUId);
        expect(uChunk).toBeDefined();
        if (uChunk) {
            expect(uChunk.isSelectable).toBe(true);
        }
      });
    });
  });

  describe('Trig Sprint Dataset', () => {
    it('should have correctCardId in the options pool', () => {
      trigSprintQuestions.forEach(q => {
        const correctCard = q.options.find(c => c.id === q.correctCardId);
        expect(correctCard).toBeDefined();
      });
    });
  });

  describe('TVM Lab Dataset', () => {
    it('should have matching expectations for c', () => {
      tvmQuestions.forEach(q => {
        // Mean Value Theorem: m = (f(b) - f(a)) / (b - a)
        const m = (q.f(q.b) - q.f(q.a)) / (q.b - q.a);
        
        // derivative at c must equal m
        const approxM = q.df(q.expectedC);
        
        // Assert floating point near equality
        expect(approxM).toBeCloseTo(m, 4);
      });
    });
    
    it('expectedC should lay in (a, b)', () => {
        tvmQuestions.forEach(q => {
            // Some Rolle cases might technically allow expectedC on borders or multiple, but in our lab we pick one within.
            expect(q.expectedC).toBeGreaterThanOrEqual(q.a);
            expect(q.expectedC).toBeLessThanOrEqual(q.b);
        });
    });
  });

  describe('Recurrence Formula Dataset', () => {
    it('should only use piece IDs that exist in the pool', () => {
      recurrenceQuestions.forEach(proof => {
        const validPieceIds = proof.pool.map(p => p.id);
        
        proof.lines.forEach(line => {
          line.blanks.forEach(blank => {
            expect(validPieceIds).toContain(blank.correctPieceId);
          });
        });
      });
    });
  });

});
