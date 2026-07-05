// TrainerStatsBar - Shared score/streak/questions header used by the trainer
// and lab minigames. Owns its themed styles so screens just supply the values.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface TrainerStatsBarLabels {
    points?: string;
    streak?: string;
    questions?: string;
    end?: string;
}

interface TrainerStatsBarProps {
    score: number;
    streak: number;
    questionsAnswered: number;
    onEnd: () => void;
    /** Optional label overrides (e.g. for i18n). Defaults are Portuguese. */
    labels?: TrainerStatsBarLabels;
}

const TrainerStatsBar: React.FC<TrainerStatsBarProps> = ({
    score,
    streak,
    questionsAnswered,
    onEnd,
    labels,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const pointsLabel = labels?.points ?? 'Pontos';
    const streakLabel = labels?.streak ?? 'Sequência';
    const questionsLabel = labels?.questions ?? 'Questões';
    const endLabel = labels?.end ?? 'Encerrar';

    return (
        <View style={styles.statsBar}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>{pointsLabel}</Text>
                <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>{streakLabel}</Text>
                <Text style={[styles.statValue, streak >= 3 && styles.streakHot]}>
                    {streak >= 3 ? '🔥' : ''}{streak}
                </Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>{questionsLabel}</Text>
                <Text style={styles.statValue}>{questionsAnswered}</Text>
            </View>
            <TouchableOpacity
                style={styles.endButton}
                onPress={onEnd}
                accessibilityRole="button"
                accessibilityLabel={endLabel}
            >
                <Text style={styles.endButtonText}>{endLabel}</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        statsBar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        statItem: {
            flex: 1,
        },
        statLabel: {
            fontSize: fontSize.xs,
            color: colors.textTertiary,
        },
        statValue: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        streakHot: {
            color: colors.error,
        },
        endButton: {
            backgroundColor: colors.surfaceAlt,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
        },
        endButtonText: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
    });

export default TrainerStatsBar;
