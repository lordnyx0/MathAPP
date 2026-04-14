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

    useEffect(() => {
        initAudio();
        startNextProof();
    }, []);

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

    const handleBlankTap = (lineId: string, blankId: string, correctPieceId: string, isLineActive: boolean) => {
        if (!selectedPieceId || !isLineActive || isComplete) return;

        const globalBlankId = `${lineId}_${blankId}`;

        if (selectedPieceId === correctPieceId) {
            setFilledBlanks(prev => ({ ...prev, [globalBlankId]: selectedPieceId }));
            setSelectedPieceId(null);
            playCorrect();
            setScore(s => s + 10);
            
            checkLineCompletion(lineId);
        } else {
            playIncorrect();
            setSelectedPieceId(null);
        }
    };

    const checkLineCompletion = (lineId: string) => {
        if (!proof) return;
        const currentLine = proof.lines[currentLineIdx];
        if (currentLine.id !== lineId) return;

        // Count how many blanks this line has
        const totalBlanks = currentLine.blanks.length;
        
        // Count how many are filled right now (including the one just tapped via state async workaround? No, we need to count directly)
        // Since we evaluate inside handleBlankTap after setting state, we can simulate:
        let filledCount = 0;
        currentLine.blanks.forEach(b => {
            const gid = `${lineId}_${b.id}`;
            // The one we just filled might not be in state yet if we check synchronously, but wait, we already know the exact piece was correct!
        });

        // Better approach: use effect to check line completion
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

        if (allBlanksFilled && currentLine.blanks.length > 0) {
            // Auto-advance after small delay
            const timer = setTimeout(() => {
                setCurrentLineIdx(idx => idx + 1);
            }, 500);
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
                elements.push(<Text key={`text-${i}`} style={[styles.lineText, isPast && styles.lineTextPast]}>{latexToUnicode(part)}</Text>);
            }
            
            // blank after this part, except for the last part
            if (i < line.blanks.length) {
                const blankInfo = line.blanks[i];
                const globalBlankId = `${line.id}_${blankInfo.id}`;
                const filledPieceId = filledBlanks[globalBlankId];
                
                if (filledPieceId) {
                    const mathPiece = proof.pool.find(p => p.id === filledPieceId)?.math || '';
                    elements.push(
                        <View key={`blank-${i}`} style={styles.filledBlank}>
                            <MathText style={styles.filledBlankText}>{mathPiece}</MathText>
                        </View>
                    );
                } else {
                    elements.push(
                        <TouchableOpacity 
                            key={`blank-${i}`} 
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
                    <Text style={styles.headerTitle}>Construtor de Fórmulas</Text>
                    <Text style={styles.scoreText}>Pts: {score}</Text>
                </View>

                <AnimatedCard borderColor={colors.primary}>
                    <Text style={styles.instruction}>Prove a fórmula para:</Text>
                    <DisplayMath>{proof.integralTarget}</DisplayMath>
                </AnimatedCard>

                <ScrollView style={styles.proofArea} showsVerticalScrollIndicator={false}>
                    {proof.lines.map((line, idx) => renderLine(line, idx))}

                    {isComplete && (
                        <FadeInView style={styles.successBox}>
                            <Text style={styles.successTitle}>Demonstração Concluída!</Text>
                            <TouchableOpacity style={styles.nextButton} onPress={startNextProof}>
                                <Text style={styles.nextButtonText}>Próximo Desafio</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}
                    <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Pool Area fixed at bottom */}
                {!isComplete && (
                    <View style={[styles.poolArea, { backgroundColor: colors.surfaceAlt }]}>
                        <Text style={styles.poolTitle}>Peças disponíveis:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poolScroll}>
                            {proof.pool.map((piece) => {
                                const isSelected = selectedPieceId === piece.id;
                                return (
                                    <TouchableOpacity 
                                        key={piece.id} 
                                        style={[styles.pieceBox, isSelected && styles.pieceBoxSelected]}
                                        onPress={() => handlePieceTap(piece.id)}
                                    >
                                        <MathText style={[styles.pieceText, isSelected && styles.pieceTextSelected]}>{piece.math}</MathText>
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
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
    scoreText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
    instruction: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'center' },
    
    proofArea: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.sm,
    },
    lineBox: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderColor: colors.border,
        ...shadows.sm,
    },
    lineBoxActive: {
        borderColor: colors.primary,
        backgroundColor: colors.surface,
    },
    lineBoxPast: {
        borderColor: colors.success,
        backgroundColor: colors.surface + '80', // semi transparent
    },
    lineContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    lineText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: '500',
        lineHeight: 28,
    },
    lineTextPast: {
        color: colors.textSecondary,
    },
    
    emptyBlank: {
        backgroundColor: colors.surfaceAlt,
        minWidth: 40,
        height: 28,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBlankTargetable: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
        borderStyle: 'solid',
        borderWidth: 2,
    },
    emptyBlankDisabled: {
        opacity: 0.5,
    },
    emptyBlankHint: {
        color: colors.textTertiary,
        fontSize: fontSize.sm,
    },
    
    filledBlank: {
        backgroundColor: colors.successLight,
        paddingHorizontal: spacing.xs,
        minWidth: 40,
        height: 28,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.success,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filledBlankText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    
    poolArea: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderColor: colors.border,
        ...shadows.md,
    },
    poolTitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.sm,
    },
    poolScroll: {
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
    },
    pieceBox: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    pieceBoxSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
        transform: [{ translateY: -2 }],
    },
    pieceText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    pieceTextSelected: {
        color: colors.primary,
    },
    
    successBox: {
        marginTop: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.success,
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.md,
    },
    successTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.success, marginBottom: spacing.md },
    nextButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    nextButtonText: { color: colors.textWhite, fontWeight: '700', fontSize: fontSize.md },
    bottomPadding: { height: 120 },
});
