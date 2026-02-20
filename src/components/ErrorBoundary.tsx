// Error Boundary Component for graceful error handling
// Note: Class components can't use hooks, so we use a wrapper for theme
import React, { ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize } from '../styles/theme';
import ThemeContext, { ThemeColors, ThemeContextValue } from '../contexts/ThemeContext';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface DefaultColors {
    background: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    textWhite: string;
    error: string;
}

declare const __DEV__: boolean;

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static contextType = ThemeContext;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log to error reporting service
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        // Get colors from context (works for class components)
        const defaultColors: DefaultColors = {
            background: '#F8FAFC',
            textPrimary: '#0F172A',
            textSecondary: '#64748B',
            primary: '#6366F1',
            textWhite: '#FFFFFF',
            error: '#EF4444',
        };
        const colors = (this.context as ThemeContextValue | null)?.colors || defaultColors;
        const styles = createStyles(colors as DefaultColors);

        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.icon}>😓</Text>
                    <Text style={styles.title}>Ops! Algo deu errado</Text>
                    <Text style={styles.message}>
                        Ocorreu um erro inesperado. Por favor, tente novamente.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleRetry}
                        accessibilityLabel="Tentar novamente"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                    {__DEV__ && (
                        <Text style={styles.debug}>
                            {this.state.error?.toString()}
                        </Text>
                    )}
                </View>
            );
        }

        return this.props.children;
    }
}

const createStyles = (colors: DefaultColors) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
    },
    buttonText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.textWhite,
    },
    debug: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xl,
        textAlign: 'center',
    },
});

export default ErrorBoundary;
