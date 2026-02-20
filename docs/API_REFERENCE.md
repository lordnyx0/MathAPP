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

### Interleaving
```javascript
import {
    getAllMCQ,             // () => mcq[] (from registry)
    createInterleavedSession, // (count, topics?, difficulties?) => mcq[]
    createAdaptiveSession, // (metaEntries, count) => mcq[]
    getSessionDistribution,// (questions[]) => { topic: count }
} from './learning/interleaving';
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
import { typography } from './styles/theme';

typography.h1     // { fontSize: 32, fontWeight: '700', color }
typography.h2     // { fontSize: 24, fontWeight: '700', color }
typography.h3     // { fontSize: 20, fontWeight: '600', color }
typography.body   // { fontSize: 15, fontWeight: '400', color }
typography.caption// { fontSize: 13, color }
typography.small  // { fontSize: 11, color }
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
    playCorrect,      // async () => void
    playIncorrect,    // async () => void
    playClick,        // async () => void
    setSoundEnabled,  // (boolean) => void
    isSoundEnabled,   // () => boolean
    initAudio,        // async () => void
    unloadSounds,     // async () => void
} from './utils/sounds';
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

STORAGE_KEYS.COMPLETED_LESSONS  // '@math_app_completed_lessons'
STORAGE_KEYS.HIGH_SCORES        // '@math_app_high_scores'
```
