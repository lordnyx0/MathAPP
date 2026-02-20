// Symbol Questions - Data for the Symbol Sprint minigame
// Covers: Sets, Numeric sets, Logic, and Analysis symbols

// ============================================================
// TYPES
// ============================================================

export type SymbolCategory = 'conjuntos' | 'logica' | 'numericos' | 'analise';
export type SymbolDifficulty = 'basico' | 'intermediario' | 'avancado';

export interface MathSymbol {
    id: string;
    symbol: string;
    name: string;
    description: string;
    example: string;
    category: SymbolCategory;
    difficulty: SymbolDifficulty;
}

export interface CategoryInfo {
    id: SymbolCategory;
    name: string;
    icon: string;
    color: string;
}

// ============================================================
// CATEGORY DATA
// ============================================================

export const categoryInfo: Record<SymbolCategory, CategoryInfo> = {
    conjuntos: {
        id: 'conjuntos',
        name: 'Conjuntos',
        icon: '📦',
        color: '#10B981',
    },
    numericos: {
        id: 'numericos',
        name: 'Numéricos',
        icon: '🔢',
        color: '#3B82F6',
    },
    logica: {
        id: 'logica',
        name: 'Lógica',
        icon: '🧠',
        color: '#8B5CF6',
    },
    analise: {
        id: 'analise',
        name: 'Análise',
        icon: '📈',
        color: '#F59E0B',
    },
};

// ============================================================
// SYMBOL DATA
// ============================================================

