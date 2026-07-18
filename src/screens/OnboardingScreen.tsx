// Onboarding + level diagnostic — shown once on first launch.
//
// Three short slides explain the method (spaced repetition + confidence), then a
// quick 6-question diagnostic seeds the SRS so the very first session already has
// a review queue and the dashboard has data. Wrong answers become due almost
// immediately (SRS interval 0), so "Revisão de Hoje" is populated from day one.
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import MathText, { latexToUnicode } from '../components/MathText';
import AnswerOption, { AnswerOptionState } from '../components/AnswerOption';
import { playCorrect, playIncorrect } from '../utils/sounds';
import { notifySuccess, notifyError } from '../utils/haptics';
import { createInterleavedSession } from '../learning/interleaving';
import { loadCards, saveCards, getOrCreateCard, calculateNextReview, Quality } from '../learning/srs';
import type { MCQ } from '../types';

interface Slide {
    emoji: string;
    title: string;
    body: string;
}

const SLIDES: Slide[] = [
    {
        emoji: '👋',
        title: 'Bem-vindo ao Matemática Pro',
        body: 'Um app construído em cima da ciência da aprendizagem: você estuda menos e lembra mais.',
    },
    {
        emoji: '🧠',
        title: 'Revisão espaçada',
        body: 'O app agenda cada conceito para revisão no momento certo — pouco antes de você esquecer. A aba Progresso mostra o que revisar hoje.',
    },
    {
        emoji: '🎯',
        title: 'Confiança importa',
        body: 'No MCQ você avalia sua confiança antes de responder. Isso revela onde você "acha que sabe" mas erra — o ponto cego mais perigoso.',
    },
];

const DIAGNOSTIC_SIZE = 6;

interface OnboardingScreenProps {
    onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [phase, setPhase] = useState<'intro' | 'diagnostic' | 'done'>('intro');
    const [slide, setSlide] = useState(0);
    const [questions] = useState<MCQ[]>(() => createInterleavedSession(DIAGNOSTIC_SIZE));
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    const current = questions[qIndex];
    // If there is no content to diagnose, the intro simply finishes.
    const canDiagnose = questions.length > 0;

    const advanceSlide = () => {
        if (slide < SLIDES.length - 1) {
            setSlide(slide + 1);
        } else if (canDiagnose) {
            setPhase('diagnostic');
        } else {
            setPhase('done');
        }
    };

    const answer = useCallback(async (optionId: string) => {
        if (showResult || !current) return;
        setSelected(optionId);
        setShowResult(true);

        const isCorrect = optionId === current.correctAnswer;
        if (isCorrect) {
            setCorrectCount(c => c + 1);
            playCorrect(); notifySuccess();
        } else {
            playIncorrect(); notifyError();
        }

        // Seed the SRS so the review queue starts populated.
        const quality = isCorrect ? Quality.CORRECT_HESITANT : Quality.WRONG_RECOGNIZED;
        const cards = await loadCards();
        const card = calculateNextReview(getOrCreateCard(cards, current.id, current.topic), quality);
        const idx = cards.findIndex(c => c.questionId === current.id);
        const next = idx >= 0 ? cards.map(c => (c.questionId === current.id ? card : c)) : [...cards, card];
        await saveCards(next);
    }, [showResult, current]);

    const nextQuestion = () => {
        if (qIndex < questions.length - 1) {
            setQIndex(qIndex + 1);
            setSelected(null);
            setShowResult(false);
        } else {
            setPhase('done');
        }
    };

    const optionState = (optionId: string): AnswerOptionState => {
        if (!showResult) return 'idle';
        if (optionId === current.correctAnswer) return 'correct';
        if (optionId === selected) return 'wrong';
        return 'idle';
    };

