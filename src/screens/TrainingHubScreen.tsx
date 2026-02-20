// Training Hub Screen - Central hub for all training minigames
import React, { useMemo } from 'react';
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

// ============================================================
// TYPES
// ============================================================

type MinigameId = 'quadrants' | 'symbols' | 'functions' | 'derivatives';

interface Minigame {
    id: MinigameId;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface TrainingHubScreenProps {
    onSelectMinigame: (id: MinigameId) => void;
}

// ============================================================
// MINIGAME DATA
// ============================================================

const minigames: Minigame[] = [
    {
        id: 'quadrants',
        name: 'Treino de Quadrantes',
        description: 'Domine o círculo trigonométrico',
        icon: '🎯',
        color: '#10B981',
    },
    {
        id: 'symbols',
        name: 'Corrida dos Símbolos',
        description: 'Aprenda símbolos matemáticos',
        icon: '⚡',
        color: '#8B5CF6',
    },
    {
        id: 'functions',
        name: 'Laboratório de Funções',
        description: 'Domínio, imagem e contradomínio',
        icon: '🔬',
        color: '#F59E0B',
    },
    {
        id: 'derivatives',
        name: 'Derivadas Trainer',
        description: 'Pratique regras de derivação',
        icon: '📐',
        color: '#EF4444',
    },
];

// ============================================================
// COMPONENT
// ============================================================

const TrainingHubScreen: React.FC<TrainingHubScreenProps> = ({ onSelectMinigame }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>🏋️</Text>
                        <Text style={styles.headerTitle}>Área de Treino</Text>
                        <Text style={styles.headerSubtitle}>
                            Minigames para praticar conceitos matemáticos
                        </Text>
                    </View>

                    {/* Minigame Cards */}
                    <View style={styles.gameGrid}>
                        {minigames.map((game) => (
                            <TouchableOpacity
                                key={game.id}
                                style={[styles.gameCard, { borderTopColor: game.color }]}
                                onPress={() => onSelectMinigame(game.id)}
                                accessibilityLabel={`Jogar ${game.name}`}
                                accessibilityRole="button"
                            >
                                <View style={[styles.gameIconWrapper, { backgroundColor: game.color + '20' }]}>
                                    <Text style={styles.gameIcon}>{game.icon}</Text>
                                </View>
                                <Text style={styles.gameName}>{game.name}</Text>
                                <Text style={styles.gameDescription}>{game.description}</Text>
                                <View style={[styles.playButton, { backgroundColor: game.color }]}>
                                    <Text style={styles.playButtonText}>Jogar</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>



                    <View style={styles.bottomPadding} />
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
        scrollContent: {
            paddingBottom: spacing.xxl,
        },
        header: {
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xxl,
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
        gameGrid: {
            paddingHorizontal: spacing.lg,
            gap: spacing.md,
        },
        gameCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            alignItems: 'center',
            borderTopWidth: 4,
            ...shadows.md,
        },
        gameIconWrapper: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
        },
        gameIcon: {
            fontSize: 36,
        },
        gameName: {
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
            textAlign: 'center',
        },
        gameDescription: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.md,
        },
        playButton: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.full,
        },
        playButtonText: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        comingSoon: {
            marginTop: spacing.xl,
            marginHorizontal: spacing.xl,
            backgroundColor: colors.surfaceAlt,
            borderRadius: borderRadius.md,
            padding: spacing.lg,
            alignItems: 'center',
        },
        comingSoonTitle: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: spacing.xs,
        },
        comingSoonText: {
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            textAlign: 'center',
        },
        bottomPadding: {
            height: 80,
        },
    });

export default TrainingHubScreen;
