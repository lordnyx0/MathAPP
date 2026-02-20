// Topics - Main categories and exercise topics
// Now sourced from JSON via registry

import type { Exercise } from '../types';

export interface MainCategory {
    id: string;
    title: string;
    icon: string;
    color: string;
}

export interface ExerciseTopic {
    id: string;
    mainCategory: string;
    title: string;
    icon: string;
    color: string;
}

export const mainCategories: MainCategory[] = [
    { id: 'mat-elementar', title: 'Matemática Elementar', icon: '🧮', color: '#6366F1' },
    { id: 'calculo-i', title: 'Cálculo I', icon: '📈', color: '#EC4899' },
];

export const exerciseTopics: ExerciseTopic[] = [
    // Matemática Elementar
    { id: 'mat-elem-r1', mainCategory: 'mat-elementar', title: 'R1 - Revisão', icon: '📚', color: '#10B981' },
    { id: 'mat-elem-ap1', mainCategory: 'mat-elementar', title: 'AP1 - Funções', icon: '📝', color: '#6366F1' },
    { id: 'mat-elem-ap2', mainCategory: 'mat-elementar', title: 'AP2 - Funções Avançado', icon: '📝', color: '#818CF8' },
    { id: 'mat-elem-ap3', mainCategory: 'mat-elementar', title: 'AP3 - Trigonometria', icon: '📝', color: '#A78BFA' },
    // Cálculo I
    { id: 'calc-ap1', mainCategory: 'calculo-i', title: 'AP1 - Limites I', icon: '📝', color: '#EC4899' },
    { id: 'calc-ap2', mainCategory: 'calculo-i', title: 'AP2 - Limites II', icon: '📝', color: '#F472B6' },
    { id: 'calc-ap4', mainCategory: 'calculo-i', title: 'AP4 - Derivadas', icon: '📝', color: '#FB7185' },
    { id: 'calc-revisao', mainCategory: 'calculo-i', title: 'Revisão Geral', icon: '🔄', color: '#F97316' },
    { id: 'calc-final', mainCategory: 'calculo-i', title: 'Avaliação Final', icon: '🎯', color: '#FDA4AF' },
];
