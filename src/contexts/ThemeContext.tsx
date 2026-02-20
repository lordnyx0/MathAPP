// Theme Context - Manages app theme (light, dark, oled, sepia)
import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { useColorScheme } from 'react-native';

// ============================================================
// TYPES
// ============================================================

export interface ThemeColors {
    // Primary
    primary: string;
    primaryDark: string;
    primaryLight: string;
    // Secondary
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
    // Difficulty
    basico: string;
    intermediario: string;
    avancado: string;
    // Feedback
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
    // Gradients - use tuple type for expo-linear-gradient compatibility
    gradientPrimary: readonly [string, string, ...string[]];
    gradientBackground: readonly [string, string, ...string[]];
    [key: string]: string | readonly string[];
}

export interface ThemeContextValue {
    theme: ThemeType;
    resolvedTheme: ThemeType;
    colors: ThemeColors;
    isDark: boolean;
    setTheme: (theme: ThemeType) => Promise<void>;
    isLoading: boolean;
    availableThemes: ThemeType[];
}

// ============================================================
// THEME IDS
// ============================================================

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    OLED: 'oled',
    SEPIA: 'sepia',
    SYSTEM: 'system',
} as const;

export type ThemeType = typeof THEMES[keyof typeof THEMES];

// ============================================================
// THEME DEFINITIONS
// ============================================================

const themeColors: Record<string, ThemeColors> = {
    [THEMES.LIGHT]: {
        primary: '#6366F1',
        primaryDark: '#4F46E5',
        primaryLight: '#818CF8',
        secondary: '#8B5CF6',
        secondaryDark: '#7C3AED',
        secondaryLight: '#A78BFA',
        logaritmos: '#2563EB',
        logaritmosDark: '#1D4ED8',
        logaritmosLight: '#3B82F6',
        trigonometria: '#7C3AED',
        trigonometriaDark: '#6D28D9',
        trigonometriaLight: '#8B5CF6',
        elementar: '#EC4899',
        elementarDark: '#DB2777',
        elementarLight: '#F472B6',
        limites: '#14B8A6',
        limitesDark: '#0D9488',
        limitesLight: '#2DD4BF',
        derivadas: '#F97316',
        derivadasDark: '#EA580C',
        derivadasLight: '#FB923C',
        basico: '#10B981',
        intermediario: '#F59E0B',
        avancado: '#EF4444',
        success: '#10B981',
        successLight: '#D1FAE5',
        error: '#EF4444',
        errorLight: '#FEE2E2',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        info: '#3B82F6',
        infoLight: '#DBEAFE',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceAlt: '#F1F5F9',
        border: '#E2E8F0',
        borderDark: '#CBD5E1',
        textPrimary: '#1E293B',
        textSecondary: '#64748B',
        textTertiary: '#94A3B8',
        textWhite: '#FFFFFF',
        gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
        gradientBackground: ['#F8FAFC', '#EEF2FF', '#F5F3FF'] as const,
    },
    [THEMES.DARK]: {
        primary: '#818CF8',
        primaryDark: '#6366F1',
        primaryLight: '#A5B4FC',
        secondary: '#A78BFA',
        secondaryDark: '#8B5CF6',
        secondaryLight: '#C4B5FD',
        logaritmos: '#60A5FA',
        logaritmosDark: '#3B82F6',
        logaritmosLight: '#93C5FD',
        trigonometria: '#A78BFA',
        trigonometriaDark: '#8B5CF6',
        trigonometriaLight: '#C4B5FD',
        elementar: '#F472B6',
        elementarDark: '#EC4899',
        elementarLight: '#F9A8D4',
        limites: '#2DD4BF',
        limitesDark: '#14B8A6',
        limitesLight: '#5EEAD4',
        derivadas: '#FB923C',
        derivadasDark: '#F97316',
        derivadasLight: '#FDBA74',
        basico: '#34D399',
        intermediario: '#FBBF24',
        avancado: '#F87171',
        success: '#34D399',
        successLight: '#064E3B',
        error: '#F87171',
        errorLight: '#7F1D1D',
        warning: '#FBBF24',
        warningLight: '#78350F',
        info: '#60A5FA',
        infoLight: '#1E3A8A',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceAlt: '#334155',
        border: '#475569',
        borderDark: '#64748B',
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textTertiary: '#94A3B8',
        textWhite: '#FFFFFF',
        gradientPrimary: ['#818CF8', '#A78BFA'] as const,
        gradientBackground: ['#0F172A', '#1E1B4B', '#1E293B'] as const,
    },
    [THEMES.OLED]: {
        primary: '#A78BFA',
        primaryDark: '#8B5CF6',
        primaryLight: '#C4B5FD',
        secondary: '#C4B5FD',
        secondaryDark: '#A78BFA',
        secondaryLight: '#DDD6FE',
        logaritmos: '#60A5FA',
        logaritmosDark: '#3B82F6',
        logaritmosLight: '#93C5FD',
        trigonometria: '#A78BFA',
        trigonometriaDark: '#8B5CF6',
        trigonometriaLight: '#C4B5FD',
        elementar: '#F472B6',
        elementarDark: '#EC4899',
        elementarLight: '#F9A8D4',
        limites: '#2DD4BF',
        limitesDark: '#14B8A6',
        limitesLight: '#5EEAD4',
        derivadas: '#FB923C',
        derivadasDark: '#F97316',
        derivadasLight: '#FDBA74',
        basico: '#34D399',
        intermediario: '#FBBF24',
        avancado: '#F87171',
        success: '#34D399',
        successLight: '#022C22',
        error: '#F87171',
        errorLight: '#450A0A',
        warning: '#FBBF24',
        warningLight: '#422006',
        info: '#60A5FA',
        infoLight: '#172554',
        background: '#000000',
        surface: '#121212',
        surfaceAlt: '#1C1C1C',
        border: '#2D2D2D',
        borderDark: '#404040',
        textPrimary: '#FFFFFF',
        textSecondary: '#E5E5E5',
        textTertiary: '#A3A3A3',
        textWhite: '#FFFFFF',
        gradientPrimary: ['#A78BFA', '#C4B5FD'] as const,
        gradientBackground: ['#000000', '#0A0A0A', '#121212'] as const,
    },
    [THEMES.SEPIA]: {
        primary: '#8B4513',
        primaryDark: '#6B3410',
        primaryLight: '#A0522D',
        secondary: '#CD853F',
        secondaryDark: '#8B4513',
        secondaryLight: '#DEB887',
        logaritmos: '#4682B4',
        logaritmosDark: '#315E82',
        logaritmosLight: '#6CA0C0',
        trigonometria: '#9370DB',
        trigonometriaDark: '#7251B5',
        trigonometriaLight: '#AB8FE0',
        elementar: '#CD5C5C',
        elementarDark: '#A03C3C',
        elementarLight: '#D88080',
        limites: '#20B2AA',
        limitesDark: '#178C86',
        limitesLight: '#48C9C0',
        derivadas: '#D2691E',
        derivadasDark: '#A05015',
        derivadasLight: '#E08C4A',
        basico: '#228B22',
        intermediario: '#DAA520',
        avancado: '#DC143C',
        success: '#228B22',
        successLight: '#E8F5E9',
        error: '#DC143C',
        errorLight: '#FFEBEE',
        warning: '#DAA520',
        warningLight: '#FFF8E1',
        info: '#4682B4',
        infoLight: '#E3F2FD',
        background: '#F5F5DC',
        surface: '#FDF5E6',
        surfaceAlt: '#FAF0E6',
        border: '#D2B48C',
        borderDark: '#BC9A6C',
        textPrimary: '#3D3D3D',
        textSecondary: '#5C4033',
        textTertiary: '#8B7355',
        textWhite: '#FFFFFF',
        gradientPrimary: ['#8B4513', '#CD853F'] as const,
        gradientBackground: ['#F5F5DC', '#FDF5E6', '#FAF0E6'] as const,
    },
};

