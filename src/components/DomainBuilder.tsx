/**
 * DomainBuilder Component
 *
 * A visual interval selector for building mathematical domains.
 * Users construct a domain by selecting:
 * 1. Left bound type (-∞, 0, or positive value)
 * 2. Right bound type (+∞, 0, or negative value)
 * 3. Bracket types (open/closed)
 * 4. Point exclusions (e.g., x ≠ 0)
 *
 * @example
 * <DomainBuilder
 *   onDomainChange={(domain) => console.log(domain)}
 *   correctDomain="[0, +∞)"
 *   showResult={false}
 * />
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

// ============================================================
// TYPES
// ============================================================

/** Bound type for domain endpoints */
type BoundType = 'negInf' | 'posInf' | 'zero' | 'positive' | 'negative';

/** Bracket type: open (excludes endpoint) or closed (includes endpoint) */
type BracketType = 'open' | 'closed';

/** Complete domain selection state */
export interface DomainSelection {
    leftBound: BoundType;
    rightBound: BoundType;
    leftBracket: BracketType;
    rightBracket: BracketType;
    excludeZero: boolean;
}

interface DomainBuilderProps {
    /** Called when user changes domain selection */
    onDomainChange: (domainString: string, selection: DomainSelection) => void;
    /** The correct domain string to compare against */
    correctDomain: string;
    /** Whether to show result feedback */
    showResult: boolean;
    /** Whether component is disabled */
    disabled?: boolean;
    /** Initial selection (optional) */
    initialSelection?: Partial<DomainSelection>;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_SELECTION: DomainSelection = {
    leftBound: 'negInf',
    rightBound: 'posInf',
    leftBracket: 'open',
    rightBracket: 'open',
    excludeZero: false,
};

/** Maps bound types to display strings */
const BOUND_DISPLAY: Record<BoundType, string> = {
    negInf: '-∞',
    posInf: '+∞',
    zero: '0',
    positive: '>0',
    negative: '<0',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Converts domain selection to mathematical notation string.
 * Examples: "ℝ", "[0, +∞)", "ℝ - {0}", "(0, +∞)"
 */
const selectionToDomainString = (selection: DomainSelection): string => {
    const { leftBound, rightBound, leftBracket, rightBracket, excludeZero } = selection;

    // Special case: all reals
    if (leftBound === 'negInf' && rightBound === 'posInf' && !excludeZero) {
        return 'ℝ';
    }

    // Special case: all reals except zero
    if (leftBound === 'negInf' && rightBound === 'posInf' && excludeZero) {
        return 'ℝ - {0}';
    }

    // Build interval notation
    let leftSymbol: string;
    let rightSymbol: string;

    // Determine left part
    if (leftBound === 'negInf') {
        leftSymbol = '(-∞';
    } else if (leftBound === 'zero') {
        leftSymbol = leftBracket === 'closed' ? '[0' : '(0';
    } else if (leftBound === 'positive') {
        leftSymbol = '(0';
    } else {
        leftSymbol = '(-∞';
    }

    // Determine right part
    if (rightBound === 'posInf') {
        rightSymbol = '+∞)';
    } else if (rightBound === 'zero') {
        rightSymbol = rightBracket === 'closed' ? '0]' : '0)';
    } else if (rightBound === 'negative') {
        rightSymbol = '0)';
    } else {
        rightSymbol = '+∞)';
    }

    const domain = `${leftSymbol}, ${rightSymbol}`;

    // Add exclusion if needed
    if (excludeZero && leftBound !== 'zero' && leftBound !== 'positive' &&
        rightBound !== 'zero' && rightBound !== 'negative') {
        return `${domain} - {0}`;
    }

    return domain;
};

/**
 * Normalizes domain string for comparison.
 * Handles variations like "R" vs "ℝ", spaces, etc.
 */
const normalizeDomain = (domain: string): string => {
    return domain
        .replace(/\s+/g, '')
        .replace(/R/g, 'ℝ')
        .replace(/inf/gi, '∞')
        .replace(/\+-∞/g, '+∞')
        .replace(/-\+∞/g, '-∞')
        .toLowerCase();
};

/**
 * Checks if user's domain matches the correct domain.
 */
const domainsMatch = (userDomain: string, correctDomain: string): boolean => {
    return normalizeDomain(userDomain) === normalizeDomain(correctDomain);
};

// ============================================================
// COMPONENT
// ============================================================

const DomainBuilder: React.FC<DomainBuilderProps> = ({
    onDomainChange,
    correctDomain,
    showResult,
    disabled = false,
    initialSelection,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // State
    const [selection, setSelection] = useState<DomainSelection>({
        ...DEFAULT_SELECTION,
        ...initialSelection,
    });

    // Derived values
    const domainString = useMemo(() => selectionToDomainString(selection), [selection]);
    const isCorrect = useMemo(
        () => domainsMatch(domainString, correctDomain),
        [domainString, correctDomain]
    );

    // Update handler
    const updateSelection = useCallback(
        (updates: Partial<DomainSelection>) => {
            if (disabled) return;

            const newSelection = { ...selection, ...updates };

            // Auto-adjust brackets for infinity bounds
            if (updates.leftBound === 'negInf') {
                newSelection.leftBracket = 'open';
            }
            if (updates.rightBound === 'posInf') {
                newSelection.rightBracket = 'open';
            }

            // Can't exclude zero if bound is already excluding it
            if (newSelection.leftBound === 'positive' || newSelection.rightBound === 'negative') {
                newSelection.excludeZero = false;
            }

            setSelection(newSelection);
            onDomainChange(selectionToDomainString(newSelection), newSelection);
        },
        [selection, disabled, onDomainChange]
    );

    // Render bound selector
    const renderBoundSelector = (
        label: string,
        currentValue: BoundType,
        options: BoundType[],
        onSelect: (value: BoundType) => void
    ) => (
        <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>{label}</Text>
            <View style={styles.selectorOptions}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.selectorButton,
                            currentValue === option && styles.selectorButtonSelected,
                        ]}
                        onPress={() => onSelect(option)}
                        disabled={disabled}
                        accessibilityLabel={`Selecionar ${BOUND_DISPLAY[option]}`}
                        accessibilityRole="button"
                    >
                        <Text
                            style={[
                                styles.selectorButtonText,
                                currentValue === option && styles.selectorButtonTextSelected,
                            ]}
                        >
                            {BOUND_DISPLAY[option]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // Render bracket selector (only for finite bounds)
    const renderBracketSelector = (
        side: 'left' | 'right',
        boundType: BoundType,
        currentBracket: BracketType,
        onSelect: (bracket: BracketType) => void
    ) => {
        // Don't show bracket selector for infinity
        if (boundType === 'negInf' || boundType === 'posInf') {
            return null;
        }

        const label = side === 'left' ? 'Inclui início?' : 'Inclui fim?';

        return (
            <View style={styles.bracketGroup}>
                <Text style={styles.bracketLabel}>{label}</Text>
                <View style={styles.bracketOptions}>
                    <TouchableOpacity
                        style={[
                            styles.bracketButton,
                            currentBracket === 'closed' && styles.bracketButtonSelected,
                        ]}
                        onPress={() => onSelect('closed')}
                        disabled={disabled}
                    >
                        <Text
                            style={[
                                styles.bracketButtonText,
                                currentBracket === 'closed' && styles.bracketButtonTextSelected,
                            ]}
                        >
                            {side === 'left' ? '[' : ']'} Sim
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.bracketButton,
                            currentBracket === 'open' && styles.bracketButtonSelected,
                        ]}
                        onPress={() => onSelect('open')}
                        disabled={disabled}
                    >
                        <Text
                            style={[
                                styles.bracketButtonText,
                                currentBracket === 'open' && styles.bracketButtonTextSelected,
                            ]}
                        >
                            {side === 'left' ? '(' : ')'} Não
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Check if zero exclusion is available
    const canExcludeZero =
        selection.leftBound !== 'positive' &&
        selection.leftBound !== 'zero' &&
        selection.rightBound !== 'negative' &&
        selection.rightBound !== 'zero';

    return (
        <View style={styles.container}>
            {/* Domain Preview */}
            <View
                style={[
                    styles.previewBox,
                    showResult && (isCorrect ? styles.previewCorrect : styles.previewWrong),
                ]}
            >
                <Text style={styles.previewLabel}>Domínio construído:</Text>
                <Text style={styles.previewDomain}>{domainString}</Text>
                {showResult && (
                    <Text style={[styles.previewHint, { color: isCorrect ? colors.success : colors.error }]}>
                        {isCorrect ? '✓ Correto!' : `✗ Correto: ${correctDomain}`}
                    </Text>
                )}
            </View>

            {/* Left Bound */}
            {renderBoundSelector(
                'Início do domínio:',
                selection.leftBound,
                ['negInf', 'zero', 'positive'],
                (value) => updateSelection({ leftBound: value })
            )}

            {/* Left Bracket */}
            {renderBracketSelector(
                'left',
                selection.leftBound,
                selection.leftBracket,
                (bracket) => updateSelection({ leftBracket: bracket })
            )}

            {/* Right Bound */}
            {renderBoundSelector(
                'Fim do domínio:',
                selection.rightBound,
                ['posInf', 'zero', 'negative'],
                (value) => updateSelection({ rightBound: value })
            )}

            {/* Right Bracket */}
            {renderBracketSelector(
                'right',
                selection.rightBound,
                selection.rightBracket,
                (bracket) => updateSelection({ rightBracket: bracket })
            )}

            {/* Zero Exclusion */}
            {canExcludeZero && (
                <View style={styles.exclusionGroup}>
                    <TouchableOpacity
                        style={[
                            styles.exclusionButton,
                            selection.excludeZero && styles.exclusionButtonSelected,
                        ]}
                        onPress={() => updateSelection({ excludeZero: !selection.excludeZero })}
                        disabled={disabled}
                        accessibilityLabel={selection.excludeZero ? 'Remover exclusão de zero' : 'Excluir x = 0'}
                        accessibilityRole="checkbox"
                    >
                        <Text
                            style={[
                                styles.exclusionButtonText,
                                selection.excludeZero && styles.exclusionButtonTextSelected,
                            ]}
                        >
                            {selection.excludeZero ? '☑' : '☐'} Excluir x = 0
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

// ============================================================
// STYLES
// ============================================================

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            gap: spacing.md,
        },
        previewBox: {
            backgroundColor: colors.surfaceAlt,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.border,
        },
        previewCorrect: {
            borderColor: colors.success,
            backgroundColor: colors.successLight,
        },
        previewWrong: {
            borderColor: colors.error,
            backgroundColor: colors.errorLight,
        },
        previewLabel: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
        },
        previewDomain: {
            fontSize: fontSize.xxl,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        previewHint: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            marginTop: spacing.xs,
        },
        selectorGroup: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
        },
        selectorLabel: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: spacing.sm,
        },
        selectorOptions: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        selectorButton: {
            flex: 1,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
        },
        selectorButtonSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
        },
        selectorButtonText: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        selectorButtonTextSelected: {
            color: colors.primary,
        },
        bracketGroup: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginTop: -spacing.sm,
        },
        bracketLabel: {
            fontSize: fontSize.xs,
            color: colors.textTertiary,
            marginBottom: spacing.sm,
        },
        bracketOptions: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        bracketButton: {
            flex: 1,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        bracketButtonSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
        },
        bracketButtonText: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        bracketButtonTextSelected: {
            color: colors.primary,
            fontWeight: '600',
        },
        exclusionGroup: {
            alignItems: 'center',
        },
        exclusionButton: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
        },
        exclusionButtonSelected: {
            borderColor: colors.warning,
            backgroundColor: colors.warningLight,
        },
        exclusionButtonText: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        exclusionButtonTextSelected: {
            color: colors.warning,
            fontWeight: '600',
        },
    });

export default DomainBuilder;
