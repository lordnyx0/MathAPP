// Settings Screen - Appearance and Data management
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, THEMES, ThemeType } from '../contexts/ThemeContext';
import { STORAGE_KEYS } from '../constants';
import { spacing, borderRadius, fontSize, shadows, colors } from '../styles/theme';
import { showToast } from '../components/Toast';
import strings from '../i18n/strings';

const SettingsScreen = () => {
    const { theme, colors, setTheme, isDark } = useTheme();
    const [isResetting, setIsResetting] = useState(false);

    // Theme options for picker
    const themeOptions = [
        { id: THEMES.LIGHT, label: strings.settings.themes.light, icon: '☀️' },
        { id: THEMES.DARK, label: strings.settings.themes.dark, icon: '🌙' },
        { id: THEMES.OLED, label: strings.settings.themes.oled, icon: '⬛' },
        { id: THEMES.SEPIA, label: strings.settings.themes.sepia, icon: '📜' },
    ];

    // Handle theme selection
    const handleThemeChange = useCallback((newTheme: ThemeType) => {
        setTheme(newTheme);
    }, [setTheme]);

    // Handle system theme toggle
    const handleSystemThemeToggle = useCallback((value: boolean) => {
        if (value) {
            setTheme(THEMES.SYSTEM);
        } else {
            setTheme(THEMES.LIGHT);
        }
    }, [setTheme]);

    // Reset MCQ data
    const resetMCQData = useCallback(async () => {
        Alert.alert(
            strings.settings.confirmReset,
            strings.settings.confirmResetMessage,
            [
                { text: strings.cancel, style: 'cancel' },
                {
                    text: strings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        setIsResetting(true);
                        try {
                            await AsyncStorage.multiRemove([
                                STORAGE_KEYS.SRS_CARDS,
                                STORAGE_KEYS.METACOGNITION,
                            ]);
                            showToast(strings.settings.resetSuccess, 'success');
                        } catch (error) {
                            showToast(strings.errors.genericError, 'error');
                        } finally {
                            setIsResetting(false);
                        }
                    },
                },
            ]
        );
    }, []);

    // Reset learning progress
    const resetLearningProgress = useCallback(async () => {
        Alert.alert(
            strings.settings.confirmReset,
            strings.settings.confirmResetMessage,
            [
                { text: strings.cancel, style: 'cancel' },
                {
                    text: strings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        setIsResetting(true);
                        try {
                            await AsyncStorage.multiRemove([
                                STORAGE_KEYS.LEARNING_PROGRESS,
                                STORAGE_KEYS.EXERCISE_PROGRESS,
                            ]);
                            showToast(strings.settings.resetSuccess, 'success');
                        } catch (error) {
                            showToast(strings.errors.genericError, 'error');
                        } finally {
                            setIsResetting(false);
                        }
                    },
                },
            ]
        );
    }, []);

    // Reset all data
    const resetAllData = useCallback(async () => {
        Alert.alert(
            strings.settings.confirmReset,
            strings.settings.confirmResetMessage,
            [
                { text: strings.cancel, style: 'cancel' },
                {
                    text: strings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        setIsResetting(true);
                        try {
                            await AsyncStorage.multiRemove([
                                STORAGE_KEYS.SRS_CARDS,
                                STORAGE_KEYS.METACOGNITION,
                                STORAGE_KEYS.LEARNING_PROGRESS,
                                STORAGE_KEYS.EXERCISE_PROGRESS,
                                STORAGE_KEYS.QUADRANT_STATS,
                            ]);
                            showToast(strings.settings.resetSuccess, 'success');
                        } catch (error) {
                            showToast(strings.errors.genericError, 'error');
                        } finally {
                            setIsResetting(false);
                        }
                    },
                },
            ]
        );
    }, []);

    const dynamicStyles = {
        container: { backgroundColor: colors.background },
        surface: { backgroundColor: colors.surface },
        text: { color: colors.textPrimary },
        textSecondary: { color: colors.textSecondary },
        border: { borderColor: colors.border },
    };

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]}>
            <LinearGradient
                colors={colors.gradientBackground}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, dynamicStyles.text]}>
                            {strings.settings.title}
                        </Text>
                    </View>

                    {/* Appearance Section */}
                    <View style={[styles.section, dynamicStyles.surface, shadows.md]}>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                            🎨 {strings.settings.appearance}
                        </Text>

                        {/* Theme Picker */}
                        <Text style={[styles.label, dynamicStyles.textSecondary]}>
                            {strings.settings.theme}
                        </Text>
                        <View style={styles.themeGrid}>
                            {themeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.themeOption,
                                        dynamicStyles.border,
                                        (theme === option.id || (theme === THEMES.SYSTEM && option.id === THEMES.LIGHT)) && styles.themeOptionSelected,
                                        theme === option.id && { borderColor: colors.primary },
                                    ]}
                                    onPress={() => handleThemeChange(option.id)}
                                    disabled={theme === THEMES.SYSTEM}
                                >
                                    <Text style={styles.themeIcon}>{option.icon}</Text>
                                    <Text style={[
                                        styles.themeLabel,
                                        dynamicStyles.text,
                                        theme === option.id && { color: colors.primary },
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* System Theme Toggle */}
                        <View style={[styles.settingRow, dynamicStyles.border]}>
                            <View style={styles.settingInfo}>
                                <Text style={[styles.settingLabel, dynamicStyles.text]}>
                                    {strings.settings.followSystem}
                                </Text>
                            </View>
                            <Switch
                                value={theme === THEMES.SYSTEM}
                                onValueChange={handleSystemThemeToggle}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={theme === THEMES.SYSTEM ? colors.primary : colors.surfaceAlt}
                            />
                        </View>
                    </View>

                    {/* Data Section */}
                    <View style={[styles.section, dynamicStyles.surface, shadows.md]}>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                            📊 {strings.settings.data}
                        </Text>

                        {/* Reset MCQ */}
                        <TouchableOpacity
                            style={[styles.resetButton, dynamicStyles.border]}
                            onPress={resetMCQData}
                            disabled={isResetting}
                        >
                            <Text style={[styles.resetIcon]}>🗑️</Text>
                            <View style={styles.resetInfo}>
                                <Text style={[styles.resetLabel, dynamicStyles.text]}>
                                    {strings.settings.resetMCQ}
                                </Text>
                                <Text style={[styles.resetDescription, dynamicStyles.textSecondary]}>
                                    SRS + Metacognição
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Reset Lessons */}
                        <TouchableOpacity
                            style={[styles.resetButton, dynamicStyles.border]}
                            onPress={resetLearningProgress}
                            disabled={isResetting}
                        >
                            <Text style={[styles.resetIcon]}>🗑️</Text>
                            <View style={styles.resetInfo}>
                                <Text style={[styles.resetLabel, dynamicStyles.text]}>
                                    {strings.settings.resetLessons}
                                </Text>
                                <Text style={[styles.resetDescription, dynamicStyles.textSecondary]}>
                                    Lições + Exercícios
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Reset All */}
                        <TouchableOpacity
                            style={[styles.resetButton, styles.resetButtonDanger]}
                            onPress={resetAllData}
                            disabled={isResetting}
                        >
                            <Text style={[styles.resetIcon]}>⚠️</Text>
                            <View style={styles.resetInfo}>
                                <Text style={[styles.resetLabel, { color: '#EF4444' }]}>
                                    {strings.settings.resetAll}
                                </Text>
                                <Text style={[styles.resetDescription, { color: '#F87171' }]}>
                                    Todos os dados
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Spacing for tab bar */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
        marginTop: spacing.lg,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
    },
    section: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        marginBottom: spacing.sm,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    themeOption: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
    },
    themeOptionSelected: {
        borderWidth: 2,
    },
    themeIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    themeLabel: {
        fontSize: fontSize.sm,
        fontWeight: '500',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
    },
    resetButtonDanger: {
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    resetIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    resetInfo: {
        flex: 1,
    },
    resetLabel: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    resetDescription: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    bottomSpacing: {
        height: 100,
    },
});

export default SettingsScreen;

