// Training Navigator - State-based navigation for training minigames
import React, { useState } from 'react';
import { FadeInView } from '../components/AnimatedCard';
import TrainingHubScreen from '../screens/TrainingHubScreen';
import QuadrantTrainingScreen from '../screens/QuadrantTrainingScreen';
import SymbolSprintScreen from '../screens/SymbolSprintScreen';
import FunctionLabScreen from '../screens/FunctionLabScreen';
import DerivativeTrainerScreen from '../screens/DerivativeTrainerScreen';
import IntegralTrainerScreen from '../screens/IntegralTrainerScreen';
import LiateTrainerScreen from '../screens/LiateTrainerScreen';
import SubstitutionScannerScreen from '../screens/SubstitutionScannerScreen';
import TrigSprintScreen from '../screens/TrigSprintScreen';
import TVMLabScreen from '../screens/TVMLabScreen';
import RecurrenceBuilderScreen from '../screens/RecurrenceBuilderScreen';
import AreaLabScreen from '../screens/AreaLabScreen';
import SymmetrySprintScreen from '../screens/SymmetrySprintScreen';
import PartialFractionsLabScreen from '../screens/PartialFractionsLabScreen';

// ============================================================
// TYPES
// ============================================================

type TrainingScreen = 'hub' | 'quadrants' | 'symbols' | 'functions' | 'derivatives' | 'integrals' 
    | 'liate' | 'substitution' | 'trigsprint' | 'tvmlab' | 'recurrence' | 'arealab' | 'symmetrysprint' | 'fracoeslab';

// Screen component map for cleaner rendering
const SCREEN_MAP: Record<Exclude<TrainingScreen, 'hub'>, React.ComponentType<{ onBack: () => void }>> = {
    quadrants: QuadrantTrainingScreen,
    symbols: SymbolSprintScreen,
    functions: FunctionLabScreen,
    derivatives: DerivativeTrainerScreen,
    integrals: IntegralTrainerScreen,
    liate: LiateTrainerScreen,
    substitution: SubstitutionScannerScreen,
    trigsprint: TrigSprintScreen,
    tvmlab: TVMLabScreen,
    recurrence: RecurrenceBuilderScreen,
    arealab: AreaLabScreen,
    symmetrysprint: SymmetrySprintScreen,
    fracoeslab: PartialFractionsLabScreen,
};

// ============================================================
// NAVIGATOR
// ============================================================

const TrainingNavigator: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<TrainingScreen>('hub');

    const goBack = () => setCurrentScreen('hub');

    if (currentScreen !== 'hub') {
        const ScreenComponent = SCREEN_MAP[currentScreen];
        return (
            <FadeInView key={currentScreen} style={{ flex: 1 }}>
                <ScreenComponent onBack={goBack} />
            </FadeInView>
        );
    }

    return (
        <FadeInView key="hub" style={{ flex: 1 }}>
            <TrainingHubScreen
                onSelectMinigame={(id) => setCurrentScreen(id as TrainingScreen)}
            />
        </FadeInView>
    );
};

export default TrainingNavigator;

