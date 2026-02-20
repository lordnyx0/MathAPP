// MCQ Practice Screen - Multiple Choice with Learning Psychology Features
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import ConfidenceSlider from '../components/ConfidenceSlider';
import { AnimatedCard, FadeInView } from '../components/AnimatedCard';
import { showToast } from '../components/Toast';
import { playCorrect, playIncorrect } from '../utils/sounds';
import strings from '../i18n/strings';
import MathText from '../components/MathText';
import BackButton from '../components/BackButton';
import type { MCQ } from '../types';

// Learning modules
import { createInterleavedSession, createAdaptiveSession } from '../learning/interleaving';
import { createEntry, getCalibrationFeedback, loadEntries, saveEntries, MetacognitionEntry, CalibrationType } from '../learning/metacognition';
import { createCard, calculateNextReview, Quality, loadCards, saveCards, getOrCreateCard, getStats, SRSCard, SRSStats } from '../learning/srs';

interface SessionResult {
    question: MCQ;
    selectedOption: string | null;
    confidence: number | null;
    isCorrect: boolean;
    calibration: CalibrationType;
}

interface MCQPracticeScreenProps {
    onBack?: () => void;
}

const MCQPracticeScreen: React.FC<MCQPracticeScreenProps> = ({ onBack }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [mode, setMode] = useState<'menu' | 'practice' | 'results'>('menu');
    const [questions, setQuestions] = useState<MCQ[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
    const [srsCards, setSrsCards] = useState<SRSCard[]>([]);
    const [metaEntries, setMetaEntries] = useState<MetacognitionEntry[]>([]);
    const [srsStats, setSrsStats] = useState<SRSStats | null>(null);

    // Load saved data
    useEffect(() => {
        const loadData = async () => {
            const cards = await loadCards();
            const entries = await loadEntries();
            setSrsCards(cards);
            setMetaEntries(entries);
            setSrsStats(getStats(cards));
        };
        loadData();
    }, []);

    const startSession = useCallback((type = 'interleaved') => {
        let sessionQuestions;
        if (type === 'adaptive') {
            sessionQuestions = createAdaptiveSession(metaEntries, 10);
        } else {
            sessionQuestions = createInterleavedSession(10);
        }
        setQuestions(sessionQuestions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setConfidence(null);
        setShowResult(false);
        setSessionResults([]);
        setMode('practice');
    }, [metaEntries]);

    const currentQuestion = questions[currentIndex];

    const handleAnswer = async () => {
        if (!selectedOption || !confidence) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;

        // Play sound
        if (isCorrect) {
            playCorrect();
        } else {
            playIncorrect();
        }

        // Create metacognition entry
        const metaEntry = createEntry(
            currentQuestion.id,
            currentQuestion.topic,
            confidence,
            isCorrect
        );
        const newMetaEntries = [...metaEntries, metaEntry];
        setMetaEntries(newMetaEntries);
        await saveEntries(newMetaEntries);

        // Update SRS card
        const quality = isCorrect
            ? (confidence >= 4 ? Quality.PERFECT : Quality.CORRECT_HESITANT)
            : (confidence <= 2 ? Quality.WRONG_HARD : Quality.WRONG_RECOGNIZED);

        let card = getOrCreateCard(srsCards, currentQuestion.id, currentQuestion.topic);
        card = calculateNextReview(card, quality);

        const existingIndex = srsCards.findIndex(c => c.questionId === currentQuestion.id);
        const newCards = existingIndex >= 0
            ? [...srsCards.slice(0, existingIndex), card, ...srsCards.slice(existingIndex + 1)]
            : [...srsCards, card];
        setSrsCards(newCards);
        await saveCards(newCards);

        // Record result
        setSessionResults([...sessionResults, {
            question: currentQuestion,
            selectedOption,
            confidence,
            isCorrect,
            calibration: metaEntry.calibration,
        }]);

        setShowResult(true);
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setConfidence(null);
            setShowResult(false);
        } else {
            setMode('results');
        }
    };

    const getOptionStyle = (option: { id: string }): { backgroundColor?: string; borderColor?: string } => {
        if (!showResult) {
            return selectedOption === option.id ? styles.optionSelected : {};
        }
        if (option.id === currentQuestion.correctAnswer) {
            return styles.optionCorrect;
        }
        if (option.id === selectedOption && option.id !== currentQuestion.correctAnswer) {
            return styles.optionWrong;
        }
        return {};
    };

    // Menu Screen
    if (mode === 'menu') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {onBack && <BackButton onPress={onBack} />}

                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>🎯 Prática Inteligente</Text>
                            <Text style={styles.headerSubtitle}>MCQ com Spaced Repetition</Text>
                        </View>

                        {srsStats && (
                            <View style={styles.statsCard}>
                                <Text style={styles.statsTitle}>📊 Suas Estatísticas</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{srsStats.total}</Text>
                                        <Text style={styles.statLabel}>Questões</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{srsStats.accuracy}%</Text>
                                        <Text style={styles.statLabel}>Acurácia</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{srsStats.due}</Text>
                                        <Text style={styles.statLabel}>Para Revisar</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.modeCard}
                            onPress={() => startSession('interleaved')}
                        >
                            <Text style={styles.modeIcon}>🔀</Text>
                            <View style={styles.modeContent}>
                                <Text style={styles.modeTitle}>Prática Intercalada</Text>
                                <Text style={styles.modeDesc}>Mistura de todos os tópicos</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modeCard}
                            onPress={() => startSession('adaptive')}
                        >
                            <Text style={styles.modeIcon}>🎯</Text>
                            <View style={styles.modeContent}>
                                <Text style={styles.modeTitle}>Prática Adaptativa</Text>
                                <Text style={styles.modeDesc}>Foco nos seus pontos fracos</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>💡 Como funciona</Text>
                            <Text style={styles.infoText}>
                                1. Avalie sua confiança ANTES de responder{'\n'}
                                2. Selecione a resposta correta{'\n'}
                                3. O sistema aprende seu padrão{'\n'}
                                4. Questões difíceis aparecem mais vezes
                            </Text>
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Practice Screen
    if (mode === 'practice' && currentQuestion) {
        const calibrationFeedback = showResult
            ? getCalibrationFeedback(sessionResults[sessionResults.length - 1]?.calibration)
            : null;

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[
                                    styles.progressFill,
                                    { width: `${((currentIndex + 1) / questions.length) * 100}%` }
                                ]} />
                            </View>
                            <Text style={styles.progressText}>
                                {currentIndex + 1} / {questions.length}
                            </Text>
                        </View>

                        {/* Question */}
                        <FadeInView key={currentQuestion.id}>
                            <View style={styles.questionCard}>
                                <Text style={styles.questionTopic}>{currentQuestion.topic}</Text>
                                <MathText style={styles.questionText} size="large">{currentQuestion.question}</MathText>
                            </View>

                            {/* Confidence Slider - only show before answering */}
                            {!showResult && (
                                <ConfidenceSlider
                                    onSelect={setConfidence}
                                    selected={confidence}
                                />
                            )}

                            {/* Options */}
                            <View style={styles.optionsContainer}>
                                {currentQuestion.options.map((option, index) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.optionButton,
                                            getOptionStyle(option),
                                        ]}
                                        onPress={() => !showResult && setSelectedOption(option.id)}
                                        disabled={showResult}
                                    >
                                        <View style={styles.optionHeader}>
                                            <Text style={[
                                                styles.optionId,
                                                getOptionStyle(option).backgroundColor && { color: colors.textWhite }
                                            ]}>
                                                {option.id}
                                            </Text>
                                            <MathText
                                                style={[
                                                    styles.optionText,
                                                    getOptionStyle(option).backgroundColor && { color: colors.textWhite }
                                                ]}
                                            >
                                                {option.text}
                                            </MathText>
                                        </View>
                                        {showResult && (
                                            <MathText style={styles.optionExplanation}>
                                                {option.explanation}
                                            </MathText>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Calibration Feedback */}
                            {showResult && calibrationFeedback && (
                                <View style={styles.calibrationCard}>
                                    <Text style={styles.calibrationEmoji}>{calibrationFeedback.emoji}</Text>
                                    <Text style={styles.calibrationMessage}>{calibrationFeedback.message}</Text>
                                    <Text style={styles.calibrationTip}>{calibrationFeedback.tip}</Text>
                                </View>
                            )}

                            {/* Action Button */}
                            {!showResult ? (
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        (!selectedOption || !confidence) && styles.actionButtonDisabled
                                    ]}
                                    onPress={handleAnswer}
                                    disabled={!selectedOption || !confidence}
                                >
                                    <Text style={styles.actionButtonText}>Confirmar Resposta</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={nextQuestion}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {currentIndex < questions.length - 1 ? 'Próxima →' : 'Ver Resultados'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </FadeInView>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Results Screen
    if (mode === 'results') {
        const correctCount = sessionResults.filter(r => r.isCorrect).length;
        const overconfident = sessionResults.filter(r => r.calibration === 'overconfident').length;
        const underconfident = sessionResults.filter(r => r.calibration === 'underconfident').length;

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>📊 Resultados</Text>
                        </View>

                        <View style={styles.resultsCard}>
                            <Text style={styles.scoreText}>
                                {correctCount} / {questions.length}
                            </Text>
                            <Text style={styles.scoreLabel}>Corretas</Text>
                        </View>

                        <View style={styles.calibrationStats}>
                            {overconfident > 0 && (
                                <View style={[styles.calibrationStat, { backgroundColor: colors.warningLight }]}>
                                    <Text style={styles.calibrationStatEmoji}>⚠️</Text>
                                    <Text style={styles.calibrationStatText}>
                                        {overconfident} excesso de confiança
                                    </Text>
                                </View>
                            )}
                            {underconfident > 0 && (
                                <View style={[styles.calibrationStat, { backgroundColor: colors.successLight }]}>
                                    <Text style={styles.calibrationStatEmoji}>🌟</Text>
                                    <Text style={styles.calibrationStatText}>
                                        {underconfident} subestimou conhecimento
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setMode('menu')}
                        >
                            <Text style={styles.actionButtonText}>Voltar ao Menu</Text>
                        </TouchableOpacity>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return null;
};

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    gradient: { flex: 1 },
    backButton: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
    backButtonText: { fontSize: fontSize.md, color: colors.textSecondary },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
    headerTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.textPrimary },
    headerSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
    bottomPadding: { height: 100 },

    // Stats
    statsCard: { margin: spacing.xl, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.md },
    statsTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.primary },
    statLabel: { fontSize: fontSize.sm, color: colors.textSecondary },

    // Mode Cards
    modeCard: { flexDirection: 'row', alignItems: 'center', margin: spacing.xl, marginTop: 0, marginBottom: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.md },
    modeIcon: { fontSize: 32, marginRight: spacing.md },
    modeContent: { flex: 1 },
    modeTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
    modeDesc: { fontSize: fontSize.sm, color: colors.textSecondary },

    // Info Card
    infoCard: { margin: spacing.xl, marginTop: 0, padding: spacing.lg, backgroundColor: colors.infoLight, borderRadius: borderRadius.lg },
    infoTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.info, marginBottom: spacing.sm },
    infoText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

    // Progress
    progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
    progressBar: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: borderRadius.full, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
    progressText: { marginLeft: spacing.md, fontSize: fontSize.sm, color: colors.textSecondary },

    // Question
    questionCard: { margin: spacing.xl, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.md },
    questionTopic: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm, textTransform: 'uppercase' },
    questionText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, lineHeight: 26 },

    // Options
    optionsContainer: { marginHorizontal: spacing.xl },
    optionButton: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: colors.border, ...shadows.sm },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    optionCorrect: { borderColor: colors.success, backgroundColor: colors.success },
    optionWrong: { borderColor: colors.error, backgroundColor: colors.error },
    optionHeader: { flexDirection: 'row', alignItems: 'center' },
    optionId: { width: 28, height: 28, borderRadius: borderRadius.full, backgroundColor: colors.surfaceAlt, textAlign: 'center', lineHeight: 28, fontWeight: '700', marginRight: spacing.md, color: colors.textPrimary },
    optionText: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
    optionExplanation: { marginTop: spacing.sm, fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: 'italic' },

    // Calibration
    calibrationCard: { margin: spacing.xl, marginTop: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, alignItems: 'center', ...shadows.md },
    calibrationEmoji: { fontSize: 32, marginBottom: spacing.sm },
    calibrationMessage: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
    calibrationTip: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },

    // Action Button
    actionButton: { margin: spacing.xl, padding: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.lg, alignItems: 'center', ...shadows.md },
    actionButtonDisabled: { opacity: 0.5 },
    actionButtonText: { fontSize: fontSize.md, fontWeight: '700', color: colors.textWhite },

    // Results
    resultsCard: { margin: spacing.xl, padding: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, alignItems: 'center', ...shadows.lg },
    scoreText: { fontSize: 48, fontWeight: '700', color: colors.primary },
    scoreLabel: { fontSize: fontSize.lg, color: colors.textSecondary },
    calibrationStats: { marginHorizontal: spacing.xl },
    calibrationStat: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm },
    calibrationStatEmoji: { fontSize: 20, marginRight: spacing.sm },
    calibrationStatText: { fontSize: fontSize.sm, color: colors.textPrimary },
});

export default MCQPracticeScreen;

