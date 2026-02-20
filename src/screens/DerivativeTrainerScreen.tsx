/**
 * Derivative Trainer Screen - Practice derivative rules
 * 
 * Modes:
 * - Practice: MCQ to find the derivative of a function
 * - Rules: Browse and learn derivative rules
 */
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
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import { logError, createAsyncCleanup } from '../utils';
import { showToast } from '../components/Toast';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import BackButton from '../components/BackButton';
import MathText from '../components/MathText';
import {
    DerivativeQuestion,
    DerivativeRule,
    DifficultyLevel,
    derivativeRules,
    getRandomQuestion,
    getWrongDerivatives,
    getRuleById,
    DERIVATIVE_TRAINER_STATS_KEY,
} from '../data/derivativeQuestions';

// ============================================================
// TYPES
// ============================================================

type GameMode = 'menu' | 'practice' | 'rules';

interface DerivativeTrainerScreenProps {
    onBack?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

const DerivativeTrainerScreen: React.FC<DerivativeTrainerScreenProps> = ({ onBack }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // State
    const [mode, setMode] = useState<GameMode>('menu');
    const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(undefined);
    const [currentQuestion, setCurrentQuestion] = useState<DerivativeQuestion | null>(null);
    const [options, setOptions] = useState<string[]>([]);
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
                const saved = await AsyncStorage.getItem(DERIVATIVE_TRAINER_STATS_KEY);
                if (isMounted() && saved) {
                    const stats = JSON.parse(saved);
                    setHighScore(stats.highScore || 0);
                }
            } catch (error) {
                logError('DerivativeTrainerScreen.loadStats', error);
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
                    DERIVATIVE_TRAINER_STATS_KEY,
                    JSON.stringify({ highScore: newScore })
                );
            } catch (error) {
                logError('DerivativeTrainerScreen.saveHighScore', error);
            }
        }
    };

    // Start practice
    const startPractice = (diff?: DifficultyLevel) => {
        setDifficulty(diff);
        setMode('practice');
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        nextQuestion(diff);
    };

    // Next question
    const nextQuestion = (diff: DifficultyLevel | undefined = difficulty) => {
        const question = getRandomQuestion(diff);
        const wrongAnswers = getWrongDerivatives(question, 3);
        const allOptions = [question.derivative, ...wrongAnswers].sort(() => Math.random() - 0.5);

        setCurrentQuestion(question);
        setOptions(allOptions);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    // Check answer
    const checkAnswer = (answer: string) => {
        if (!currentQuestion || showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentQuestion.derivative;

        if (isCorrect) {
            const difficultyBonus =
                currentQuestion.difficulty === 'avancado' ? 15 :
                    currentQuestion.difficulty === 'intermediario' ? 10 : 5;
            const points = difficultyBonus + streak * 2;
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
    const getOptionStyle = (option: string) => {
        if (!showResult) {
            return { borderColor: colors.border };
        }
        if (option === currentQuestion?.derivative) {
            return { borderColor: colors.success, backgroundColor: colors.successLight };
        }
        if (option === selectedAnswer && option !== currentQuestion?.derivative) {
            return { borderColor: colors.error, backgroundColor: colors.errorLight };
        }
        return { borderColor: colors.border };
    };

    // Get difficulty color
    const getDifficultyColor = (diff: DifficultyLevel) => {
        switch (diff) {
            case 'basico': return '#10B981';
            case 'intermediario': return '#F59E0B';
            case 'avancado': return '#EF4444';
        }
    };

    // ============================================================
    // MENU SCREEN
    // ============================================================

    if (mode === 'menu') {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {onBack && <BackButton onPress={onBack} />}

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerIcon}>📐</Text>
                            <Text style={styles.headerTitle}>Derivadas Trainer</Text>
                            <Text style={styles.headerSubtitle}>
                                Domine as regras de derivação
                            </Text>
                        </View>

                        {/* High Score */}
                        {highScore > 0 && (
                            <View style={styles.highScoreBox}>
                                <Text style={styles.highScoreLabel}>🏆 Recorde</Text>
                                <Text style={styles.highScoreValue}>{highScore} pontos</Text>
                            </View>
                        )}

                        {/* Practice Modes */}
                        <Text style={styles.sectionTitle}>Praticar Derivadas</Text>

                        <TouchableOpacity
                            style={[styles.modeCard, { borderLeftColor: '#6366F1' }]}
                            onPress={() => startPractice(undefined)}
                        >
                            <View style={[styles.modeIconWrapper, { backgroundColor: '#6366F120' }]}>
                                <Text style={styles.modeIcon}>🎯</Text>
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeName}>Todas as Regras</Text>
                                <Text style={styles.modeDescription}>
                                    Mix aleatório de dificuldades
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeCard, { borderLeftColor: '#10B981' }]}
                            onPress={() => startPractice('basico')}
                        >
                            <View style={[styles.modeIconWrapper, { backgroundColor: '#10B98120' }]}>
                                <Text style={styles.modeIcon}>🌱</Text>
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeName}>Básico</Text>
                                <Text style={styles.modeDescription}>
                                    Potência, constante, soma
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeCard, { borderLeftColor: '#F59E0B' }]}
                            onPress={() => startPractice('intermediario')}
                        >
                            <View style={[styles.modeIconWrapper, { backgroundColor: '#F59E0B20' }]}>
                                <Text style={styles.modeIcon}>⚡</Text>
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeName}>Intermediário</Text>
                                <Text style={styles.modeDescription}>
                                    Trig, exp, ln
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeCard, { borderLeftColor: '#EF4444' }]}
                            onPress={() => startPractice('avancado')}
                        >
                            <View style={[styles.modeIconWrapper, { backgroundColor: '#EF444420' }]}>
                                <Text style={styles.modeIcon}>🔥</Text>
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeName}>Avançado</Text>
                                <Text style={styles.modeDescription}>
                                    Cadeia, produto, quociente
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Rules Section */}
                        <Text style={styles.sectionTitle}>Revisar Regras</Text>
                        <TouchableOpacity
                            style={[styles.modeCard, { borderLeftColor: '#8B5CF6' }]}
                            onPress={() => setMode('rules')}
                        >
                            <View style={[styles.modeIconWrapper, { backgroundColor: '#8B5CF620' }]}>
                                <Text style={styles.modeIcon}>📚</Text>
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeName}>Fórmulas</Text>
                                <Text style={styles.modeDescription}>
                                    Todas as regras de derivação
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ============================================================
    // RULES SCREEN
    // ============================================================

    if (mode === 'rules') {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <BackButton onPress={() => setMode('menu')} />

                        <View style={styles.header}>
                            <Text style={styles.headerIcon}>📚</Text>
                            <Text style={styles.headerTitle}>Regras de Derivação</Text>
                        </View>

                        {derivativeRules.map((rule) => (
                            <View
                                key={rule.id}
                                style={[styles.ruleCard, { borderLeftColor: getDifficultyColor(rule.difficulty) }]}
                            >
                                <View style={styles.ruleHeader}>
                                    <Text style={styles.ruleName}>{rule.name}</Text>
                                    <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(rule.difficulty) + '20' }]}>
                                        <Text style={[styles.diffBadgeText, { color: getDifficultyColor(rule.difficulty) }]}>
                                            {rule.difficulty}
                                        </Text>
                                    </View>
                                </View>
                                <MathText style={styles.ruleFormula}>{rule.formula}</MathText>
                                <Text style={styles.ruleDescription}>{rule.description}</Text>
                                <View style={styles.ruleExamples}>
                                    {rule.examples.map((ex, i) => (
                                        <Text key={i} style={styles.ruleExample}>• {ex}</Text>
                                    ))}
                                </View>
                            </View>
                        ))}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ============================================================
    // PRACTICE SCREEN
    // ============================================================

    if (!currentQuestion) return null;

    const rule = getRuleById(currentQuestion.rule);

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
                        <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) + '20' }]}>
                            <Text style={[styles.diffBadgeText, { color: getDifficultyColor(currentQuestion.difficulty) }]}>
                                {currentQuestion.difficulty}
                            </Text>
                        </View>
                        <Text style={styles.questionLabel}>Qual é a derivada de:</Text>
                        <MathText style={styles.questionFunction}>
                            f(x) = {currentQuestion.function}
                        </MathText>
                    </View>

                    {/* Answer Options */}
                    <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.optionsContainer}>
                            {options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.optionButton, getOptionStyle(option)]}
                                    onPress={() => checkAnswer(option)}
                                    disabled={showResult}
                                >
                                    <MathText style={styles.optionText}>f'(x) = {option}</MathText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Result & Explanation */}
                        {showResult && (
                            <View style={styles.resultContainer}>
                                <View style={[
                                    styles.resultBox,
                                    {
                                        backgroundColor: selectedAnswer === currentQuestion.derivative
                                            ? colors.successLight
                                            : colors.errorLight
                                    }
                                ]}>
                                    <Text style={styles.resultIcon}>
                                        {selectedAnswer === currentQuestion.derivative ? '✓ Correto!' : '✗ Incorreto'}
                                    </Text>
                                    <Text style={styles.resultRule}>
                                        Regra: {rule?.name}
                                    </Text>
                                    <Text style={styles.resultExplanation}>
                                        {currentQuestion.explanation}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.nextButton}
                                    onPress={() => nextQuestion()}
                                >
                                    <Text style={styles.nextButtonText}>Próxima →</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

// ============================================================
// STYLES
// ============================================================

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        gradient: {
            flex: 1,
        },
        header: {
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
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
        sectionTitle: {
            marginHorizontal: spacing.xl,
            marginTop: spacing.lg,
            marginBottom: spacing.md,
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        modeCard: {
            marginHorizontal: spacing.xl,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            borderLeftWidth: 4,
            ...shadows.sm,
        },
        modeIconWrapper: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
        },
        modeIcon: {
            fontSize: 24,
        },
        modeInfo: {
            flex: 1,
        },
        modeName: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        modeDescription: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        bottomPadding: {
            height: 100,
        },
        // Rules screen
        ruleCard: {
            marginHorizontal: spacing.xl,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderLeftWidth: 4,
            ...shadows.sm,
        },
        ruleHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.sm,
        },
        ruleName: {
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        diffBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
        },
        diffBadgeText: {
            fontSize: fontSize.xs,
            fontWeight: '600',
        },
        ruleFormula: {
            fontSize: fontSize.lg,
            fontWeight: '600',
            color: colors.primary,
            marginBottom: spacing.sm,
        },
        ruleDescription: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginBottom: spacing.sm,
        },
        ruleExamples: {
            backgroundColor: colors.surfaceAlt,
            borderRadius: borderRadius.sm,
            padding: spacing.sm,
        },
        ruleExample: {
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            fontStyle: 'italic',
        },
        // Practice screen
        practiceContainer: {
            flex: 1,
            padding: spacing.lg,
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
            padding: spacing.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
            ...shadows.md,
        },
        questionLabel: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
            marginTop: spacing.sm,
            marginBottom: spacing.sm,
        },
        questionFunction: {
            fontSize: 32,
            fontWeight: '700',
            color: colors.primary,
        },
        optionsScroll: {
            flex: 1,
        },
        optionsContainer: {
            gap: spacing.sm,
        },
        optionButton: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderWidth: 2,
            alignItems: 'center',
            ...shadows.sm,
        },
        optionText: {
            fontSize: fontSize.lg,
            fontWeight: '600',
            color: colors.textPrimary,
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
        resultRule: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        resultExplanation: {
            fontSize: fontSize.sm,
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

export default DerivativeTrainerScreen;
