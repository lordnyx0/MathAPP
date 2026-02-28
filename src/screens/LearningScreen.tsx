import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import {
    learningMainCategories,
    learningTopics,
    getLessonsForTopic,
} from '../data/lessons';
import { safeJsonParse, logError, migrateLearningProgress, createAsyncCleanup } from '../utils';
import { compareAnswers } from '../utils/answerValidator';
import { STORAGE_KEYS, DEFAULT_COMPLETED_LESSONS, CompletedLessons } from '../constants';
import { showToast } from '../components/Toast';
import { CardSkeleton } from '../components/Skeleton';
import MathText from '../components/MathText';
import BackButton from '../components/BackButton';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import strings from '../i18n/strings';

const LearningScreen = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [completedLessons, setCompletedLessons] = useState<CompletedLessons>(DEFAULT_COMPLETED_LESSONS);
    const [showQuestions, setShowQuestions] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [unlockAll, setUnlockAll] = useState(false);

    useEffect(() => {
        const { isMounted, cleanup } = createAsyncCleanup();

        const loadData = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
                if (isMounted()) {
                    const parsed = safeJsonParse(saved, null);
                    const migrated = migrateLearningProgress(parsed);
                    setCompletedLessons(migrated);
                    setIsLoading(false);
                }
            } catch (error) {
                logError('LearningScreen.loadProgress', error);
                if (isMounted()) {
                    setCompletedLessons({ ...DEFAULT_COMPLETED_LESSONS });
                    setIsLoading(false);
                }
            }
        };

        loadData();
        return cleanup;
    }, []);

    const saveProgress = async (newProgress: CompletedLessons) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, JSON.stringify(newProgress));
        } catch (error) {
            logError('LearningScreen.saveProgress', error);
            showToast(strings.errors.saveFailedMessage, 'error');
        }
    };

    // Calculate totals dynamically from learningTopics
    const getTotalLessons = () => learningTopics.reduce((acc, t) => acc + t.lessonCount, 0);
    const getCompletedTotal = () => Object.values(completedLessons).reduce((acc, arr) => acc + (arr?.length || 0), 0);

    const lessons = getLessonsForTopic(selectedTopic || 'logaritmos');
    const currentLesson = lessons[currentLessonIndex];
    const topicKey = selectedTopic || 'logaritmos';

    const markComplete = () => {
        if (!completedLessons[topicKey]?.includes(currentLessonIndex)) {
            const newProgress = {
                ...completedLessons,
                [topicKey]: [...(completedLessons[topicKey] || []), currentLessonIndex]
            };
            setCompletedLessons(newProgress);
            saveProgress(newProgress);
        }
    };

    const isLessonUnlocked = (index: number): boolean => {
        if (unlockAll) return true;
        if (index === 0) return true;
        return completedLessons[topicKey]?.includes(index - 1) ?? false;
    };

    const checkAnswer = () => {
        const correct = currentLesson.questions[currentQuestionIndex].a;
        const result = compareAnswers(userAnswer, correct);
        setIsCorrect(result);
        setShowFeedback(true);

        // Play sound feedback
        if (result) {
            playCorrect();
        } else {
            playIncorrect();
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < currentLesson.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer('');
            setShowFeedback(false);
        } else {
            markComplete();
            setShowQuestions(false);
            setCurrentQuestionIndex(0);
            setUserAnswer('');
            setShowFeedback(false);
        }
    };

    const getLevelColor = (level: string): string => {
        switch (level) {
            case 'Básico': return colors.basico;
            case 'Intermediário': return colors.intermediario;
            case 'Avançado': return colors.avancado;
            default: return colors.primary;
        }
    };

    const getAccentColor = () => {
        switch (selectedTopic) {
            case 'logaritmos': return '#6366F1';
            case 'trigonometria': return '#818CF8';
            case 'elementar': return '#A78BFA';
            case 'limites': return '#EC4899';
            case 'derivadas': return '#F472B6';
            default: return colors.primary;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{strings.learning.title}</Text>
                    </View>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Main Category Selection
    if (!selectedMainCategory) {
        const totalLessons = getTotalLessons();
        const completedTotal = getCompletedTotal();

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>{strings.learning.title}</Text>
                            <Text style={styles.headerSubtitle}>{strings.learning.subtitle}</Text>
                        </View>

                        {/* Main Progress Card */}
                        <View style={styles.mainProgressCard}>
                            <View style={styles.mainProgressHeader}>
                                <Ionicons name="trending-up" size={18} color={colors.primary} />
                                <Text style={styles.mainProgressTitle}>{strings.overallProgress}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, {
                                    width: `${totalLessons > 0 ? (completedTotal / totalLessons) * 100 : 0}%`,
                                    backgroundColor: '#10B981'
                                }]} />
                            </View>
                            <Text style={styles.mainProgressText}>
                                {completedTotal}/{totalLessons} lições completas
                            </Text>
                        </View>

                        {/* Unlock All Toggle */}
                        <TouchableOpacity
                            style={[styles.unlockAllButton, unlockAll && styles.unlockAllButtonActive]}
                            onPress={() => setUnlockAll(!unlockAll)}
                            accessibilityLabel={unlockAll ? 'Desativar modo livre' : 'Ativar modo livre'}
                            accessibilityRole="switch"
                        >
                            <Text style={styles.unlockAllIcon}>{unlockAll ? '🔓' : '🔒'}</Text>
                            <View style={styles.unlockAllInfo}>
                                <Text style={[styles.unlockAllTitle, unlockAll && styles.unlockAllTitleActive]}>
                                    {unlockAll ? 'Modo Livre Ativo' : 'Modo Progressivo'}
                                </Text>
                                <Text style={styles.unlockAllDesc}>
                                    {unlockAll ? 'Todas as lições desbloqueadas' : 'Complete as lições em ordem'}
                                </Text>
                            </View>
                            <View style={[styles.toggleTrack, unlockAll && styles.toggleTrackActive]}>
                                <View style={[styles.toggleThumb, unlockAll && styles.toggleThumbActive]} />
                            </View>
                        </TouchableOpacity>

                        {learningMainCategories.map(cat => {
                            const catTopics = learningTopics.filter(t => t.mainCategory === cat.id);
                            const catTotalLessons = catTopics.reduce((acc, t) => acc + t.lessonCount, 0);
                            const catCompleted = catTopics.reduce((acc, t) => acc + (completedLessons[t.id]?.length || 0), 0);

                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.topicCard, { borderColor: cat.color }]}
                                    onPress={() => setSelectedMainCategory(cat.id)}
                                    accessibilityLabel={`Selecionar ${cat.title}`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.topicIcon}>{cat.icon}</Text>
                                    <View style={styles.topicInfo}>
                                        <Text style={styles.topicTitle}>{cat.title}</Text>
                                        <Text style={styles.topicDesc}>
                                            {catTopics.length} módulos • {catTotalLessons} lições
                                        </Text>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, {
                                                width: `${catTotalLessons > 0 ? (catCompleted / catTotalLessons) * 100 : 0}%`,
                                                backgroundColor: cat.color
                                            }]} />
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={cat.color} />
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Topic Selection
    if (!selectedTopic) {
        const mainCat = learningMainCategories.find(c => c.id === selectedMainCategory);
        const catTopics = learningTopics.filter(t => t.mainCategory === selectedMainCategory);

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <BackButton onPress={() => setSelectedMainCategory(null)} />

                        <View style={styles.header}>
                            <View style={styles.topicHeaderRow}>
                                <Text style={styles.topicHeaderIcon}>{mainCat?.icon}</Text>
                                <View>
                                    <Text style={styles.headerTitle}>{mainCat?.title}</Text>
                                    <Text style={styles.headerSubtitle}>{catTopics.length} módulos</Text>
                                </View>
                            </View>
                        </View>

                        {catTopics.map(topic => {
                            const completed = completedLessons[topic.id]?.length || 0;
                            return (
                                <TouchableOpacity
                                    key={topic.id}
                                    style={[styles.topicCard, { borderColor: topic.color }]}
                                    onPress={() => setSelectedTopic(topic.id)}
                                    accessibilityLabel={`Selecionar ${topic.title}`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                                    <View style={styles.topicInfo}>
                                        <Text style={styles.topicTitle}>{topic.title}</Text>
                                        <Text style={[styles.topicCount, { color: topic.color }]}>
                                            {completed}/{topic.lessonCount} lições
                                        </Text>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, {
                                                width: `${topic.lessonCount > 0 ? (completed / topic.lessonCount) * 100 : 0}%`,
                                                backgroundColor: topic.color
                                            }]} />
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={topic.color} />
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Question View
    if (showQuestions && currentLesson) {
        const question = currentLesson.questions[currentQuestionIndex];
        const accentColor = getAccentColor();

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <BackButton
                            onPress={() => {
                                setShowQuestions(false);
                                setCurrentQuestionIndex(0);
                                setUserAnswer('');
                                setShowFeedback(false);
                            }}
                        />

                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>{currentLesson.title}</Text>
                            <Text style={styles.headerSubtitle}>
                                Questão {currentQuestionIndex + 1} de {currentLesson.questions.length}
                            </Text>
                        </View>

                        <View style={styles.questionCard}>
                            <MathText style={styles.questionText}>{question.q}</MathText>

                            <TextInput
                                style={[styles.answerInput, { borderColor: showFeedback ? (isCorrect ? colors.success : colors.error) : colors.border }]}
                                value={userAnswer}
                                onChangeText={setUserAnswer}
                                placeholder="Digite sua resposta"
                                placeholderTextColor={colors.textTertiary}
                                editable={!showFeedback}
                                accessibilityLabel={strings.a11y.answerInput}
                            />

                            {question.hint && !showFeedback && (
                                <MathText style={styles.hintText}>💡 Dica: {question.hint}</MathText>
                            )}

                            {showFeedback ? (
                                <View style={[styles.feedbackBox, { backgroundColor: isCorrect ? colors.successLight : colors.errorLight }]}>
                                    <Text style={styles.feedbackIcon}>
                                        {isCorrect ? strings.correct : strings.incorrect}
                                    </Text>
                                    {!isCorrect && (
                                        <MathText style={styles.correctAnswer}>Resposta: {question.a}</MathText>
                                    )}
                                    <TouchableOpacity
                                        style={[styles.submitBtn, { backgroundColor: accentColor }]}
                                        onPress={nextQuestion}
                                        accessibilityLabel={strings.a11y.nextButton}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.submitBtnText}>
                                            {currentQuestionIndex < currentLesson.questions.length - 1 ? strings.next : 'Concluir'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: accentColor }]}
                                    onPress={checkAnswer}
                                    disabled={!userAnswer.trim()}
                                    accessibilityLabel={strings.a11y.checkAnswer}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.submitBtnText}>Verificar</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // Lesson View
    if (currentLesson) {
        const accentColor = getAccentColor();
        const topic = learningTopics.find(t => t.id === selectedTopic);

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <BackButton
                            onPress={() => {
                                setSelectedTopic(null);
                                setCurrentLessonIndex(0);
                            }}
                        />

                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>{topic?.icon} {topic?.title}</Text>
                            <Text style={styles.headerSubtitle}>
                                {completedLessons[topicKey]?.length || 0}/{lessons.length} concluídas
                            </Text>
                        </View>

                        {/* Lesson List */}
                        {lessons.map((lesson, index) => {
                            const isUnlocked = isLessonUnlocked(index);
                            const isCompleted = completedLessons[topicKey]?.includes(index);
                            const isActive = index === currentLessonIndex;

                            return (
                                <TouchableOpacity
                                    key={lesson.id}
                                    style={[
                                        styles.lessonCard,
                                        isActive && { borderColor: accentColor, borderWidth: 2 },
                                        !isUnlocked && styles.lockedCard
                                    ]}
                                    onPress={() => isUnlocked && setCurrentLessonIndex(index)}
                                    disabled={!isUnlocked}
                                    accessibilityLabel={`${lesson.title}${isCompleted ? ', concluída' : ''}${!isUnlocked ? ', bloqueada' : ''}`}
                                    accessibilityRole="button"
                                >
                                    <View style={[styles.lessonIcon, { backgroundColor: isCompleted ? colors.success : (isUnlocked ? accentColor : colors.textTertiary) }]}>
                                        <Text style={styles.lessonIconText}>
                                            {isCompleted ? '✓' : (isUnlocked ? index + 1 : '🔒')}
                                        </Text>
                                    </View>
                                    <View style={styles.lessonInfo}>
                                        <Text style={[styles.lessonTitle, !isUnlocked && styles.lockedText]}>{lesson.title}</Text>
                                        <Text style={[styles.lessonLevel, { color: getLevelColor(lesson.level) }]}>{lesson.level}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Current Lesson Content */}
                        <View style={[styles.contentCard, { borderColor: accentColor }]}>
                            <Text style={styles.contentTitle}>{currentLesson.title}</Text>
                            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(currentLesson.level) + '20' }]}>
                                <Text style={[styles.levelText, { color: getLevelColor(currentLesson.level) }]}>{currentLesson.level}</Text>
                            </View>
                            <MathText style={styles.contentText}>{currentLesson.content}</MathText>

                            {currentLesson.questions?.length > 0 && (
                                <TouchableOpacity
                                    style={[styles.practiceBtn, { backgroundColor: accentColor }]}
                                    onPress={() => setShowQuestions(true)}
                                    accessibilityLabel="Praticar com questões"
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.practiceBtnText}>
                                        📝 Praticar ({currentLesson.questions.length} questões)
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return null;
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
    backButton: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    backButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    mainProgressCard: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    mainProgressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    mainProgressTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    mainProgressText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    topicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderLeftWidth: 4,
        ...shadows.sm,
    },
    topicIcon: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    topicInfo: {
        flex: 1,
    },
    topicTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    topicDesc: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    topicCount: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    topicHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicHeaderIcon: {
        fontSize: 40,
        marginRight: spacing.md,
    },
    chevron: {
        fontSize: fontSize.lg,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.xl,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    lockedCard: {
        opacity: 0.6,
    },
    lessonIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    lessonIconText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textWhite,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    lessonLevel: {
        fontSize: fontSize.sm,
    },
    lockedText: {
        color: colors.textTertiary,
    },
    contentCard: {
        marginHorizontal: spacing.xl,
        marginTop: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderLeftWidth: 4,
        ...shadows.md,
    },
    contentTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    levelBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.md,
    },
    levelText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
    },
    contentText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    practiceBtn: {
        marginTop: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    practiceBtnText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textWhite,
    },
    questionCard: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    questionText: {
        fontSize: fontSize.lg,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
        lineHeight: 26,
    },
    answerInput: {
        borderWidth: 2,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        backgroundColor: colors.surfaceAlt,
        marginBottom: spacing.md,
    },
    hintText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        fontStyle: 'italic',
    },
    submitBtn: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    submitBtnText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.textWhite,
    },
    feedbackBox: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    feedbackIcon: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    correctAnswer: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    bottomPadding: {
        height: 100,
    },
    // Unlock All Toggle
    unlockAllButton: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        ...shadows.sm,
    },
    unlockAllButtonActive: {
        borderColor: colors.warning,
        backgroundColor: colors.warningLight,
    },
    unlockAllIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    unlockAllInfo: {
        flex: 1,
    },
    unlockAllTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    unlockAllTitleActive: {
        color: colors.warning,
    },
    unlockAllDesc: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    toggleTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.border,
        padding: 2,
    },
    toggleTrackActive: {
        backgroundColor: colors.warning,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.textWhite,
    },
    toggleThumbActive: {
        transform: [{ translateX: 20 }],
    },
});

export default LearningScreen;

