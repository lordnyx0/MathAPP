import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Animated,
    Dimensions,
    Easing,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import BackButton from '../components/BackButton';
import MathText, { DisplayMath } from '../components/MathText';
import { FadeInView } from '../components/AnimatedCard';
import { TrigSprintLevel, getRandomTrigSprintLevel } from '../data/trigSprintQuestions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TrigSprintScreenProps {
    onBack?: () => void;
}

export default function TrigSprintScreen({ onBack }: TrigSprintScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [level, setLevel] = useState<TrigSprintLevel | null>(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'falling' | 'success' | 'gameover'>('falling');

    const fallAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        initAudio();
        startNextLevel();
        return () => fallAnim.stopAnimation();
    }, []);

    const startNextLevel = () => {
        const nextLv = getRandomTrigSprintLevel();
        // shuffle options
        const shuffled = [...nextLv.options].sort(() => Math.random() - 0.5);
        nextLv.options = shuffled;
        
        setLevel(nextLv);
        setGameState('falling');
        fallAnim.setValue(0);

        Animated.timing(fallAnim, {
            toValue: 1,
            duration: 8000, // 8 seconds to fall
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                // Hit the bottom without being solved
                setGameState('gameover');
                playIncorrect();
            }
        });
    };

    const handleCardPlay = (cardId: string) => {
        if (gameState !== 'falling' || !level) return;

        if (cardId === level.correctCardId) {
            fallAnim.stopAnimation();
            playCorrect();
            setScore(prev => prev + 20);
            setGameState('success');
        } else {
            // Wrong card costs time/score, but here we'll just fail the level
            fallAnim.stopAnimation();
            playIncorrect();
            setGameState('gameover');
        }
    };

    const translateY = fallAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, SCREEN_HEIGHT - 350], // Falls until the cards area
    });

    if (!level) return null;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <View style={styles.header}>
                    {onBack && <BackButton onPress={onBack} />}
                    <Text style={styles.headerTitle}>Trig Sprint</Text>
                    <Text style={styles.scoreText}>Pontos: {score}</Text>
                </View>

                {/* Game Area */}
                <View style={styles.gameArea}>
                    {gameState === 'falling' && (
                        <Animated.View style={[styles.fallingBox, { transform: [{ translateY }] }]}>
                            <Text style={styles.fallingLabel}>Simplifique:</Text>
                            <MathText style={styles.fallingMath} formula>{level.fallingExpression}</MathText>
                        </Animated.View>
                    )}

                    {gameState === 'success' && (
                        <FadeInView style={styles.resultBox}>
                            <Text style={styles.successTitle}>Resolvido!</Text>
                            <DisplayMath>{`${level.fallingExpression} = ${level.simplifiedResult}`}</DisplayMath>
                            <TouchableOpacity style={styles.nextButton} onPress={startNextLevel}>
                                <Text style={styles.nextButtonText}>Próximo Sprint</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}

                    {gameState === 'gameover' && (
                        <FadeInView style={[styles.resultBox, { borderColor: colors.error }]}>
                            <Text style={styles.failTitle}>Falhou!</Text>
                            <Text style={styles.failDesc}>A expressão era:</Text>
                            <DisplayMath>{level.fallingExpression}</DisplayMath>
                            <Text style={styles.failDesc}>
                                A identidade correta seria "{level.options.find(o => o.id === level.correctCardId)?.label}".
                            </Text>
                            <TouchableOpacity style={styles.nextButton} onPress={startNextLevel}>
                                <Text style={styles.nextButtonText}>Tentar Novamente</Text>
                            </TouchableOpacity>
                        </FadeInView>
                    )}
                </View>

                {/* Hand Area (Cards) */}
                <View style={styles.handArea}>
                    {level.options.map((card, idx) => (
                        <TouchableOpacity
                            key={`card-${idx}`}
                            style={[
                                styles.card, 
                                gameState !== 'falling' && styles.cardDisabled
                            ]}
                            disabled={gameState !== 'falling'}
                            onPress={() => handleCardPlay(card.id)}
                        >
                            <Text style={styles.cardLabel} numberOfLines={2} adjustsFontSizeToFit>{card.label}</Text>
                            <View style={styles.cardMathBox}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                    <MathText style={styles.cardMathText} size="small" formula>{card.math}</MathText>
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
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
        zIndex: 10,
    },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
    scoreText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
    
    gameArea: {
        flex: 1,
        alignItems: 'center',
        paddingTop: spacing.xl,
        position: 'relative',
    },
    fallingBox: {
        position: 'absolute',
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        ...shadows.md,
        minWidth: 200,
        zIndex: 5,
    },
    fallingLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
    fallingMath: { fontSize: 32, fontWeight: '700', color: colors.primary },
    
    resultBox: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.success,
        alignItems: 'center',
        marginTop: 100,
        marginHorizontal: spacing.xl,
        ...shadows.md,
    },
    successTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.success, marginBottom: spacing.md },
    failTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.error, marginBottom: spacing.md },
    failDesc: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
    
    nextButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    nextButtonText: { color: colors.textWhite, fontWeight: '700', fontSize: fontSize.md },
    
    handArea: {
        flexDirection: 'row',
        paddingHorizontal: spacing.sm,
        paddingBottom: 90, // compensate bottom nav bar height
        paddingTop: spacing.xs,
        gap: spacing.xs,
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    card: {
        flex: 1,
        minHeight: 180,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderTopWidth: 4,
        borderTopColor: colors.primary,
        padding: spacing.sm,
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        ...shadows.md,
    },
    cardDisabled: {
        opacity: 0.5,
    },
    cardLabel: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xs,
        height: 36,
    },
    cardMathBox: {
        backgroundColor: colors.background,
        padding: spacing.xs,
        borderRadius: borderRadius.sm,
        width: '100%',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    cardMathText: {
        color: colors.textSecondary,
        textAlign: 'center',
    }
});
