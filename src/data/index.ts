// Data Index - Central data exports using Registry as single source of truth
// Re-exports from registry.js for backward compatibility

export {
    // Categories
    mainCategories,
    // Topic Registry
    topicRegistry,
    exerciseRegistry,
    // Legacy exports (backward compatibility)
    learningTopics,
    exerciseTopics,
    exercises,
    // Helper functions - NO MORE SWITCH STATEMENTS!
    getTopic,
    getLessonsForTopic,
    getMCQForTopic,
    getTopicColor,
    getTopicTitle,
    getTopicsForCategory,
    getExerciseTopicsForCategory,
    getExercisesForTopic,
    getAllExercises,
    getAllMCQ,
    getAllLessons,
    getContentStats,
} from './registry';

import { getExercisesForTopic } from './registry';

// Backward compatibility alias
export const getExercisesByTopic = (topicId: string) => getExercisesForTopic(topicId);
