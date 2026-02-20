// Confidence Slider Component - For metacognition tracking
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import { ConfidenceLabels } from '../learning/metacognition';

interface ConfidenceSliderProps {
    onSelect: (level: number) => void;
    selected?: number | null;
}

/**
 * ConfidenceSlider - Select confidence level 1-5 before answering
 */
const ConfidenceSlider: React.FC<ConfidenceSliderProps> = ({ onSelect, selected = null }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const levels = [1, 2, 3, 4, 5];

    const getColor = (level: number): string => {
        switch (level) {
            case 1: return colors.error;
            case 2: return colors.warning;
            case 3: return colors.info;
            case 4: return colors.primary;
            case 5: return colors.success;
            default: return colors.border;
        }
    };

    const getEmoji = (level: number): string => {
        switch (level) {
            case 1: return '😟';
            case 2: return '🤔';
            case 3: return '😐';
            case 4: return '🙂';
            case 5: return '😎';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Qual sua confiança?</Text>
            <Text style={styles.subtitle}>Selecione ANTES de responder</Text>

            <View style={styles.sliderContainer}>
                {levels.map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[
                            styles.levelButton,
                            selected === level && {
                                backgroundColor: getColor(level),
                                borderColor: getColor(level),
                            },
                            selected !== level && {
                                borderColor: getColor(level) + '60',
                            },
                        ]}
                        onPress={() => onSelect(level)}
                        accessibilityLabel={`Confiança ${level}: ${ConfidenceLabels[level]}`}
                        accessibilityRole="button"
                    >
                        <Text style={styles.emoji}>{getEmoji(level)}</Text>
                        <Text style={[
                            styles.levelNumber,
                            selected === level && { color: colors.textWhite },
                        ]}>
                            {level}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selected && (
                <View style={[styles.labelBox, { backgroundColor: getColor(selected) + '20' }]}>
                    <Text style={[styles.labelText, { color: getColor(selected) }]}>
                        {ConfidenceLabels[selected]}
                    </Text>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.xl,
        marginVertical: spacing.md,
        ...shadows.md,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    sliderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    levelButton: {
        width: 52,
        height: 64,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    emoji: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    levelNumber: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    labelBox: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    labelText: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});

export default ConfidenceSlider;
