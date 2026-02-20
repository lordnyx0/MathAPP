// EmptyState - Reusable empty state component
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { spacing, fontSize, borderRadius } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import { AnimatedButton, FadeInView } from './AnimatedCard';

interface EmptyStateProps {
    icon?: string;
    title?: string;
    subtitle?: string;
    actionText?: string;
    onAction?: () => void;
}

/**
 * EmptyState - Display when no data is available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title = 'Nada por aqui',
    subtitle = 'Não há conteúdo disponível no momento.',
    actionText,
    onAction,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <FadeInView style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {actionText && onAction && (
                <AnimatedButton
                    onPress={onAction}
                    style={styles.button}
                    accessibilityLabel={actionText}
                >
                    <Text style={styles.buttonText}>{actionText}</Text>
                </AnimatedButton>
            )}
        </FadeInView>
    );
};

interface Styles {
    container: ViewStyle;
    icon: TextStyle;
    title: TextStyle;
    subtitle: TextStyle;
    button: ViewStyle;
    buttonText: TextStyle;
}

const createStyles = (colors: ThemeColors): Styles => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    button: {
        marginTop: spacing.md,
    },
    buttonText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.textWhite,
    },
});

export default EmptyState;
