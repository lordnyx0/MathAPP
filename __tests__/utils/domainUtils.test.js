const { normalizeDomainString, domainsAreEquivalent } = require('../../src/utils/domainUtils');

describe('domainUtils', () => {
    it('normalizes common domain notation variants', () => {
        expect(normalizeDomainString('R - {0}')).toBe('ℝ-{0}');
        expect(normalizeDomainString('(0, inf)')).toBe('(0,∞)');
    });

    it('compares equivalent domains', () => {
        expect(domainsAreEquivalent('R', 'ℝ')).toBe(true);
        expect(domainsAreEquivalent('(0, inf)', '(0,+∞)')).toBe(true);
    });

    it('detects non-equivalent domains', () => {
        expect(domainsAreEquivalent('[0,+∞)', '(0,+∞)')).toBe(false);
    });
});
