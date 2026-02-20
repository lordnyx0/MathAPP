// Learning Module Index
// Exports all learning psychology features

export {
    default as srs,
    Quality,
    createCard,
    calculateNextReview,
    isDue,
    getDueCards,
    getStats as getSRSStats,
} from './srs';

export type { SRSCard, SRSHistory, SRSStats, QualityType } from './srs';

export {
    default as metacognition,
    Confidence,
    ConfidenceLabels,
    Calibration,
    analyzeCalibration,
    getCalibrationFeedback,
    createEntry,
    getStats as getMetaStats,
} from './metacognition';

export type {
    MetacognitionEntry,
    CalibrationFeedback,
    MetacognitionStats,
    TopicWeakness,
    ConfidenceType,
    CalibrationType,
} from './metacognition';

export {
    default as interleaving,
    getAllMCQ,
    createInterleavedSession,
    createAdaptiveSession,
    getSessionDistribution,
} from './interleaving';

export type { TopicDistribution } from './interleaving';
