import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { fontSize } from '../styles/theme';
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

interface TabIconProps {
    label: string;
    focused: boolean;
    colors: ThemeColors;
}

const TabIcon: React.FC<TabIconProps> = ({ label, focused, colors }) => {
    const icons: Record<string, string> = {
        'Exercícios': '📝',
        'Aprender': '📚',
        'Treino': '🎯',
        'MCQ': '🧠',
        'Config': '⚙️',
    };

    return (
        <View style={styles.tabItem}>
            <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
                {icons[label]}
            </Text>
            <Text style={[
                styles.tabLabel,
                { color: colors.textTertiary },
                focused && { color: colors.primary, fontWeight: '700' as const }
            ]}>
                {label}
            </Text>
        </View>
    );
};

const TabNavigator: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            id="MainTabs"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 20 : 10,
                    left: 20,
                    right: 20,
                    height: 70,
                    borderRadius: 20,
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
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

const styles = StyleSheet.create({
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 4,
        opacity: 0.5,
    },
    tabIconFocused: {
        opacity: 1,
        transform: [{ scale: 1.1 }],
    },
    tabLabel: {
        fontSize: fontSize.xs,
        fontWeight: '500',
    },
});

export default TabNavigator;
