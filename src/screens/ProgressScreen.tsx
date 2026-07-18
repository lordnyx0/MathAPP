// Progress Screen — unified learning dashboard.
// Pulls together the three progress signals the app already records: SRS review
// state (spaced repetition), MCQ metacognition/calibration, and per-topic
// mastery from the trainers. Answers "where am I strong / what needs work".
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { TAB_BAR_CLEARANCE } from '../constants/layout';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { loadCards, getStats as getSrsStats, SRSStats } from '../learning/srs';
import { loadEntries, getStats as getMetaStats, MetacognitionStats } from '../learning/metacognition';
import { loadMastery, getMasteryLevels, MasteryLevel } from '../learning/topicMastery';

// Pretty labels + emoji for topic ids used across MCQ and trainers.
const TOPIC_META: Record<string, { label: string; emoji: string }> = {
    logaritmos: { label: 'Logaritmos', emoji: '📊' },
    trigonometria: { label: 'Trigonometria', emoji: '📐' },
    'trig-identidades': { label: 'Identidades Trig.', emoji: '🎴' },
    funcoes: { label: 'Funções', emoji: '🔗' },
    simetria: { label: 'Simetria', emoji: '↔️' },
    simbolos: { label: 'Símbolos', emoji: '🔣' },
    limites: { label: 'Limites', emoji: '🎯' },
    derivadas: { label: 'Derivadas', emoji: '📉' },
    integrais: { label: 'Integrais', emoji: '∫' },
};

const topicLabel = (topic: string) => TOPIC_META[topic]?.label ?? topic;
const topicEmoji = (topic: string) => TOPIC_META[topic]?.emoji ?? '📚';

const LEVEL_LABEL: Record<MasteryLevel['level'], string> = {
    novato: 'Novato',
    aprendiz: 'Aprendiz',
    competente: 'Competente',
    mestre: 'Mestre',
};

