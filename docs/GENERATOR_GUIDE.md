# Procedural Generator Guide

This guide explains how to implement new procedural question generators for minigames.

## Architecture Overview

```
src/data/generators/
├── core/               # Shared utilities
│   ├── types.ts        # Base interfaces
│   └── utils.ts        # Helper functions
├── quadrant/           # Quadrant Training generator
├── function/           # Function Lab generator
└── index.ts            # Barrel export
```

## Quick Start

### 1. Create Generator File

```typescript
// src/data/generators/myGame/myGenerator.ts

import { randomInt, randomChoice, generateId } from '../core/utils';
import { DifficultyLevel } from '../core/types';

export interface MyQuestion {
    id: string;
    // ... your question fields
    difficulty: DifficultyLevel;
}

export const generateQuestion = (): MyQuestion => {
    return {
        id: generateId('myGame'),
        // ... generate random values
        difficulty: 'basico',
    };
};

export const generateDistractors = (
    correct: MyQuestion,
    count: number = 3
): string[] => {
    // Return plausible wrong answers
    return [];
};
```

### 2. Create Barrel Export

```typescript
// src/data/generators/myGame/index.ts
export * from './myGenerator';
```

### 3. Update Main Export

```typescript
// src/data/generators/index.ts
export * from './myGame';
```

### 4. Integrate with Screen

```typescript
// In your screen file
import { generateQuestion, generateDistractors } from '../data/generators/myGame';

const question = generateQuestion();
const wrongAnswers = generateDistractors(question, 3);
```

## Core Utilities

### Random Helpers

```typescript
import { randomInt, randomChoice, shuffle } from './core/utils';

randomInt(1, 10);        // Integer in [1, 10]
randomChoice([1, 2, 3]); // Random element
shuffle([1, 2, 3]);      // Shuffled array
```

### Math Formatting

```typescript
import { toSuperscript, formatTerm, formatPiMultiple } from './core/utils';

toSuperscript(2);           // "²"
formatTerm(3, 2);           // "3x²"
formatPiMultiple(5, 6);     // "$5\\pi/6$"
```

### Domain Formatting

```typescript
import { DOMAIN_FORMATS, formatInterval } from './core/utils';

DOMAIN_FORMATS.ALL_REALS;   // "ℝ"
DOMAIN_FORMATS.EXCEPT_ZERO; // "ℝ - {0}"
formatInterval(0, Infinity, true, false); // "[0, +∞)"
```

## Best Practices

### 1. Difficulty Distribution

Weight basic questions higher for better learning curve:

```typescript
const allRules = [
    ...BASIC_RULES,
    ...BASIC_RULES,  // Double weight
    ...INTERMEDIATE_RULES,
    ...ADVANCED_RULES,
];
return randomChoice(allRules);
```

### 2. Plausible Distractors

Generate wrong answers that look similar to correct ones:

```typescript
// For derivative 6x²:
const wrongAnswers = [
    '7x²',   // Wrong coefficient
    '6x³',   // Wrong exponent
    '12x',   // Common mistake
];
```

### 3. Avoid Repeats

Use unique IDs with timestamps:

```typescript
import { generateId } from './core/utils';

const id = generateId('quiz'); 
// → "quiz_gen_42_1704825600000"
```

### 4. Parameter Ranges

Document your parameter ranges for maintainability:

```typescript
/**
 * @param a - Coefficient, range [2, 9]
 * @param n - Exponent, range [2, 7]
 */
const a = randomInt(2, 9);
const n = randomInt(2, 7);
```

## Testing

Run TypeScript check before committing:

```bash
npx tsc --noEmit
```

Manual testing checklist:
- [ ] Questions vary on each call
- [ ] Correct answer is always in options
- [ ] Wrong answers are plausible
- [ ] No console errors
