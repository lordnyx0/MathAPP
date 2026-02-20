# Arquitetura do Projeto

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  SafeAreaProvider → ErrorBoundary → ToastProvider → Nav    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      TabNavigator                           │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ Exercícios  │   Aprender  │     MCQ     │     Treino      │
│     📝      │     📚      │     🧠      │      🎯         │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

## TypeScript Strict Mode

O projeto utiliza **TypeScript com strict mode habilitado**, garantindo:

- ✅ Null/undefined checks obrigatórios
- ✅ Tipos explícitos para parâmetros
- ✅ Type guards para union types
- ✅ Zero `as any` ou `@ts-ignore`

## Estrutura de Pastas

```
src/
├── components/              # Componentes UI reutilizáveis (.tsx)
│   ├── AnimatedCard.tsx     # Cards com animação
│   ├── Button.tsx           # Botões com debounce
│   ├── ConfidenceSlider.tsx # Slider 1-5
│   ├── EmptyState.tsx       # Estado vazio
│   ├── ErrorBoundary.tsx    # Captura erros
│   ├── MathText.tsx         # Renderização LaTeX
│   ├── QuadrantCircle.tsx   # Círculo trigonométrico
│   ├── Skeleton.tsx         # Loading skeleton
│   ├── StepCard.tsx         # Cards de passos
│   └── Toast.tsx            # Notificações
│
├── screens/                 # Telas principais (.tsx)
│   ├── ExercisesScreen.tsx      # Exercícios resolvidos
│   ├── LearningScreen.tsx       # Lições interativas
│   ├── MCQPracticeScreen.tsx    # Prática MCQ
│   ├── QuadrantTrainingScreen.tsx # Treino quadrantes
│   └── SettingsScreen.tsx       # Configurações
│
├── data/                    # Dados e conteúdo
│   ├── registry.ts          # 👑 FONTE ÚNICA DE VERDADE
│   ├── index.ts             # Re-exports
│   ├── lessons/             # Lições por tópico (.ts)
│   ├── exercises/           # Exercícios por prova (.ts)
│   ├── mcq/                 # Questões MCQ (.ts)
│   └── quadrantQuestions.ts # Questões de quadrantes
│
├── learning/                # Algoritmos de aprendizado (.ts)
│   ├── srs.ts               # Spaced Repetition (SM-2)
│   ├── metacognition.ts     # Tracking de confiança
│   ├── interleaving.ts      # Prática intercalada
│   └── index.ts
│
├── types/                   # Type definitions
│   └── index.ts             # MCQ, Lesson, Exercise types
│
├── contexts/                # React Contexts
│   └── ThemeContext.tsx     # Tema claro/escuro/OLED
│
├── styles/
│   └── theme.ts             # Cores, espaçamento, tipografia
│
├── utils/
│   ├── index.ts             # Utilitários gerais
│   ├── sounds.ts            # Efeitos sonoros
│   └── answerValidator.ts   # Validação de respostas
│
├── i18n/
│   └── strings.ts           # Strings internacionalizáveis
│
├── constants/
│   └── index.ts             # Constantes do app
│
└── navigation/
    └── TabNavigator.tsx     # Navegação por abas
```

## Fluxo de Dados

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  registry.ts │────▶│   Screen     │────▶│  Component   │
│  (dados)     │     │  (lógica)    │     │  (UI)        │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    ▼                    │
       │            ┌──────────────┐             │
       │            │ AsyncStorage │             │
       │            │ (persistência)│            │
       │            └──────────────┘             │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                     learning/                            │
│   srs.ts │ metacognition.ts │ interleaving.ts           │
└─────────────────────────────────────────────────────────┘
```

## Registry Pattern

O `registry.ts` é o coração da extensibilidade:

```typescript
// Um único objeto contém TUDO sobre um tópico
topicRegistry.logaritmos = {
    id: 'logaritmos',
    mainCategory: 'mat-elementar',
    title: 'Logaritmos',
    icon: '📊',
    color: colors.logaritmos,
    lessons: logaritmosLessons,  // Array de Lesson[]
    mcq: logaritmosMCQ,          // Array de MCQ[] | null
    get lessonCount() { return this.lessons.length; },
    get mcqCount() { return this.mcq ? this.mcq.length : 0; },
};
```

### Benefícios:
- ❌ Sem switch statements
- ✅ Auto-discovery de conteúdo
- ✅ Cores, ícones, títulos em um só lugar
- ✅ Adicionar tópico = 1 arquivo + 1 entrada no registry
- ✅ Type-safe com TypeScript

## Padrões de Type Safety

### Type Guards para Union Types

```typescript
// Em quadrantQuestions.ts
export const isIntervalQuestion = (q: QuadrantQuestion): q is IntervalQuadrantQuestion => {
    return 'type' in q && q.type === 'interval';
};

export const isBaseQuestion = (q: QuadrantQuestion): q is BaseQuadrantQuestion => {
    return !('type' in q);
};
```

### Validação em Runtime

```typescript
// Em utils/index.ts - validação segura de dados desconhecidos
if (Array.isArray(value) && value.every(item => typeof item === 'number')) {
    migrated[key] = value;  // Type-safe assignment
}
```

## Módulos de Aprendizado

### SRS (srs.ts)
- Algoritmo SM-2 para repetição espaçada
- Calcula próxima revisão baseado em qualidade (0-5)
- Persiste cards no AsyncStorage
- Tipos: `SRSCard`, `SRSStats`, `QualityType`

### Metacognição (metacognition.ts)
- Tracking de confiança (1-5) antes de responder
- Calibração: overconfident, underconfident, accurate
- Feedback personalizado
- Tipos: `MetacognitionEntry`, `CalibrationType`, `CalibrationFeedback`

### Interleaving (interleaving.ts)
- `createInterleavedSession()` - Mix aleatório
- `createAdaptiveSession()` - Pondera por fraquezas
- Retorna `MCQ[]` type-safe

## Ciclo de Vida do App

```
1. App.tsx monta
   └── ErrorBoundary captura erros globais
       └── ToastProvider disponibiliza notificações
           └── ThemeProvider (light/dark/oled/sepia)
               └── TabNavigator renderiza

2. Tela monta
   └── useEffect carrega dados do AsyncStorage
   └── useState<T>() com tipos explícitos
   └── Registry fornece conteúdo

3. Usuário interage
   └── SRS atualiza cards
   └── Metacognição registra calibração
   └── AsyncStorage persiste

4. App desmonta
   └── Cleanup functions executam
```

