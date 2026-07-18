# API Reference

Referência rápida das funções e exportações principais.

---

## 📦 data/index.js

### Registries
```javascript
import { topicRegistry, exerciseRegistry } from './data';

topicRegistry.logaritmos     // Objeto do tópico
exerciseRegistry['mat-elem-ap1']  // Objeto da prova
```

### Categories
```javascript
import { mainCategories } from './data';

// [{ id, title, icon, color, description }]
```

### Helper Functions
```javascript
import {
    getTopic,              // (topicId) => topic | null
    getLessonsForTopic,    // (topicId) => lessons[]
    getMCQForTopic,        // (topicId) => mcq[]
    getTopicColor,         // (topicId) => color
    getTopicTitle,         // (topicId) => "📊 Logaritmos"
    getTopicsForCategory,  // (categoryId) => topics[]
    getExercisesForTopic,  // (topicId) => exercises[]
    getAllExercises,       // () => allExercises[]
    getAllMCQ,             // () => allMCQ[]
    getAllLessons,         // () => allLessons[]
    getContentStats,       // () => { total, counts... }
} from './data';
```

---

## 🧠 learning/

### SRS
```javascript
import {
    createCard,            // (questionId, topic) => card
    calculateNextReview,   // (card, quality) => updatedCard
    isDue,                 // (card) => boolean
    getDueCards,           // (cards[]) => dueCards[]
    getStats,              // (cards[]) => stats
    saveCards,             // async (cards[]) => void
    loadCards,             // async () => cards[]
    Quality,               // { BLACKOUT: 0, ..., PERFECT: 5 }
} from './learning/srs';
```

### Metacognition
```javascript
import {
    Confidence,            // { VERY_UNSURE: 1, ..., VERY_CONFIDENT: 5 }
    ConfidenceLabels,      // { 1: "Não faço ideia", ... }
    Calibration,           // { ACCURATE_HIGH, OVERCONFIDENT, ... }
    analyzeCalibration,    // (confidence, correct) => calibration
    getCalibrationFeedback,// (calibration) => { emoji, message, tip }
    createEntry,           // (qId, topic, conf, correct) => entry
    getStats,              // (entries[]) => stats
    getWeaknesses,         // (entries[]) => topicWeaknesses[]
    saveEntries,           // async (entries[]) => void
    loadEntries,           // async () => entries[]
} from './learning/metacognition';
```

### Topic Mastery (trainer aggregation)
```javascript
import {
    recordTopicAnswer,     // async (topic, isCorrect, streak?) => void  — call from trainers
    loadMastery,           // async () => MasteryMap
    getMasteryLevels,      // (map) => MasteryLevel[]  (sorted by volume)
    applyAnswer,           // (map, topic, isCorrect, streak?) => MasteryMap  (pure)
    toMasteryLevel,        // (TopicMastery) => { accuracy, level, ... }
} from './learning/topicMastery';
```
Trainers with a single correct/incorrect per question call `recordTopicAnswer`;
the Progresso dashboard reads it. Levels: novato → aprendiz → competente → mestre.

### Adaptive Difficulty (hook)
```javascript
import { useAdaptiveDifficulty, advance } from './hooks/useAdaptiveDifficulty';

const adaptive = useAdaptiveDifficulty('basico');
adaptive.difficulty;          // current level
adaptive.register(isCorrect); // 3 correct → up, 2 wrong → down; returns new level
adaptive.reset('basico');     // e.g. on new session
// `advance(state, isCorrect)` is the pure transition (unit-tested).
```

### Interleaving
```javascript
import {
    getAllMCQ,             // () => mcq[] (from registry)
    createInterleavedSession, // (count, topics?, difficulties?) => mcq[]
    createAdaptiveSession, // (metaEntries, count) => mcq[]
    createReviewSession,   // (dueCards[], count?) => mcq[]  — spaced-repetition due queue
    getSessionDistribution,// (questions[]) => { topic: count }
} from './learning/interleaving';

// createReviewSession maps SRS cards that are due back to their MCQ, in
// due-priority order. Pair it with srs.getDueCards() to power the
// "Revisão de Hoje" card on the MCQ screen:
//   const session = createReviewSession(getDueCards(srsCards), 10);
```

---

## 🎨 styles/theme.js

### Colors
```javascript
import { colors } from './styles/theme';

colors.primary         // #6366F1
colors.secondary       // #8B5CF6
colors.background      // #0F172A
colors.surface         // #1E293B
colors.textPrimary     // #F8FAFC
colors.textSecondary   // #94A3B8
colors.success         // #10B981
colors.error           // #EF4444
colors.warning         // #F59E0B
colors.logaritmos      // #2563EB
colors.trigonometria   // #7C3AED
colors.elementar       // #EC4899
colors.limites         // #14B8A6
colors.derivadas       // #F97316
```

