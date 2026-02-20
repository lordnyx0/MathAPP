// Toast/Feedback Component for user notifications
import React, { useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastRef {
    show: (message: string, type?: ToastType, duration?: number) => void;
}

// Global state for toast
let toastRef: ToastRef | null = null;

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000): void => {
    if (toastRef) {
        toastRef.show(message, type, duration);
    }
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const show = useCallback((msg: string, msgType: ToastType = 'info', duration: number = 3000) => {
        setMessage(msg);
        setType(msgType);
        setVisible(true);

        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setVisible(false));
    }, [fadeAnim]);

    useEffect(() => {
        toastRef = { show };
        return () => { toastRef = null; };
    }, [show]);

    const getBackgroundColor = (): string => {
        switch (type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'warning': return colors.warning;
            default: return colors.info;
        }
    };

    const getIcon = (): string => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    if (!visible) return <>{children}</>;

    return (
        <View style={styles.container}>
            {children}
            <Animated.View
                style={[
                    styles.toast,
                    { backgroundColor: getBackgroundColor(), opacity: fadeAnim }
                ]}
            >
                <Text style={styles.icon}>{getIcon()}</Text>
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity
                    onPress={() => setVisible(false)}
                    accessibilityLabel="Fechar notificação"
                    accessibilityRole="button"
                >
                    <Text style={styles.close}>✕</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    toast: {
        position: 'absolute',
        bottom: 100,
        left: spacing.xl,
        right: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.lg,
    },
    icon: {
        fontSize: fontSize.lg,
        color: colors.textWhite,
        marginRight: spacing.sm,
    },
    message: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.textWhite,
    },
    close: {
        fontSize: fontSize.md,
        color: colors.textWhite,
        paddingLeft: spacing.sm,
    },
});

export default ToastProvider;
