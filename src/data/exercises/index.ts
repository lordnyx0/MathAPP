// Exercises Index - Re-exports from registry
// Exercises are now sourced from JSON via registry

import { getAllExercises, getExercisesForTopic } from '../registry';
import type { Exercise } from '../../types';

// Get all exercises from registry
export const exercises: Exercise[] = getAllExercises();

// Helper functions
export const getExercisesByTopic = (topicId: string): Exercise[] => {
    return getExercisesForTopic(topicId);
};

export const getExercisesByCategory = (category: string): Exercise[] => {
    return exercises.filter(ex => ex.category === category);
};

export default exercises;
