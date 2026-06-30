import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { TAB_BAR_CLEARANCE } from '../constants/layout';
import { useTheme } from '../contexts/ThemeContext';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import { notifySuccess, notifyError } from '../utils/haptics';
import BackButton from '../components/BackButton';
import MathText, { DisplayMath } from '../components/MathText';
import AnimatedCard, { FadeInView } from '../components/AnimatedCard';
import { SymmetryQuestion, getRandomSymmetryQuestion } from '../data/symmetrySprintQuestions';

const QUESTION_LIMIT = 10;
const TIME_LIMIT = 10; // 10 seconds per question

type GamePhase = 'playing' | 'feedback' | 'summary';

interface AnswerRecord {
    question: SymmetryQuestion;
    userChoice: 'zero' | 'double' | 'neither' | 'timeout';
    isCorrect: boolean;
}

interface SymmetrySprintScreenProps {
    onBack?: () => void;
}

export default function SymmetrySprintScreen({ onBack }: SymmetrySprintScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [phase, setPhase] = useState<GamePhase>('playing');
    const [question, setQuestion] = useState<SymmetryQuestion | null>(null);
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(1);
    const [recentQuestions, setRecentQuestions] = useState<SymmetryQuestion[]>([]);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timerAnim = useRef(new Animated.Value(1)).current;

    // History record
    const [history, setHistory] = useState<AnswerRecord[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<'zero' | 'double' | 'neither' | 'timeout' | null>(null);

    // Refs mirroring the latest phase/question, so the setInterval timeout
    // callback always reads live values instead of the stale closure
    // captured when startTimer() ran (before setPhase/setQuestion applied).
    const phaseRef = useRef(phase);
    const questionRef = useRef(question);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { questionRef.current = question; }, [question]);

    useEffect(() => {
        initAudio();
        startNewRound();
        return () => stopTimer();
    }, []);

    const startNewRound = () => {
        setScore(0);
        setQuestionIndex(1);
        setRecentQuestions([]);
        setHistory([]);
        loadNextQuestion([]);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTimer = () => {
        stopTimer();
        setTimeLeft(TIME_LIMIT);
        timerAnim.setValue(1);

        // Smooth visual bar animation
        Animated.timing(timerAnim, {
            toValue: 0,
            duration: TIME_LIMIT * 1000,
            useNativeDriver: false,
        }).start();

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    handleAnswer('timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const loadNextQuestion = (historyList: SymmetryQuestion[]) => {
        const q = getRandomSymmetryQuestion(historyList);
        setQuestion(q);
        setRecentQuestions(prev => [...prev, q]);
        setSelectedAnswer(null);
        setPhase('playing');
        startTimer();
    };

    const handleAnswer = (choice: 'zero' | 'double' | 'neither' | 'timeout') => {
        const currentQuestion = questionRef.current;
        if (phaseRef.current !== 'playing' || !currentQuestion) return;

        stopTimer();
        setSelectedAnswer(choice);
        setPhase('feedback');

        const isCorrect = choice === currentQuestion.correctAnswer;

        // Save to round history
        setHistory(prev => [...prev, {
            question: currentQuestion,
            userChoice: choice,
            isCorrect,
        }]);

        if (isCorrect) {
            playCorrect();
            notifySuccess();
            // Score formula: bases score + bonus for speed
            const speedBonus = Math.max(0, Math.floor(timeLeft));
            setScore(s => s + 10 + speedBonus);
        } else {
            playIncorrect();
            notifyError();
        }
    };

    const handleContinue = () => {
        if (questionIndex >= QUESTION_LIMIT) {
            setPhase('summary');
        } else {
            setQuestionIndex(idx => idx + 1);
            loadNextQuestion(recentQuestions);
        }
    };

    // UI helpers
    const getOptionStyle = (optionType: 'zero' | 'double' | 'neither') => {
        if (phase === 'playing') {
            return styles.optionBtn;
        }
        
        const isCorrectOption = question?.correctAnswer === optionType;
        const isUserOption = selectedAnswer === optionType;

        if (isCorrectOption) {
            return [styles.optionBtn, styles.correctOptionBtn];
        }
        if (isUserOption) {
            return [styles.optionBtn, styles.wrongOptionBtn];
        }
        return [styles.optionBtn, styles.dimmedOptionBtn];
    };

    const getOptionTextColor = (optionType: 'zero' | 'double' | 'neither') => {
        if (phase === 'playing') {
            return colors.textPrimary;
        }
        const isCorrectOption = question?.correctAnswer === optionType;
        const isUserOption = selectedAnswer === optionType;

        if (isCorrectOption) return colors.textWhite;
        if (isUserOption) return colors.textWhite;
        return colors.textSecondary;
    };

    const timerBarColor = timerAnim.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: ['#EF4444', '#F59E0B', '#10B981', '#10B981']
    });

    if (!question) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {onBack && <BackButton onPress={onBack} />}

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Corrida da Simetria</Text>
                            <Text style={styles.progressText}>Questão {questionIndex} de {QUESTION_LIMIT}</Text>
                        </View>
                        <Text style={styles.scoreText}>Pontos: {score}</Text>
                    </View>

                    {phase === 'summary' ? (
                        /* SUMMARY VIEW */
                        <FadeInView style={styles.summaryContainer}>
                            <AnimatedCard borderColor={colors.success}>
                                <View style={styles.summaryHeader}>
                                    <MaterialCommunityIcons name="trophy-outline" size={48} color={colors.warning} />
                                    <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Treino Concluído!</Text>
                                    <Text style={styles.summaryPoints}>{score} pts</Text>
                                </View>

                                <View style={styles.statsRow}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statVal}>
                                            {history.filter(h => h.isCorrect).length}/{QUESTION_LIMIT}
                                        </Text>
                                        <Text style={styles.statLbl}>Acertos</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statVal}>
                                            {Math.round((history.filter(h => h.isCorrect).length / QUESTION_LIMIT) * 100)}%
                                        </Text>
                                        <Text style={styles.statLbl}>Precisão</Text>
                                    </View>
                                </View>
                            </AnimatedCard>

                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recapitulação das Questões</Text>
                            {history.map((record, i) => (
                                <View 
                                    key={`rec-${i}`} 
                                    style={[
                                        styles.historyCard, 
                                        { 
                                            backgroundColor: colors.surface, 
                                            borderColor: record.isCorrect ? colors.success + '40' : colors.error + '40' 
                                        }
                                    ]}
                                >
                                    <View style={styles.historyCardHeader}>
                                        <Ionicons 
                                            name={record.isCorrect ? "checkmark-circle" : "close-circle"} 
                                            size={20} 
                                            color={record.isCorrect ? colors.success : colors.error} 
                                        />
                                        <Text style={[styles.historyIndex, { color: colors.textTertiary }]}>Questão {i + 1}</Text>
                                    </View>
                                    
                                    <View style={styles.mathCenter}>
                                        <DisplayMath>{record.question.integral}</DisplayMath>
                                    </View>

                                    <View style={styles.historyDetail}>
                                        <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>
                                            Sua resposta: <Text style={{fontWeight: '700', color: record.isCorrect ? colors.success : colors.error}}>
                                                {record.userChoice === 'zero' ? 'Zero (Ímpar)' : record.userChoice === 'double' ? 'Dobro (Par)' : record.userChoice === 'timeout' ? 'Tempo Esgotado' : 'Nenhum'}
                                            </Text>
                                        </Text>
                                        <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>
                                            Gabarito: <Text style={{fontWeight: '700', color: colors.success}}>
                                                {record.question.correctAnswer === 'zero' ? 'Zero (Ímpar)' : record.question.correctAnswer === 'double' ? 'Dobro (Par)' : 'Nenhum'}
                                            </Text>
                                        </Text>
                                        <Text style={[styles.historyExplanation, { color: colors.textSecondary }]}>
                                            {record.question.explanation}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            <View style={styles.summaryActions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, {backgroundColor: colors.primary}]}
                                    onPress={startNewRound}
                                    accessibilityLabel="Jogar novamente"
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.actionBtnText}>Jogar Novamente</Text>
                                </TouchableOpacity>
                                {onBack && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.secondaryActionBtn, {borderColor: colors.border}]}
                                        onPress={onBack}
                                        accessibilityLabel="Voltar ao treino"
                                        accessibilityRole="button"
                                    >
                                        <Text style={[styles.actionBtnText, {color: colors.textPrimary}]}>Voltar ao Treino</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </FadeInView>
                    ) : (
                        /* PLAYING / FEEDBACK VIEW */
                        <FadeInView>
                            {/* TIMER BAR */}
                            {phase === 'playing' ? (
                                <View style={styles.timerTrack}>
                                    <Animated.View 
                                        style={[
                                            styles.timerBar, 
                                            { 
                                                backgroundColor: timerBarColor,
                                                width: timerAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%']
                                                })
                                            }
                                        ]} 
                                    />
                                </View>
                            ) : (
                                <View style={styles.timerTrackPlaceholder} />
                            )}

                            {/* TARGET INTEGRAL CARD */}
                            <AnimatedCard borderColor={colors.primary}>
                                <Text style={styles.cardInstruction}>Calcule a integral de cabeça:</Text>
                                <DisplayMath>{question.integral}</DisplayMath>
                                <View style={styles.metaRow}>
                                    <View style={[styles.metaChip, {backgroundColor: colors.surfaceAlt}]}>
                                        <MathText style={[styles.metaChipText, {color: colors.textSecondary}]}>
                                            Intervalo: ${question.intervalText}$
                                        </MathText>
                                    </View>
                                    <View style={[styles.metaChip, {backgroundColor: colors.surfaceAlt}]}>
                                        <MathText style={[styles.metaChipText, {color: colors.textSecondary}]}>
                                            Função: ${question.functionText}$
                                        </MathText>
                                    </View>
                                </View>
                            </AnimatedCard>

                            {/* BUTTON OPTIONS */}
                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={getOptionStyle('zero')}
                                    onPress={() => handleAnswer('zero')}
                                    disabled={phase !== 'playing'}
                                    accessibilityLabel="Selecionar opção: Zero (Ímpar)"
                                    accessibilityRole="button"
                                    accessibilityState={{ disabled: phase !== 'playing' }}
                                >
                                    <Text style={[styles.optionText, { color: getOptionTextColor('zero') }]}>
                                        Zero (Ímpar)
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={getOptionStyle('double')}
                                    onPress={() => handleAnswer('double')}
                                    disabled={phase !== 'playing'}
                                    accessibilityLabel="Selecionar opção: Dobro (Par)"
                                    accessibilityRole="button"
                                    accessibilityState={{ disabled: phase !== 'playing' }}
                                >
                                    <Text style={[styles.optionText, { color: getOptionTextColor('double') }]}>
                                        Dobro (Par)
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={getOptionStyle('neither')}
                                    onPress={() => handleAnswer('neither')}
                                    disabled={phase !== 'playing'}
                                    accessibilityLabel="Selecionar opção: Nenhum (Sem Simetria)"
                                    accessibilityRole="button"
                                    accessibilityState={{ disabled: phase !== 'playing' }}
                                >
                                    <Text style={[styles.optionText, { color: getOptionTextColor('neither') }]}>
                                        Nenhum (Sem Simetria)
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* FEEDBACK BOTTOM CARD */}
                            {phase === 'feedback' && (
                                <FadeInView style={styles.feedbackContainer}>
                                    <AnimatedCard 
                                        borderColor={
                                            selectedAnswer === question.correctAnswer 
                                                ? colors.success 
                                                : colors.error
                                        }
                                    >
                                        <View style={styles.feedbackHeader}>
                                            <Ionicons 
                                                name={
                                                    selectedAnswer === question.correctAnswer 
                                                        ? "checkmark-circle" 
                                                        : "close-circle"
                                                } 
                                                size={28} 
                                                color={
                                                    selectedAnswer === question.correctAnswer 
                                                        ? colors.success 
                                                        : colors.error
                                                } 
                                            />
                                            <Text 
                                                style={[
                                                    styles.feedbackTitle, 
                                                    { 
                                                        color: selectedAnswer === question.correctAnswer 
                                                            ? colors.success 
                                                            : colors.error 
                                                    }
                                                ]}
                                            >
                                                {selectedAnswer === 'timeout' 
                                                    ? 'Tempo Esgotado!' 
                                                    : selectedAnswer === question.correctAnswer 
                                                        ? 'Resposta Correta!' 
                                                        : 'Resposta Incorreta!'}
                                            </Text>
                                        </View>

                                        <Text style={[styles.feedbackExplanation, { color: colors.textSecondary }]}>
                                            {question.explanation}
                                        </Text>

                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: spacing.md }]}
                                            onPress={handleContinue}
                                            accessibilityLabel={questionIndex >= QUESTION_LIMIT ? 'Ver resultados' : 'Continuar para a próxima questão'}
                                            accessibilityRole="button"
                                        >
                                            <Text style={styles.actionBtnText}>
                                                {questionIndex >= QUESTION_LIMIT ? 'Ver Resultados' : 'Continuar'}
                                            </Text>
                                        </TouchableOpacity>
                                    </AnimatedCard>
                                </FadeInView>
                            )}
                        </FadeInView>
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    gradient: { flex: 1 },
    scrollContent: { paddingBottom: spacing.xxl },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
    progressText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    scoreText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
    
    // Timer
    timerTrack: {
        height: 6,
        backgroundColor: colors.border,
        marginHorizontal: spacing.xl,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    timerTrackPlaceholder: {
        height: 6,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    timerBar: {
        height: '100%',
    },

    // target card details
    cardInstruction: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm, textAlign: 'center' },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    metaChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    metaChipText: { fontSize: fontSize.xs, fontWeight: '600' },

    // Options layout
    optionsContainer: {
        paddingHorizontal: spacing.xl,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    optionBtn: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 2,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    optionText: { fontSize: fontSize.md, fontWeight: '700' },
    correctOptionBtn: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    wrongOptionBtn: {
        backgroundColor: colors.error,
        borderColor: colors.error,
    },
    dimmedOptionBtn: {
        opacity: 0.5,
    },

    // Feedback bottom panel
    feedbackContainer: {
        paddingHorizontal: spacing.xl,
        marginTop: spacing.lg,
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    feedbackTitle: { fontSize: fontSize.md, fontWeight: '700' },
    feedbackExplanation: { fontSize: fontSize.sm, lineHeight: 20, marginTop: spacing.xs },
    
    actionBtn: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    actionBtnText: { color: colors.textWhite, fontSize: fontSize.md, fontWeight: '700' },

    // Summary screen styling
    summaryContainer: {
        paddingHorizontal: spacing.xl,
        gap: spacing.lg,
    },
    summaryHeader: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    summaryTitle: { fontSize: fontSize.lg, fontWeight: '700', marginTop: spacing.sm },
    summaryPoints: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary, marginTop: spacing.xs },
    
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingTop: spacing.md,
    },
    statBox: {
        alignItems: 'center',
    },
    statVal: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
    statLbl: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    
    sectionTitle: { fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.md },
    
    historyCard: {
        borderRadius: borderRadius.md,
        borderWidth: 2,
        padding: spacing.md,
        marginBottom: spacing.xs,
        ...shadows.sm,
    },
    historyCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    historyIndex: { fontSize: fontSize.xs, fontWeight: '700' },
    mathCenter: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    historyDetail: {
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingTop: spacing.sm,
        gap: 4,
    },
    historyLabel: { fontSize: fontSize.xs },
    historyExplanation: { fontSize: fontSize.xs, marginTop: spacing.xs, fontStyle: 'italic', lineHeight: 16 },

    summaryActions: {
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    secondaryActionBtn: {
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    bottomPadding: { height: TAB_BAR_CLEARANCE + 40 },
});
