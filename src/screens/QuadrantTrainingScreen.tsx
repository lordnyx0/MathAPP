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
import QuadrantCircle from '../components/QuadrantCircle';
import MathText from '../components/MathText';
import { quadrantQuestions, quadrantInfo, halvesReference, getRandomQuestionNoRepeat, QuadrantQuestion, isIntervalQuestion, isBaseQuestion } from '../data/quadrantQuestions';
import { logError, createAsyncCleanup } from '../utils';
import { STORAGE_KEYS } from '../constants';
import { showToast } from '../components/Toast';
import strings from '../i18n/strings';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';

const QuadrantTrainingScreen = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [mode, setMode] = useState<'menu' | 'learn' | 'practice'>('menu');
    const [currentQuestion, setCurrentQuestion] = useState<QuadrantQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | 'eixo' | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const { isMounted, cleanup } = createAsyncCleanup();

        const loadData = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEYS.QUADRANT_STATS);
                if (isMounted() && saved) {
                    setHighScore(parseInt(saved) || 0);
                }
            } catch (error) {
                logError('QuadrantScreen.loadHighScore', error);
            }
        };

        loadData();
        initAudio(); // Initialize audio system
        return cleanup;
    }, []);

    const saveHighScore = async (newScore: number) => {
        if (newScore > highScore) {
            setHighScore(newScore);
            showToast('🏆 Novo recorde! ' + newScore + ' pontos', 'success');
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.QUADRANT_STATS, newScore.toString());
            } catch (error) {
                logError('QuadrantScreen.saveHighScore', error);
                showToast(strings.errors.saveFailedMessage, 'error');
            }
        }
    };

    const startPractice = () => {
        setMode('practice');
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        nextQuestion();
    };

    const nextQuestion = () => {
        setCurrentQuestion(getRandomQuestionNoRepeat());
        setSelectedAnswer(null);
        setShowResult(false);
        setShowHint(false);
    };

    const checkAnswer = (answer: number | 'eixo') => {
        if (!currentQuestion) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = currentQuestion.quadrant === answer ||
            (currentQuestion.quadrant === 'eixo' && answer === 'eixo');

        if (isCorrect) {
            const points = showHint ? 5 : 10;
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            playCorrect(); // Play success sound
        } else {
            setStreak(0);
            playIncorrect(); // Play error sound
        }
        setQuestionsAnswered(prev => prev + 1);
    };

    const endPractice = () => {
        // Could add Alert.alert for confirmation, but keeping UX simple
        saveHighScore(score);
        setMode('menu');
    };

    const getExplanation = (): string => {
        if (!currentQuestion) return '';

        if (isIntervalQuestion(currentQuestion)) {
            return `O intervalo ${currentQuestion.display} vai de ${currentQuestion.startFraction} a ${currentQuestion.endFraction} em termos de π.\n\nIsso corresponde ao ${currentQuestion.quadrant}º Quadrante.`;
        }

        // Now we know it's a BaseQuadrantQuestion (fraction is required)
        const baseQ = currentQuestion; // TypeScript now knows this is BaseQuadrantQuestion

        if (baseQ.quadrant === 'eixo') {
            return `${baseQ.display} = ${baseQ.fraction}π está exatamente sobre o eixo ${baseQ.axis || 'coordenado'}.`;
        }

        // quadrant is a number at this point
        const quadrantNum = baseQ.quadrant;
        const qInfo = quadrantInfo[quadrantNum];
        return `${baseQ.display} = ${baseQ.fraction}π\n\nComo ${qInfo.decimal} → ${qInfo.name}\n\n"${qInfo.mnemonic}"`;
    };

    // Menu Screen
    if (mode === 'menu') {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={colors.gradientBackground}
                    style={styles.gradient}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>🎯 Treino de Quadrantes</Text>
                            <Text style={styles.headerSubtitle}>Domine o círculo trigonométrico</Text>
                        </View>

                        {/* Reference Card */}
                        <View style={styles.referenceCard}>
                            <Text style={styles.referenceTitle}>📍 O Truque das Metades</Text>
                            <Text style={styles.referenceSubtitle}>Pense em frações de π</Text>

                            <View style={styles.referenceGrid}>
                                {halvesReference.map((ref, i) => (
                                    <View key={i} style={styles.referenceItem}>
                                        <Text style={styles.refPosition}>{ref.position}</Text>
                                        <Text style={styles.refValue}>{ref.decimal}π</Text>
                                        <MathText style={styles.refFraction}>{ref.fraction}</MathText>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.ruleBox}>
                                <Text style={styles.ruleTitle}>Como identificar o quadrante:</Text>
                                {Object.entries(quadrantInfo).map(([q, info]) => (
                                    <View key={q} style={styles.ruleRow}>
                                        <View style={[styles.ruleDot, { backgroundColor: info.color }]} />
                                        <Text style={styles.ruleText}>
                                            {info.decimal} → {info.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Circle Preview */}
                        <QuadrantCircle />

                        {/* High Score */}
                        {highScore > 0 && (
                            <View style={styles.highScoreBox}>
                                <Text style={styles.highScoreLabel}>🏆 Recorde</Text>
                                <Text style={styles.highScoreValue}>{highScore} pontos</Text>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.learnButton]}
                                onPress={() => setMode('learn')}
                                accessibilityLabel="Modo Aprender. Com dicas visuais"
                                accessibilityRole="button"
                            >
                                <Text style={styles.actionButtonIcon}>📖</Text>
                                <Text style={styles.actionButtonText}>Aprender</Text>
                                <Text style={styles.actionButtonSubtext}>Com dicas visuais</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.practiceButton]}
                                onPress={startPractice}
                                accessibilityLabel="Modo Praticar. Teste rápido de quadrantes"
                                accessibilityRole="button"
                            >
                                <Text style={styles.actionButtonIcon}>⚡</Text>
                                <Text style={styles.actionButtonText}>Praticar</Text>
                                <Text style={styles.actionButtonSubtext}>Teste rápido</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Learning Mode
    if (mode === 'learn') {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={colors.gradientBackground}
                    style={styles.gradient}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setMode('menu')}
                            accessibilityLabel={strings.a11y.backButton}
                            accessibilityRole="button"
                        >
                            <Text style={styles.backButtonText}>{strings.back}</Text>
                        </TouchableOpacity>

                        <View style={styles.learnHeader}>
                            <Text style={styles.learnTitle}>📖 Modo Aprendizado</Text>
                            <Text style={styles.learnSubtitle}>Estude os quadrantes e seus sinais</Text>
                        </View>

                        <QuadrantCircle showLabels={true} />

                        {/* Quadrant Details */}
                        <View style={styles.quadrantDetails}>
                            {Object.entries(quadrantInfo).map(([q, info]) => (
                                <View key={q} style={[styles.quadrantCard, { borderLeftColor: info.color }]}>
                                    <View style={styles.quadrantCardHeader}>
                                        <Text style={[styles.quadrantName, { color: info.color }]}>{info.name}</Text>
                                        <Text style={styles.quadrantRange}>{info.degrees}</Text>
                                    </View>
                                    <Text style={styles.quadrantDecimal}>Decimal: {info.decimal}</Text>
                                    <Text style={styles.quadrantMnemonic}>"{info.mnemonic}"</Text>
                                    <View style={styles.signsRow}>
                                        <Text style={[styles.sign, { color: info.signs.sin === '+' ? colors.success : colors.error }]}>
                                            sen: {info.signs.sin}
                                        </Text>
                                        <Text style={[styles.sign, { color: info.signs.cos === '+' ? colors.success : colors.error }]}>
                                            cos: {info.signs.cos}
                                        </Text>
                                        <Text style={[styles.sign, { color: info.signs.tan === '+' ? colors.success : colors.error }]}>
                                            tan: {info.signs.tan}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Mnemonic */}
                        <View style={styles.mnemonicBox}>
                            <Text style={styles.mnemonicTitle}>🧠 Macete: "Todo Sonho Tem Cura"</Text>
                            <Text style={styles.mnemonicText}>
                                1º: <Text style={{ fontWeight: '700' }}>T</Text>odos positivos{'\n'}
                                2º: <Text style={{ fontWeight: '700' }}>S</Text>eno positivo{'\n'}
                                3º: <Text style={{ fontWeight: '700' }}>T</Text>angente positiva{'\n'}
                                4º: <Text style={{ fontWeight: '700' }}>C</Text>osseno positivo
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.startPracticeButton}
                            onPress={startPractice}
                        >
                            <Text style={styles.startPracticeText}>Pronto para praticar? ⚡</Text>
                        </TouchableOpacity>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Practice Mode
    if (!currentQuestion) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={colors.gradientBackground}
                style={styles.gradient}
            >
                <View style={styles.practiceContainer}>
                    {/* Stats Bar */}
                    <View style={styles.statsBar}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>{strings.quadrant.points}</Text>
                            <Text style={styles.statValue}>{score}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>{strings.quadrant.streak}</Text>
                            <Text style={[styles.statValue, streak >= 3 && styles.streakHot]}>
                                {streak >= 3 ? '🔥' : ''}{streak}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.endButton}
                            onPress={endPractice}
                            accessibilityLabel={strings.quadrant.end}
                            accessibilityRole="button"
                        >
                            <Text style={styles.endButtonText}>{strings.quadrant.end}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Question */}
                    <View style={styles.questionCard}>
                        <Text style={styles.questionLabel}>{strings.quadrant.whichQuadrant}</Text>
                        <MathText style={styles.questionAngle} size="xlarge">θ = {currentQuestion?.display}</MathText>
                    </View>

                    {/* Circle */}
                    <QuadrantCircle
                        highlightedQuadrant={showResult ? (typeof currentQuestion?.quadrant === 'number' ? currentQuestion.quadrant : null) : null}
                    />

                    {/* Hint Button */}
                    {!showResult && !showHint && (
                        <TouchableOpacity
                            style={styles.hintButton}
                            onPress={() => setShowHint(true)}
                            accessibilityLabel={strings.quadrant.showHint}
                            accessibilityRole="button"
                        >
                            <Text style={styles.hintButtonText}>{strings.quadrant.showHint}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Hint Display */}
                    {showHint && !showResult && currentQuestion && (
                        <View style={styles.hintBox}>
                            <Text style={styles.hintText}>
                                {isBaseQuestion(currentQuestion)
                                    ? `${currentQuestion.fraction} = ${currentQuestion.fraction}π\nDivida: ${currentQuestion.fraction} ≈ ${currentQuestion.fraction.toFixed(2)}`
                                    : `Intervalo de ${currentQuestion.startFraction} a ${currentQuestion.endFraction}π`
                                }
                            </Text>
                        </View>
                    )}

                    {/* Answer Buttons */}
                    {!showResult ? (
                        <View style={styles.answerGrid}>
                            {[1, 2, 3, 4].map((q) => (
                                <TouchableOpacity
                                    key={q}
                                    style={[styles.answerButton, { borderColor: quadrantInfo[q].color }]}
                                    onPress={() => checkAnswer(q)}
                                    accessibilityLabel={`Selecionar ${q}º Quadrante`}
                                    accessibilityRole="button"
                                >
                                    <Text style={[styles.answerButtonText, { color: quadrantInfo[q].color }]}>
                                        {q}º Quadrante
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {/* Axis button for angles on axes (π/2, π, 3π/2, 2π) */}
                            <TouchableOpacity
                                style={[styles.axisButton, { borderColor: colors.warning }]}
                                onPress={() => checkAnswer('eixo')}
                                accessibilityLabel="Selecionar Sobre Eixo"
                                accessibilityRole="button"
                            >
                                <Text style={[styles.axisButtonText, { color: colors.warning }]}>
                                    📍 Sobre Eixo
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.resultContainer}>
                            {/* Result */}
                            <View style={[
                                styles.resultBox,
                                {
                                    backgroundColor: selectedAnswer === currentQuestion.quadrant ||
                                        (currentQuestion.quadrant === 'eixo' && selectedAnswer === 'eixo')
                                        ? colors.successLight : colors.errorLight
                                }
                            ]}>
                                <Text style={styles.resultIcon}>
                                    {selectedAnswer === currentQuestion.quadrant ? '✓ Correto!' : '✗ Incorreto'}
                                </Text>
                                <MathText style={styles.resultExplanation}>{getExplanation()}</MathText>
                            </View>

                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={nextQuestion}
                                accessibilityLabel={strings.quadrant.nextQuestion}
                                accessibilityRole="button"
                            >
                                <Text style={styles.nextButtonText}>{strings.quadrant.nextQuestion}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
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
    },
    referenceCard: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    referenceTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    referenceSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    referenceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
    },
    referenceItem: {
        width: '50%',
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    refPosition: {
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    refValue: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.primary,
    },
    refFraction: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    ruleBox: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    ruleTitle: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    ruleDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: spacing.sm,
    },
    ruleText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    highScoreBox: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.warningLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.lg,
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
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    actionButton: {
        flex: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    learnButton: {
        backgroundColor: colors.info,
    },
    practiceButton: {
        backgroundColor: colors.primary,
    },
    actionButtonIcon: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    actionButtonText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textWhite,
    },
    actionButtonSubtext: {
        fontSize: fontSize.xs,
        color: colors.textWhite,
        opacity: 0.8,
    },
    bottomPadding: {
        height: 100,
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
    learnHeader: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    learnTitle: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    learnSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    quadrantDetails: {
        paddingHorizontal: spacing.xl,
    },
    quadrantCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        ...shadows.sm,
    },
    quadrantCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    quadrantName: {
        fontSize: fontSize.md,
        fontWeight: '700',
    },
    quadrantRange: {
        fontSize: fontSize.sm,
        color: colors.textTertiary,
    },
    quadrantDecimal: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    quadrantMnemonic: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: spacing.sm,
    },
    signsRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    sign: {
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    mnemonicBox: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.warningLight,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginTop: spacing.lg,
    },
    mnemonicTitle: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    mnemonicText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    startPracticeButton: {
        marginHorizontal: spacing.xl,
        marginTop: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    startPracticeText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textWhite,
    },
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
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    questionLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    questionAngle: {
        fontSize: fontSize.xxxl,
        fontWeight: '700',
        color: colors.primary,
    },
    hintButton: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    hintButtonText: {
        fontSize: fontSize.sm,
        color: colors.warning,
    },
    hintBox: {
        backgroundColor: colors.warningLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    hintText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    answerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    answerButton: {
        width: '47%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 2,
        ...shadows.sm,
    },
    answerButtonText: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    axisButton: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        marginTop: spacing.sm,
        ...shadows.sm,
    },
    axisButtonText: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    resultContainer: {
        flex: 1,
    },
    resultBox: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    resultIcon: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    resultExplanation: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    nextButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textWhite,
    },
});

export default QuadrantTrainingScreen;