export const mathSymbols: MathSymbol[] = [
    // =========================================================
    // CONJUNTOS - Básico
    // =========================================================
    {
        id: 'pertence',
        symbol: '∈',
        name: 'pertence a',
        description: 'Indica que um elemento faz parte de um conjunto',
        example: '3 ∈ ℕ',
        category: 'conjuntos',
        difficulty: 'basico',
    },
    {
        id: 'nao_pertence',
        symbol: '∉',
        name: 'não pertence a',
        description: 'Indica que um elemento NÃO faz parte de um conjunto',
        example: '-1 ∉ ℕ',
        category: 'conjuntos',
        difficulty: 'basico',
    },
    {
        id: 'uniao',
        symbol: '∪',
        name: 'união',
        description: 'Combina todos os elementos de dois conjuntos',
        example: 'A ∪ B',
        category: 'conjuntos',
        difficulty: 'basico',
    },
    {
        id: 'intersecao',
        symbol: '∩',
        name: 'interseção',
        description: 'Elementos comuns a dois conjuntos',
        example: 'A ∩ B',
        category: 'conjuntos',
        difficulty: 'basico',
    },
    {
        id: 'vazio',
        symbol: '∅',
        name: 'conjunto vazio',
        description: 'Conjunto sem elementos',
        example: 'A ∩ B = ∅',
        category: 'conjuntos',
        difficulty: 'basico',
    },
    // =========================================================
    // CONJUNTOS - Intermediário
    // =========================================================
    {
        id: 'subconjunto',
        symbol: '⊂',
        name: 'subconjunto próprio',
        description: 'A está contido em B, mas A ≠ B',
        example: 'ℕ ⊂ ℤ',
        category: 'conjuntos',
        difficulty: 'intermediario',
    },
    {
        id: 'subconjunto_igual',
        symbol: '⊆',
        name: 'subconjunto',
        description: 'A está contido ou é igual a B',
        example: 'A ⊆ A',
        category: 'conjuntos',
        difficulty: 'intermediario',
    },
    {
        id: 'superconjunto',
        symbol: '⊃',
        name: 'superconjunto',
        description: 'A contém B como subconjunto',
        example: 'ℝ ⊃ ℚ',
        category: 'conjuntos',
        difficulty: 'intermediario',
    },
    {
        id: 'diferenca',
        symbol: '∖',
        name: 'diferença',
        description: 'Elementos de A que não estão em B',
        example: 'ℝ ∖ ℚ = irracionais',
        category: 'conjuntos',
        difficulty: 'intermediario',
    },
    {
        id: 'produto_cartesiano',
        symbol: '×',
        name: 'produto cartesiano',
        description: 'Conjunto de pares ordenados',
        example: 'A × B = {(a,b)}',
        category: 'conjuntos',
        difficulty: 'intermediario',
    },

    // =========================================================
    // NUMÉRICOS - Básico
    // =========================================================
    {
        id: 'naturais',
        symbol: 'ℕ',
        name: 'naturais',
        description: 'Números naturais: 0, 1, 2, 3...',
        example: '5 ∈ ℕ',
        category: 'numericos',
        difficulty: 'basico',
    },
    {
        id: 'inteiros',
        symbol: 'ℤ',
        name: 'inteiros',
        description: 'Números inteiros: ...-2, -1, 0, 1, 2...',
        example: '-3 ∈ ℤ',
        category: 'numericos',
        difficulty: 'basico',
    },
    {
        id: 'racionais',
        symbol: 'ℚ',
        name: 'racionais',
        description: 'Números que podem ser escritos como fração',
        example: '1/2 ∈ ℚ',
        category: 'numericos',
        difficulty: 'basico',
    },
    {
        id: 'reais',
        symbol: 'ℝ',
        name: 'reais',
        description: 'Todos os números na reta numérica',
        example: 'π ∈ ℝ',
        category: 'numericos',
        difficulty: 'basico',
    },
    {
        id: 'infinito',
        symbol: '∞',
        name: 'infinito',
        description: 'Representa grandeza ilimitada',
        example: 'lim x→∞',
        category: 'numericos',
        difficulty: 'basico',
    },
    // =========================================================
    // NUMÉRICOS - Intermediário
    // =========================================================
    {
        id: 'complexos',
        symbol: 'ℂ',
        name: 'complexos',
        description: 'Números da forma a + bi',
        example: '2 + 3i ∈ ℂ',
        category: 'numericos',
        difficulty: 'intermediario',
    },
    {
        id: 'irracionais',
        symbol: 'ℝ∖ℚ',
        name: 'irracionais',
        description: 'Números que não podem ser escritos como fração',
        example: 'π, √2, e',
        category: 'numericos',
        difficulty: 'intermediario',
    },

    // =========================================================
    // LÓGICA - Básico
    // =========================================================
    {
        id: 'para_todo',
        symbol: '∀',
        name: 'para todo',
        description: 'Quantificador universal',
        example: '∀x ∈ ℝ',
        category: 'logica',
        difficulty: 'basico',
    },
    {
        id: 'existe',
        symbol: '∃',
        name: 'existe',
        description: 'Quantificador existencial',
        example: '∃x tal que x² = 4',
        category: 'logica',
        difficulty: 'basico',
    },
    {
        id: 'implica',
        symbol: '⇒',
        name: 'implica',
        description: 'Se... então...',
        example: 'x > 2 ⇒ x > 1',
        category: 'logica',
        difficulty: 'basico',
    },
    {
        id: 'se_somente_se',
        symbol: '⇔',
        name: 'se e somente se',
        description: 'Equivalência lógica',
        example: 'x = 2 ⇔ x² = 4 ∧ x > 0',
        category: 'logica',
        difficulty: 'basico',
    },
    // =========================================================
    // LÓGICA - Intermediário
    // =========================================================
    {
        id: 'negacao',
        symbol: '¬',
        name: 'negação',
        description: 'Nega uma proposição',
        example: '¬P = "não P"',
        category: 'logica',
        difficulty: 'intermediario',
    },
    {
        id: 'e_logico',
        symbol: '∧',
        name: 'e (conjunção)',
        description: 'Verdadeiro se ambos são verdadeiros',
        example: 'P ∧ Q',
        category: 'logica',
        difficulty: 'intermediario',
    },
    {
        id: 'ou_logico',
        symbol: '∨',
        name: 'ou (disjunção)',
        description: 'Verdadeiro se pelo menos um é verdadeiro',
        example: 'P ∨ Q',
        category: 'logica',
        difficulty: 'intermediario',
    },
    {
        id: 'nao_existe',
        symbol: '∄',
        name: 'não existe',
        description: 'Negação do quantificador existencial',
        example: '∄x ∈ ℝ: x² = -1',
        category: 'logica',
        difficulty: 'intermediario',
    },
    {
        id: 'tal_que',
        symbol: ':',
        name: 'tal que',
        description: 'Usado para definir condições',
        example: '{x ∈ ℝ : x > 0}',
        category: 'logica',
        difficulty: 'basico',
    },

    // =========================================================
    // ANÁLISE - Básico
    // =========================================================
    {
        id: 'limite',
        symbol: 'lim',
        name: 'limite',
        description: 'Valor que uma função se aproxima',
        example: 'lim(x→0) sin(x)/x = 1',
        category: 'analise',
        difficulty: 'basico',
    },
    {
        id: 'somatorio',
        symbol: '∑',
        name: 'somatório',
        description: 'Soma de uma sequência',
        example: '∑(n=1 até ∞) 1/n²',
        category: 'analise',
        difficulty: 'basico',
    },
    {
        id: 'delta',
        symbol: 'Δ',
        name: 'delta (variação)',
        description: 'Representa variação/diferença',
        example: 'Δx = x₂ - x₁',
        category: 'analise',
        difficulty: 'basico',
    },
    // =========================================================
    // ANÁLISE - Intermediário
    // =========================================================
    {
        id: 'integral',
        symbol: '∫',
        name: 'integral',
        description: 'Área sob uma curva',
        example: '∫f(x)dx',
        category: 'analise',
        difficulty: 'intermediario',
    },
    {
        id: 'produtorio',
        symbol: '∏',
        name: 'produtório',
        description: 'Produto de uma sequência',
        example: 'n! = ∏(k=1 até n) k',
        category: 'analise',
        difficulty: 'intermediario',
    },
    {
        id: 'derivada_parcial',
        symbol: '∂',
        name: 'derivada parcial',
        description: 'Derivada em relação a uma variável',
        example: '∂f/∂x',
        category: 'analise',
        difficulty: 'avancado',
    },
    {
        id: 'nabla',
        symbol: '∇',
        name: 'nabla (gradiente)',
        description: 'Vetor de derivadas parciais',
        example: '∇f = (∂f/∂x, ∂f/∂y)',
        category: 'analise',
        difficulty: 'avancado',
    },
    {
        id: 'tende_a',
        symbol: '→',
        name: 'tende a',
        description: 'Indica aproximação de um valor',
        example: 'x → 0',
        category: 'analise',
        difficulty: 'basico',
    },
    {
        id: 'aproximadamente',
        symbol: '≈',
        name: 'aproximadamente igual',
        description: 'Valores aproximados',
        example: 'π ≈ 3.14',
        category: 'analise',
        difficulty: 'basico',
    },
    {
        id: 'diferente',
        symbol: '≠',
        name: 'diferente de',
        description: 'Valores não são iguais',
        example: '2 ≠ 3',
        category: 'analise',
        difficulty: 'basico',
    },
    {
        id: 'menor_igual',
        symbol: '≤',
        name: 'menor ou igual',
        description: 'Comparação',
        example: 'x ≤ 5',
        category: 'analise',
        difficulty: 'basico',
    },
    {
        id: 'maior_igual',
        symbol: '≥',
        name: 'maior ou igual',
        description: 'Comparação',
        example: 'x ≥ 0',
        category: 'analise',
        difficulty: 'basico',
    },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get symbols filtered by category and/or difficulty
 */
export const getSymbols = (
    category?: SymbolCategory,
    difficulty?: SymbolDifficulty
): MathSymbol[] => {
    return mathSymbols.filter(s => {
        if (category && s.category !== category) return false;
        if (difficulty && s.difficulty !== difficulty) return false;
        return true;
    });
};

/**
 * Get a random symbol, optionally avoiding the last one (uses closure to avoid global mutable state)
 */
export const getRandomSymbol = (() => {
    let lastIndex = -1;
    return (
        category?: SymbolCategory,
        difficulty?: SymbolDifficulty
    ): MathSymbol => {
        const filtered = getSymbols(category, difficulty);
        let index: number;
        do {
            index = Math.floor(Math.random() * filtered.length);
        } while (index === lastIndex && filtered.length > 1);
        lastIndex = index;
        return filtered[index];
    };
})();

/**
 * Get random wrong answers for a symbol
 */
export const getWrongAnswers = (
    correct: MathSymbol,
    count: number = 3
): MathSymbol[] => {
    const others = mathSymbols.filter(s => s.id !== correct.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

/**
 * Get all categories with their symbol counts
 */
export const getCategoriesWithCounts = (): (CategoryInfo & { count: number })[] => {
    return Object.values(categoryInfo).map(cat => ({
        ...cat,
        count: mathSymbols.filter(s => s.category === cat.id).length,
    }));
};

// ============================================================
// STORAGE KEY
// ============================================================

export const SYMBOL_SPRINT_STATS_KEY = '@math_app_symbol_sprint_stats';
