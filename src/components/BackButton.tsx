/**
 * BackButton - Styled back navigation button with vector icon
 */
import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, fontSize } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface BackButtonProps {
    onPress: () => void;
    label?: string;
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
                    <Ionicons name="chevron-back" size={17} color={colors.textWhite} />
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
            borderWidth: 1,
            borderColor: colors.border,
        },
        iconContainer: {
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        label: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.textPrimary,
            marginRight: spacing.xs,
        },
    });

export default BackButton;
