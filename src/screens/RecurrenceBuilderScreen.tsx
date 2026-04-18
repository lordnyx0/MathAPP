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
import MathText, { DisplayMath, latexToUnicode } from '../components/MathText';
import AnimatedCard, { FadeInView } from '../components/AnimatedCard';
import { RecurrenceProof, getRandomRecurrenceProof, RecurrenceLine } from '../data/recurrenceQuestions';

interface RecurrenceBuilderScreenProps {
    onBack?: () => void;
}

export default function RecurrenceBuilderScreen({ onBack }: RecurrenceBuilderScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [proof, setProof] = useState<RecurrenceProof | null>(null);
    const [score, setScore] = useState(0);

    // Current line being solved
    const [currentLineIdx, setCurrentLineIdx] = useState(0);
    // Track filled blanks: { 'l1_b1_1': 'p_sinx' }
    const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});
    const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shakeAnims = useRef<Record<string, Animated.Value>>({}).current;
    const successAnims = useRef<Record<string, Animated.Value>>({}).current;

    useEffect(() => {
        initAudio();
        startNextProof();
    }, []);

    // Pulse animation for selected piece
    useEffect(() => {
        if (selectedPieceId) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [selectedPieceId]);

    const startNextProof = () => {
        const nextProof = getRandomRecurrenceProof();
        // shuffle pool
        nextProof.pool = [...nextProof.pool].sort(() => Math.random() - 0.5);
        setProof(nextProof);
        setCurrentLineIdx(0);
        setFilledBlanks({});
        setSelectedPieceId(null);
        setIsComplete(false);
    };

    const handlePieceTap = (pieceId: string) => {
        if (selectedPieceId === pieceId) {
            setSelectedPieceId(null);
        } else {
            setSelectedPieceId(pieceId);
        }
    };

    const triggerShake = (blankId: string) => {
        if (!shakeAnims[blankId]) shakeAnims[blankId] = new Animated.Value(0);
        
        Animated.sequence([
            Animated.timing(shakeAnims[blankId], { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnims[blankId], { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnims[blankId], { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnims[blankId], { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const triggerSuccess = (blankId: string) => {
        if (!successAnims[blankId]) successAnims[blankId] = new Animated.Value(1);
        successAnims[blankId].setValue(0.8);
        Animated.spring(successAnims[blankId], {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleBlankTap = (lineId: string, blankId: string, correctPieceId: string, isLineActive: boolean) => {
        if (!selectedPieceId || !isLineActive || isComplete) return;

        const globalBlankId = `${lineId}_${blankId}`;

        if (selectedPieceId === correctPieceId) {
            setFilledBlanks(prev => ({ ...prev, [globalBlankId]: selectedPieceId }));
            triggerSuccess(globalBlankId);
            setSelectedPieceId(null);
            playCorrect();
            setScore(s => s + 10);
            
        } else {
            triggerShake(globalBlankId);
            playIncorrect();
            // Optional: don't deselect to allow quick second try
        }
    };

    useEffect(() => {
        if (!proof) return;
        
        if (currentLineIdx >= proof.lines.length) {
            if (!isComplete) {
                setIsComplete(true);
                playCorrect();
                setScore(s => s + 50);
            }
            return;
        }

        const currentLine = proof.lines[currentLineIdx];
        const allBlanksFilled = currentLine.blanks.every(b => {
            return filledBlanks[`${currentLine.id}_${b.id}`] !== undefined;
        });

        if (allBlanksFilled) {
            // Auto-advance after small delay (or immediately for informational lines without blanks)
            const delay = currentLine.blanks.length > 0 ? 800 : 250;
            const timer = setTimeout(() => {
                setCurrentLineIdx(idx => idx + 1);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [filledBlanks, currentLineIdx, proof, isComplete]);

    if (!proof) return null;

    const renderLine = (line: RecurrenceLine, idx: number) => {
        const isActive = idx === currentLineIdx;
        const isPast = idx < currentLineIdx;
        const isFuture = idx > currentLineIdx;

        if (isFuture) return null;

        const elements: React.ReactNode[] = [];
        line.textParts.forEach((part, i) => {
            // text parts
            if (part !== '') {
                elements.push(
                    <MathText 
                        key={`text-${i}`} 
                        style={[styles.lineText, isPast && styles.lineTextPast, isActive && styles.lineTextActive]}
                    >
                        {part}
                    </MathText>
                );
            }
            
            // blank after this part, except for the last part
            if (i < line.blanks.length) {
                const blankInfo = line.blanks[i];
                const globalBlankId = `${line.id}_${blankInfo.id}`;
                const filledPieceId = filledBlanks[globalBlankId];
                
                if (filledPieceId) {
                    const mathPiece = proof.pool.find(p => p.id === filledPieceId)?.math || '';
                    if (!successAnims[globalBlankId]) successAnims[globalBlankId] = new Animated.Value(1);
                    
                    elements.push(
                        <Animated.View 
                            key={`blank-${i}`} 
                            style={[
                                styles.filledBlank,
                                { transform: [{ scale: successAnims[globalBlankId] }] }
                            ]}
                        >
                            <MathText style={styles.filledBlankText}>{mathPiece}</MathText>
                        </Animated.View>
                    );
                } else {
                    if (!shakeAnims[globalBlankId]) shakeAnims[globalBlankId] = new Animated.Value(0);
                    
                    elements.push(
                        <Animated.View 
                            key={`blank-${i}`}
                            style={{ transform: [{ translateX: shakeAnims[globalBlankId] }] }}
                        >
                            <TouchableOpacity 
                                style={[
                                    styles.emptyBlank, 
                                    isActive && selectedPieceId && styles.emptyBlankTargetable,
                                    !isActive && styles.emptyBlankDisabled
                                ]}
                                disabled={!isActive || !selectedPieceId}
                                onPress={() => handleBlankTap(line.id, blankInfo.id, blankInfo.correctPieceId, isActive)}
                            >
                                <Text style={styles.emptyBlankHint}>?</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }
            }
        });

        return (
            <FadeInView key={line.id} delay={100} style={[styles.lineBox, isActive && styles.lineBoxActive, isPast && styles.lineBoxPast]}>
                <View style={styles.lineContent}>
                    {elements}
                </View>
            </FadeInView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <View style={styles.header}>
                    {onBack && <BackButton onPress={onBack} />}
                    <View style={styles.headerTextCenter}>
                        <Text style={styles.headerTitle}>Construtor de Fórmulas</Text>
                        <Text style={styles.headerSubtitle}>Complete a demonstração</Text>
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>PONTOS</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                    </View>
                </View>

                <AnimatedCard borderColor={colors.primary} style={styles.targetCard}>
                    <Text style={styles.instruction}>Integral Alvo:</Text>
                    <DisplayMath>{proof.integralTarget}</DisplayMath>
                </AnimatedCard>

                <ScrollView 
                    style={styles.proofArea} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.proofContent}
                >
                    {proof.lines.map((line, idx) => renderLine(line, idx))}

                    {isComplete && (
                        <FadeInView style={styles.successBox}>
                            <View style={styles.successIconContainer}>
                                <Text style={styles.successIcon}>✨</Text>
                            </View>
                            <Text style={styles.successTitle}>Demonstração Concluída!</Text>
                            <Text style={styles.successSubtitle}>Você dominou esta recorrência.</Text>
                            <TouchableOpacity style={styles.nextButton} onPress={startNextProof}>
                                <Text style={styles.nextButtonText}>Próximo Desafio</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}
                    <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Pool Area fixed at bottom */}
                {!isComplete && (
                    <View style={[styles.poolArea, { backgroundColor: colors.surface }]}>
                        <View style={styles.poolHeader}>
                            <Text style={styles.poolTitle}>Peças disponíveis:</Text>
                            {selectedPieceId && (
                                <FadeInView style={styles.selectionHint}>
                                    <Text style={styles.selectionHintText}>Toque em um [?] para encaixar</Text>
                                </FadeInView>
                            )}
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poolScroll}>
                            {proof.pool.map((piece) => {
                                const isSelected = selectedPieceId === piece.id;
                                return (
                                    <TouchableOpacity 
                                        key={piece.id} 
                                        activeOpacity={0.7}
                                        style={[styles.pieceContainer]}
                                        onPress={() => handlePieceTap(piece.id)}
                                    >
                                        <Animated.View 
                                            style={[
                                                styles.pieceBox, 
                                                isSelected && styles.pieceBoxSelected,
                                                isSelected && { transform: [{ scale: pulseAnim }] }
                                            ]}
                                        >
                                            <MathText style={[styles.pieceText, isSelected && styles.pieceTextSelected]}>
                                                {piece.math}
                                            </MathText>
                                        </Animated.View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
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
        paddingBottom: spacing.md,
    },
    headerTextCenter: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: spacing.sm,
    },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.textPrimary },
    headerSubtitle: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '500' },
    
    scoreContainer: {
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        minWidth: 70,
        ...shadows.sm,
    },
    scoreLabel: { fontSize: 8, color: colors.textTertiary, fontWeight: '700' },
    scoreValue: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary },
    
    targetCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.sm,
    },
    instruction: { 
        fontSize: fontSize.xs, 
        color: colors.textSecondary, 
        marginBottom: spacing.xs, 
        textAlign: 'left',
        fontWeight: '600'
    },
    
    proofArea: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    proofContent: {
        paddingTop: spacing.sm,
    },
    lineBox: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 6,
        borderColor: colors.border,
        ...shadows.sm,
    },
    lineBoxActive: {
        borderColor: colors.primary,
        backgroundColor: colors.surface,
        ...shadows.md,
        transform: [{ scale: 1.02 }],
    },
    lineBoxPast: {
        borderColor: colors.success,
        backgroundColor: colors.surface + '90',
        opacity: 0.9,
    },
    lineContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    lineText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: '600',
        lineHeight: 32,
    },
    lineTextPast: {
        color: colors.textSecondary,
    },
    lineTextActive: {
        color: colors.textPrimary,
    },
    
    emptyBlank: {
        backgroundColor: colors.surfaceAlt,
        minWidth: 45,
        height: 32,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBlankTargetable: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '15',
        borderStyle: 'solid',
        borderWidth: 3,
    },
    emptyBlankDisabled: {
        opacity: 0.4,
    },
    emptyBlankHint: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: '800',
    },
    
    filledBlank: {
        backgroundColor: colors.success + '15',
        paddingHorizontal: spacing.sm,
        minWidth: 50,
        height: 34,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.success,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    filledBlankText: {
        fontSize: fontSize.md,
        color: colors.success,
        fontWeight: '800',
    },
    
    poolArea: {
        paddingTop: spacing.md,
        paddingBottom: 80, // Increased to clear TabBar
        borderTopWidth: 1,
        borderColor: colors.border,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...shadows.lg,
    },
    poolHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    poolTitle: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    selectionHint: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    selectionHintText: {
        fontSize: 10,
        color: colors.textWhite,
        fontWeight: '700',
    },
    poolScroll: {
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
        paddingBottom: spacing.sm,
    },
    pieceContainer: {
        paddingVertical: 4,
    },
    pieceBox: {
        backgroundColor: colors.surfaceAlt,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    pieceBoxSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.surface,
        borderWidth: 3,
        ...shadows.md,
    },
    pieceText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    pieceTextSelected: {
        color: colors.primary,
    },
    
    successBox: {
        marginTop: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: colors.success,
        padding: spacing.xxl,
        alignItems: 'center',
        ...shadows.lg,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: colors.success + '20',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    successIcon: { fontSize: 40 },
    successTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.success, marginBottom: spacing.xs },
    successSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
    nextButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 40,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        ...shadows.md,
    },
    nextButtonText: { color: colors.textWhite, fontWeight: '800', fontSize: fontSize.md },
    bottomPadding: { height: 180 },
});
