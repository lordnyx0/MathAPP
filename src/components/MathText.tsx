// MathText Component - Renders LaTeX mathematical expressions
// Uses a simple HTML approach that works on web and native
import React, { useMemo, ReactNode } from 'react';
import { View, Text, StyleSheet, Platform, TextStyle, ViewStyle, StyleProp } from 'react-native';
import { fontSize as themeFontSize } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

let katexCssInjected = false;
const injectKatexCss = () => {
    if (Platform.OS === ('web' as string) && typeof document !== 'undefined' && !katexCssInjected) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        document.head.appendChild(link);
        katexCssInjected = true;
    }
};

type MathTextSize = 'small' | 'normal' | 'large' | 'xlarge';

/**
 * Convert simple LaTeX-like notation to Unicode
 * Handles common math expressions
 */
export const latexToUnicode = (text: string): string => {
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
        '\\forall': '∀', '\\exists': '∃', '\\to': '→',
        '\\mathbb{R}': 'ℝ', '\\mathbb{C}': 'ℂ', '\\mathbb{Q}': 'ℚ', '\\mathbb{Z}': 'ℤ', '\\mathbb{N}': 'ℕ',
        '\\ker': 'ker', '\\det': 'det', '\\text{Im }': 'Im ', '\\operatorname{Ger}': 'Ger',
        '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\sec': 'sec', '\\csc': 'csc', '\\cot': 'cot',
        '\\arcsin': 'arcsin', '\\arccos': 'arccos', '\\arctan': 'arctan'
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

    // Handle \sqrt{a} -> √a
    result = result.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

    // Handle \frac{a}{b} -> (a)/(b) (simplified)
    result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

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
    numberOfLines?: number;
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
    numberOfLines,
}) => {
    const { colors } = useTheme();
    const textColor = color || colors.textPrimary;

    const rawString = useMemo(() => {
        if (!children) return '';
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.map(c => c == null ? '' : String(c)).join('');
        return String(children);
    }, [children]);

    const isComplexMath = useMemo(() => {
        return formula || /\$|\\\[|\\\(|\\begin\{/.test(rawString);
    }, [formula, rawString]);

    const sizeStyle = useMemo((): TextStyle => {
        switch (size) {
            case 'small': return { fontSize: themeFontSize.sm };
            case 'large': return { fontSize: themeFontSize.xl };
            case 'xlarge': return { fontSize: themeFontSize.xxl };
            default: return { fontSize: themeFontSize.md };
        }
    }, [size]);

    if (isComplexMath) {
        // No web, vamos usar o KaTeX que é nativo ao DOM e não sofre de bugs de SVG.
        if (Platform.OS === ('web' as string)) {
            injectKatexCss();
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { InlineMath, BlockMath } = require('react-katex');

            // Força a marcação em $$ caso explicitly exigido mas sem delimitadores originais
            let webTexString = rawString.trim();
            if (formula && !/^(\$|\\\[|\\\()/.test(webTexString)) {
                webTexString = `$$${webTexString}$$`;
            }

            // Divide em parágrafos de linha para preservar newline
            const paragraphs = webTexString.split(/\n/);

            return (
                <View style={[style as ViewStyle, { overflow: 'hidden', width: '100%' }]}>
                    {paragraphs.map((paragraph, index) => {
                        if (!paragraph.trim()) return <View key={index} style={{ height: 8 }} />;
                        // Pica o texto misto mantendo delimitadores $$...$$ e $...$
                        const parts = paragraph.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

                        return (
                            <Text key={index} numberOfLines={numberOfLines} style={[styles.text, sizeStyle, { color: textColor, marginVertical: 2, flexWrap: 'wrap' }]}>
                                {parts.map((part, i) => {
                                    if (part.startsWith('$$') && part.endsWith('$$')) {
                                        // O replace converte o double-escape oriundo do JSON (\\) para single-escape (\) pro KaTeX
                                        const math = part.slice(2, -2).replace(/\\\\/g, '\\');
                                        return <BlockMath key={i} math={math} />;
                                    } else if (part.startsWith('$') && part.endsWith('$')) {
                                        const math = part.slice(1, -1).replace(/\\\\/g, '\\');
                                        return <InlineMath key={i} math={math} />;
                                    } else if (part) {
                                        return <Text key={i} style={{ color: textColor }}>{latexToUnicode(part)}</Text>;
                                    }
                                    return null;
                                })}
                            </Text>
                        );
                    })}
                </View>
            );
        }

        // --- MOBILE ONLY FALLBACK (MathJaxSvg) ---
        // Prepare string. MathJax needs delimiters to know it's math.
        let texString = rawString.trim();
        // Se for explicitamente formula e não tiver delimitadores em volta, adiciona
        if (formula && !/^(\$|\\\[|\\\()/.test(texString)) {
            texString = `$$${texString}$$`;
        }

        // Dividir por quebras de linha para garantir fluxo visual.
        // MathJaxSvg lida pobremente com blocos gigantes de multiline nativo.
        const paragraphs = texString.split(/\n/);

        // No web (agora evitado), tentariamos escalar
        const webScaleFix = Platform.OS === ('web' as string) ? 2 : (sizeStyle.fontSize as number);

        return (
            <View style={[style as ViewStyle, { overflow: 'hidden', maxWidth: '100%' }]}>
                {paragraphs.map((paragraph, index) => (
                    <View key={index} style={{ marginTop: index > 0 && paragraph.trim() === '' ? 8 : 0 }}>
                        <MathJaxSvg
                            fontSize={webScaleFix}
                            color={textColor}
                            fontCache={false}
                            textStyle={{ fontSize: sizeStyle.fontSize as number }}
                        >
                            {paragraph}
                        </MathJaxSvg>
                    </View>
                ))}
            </View>
        );
    }

    const text = latexToUnicode(rawString);

    return (
        <Text numberOfLines={numberOfLines} style={[styles.text, sizeStyle, { color: textColor }, style]}>
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
