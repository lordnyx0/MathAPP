import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import { exercises, exerciseTopics, mainCategories, getExercisesByTopic } from '../data';
import StepCard from '../components/StepCard';
import MathText from '../components/MathText';
import { logError } from '../utils';
import { CardSkeleton, LessonListSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import strings from '../i18n/strings';

const ExercisesScreen = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Simulate initial data load
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    const toggleStep = (stepIndex: number) => {
        if (revealedSteps.includes(stepIndex)) {
            setRevealedSteps(revealedSteps.filter(i => i !== stepIndex));
        } else {
            setRevealedSteps([...revealedSteps, stepIndex]);
        }
    };

    const revealAll = () => {
        if (!selectedExercise) return;
        const exercise = exercises.find(e => e.id === selectedExercise);
        if (!exercise) return;
        const allSteps = exercise.steps.map((_, i) => i);
        setRevealedSteps(allSteps);
    };

    const hideAll = () => {
        setRevealedSteps([]);
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
            case 'Básico': return colors.basico;
            case 'Intermediário': return colors.intermediario;
            case 'Avançado': return colors.avancado;
            default: return colors.primary;
        }
    };

    // Main Category Selection
    if (!selectedMainCategory) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={colors.gradientBackground}
                    style={styles.gradient}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>📚 Exercícios Guiados</Text>
                            <Text style={styles.headerSubtitle}>Escolha uma disciplina</Text>
                        </View>

                        {mainCategories.map(cat => {
                            const catTopics = exerciseTopics.filter(t => t.mainCategory === cat.id);
                            const totalExercises = catTopics.reduce((acc, t) => acc + exercises.filter(e => e.topicId === t.id).length, 0);
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.topicCard, { borderColor: cat.color + '40' }]}
                                    onPress={() => setSelectedMainCategory(cat.id)}
                                    activeOpacity={0.8}
                                    accessibilityLabel={`Selecionar ${cat.title}, ${totalExercises} exercícios disponíveis`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.topicIcon}>{cat.icon}</Text>
                                    <View style={styles.topicInfo}>
                                        <Text style={styles.topicTitle}>{cat.title}</Text>
                                        <Text style={styles.topicDesc}>{catTopics.length} provas</Text>
                                        <Text style={[styles.topicCount, { color: cat.color }]}>
                                            {totalExercises} exercícios
                                        </Text>
                                    </View>
                                    <Text style={[styles.chevron, { color: cat.color }]}>▶</Text>
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Topic (Exam) Selection
    if (!selectedTopic) {
        const mainCat = mainCategories.find(c => c.id === selectedMainCategory);
        const catTopics = exerciseTopics.filter(t => t.mainCategory === selectedMainCategory);

        if (!mainCat) return null;

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={colors.gradientBackground}
                    style={styles.gradient}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setSelectedMainCategory(null)}
                            accessibilityLabel={strings.a11y.backButton}
                            accessibilityRole="button"
                        >
                            <Text style={styles.backButtonText}>{strings.back}</Text>
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <View style={styles.topicHeaderRow}>
                                <Text style={styles.topicHeaderIcon}>{mainCat.icon}</Text>
                                <View>
                                    <Text style={styles.headerTitle}>{mainCat.title}</Text>
                                    <Text style={styles.headerSubtitle}>{catTopics.length} avaliações</Text>
                                </View>
                            </View>
                        </View>

                        {catTopics.map(topic => {
                            const topicExercises = exercises.filter(e => e.topicId === topic.id);
                            return (
                                <TouchableOpacity
                                    key={topic.id}
                                    style={[styles.topicCard, { borderColor: topic.color + '40' }]}
                                    onPress={() => setSelectedTopic(topic.id)}
                                    activeOpacity={0.8}
                                    accessibilityLabel={`Selecionar ${topic.title}, ${topicExercises.length} exercícios`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                                    <View style={styles.topicInfo}>
                                        <Text style={styles.topicTitle}>{topic.title}</Text>
                                        <Text style={[styles.topicCount, { color: topic.color }]}>
                                            {topicExercises.length} exercícios
                                        </Text>
                                    </View>
                                    <Text style={[styles.chevron, { color: topic.color }]}>▶</Text>
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Exercise List for Selected Topic
    if (!selectedExercise) {
        const topic = exerciseTopics.find(t => t.id === selectedTopic);
        if (!topic) return null;

        const topicExercises = getExercisesByTopic(selectedTopic || '');

        // Group exercises by category
        const categories = [...new Set(topicExercises.map(ex => ex.category))];

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={colors.gradientBackground}
                    style={styles.gradient}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setSelectedTopic(null)}
                            accessibilityLabel={strings.a11y.backButton}
                            accessibilityRole="button"
                        >
                            <Text style={styles.backButtonText}>{strings.back}</Text>
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <View style={styles.topicHeaderRow}>
                                <Text style={styles.topicHeaderIcon}>{topic.icon}</Text>
                                <View>
                                    <Text style={styles.headerTitle}>{topic.title}</Text>
                                    <Text style={styles.headerSubtitle}>{topicExercises.length} exercícios</Text>
                                </View>
                            </View>
                        </View>

                        {categories.map(category => {
                            const categoryExercises = topicExercises.filter(ex => ex.category === category);
                            return (
                                <View key={String(category)} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{String(category)}</Text>
                                    {categoryExercises.map(ex => (
                                        <TouchableOpacity
                                            key={ex.id}
                                            style={[styles.exerciseCard, { borderColor: topic.color + '40' }]}
                                            onPress={() => {
                                                setSelectedExercise(ex.id);
                                                setRevealedSteps([]);
                                            }}
                                            activeOpacity={0.8}
                                            accessibilityLabel={`${ex.title}, ${ex.difficulty}, ${ex.steps.length} passos`}
                                            accessibilityRole="button"
                                        >
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle} numberOfLines={2}>{ex.title}</Text>
                                                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(ex.difficulty) + '20' }]}>
                                                    <Text style={[styles.difficultyText, { color: getDifficultyColor(ex.difficulty) }]}>
                                                        {ex.difficulty}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardProblem} numberOfLines={2}>{ex.problem}</Text>
                                            <View style={styles.cardFooter}>
                                                <Text style={styles.stepsCount}>{ex.steps.length} passos</Text>
                                                <Text style={[styles.chevron, { color: topic.color }]}>▶</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            );
                        })}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Exercise Detail View
    const exercise = exercises.find(e => e.id === selectedExercise);
    if (!exercise) return null;

    const topic = exerciseTopics.find(t => t.id === exercise.topicId);
    if (!topic) return null;

    const categoryColor = topic.color;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={colors.gradientBackground}
                style={styles.gradient}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            setSelectedExercise(null);
                            setRevealedSteps([]);
                        }}
                        accessibilityLabel={strings.a11y.backButton}
                        accessibilityRole="button"
                    >
                        <Text style={styles.backButtonText}>{strings.back}</Text>
                    </TouchableOpacity>

                    {/* Exercise Header */}
                    <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseTitleRow}>
                            <Text style={styles.exerciseIcon}>{topic.icon}</Text>
                            <View style={styles.exerciseTitleContainer}>
                                <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20', alignSelf: 'flex-start' }]}>
                                    <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                                        {exercise.difficulty}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Problem Statement */}
                        <View style={[styles.problemBox, { borderLeftColor: categoryColor }]}>
                            <Text style={styles.problemLabel}>📝 Problema:</Text>
                            <MathText style={styles.problemText}>{exercise.problem}</MathText>
                        </View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={[styles.controlButton, { backgroundColor: categoryColor }]}
                            onPress={revealAll}
                            accessibilityLabel={strings.exercises.showAllSteps}
                            accessibilityRole="button"
                        >
                            <Text style={styles.controlButtonText}>▼ {strings.exercises.showAllSteps}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, styles.controlButtonSecondary]}
                            onPress={hideAll}
                            accessibilityLabel={strings.exercises.hideAllSteps}
                            accessibilityRole="button"
                        >
                            <Text style={styles.controlButtonTextSecondary}>{strings.exercises.hideAllSteps}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Steps */}
                    <View style={styles.stepsContainer}>
                        {exercise.steps.map((step, index) => (
                            <StepCard
                                key={index}
                                step={step}
                                index={index}
                                isRevealed={revealedSteps.includes(index)}
                                onToggle={() => toggleStep(index)}
                                categoryColor={categoryColor}
                            />
                        ))}
                    </View>

                    {/* Final Answer - Only show when all steps are revealed */}
                    {revealedSteps.length === exercise.steps.length && (
                        <View style={styles.finalAnswer}>
                            <View style={styles.finalAnswerHeader}>
                                <Text style={styles.finalAnswerIcon}>✓</Text>
                                <Text style={styles.finalAnswerLabel}>Resposta Final</Text>
                            </View>
                            <MathText style={styles.finalAnswerText} size="large">{exercise.finalAnswer}</MathText>
                        </View>
                    )}

                    {/* Tips */}
                    <View style={styles.tipsBox}>
                        <Text style={styles.tipsHeader}>💡 Dicas para a Prova</Text>
                        {exercise.tips.map((tip, i) => (
                            <View key={`tip-${i}-${tip.slice(0, 20)}`} style={styles.tipItem}>
                                <Text style={styles.tipBullet}>•</Text>
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    topicCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        ...shadows.md,
    },
    topicIcon: {
        fontSize: 40,
        marginRight: spacing.lg,
    },
    topicInfo: {
        flex: 1,
    },
    topicTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    topicDesc: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    topicCount: {
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    topicHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicHeaderIcon: {
        fontSize: 36,
        marginRight: spacing.md,
    },
    section: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.md,
        paddingLeft: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    exerciseCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        ...shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    cardTitle: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
        marginRight: spacing.sm,
    },
    difficultyBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    difficultyText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
    },
    cardProblem: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepsCount: {
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    chevron: {
        fontSize: fontSize.md,
    },
    bottomPadding: {
        height: 100,
    },
    backButton: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    backButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    exerciseHeader: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    exerciseTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    exerciseIcon: {
        fontSize: 36,
        marginRight: spacing.md,
    },
    exerciseTitleContainer: {
        flex: 1,
    },
    exerciseCategory: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    exerciseTitle: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    problemBox: {
        backgroundColor: colors.infoLight,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
    },
    problemLabel: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    problemText: {
        fontSize: fontSize.lg,
        color: colors.textPrimary,
        lineHeight: 26,
    },
    controls: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    controlButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        flex: 1,
        alignItems: 'center',
    },
    controlButtonSecondary: {
        backgroundColor: colors.surfaceAlt,
    },
    controlButtonText: {
        color: colors.textWhite,
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    controlButtonTextSecondary: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    stepsContainer: {
        paddingHorizontal: spacing.xl,
    },
    finalAnswer: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.successLight,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.success,
        marginBottom: spacing.lg,
    },
    finalAnswerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    finalAnswerIcon: {
        fontSize: 20,
        color: colors.success,
        marginRight: spacing.sm,
    },
    finalAnswerLabel: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.success,
    },
    finalAnswerText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    tipsBox: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.warningLight,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    tipsHeader: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    tipItem: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    tipBullet: {
        color: colors.warning,
        marginRight: spacing.sm,
        fontSize: fontSize.md,
    },
    tipText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default ExercisesScreen;