// ============================================================
// CONTEXT
// ============================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeSetting, setThemeSetting] = useState<ThemeType>(THEMES.LIGHT);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.USER_THEME);
                if (savedTheme && Object.values(THEMES).includes(savedTheme as ThemeType)) {
                    setThemeSetting(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTheme();
    }, []);

    // Resolve actual theme (handle 'system')
    const resolvedTheme = useMemo((): ThemeType => {
        if (themeSetting === THEMES.SYSTEM) {
            return systemColorScheme === 'dark' ? THEMES.DARK : THEMES.LIGHT;
        }
        return themeSetting;
    }, [themeSetting, systemColorScheme]);

    // Get colors for current theme
    const colors = useMemo((): ThemeColors => {
        return themeColors[resolvedTheme] || themeColors[THEMES.LIGHT];
    }, [resolvedTheme]);

    // Check if dark mode
    const isDark = useMemo((): boolean => {
        return resolvedTheme === THEMES.DARK || resolvedTheme === THEMES.OLED;
    }, [resolvedTheme]);

    // Set theme function
    const setTheme = async (newTheme: ThemeType): Promise<void> => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_THEME, newTheme);
            setThemeSetting(newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const value: ThemeContextValue = {
        theme: themeSetting,
        resolvedTheme,
        colors,
        isDark,
        setTheme,
        isLoading,
        availableThemes: Object.values(THEMES),
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// ============================================================
// HOOK
// ============================================================

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    // Return default values if used outside provider (prevents crash)
    if (!context) {
        return {
            theme: THEMES.LIGHT,
            resolvedTheme: THEMES.LIGHT,
            colors: themeColors[THEMES.LIGHT],
            isDark: false,
            setTheme: async () => console.warn('setTheme called outside ThemeProvider'),
            isLoading: false,
            availableThemes: Object.values(THEMES),
        };
    }
    return context;
};

// Export theme colors for static usage
export { themeColors };

export default ThemeContext;
