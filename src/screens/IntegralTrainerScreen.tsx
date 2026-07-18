/**
 * Integral Trainer Screen - Practice primitive integrals
 * 
 * Modes:
 * - Practice: MCQ to find the primitive of a function
 * - Rules: Browse and learn integration rules
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { TAB_BAR_CLEARANCE } from '../constants/layout';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import { createAsyncCleanup } from '../utils';
import { loadHighScore, persistHighScore } from '../utils/highScore';
import { showToast } from '../components/Toast';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import { notifySuccess, notifyError } from '../utils/haptics';
import { recordTopicAnswer } from '../learning/topicMastery';
import BackButton from '../components/BackButton';
import TrainerStatsBar from '../components/TrainerStatsBar';
import MathText, { latexToUnicode } from '../components/MathText';
import {
    IntegralQuestion,
    DifficultyLevel,
    integralRules,
    getRandomQuestion,
    getWrongIntegrals,
    getRuleById,
    INTEGRAL_TRAINER_STATS_KEY,
} from '../data/integralQuestions';

// ============================================================
// TYPES
// ============================================================

type GameMode = 'menu' | 'practice' | 'rules';

interface IntegralTrainerScreenProps {
    onBack?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

const IntegralTrainerScreen: React.FC<IntegralTrainerScreenProps> = ({ onBack }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // State
    const [mode, setMode] = useState<GameMode>('menu');
    const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(undefined);
    const [currentQuestion, setCurrentQuestion] = useState<IntegralQuestion | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [recentQuestions, setRecentQuestions] = useState<IntegralQuestion[]>([]);

    // Load high score on mount
    useEffect(() => {
        const { isMounted, cleanup } = createAsyncCleanup();

        loadHighScore(INTEGRAL_TRAINER_STATS_KEY).then(hs => {
            if (isMounted()) setHighScore(hs);
        });
        initAudio();
        return cleanup;
    }, []);

    // Save high score
    const saveHighScore = async (newScore: number) => {
        const updated = await persistHighScore(INTEGRAL_TRAINER_STATS_KEY, newScore, highScore);
        if (updated > highScore) {
            setHighScore(updated);
            showToast('🏆 Novo recorde! ' + updated + ' pontos', 'success');
        }
    };

    // Start practice
    const startPractice = (diff?: DifficultyLevel) => {
        setDifficulty(diff);
        setMode('practice');
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        setRecentQuestions([]);
        nextQuestion(diff, []);
    };

    // Next question
    const nextQuestion = (
        diff: DifficultyLevel | undefined = difficulty,
        historyOverride?: IntegralQuestion[]
    ) => {
        const history = historyOverride !== undefined ? historyOverride : recentQuestions;
        let question: IntegralQuestion;
        let attempts = 0;
        const historyLimit = 4;

        do {
            question = getRandomQuestion(diff);
            attempts++;
            const isExactRepeat = history.some(q => q.function === question.function);
            const isConsecutiveRuleRepeat = history.length > 0 && history[history.length - 1].rule === question.rule;
            
            if (!isExactRepeat && (attempts > 5 || !isConsecutiveRuleRepeat)) {
                break;
            }
        } while (attempts < 10);

        setRecentQuestions(prev => {
            const baseHistory = historyOverride !== undefined ? historyOverride : prev;
            const next = [...baseHistory, question];
            if (next.length > historyLimit) {
                next.shift();
            }
            return next;
        });

        const wrongAnswers = getWrongIntegrals(question, 3);
        const allOptions = [question.integral, ...wrongAnswers].sort(() => Math.random() - 0.5);

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

        const isCorrect = answer === currentQuestion.integral;

        if (isCorrect) {
            const difficultyBonus =
                currentQuestion.difficulty === 'avancado' ? 15 :
                    currentQuestion.difficulty === 'intermediario' ? 10 : 5;
            const points = difficultyBonus + streak * 2;
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            playCorrect(); notifySuccess();
        } else {
            setStreak(0);
            playIncorrect(); notifyError();
        }
        setQuestionsAnswered(prev => prev + 1);
        recordTopicAnswer('integrais', isCorrect, isCorrect ? streak + 1 : 0);
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
        if (option === currentQuestion?.integral) {
            return { borderColor: colors.success, backgroundColor: colors.successLight };
        }
        if (option === selectedAnswer && option !== currentQuestion?.integral) {
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
                            <Text style={styles.headerIcon}>∫</Text>
                            <Text style={styles.headerTitle}>Integrals Trainer</Text>
                            <Text style={styles.headerSubtitle}>
                                Domine as primitivas e regras de integração
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
                        <Text style={styles.sectionTitle}>Praticar Integrais</Text>

                        <TouchableOpacity
                            style={[styles.modeCard, { borderLeftColor: '#6366F1' }]}
                            onPress={() => startPractice(undefined)}
                        >
                            <View style={[styles.modeIconWrapper, { backgroundColor: '#6366F120' }]}>
                                <Text style={styles.modeIcon}>🎯</Text>
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeName}>Todas as Primitivas</Text>
                                <Text style={styles.modeDescription}>
                                    Mix aleatório
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
                                    Potência, constante, 1/x
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
                                    Trig, exp
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
                                <Text style={styles.modeName}>Tabela de Primitivas</Text>
                                <Text style={styles.modeDescription}>
                                    Todas as integrais imediatas
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
                            <Text style={styles.headerTitle}>Integrais Imediatas</Text>
                        </View>

                        {integralRules.map((rule) => (
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
                    <TrainerStatsBar
                        score={score}
                        streak={streak}
                        questionsAnswered={questionsAnswered}
                        onEnd={endPractice}
                    />

                    {/* Question Card */}
                    <View style={styles.questionCard}>
                        <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) + '20' }]}>
                            <Text style={[styles.diffBadgeText, { color: getDifficultyColor(currentQuestion.difficulty) }]}>
                                {currentQuestion.difficulty}
                            </Text>
                        </View>
                        <Text style={styles.questionLabel}>Calcule a primitiva (integral indefinida):</Text>
                        <MathText style={styles.questionFunction}>
                            {`\\int ${currentQuestion.function} dx`}
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
                                    accessibilityRole="button"
                                    accessibilityLabel={latexToUnicode(option)}
                                    accessibilityState={{ disabled: showResult }}
                                >
                                    <MathText style={styles.optionText}>{option}</MathText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Result & Explanation */}
                        {showResult && (
                            <View style={styles.resultContainer}>
                                <View style={[
                                    styles.resultBox,
                                    {
                                        backgroundColor: selectedAnswer === currentQuestion.integral
                                            ? colors.successLight
                                            : colors.errorLight
                                    }
                                ]}>
                                    <Text style={styles.resultIcon}>
                                        {selectedAnswer === currentQuestion.integral ? '✓ Correto!' : '✗ Incorreto'}
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
            fontWeight: '300',
            color: colors.textPrimary,
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
            height: TAB_BAR_CLEARANCE,
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

export default IntegralTrainerScreen;
