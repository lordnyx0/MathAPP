// MathText Component - Renders LaTeX mathematical expressions
// Uses a simple HTML approach that works on web and native
import React, { useMemo, ReactNode } from 'react';
import { View, Text, StyleSheet, Platform, TextStyle, ViewStyle, StyleProp } from 'react-native';
import { fontSize as themeFontSize } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

type MathTextSize = 'small' | 'normal' | 'large' | 'xlarge';

/**
 * Convert simple LaTeX-like notation to Unicode
 * Handles common math expressions
 */
const latexToUnicode = (text: string): string => {
    if (!text) return '';

    let result = String(text);

    // Subscripts (for log bases)
    const subscripts: Record<string, string> = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
        'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'n': 'ₙ', 'x': 'ₓ',
    };

    // Superscripts (for exponents)
    const superscripts: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        'n': 'ⁿ', 'x': 'ˣ', '+': '⁺', '-': '⁻',
    };

    // Greek letters
    const greekLetters: Record<string, string> = {
        '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
        '\\theta': 'θ', '\\pi': 'π', '\\sigma': 'σ', '\\phi': 'φ',
        '\\omega': 'ω', '\\epsilon': 'ε', '\\lambda': 'λ', '\\mu': 'μ',
    };

    // Math symbols
    const mathSymbols: Record<string, string> = {
        '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓',
        '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈',
        '\\infty': '∞', '\\sqrt': '√', '\\sum': '∑', '\\prod': '∏',
        '\\int': '∫', '\\partial': '∂', '\\nabla': '∇',
        '\\rightarrow': '→', '\\leftarrow': '←', '\\Rightarrow': '⇒',
        '\\cdot': '·', '\\ldots': '…', '\\in': '∈', '\\notin': '∉',
        '\\forall': '∀', '\\exists': '∃',
    };

    // Replace Greek letters
    for (const [latex, unicode] of Object.entries(greekLetters)) {
        const escaped = latex.replace(/\\/g, '\\\\');
        result = result.replace(new RegExp(escaped, 'g'), unicode);
    }

    // Replace math symbols
    for (const [latex, unicode] of Object.entries(mathSymbols)) {
        const escaped = latex.replace(/\\/g, '\\\\');
        result = result.replace(new RegExp(escaped, 'g'), unicode);
    }

    // Handle _{...} subscripts
    result = result.replace(/_\{([^}]+)\}/g, (_, content: string) => {
        return content.split('').map(c => subscripts[c] || c).join('');
    });

    // Handle ^{...} superscripts  
    result = result.replace(/\^\{([^}]+)\}/g, (_, content: string) => {
        return content.split('').map(c => superscripts[c] || c).join('');
    });

    // Handle single char subscript _x
    result = result.replace(/_([0-9a-z])/g, (_, c: string) => subscripts[c] || `_${c}`);

    // Handle single char superscript ^x
    result = result.replace(/\^([0-9a-z+-])/g, (_, c: string) => superscripts[c] || `^${c}`);

    // Handle \log
    result = result.replace(/\\log/g, 'log');

    // Handle \frac{a}{b} -> a/b (simplified)
    result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');

    // Remove remaining $ delimiters
    result = result.replace(/\$/g, '');

    return result;
};

interface MathTextProps {
    children: ReactNode;
    formula?: boolean;
    size?: MathTextSize;
    color?: string;
    style?: StyleProp<TextStyle>;
}

/**
 * MathText - Render text with inline LaTeX formulas
 */
const MathText: React.FC<MathTextProps> = ({
    children,
    formula = false,
    size = 'normal',
    color,
    style,
}) => {
    const { colors } = useTheme();
    const textColor = color || colors.textPrimary;

    const text = useMemo(() => {
        if (!children) return '';
        let rawText: string;
        if (typeof children === 'string') {
            rawText = children;
        } else if (Array.isArray(children)) {
            rawText = children.map(c => c == null ? '' : String(c)).join('');
        } else {
            rawText = String(children);
        }
        return formula ? latexToUnicode(`$${rawText}$`) : latexToUnicode(rawText);
    }, [children, formula]);

    const sizeStyle = useMemo((): TextStyle => {
        switch (size) {
            case 'small': return { fontSize: themeFontSize.sm };
            case 'large': return { fontSize: themeFontSize.xl };
            case 'xlarge': return { fontSize: themeFontSize.xxl };
            default: return { fontSize: themeFontSize.md };
        }
    }, [size]);

    return (
        <Text style={[styles.text, sizeStyle, { color: textColor }, style]}>
            {text}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

interface FormulaProps extends Omit<MathTextProps, 'formula'> { }

/**
 * Quick formula component - just pass the LaTeX
 */
export const Formula: React.FC<FormulaProps> = ({ children, ...props }) => (
    <MathText formula {...props}>{children}</MathText>
);

interface DisplayMathProps extends Omit<MathTextProps, 'formula' | 'size' | 'style'> {
    style?: StyleProp<ViewStyle>;
}

/**
 * Display math (centered, block)
 */
export const DisplayMath: React.FC<DisplayMathProps> = ({ children, style, ...props }) => (
    <View style={[{ alignItems: 'center', marginVertical: 8 }, style]}>
        <MathText formula size="large" {...props}>{children}</MathText>
    </View>
);

export default MathText;
