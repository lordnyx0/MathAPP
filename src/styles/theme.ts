// Theme configuration for the Math Learning App

// ============================================================
// COLOR PALETTE
// ============================================================

export interface Colors {
    // Primary colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    // Secondary colors
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    // Category colors
    logaritmos: string;
    logaritmosDark: string;
    logaritmosLight: string;
    trigonometria: string;
    trigonometriaDark: string;
    trigonometriaLight: string;
    elementar: string;
    elementarDark: string;
    elementarLight: string;
    limites: string;
    limitesDark: string;
    limitesLight: string;
    derivadas: string;
    derivadasDark: string;
    derivadasLight: string;
    // Difficulty colors
    basico: string;
    intermediario: string;
    avancado: string;
    // Feedback colors
    success: string;
    successLight: string;
    error: string;
    errorLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    // Neutrals
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    borderDark: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textWhite: string;
    // Gradients
    gradientPrimary: string[];
    gradientBlue: string[];
    gradientPurple: string[];
    gradientGreen: string[];
    gradientOrange: string[];
    gradientBackground: string[];
    [key: string]: string | string[];
}

export const colors: Colors = {
    // Primary colors
    primary: '#6366F1', // Indigo
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',

    // Secondary colors
    secondary: '#8B5CF6', // Purple
    secondaryDark: '#7C3AED',
    secondaryLight: '#A78BFA',

    // Category colors - MORE CONTRASTING
    logaritmos: '#2563EB', // Deep Blue
    logaritmosDark: '#1D4ED8',
    logaritmosLight: '#3B82F6',

    trigonometria: '#7C3AED', // Deep Purple
    trigonometriaDark: '#6D28D9',
    trigonometriaLight: '#8B5CF6',

    elementar: '#EC4899', // Pink (very distinct!)
    elementarDark: '#DB2777',
    elementarLight: '#F472B6',

    limites: '#14B8A6', // Teal
    limitesDark: '#0D9488',
    limitesLight: '#2DD4BF',

    derivadas: '#F97316', // Orange
    derivadasDark: '#EA580C',
    derivadasLight: '#FB923C',

    // Difficulty colors
    basico: '#10B981', // Green
    intermediario: '#F59E0B', // Amber
    avancado: '#EF4444', // Red

    // Feedback colors
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Neutrals
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    border: '#E2E8F0',
    borderDark: '#CBD5E1',

    // Text
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textWhite: '#FFFFFF',

    // Gradients (for LinearGradient)
    gradientPrimary: ['#6366F1', '#8B5CF6'],
    gradientBlue: ['#3B82F6', '#6366F1'],
    gradientPurple: ['#8B5CF6', '#EC4899'],
    gradientGreen: ['#10B981', '#3B82F6'],
    gradientOrange: ['#F59E0B', '#EF4444'],
    // App background gradient
    gradientBackground: ['#F8FAFC', '#EEF2FF', '#F5F3FF'],
};

// ============================================================
// SPACING
// ============================================================

export interface Spacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
}

export const spacing: Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// ============================================================
// BORDER RADIUS
// ============================================================

export interface BorderRadius {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
}

export const borderRadius: BorderRadius = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 20,
    full: 9999,
};

// ============================================================
// FONT SIZE
// ============================================================

export interface FontSize {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
}

export const fontSize: FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// ============================================================
// FONT WEIGHT
// ============================================================

export interface FontWeight {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
}

export const fontWeight: FontWeight = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

// ============================================================
// TYPOGRAPHY
// ============================================================

export interface TypographyStyle {
    fontSize: number;
    fontWeight: string;
    color: string;
}

export interface Typography {
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    body: TypographyStyle;
    bodyBold: TypographyStyle;
    caption: TypographyStyle;
    small: TypographyStyle;
}

export const typography: Typography = {
    h1: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    h2: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    h3: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    body: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.normal,
        color: colors.textPrimary,
    },
    bodyBold: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    caption: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.normal,
        color: colors.textSecondary,
    },
    small: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: colors.textTertiary,
    },
};

// ============================================================
// SHADOWS
// ============================================================

export interface Shadow {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
}

export interface Shadows {
    sm: Shadow;
    md: Shadow;
    lg: Shadow;
}

export const shadows: Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

// ============================================================
// ANIMATION
// ============================================================

export interface Animation {
    fast: number;
    normal: number;
    slow: number;
}

export const animation: Animation = {
    fast: 150,
    normal: 300,
    slow: 500,
};

// ============================================================
// THEME EXPORT
// ============================================================

export interface Theme {
    colors: Colors;
    spacing: Spacing;
    borderRadius: BorderRadius;
    fontSize: FontSize;
    fontWeight: FontWeight;
    typography: Typography;
    shadows: Shadows;
    animation: Animation;
}

const theme: Theme = {
    colors,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    typography,
    shadows,
    animation,
};

export default theme;
