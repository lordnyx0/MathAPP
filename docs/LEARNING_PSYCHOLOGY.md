# Psicologia do Aprendizado

Este documento explica os fundamentos teóricos e a implementação das features de psicologia do aprendizado.

---

## 📚 Base Teórica

### Curva de Esquecimento de Ebbinghaus

Sem revisão, esquecemos:
- 50% em 1 hora
- 70% em 24 horas
- 90% em 1 semana

**Solução:** Spaced Repetition System (SRS)

### Efeito de Espaçamento

Revisar em intervalos crescentes é mais eficaz que estudo massificado.

```
Dia 1: Aprender
Dia 2: Revisar
Dia 4: Revisar
Dia 8: Revisar
Dia 16: Revisar
...
```

### Prática Intercalada

Estudar tópicos misturados é melhor que em blocos.

❌ AAA BBB CCC (blocked)
✅ ABC BCA CAB (interleaved)

**Resultado:** +40-50% em transferência de conhecimento.

### Prática de Recuperação

Tentar lembrar é mais eficaz que reler.

❌ Ler → Ler → Ler
✅ Ler → Testar → Testar

### Metacognição

Saber o que você sabe (e não sabe).

- **Overconfidence:** Acha que sabe, mas não sabe
- **Underconfidence:** Sabe, mas acha que não sabe

---

## 🔧 Implementação

### 1. SRS (srs.js)

Algoritmo SM-2 adaptado:

```javascript
// Qualidade da resposta (0-5)
Quality.BLACKOUT = 0       // Esqueceu totalmente
Quality.WRONG_RECOGNIZED = 1  // Errou, mas reconheceu
Quality.WRONG_HARD = 2     // Errou, difícil
Quality.CORRECT_DIFFICULT = 3  // Acertou com dificuldade
Quality.CORRECT_HESITANT = 4   // Acertou hesitante
Quality.PERFECT = 5        // Resposta perfeita

// Cálculo do próximo intervalo
if (quality >= 3) {
    // Acerto: aumenta intervalo
    interval = interval * easeFactor;
} else {
    // Erro: reseta
    interval = 0;
}

// EaseFactor ajusta baseado no desempenho
// Mais erros = intervalo cresce mais devagar
```

**Uso:**
```javascript
import { calculateNextReview, Quality } from '../learning/srs';

const updatedCard = calculateNextReview(card, Quality.CORRECT_HESITANT);
// card.nextReview = Date ajustado
// card.interval = dias até próxima revisão
```

---

### 2. Metacognição (metacognition.js)

Tracking de confiança antes de responder:

```javascript
// Confiança 1-5
Confidence = {
    VERY_UNSURE: 1,      // "Não faço ideia"
    UNSURE: 2,           // "Acho que não sei"
    SOMEWHAT_SURE: 3,    // "Talvez eu saiba"
    CONFIDENT: 4,        // "Acho que sei"
    VERY_CONFIDENT: 5,   // "Tenho certeza"
};

// Calibração
analyzeCalibration(confidence, correct) → {
    ACCURATE_HIGH,    // Confiante + Acertou ✓
    ACCURATE_LOW,     // Inseguro + Errou ✓
    OVERCONFIDENT,    // Confiante + Errou ⚠️
    UNDERCONFIDENT,   // Inseguro + Acertou 🌟
}
```

**Feedback:**
```javascript
getCalibrationFeedback(calibration) → {
    emoji: '⚠️',
    message: 'Cuidado! Você pensou que sabia, mas errou.',
    tip: 'Revise este conceito...'
}
```

---

### 3. Interleaving (interleaving.js)

Mistura questões de diferentes tópicos:

```javascript
// Sessão aleatória
createInterleavedSession(10) → [
    mcq-log-1,
    mcq-quad-3,
    mcq-log-5,
    mcq-quad-1,
    ...
]

// Sessão adaptativa (pondera por fraquezas)
createAdaptiveSession(metaEntries, 10) → [
    // Mais questões dos tópicos com mais erros
]
```

---

### 4. MCQ com Distratores Inteligentes

Cada opção errada é baseada em erros comuns:

```javascript
{
    question: 'Calcule log₂(8)',
    options: [
        { 
            id: 'A', 
            text: '2', 
            explanation: '2² = 4, não 8. Você calculou log₂(4).'
            // ↑ Erro comum: off-by-one
        },
        { 
            id: 'B', 
            text: '3', 
            explanation: 'Correto! 2³ = 8'
        },
        { 
            id: 'D', 
            text: '8', 
            explanation: 'Você confundiu o logaritmando com a resposta.'
            // ↑ Erro comum: não entendeu o conceito
        },
    ],
}
```

---

## 📊 Métricas

```javascript
import { getStats } from '../learning/srs';
import { getStats as getMetaStats } from '../learning/metacognition';

// SRS Stats
{
    total: 50,        // Cards criados
    due: 12,          // Para revisar hoje
    learning: 8,      // Novos (< 2 repetições)
    reviewing: 20,    // Em revisão (2-5 repetições)
    mature: 22,       // Maduros (> 5 repetições)
    accuracy: 78.5,   // % acertos
    streak: 5,        // Dias consecutivos
}

// Metacognition Stats
{
    totalAnswers: 100,
    accuracyRate: 75.0,
    overconfidenceRate: 12.5,  // Preocupante se > 20%
    underconfidenceRate: 8.0,
    avgConfidence: 3.8,
    calibrationScore: 79.5,    // 100 = calibração perfeita
}
```

---

## 🎯 Impacto Esperado

| Feature | Aumento de Retenção |
|---------|---------------------|
| SRS | +30-50% |
| Interleaving | +40-50% |
| Retrieval Practice | +50-70% |
| Smart Distractors | +15-25% |
| Metacognição | Qualitativo |

---

## 📖 Referências

- Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology
- Roediger, H. L., & Butler, A. C. (2011). The critical role of retrieval practice
- Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories
- Dunlosky, J., et al. (2013). Improving Students' Learning With Effective Techniques
