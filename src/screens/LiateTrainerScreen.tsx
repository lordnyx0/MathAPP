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
import { LiateQuestion, getRandomLiateQuestion } from '../data/liateQuestions';

type Phase = 'pick_u_dv' | 'pick_du_v' | 'result';

interface LiateTrainerScreenProps {
    onBack?: () => void;
}

export default function LiateTrainerScreen({ onBack }: LiateTrainerScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [question, setQuestion] = useState<LiateQuestion | null>(null);
    const [phase, setPhase] = useState<Phase>('pick_u_dv');
    const [score, setScore] = useState(0);

    // Phase 1 State
    const [unassignedParts, setUnassignedParts] = useState<string[]>([]);
    const [uParts, setUParts] = useState<string[]>([]);
    const [dvParts, setDvParts] = useState<string[]>([]);
    const [selectedPart, setSelectedPart] = useState<{ id: string, source: 'pool' | 'u' | 'dv' } | null>(null);

    // Phase 2 State
    const [duInput, setDuInput] = useState('');
    const [vInput, setVInput] = useState('');
    const [optionsPhase2, setOptionsPhase2] = useState<string[]>([]);
    const [selectedPhase2Target, setSelectedPhase2Target] = useState<'du' | 'v' | null>(null);

    useEffect(() => {
        initAudio();
        nextQuestion();
    }, []);

    const nextQuestion = () => {
        const q = getRandomLiateQuestion();
        setQuestion(q);
        setUnassignedParts(q.parts);
        setUParts([]);
        setDvParts([]);
        setSelectedPart(null);
        setPhase('pick_u_dv');
        
        // Setup options for second phase
        const fakeDu = q.du.includes('dx') ? q.du.replace('dx', '') + 'x dx' : '-1 dx';
        const fakeV = '-' + q.v;
        setOptionsPhase2([q.du, q.v, fakeDu, fakeV].sort(() => Math.random() - 0.5));
        setDuInput('');
        setVInput('');
        setSelectedPhase2Target(null);
    };

    const handlePartTap = (part: string, source: 'pool' | 'u' | 'dv') => {
        if (selectedPart && selectedPart.id === part && selectedPart.source === source) {
            setSelectedPart(null); // deselect
        } else {
            setSelectedPart({ id: part, source });
        }
    };

    const handleBoxTap = (target: 'u' | 'dv' | 'pool') => {
        if (!selectedPart) return;

        const p = selectedPart.id;
        const source = selectedPart.source;

        // Remove from source
        if (source === 'u') setUParts(prev => prev.filter(x => x !== p));
        else if (source === 'dv') setDvParts(prev => prev.filter(x => x !== p));
        else setUnassignedParts(prev => prev.filter(x => x !== p));

        // Add to target
        if (target === 'u') setUParts(prev => [...prev, p]);
        else if (target === 'dv') setDvParts(prev => [...prev, p]);
        else setUnassignedParts(prev => [...prev, p]);

        setSelectedPart(null);
    };

    const checkPhase1 = () => {
        if (!question) return;

        const uValid = uParts.length === question.correctU.length && uParts.every(p => question.correctU.includes(p));
        const dvValid = dvParts.length === question.correctDv.length && dvParts.every(p => question.correctDv.includes(p));

        if (unassignedParts.length === 0 && uValid && dvValid) {
            playCorrect();
            setScore(s => s + 10);
            setPhase('pick_du_v');
        } else {
            playIncorrect();
            // Reset to pool
            setUnassignedParts(question.parts);
            setUParts([]);
            setDvParts([]);
        }
    };

    const handlePhase2OptionTap = (opt: string) => {
        if (selectedPhase2Target === 'du') {
            setDuInput(opt);
            setSelectedPhase2Target(null);
        } else if (selectedPhase2Target === 'v') {
            setVInput(opt);
            setSelectedPhase2Target(null);
        }
    };

    const checkPhase2 = () => {
        if (!question) return;
        if (duInput === question.du && vInput === question.v) {
            playCorrect();
            setScore(s => s + 15);
            setPhase('result');
        } else {
            playIncorrect();
            setDuInput('');
            setVInput('');
        }
    };

    if (!question) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {onBack && <BackButton onPress={onBack} />}
                    
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Quebra-Cabeça LIATE</Text>
                        <Text style={styles.scoreText}>Pontos: {score}</Text>
                    </View>

                    <AnimatedCard borderColor={colors.primary}>
                        <Text style={styles.instruction}>Integral Alvo:</Text>
                        <DisplayMath>{question.integral}</DisplayMath>
                    </AnimatedCard>

                    {/* PHASE 1: Pick u and dv */}
                    {phase === 'pick_u_dv' && (
                        <FadeInView>
                            <Text style={styles.subtext}>Selecione as partes abaixo e toque na caixa destino para definir $u$ e $dv$.</Text>
                            
                            <View style={styles.pool}>
                                {unassignedParts.map((p, i) => (
                                    <TouchableOpacity 
                                        key={`pool-${i}`} 
                                        style={[styles.partPill, selectedPart?.id === p && selectedPart?.source === 'pool' && styles.partPillSelected]}
                                        onPress={() => handlePartTap(p, 'pool')}
                                    >
                                        <MathText style={styles.partPillText}>{p}</MathText>
                                    </TouchableOpacity>
                                ))}
                                {unassignedParts.length === 0 && <Text style={styles.emptyText}>Todas as peças usadas</Text>}
                            </View>

                            <View style={styles.boxesContainer}>
                                <TouchableOpacity 
                                    style={[styles.targetBox, { borderColor: colors.info }]}
                                    onPress={() => handleBoxTap('u')}
                                >
                                    <Text style={[styles.boxLabel, { color: colors.info }]}>$u$ (Derivar)</Text>
                                    {uParts.map((p, i) => (
                                        <TouchableOpacity 
                                            key={`u-${i}`} 
                                            style={[styles.partPill, selectedPart?.id === p && selectedPart?.source === 'u' && styles.partPillSelected]}
                                            onPress={() => handlePartTap(p, 'u')}
                                        >
                                            <MathText style={styles.partPillText}>{p}</MathText>
                                        </TouchableOpacity>
                                    ))}
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.targetBox, { borderColor: colors.warning }]}
                                    onPress={() => handleBoxTap('dv')}
                                >
                                    <Text style={[styles.boxLabel, { color: colors.warning }]}>$dv$ (Integrar)</Text>
                                    {dvParts.map((p, i) => (
                                        <TouchableOpacity 
                                            key={`dv-${i}`} 
                                            style={[styles.partPill, selectedPart?.id === p && selectedPart?.source === 'dv' && styles.partPillSelected]}
                                            onPress={() => handlePartTap(p, 'dv')}
                                        >
                                            <MathText style={styles.partPillText}>{p}</MathText>
                                        </TouchableOpacity>
                                    ))}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                style={[styles.actionButton, unassignedParts.length > 0 && styles.disabledBtn]} 
                                onPress={checkPhase1}
                                disabled={unassignedParts.length > 0}
                            >
                                <Text style={styles.actionButtonText}>Verificar $u$ e $dv$</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* PHASE 2: Pick du and v */}
                    {phase === 'pick_du_v' && (
                        <FadeInView>
                            <AnimatedCard borderColor={colors.success}>
                                <Text style={styles.successText}>Ótima escolha! Segundo a regra LIATE:</Text>
                                <Text style={styles.explanationText}>{question.explanation}</Text>
                            </AnimatedCard>

                            <Text style={styles.subtext}>Agora, toque numa caixa vazia e escolha o valor correspondente:</Text>
                            
                            <View style={styles.boxesContainer}>
                                <View style={styles.readonlyBox}>
                                    <Text style={styles.boxLabel}>$u = {question.correctU.join(' ')}$</Text>
                                    <TouchableOpacity 
                                        style={[styles.inputBox, selectedPhase2Target === 'du' && styles.inputBoxSelected]}
                                        onPress={() => setSelectedPhase2Target('du')}
                                    >
                                        {duInput ? <MathText style={styles.inputText}>du = {duInput}</MathText> : <MathText style={styles.placeholderText}>Selecione $du$</MathText>}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.readonlyBox}>
                                    <Text style={styles.boxLabel}>$dv = {question.correctDv.join(' ')}$</Text>
                                    <TouchableOpacity 
                                        style={[styles.inputBox, selectedPhase2Target === 'v' && styles.inputBoxSelected]}
                                        onPress={() => setSelectedPhase2Target('v')}
                                    >
                                        {vInput ? <MathText style={styles.inputText}>v = {vInput}</MathText> : <MathText style={styles.placeholderText}>Selecione $v$</MathText>}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.pool}>
                                {optionsPhase2.map((opt, i) => (
                                    <TouchableOpacity 
                                        key={`opt-${i}`} 
                                        style={[styles.partPill]}
                                        onPress={() => handlePhase2OptionTap(opt)}
                                        disabled={!selectedPhase2Target}
                                    >
                                        <MathText style={[styles.partPillText, !selectedPhase2Target && {opacity: 0.5}]}>{opt}</MathText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity 
                                style={[styles.actionButton, (!duInput || !vInput) && styles.disabledBtn]} 
                                onPress={checkPhase2}
                                disabled={!duInput || !vInput}
                            >
                                <Text style={styles.actionButtonText}>Montar Fórmula</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* PHASE 3: Result */}
                    {phase === 'result' && (
                        <FadeInView>
                            <AnimatedCard borderColor={colors.success}>
                                <Text style={styles.successText}>✅ Fórmula Montada!</Text>
                                <DisplayMath>{`\\int u dv = uv - \\int v du`}</DisplayMath>
                                <View style={styles.finalEquation}>
                                    <MathText style={styles.finalEquationText}>
                                        {`= (${question.correctU.join(' ')}\\)(${question.v}) - \\int (${question.v})(${question.du})`}
                                    </MathText>
                                </View>
                            </AnimatedCard>
                            
                            <TouchableOpacity style={styles.actionButton} onPress={nextQuestion}>
                                <Text style={styles.actionButtonText}>Próximo Desafio</Text>
                            </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
    scoreText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
    instruction: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'center' },
    subtext: { fontSize: fontSize.sm, color: colors.textSecondary, paddingHorizontal: spacing.xl, marginBottom: spacing.md, textAlign: 'center' },
    
    pool: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        minHeight: 50,
        alignItems: 'center',
    },
    partPill: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        margin: spacing.xs,
        borderWidth: 2,
        borderColor: colors.border,
        ...shadows.sm,
    },
    partPillSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
    },
    partPillText: { fontSize: fontSize.lg, color: colors.textPrimary, fontWeight: '600' },
    emptyText: { fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic' },
    
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    targetBox: {
        flex: 1,
        minHeight: 120,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt + '50',
    },
    boxLabel: { fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.sm },
    
    readonlyBox: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.sm,
    },
    inputBox: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    inputBoxSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    inputText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '700' },
    placeholderText: { fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic' },
    
    actionButton: {
        backgroundColor: colors.primary,
        marginHorizontal: spacing.xl,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.md,
    },
    disabledBtn: { opacity: 0.5 },
    actionButtonText: { fontSize: fontSize.md, fontWeight: '700', color: colors.textWhite },
    
    successText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.success, marginBottom: spacing.sm, textAlign: 'center' },
    explanationText: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
    
    finalEquation: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.md,
    },
    finalEquationText: { fontSize: fontSize.md, color: colors.textPrimary, textAlign: 'center' },
    bottomPadding: { height: 100 },
});
