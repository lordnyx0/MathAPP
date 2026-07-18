/**
 * AnswerOption — shared multiple-choice option button.
 *
 * Every trainer had re-implemented the same option button (surface background,
 * 2px border, success/error tint on result). This centralises that, and bakes in
 * the accessibility minimums: a 48dp touch target, button role, and a correct
 * `selected` state announced to screen readers.
 */
import React, { ReactNode, useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, borderRadius, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

export type AnswerOptionState = 'idle' | 'selected' | 'correct' | 'wrong';

interface AnswerOptionProps {
    /** Rendered content, e.g. a <MathText> or <Text>. */
    children: ReactNode;
    onPress: () => void;
    /** Visual/semantic state of the option. */
    state?: AnswerOptionState;
    disabled?: boolean;
    /** Plain-text label for screen readers (e.g. latexToUnicode of the answer). */
    accessibilityLabel: string;
    /** Extra style overrides merged last. */
    style?: object;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
    children,
    onPress,
    state = 'idle',
    disabled = false,
    accessibilityLabel,
    style,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const stateStyle = (() => {
        switch (state) {
            case 'correct': return { borderColor: colors.success, backgroundColor: colors.successLight };
            case 'wrong': return { borderColor: colors.error, backgroundColor: colors.errorLight };
            case 'selected': return { borderColor: colors.primary, backgroundColor: colors.primary + '10' };
            default: return { borderColor: colors.border };
        }
    })();

    return (
        <TouchableOpacity
            style={[styles.button, stateStyle, style]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ selected: state === 'selected' || state === 'correct' || state === 'wrong', disabled }}
        >
            {children}
        </TouchableOpacity>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    button: {
        minHeight: 48,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
});

export default AnswerOption;