### Spacing
```javascript
import { spacing } from './styles/theme';

spacing.xs    // 4
spacing.sm    // 8
spacing.md    // 12
spacing.lg    // 16
spacing.xl    // 24
spacing.xxl   // 32
```

### Typography
```javascript
import { typography, fontFamily } from './styles/theme';

// Each preset now carries a `fontFamily` (Inter) so text renders in the
// bundled Inter weights instead of the platform default font.
typography.h1     // { fontSize: 32, fontWeight: '700', fontFamily: 'Inter_700Bold', color }
typography.h2     // { fontSize: 24, fontWeight: '700', fontFamily: 'Inter_700Bold', color }
typography.h3     // { fontSize: 20, fontWeight: '600', fontFamily: 'Inter_600SemiBold', color }
typography.body   // { fontSize: 15, fontWeight: '400', fontFamily: 'Inter_400Regular', color }
typography.caption// { fontSize: 13, fontFamily: 'Inter_400Regular', color }
typography.small  // { fontSize: 11, fontFamily: 'Inter_500Medium', color }

// Raw family names for custom styles
fontFamily.regular // 'Inter_400Regular'
fontFamily.medium  // 'Inter_500Medium'
fontFamily.semibold// 'Inter_600SemiBold'
fontFamily.bold    // 'Inter_700Bold'
```

### Animation
```javascript
import { animation } from './styles/theme';

animation.fast    // 150ms
animation.normal  // 300ms
animation.slow    // 500ms
```

---

## 🔊 utils/sounds.js

```javascript
import {
    playCorrect,          // async () => void
    playIncorrect,        // async () => void
    playClick,            // async () => void
    setSoundEnabled,      // (boolean) => void  — persists to AsyncStorage
    isSoundEnabled,       // () => boolean
    loadSoundPreference,  // async () => void   — call once on boot
    initAudio,            // async () => void
    unloadSounds,         // async () => void
} from './utils/sounds';
```

The sound preference is persisted under `STORAGE_KEYS.SOUND_ENABLED`. Call
`loadSoundPreference()` on app boot (done in `App.js`) so the toggle survives
restarts; `setSoundEnabled` writes the change through automatically.

---

## 📳 utils/haptics.js

```javascript
import {
    tapLight, tapMedium, tapHeavy,          // async () => void
    notifySuccess, notifyError, notifyWarning, // async () => void
    selectionTick,                          // async () => void
    setHapticsEnabled,                      // (boolean) => void — persists to AsyncStorage
    isHapticsEnabled,                       // () => boolean
    loadHapticsPreference,                  // async () => void  — call once on boot
} from './utils/haptics';
```

The haptics preference is persisted under `STORAGE_KEYS.HAPTICS_ENABLED`. Call
`loadHapticsPreference()` on app boot (done in `App.js`); `setHapticsEnabled`
writes the change through automatically. Both sound and haptics have toggles in
the Settings screen.

---

## 🏆 utils/highScore.ts

Persistência de recorde compartilhada pelos treinos. Cada treino guarda seu recorde sob a própria chave do AsyncStorage no formato JSON `{ highScore }`.

```typescript
import { loadHighScore, persistHighScore } from './utils/highScore';

// Carrega o recorde (0 se não houver). Aceita também o formato legado
// de número cru, preservando recordes antigos.
const highScore = await loadHighScore(STORAGE_KEY);

// Persiste apenas se `score` superar `currentHighScore`.
// Retorna o recorde resultante (inalterado se não for recorde).
const updated = await persistHighScore(STORAGE_KEY, score, highScore);
if (updated > highScore) {
    setHighScore(updated);
    showToast('🏆 Novo recorde!', 'success');
}
```

---

## 🔔 components/Toast.js

```javascript
import { showToast, ToastProvider } from './components/Toast';

// Wrap app
<ToastProvider>{children}</ToastProvider>

// Show toast
showToast('Message', 'success');  // success, error, warning, info
showToast('Error!', 'error');
```

---

## 📱 Storage Keys

```javascript
import { STORAGE_KEYS } from './constants';

STORAGE_KEYS.LEARNING_PROGRESS  // 'learning_progress'
STORAGE_KEYS.EXERCISE_PROGRESS  // 'exercise_progress'
STORAGE_KEYS.QUADRANT_STATS     // 'quadrant_stats'
STORAGE_KEYS.SRS_CARDS          // '@math_app_srs_cards'
STORAGE_KEYS.METACOGNITION      // '@math_app_metacognition'
STORAGE_KEYS.USER_THEME         // '@math_app_user_theme'
STORAGE_KEYS.SOUND_ENABLED      // '@math_app_sound_enabled'
STORAGE_KEYS.HAPTICS_ENABLED    // '@math_app_haptics_enabled'
STORAGE_KEYS.TOPIC_MASTERY      // '@math_app_topic_mastery'
STORAGE_KEYS.ONBOARDING_DONE    // '@math_app_onboarding_done'
STORAGE_KEYS.DATA_VERSION       // '@math_app_data_version'
```
