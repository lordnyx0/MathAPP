// Function Lab Screen - Learn about domain, image, and codomain
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';
import { logError, createAsyncCleanup } from '../utils';
import { showToast } from '../components/Toast';
import { playCorrect, playIncorrect, initAudio } from '../utils/sounds';
import MathText from '../components/MathText';
import FunctionGraph from '../components/FunctionGraph';
import DomainBuilder from '../components/DomainBuilder';
import BackButton from '../components/BackButton';
import {
    MathFunction,
    FunctionQuestion,
    QuestionType,
    getRandomFunction,
    generateQuestion,
    getExplanation,
    FUNCTION_LAB_STATS_KEY,
} from '../data/functionQuestions';

// ============================================================
// TYPES
// ============================================================

type GameMode = 'menu' | 'identify' | 'match' | 'classifier' | 'buildDomain';

interface FunctionLabScreenProps {
    onBack?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

const FunctionLabScreen: React.FC<FunctionLabScreenProps> = ({ onBack }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // State
    const [mode, setMode] = useState<GameMode>('menu');
    const [currentQuestion, setCurrentQuestion] = useState<FunctionQuestion | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [questionTypeIndex, setQuestionTypeIndex] = useState(0);
    // Classifier mode state
    const [classifierFunction, setClassifierFunction] = useState<MathFunction | null>(null);
    const [injectiveAnswer, setInjectiveAnswer] = useState<boolean | null>(null);
    const [surjectiveAnswer, setSurjectiveAnswer] = useState<boolean | null>(null);
    const [classifierShowResult, setClassifierShowResult] = useState(false);
    // Build Domain mode state
    const [buildDomainFunction, setBuildDomainFunction] = useState<MathFunction | null>(null);
    const [builtDomainString, setBuiltDomainString] = useState<string>('ℝ');
    const [buildDomainShowResult, setBuildDomainShowResult] = useState(false);
    const [domainBuilderKey, setDomainBuilderKey] = useState(0); // For resetting DomainBuilder

    const questionTypes: QuestionType[] = ['domain', 'image', 'codomain'];

    // Load high score on mount
    useEffect(() => {
        const { isMounted, cleanup } = createAsyncCleanup();

        const loadData = async () => {
            try {
                const saved = await AsyncStorage.getItem(FUNCTION_LAB_STATS_KEY);
                if (isMounted() && saved) {
                    const stats = JSON.parse(saved);
                    setHighScore(stats.highScore || 0);
                }
            } catch (error) {
                logError('FunctionLabScreen.loadStats', error);
            }
        };

        loadData();
        initAudio();
        return cleanup;
    }, []);

    // Save high score
    const saveHighScore = async (newScore: number) => {
        if (newScore > highScore) {
            setHighScore(newScore);
            showToast('🏆 Novo recorde! ' + newScore + ' pontos', 'success');
            try {
                await AsyncStorage.setItem(
                    FUNCTION_LAB_STATS_KEY,
                    JSON.stringify({ highScore: newScore })
                );
            } catch (error) {
                logError('FunctionLabScreen.saveHighScore', error);
            }
        }
    };

    // Start game mode
    const startGame = (gameMode: GameMode) => {
        setMode(gameMode);
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        setQuestionTypeIndex(0);
        if (gameMode === 'classifier') {
            nextClassifierQuestion();
        } else if (gameMode === 'buildDomain') {
            nextBuildDomainQuestion();
        } else {
            nextQuestion(gameMode, 0);
        }
    };

    // Next classifier question
    const nextClassifierQuestion = () => {
        const fn = getRandomFunction();
        setClassifierFunction(fn);
        setInjectiveAnswer(null);
        setSurjectiveAnswer(null);
        setClassifierShowResult(false);
    };

    // Check classifier answer
    const checkClassifierAnswer = () => {
        if (!classifierFunction || classifierShowResult) return;
        if (injectiveAnswer === null || surjectiveAnswer === null) {
            showToast('Selecione uma opção para cada propriedade', 'warning');
            return;
        }

        setClassifierShowResult(true);

        const correctInjective = injectiveAnswer === classifierFunction.isInjective;
        const correctSurjective = surjectiveAnswer === classifierFunction.isSurjective;
        const isFullyCorrect = correctInjective && correctSurjective;

        if (isFullyCorrect) {
            const points = 15 + streak * 3;
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            playCorrect();
        } else {
            setStreak(0);
            playIncorrect();
        }
        setQuestionsAnswered(prev => prev + 1);
    };

    // Next build domain question
    const nextBuildDomainQuestion = () => {
        const fn = getRandomFunction(undefined, true); // buildableOnly = true
        setBuildDomainFunction(fn);
        setBuiltDomainString('ℝ');
        setBuildDomainShowResult(false);
        setDomainBuilderKey(prev => prev + 1); // Force DomainBuilder to reset
    };

    // Check build domain answer
    const checkBuildDomainAnswer = () => {
        if (!buildDomainFunction || buildDomainShowResult) return;

        setBuildDomainShowResult(true);

        // Robust domain comparison with normalization
        const normalizeDomain = (s: string): string => {
            return s
                .replace(/\s+/g, '')        // Remove spaces
                .replace(/R/g, 'ℝ')          // R -> ℝ
                .replace(/inf/gi, '∞')       // inf -> ∞
                .replace(/\+-∞/g, '+∞')     // Fix +- to +
                .replace(/-\+∞/g, '-∞')     // Fix -+ to -
                .toLowerCase();
        };
        const isCorrect = normalizeDomain(builtDomainString) === normalizeDomain(buildDomainFunction.domain);

        if (isCorrect) {
            const points = 20 + streak * 5; // Higher points for construction
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            playCorrect();
        } else {
            setStreak(0);
            playIncorrect();
        }
        setQuestionsAnswered(prev => prev + 1);
    };

    // Next question
    const nextQuestion = (gameMode: GameMode = mode, typeIdx: number = questionTypeIndex) => {
        const fn = getRandomFunction();
        let questionType: QuestionType;

        if (gameMode === 'match') {
            questionType = 'match';
        } else {
            // Cycle through domain, image, codomain
            questionType = questionTypes[typeIdx % 3];
            setQuestionTypeIndex(typeIdx + 1);
        }

        const question = generateQuestion(fn, questionType);
        const allOptions = [question.correctAnswer, ...question.wrongAnswers]
            .sort(() => Math.random() - 0.5);

        setCurrentQuestion(question);
        setOptions(allOptions);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    // Check answer
    const checkAnswer = (answer: string) => {
        if (!currentQuestion || showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentQuestion.correctAnswer;

        if (isCorrect) {
            const points = 10 + streak * 2;
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            playCorrect();
        } else {
            setStreak(0);
            playIncorrect();
        }
        setQuestionsAnswered(prev => prev + 1);
    };

    // End game
    const endGame = () => {
        saveHighScore(score);
        setMode('menu');
    };

    // Get option style
    const getOptionStyle = (option: string) => {
        if (!showResult) {
            return { borderColor: colors.border };
        }
        if (option === currentQuestion?.correctAnswer) {
            return { borderColor: colors.success, backgroundColor: colors.successLight };
        }
        if (option === selectedAnswer && option !== currentQuestion?.correctAnswer) {
            return { borderColor: colors.error, backgroundColor: colors.errorLight };
        }
        return { borderColor: colors.border };
    };

    // Get question type label
    const getQuestionTypeLabel = (type: QuestionType): string => {
        switch (type) {
            case 'domain': return '📍 Domínio';
            case 'image': return '🎯 Imagem';
            case 'codomain': return '📐 Contradomínio';
            case 'match': return '🔗 Combinação';
            default: return '';
        }
    };

    // ============================================================
    // MENU SCREEN
    // ============================================================

    if (mode === 'menu') {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Back Button */}
                        {onBack && <BackButton onPress={onBack} />}

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerIcon}>🔬</Text>
                            <Text style={styles.headerTitle}>Laboratório de Funções</Text>
                            <Text style={styles.headerSubtitle}>
                                Domine domínio, imagem e contradomínio
                            </Text>
                        </View>

                        {/* High Score */}
                        {highScore > 0 && (
                            <View style={styles.highScoreBox}>
                                <Text style={styles.highScoreLabel}>🏆 Recorde</Text>
                                <Text style={styles.highScoreValue}>{highScore} pontos</Text>
                            </View>
                        )}

                        {/* Game Modes */}
                        <View style={styles.modesContainer}>
                            <TouchableOpacity
                                style={[styles.modeCard, { borderLeftColor: '#10B981' }]}
                                onPress={() => startGame('identify')}
                            >
                                <View style={[styles.modeIconWrapper, { backgroundColor: '#10B98120' }]}>
                                    <Text style={styles.modeIcon}>🎯</Text>
                                </View>
                                <View style={styles.modeInfo}>
                                    <Text style={styles.modeName}>Identificar Partes</Text>
                                    <Text style={styles.modeDescription}>
                                        Determine domínio, imagem e contradomínio
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modeCard, { borderLeftColor: '#8B5CF6' }]}
                                onPress={() => startGame('match')}
                            >
                                <View style={[styles.modeIconWrapper, { backgroundColor: '#8B5CF620' }]}>
                                    <Text style={styles.modeIcon}>🔗</Text>
                                </View>
                                <View style={styles.modeInfo}>
                                    <Text style={styles.modeName}>Encontrar Função</Text>
                                    <Text style={styles.modeDescription}>
                                        Dado domínio e imagem, encontre f(x)
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modeCard, { borderLeftColor: '#F59E0B' }]}
                                onPress={() => startGame('classifier')}
                            >
                                <View style={[styles.modeIconWrapper, { backgroundColor: '#F59E0B20' }]}>
                                    <Text style={styles.modeIcon}>🔍</Text>
                                </View>
                                <View style={styles.modeInfo}>
                                    <Text style={styles.modeName}>Classificador</Text>
                                    <Text style={styles.modeDescription}>
                                        Injetora, sobrejetora ou bijetora?
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modeCard, { borderLeftColor: '#EC4899' }]}
                                onPress={() => startGame('buildDomain')}
                            >
                                <View style={[styles.modeIconWrapper, { backgroundColor: '#EC489920' }]}>
                                    <Text style={styles.modeIcon}>🛠️</Text>
                                </View>
                                <View style={styles.modeInfo}>
                                    <Text style={styles.modeName}>Construir Domínio</Text>
                                    <Text style={styles.modeDescription}>
                                        Monte o domínio correto da função
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <Text style={styles.infoTitle}>💡 Dica</Text>
                            <Text style={styles.infoText}>
                                • <Text style={{ fontWeight: '600' }}>Domínio</Text>: valores de x permitidos{'\n'}
                                • <Text style={{ fontWeight: '600' }}>Imagem</Text>: valores de f(x) atingidos{'\n'}
                                • <Text style={{ fontWeight: '600' }}>Contradomínio</Text>: onde f(x) está definida
                            </Text>
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ============================================================
    // BUILD DOMAIN SCREEN
    // ============================================================

    if (mode === 'buildDomain') {
        if (!buildDomainFunction) return null;

        const bfn = buildDomainFunction;

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.gameContainer}>
                            {/* Stats Bar */}
                            <View style={styles.statsBar}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Pontos</Text>
                                    <Text style={styles.statValue}>{score}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Sequência</Text>
                                    <Text style={[styles.statValue, streak >= 3 && styles.streakHot]}>
                                        {streak >= 3 ? '🔥' : ''}{streak}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.endButton} onPress={endGame}>
                                    <Text style={styles.endButtonText}>Encerrar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Function Card */}
                            <View style={styles.functionCard}>
                                <View style={[styles.typeBadge, { backgroundColor: '#EC489920' }]}>
                                    <Text style={[styles.typeBadgeText, { color: '#EC4899' }]}>
                                        🛠️ Construir Domínio
                                    </Text>
                                </View>

                                <Text style={styles.functionLabel}>f(x) =</Text>
                                <MathText style={styles.functionExpression}>
                                    {bfn.expression}
                                </MathText>

                                {/* Graph */}
                                <View style={styles.graphContainer}>
                                    <FunctionGraph
                                        points={bfn.graphPoints}
                                        domainRange={bfn.graphDomain}
                                        imageRange={bfn.graphRange}
                                        width={260}
                                        height={160}
                                        highlightDomain={buildDomainShowResult}
                                    />
                                </View>

                                {/* Restrictions hint */}
                                {bfn.restrictions.length > 0 && (
                                    <View style={styles.restrictionHint}>
                                        <Text style={styles.restrictionHintText}>
                                            💡 Restrições: {bfn.restrictions.join(', ')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Domain Builder */}
                            <DomainBuilder
                                key={domainBuilderKey}
                                onDomainChange={(domainStr) => setBuiltDomainString(domainStr)}
                                correctDomain={bfn.domain}
                                showResult={buildDomainShowResult}
                                disabled={buildDomainShowResult}
                            />

                            {/* Check/Next Button */}
                            {!buildDomainShowResult ? (
                                <TouchableOpacity
                                    style={styles.nextButton}
                                    onPress={checkBuildDomainAnswer}
                                >
                                    <Text style={styles.nextButtonText}>Verificar</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.resultContainer}>
                                    <Text style={styles.resultExplanation}>
                                        {bfn.domainExplanation}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.nextButton}
                                        onPress={nextBuildDomainQuestion}
                                    >
                                        <Text style={styles.nextButtonText}>Próxima →</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.bottomPadding} />
                        </View>
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ============================================================
    // CLASSIFIER SCREEN
    // ============================================================

    if (mode === 'classifier') {
        if (!classifierFunction) return null;

        const cfn = classifierFunction;
        const isBijective = cfn.isInjective && cfn.isSurjective;

        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.gameContainer}>
                            {/* Stats Bar */}
                            <View style={styles.statsBar}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Pontos</Text>
                                    <Text style={styles.statValue}>{score}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Sequência</Text>
                                    <Text style={[styles.statValue, streak >= 3 && styles.streakHot]}>
                                        {streak >= 3 ? '🔥' : ''}{streak}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.endButton} onPress={endGame}>
                                    <Text style={styles.endButtonText}>Encerrar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Function Card */}
                            <View style={styles.functionCard}>
                                <View style={[styles.typeBadge, { backgroundColor: '#F59E0B20' }]}>
                                    <Text style={[styles.typeBadgeText, { color: '#F59E0B' }]}>
                                        🔍 Classificador
                                    </Text>
                                </View>

                                <Text style={styles.functionLabel}>f(x) =</Text>
                                <MathText style={styles.functionExpression}>
                                    {cfn.expression}
                                </MathText>

                                {/* Graph */}
                                <View style={styles.graphContainer}>
                                    <FunctionGraph
                                        points={cfn.graphPoints}
                                        domainRange={cfn.graphDomain}
                                        imageRange={cfn.graphRange}
                                        width={260}
                                        height={180}
                                    />
                                </View>

                                <Text style={styles.questionText}>
                                    Classifique esta função:
                                </Text>
                            </View>

                            {/* Injective Toggle */}
                            <View style={styles.classifierSection}>
                                <Text style={styles.classifierLabel}>É Injetora?</Text>
                                <Text style={styles.classifierHint}>
                                    (x₁ ≠ x₂ → f(x₁) ≠ f(x₂))
                                </Text>
                                <View style={styles.toggleRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            injectiveAnswer === true && styles.toggleButtonSelected,
                                            classifierShowResult && cfn.isInjective && styles.toggleButtonCorrect,
                                            classifierShowResult && injectiveAnswer === true && !cfn.isInjective && styles.toggleButtonWrong,
                                        ]}
                                        onPress={() => !classifierShowResult && setInjectiveAnswer(true)}
                                        disabled={classifierShowResult}
                                    >
                                        <Text style={[
                                            styles.toggleButtonText,
                                            injectiveAnswer === true && styles.toggleButtonTextSelected,
                                        ]}>
                                            ✓ Sim
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            injectiveAnswer === false && styles.toggleButtonSelected,
                                            classifierShowResult && !cfn.isInjective && styles.toggleButtonCorrect,
                                            classifierShowResult && injectiveAnswer === false && cfn.isInjective && styles.toggleButtonWrong,
                                        ]}
                                        onPress={() => !classifierShowResult && setInjectiveAnswer(false)}
                                        disabled={classifierShowResult}
                                    >
                                        <Text style={[
                                            styles.toggleButtonText,
                                            injectiveAnswer === false && styles.toggleButtonTextSelected,
                                        ]}>
                                            ✗ Não
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Surjective Toggle */}
                            <View style={styles.classifierSection}>
                                <Text style={styles.classifierLabel}>É Sobrejetora?</Text>
                                <Text style={styles.classifierHint}>
                                    (Im(f) = Contradomínio)
                                </Text>
                                <View style={styles.toggleRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            surjectiveAnswer === true && styles.toggleButtonSelected,
                                            classifierShowResult && cfn.isSurjective && styles.toggleButtonCorrect,
                                            classifierShowResult && surjectiveAnswer === true && !cfn.isSurjective && styles.toggleButtonWrong,
                                        ]}
                                        onPress={() => !classifierShowResult && setSurjectiveAnswer(true)}
                                        disabled={classifierShowResult}
                                    >
                                        <Text style={[
                                            styles.toggleButtonText,
                                            surjectiveAnswer === true && styles.toggleButtonTextSelected,
                                        ]}>
                                            ✓ Sim
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            surjectiveAnswer === false && styles.toggleButtonSelected,
                                            classifierShowResult && !cfn.isSurjective && styles.toggleButtonCorrect,
                                            classifierShowResult && surjectiveAnswer === false && cfn.isSurjective && styles.toggleButtonWrong,
                                        ]}
                                        onPress={() => !classifierShowResult && setSurjectiveAnswer(false)}
                                        disabled={classifierShowResult}
                                    >
                                        <Text style={[
                                            styles.toggleButtonText,
                                            surjectiveAnswer === false && styles.toggleButtonTextSelected,
                                        ]}>
                                            ✗ Não
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Check/Next Button */}
                            {!classifierShowResult ? (
                                <TouchableOpacity
                                    style={[
                                        styles.nextButton,
                                        { opacity: injectiveAnswer !== null && surjectiveAnswer !== null ? 1 : 0.5 }
                                    ]}
                                    onPress={checkClassifierAnswer}
                                >
                                    <Text style={styles.nextButtonText}>Verificar</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.resultContainer}>
                                    <View style={[
                                        styles.resultBox,
                                        {
                                            backgroundColor:
                                                injectiveAnswer === cfn.isInjective && surjectiveAnswer === cfn.isSurjective
                                                    ? colors.successLight
                                                    : colors.errorLight
                                        }
                                    ]}>
                                        <Text style={styles.resultIcon}>
                                            {injectiveAnswer === cfn.isInjective && surjectiveAnswer === cfn.isSurjective
                                                ? '✓ Correto!'
                                                : '✗ Incorreto'}
                                        </Text>
                                        <Text style={styles.resultExplanation}>
                                            {cfn.displayName}: {cfn.isInjective ? 'Injetora' : 'Não injetora'}
                                            {' • '}
                                            {cfn.isSurjective ? 'Sobrejetora' : 'Não sobrejetora'}
                                            {isBijective && ' • Bijetora! ✨'}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.nextButton}
                                        onPress={nextClassifierQuestion}
                                    >
                                        <Text style={styles.nextButtonText}>Próxima →</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.bottomPadding} />
                        </View>
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ============================================================
    // GAME SCREEN (identify/match modes)
    // ============================================================

    if (!currentQuestion) return null;

    const fn = currentQuestion.function;

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.gameContainer}>
                        {/* Stats Bar */}
                        <View style={styles.statsBar}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Pontos</Text>
                                <Text style={styles.statValue}>{score}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Sequência</Text>
                                <Text style={[styles.statValue, streak >= 3 && styles.streakHot]}>
                                    {streak >= 3 ? '🔥' : ''}{streak}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.endButton} onPress={endGame}>
                                <Text style={styles.endButtonText}>Encerrar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Function Card */}
                        <View style={styles.functionCard}>
                            {/* Question Type Badge */}
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeBadgeText}>
                                    {getQuestionTypeLabel(currentQuestion.type)}
                                </Text>
                            </View>

                            {/* Function Expression */}
                            <Text style={styles.functionLabel}>f(x) =</Text>
                            <MathText style={styles.functionExpression}>
                                {fn.expression}
                            </MathText>

                            {/* Graph */}
                            <View style={styles.graphContainer}>
                                <FunctionGraph
                                    points={fn.graphPoints}
                                    domainRange={fn.graphDomain}
                                    imageRange={fn.graphRange}
                                    width={260}
                                    height={180}
                                    highlightDomain={currentQuestion.type === 'domain' || showResult}
                                    highlightImage={currentQuestion.type === 'image' || showResult}
                                />
                            </View>

                            {/* Question */}
                            <Text style={styles.questionText}>{currentQuestion.question}</Text>
                        </View>

                        {/* Options */}
                        <View style={styles.optionsContainer}>
                            {options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.optionButton, getOptionStyle(option)]}
                                    onPress={() => checkAnswer(option)}
                                    disabled={showResult}
                                >
                                    <MathText style={styles.optionText}>{option}</MathText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Result */}
                        {showResult && (
                            <View style={styles.resultContainer}>
                                <View style={[
                                    styles.resultBox,
                                    {
                                        backgroundColor: selectedAnswer === currentQuestion.correctAnswer
                                            ? colors.successLight
                                            : colors.errorLight
                                    }
                                ]}>
                                    <Text style={styles.resultIcon}>
                                        {selectedAnswer === currentQuestion.correctAnswer
                                            ? '✓ Correto!'
                                            : '✗ Incorreto'}
                                    </Text>
                                    <Text style={styles.resultExplanation}>
                                        {getExplanation(currentQuestion)}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.nextButton}
                                    onPress={() => nextQuestion()}
                                >
                                    <Text style={styles.nextButtonText}>Próxima →</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.bottomPadding} />
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

