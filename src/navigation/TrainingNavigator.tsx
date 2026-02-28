// Training Navigator - State-based navigation for training minigames
import React, { useState } from 'react';
import TrainingHubScreen from '../screens/TrainingHubScreen';
import QuadrantTrainingScreen from '../screens/QuadrantTrainingScreen';
import SymbolSprintScreen from '../screens/SymbolSprintScreen';
import FunctionLabScreen from '../screens/FunctionLabScreen';
import DerivativeTrainerScreen from '../screens/DerivativeTrainerScreen';
import IntegralTrainerScreen from '../screens/IntegralTrainerScreen';

// ============================================================
// TYPES
// ============================================================

type TrainingScreen = 'hub' | 'quadrants' | 'symbols' | 'functions' | 'derivatives' | 'integrals';

// ============================================================
// NAVIGATOR
// ============================================================

const TrainingNavigator: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<TrainingScreen>('hub');

    const goBack = () => setCurrentScreen('hub');

    switch (currentScreen) {
        case 'quadrants':
            return <QuadrantTrainingScreen onBack={goBack} />;
        case 'symbols':
            return <SymbolSprintScreen onBack={goBack} />;
        case 'functions':
            return <FunctionLabScreen onBack={goBack} />;
        case 'derivatives':
            return <DerivativeTrainerScreen onBack={goBack} />;
        case 'integrals':
            return <IntegralTrainerScreen onBack={goBack} />;
        case 'hub':
        default:
            return (
                <TrainingHubScreen
                    onSelectMinigame={(id) => {
                        if (id === 'quadrants') {
                            setCurrentScreen('quadrants');
                        } else if (id === 'symbols') {
                            setCurrentScreen('symbols');
                        } else if (id === 'functions') {
                            setCurrentScreen('functions');
                        } else if (id === 'derivatives') {
                            setCurrentScreen('derivatives');
                        } else if (id === 'integrals') {
                            setCurrentScreen('integrals');
                        }
                    }}
                />
            );
    }
};

export default TrainingNavigator;

