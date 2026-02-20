/**
 * Data Loader Utility
 * Loads JSON content files with TypeScript types
 */

import type { Exercise, Lesson, MCQ, ExerciseFile, LessonFile, MCQFile } from '../types';

// Import all exercise JSON files
import calcAP1 from '../content/exercises/calc-ap1.json';
import calcAP2 from '../content/exercises/calc-ap2.json';
import calcAP4 from '../content/exercises/calc-ap4.json';
import calcFinal from '../content/exercises/calc-final.json';
import matElemAP1 from '../content/exercises/mat-elem-ap1.json';
import matElemAP2 from '../content/exercises/mat-elem-ap2.json';
import matElemAP3 from '../content/exercises/mat-elem-ap3.json';
import exerciciosClassicos from '../content/exercises/exercicios-classicos.json';

// Import all lesson JSON files
import logaritmosLessons from '../content/lessons/logaritmos.json';
import trigonometriaLessons from '../content/lessons/trigonometria.json';
import funcoesElementarLessons from '../content/lessons/funcoes-elementar.json';
import calculoLimitesLessons from '../content/lessons/calculo-limites.json';
import calculoDerivadasLessons from '../content/lessons/calculo-derivadas.json';

// Import MCQ JSON files
import logaritmosMCQ from '../content/mcq/logaritmos.json';
import quadrantesMCQ from '../content/mcq/quadrantes.json';

/**
 * All exercises indexed by topic
 */
export const exercises: Record<string, Exercise[]> = {
    'calc-ap1': (calcAP1 as ExerciseFile).exercises as Exercise[],
    'calc-ap2': (calcAP2 as ExerciseFile).exercises as Exercise[],
    'calc-ap4': (calcAP4 as ExerciseFile).exercises as Exercise[],
    'calc-final': (calcFinal as ExerciseFile).exercises as Exercise[],
    'mat-elem-ap1': (matElemAP1 as ExerciseFile).exercises as Exercise[],
    'mat-elem-ap2': (matElemAP2 as ExerciseFile).exercises as Exercise[],
    'mat-elem-ap3': (matElemAP3 as ExerciseFile).exercises as Exercise[],
    'exercicios-classicos': (exerciciosClassicos as ExerciseFile).exercises as Exercise[],
};

/**
 * All lessons indexed by topic
 */
export const lessons: Record<string, Lesson[]> = {
    logaritmos: (logaritmosLessons as LessonFile).lessons as Lesson[],
    trigonometria: (trigonometriaLessons as LessonFile).lessons as Lesson[],
    elementar: (funcoesElementarLessons as LessonFile).lessons as Lesson[],
    limites: (calculoLimitesLessons as LessonFile).lessons as Lesson[],
    derivadas: (calculoDerivadasLessons as LessonFile).lessons as Lesson[],
};

/**
 * All MCQ questions indexed by topic
 */
export const mcq: Record<string, MCQ[]> = {
    logaritmos: (logaritmosMCQ as MCQFile).questions as MCQ[],
    quadrantes: (quadrantesMCQ as MCQFile).questions as MCQ[],
};

/**
 * Get all exercises as flat array
 */
export const getAllExercises = (): Exercise[] => {
    return Object.values(exercises).flat();
};

/**
 * Get all lessons as flat array
 */
export const getAllLessons = (): Lesson[] => {
    return Object.values(lessons).flat();
};

/**
 * Get all MCQ as flat array
 */
export const getAllMCQ = (): MCQ[] => {
    return Object.values(mcq).flat();
};

/**
 * Get exercises by topic ID
 */
export const getExercisesByTopic = (topicId: string): Exercise[] => {
    return exercises[topicId] || [];
};

/**
 * Get lessons by topic
 */
export const getLessonsByTopic = (topic: string): Lesson[] => {
    return lessons[topic] || [];
};

/**
 * Get MCQ by topic
 */
export const getMCQByTopic = (topic: string): MCQ[] => {
    return mcq[topic] || [];
};

export interface DataLoaderAPI {
    exercises: typeof exercises;
    lessons: typeof lessons;
    mcq: typeof mcq;
    getAllExercises: typeof getAllExercises;
    getAllLessons: typeof getAllLessons;
    getAllMCQ: typeof getAllMCQ;
    getExercisesByTopic: typeof getExercisesByTopic;
    getLessonsByTopic: typeof getLessonsByTopic;
    getMCQByTopic: typeof getMCQByTopic;
}

const dataLoader: DataLoaderAPI = {
    exercises,
    lessons,
    mcq,
    getAllExercises,
    getAllLessons,
    getAllMCQ,
    getExercisesByTopic,
    getLessonsByTopic,
    getMCQByTopic,
};

export default dataLoader;
