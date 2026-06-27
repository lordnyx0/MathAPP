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
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { TAB_BAR_CLEARANCE } from '../constants/layout';
import { useTheme } from '../contexts/ThemeContext';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import { notifySuccess, notifyError } from '../utils/haptics';
import BackButton from '../components/BackButton';
import MathText, { DisplayMath } from '../components/MathText';
import AnimatedCard, { FadeInView } from '../components/AnimatedCard';
import ScreenHeader from '../components/ScreenHeader';
import ScoreBadge from '../components/ScoreBadge';
import PhaseIndicator from '../components/PhaseIndicator';
import { PartialFractionsQuestion, getRandomPartialFractionsQuestion } from '../data/partialFractionsQuestions';

type PhaseId = 'template' | 'coeffs' | 'integral' | 'done';

export default function PartialFractionsLabScreen({ onBack }: { onBack?: () => void }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [question, setQuestion] = useState<PartialFractionsQuestion | null>(null);
    const [phase, setPhase] = useState<PhaseId>('template');
    const [score, setScore] = useState(0);

    // Selected answers in each phase
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [selectedCoeffA, setSelectedCoeffA] = useState<string | null>(null);
    const [selectedCoeffB, setSelectedCoeffB] = useState<string | null>(null);
    const [selectedIntegral, setSelectedIntegral] = useState<string | null>(null);

    useEffect(() => {
        initAudio();
        nextQuestion();
    }, []);

    const nextQuestion = () => {
        setQuestion(getRandomPartialFractionsQuestion());
        setPhase('template');
        setSelectedTemplate(null);
        setSelectedCoeffA(null);
        setSelectedCoeffB(null);
        setSelectedIntegral(null);
    };

    const handleConfirmTemplate = () => {
        if (!question || !selectedTemplate) return;
        if (selectedTemplate === question.correctTemplate) {
            playCorrect(); notifySuccess();
            setScore(s => s + 15);
            setPhase('coeffs');
        } else {
            playIncorrect(); notifyError();
            setSelectedTemplate(null);
        }
    };

    const handleConfirmCoeffs = () => {
        if (!question || !selectedCoeffA || !selectedCoeffB) return;
        if (
            selectedCoeffA === question.correctCoeffs.A &&
            selectedCoeffB === question.correctCoeffs.B
        ) {
            playCorrect(); notifySuccess();
            setScore(s => s + 15);
            setPhase('integral');
        } else {
            playIncorrect(); notifyError();
            setSelectedCoeffA(null);
            setSelectedCoeffB(null);
        }
    };

    const handleConfirmIntegral = () => {
        if (!question || !selectedIntegral) return;
        if (selectedIntegral === question.correctIntegral) {
            playCorrect(); notifySuccess();
            setScore(s => s + 20);
            setPhase('done');
        } else {
            playIncorrect(); notifyError();
            setSelectedIntegral(null);
        }
    };

    if (!question) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <ScreenHeader
                        title="Frações Parciais Lab"
                        subtitle="Decomposição Algébrica"
                        leftAction={onBack && <BackButton onPress={onBack} />}
                        rightAction={<ScoreBadge score={score} />}
                    />

                    {/* Stepper tracker */}
                    <PhaseIndicator
                        phases={[
                            { id: 'template', label: 'Modelo' },
                            { id: 'coeffs', label: 'Coeficientes' },
                            { id: 'integral', label: 'Integração' },
                        ]}
                        currentPhaseId={phase === 'done' ? 'integral' : phase}
                    />

                    {/* Math Card Display */}
                    <AnimatedCard style={styles.mathCard}>
                        <Text style={[styles.mathCardTitle, { color: colors.textSecondary }]}>INTEGRAL PROPOSTA</Text>
                        <DisplayMath>{`\\int ${question.expressionText} \\, dx`}</DisplayMath>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <Text style={[styles.mathCardSub, { color: colors.textSecondary }]}>
                            Denominador Fatorado: <MathText>{question.denominatorFactored}</MathText>
                        </Text>
                    </AnimatedCard>

                    {/* Phase 1: Select correct template decomposition */}
                    {phase === 'template' && (
                        <FadeInView style={styles.panel}>
                            <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                                Passo 1: Qual é o modelo correto de decomposição em frações parciais?
                            </Text>

                            <View style={styles.optionsWrap}>
                                {question.templateOptions.map((opt, idx) => {
                                    const isSelected = selectedTemplate === opt;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            activeOpacity={0.7}
                                            onPress={() => setSelectedTemplate(opt)}
                                            style={[
                                                styles.optionButton,
                                                { borderColor: colors.border, backgroundColor: colors.surface },
                                                isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '12' }
                                            ]}
                                        >
                                            <MathText>{opt}</MathText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={!selectedTemplate}
                                onPress={handleConfirmTemplate}
                                style={[
                                    styles.confirmButton,
                                    { backgroundColor: colors.primary },
                                    !selectedTemplate && { backgroundColor: colors.border }
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar Modelo</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* Phase 2: Select coefficients A and B */}
                    {phase === 'coeffs' && (
                        <FadeInView style={styles.panel}>
                            <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                                Passo 2: Determine os valores de $A$ e $B$ usando as raízes do denominador: <MathText>{question.coeffRootsText}</MathText>
                            </Text>

                            <View style={styles.coeffFormGrid}>
                                <View style={styles.coeffCol}>
                                    <Text style={[styles.coeffLabel, { color: colors.textSecondary }]}>Coeficiente A</Text>
                                    <View style={styles.optionsWrapCompact}>
                                        {question.coeffOptionsA.map((opt, idx) => {
                                            const isSelected = selectedCoeffA === opt;
                                            return (
                                                <TouchableOpacity
                                                    key={idx}
                                                    activeOpacity={0.7}
                                                    onPress={() => setSelectedCoeffA(opt)}
                                                    style={[
                                                        styles.optionButtonCompact,
                                                        { borderColor: colors.border, backgroundColor: colors.surface },
                                                        isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '12' }
                                                    ]}
                                                >
                                                    <Text style={[styles.coeffOptionText, { color: isSelected ? colors.primary : colors.textPrimary }]}>{opt}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View style={styles.coeffCol}>
                                    <Text style={[styles.coeffLabel, { color: colors.textSecondary }]}>Coeficiente B</Text>
                                    <View style={styles.optionsWrapCompact}>
                                        {question.coeffOptionsB.map((opt, idx) => {
                                            const isSelected = selectedCoeffB === opt;
                                            return (
                                                <TouchableOpacity
                                                    key={idx}
                                                    activeOpacity={0.7}
                                                    onPress={() => setSelectedCoeffB(opt)}
                                                    style={[
                                                        styles.optionButtonCompact,
                                                        { borderColor: colors.border, backgroundColor: colors.surface },
                                                        isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '12' }
                                                    ]}
                                                >
                                                    <Text style={[styles.coeffOptionText, { color: isSelected ? colors.primary : colors.textPrimary }]}>{opt}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={!selectedCoeffA || !selectedCoeffB}
                                onPress={handleConfirmCoeffs}
                                style={[
                                    styles.confirmButton,
                                    { backgroundColor: colors.primary },
                                    (!selectedCoeffA || !selectedCoeffB) && { backgroundColor: colors.border }
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar Coeficientes</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* Phase 3: Select final integrated expression */}
                    {phase === 'integral' && (
                        <FadeInView style={styles.panel}>
                            <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                                Passo 3: Qual é o resultado final da integração das frações simples?
                            </Text>

                            <View style={styles.optionsWrap}>
                                {question.integralOptions.map((opt, idx) => {
                                    const isSelected = selectedIntegral === opt;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            activeOpacity={0.7}
                                            onPress={() => setSelectedIntegral(opt)}
                                            style={[
                                                styles.optionButton,
                                                { borderColor: colors.border, backgroundColor: colors.surface },
                                                isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '12' }
                                            ]}
                                        >
                                            <MathText>{opt}</MathText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={!selectedIntegral}
                                onPress={handleConfirmIntegral}
                                style={[
                                    styles.confirmButton,
                                    { backgroundColor: colors.primary },
                                    !selectedIntegral && { backgroundColor: colors.border }
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar Integral</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* Done / Victory Screen */}
                    {phase === 'done' && (
                        <FadeInView style={styles.panel}>
                            <View style={[styles.successBadge, { backgroundColor: colors.success + '18' }]}>
                                <Text style={[styles.successBadgeText, { color: colors.success }]}>✓ Resolvido</Text>
                            </View>
                            <Text style={[styles.panelTitle, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.md }]}>
                                Muito bem! Resolução Completa.
                            </Text>

                            <View style={[styles.explanationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.explanationTitle, { color: colors.textSecondary }]}>RESOLUÇÃO DETALHADA</Text>
                                <Text style={[styles.explanationText, { color: colors.textPrimary }]}>{question.explanation}</Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={nextQuestion}
                                style={[styles.confirmButton, { backgroundColor: colors.success }]}
                            >
                                <Text style={styles.confirmButtonText}>Próxima Integral</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    <View style={styles.bottomClearance} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        gradient: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: spacing.xxl,
        },
        mathCard: {
            marginHorizontal: spacing.lg,
            marginTop: spacing.md,
            padding: spacing.lg,
            alignItems: 'center',
        },
        mathCardTitle: {
            fontSize: fontSize.xs,
            fontWeight: '700',
            letterSpacing: 1,
            marginBottom: spacing.md,
        },
        divider: {
            height: 1,
            width: '100%',
            marginVertical: spacing.md,
        },
        mathCardSub: {
            fontSize: fontSize.sm,
            fontWeight: '500',
        },
        panel: {
            marginHorizontal: spacing.lg,
            marginTop: spacing.lg,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface + '80',
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.sm,
        },
        panelTitle: {
            fontSize: fontSize.md,
            fontWeight: '700',
            lineHeight: 22,
            marginBottom: spacing.lg,
        },
        optionsWrap: {
            gap: spacing.sm,
            marginBottom: spacing.lg,
        },
        optionButton: {
            padding: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.sm,
        },
        confirmButton: {
            height: 52,
            borderRadius: borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.md,
            ...shadows.sm,
        },
        confirmButtonText: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        coeffFormGrid: {
            flexDirection: 'row',
            gap: spacing.md,
            marginBottom: spacing.lg,
        },
        coeffCol: {
            flex: 1,
        },
        coeffLabel: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            marginBottom: spacing.sm,
            textAlign: 'center',
        },
        optionsWrapCompact: {
            gap: spacing.xs,
        },
        optionButtonCompact: {
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.sm,
        },
        coeffOptionText: {
            fontSize: fontSize.md,
            fontWeight: '700',
        },
        successBadge: {
            alignSelf: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
        },
        successBadgeText: {
            fontSize: fontSize.sm,
            fontWeight: '700',
        },
        explanationCard: {
            borderRadius: borderRadius.md,
            borderWidth: 1,
            padding: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.lg,
        },
        explanationTitle: {
            fontSize: fontSize.xs,
            fontWeight: '700',
            letterSpacing: 0.8,
            marginBottom: spacing.sm,
        },
        explanationText: {
            fontSize: fontSize.sm,
            lineHeight: 20,
        },
        bottomClearance: {
            height: TAB_BAR_CLEARANCE + spacing.xl,
        },
    });
