import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fontSize, borderRadius } from '../styles/theme';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

import ExercisesScreen from '../screens/ExercisesScreen';
import LearningScreen from '../screens/LearningScreen';
import TrainingNavigator from './TrainingNavigator';
import MCQPracticeScreen from '../screens/MCQPracticeScreen';
import SettingsScreen from '../screens/SettingsScreen';

type TabParamList = {
    Exercícios: undefined;
    Aprender: undefined;
    MCQ: undefined;
    Treino: undefined;
    Config: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// ============================================================
// TAB ICON COMPONENT
// ============================================================

interface TabIconProps {
    label: string;
    focused: boolean;
    colors: ThemeColors;
}

const TabIcon: React.FC<TabIconProps> = ({ label, focused, colors }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
    const indicatorOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: focused ? 1.1 : 0.9,
                friction: 6,
                tension: 120,
                useNativeDriver: true,
            }),
            Animated.timing(indicatorOpacity, {
                toValue: focused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [focused]);

    const iconColor = focused ? colors.primary : colors.textTertiary;
    const iconSize = 24;

    const renderIcon = () => {
        switch (label) {
            case 'Exercícios':
                return (
                    <Ionicons
                        name={focused ? 'book' : 'book-outline'}
                        size={iconSize}
                        color={iconColor}
                    />
                );
            case 'Aprender':
                return (
                    <Ionicons
                        name={focused ? 'school' : 'school-outline'}
                        size={iconSize}
                        color={iconColor}
                    />
                );
            case 'MCQ':
                return (
                    <MaterialCommunityIcons
                        name={focused ? 'brain' : 'brain'}
                        size={iconSize}
                        color={iconColor}
                    />
                );
            case 'Treino':
                return (
                    <Ionicons
                        name={focused ? 'game-controller' : 'game-controller-outline'}
                        size={iconSize}
                        color={iconColor}
                    />
                );
            case 'Config':
                return (
                    <Ionicons
                        name={focused ? 'settings' : 'settings-outline'}
                        size={iconSize}
                        color={iconColor}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.tabItem}>
            {/* Active indicator dot */}
            <Animated.View
                style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.primary, opacity: indicatorOpacity },
                ]}
            />

            {/* Icon with scale animation */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                {renderIcon()}
            </Animated.View>

            <Text
                style={[
                    styles.tabLabel,
                    { color: focused ? colors.primary : colors.textTertiary },
                    focused && styles.tabLabelFocused,
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

// ============================================================
// TAB NAVIGATOR
// ============================================================

const TabNavigator: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            id="MainTabs"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 20 : 12,
                    left: 16,
                    right: 16,
                    height: 72,
                    borderRadius: borderRadius.xl,
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 16,
                    elevation: 10,
                    paddingBottom: 0,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Exercícios"
                component={ExercisesScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Exercícios" focused={focused} colors={colors} />,
                    tabBarAccessibilityLabel: 'Aba de Exercícios. Pratique com exercícios resolvidos passo a passo.',
                }}
            />
            <Tab.Screen
                name="Aprender"
                component={LearningScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Aprender" focused={focused} colors={colors} />,
                    tabBarAccessibilityLabel: 'Aba de Aprender. Estude lições interativas de matemática.',
                }}
            />
            <Tab.Screen
                name="MCQ"
                component={MCQPracticeScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="MCQ" focused={focused} colors={colors} />,
                    tabBarAccessibilityLabel: 'Aba MCQ. Prática inteligente com múltipla escolha e spaced repetition.',
                }}
            />
            <Tab.Screen
                name="Treino"
                component={TrainingNavigator}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Treino" focused={focused} colors={colors} />,
                    tabBarAccessibilityLabel: 'Aba de Treino. Minigames para praticar conceitos matemáticos.',
                }}
            />
            <Tab.Screen
                name="Config"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Config" focused={focused} colors={colors} />,
                    tabBarAccessibilityLabel: 'Configurações. Altere tema e gerencie dados.',
                }}
            />
        </Tab.Navigator>
    );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        minWidth: 56,
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        width: 24,
        height: 3,
        borderRadius: 2,
    },
    tabLabel: {
        fontSize: fontSize.xs,
        fontWeight: '500',
        marginTop: 4,
    },
    tabLabelFocused: {
        fontWeight: '700',
    },
});

export default TabNavigator;
