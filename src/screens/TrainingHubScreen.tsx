// Training Hub Screen - Central hub for all training minigames
import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_PADDING = spacing.lg;
const CARD_WIDTH = (width - CARD_PADDING * 2 - CARD_GAP) / 2;

// ============================================================
// TYPES
// ============================================================

type MinigameId = 'quadrants' | 'symbols' | 'functions' | 'derivatives' | 'integrals';

interface Minigame {
    id: MinigameId;
    name: string;
    description: string;
    gradient: readonly [string, string];
    iconLib: 'ion' | 'mci';
    iconName: string;
    tag: string;
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
        name: 'Quadrantes',
        description: 'Domine o círculo trigonométrico',
        gradient: ['#10B981', '#059669'],
        iconLib: 'ion',
        iconName: 'compass',
        tag: 'Trigonometria',
    },
    {
        id: 'symbols',
        name: 'Símbolos',
        description: 'Aprenda notação matemática',
        gradient: ['#8B5CF6', '#7C3AED'],
        iconLib: 'ion',
        iconName: 'flash',
        tag: 'Álgebra',
    },
    {
        id: 'functions',
        name: 'Funções Lab',
        description: 'Domínio, imagem e contradomínio',
        gradient: ['#F59E0B', '#D97706'],
        iconLib: 'mci',
        iconName: 'function-variant',
        tag: 'Funções',
    },
    {
        id: 'derivatives',
        name: 'Derivadas',
        description: 'Pratique regras de derivação',
        gradient: ['#EF4444', '#DC2626'],
        iconLib: 'ion',
        iconName: 'trending-up',
        tag: 'Cálculo',
    },
    {
        id: 'integrals',
        name: 'Integrais',
        description: 'Treino de primitivas básicas',
        gradient: ['#06B6D4', '#0891B2'], // Cyan
        iconLib: 'mci',
        iconName: 'math-integral',
        tag: 'Cálculo',
    },
];

// ============================================================
// MINIGAME CARD
// ============================================================

interface MinigameCardProps {
    game: Minigame;
    onPress: () => void;
}

const MinigameCard: React.FC<MinigameCardProps> = ({ game, onPress }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { width: CARD_WIDTH }]}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityLabel={`Jogar ${game.name}`}
            accessibilityRole="button"
        >
            {/* Gradient banner */}
            <LinearGradient
                colors={game.gradient}
                style={styles.cardBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {game.iconLib === 'ion' ? (
                    <Ionicons name={game.iconName as any} size={34} color="rgba(255,255,255,0.95)" />
                ) : (
                    <MaterialCommunityIcons name={game.iconName as any} size={34} color="rgba(255,255,255,0.95)" />
                )}
            </LinearGradient>

            {/* Card body */}
            <View style={[styles.cardBody, { backgroundColor: colors.surface }]}>
                {/* Tag */}
                <View style={[styles.tagChip, { backgroundColor: game.gradient[0] + '18' }]}>
                    <Text style={[styles.tagText, { color: game.gradient[0] }]}>{game.tag}</Text>
                </View>

                <Text style={[styles.cardName, { color: colors.textPrimary }]}>{game.name}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {game.description}
                </Text>

                {/* Play row */}
                <View style={styles.playRow}>
                    <Text style={[styles.playText, { color: game.gradient[0] }]}>Jogar</Text>
                    <Ionicons name="chevron-forward" size={14} color={game.gradient[0]} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const TrainingHubScreen: React.FC<TrainingHubScreenProps> = ({ onSelectMinigame }) => {
    const { colors } = useTheme();
    const styles2 = useMemo(() => createPageStyles(colors), [colors]);

    return (
        <SafeAreaView style={styles2.container}>
            <LinearGradient colors={colors.gradientBackground} style={styles2.gradient}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles2.scrollContent}
                >
                    {/* Header */}
                    <View style={styles2.header}>
                        <View style={[styles2.headerIconWrap, { backgroundColor: colors.primary + '18' }]}>
                            <Ionicons name="game-controller" size={28} color={colors.primary} />
                        </View>
                        <View style={styles2.headerText}>
                            <Text style={styles2.headerTitle}>Área de Treino</Text>
                            <Text style={styles2.headerSubtitle}>
                                {minigames.length} minigames disponíveis
                            </Text>
                        </View>
                    </View>

                    {/* Minigame Grid */}
                    <View style={styles2.grid}>
                        {minigames.map((game) => (
                            <MinigameCard
                                key={game.id}
                                game={game}
                                onPress={() => onSelectMinigame(game.id)}
                            />
                        ))}
                    </View>

                    <View style={styles2.bottomPadding} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

// ============================================================
// STYLES
// ============================================================

// Static styles for MinigameCard (don't depend on theme colors for layout)
const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.md,
    },
    cardBanner: {
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        padding: spacing.md,
    },
    tagChip: {
        alignSelf: 'flex-start',
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        marginBottom: spacing.xs,
    },
    tagText: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    cardName: {
        fontSize: fontSize.md,
        fontWeight: '700',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: fontSize.xs,
        lineHeight: 16,
        marginBottom: spacing.sm,
    },
    playRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    playText: {
        fontSize: fontSize.sm,
        fontWeight: '700',
    },
});

const createPageStyles = (colors: import('../contexts/ThemeContext').ThemeColors) =>
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
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.xl,
            gap: spacing.md,
        },
        headerIconWrap: {
            width: 52,
            height: 52,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerText: {
            flex: 1,
        },
        headerTitle: {
            fontSize: fontSize.xxl,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        headerSubtitle: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: 2,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: CARD_PADDING,
            gap: CARD_GAP,
        },
        bottomPadding: {
            height: 100,
        },
    });

export default TrainingHubScreen;
