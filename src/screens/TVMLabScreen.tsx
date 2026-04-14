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
import { playCorrect, initAudio } from '../utils/sounds';
import BackButton from '../components/BackButton';
import MathText, { DisplayMath } from '../components/MathText';
import FunctionGraph from '../components/FunctionGraph';
import AnimatedCard, { FadeInView } from '../components/AnimatedCard';
import { TVMLevel, getRandomTVMLevel } from '../data/tvmQuestions';

interface TVMLabScreenProps {
    onBack?: () => void;
}

export default function TVMLabScreen({ onBack }: TVMLabScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [level, setLevel] = useState<TVMLevel | null>(null);
    const [c, setC] = useState<number>(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [score, setScore] = useState(0);

    const GRAPH_WIDTH = 280;
    const GRAPH_HEIGHT = 200;

    useEffect(() => {
        initAudio();
        startNextLevel();
    }, []);

    const startNextLevel = () => {
        const nextLv = getRandomTVMLevel();
        setLevel(nextLv);
        // Start c near a
        setC(nextLv.a + (nextLv.b - nextLv.a) * 0.1);
        setIsSuccess(false);
    };

    const handleMoveC = (direction: -1 | 1) => {
        if (!level || isSuccess) return;
        const step = (level.b - level.a) / 40;
        let newC = c + direction * step;
        
        // Clamp
        if (newC < level.a) newC = level.a;
        if (newC > level.b) newC = level.b;
        
        setC(newC);

        // Check if within tolerance of expectedC
        if (Math.abs(newC - level.expectedC) < step * 1.5) {
            setC(level.expectedC); // snap
            setIsSuccess(true);
            playCorrect();
            setScore(s => s + 50);
        }
    };

    if (!level) return null;

    // We calculate tangent line points to render as an overlay.
    // Secant equation: y - f(a) = m*(x - a)
    const fa = level.f(level.a);
    const fb = level.f(level.b);
    const mSecant = (fb - fa) / (level.b - level.a);

    // Tangent equation at c: y - f(c) = m*(x - c)
    const mTangent = level.df(c);
    const fc = level.f(c);

    // Transform points manually to overlay over SVG
    // padding match FunctionGraph: { top: 15, right: 15, bottom: 25, left: 30 }
    const padding = { top: 15, right: 15, bottom: 25, left: 30 };
    const graphWidth = GRAPH_WIDTH - padding.left - padding.right;
    const graphHeight = GRAPH_HEIGHT - padding.top - padding.bottom;

    const [xMin, xMax] = level.graphDomain;
    const [yMin, yMax] = level.graphImage;
    const safeXSpan = xMax - xMin === 0 ? 1 : (xMax - xMin);
    const safeYSpan = yMax - yMin === 0 ? 1 : (yMax - yMin);

    const xScale = (x: number) => padding.left + ((x - xMin) / safeXSpan) * graphWidth;
    const yScale = (y: number) => padding.top + graphHeight - ((y - yMin) / safeYSpan) * graphHeight;

    // Build Secant line (from a to b)
    const secantX1 = xScale(level.a);
    const secantY1 = yScale(fa);
    const secantX2 = xScale(level.b);
    const secantY2 = yScale(fb);

    // Build Tangent line at c (extend a bit)
    const tangLengthX = (xMax - xMin) * 0.3; // extend length
    const tangX1 = c - tangLengthX;
    const tangY1 = fc + mTangent * (-tangLengthX);
    const tangX2 = c + tangLengthX;
    const tangY2 = fc + mTangent * (tangLengthX);

    const pxTang1 = xScale(tangX1);
    const pyTang1 = yScale(tangY1);
    const pxTang2 = xScale(tangX2);
    const pyTang2 = yScale(tangY2);

    // Point c
    const pxC = xScale(c);
    const pyC = yScale(fc);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        {onBack && <BackButton onPress={onBack} />}
                        <Text style={styles.headerTitle}>TVM Lab</Text>
                        <Text style={styles.scoreText}>Pts: {score}</Text>
                    </View>

                    <Text style={styles.instruction}>{level.description}</Text>

                    <AnimatedCard borderColor={colors.primary}>
                        <MathText style={styles.functionText} size="large">{level.functionEquation}</MathText>
                        <Text style={styles.boundsText}>Intervalo: [{level.a}, {level.b}]</Text>
                    </AnimatedCard>

                    <View style={styles.graphWrapper}>
                        <FunctionGraph
                            points={level.points}
                            domainRange={level.graphDomain}
                            imageRange={level.graphImage}
                            width={GRAPH_WIDTH}
                            height={GRAPH_HEIGHT}
                            curveColor={colors.primary}
                        />

                        {/* Overlay elements */}
                        {/* Secant line */}
                        <View style={[
                            styles.lineOverlay,
                            { 
                                backgroundColor: colors.info,
                                height: 2,
                                width: Math.sqrt(Math.pow(secantX2 - secantX1, 2) + Math.pow(secantY2 - secantY1, 2)),
                                left: secantX1,
                                top: secantY1,
                                transform: [
                                    { translateX: 0 },
                                    { translateY: -1 }, // center height
                                    { rotate: `${Math.atan2(secantY2 - secantY1, secantX2 - secantX1)}rad` }
                                ],
                                transformOrigin: '0% 50%'
                            } as any
                        ]} />

                        {/* Tangent line */}
                        <View style={[
                            styles.lineOverlay,
                            { 
                                backgroundColor: isSuccess ? colors.success : colors.warning,
                                height: 2,
                                width: Math.sqrt(Math.pow(pxTang2 - pxTang1, 2) + Math.pow(pyTang2 - pyTang1, 2)),
                                left: pxTang1,
                                top: pyTang1,
                                transform: [
                                    { translateX: 0 },
                                    { translateY: -1 },
                                    { rotate: `${Math.atan2(pyTang2 - pyTang1, pxTang2 - pxTang1)}rad` }
                                ],
                                transformOrigin: '0% 50%'
                            } as any
                        ]} />

                        {/* Point C */}
                        <View style={[
                            styles.pointOverlay,
                            { 
                                backgroundColor: isSuccess ? colors.success : colors.warning,
                                left: pxC - 5, 
                                top: pyC - 5 
                            }
                        ]} />
                    </View>

                    <View style={styles.controlsPanel}>
                        <Text style={styles.controlTitle}>Sintonize o ponto <MathText formula>c</MathText></Text>
                        <MathText style={styles.cValueText}>c = {c.toFixed(2)}</MathText>
                        
                        <View style={styles.sliderMock}>
                            <TouchableOpacity style={styles.tuneButton} onPress={() => handleMoveC(-1)} disabled={isSuccess}>
                                <Text style={styles.tuneButtonText}>◀ Mover Esquerda</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.tuneButton} onPress={() => handleMoveC(1)} disabled={isSuccess}>
                                <Text style={styles.tuneButtonText}>Mover Direita ▶</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hintText}>O objetivo é fazer a reta tangente (laranja) ficar paralela à secante (azul).</Text>
                    </View>

                    {isSuccess && (
                        <FadeInView style={styles.successBox}>
                            <Text style={styles.successTitle}>TVM Alcançado!</Text>
                            <Text style={styles.successDesc}>As retas estão paralelas.</Text>
                            <DisplayMath>{`f\\\'(c) = \\frac{f(b) - f(a)}{b - a}`}</DisplayMath>
                            <DisplayMath>{`f\\\'(${level.expectedC.toFixed(2)}) = ${mSecant.toFixed(2)}`}</DisplayMath>
                            <TouchableOpacity style={styles.nextButton} onPress={startNextLevel}>
                                <Text style={styles.nextButtonText}>Próximo Lab</Text>
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
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
    scoreText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
    instruction: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md, paddingHorizontal: spacing.xl, textAlign: 'center' },
    
    functionText: { textAlign: 'center', color: colors.primary, fontWeight: '700' },
    boundsText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xs },
    
    graphWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.lg,
        position: 'relative',
        width: 280,
        height: 200,
        alignSelf: 'center',
    },
    lineOverlay: {
        position: 'absolute',
    },
    pointOverlay: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    
    controlsPanel: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    controlTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
    cValueText: { color: colors.warning, fontWeight: '700', marginBottom: spacing.md },
    sliderMock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: spacing.sm,
    },
    tuneButton: {
        flex: 1,
        backgroundColor: colors.surfaceAlt,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    tuneButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary },
    hintText: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },

    successBox: {
        marginHorizontal: spacing.xl,
        marginTop: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.success,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    successTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.success, marginBottom: spacing.xs },
    successDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
    nextButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    nextButtonText: { color: colors.textWhite, fontWeight: '700', fontSize: fontSize.md },
    bottomPadding: { height: 100 },
});
