/**
 * Generators - Main export for all procedural question generators
 */

// Core utilities (explicit exports to avoid conflicts)
export {
    DifficultyLevel,
    QuestionGenerator,
    GeneratorOptions,
    DerivativeGeneratorOptions,
    QuadrantGeneratorOptions,
    FunctionGeneratorOptions,
} from './core/types';

export {
    randomInt,
    randomChoice,
    shuffle,
    generateId,
    toSuperscript,
    toSubscript,
    formatFraction,
    formatPiMultiple,
    formatCoefficient,
    formatTerm,
    gcd,
    simplifyFraction,
    isNiceNumber,
    DOMAIN_FORMATS,
    formatInterval,
} from './core/utils';

// Individual generators (namespaced to avoid conflicts)
export * as quadrant from './quadrant';
export * as functionGen from './function';
