// AnimatedCard - Card component with entrance animations and press feedback
import React, { useEffect, useRef, useMemo, ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { spacing, borderRadius, shadows, animation } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface AnimatedCardProps {
    onPress?: () => void;
    children: ReactNode;
    delay?: number;
    borderColor?: string;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

/**
 * AnimatedCard - A card with fade-in/slide-up animation and scale press feedback
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    onPress,
    children,
    delay = 0,
    borderColor,
    style,
    accessibilityLabel,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const accentColor = borderColor || colors.primary;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: animation.normal,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: animation.normal,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay, fadeAnim, slideAnim]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.card, { borderLeftColor: accentColor }, style]}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
            >
                {children}
            </Pressable>
        </Animated.View>
    );
};

interface AnimatedButtonProps {
    onPress: () => void;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    disabled?: boolean;
}

/**
 * AnimatedButton - Button with scale animation on press
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    onPress,
    children,
    style,
    accessibilityLabel,
    disabled = false,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (disabled) return;
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.button, disabled && styles.buttonDisabled, style]}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                disabled={disabled}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
};

interface FadeInViewProps {
    children: ReactNode;
    delay?: number;
    style?: StyleProp<ViewStyle>;
}

/**
 * FadeInView - Simple fade-in wrapper for any content
 */
export const FadeInView: React.FC<FadeInViewProps> = ({ children, delay = 0, style }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: animation.normal,
            delay,
            useNativeDriver: true,
        }).start();
    }, [delay, fadeAnim]);

    return (
        <Animated.View style={[{ opacity: fadeAnim }, style]}>
            {children}
        </Animated.View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        padding: spacing.lg,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default AnimatedCard;