const ProgressScreen: React.FC = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [srs, setSrs] = useState<SRSStats | null>(null);
    const [meta, setMeta] = useState<MetacognitionStats | null>(null);
    const [mastery, setMastery] = useState<MasteryLevel[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Refresh every time the tab gains focus so the dashboard reflects the most
    // recent practice without needing an app restart.
    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                const [cards, entries, masteryMap] = await Promise.all([
                    loadCards(),
                    loadEntries(),
                    loadMastery(),
                ]);
                if (!active) return;
                setSrs(getSrsStats(cards));
                setMeta(getMetaStats(entries));
                setMastery(getMasteryLevels(masteryMap));
                setLoaded(true);
            })();
            return () => { active = false; };
        }, [])
    );

    const levelColor = (level: MasteryLevel['level']): string => {
        switch (level) {
            case 'mestre': return colors.success;
            case 'competente': return colors.info;
            case 'aprendiz': return colors.warning;
            default: return colors.textTertiary;
        }
    };

    const hasAnyData = loaded && (
        (srs?.total ?? 0) > 0 ||
        (meta?.totalAnswers ?? 0) > 0 ||
        mastery.length > 0
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <LinearGradient colors={colors.gradientBackground} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <ScreenHeader title="Seu Progresso" icon="📈" subtitle="Onde você está forte e o que revisar" />

                    {!hasAnyData ? (
                        <EmptyState
                            icon="📊"
                            title="Ainda sem dados"
                            subtitle="Responda algumas questões no MCQ ou nos treinos para começar a acompanhar seu progresso aqui."
                        />
                    ) : (
                        <>
                            {/* Headline stats */}
                            <View style={styles.statRow}>
                                <View style={[styles.statTile, shadows.sm]}>
                                    <Text style={styles.statValue}>🔥 {srs?.streak ?? 0}</Text>
                                    <Text style={styles.statLabel}>Dias seguidos</Text>
                                </View>
                                <View style={[styles.statTile, shadows.sm]}>
                                    <Text style={styles.statValue}>{srs?.due ?? 0}</Text>
                                    <Text style={styles.statLabel}>Para revisar</Text>
                                </View>
                                <View style={[styles.statTile, shadows.sm]}>
                                    <Text style={styles.statValue}>{srs?.accuracy ?? 0}%</Text>
                                    <Text style={styles.statLabel}>Acurácia SRS</Text>
                                </View>
                            </View>

                            {/* Spaced repetition breakdown */}
                            <View style={[styles.card, shadows.md]}>
                                <Text style={styles.cardTitle}>🧠 Revisão espaçada</Text>
                                <View style={styles.srsBuckets}>
                                    <View style={styles.bucket}>
                                        <Text style={[styles.bucketValue, { color: colors.warning }]}>{srs?.learning ?? 0}</Text>
                                        <Text style={styles.bucketLabel}>Aprendendo</Text>
                                    </View>
                                    <View style={styles.bucket}>
                                        <Text style={[styles.bucketValue, { color: colors.info }]}>{srs?.reviewing ?? 0}</Text>
                                        <Text style={styles.bucketLabel}>Revisando</Text>
                                    </View>
                                    <View style={styles.bucket}>
                                        <Text style={[styles.bucketValue, { color: colors.success }]}>{srs?.mature ?? 0}</Text>
                                        <Text style={styles.bucketLabel}>Dominadas</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Metacognition / calibration */}
                            {(meta?.totalAnswers ?? 0) > 0 && (
                                <View style={[styles.card, shadows.md]}>
                                    <Text style={styles.cardTitle}>🎯 Calibração (MCQ)</Text>
                                    <Text style={styles.cardBody}>
                                        Precisão da sua autoavaliação: <Text style={styles.emphasis}>{meta?.calibrationScore}%</Text>
                                    </Text>
                                    <Text style={styles.cardSub}>
                                        {meta?.overconfidenceRate}% de excesso de confiança · {meta?.underconfidenceRate}% de subestimação
                                    </Text>
                                </View>
                            )}

                            {/* Per-topic mastery from trainers */}
                            {mastery.length > 0 && (
                                <View style={[styles.card, shadows.md]}>
                                    <Text style={styles.cardTitle}>📚 Domínio por tópico</Text>
                                    {mastery.map(m => (
                                        <View key={m.topic} style={styles.topicRow}>
                                            <Text style={styles.topicEmoji}>{topicEmoji(m.topic)}</Text>
                                            <View style={styles.topicInfo}>
                                                <Text style={styles.topicName}>{topicLabel(m.topic)}</Text>
                                                <View style={styles.barTrack}>
                                                    <View style={[styles.barFill, { width: `${Math.round(m.accuracy)}%`, backgroundColor: levelColor(m.level) }]} />
                                                </View>
                                            </View>
                                            <View style={styles.topicMeta}>
                                                <Text style={[styles.topicLevel, { color: levelColor(m.level) }]}>{LEVEL_LABEL[m.level]}</Text>
                                                <Text style={styles.topicCount}>{Math.round(m.accuracy)}% · {m.total}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}

                    <View style={{ height: TAB_BAR_CLEARANCE }} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    scrollContent: { padding: spacing.lg },

    statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    statTile: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
    statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primary },
    statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

    card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
    cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
    cardBody: { fontSize: fontSize.md, color: colors.textPrimary },
    cardSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
    emphasis: { fontWeight: '700', color: colors.primary },

    srsBuckets: { flexDirection: 'row', justifyContent: 'space-around' },
    bucket: { alignItems: 'center' },
    bucketValue: { fontSize: fontSize.xxl, fontWeight: '700' },
    bucketLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

    topicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    topicEmoji: { fontSize: 22, marginRight: spacing.md, width: 28, textAlign: 'center' },
    topicInfo: { flex: 1 },
    topicName: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
    barTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.full, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: borderRadius.full },
    topicMeta: { alignItems: 'flex-end', marginLeft: spacing.md, minWidth: 76 },
    topicLevel: { fontSize: fontSize.sm, fontWeight: '700' },
    topicCount: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
});

export default ProgressScreen;
