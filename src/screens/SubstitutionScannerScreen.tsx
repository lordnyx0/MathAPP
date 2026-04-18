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

    useEffect(() => {
        initAudio();
        nextQuestion();
    }, []);

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

    const confirmU = () => {
        if (!question || !selectedChunk) return;

        if (selectedChunk === question.correctUId) {
            playCorrect();
            setScore(s => s + 10);
            setPhase('du_calc');
            setRevealedSteps([false, true, false]); // Open step 2
        } else {
            playIncorrect();
            setSelectedChunk(null);
        }
    };

    const confirmDu = () => {
        playCorrect();
        setScore(s => s + 5);
        setPhase('substituted');
        setRevealedSteps([false, false, true]); // Open step 3
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
            // Some non-selectable chunks are intentionally partial LaTeX snippets
            // (e.g. "\\frac{", "}{", "^5}\\, dx"), which are invalid as standalone
            // formulas and can crash/fail in the math renderer.
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
                style={[
                    styles.chunkPill,
                    isSelected && styles.chunkPillSelected,
                    (phase !== 'scan' && chunk.id === question.correctUId) && styles.chunkPillSuccess
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
            </TouchableOpacity>
        );
    });

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {onBack && <BackButton onPress={onBack} />}
                    
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Scanner Substituição</Text>
                        <Text style={styles.scoreText}>Pontos: {score}</Text>
                    </View>

                    <Text style={styles.instruction}>Analise a integral original:</Text>

                    <AnimatedCard borderColor={colors.primary}>
                        <DisplayMath>{question.integral}</DisplayMath>
                        <View style={styles.equationContainer}>
                            {visualBlocks}
                        </View>
                    </AnimatedCard>

                    {/* Step 1: Identify U */}
                    <StepCard
                        index={0}
                        isRevealed={revealedSteps[0]}
                        onToggle={() => toggleStep(0)}
                        categoryColor={colors.primary}
                        step={{
                            title: 'Identificar u',
                            explanation: 'Toque no bloco acima que deve ser substituído por u.',
                            content: 'Procure uma função cuja derivada também esteja presente na integral (multiplicando dx).',
                        }}
                    />

                    {phase === 'scan' && (
                        <FadeInView delay={300}>
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
                                    title: 'Calcular du',
                                    explanation: 'Achamos u. Agora precisamos derivá-lo para encontrar du.',
                                    content: `Derivando $u = ${question.correctUText}$, temos $du = ${question.duText}$.`,
                                }}
                            />
                            
                            {phase === 'du_calc' && (
                                <FadeInView delay={300}>
                                    <View style={styles.duPanel}>
                                        <MathText formula style={styles.duPanelText}>{`u = ${question.correctUText}`}</MathText>
                                        <DisplayMath>{`du = ${question.duText}`}</DisplayMath>
                                        <Text style={styles.duInstruction}>Encontrou essa derivada na equação?</Text>
                                        
                                        <TouchableOpacity style={[styles.actionButton, { marginTop: spacing.md }]} onPress={confirmDu}>
                                            <Text style={styles.actionButtonText}>Substituir e Cancelar</Text>
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
                                    title: 'Reescrever e Simplificar',
                                    explanation: 'Substitua e veja como a integral fica simples.',
                                    content: question.explanation,
                                }}
                            />
                            
                            <FadeInView delay={300}>
                                <AnimatedCard borderColor={colors.success}>
                                    <Text style={styles.successText}>Integral Reescrita:</Text>
                                    <DisplayMath>{question.finalUIntegral}</DisplayMath>
                                </AnimatedCard>

                                <TouchableOpacity style={styles.actionButton} onPress={nextQuestion}>
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
    scrollContent: { paddingBottom: 100, paddingHorizontal: spacing.xl },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
    scoreText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
    instruction: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm, textAlign: 'center' },
    
    equationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
    },
    chunkText: {
        fontSize: 24,
        fontFamily: 'monospace',
    },
    chunkTextUnselectable: {
        color: colors.textPrimary,
        marginHorizontal: 1,
    },
    chunkPill: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        marginHorizontal: 1,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
    },
    chunkPillSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
        transform: [{ scale: 1.05 }],
    },
    chunkPillSuccess: {
        borderColor: colors.success,
        backgroundColor: colors.success + '20',
    },
    chunkTextSelectable: {
        fontSize: 24,
        fontFamily: 'monospace',
        color: colors.primary,
        fontWeight: 'bold',
    },
    chunkTextSelected: {
        color: colors.primaryDark || colors.primary,
    },

    actionButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginVertical: spacing.md,
        ...shadows.md,
    },
    disabledBtn: { opacity: 0.5 },
    actionButtonText: { fontSize: fontSize.md, fontWeight: '700', color: colors.textWhite },

    duPanel: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.warning,
        marginVertical: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    duPanelText: { fontSize: fontSize.md, color: colors.textPrimary, marginBottom: spacing.xs },
    duInstruction: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
    successText: { fontSize: fontSize.md, fontWeight: '700', color: colors.success, marginBottom: spacing.sm, textAlign: 'center' },
});
