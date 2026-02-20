// Symbol Sprint Screen - Learn mathematical symbols through matching
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import { logError, createAsyncCleanup } from '../utils';
import { showToast } from '../components/Toast';
import strings from '../i18n/strings';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import BackButton from '../components/BackButton';
import {
    MathSymbol,
    SymbolCategory,
    categoryInfo,
    getRandomSymbol,
    getWrongAnswers,
    getCategoriesWithCounts,
    SYMBOL_SPRINT_STATS_KEY,
} from '../data/symbolQuestions';

// ============================================================
// TYPES
// ============================================================

type GameMode = 'menu' | 'practice';

interface SymbolSprintScreenProps {
    onBack?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

const SymbolSprintScreen: React.FC<SymbolSprintScreenProps> = ({ onBack }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // State
    const [mode, setMode] = useState<GameMode>('menu');
    const [selectedCategory, setSelectedCategory] = useState<SymbolCategory | null>(null);
    const [currentSymbol, setCurrentSymbol] = useState<MathSymbol | null>(null);
    const [options, setOptions] = useState<MathSymbol[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Load high score on mount
    useEffect(() => {
        const { isMounted, cleanup } = createAsyncCleanup();

        const loadData = async () => {
            try {
                const saved = await AsyncStorage.getItem(SYMBOL_SPRINT_STATS_KEY);
                if (isMounted() && saved) {
                    const stats = JSON.parse(saved);
                    setHighScore(stats.highScore || 0);
                }
            } catch (error) {
                logError('SymbolSprintScreen.loadStats', error);
            }
        };

        loadData();
        initAudio();
        return cleanup;
    }, []);

    // Save high score
    const saveHighScore = async (newScore: number) => {
        if (newScore > highScore) {
            setHighScore(newScore);
            showToast('🏆 Novo recorde! ' + newScore + ' pontos', 'success');
            try {
                await AsyncStorage.setItem(
                    SYMBOL_SPRINT_STATS_KEY,
                    JSON.stringify({ highScore: newScore })
                );
            } catch (error) {
                logError('SymbolSprintScreen.saveHighScore', error);
            }
        }
    };

    // Start practice
    const startPractice = (category: SymbolCategory | null = null) => {
        setSelectedCategory(category);
        setMode('practice');
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        nextQuestion(category);
    };

    // Next question
    const nextQuestion = (category: SymbolCategory | null = selectedCategory) => {
        const symbol = getRandomSymbol(category ?? undefined);
        const wrongAnswers = getWrongAnswers(symbol, 3);
        const allOptions = [symbol, ...wrongAnswers].sort(() => Math.random() - 0.5);

        setCurrentSymbol(symbol);
        setOptions(allOptions);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    // Check answer
    const checkAnswer = (answerId: string) => {
        if (!currentSymbol || showResult) return;

        setSelectedAnswer(answerId);
        setShowResult(true);

        const isCorrect = answerId === currentSymbol.id;

        if (isCorrect) {
            const points = 10 + streak * 2; // Bonus for streak
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            playCorrect();
        } else {
            setStreak(0);
            playIncorrect();
        }
        setQuestionsAnswered(prev => prev + 1);
    };

    // End practice
    const endPractice = () => {
        saveHighScore(score);
        setMode('menu');
    };

    // Get option style
    const getOptionStyle = (optionId: string) => {
        if (!showResult) {
            return { borderColor: colors.border };
        }
        if (optionId === currentSymbol?.id) {
            return { borderColor: colors.success, backgroundColor: colors.successLight };
        }
        if (optionId === selectedAnswer && optionId !== currentSymbol?.id) {
            return { borderColor: colors.error, backgroundColor: colors.errorLight };
        }
        return { borderColor: colors.border };
    };

    // ============================================================
    // MENU SCREEN
    // ============================================================

    if (mode === 'menu') {
        const categories = getCategoriesWithCounts();

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Back Button */}
                        {onBack && <BackButton onPress={onBack} />}

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerIcon}>⚡</Text>
                            <Text style={styles.headerTitle}>Corrida dos Símbolos</Text>
                            <Text style={styles.headerSubtitle}>
                                Aprenda símbolos matemáticos de forma rápida
                            </Text>
                        </View>

                        {/* High Score */}
                        {highScore > 0 && (
                            <View style={styles.highScoreBox}>
                                <Text style={styles.highScoreLabel}>🏆 Recorde</Text>
                                <Text style={styles.highScoreValue}>{highScore} pontos</Text>
                            </View>
                        )}

                        {/* Play All Button */}
                        <TouchableOpacity
                            style={styles.playAllButton}
                            onPress={() => startPractice(null)}
                        >
                            <Text style={styles.playAllIcon}>🎯</Text>
                            <View style={styles.playAllInfo}>
                                <Text style={styles.playAllTitle}>Todos os Símbolos</Text>
                                <Text style={styles.playAllSubtitle}>Mix aleatório</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Category Selection */}
                        <Text style={styles.sectionTitle}>Ou escolha uma categoria:</Text>
                        <View style={styles.categoryGrid}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        { borderLeftColor: cat.color },
                                    ]}
                                    onPress={() => startPractice(cat.id)}
                                >
                                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <Text style={styles.categoryCount}>
                                            {cat.count} símbolos
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ============================================================
    // PRACTICE SCREEN
    // ============================================================

    if (!currentSymbol) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <View style={styles.practiceContainer}>
                    {/* Stats Bar */}
                    <View style={styles.statsBar}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Pontos</Text>
                            <Text style={styles.statValue}>{score}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Sequência</Text>
                            <Text style={[styles.statValue, streak >= 3 && styles.streakHot]}>
                                {streak >= 3 ? '🔥' : ''}{streak}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.endButton} onPress={endPractice}>
                            <Text style={styles.endButtonText}>Encerrar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Question Card */}
                    <View style={styles.questionCard}>
                        <Text style={styles.questionLabel}>Qual o significado de:</Text>
                        <Text style={styles.questionSymbol}>{currentSymbol.symbol}</Text>
                        {selectedCategory && (
                            <View style={[
                                styles.categoryBadge,
                                { backgroundColor: categoryInfo[selectedCategory].color + '20' }
                            ]}>
                                <Text style={[
                                    styles.categoryBadgeText,
                                    { color: categoryInfo[selectedCategory].color }
                                ]}>
                                    {categoryInfo[selectedCategory].icon} {categoryInfo[selectedCategory].name}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Answer Options */}
                    <View style={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.optionButton, getOptionStyle(option.id)]}
                                onPress={() => checkAnswer(option.id)}
                                disabled={showResult}
                            >
                                <Text style={styles.optionName}>{option.name}</Text>
                                {showResult && option.id === currentSymbol.id && (
                                    <Text style={styles.optionExample}>{option.example}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Result & Next Button */}
                    {showResult && (
                        <View style={styles.resultContainer}>
                            <View style={[
                                styles.resultBox,
                                {
                                    backgroundColor: selectedAnswer === currentSymbol.id
                                        ? colors.successLight
                                        : colors.errorLight
                                }
                            ]}>
                                <Text style={styles.resultIcon}>
                                    {selectedAnswer === currentSymbol.id ? '✓ Correto!' : '✗ Incorreto'}
                                </Text>
                                <Text style={styles.resultDescription}>
                                    {currentSymbol.description}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={() => nextQuestion()}
                            >
                                <Text style={styles.nextButtonText}>Próximo →</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

// ============================================================
// STYLES
// ============================================================

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        gradient: {
            flex: 1,
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
        header: {
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
        },
        headerIcon: {
            fontSize: 48,
            marginBottom: spacing.sm,
        },
        headerTitle: {
            fontSize: fontSize.xxl,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        headerSubtitle: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        highScoreBox: {
            marginHorizontal: spacing.xl,
            backgroundColor: colors.warningLight,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        highScoreLabel: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        highScoreValue: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.warning,
        },
        playAllButton: {
            marginHorizontal: spacing.xl,
            backgroundColor: colors.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            ...shadows.md,
        },
        playAllIcon: {
            fontSize: 32,
            marginRight: spacing.md,
        },
        playAllInfo: {
            flex: 1,
        },
        playAllTitle: {
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textWhite,
        },
        playAllSubtitle: {
            fontSize: fontSize.sm,
            color: colors.textWhite,
            opacity: 0.8,
        },
        sectionTitle: {
            marginHorizontal: spacing.xl,
            marginTop: spacing.xl,
            marginBottom: spacing.md,
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        categoryGrid: {
            paddingHorizontal: spacing.xl,
        },
        categoryCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            borderLeftWidth: 4,
            ...shadows.sm,
        },
        categoryIcon: {
            fontSize: 28,
            marginRight: spacing.md,
        },
        categoryInfo: {
            flex: 1,
        },
        categoryName: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        categoryCount: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        bottomPadding: {
            height: 100,
        },
        // Practice screen
        practiceContainer: {
            flex: 1,
            padding: spacing.xl,
        },
        statsBar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        statItem: {
            flex: 1,
        },
        statLabel: {
            fontSize: fontSize.xs,
            color: colors.textTertiary,
        },
        statValue: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        streakHot: {
            color: colors.error,
        },
        endButton: {
            backgroundColor: colors.surfaceAlt,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
        },
        endButtonText: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        questionCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            alignItems: 'center',
            marginBottom: spacing.lg,
            ...shadows.md,
        },
        questionLabel: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
            marginBottom: spacing.md,
        },
        questionSymbol: {
            fontSize: 64,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing.sm,
        },
        categoryBadge: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
        },
        categoryBadgeText: {
            fontSize: fontSize.sm,
            fontWeight: '600',
        },
        optionsContainer: {
            gap: spacing.sm,
        },
        optionButton: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderWidth: 2,
            ...shadows.sm,
        },
        optionName: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        optionExample: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: spacing.xs,
            fontStyle: 'italic',
        },
        resultContainer: {
            marginTop: spacing.lg,
        },
        resultBox: {
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        resultIcon: {
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        resultDescription: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        nextButton: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            alignItems: 'center',
        },
        nextButtonText: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: colors.textWhite,
        },
    });

export default SymbolSprintScreen;
