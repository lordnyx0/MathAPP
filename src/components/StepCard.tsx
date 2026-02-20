import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import MathText from './MathText';

interface Step {
    title: string;
    explanation: string;
    content: string;
}

interface StepCardProps {
    step: Step;
    index: number;
    isRevealed: boolean;
    onToggle: () => void;
    categoryColor?: string;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, isRevealed, onToggle, categoryColor }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const accentColor = categoryColor || colors.primary;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.header,
                    isRevealed && { backgroundColor: accentColor + '15' }
                ]}
                onPress={onToggle}
                activeOpacity={0.7}
                accessibilityLabel={`Passo ${index + 1}: ${step.title}. ${isRevealed ? 'Toque para esconder' : 'Toque para revelar'}`}
                accessibilityRole="button"
                accessibilityHint={isRevealed ? 'Esconder detalhes deste passo' : 'Revelar detalhes deste passo'}
                accessibilityState={{ expanded: isRevealed }}
            >
                <View style={styles.headerContent}>
                    <View style={[styles.stepNumber, { backgroundColor: accentColor }]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.headerText}>
                        <MathText style={styles.stepTitle}>{step.title}</MathText>
                        <Text style={styles.stepExplanation} numberOfLines={isRevealed ? undefined : 2}>
                            {step.explanation}
                        </Text>
                    </View>
                </View>
                <Text style={styles.chevron}>{isRevealed ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {isRevealed && (
                <View style={styles.content}>
                    <MathText style={styles.contentText}>{step.content}</MathText>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        backgroundColor: colors.surface,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepNumberText: {
        color: colors.textWhite,
        fontWeight: '700',
        fontSize: fontSize.md,
    },
    headerText: {
        flex: 1,
        marginRight: spacing.sm,
    },
    stepTitle: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    stepExplanation: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    chevron: {
        fontSize: fontSize.sm,
        color: colors.textTertiary,
    },
    content: {
        padding: spacing.lg,
        backgroundColor: colors.surfaceAlt,
        borderTopWidth: 2,
        borderTopColor: colors.border,
    },
    contentText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        lineHeight: 24,
    },
});

export default StepCard;
