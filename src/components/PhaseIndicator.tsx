/**
 * PhaseIndicator — Visual stepper showing current phase in multi-step flows.
 * Used in SubstitutionScanner and similar multi-phase minigames.
 *
 *   ● ──── ○ ──── ○
 *  Scan    du   Result
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { spacing, borderRadius, fontSize } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface Phase {
    /** Short label displayed under the dot */
    label: string;
    /** Machine-readable id of this phase */
    id: string;
}

interface PhaseIndicatorProps {
    /** Ordered list of phases */
    phases: Phase[];
    /** The id of the currently active phase */
    currentPhaseId: string;
    /** Optional accent color (default: primary) */
    accentColor?: string;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
    phases,
    currentPhaseId,
    accentColor,
}) => {
    const { colors } = useTheme();
    const accent = accentColor || colors.primary;
    const styles = useMemo(() => createStyles(colors, accent), [colors, accent]);

    const currentIdx = phases.findIndex((p) => p.id === currentPhaseId);

    // Animate the progress fill
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const target = phases.length > 1 ? currentIdx / (phases.length - 1) : 0;
        Animated.timing(progressAnim, {
            toValue: target,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // width animation needs layout driver
        }).start();
    }, [currentIdx]);

    return (
        <View style={styles.container}>
            {/* Track */}
            <View style={styles.track}>
                <Animated.View
                    style={[
                        styles.trackFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>

            {/* Dots + Labels */}
            <View style={styles.dotsRow}>
                {phases.map((phase, idx) => {
                    const isActive = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                        <View key={phase.id} style={styles.dotGroup}>
                            <View
                                style={[
                                    styles.dot,
                                    isActive && styles.dotActive,
                                    isCurrent && styles.dotCurrent,
                                ]}
                            >
                                {isActive && (
                                    <Text style={styles.dotCheck}>
                                        {isCurrent ? (idx + 1).toString() : '✓'}
                                    </Text>
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.label,
                                    isActive && styles.labelActive,
                                ]}
                                numberOfLines={1}
                            >
                                {phase.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors, accent: string) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.xl,
            marginBottom: spacing.lg,
            position: 'relative',
        },
        track: {
            position: 'absolute',
            top: 14, // center on dots
            left: '10%',
            right: '10%',
            height: 3,
            backgroundColor: colors.border,
            borderRadius: 2,
        },
        trackFill: {
            height: '100%',
            backgroundColor: accent,
            borderRadius: 2,
        },
        dotsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        dotGroup: {
            alignItems: 'center',
            width: 64,
        },
        dot: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.xs,
        },
        dotActive: {
            backgroundColor: accent,
            borderColor: accent,
        },
        dotCurrent: {
            borderColor: accent,
            backgroundColor: accent,
            shadowColor: accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
        },
        dotCheck: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '800',
        },
        label: {
            fontSize: 10,
            fontWeight: '600',
            color: colors.textTertiary,
            textAlign: 'center',
        },
        labelActive: {
            color: accent,
            fontWeight: '700',
        },
    });

export default PhaseIndicator;
