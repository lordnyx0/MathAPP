/**
 * ScoreBadge — Reusable score indicator for minigame screens.
 * Replaces ad-hoc score displays across SubstitutionScanner,
 * RecurrenceBuilder, and TrigSprint.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface ScoreBadgeProps {
    /** Current numeric score */
    score: number;
    /** Short label below the number (default: "PTS") */
    label?: string;
    /** Compact variant uses smaller dimensions */
    compact?: boolean;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({
    score,
    label = 'PTS',
    compact = false,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors, compact), [colors, compact]);

    // Pop animation when score changes
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevScore = useRef(score);

    useEffect(() => {
        if (score !== prevScore.current) {
            prevScore.current = score;
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.25,
                    duration: 120,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [score]);

    return (
        <View style={styles.container}>
            <Animated.Text
                style={[styles.value, { transform: [{ scale: scaleAnim }] }]}
            >
                {score}
            </Animated.Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const createStyles = (colors: ThemeColors, compact: boolean) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.surfaceAlt,
            paddingHorizontal: compact ? spacing.sm : spacing.md,
            paddingVertical: compact ? 3 : spacing.xs,
            borderRadius: borderRadius.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            minWidth: compact ? 54 : 70,
            ...shadows.sm,
        },
        value: {
            fontSize: compact ? fontSize.md : fontSize.lg,
            fontWeight: '800',
            color: colors.primary,
        },
        label: {
            fontSize: compact ? 7 : 8,
            fontWeight: '700',
            color: colors.textTertiary,
            letterSpacing: 0.5,
        },
    });

export default ScoreBadge;
