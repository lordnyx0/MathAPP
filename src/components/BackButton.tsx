/**
 * BackButton - Styled back navigation button
 *
 * Consistent back button component for all screens with proper styling
 * and safe area padding for devices with notches/status bars.
 */
import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, fontSize } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface BackButtonProps {
    /** Callback when button is pressed */
    onPress: () => void;
    /** Optional label (default: "Voltar") */
    label?: string;
    /** Whether to add extra top padding for status bar */
    withStatusBarPadding?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
    onPress,
    label = 'Voltar',
    withStatusBarPadding = true,
}) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Add extra padding on Android for status bar area
    const topPadding = withStatusBarPadding
        ? Math.max(insets.top, Platform.OS === 'android' ? 24 : 0) + spacing.sm
        : spacing.md;

    return (
        <View style={[styles.container, { paddingTop: topPadding }]}>
            <TouchableOpacity
                style={styles.button}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityLabel="Voltar"
                accessibilityRole="button"
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>←</Text>
                </View>
                <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.sm,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: colors.surfaceAlt,
            borderRadius: borderRadius.full,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            gap: spacing.xs,
        },
        iconContainer: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        icon: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.textWhite,
        },
        label: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.textPrimary,
            marginRight: spacing.xs,
        },
    });

export default BackButton;
