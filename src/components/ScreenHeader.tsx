/**
 * ScreenHeader — Unified header component for all screens.
 * Supports title, subtitle, left/right actions, and optional icon.
 */
import React, { useMemo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize, fontFamily } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface ScreenHeaderProps {
    /** Main heading text */
    title: string;
    /** Optional secondary text below title */
    subtitle?: string;
    /** Element rendered on the left (e.g. BackButton) */
    leftAction?: ReactNode;
    /** Element rendered on the right (e.g. ScoreBadge) */
    rightAction?: ReactNode;
    /** Emoji or icon rendered to the left of the title text */
    icon?: string;
    /** Background tint color for the icon container */
    iconColor?: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    subtitle,
    leftAction,
    rightAction,
    icon,
    iconColor,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.wrapper}>
            {/* Top row: back button (if present) */}
            {leftAction && <View style={styles.leftActionRow}>{leftAction}</View>}

            {/* Main row: icon + text + right action */}
            <View style={styles.mainRow}>
                {icon && (
                    <View
                        style={[
                            styles.iconBox,
                            { backgroundColor: (iconColor || colors.primary) + '18' },
                        ]}
                    >
                        <Text style={styles.iconText}>{icon}</Text>
                    </View>
                )}

                <View style={styles.textGroup}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                </View>

                {rightAction && (
                    <View style={styles.rightAction}>{rightAction}</View>
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        wrapper: {
            paddingBottom: spacing.md,
        },
        leftActionRow: {
            // BackButton already handles its own padding
        },
        mainRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            gap: spacing.md,
        },
        iconBox: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconText: {
            fontSize: 24,
        },
        textGroup: {
            flex: 1,
        },
        title: {
            fontSize: fontSize.xl,
            fontWeight: '800',
            fontFamily: fontFamily.bold,
            color: colors.textPrimary,
        },
        subtitle: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: 2,
            fontWeight: '500',
            fontFamily: fontFamily.medium,
        },
        rightAction: {
            marginLeft: 'auto',
        },
    });

export default ScreenHeader;