    const suggestedLevel = (() => {
        const rate = questions.length > 0 ? correctCount / questions.length : 0;
        if (rate >= 0.8) return 'Avançado';
        if (rate >= 0.5) return 'Intermediário';
        return 'Básico';
    })();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {phase === 'intro' && (
                        <View style={styles.slideWrap}>
                            <Text style={styles.slideEmoji}>{SLIDES[slide].emoji}</Text>
                            <Text style={styles.slideTitle}>{SLIDES[slide].title}</Text>
                            <Text style={styles.slideBody}>{SLIDES[slide].body}</Text>

                            <View style={styles.dots}>
                                {SLIDES.map((_, i) => (
                                    <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
                                ))}
                            </View>

                            <TouchableOpacity style={styles.primaryButton} onPress={advanceSlide} accessibilityRole="button">
                                <Text style={styles.primaryButtonText}>
                                    {slide < SLIDES.length - 1 ? 'Continuar' : (canDiagnose ? 'Fazer diagnóstico' : 'Começar')}
                                </Text>
                            </TouchableOpacity>

                            {slide === SLIDES.length - 1 && canDiagnose && (
                                <TouchableOpacity onPress={() => setPhase('done')} accessibilityRole="button">
                                    <Text style={styles.skipText}>Pular diagnóstico</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {phase === 'diagnostic' && current && (
                        <View style={styles.diagWrap}>
                            <Text style={styles.diagProgress}>Diagnóstico · {qIndex + 1}/{questions.length}</Text>
                            <View style={styles.questionCard}>
                                <Text style={styles.questionTopic}>{current.topic}</Text>
                                <MathText style={styles.questionText} size="large">{current.question}</MathText>
                            </View>

                            <View style={styles.options}>
                                {current.options.map(option => (
                                    <AnswerOption
                                        key={option.id}
                                        state={optionState(option.id)}
                                        onPress={() => answer(option.id)}
                                        disabled={showResult}
                                        accessibilityLabel={`${option.id}. ${latexToUnicode(option.text)}`}
                                    >
                                        <MathText style={styles.optionText}>{option.text}</MathText>
                                    </AnswerOption>
                                ))}
                            </View>

                            {showResult && (
                                <TouchableOpacity style={styles.primaryButton} onPress={nextQuestion} accessibilityRole="button">
                                    <Text style={styles.primaryButtonText}>
                                        {qIndex < questions.length - 1 ? 'Próxima' : 'Ver resultado'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {phase === 'done' && (
                        <View style={styles.slideWrap}>
                            <Text style={styles.slideEmoji}>🚀</Text>
                            <Text style={styles.slideTitle}>Tudo pronto!</Text>
                            {canDiagnose && (
                                <Text style={styles.slideBody}>
                                    Você acertou {correctCount} de {questions.length}. Sugerimos começar no nível{' '}
                                    <Text style={styles.emphasis}>{suggestedLevel}</Text>. Já preparamos suas primeiras revisões.
                                </Text>
                            )}
                            {!canDiagnose && (
                                <Text style={styles.slideBody}>
                                    Explore os treinos e o MCQ. Seu progresso aparece na aba Progresso.
                                </Text>
                            )}
                            <TouchableOpacity style={styles.primaryButton} onPress={onComplete} accessibilityRole="button">
                                <Text style={styles.primaryButtonText}>Começar a estudar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },

    slideWrap: { alignItems: 'center', paddingHorizontal: spacing.lg },
    slideEmoji: { fontSize: 64, marginBottom: spacing.xl },
    slideTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
    slideBody: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
    emphasis: { fontWeight: '700', color: colors.primary },

    dots: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary, width: 24 },

    primaryButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: borderRadius.lg, alignItems: 'center', alignSelf: 'stretch', ...shadows.md },
    primaryButtonText: { fontSize: fontSize.md, fontWeight: '700', color: colors.textWhite },
    skipText: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.lg },

    diagWrap: { },
    diagProgress: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.md, textAlign: 'center' },
    questionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.md },
    questionTopic: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm, textTransform: 'uppercase' },
    questionText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, lineHeight: 26 },
    options: { gap: spacing.sm, marginBottom: spacing.lg },
    optionText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
});

export default OnboardingScreen;
