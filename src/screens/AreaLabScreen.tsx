import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, G } from 'react-native-svg';
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
import { AreaQuestion, getRandomAreaQuestion } from '../data/areaQuestions';

type PhaseId = 'bounds' | 'integrand' | 'area' | 'done';

export default function AreaLabScreen({ onBack }: { onBack?: () => void }) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [question, setQuestion] = useState<AreaQuestion | null>(null);
    const [phase, setPhase] = useState<PhaseId>('bounds');
    const [score, setScore] = useState(0);

    // Selected answers in each phase
    const [selectedBounds, setSelectedBounds] = useState<string | null>(null);
    const [selectedIntegrand, setSelectedIntegrand] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);

    const GRAPH_WIDTH = 290;
    const GRAPH_HEIGHT = 210;

    useEffect(() => {
        initAudio();
        nextQuestion();
    }, []);

    const nextQuestion = () => {
        setQuestion(getRandomAreaQuestion());
        setPhase('bounds');
        setSelectedBounds(null);
        setSelectedIntegrand(null);
        setSelectedArea(null);
    };

    const handleConfirmBounds = () => {
        if (!question || !selectedBounds) return;
        if (selectedBounds === question.correctBounds) {
            playCorrect(); notifySuccess();
            setScore(s => s + 15);
            setPhase('integrand');
        } else {
            playIncorrect(); notifyError();
            setSelectedBounds(null);
        }
    };

    const handleConfirmIntegrand = () => {
        if (!question || !selectedIntegrand) return;
        if (selectedIntegrand === question.correctIntegrand) {
            playCorrect(); notifySuccess();
            setScore(s => s + 15);
            setPhase('area');
        } else {
            playIncorrect(); notifyError();
            setSelectedIntegrand(null);
        }
    };

    const handleConfirmArea = () => {
        if (!question || !selectedArea) return;
        if (selectedArea === question.correctArea) {
            playCorrect(); notifySuccess();
            setScore(s => s + 20);
            setPhase('done');
        } else {
            playIncorrect(); notifyError();
            setSelectedArea(null);
        }
    };

    // Math Graph calculations
    const padding = { top: 15, right: 15, bottom: 25, left: 30 };
    const graphWidth = GRAPH_WIDTH - padding.left - padding.right;
    const graphHeight = GRAPH_HEIGHT - padding.top - padding.bottom;

    const xScale = (x: number) => {
        if (!question) return 0;
        const [xMin, xMax] = question.graphDomain;
        return padding.left + ((x - xMin) / (xMax - xMin)) * graphWidth;
    };

    const yScale = (y: number) => {
        if (!question) return 0;
        const [yMin, yMax] = question.graphImage;
        return padding.top + graphHeight - ((y - yMin) / (yMax - yMin)) * graphHeight;
    };

    const pathDataF = useMemo(() => {
        if (!question) return '';
        const [xMin, xMax] = question.graphDomain;
        const points = Array.from({ length: 60 }).map((_, i) => {
            const x = xMin + (i * (xMax - xMin)) / 59;
            return { x, y: question.f(x) };
        });
        return 'M ' + points.map(p => `${xScale(p.x)} ${yScale(p.y)}`).join(' L ');
    }, [question]);

    const pathDataG = useMemo(() => {
        if (!question) return '';
        const [xMin, xMax] = question.graphDomain;
        const points = Array.from({ length: 60 }).map((_, i) => {
            const x = xMin + (i * (xMax - xMin)) / 59;
            return { x, y: question.g(x) };
        });
        return 'M ' + points.map(p => `${xScale(p.x)} ${yScale(p.y)}`).join(' L ');
    }, [question]);

    // Construct the shaded region between f(x) and g(x) from a to b
    const shadedAreaPath = useMemo(() => {
        if (!question) return '';
        const steps = 30;
        const pts: string[] = [];
        // Forward along f(x)
        for (let i = 0; i <= steps; i++) {
            const x = question.a + (i * (question.b - question.a)) / steps;
            pts.push(`${xScale(x)},${yScale(question.f(x))}`);
        }
        // Backward along g(x)
        for (let i = steps; i >= 0; i--) {
            const x = question.a + (i * (question.b - question.a)) / steps;
            pts.push(`${xScale(x)},${yScale(question.g(x))}`);
        }
        return `M ${pts.join(' L ')} Z`;
    }, [question]);

    // Grid coordinates
    const gridLines = useMemo(() => {
        if (!question) return [];
        const lines: { x1: number; y1: number; x2: number; y2: number; label: string; isVertical: boolean }[] = [];
        const [xMin, xMax] = question.graphDomain;
        const [yMin, yMax] = question.graphImage;

        const xStep = (xMax - xMin) / 4;
        for (let x = xMin; x <= xMax; x += xStep) {
            lines.push({
                x1: xScale(x),
                y1: padding.top,
                x2: xScale(x),
                y2: padding.top + graphHeight,
                label: x.toFixed(1),
                isVertical: true,
            });
        }

        const yStep = (yMax - yMin) / 4;
        for (let y = yMin; y <= yMax; y += yStep) {
            lines.push({
                x1: padding.left,
                y1: yScale(y),
                x2: padding.left + graphWidth,
                y2: yScale(y),
                label: y.toFixed(1),
                isVertical: false,
            });
        }
        return lines;
    }, [question]);

    if (!question) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <ScreenHeader
                        title="Área Lab"
                        subtitle="Integrais e Áreas"
                        leftAction={onBack && <BackButton onPress={onBack} />}
                        rightAction={<ScoreBadge score={score} />}
                    />

                    {/* Stepper tracker */}
                    <PhaseIndicator
                        phases={[
                            { id: 'bounds', label: 'Limites' },
                            { id: 'integrand', label: 'Montagem' },
                            { id: 'area', label: 'Integração' },
                        ]}
                        currentPhaseId={phase === 'done' ? 'area' : phase}
                    />

                    {/* Problem Definition Card */}
                    <AnimatedCard borderColor={colors.primary} style={styles.questionCard}>
                        <Text style={styles.descTitle}>Determine a área entre as curvas:</Text>
                        <MathText style={styles.descText} size="large">{question.curvesDescription}</MathText>
                    </AnimatedCard>

                    {/* SVG GRAPH PLOT */}
                    <View style={styles.graphContainer}>
                        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                            {/* Grid background */}
                            {gridLines.map((line, i) => (
                                <G key={i}>
                                    <Line
                                        x1={line.x1}
                                        y1={line.y1}
                                        x2={line.x2}
                                        y2={line.y2}
                                        stroke={colors.border}
                                        strokeWidth={0.5}
                                        strokeDasharray="3,3"
                                    />
                                    {line.isVertical ? (
                                        <SvgText
                                            x={line.x1}
                                            y={padding.top + graphHeight + 12}
                                            fill={colors.textSecondary}
                                            fontSize={8}
                                            textAnchor="middle"
                                        >
                                            {line.label}
                                        </SvgText>
                                    ) : (
                                        <SvgText
                                            x={padding.left - 6}
                                            y={line.y1 + 3}
                                            fill={colors.textSecondary}
                                            fontSize={8}
                                            textAnchor="end"
                                        >
                                            {line.label}
                                        </SvgText>
                                    )}
                                </G>
                            ))}

                            {/* Shaded Area of integration */}
                            {phase !== 'bounds' && (
                                <Path
                                    d={shadedAreaPath}
                                    fill={colors.primary + '38'}
                                    stroke={colors.primary}
                                    strokeWidth={0.5}
                                    strokeDasharray="2,2"
                                />
                            )}

                            {/* Main Axes */}
                            <Line
                                x1={padding.left}
                                y1={yScale(0)}
                                x2={padding.left + graphWidth}
                                y2={yScale(0)}
                                stroke={colors.textPrimary}
                                strokeWidth={1}
                            />
                            <Line
                                x1={xScale(0)}
                                y1={padding.top}
                                x2={xScale(0)}
                                y2={padding.top + graphHeight}
                                stroke={colors.textPrimary}
                                strokeWidth={1}
                            />

                            {/* f(x) curve */}
                            <Path
                                d={pathDataF}
                                stroke={colors.info}
                                strokeWidth={2}
                                fill="none"
                            />

                            {/* g(x) curve */}
                            <Path
                                d={pathDataG}
                                stroke={colors.warning}
                                strokeWidth={2}
                                fill="none"
                            />
                        </Svg>

                        {/* Curve Labels */}
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
                                <MathText style={styles.legendLabel}>{question.fText}</MathText>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                                <MathText style={styles.legendLabel}>{question.gText}</MathText>
                            </View>
                        </View>
                    </View>

                    {/* PHASE 1: BOUNDS */}
                    {phase === 'bounds' && (
                        <FadeInView style={styles.interactionPanel}>
                            <Text style={styles.panelTitle}>Etapa 1: Encontre os Limites de Integração</Text>
                            <MathText style={styles.panelDesc}>Resolva $f(x) = g(x)$ para encontrar os pontos de interseção $[a, b]$ das curvas.</MathText>
                            
                            <View style={styles.optionsGrid}>
                                {question.boundsOptions.map((opt, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.optionCard, selectedBounds === opt && styles.optionSelected]}
                                        onPress={() => setSelectedBounds(opt)}
                                    >
                                        <MathText style={selectedBounds === opt ? styles.optTextSelected : styles.optText}>{opt}</MathText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.confirmBtn, !selectedBounds && styles.disabledBtn]}
                                disabled={!selectedBounds}
                                onPress={handleConfirmBounds}
                            >
                                <Text style={styles.confirmBtnText}>Confirmar Limites</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* PHASE 2: INTEGRAND */}
                    {phase === 'integrand' && (
                        <FadeInView style={styles.interactionPanel}>
                            <Text style={styles.panelTitle}>Etapa 2: Monte o Integrando da Área</Text>
                            <MathText style={styles.panelDesc}>Subtraia a função de baixo da função de cima no intervalo $[{question.a}, {question.b}]$.</MathText>

                            <View style={styles.optionsGrid}>
                                {question.integrandOptions.map((opt, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.optionCard, selectedIntegrand === opt && styles.optionSelected]}
                                        onPress={() => setSelectedIntegrand(opt)}
                                    >
                                        <MathText style={selectedIntegrand === opt ? styles.optTextSelected : styles.optText}>{`\\int_{${question.a}}^{${question.b}} (${opt}) dx`}</MathText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.confirmBtn, !selectedIntegrand && styles.disabledBtn]}
                                disabled={!selectedIntegrand}
                                onPress={handleConfirmIntegrand}
                            >
                                <Text style={styles.confirmBtnText}>Confirmar Integrando</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* PHASE 3: CALCULATE AREA */}
                    {phase === 'area' && (
                        <FadeInView style={styles.interactionPanel}>
                            <Text style={styles.panelTitle}>Etapa 3: Calcule a Área Integrada</Text>
                            <MathText style={styles.panelDesc}>Use o Teorema Fundamental do Cálculo para computar o valor final da área.</MathText>

                            <View style={styles.optionsGrid}>
                                {question.areaOptions.map((opt, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.optionCard, selectedArea === opt && styles.optionSelected]}
                                        onPress={() => setSelectedArea(opt)}
                                    >
                                        <MathText style={selectedArea === opt ? styles.optTextSelected : styles.optText}>{opt}</MathText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.confirmBtn, !selectedArea && styles.disabledBtn]}
                                disabled={!selectedArea}
                                onPress={handleConfirmArea}
                            >
                                <Text style={styles.confirmBtnText}>Confirmar Valor da Área</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {/* DONE BOX */}
                    {phase === 'done' && (
                        <FadeInView style={styles.successPanel}>
                            <Text style={styles.successTitle}>🎉 Parabéns! Área Resolvida!</Text>
                            <DisplayMath>{`\\text{Área} = \\int_{${question.a}}^{${question.b}} (${question.correctIntegrand}) dx = ${question.correctArea}`}</DisplayMath>
                            <Text style={styles.successDesc}>{question.explanation}</Text>

                            <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
                                <Text style={styles.nextBtnText}>Próximo Desafio</Text>
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
    scrollContent: { paddingBottom: TAB_BAR_CLEARANCE + 60, paddingHorizontal: spacing.xl },
    questionCard: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    descTitle: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4, fontWeight: '600' },
    descText: { fontWeight: '700', color: colors.primary },
    
    graphContainer: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        marginVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    legendContainer: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginTop: spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: fontSize.xs,
        color: colors.textPrimary,
        fontWeight: '600',
    },

    interactionPanel: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.md,
    },
    panelTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, textAlign: 'center' },
    panelDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center', lineHeight: 16 },
    
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    optionCard: {
        backgroundColor: colors.surfaceAlt,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minWidth: '45%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '18',
    },
    optText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '600' },
    optTextSelected: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },

    confirmBtn: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    disabledBtn: { opacity: 0.5 },
    confirmBtnText: { color: colors.textWhite, fontWeight: '700', fontSize: fontSize.md },

    successPanel: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderColor: colors.success,
        padding: spacing.lg,
        alignItems: 'center',
        marginVertical: spacing.md,
        ...shadows.md,
    },
    successTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.success, marginBottom: spacing.md },
    successDesc: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
    
    nextBtn: {
        backgroundColor: '#4361ee',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        marginTop: spacing.lg,
        ...shadows.sm,
    },
    nextBtnText: { color: colors.textWhite, fontWeight: '700', fontSize: fontSize.md },

    bottomPadding: { height: TAB_BAR_CLEARANCE },
});
