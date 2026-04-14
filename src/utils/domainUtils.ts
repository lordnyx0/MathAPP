/**
 * Shared utilities for canonical domain formatting/comparison.
 */

/**
 * Normalize domain string for robust comparisons.
 */
export const normalizeDomainString = (domain: string): string => {
    return domain
        .replace(/\s+/g, '')
        .replace(/R/g, 'ℝ')
        .replace(/inf/gi, '∞')
        .replace(/\+∞/g, '∞')
        .replace(/-\+∞/g, '-∞')
        .toLowerCase();
};

/**
 * Compare two domain strings by canonicalized representation.
 */
export const domainsAreEquivalent = (left: string, right: string): boolean => {
    return normalizeDomainString(left) === normalizeDomainString(right);
};

