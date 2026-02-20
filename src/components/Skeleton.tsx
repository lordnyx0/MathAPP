// Loading Skeleton Component for loading states
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import { spacing, borderRadius } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius: br = borderRadius.md,
    style
}) => {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                { backgroundColor: colors.surfaceAlt },
                { width, height, borderRadius: br, opacity },
                style,
            ]}
        />
    );
};

// Pre-built skeleton layouts
export const CardSkeleton: React.FC = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.cardSkeleton}>
            <View style={styles.cardHeader}>
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={styles.cardHeaderText}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
                </View>
            </View>
            <Skeleton width="100%" height={8} style={{ marginTop: 12 }} />
        </View>
    );
};

export const LessonListSkeleton: React.FC = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.listSkeleton}>
            {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.listItem}>
                    <Skeleton width={32} height={32} borderRadius={16} />
                    <View style={styles.listItemText}>
                        <Skeleton width="70%" height={14} />
                        <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
                    </View>
                </View>
            ))}
        </View>
    );
};

export const TopicCardSkeleton: React.FC = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.topicSkeleton}>
            <Skeleton width={48} height={48} borderRadius={24} />
            <View style={styles.topicText}>
                <Skeleton width="50%" height={18} />
                <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
                <Skeleton width="100%" height={8} style={{ marginTop: 12 }} />
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    cardSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeaderText: {
        flex: 1,
        marginLeft: spacing.md,
    },
    listSkeleton: {
        paddingHorizontal: spacing.xl,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    listItemText: {
        flex: 1,
        marginLeft: spacing.md,
    },
    topicSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    topicText: {
        flex: 1,
        marginLeft: spacing.md,
    },
});

export default Skeleton;