// ============================================================
// STYLES
// ============================================================

const createStyles = (colors: import('../contexts/ThemeContext').ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        gradient: {
            flex: 1,
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
        header: {
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
        },
        headerIcon: {
            fontSize: 48,
            marginBottom: spacing.sm,
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
            textAlign: 'center',
        },
        highScoreBox: {
            marginHorizontal: spacing.xl,
            backgroundColor: colors.warningLight,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        highScoreLabel: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        highScoreValue: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.warning,
        },
        modesContainer: {
            paddingHorizontal: spacing.xl,
            gap: spacing.md,
        },
        modeCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            borderLeftWidth: 4,
            ...shadows.md,
        },
        modeIconWrapper: {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
        },
        modeIcon: {
            fontSize: 28,
        },
        modeInfo: {
            flex: 1,
        },
        modeName: {
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        modeDescription: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        infoBox: {
            marginHorizontal: spacing.xl,
            marginTop: spacing.xl,
            backgroundColor: colors.surfaceAlt,
            borderRadius: borderRadius.md,
            padding: spacing.lg,
        },
        infoTitle: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing.sm,
        },
        infoText: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        bottomPadding: {
            height: 100,
        },
        // Game screen
        gameContainer: {
            padding: spacing.lg,
        },
        statsBar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        statItem: {
            flex: 1,
        },
        statLabel: {
            fontSize: fontSize.xs,
            color: colors.textTertiary,
        },
        statValue: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        streakHot: {
            color: colors.error,
        },
        endButton: {
            backgroundColor: colors.surfaceAlt,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
        },
        endButtonText: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        functionCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
            ...shadows.md,
        },
        typeBadge: {
            backgroundColor: colors.primaryLight,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
            marginBottom: spacing.md,
        },
        typeBadgeText: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.primary,
        },
        functionLabel: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        functionExpression: {
            fontSize: 32,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing.md,
        },
        graphContainer: {
            marginVertical: spacing.md,
            backgroundColor: colors.surfaceAlt,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
        },
        questionText: {
            fontSize: fontSize.md,
            color: colors.textPrimary,
            textAlign: 'center',
            fontWeight: '600',
            marginTop: spacing.md,
        },
        optionsContainer: {
            gap: spacing.sm,
        },
        optionButton: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderWidth: 2,
            alignItems: 'center',
            ...shadows.sm,
        },
        optionText: {
            fontSize: fontSize.lg,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        resultContainer: {
            marginTop: spacing.lg,
        },
        resultBox: {
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        resultIcon: {
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        resultExplanation: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        nextButton: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            alignItems: 'center',
        },
        nextButtonText: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: colors.textWhite,
        },
        // Classifier mode styles
        classifierSection: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            ...shadows.sm,
        },
        classifierLabel: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: spacing.xs,
        },
        classifierHint: {
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            textAlign: 'center',
            marginBottom: spacing.md,
            fontStyle: 'italic',
        },
        toggleRow: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        toggleButton: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
        },
        toggleButtonSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
        },
        toggleButtonCorrect: {
            borderColor: colors.success,
            backgroundColor: colors.successLight,
        },
        toggleButtonWrong: {
            borderColor: colors.error,
            backgroundColor: colors.errorLight,
        },
        toggleButtonText: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        toggleButtonTextSelected: {
            color: colors.primary,
        },
        // Build Domain mode styles
        restrictionHint: {
            backgroundColor: colors.warningLight,
            borderRadius: borderRadius.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginTop: spacing.sm,
        },
        restrictionHintText: {
            fontSize: fontSize.sm,
            color: colors.warning,
            fontWeight: '600',
            textAlign: 'center',
        },
    });

export default FunctionLabScreen;
