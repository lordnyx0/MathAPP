// Internationalization strings - Portuguese (Brazil)
// Centralized strings for future i18n support

export interface LearningStrings {
    title: string;
    subtitle: string;
    modulesAvailable: string;
    lessonsFromBasicToAdvanced: string;
}

export interface ExercisesStrings {
    title: string;
    subtitle: string;
    showSolution: string;
    hideSolution: string;
    showAllSteps: string;
    hideAllSteps: string;
    tips: string;
}

export interface QuadrantStrings {
    title: string;
    subtitle: string;
    learn: string;
    practice: string;
    points: string;
    streak: string;
    record: string;
    showHint: string;
    nextQuestion: string;
    end: string;
    whichQuadrant: string;
}

export interface CategoriesStrings {
    matElementar: string;
    calculoI: string;
}

export interface TopicsStrings {
    logaritmos: string;
    trigonometria: string;
    funcoes: string;
    limites: string;
    derivadas: string;
}

export interface ErrorsStrings {
    saveFailedTitle: string;
    saveFailedMessage: string;
    loadFailedTitle: string;
    loadFailedMessage: string;
    genericError: string;
}

export interface A11yStrings {
    backButton: string;
    nextButton: string;
    checkAnswer: string;
    revealStep: string;
    hideStep: string;
    selectTopic: string;
    selectLesson: string;
    answerInput: string;
    progressBar: string;
}

export interface ThemesStrings {
    light: string;
    dark: string;
    oled: string;
    sepia: string;
    system: string;
}

export interface SettingsStrings {
    title: string;
    appearance: string;
    theme: string;
    followSystem: string;
    data: string;
    viewStats: string;
    resetMCQ: string;
    resetLessons: string;
    resetAll: string;
    confirmReset: string;
    confirmResetMessage: string;
    resetSuccess: string;
    themes: ThemesStrings;
}

export interface Strings {
    // Navigation
    back: string;
    next: string;
    // Common
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    // Feedback
    correct: string;
    incorrect: string;
    almostCorrect: string;
    tryAgain: string;
    newRecordMessage: string;
    // Progress
    lessonsComplete: string;
    exercisesComplete: string;
    overallProgress: string;
    // Sections
    learning: LearningStrings;
    exercises: ExercisesStrings;
    quadrant: QuadrantStrings;
    categories: CategoriesStrings;
    topics: TopicsStrings;
    errors: ErrorsStrings;
    a11y: A11yStrings;
    settings: SettingsStrings;
}

export const strings: Strings = {
    // Navigation
    back: '← Voltar',
    next: 'Próxima →',

    // Common
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso!',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',

    // Feedback
    correct: '✓ Correto!',
    incorrect: '✗ Incorreto',
    almostCorrect: 'Quase! Sua resposta está próxima.',
    tryAgain: 'Tente novamente',
    newRecordMessage: '🏆 Novo recorde! {score} pontos',

    // Progress
    lessonsComplete: '{count}/{total} lições completas',
    exercisesComplete: '{count}/{total} exercícios',
    overallProgress: 'Progresso Geral',

    // Screens
    learning: {
        title: '📚 Aprender',
        subtitle: 'Escolha uma disciplina',
        modulesAvailable: '{count} módulos disponíveis',
        lessonsFromBasicToAdvanced: '{count} lições • Do básico ao avançado',
    },

    exercises: {
        title: '📝 Exercícios',
        subtitle: 'Pratique com exercícios resolvidos',
        showSolution: 'Ver Solução',
        hideSolution: 'Esconder Solução',
        showAllSteps: 'Mostrar Todos',
        hideAllSteps: 'Esconder Todos',
        tips: 'Dicas',
    },

    quadrant: {
        title: '🎯 Treino de Quadrantes',
        subtitle: 'Domine o círculo trigonométrico',
        learn: 'Aprender',
        practice: 'Praticar',
        points: 'Pontos',
        streak: 'Sequência',
        record: '🏆 Recorde',
        showHint: '💡 Mostrar dica (-5 pts)',
        nextQuestion: 'Próxima Pergunta →',
        end: 'Encerrar',
        whichQuadrant: 'Em qual quadrante está:',
    },

    // Categories
    categories: {
        matElementar: 'Matemática Elementar',
        calculoI: 'Cálculo I',
    },

    // Topics
    topics: {
        logaritmos: 'Logaritmos',
        trigonometria: 'Trigonometria',
        funcoes: 'Funções e Prostaférese',
        limites: 'Limites',
        derivadas: 'Derivadas',
    },

    // Errors
    errors: {
        saveFailedTitle: 'Erro ao salvar',
        saveFailedMessage: 'Não foi possível salvar seu progresso. Tente novamente.',
        loadFailedTitle: 'Erro ao carregar',
        loadFailedMessage: 'Não foi possível carregar seus dados.',
        genericError: 'Algo deu errado. Tente novamente.',
    },

    // Accessibility
    a11y: {
        backButton: 'Voltar para tela anterior',
        nextButton: 'Avançar para próxima tela',
        checkAnswer: 'Verificar resposta',
        revealStep: 'Revelar passo da solução',
        hideStep: 'Esconder passo da solução',
        selectTopic: 'Selecionar tópico',
        selectLesson: 'Selecionar lição',
        answerInput: 'Digite sua resposta',
        progressBar: 'Barra de progresso',
    },

    // Settings
    settings: {
        title: '⚙️ Configurações',
        appearance: 'Aparência',
        theme: 'Tema',
        followSystem: 'Seguir Sistema',
        data: 'Dados & Estatísticas',
        viewStats: 'Ver Estatísticas',
        resetMCQ: 'Resetar Estatísticas MCQ',
        resetLessons: 'Resetar Progresso de Lições',
        resetAll: 'Resetar Tudo',
        confirmReset: 'Confirmar Reset',
        confirmResetMessage: 'Esta ação não pode ser desfeita. Deseja continuar?',
        resetSuccess: 'Dados resetados com sucesso!',
        themes: {
            light: 'Claro',
            dark: 'Escuro',
            oled: 'OLED',
            sepia: 'Sépia',
            system: 'Sistema',
        },
    },
};

// Helper function to replace placeholders
export const t = (key: string, params: Record<string, string | number> = {}): string => {
    let str = key;
    Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
    });
    return str;
};

export default strings;
