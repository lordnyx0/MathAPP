import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import BackButton from '../components/BackButton';
import MathText, { DisplayMath } from '../components/MathText';
import AnimatedCard, { FadeInView } from '../components/AnimatedCard';
import StepCard from '../components/StepCard';
import { SubstitutionQuestion, getRandomSubstitutionQuestion } from '../data/substitutionQuestions';

interface SubstitutionScannerScreenProps {
    onBack?: () => void;
}

export default function SubstitutionScannerScreen({ onBack }: SubstitutionScannerScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [question, setQuestion] = useState<SubstitutionQuestion | null>(null);
    const [score, setScore] = useState(0);

    // Phases: 'scan' -> 'du_calc' -> 'substituted'
    const [phase, setPhase] = useState<'scan' | 'du_calc' | 'substituted'>('scan');
    const [selectedChunk, setSelectedChunk] = useState<string | null>(null);
    
    // Track revealed steps in StepCard
    const [revealedSteps, setRevealedSteps] = useState<boolean[]>([true, false, false]);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        initAudio();
        nextQuestion();
    }, []);

    // Selection pulse
    useEffect(() => {
        if (selectedChunk && phase === 'scan') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [selectedChunk, phase]);

    const nextQuestion = () => {
        setQuestion(getRandomSubstitutionQuestion());
        setPhase('scan');
        setSelectedChunk(null);
        setRevealedSteps([true, false, false]);
    };

    const handleChunkTap = (chunkId: string) => {
        if (phase !== 'scan') return;
        setSelectedChunk(chunkId);
    };

    const triggerErrorShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const confirmU = () => {
        if (!question || !selectedChunk) return;

        if (selectedChunk === question.correctUId) {
            playCorrect();
            setScore(s => s + 10);
            setPhase('du_calc');
            setRevealedSteps([false, true, false]);
        } else {
            triggerErrorShake();
            playIncorrect();
            setSelectedChunk(null);
        }
    };

    const confirmDu = () => {
        playCorrect();
        setScore(s => s + 5);
        setPhase('substituted');
        setRevealedSteps([false, false, true]);
    };

    const toggleStep = (index: number) => {
        setRevealedSteps(prev => {
            const arr = [...prev];
            arr[index] = !arr[index];
            return arr;
        });
    };

    if (!question) return null;

    // Build the visual blocks
    const visualBlocks = question.chunks.map((chunk, idx) => {
        const isSelected = selectedChunk === chunk.id;
        const disabled = !chunk.isSelectable || phase !== 'scan';

        if (!chunk.isSelectable) {
            return (
                <MathText key={`chunk-${idx}`} style={styles.chunkText}>
                    {chunk.text}
                </MathText>
            );
        }

        return (
            <TouchableOpacity
                key={`chunk-${idx}`}
                disabled={disabled}
                onPress={() => handleChunkTap(chunk.id)}
            >
                <Animated.View
                    style={[
                        styles.chunkPill,
                        isSelected && styles.chunkPillSelected,
                        isSelected && { transform: [{ scale: pulseAnim }] },
                        (phase !== 'scan' && chunk.id === question.correctUId) && styles.chunkPillSuccess,
                        isSelected && { transform: [{ scale: pulseAnim }, { translateX: shakeAnim }] }
                    ]}
                >
                    <MathText
                        style={[
                            styles.chunkTextSelectable,
                            isSelected && styles.chunkTextSelected,
                            (phase !== 'scan' && chunk.id === question.correctUId) && styles.chunkTextSelected
                        ]}
                    >
                        {chunk.text}
                    </MathText>
                </Animated.View>
            </TouchableOpacity>
        );
    });

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {onBack && <BackButton onPress={onBack} />}
                    
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Scanner Substituição</Text>
                            <Text style={styles.headerSubtitle}>Tática de Integração</Text>
                        </View>
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreValue}>{score}</Text>
                            <Text style={styles.scoreLabel}>PTS</Text>
                        </View>
                    </View>

                    <Text style={styles.instruction}>Analise a integral original:</Text>

                    <AnimatedCard borderColor={colors.primary} style={styles.mainCard}>
                        <DisplayMath>{question.integral}</DisplayMath>
                        <View style={styles.equationContainer}>
                            {visualBlocks}
                        </View>
                        {phase === 'scan' && !selectedChunk && (
                            <FadeInView style={styles.hintBox}>
                                <Text style={styles.hintText}>Toque no termo que você escolheria como 'u'</Text>
                            </FadeInView>
                        )}
                    </AnimatedCard>

                    {/* Step 1: Identify U */}
                    <StepCard
                        index={0}
                        isRevealed={revealedSteps[0]}
                        onToggle={() => toggleStep(0)}
                        categoryColor={colors.primary}
                        step={{
                            title: '1. Identificar u',
                            explanation: 'A peça chave da substituição.',
                            content: 'Procure uma função cuja derivada também esteja presente na integral (multiplicando dx). Geralmente é o termo de maior grau ou o argumento de uma função composta.',
                        }}
                    />

                    {phase === 'scan' && (
                        <FadeInView delay={300} style={styles.actionContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, !selectedChunk && styles.disabledBtn]} 
                                onPress={confirmU}
                                disabled={!selectedChunk}
                            >
                                <Text style={styles.actionButtonText}>Confirmar u</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* Step 2: DU Calc */}
                    {(phase === 'du_calc' || phase === 'substituted') && (
                        <>
                            <StepCard
                                index={1}
                                isRevealed={revealedSteps[1]}
                                onToggle={() => toggleStep(1)}
                                categoryColor={colors.warning}
                                step={{
                                    title: '2. Calcular du',
                                    explanation: 'Traduzindo o dx para du.',
                                    content: `Derivando $u = ${question.correctUText}$, temos $du = ${question.duText}$. Este passo é fundamental para garantir que todos os termos em x sumam!`,
                                }}
                            />
                            
                            {phase === 'du_calc' && (
                                <FadeInView delay={300}>
                                    <View style={styles.duPanel}>
                                        <MathText style={styles.duPanelTextSmall}>Derivada encontrada:</MathText>
                                        <View style={styles.duFormulaBox}>
                                            <MathText style={styles.duPanelMath}>{`u = ${question.correctUText}`}</MathText>
                                            <MathText style={[styles.duPanelMath, { color: colors.warning }]}>{`du = ${question.duText}`}</MathText>
                                        </View>
                                        
                                        <TouchableOpacity style={styles.actionButton} onPress={confirmDu}>
                                            <Text style={styles.actionButtonText}>Substituir e Simplificar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </FadeInView>
                            )}
                        </>
                    )}

                    {/* Step 3: Result */}
                    {phase === 'substituted' && (
                        <>
                            <StepCard
                                index={2}
                                isRevealed={revealedSteps[2]}
                                onToggle={() => toggleStep(2)}
                                categoryColor={colors.success}
                                step={{
                                    title: '3. Resultado Final',
                                    explanation: 'A integral agora é imediata.',
                                    content: question.explanation,
                                }}
                            />
                            
                            <FadeInView delay={300}>
                                <AnimatedCard borderColor={colors.success} style={styles.resultCard}>
                                    <View style={styles.successBadge}>
                                        <Text style={styles.successEmoji}>🎯</Text>
                                    </View>
                                    <Text style={styles.resultLabel}>Integral em u:</Text>
                                    <DisplayMath>{question.finalUIntegral}</DisplayMath>
                                </AnimatedCard>

                                <TouchableOpacity style={[styles.actionButton, styles.nextBtn]} onPress={nextQuestion}>
                                    <Text style={styles.actionButtonText}>Próximo Desafio</Text>
                                </TouchableOpacity>
                            </FadeInView>
                        </>
                    )}

                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    gradient: { flex: 1 },
    scrollContent: { paddingBottom: 180, paddingHorizontal: spacing.xl },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary },
    headerSubtitle: { fontSize: 10, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
    
    scoreBadge: {
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    scoreValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
    scoreLabel: { fontSize: 8, fontWeight: '700', color: colors.textTertiary },

    instruction: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm, textAlign: 'center', fontWeight: '500' },
    
    mainCard: {
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    equationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        backgroundColor: colors.surfaceAlt + '40',
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.sm,
        marginTop: spacing.sm,
    },
    chunkText: {
        fontSize: 22,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    chunkPill: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        marginHorizontal: 2,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    chunkPillSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
        ...shadows.md,
    },
    chunkPillSuccess: {
        borderColor: colors.success,
        backgroundColor: colors.success + '10',
    },
    chunkTextSelectable: {
        fontSize: 22,
        color: colors.primary,
        fontWeight: '700',
    },
    chunkTextSelected: {
        color: colors.primary,
    },

    hintBox: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    hintText: {
        fontSize: 10,
        color: colors.textTertiary,
        fontStyle: 'italic',
    },

    actionContainer: {
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        marginVertical: spacing.md,
        ...shadows.md,
    },
    nextBtn: {
        backgroundColor: '#4361ee', // A contrasting blue for next
    },
    disabledBtn: { opacity: 0.5 },
    actionButtonText: { fontSize: fontSize.md, fontWeight: '800', color: colors.textWhite },

    duPanel: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderColor: colors.warning,
        marginVertical: spacing.md,
        alignItems: 'center',
        ...shadows.md,
    },
    duPanelTextSmall: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
    duFormulaBox: {
        backgroundColor: colors.surfaceAlt,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        width: '100%',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    duPanelMath: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '700' },
    
    resultCard: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    resultLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.md, fontWeight: '600' },
    successBadge: {
        position: 'absolute',
        top: -15,
        backgroundColor: colors.success,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    successEmoji: { fontSize: 16 },
});
