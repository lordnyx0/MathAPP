// Shared Button Component with accessibility built-in
import React, { useRef, useCallback, useMemo, ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

// Debounce hook
const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay: number = 300) => {
    const lastCallRef = useRef<number>(0);

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCallRef.current < delay) {
            return; // Ignore rapid calls
        }
        lastCallRef.current = now;
        callback(...args);
    }, [callback, delay]);
};

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    debounceMs?: number;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'medium',
    icon,
    loading = false,
    disabled = false,
    debounceMs = 300,
    accessibilityLabel,
    accessibilityHint,
    style,
    textStyle,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const debouncedOnPress = useDebounce(onPress, debounceMs);

    const getButtonStyle = (): StyleProp<ViewStyle>[] => {
        const base: StyleProp<ViewStyle>[] = [styles.button, styles[`button_${size}` as keyof typeof styles] as ViewStyle];

        switch (variant) {
            case 'secondary':
                base.push(styles.buttonSecondary);
                break;
            case 'outline':
                base.push(styles.buttonOutline);
                break;
            case 'ghost':
                base.push(styles.buttonGhost);
                break;
            default:
                base.push(styles.buttonPrimary);
        }

        if (disabled || loading) {
            base.push(styles.buttonDisabled);
        }

        return base;
    };

    const getTextStyle = (): StyleProp<TextStyle>[] => {
        const base: StyleProp<TextStyle>[] = [styles.text, styles[`text_${size}` as keyof typeof styles] as TextStyle];

        if (variant === 'outline' || variant === 'ghost') {
            base.push(styles.textOutline);
        } else {
            base.push(styles.textFilled);
        }

        if (disabled || loading) {
            base.push(styles.textDisabled);
        }

        return base;
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            onPress={debouncedOnPress}
            disabled={disabled || loading}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityRole="button"
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled: disabled || loading }}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textWhite}
                    size="small"
                />
            ) : (
                <>
                    {icon && <Text style={styles.icon}>{icon}</Text>}
                    <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

interface BackButtonProps {
    onPress: () => void;
    label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onPress, label = '← Voltar' }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={styles.backButton}
            onPress={onPress}
            accessibilityLabel="Voltar para tela anterior"
            accessibilityRole="button"
        >
            <Text style={styles.backButtonText}>{label}</Text>
        </TouchableOpacity>
    );
};

interface CardButtonProps {
    onPress: () => void;
    children: ReactNode;
    borderColor?: string;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}

export const CardButton: React.FC<CardButtonProps> = ({
    onPress,
    children,
    borderColor,
    accessibilityLabel,
    style,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={[styles.card, borderColor && { borderColor }, style]}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
        >
            {children}
        </TouchableOpacity>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    button_small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    button_medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    button_large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonGhost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    text: {
        fontWeight: '600',
    },
    text_small: {
        fontSize: fontSize.sm,
    },
    text_medium: {
        fontSize: fontSize.md,
    },
    text_large: {
        fontSize: fontSize.lg,
    },
    textFilled: {
        color: colors.textWhite,
    },
    textOutline: {
        color: colors.primary,
    },
    textDisabled: {
        opacity: 0.7,
    },
    icon: {
        marginRight: spacing.sm,
        fontSize: fontSize.lg,
    },
    backButton: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    backButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderColor: colors.primary,
        padding: spacing.lg,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.md,
    },
});

export { useDebounce };
export default Button;
