/**
 * MCQ content validation — runs directly on the JSON files (the registry itself
 * doesn't load under Jest). Guards structural correctness of every MCQ set,
 * including the newly authored Limites and Derivadas questions.
 */
const fs = require('fs');
const path = require('path');

const MCQ_DIR = path.join(__dirname, '..', '..', 'src', 'content', 'mcq');
const files = fs.readdirSync(MCQ_DIR).filter(f => f.endsWith('.json'));
const DIFFICULTIES = ['basico', 'intermediario', 'avancado'];

describe('MCQ content files', () => {
    it('has the expected topic files present', () => {
        expect(files).toEqual(expect.arrayContaining([
            'logaritmos.json', 'quadrantes.json', 'limites.json', 'derivadas.json',
        ]));
    });

    files.forEach(file => {
        describe(file, () => {
            const data = JSON.parse(fs.readFileSync(path.join(MCQ_DIR, file), 'utf8'));

            it('has topic, title and at least one question', () => {
                expect(typeof data.topic).toBe('string');
                expect(typeof data.title).toBe('string');
                expect(Array.isArray(data.questions)).toBe(true);
                expect(data.questions.length).toBeGreaterThan(0);
            });

            it('every question is structurally valid', () => {
                const seenIds = new Set();
                data.questions.forEach(q => {
                    expect(typeof q.id).toBe('string');
                    expect(seenIds.has(q.id)).toBe(false); // unique ids
                    seenIds.add(q.id);

                    expect(typeof q.question).toBe('string');
                    expect(typeof q.concept).toBe('string');
                    expect(DIFFICULTIES).toContain(q.difficulty);

                    expect(Array.isArray(q.options)).toBe(true);
                    expect(q.options.length).toBeGreaterThanOrEqual(2);

                    const optionIds = q.options.map(o => o.id);
                    expect(new Set(optionIds).size).toBe(optionIds.length); // unique option ids
                    q.options.forEach(o => {
                        expect(typeof o.text).toBe('string');
                        expect(o.explanation.length).toBeGreaterThan(0);
                    });

                    // correctAnswer must point at a real option
                    expect(optionIds).toContain(q.correctAnswer);
                });
            });
        });
    });
});
