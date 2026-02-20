/**
 * Core Types for Procedural Question Generators
 * 
 * This module defines the base interfaces that all generators must implement
 * to ensure consistency across the application.
 */

// ============================================================
// COMMON TYPES
// ============================================================

/**
 * Standard difficulty levels used across all minigames
 */
export type DifficultyLevel = 'basico' | 'intermediario' | 'avancado';

/**
 * Base interface for any generated question
 */
export interface BaseQuestion {
    /** Unique identifier for the question instance */
    id: string;
    /** Difficulty level */
    difficulty: DifficultyLevel;
}

// ============================================================
// GENERATOR INTERFACE
// ============================================================

/**
 * Contract that all procedural generators must implement.
 * 
 * @template TQuestion - The type of question the generator produces
 * @template TOptions - Optional configuration for generation
 * 
 * @example
 * ```typescript
 * const myGenerator: QuestionGenerator<MyQuestion, MyOptions> = {
 *     generate(options) {
 *         // Generate and return a question
 *     },
 *     generateDistractors(correct, count) {
 *         // Return plausible wrong answers
 *     }
 * };
 * ```
 */
export interface QuestionGenerator<TQuestion extends BaseQuestion, TOptions = void> {
    /**
     * Generate a single question with randomized parameters.
     * Each call should produce a unique question.
     */
    generate(options?: TOptions): TQuestion;

    /**
     * Generate plausible wrong answers for a given question.
     * These should be mathematically similar but incorrect.
     */
    generateDistractors(correct: TQuestion, count: number): string[];

    /**
     * Optional: Validate that a generated question is mathematically correct.
     * Useful for complex generators where errors might occur.
     */
    validate?(question: TQuestion): boolean;
}

// ============================================================
// GENERATION OPTIONS
// ============================================================

/**
 * Common options that most generators support
 */
export interface GeneratorOptions {
    /** Target difficulty level */
    difficulty?: DifficultyLevel;
    /** Specific rule or type to generate (generator-specific) */
    ruleType?: string;
}

/**
 * Options specifically for derivative generators
 */
export interface DerivativeGeneratorOptions extends GeneratorOptions {
    ruleType?: 'power' | 'chain' | 'product' | 'quotient' | 'exp' | 'ln' | 'sin' | 'cos' | 'tan' | 'constant' | 'sum';
}

/**
 * Options for quadrant generators
 */
export interface QuadrantGeneratorOptions extends GeneratorOptions {
    /** Include axis angles (π/2, π, 3π/2, 2π) */
    includeAxes?: boolean;
    /** Include interval questions */
    includeIntervals?: boolean;
}

/**
 * Options for function generators
 */
export interface FunctionGeneratorOptions extends GeneratorOptions {
    /** Function type to generate */
    functionType?: 'polynomial' | 'rational' | 'radical' | 'trigonometric' | 'exponential' | 'logarithmic';
    /** Question type */
    questionType?: 'domain' | 'image' | 'injectivity' | 'surjectivity';
}
