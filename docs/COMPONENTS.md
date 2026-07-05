# Componentes

Documentação dos componentes reutilizáveis do projeto.

---

## 🎴 AnimatedCard

Card com animação de entrada e feedback de toque.

```jsx
import { AnimatedCard } from '../components/AnimatedCard';

<AnimatedCard
    onPress={() => {}}
    delay={100}              // Delay para stagger effect
    borderColor="#6366F1"    // Cor da borda esquerda
    accessibilityLabel="..."
>
    <Text>Conteúdo</Text>
</AnimatedCard>
```

**Animações:**
- Fade-in + slide-up ao montar
- Scale 0.98 ao pressionar

---

## 🔘 AnimatedButton

Botão com animação de escala.

```jsx
import { AnimatedButton } from '../components/AnimatedCard';

<AnimatedButton
    onPress={() => {}}
    disabled={false}
    accessibilityLabel="..."
>
    <Text>Texto</Text>
</AnimatedButton>
```

---

## 📊 ConfidenceSlider

Slider de confiança 1-5 para metacognição.

```jsx
import ConfidenceSlider from '../components/ConfidenceSlider';

<ConfidenceSlider
    selected={3}
    onSelect={(level) => setConfidence(level)}
/>
```

**Níveis:**
1. 😟 Não faço ideia
2. 🤔 Acho que não sei
3. 😐 Talvez eu saiba
4. 🙂 Acho que sei
5. 😎 Tenho certeza

---

## 📭 EmptyState

Estado vazio para quando não há dados.

```jsx
import EmptyState from '../components/EmptyState';

<EmptyState
    icon="📭"
    title="Nada por aqui"
    subtitle="Não há conteúdo disponível"
    actionText="Recarregar"
    onAction={() => refresh()}
/>
```

---

## 🛡️ ErrorBoundary

Captura erros de renderização.

```jsx
import ErrorBoundary from '../components/ErrorBoundary';

<ErrorBoundary>
    <SomeComponent />
</ErrorBoundary>
```

Exibe tela de erro amigável se houver crash.

---

## 🔔 Toast

Notificações toast.

```jsx
import { showToast, ToastProvider } from '../components/Toast';

// No App.js
<ToastProvider>
    <App />
</ToastProvider>

// Para mostrar toast
showToast('Mensagem', 'success');  // success, error, warning, info
```

---

## 💀 Skeleton

Loading skeletons.

```jsx
import { CardSkeleton, LessonListSkeleton } from '../components/Skeleton';

{isLoading ? <CardSkeleton /> : <ActualContent />}

{isLoading ? <LessonListSkeleton count={5} /> : <LessonList />}
```

---

## ⭕ QuadrantCircle

Círculo trigonométrico interativo.

```jsx
import QuadrantCircle from '../components/QuadrantCircle';

<QuadrantCircle
    highlightedQuadrant={2}  // 1, 2, 3, 4 ou null
    showLabels={true}
    showAxes={true}
/>
```

Features:
- Responsivo com `useWindowDimensions`
- Cores por quadrante
- Referência visual de metades

---

## 📃 StepCard

Card para passos de exercícios.

```jsx
import StepCard from '../components/StepCard';

<StepCard
    step={{
        title: 'Passo 1',
        explanation: 'Por que',
        content: 'O que fazer'
    }}
    stepNumber={1}
    isRevealed={true}
    onToggle={() => toggle(1)}
/>
```

---

## 🔘 Button (Custom)

Botão com debounce e a11y built-in.

```jsx
import { Button, BackButton, CardButton } from '../components/Button';

<Button
    title="Confirmar"
    onPress={() => {}}
    variant="primary"  // primary, secondary, outline
    loading={false}
    debounceMs={300}
/>

<BackButton onPress={() => goBack()} />

<CardButton
    title="Card Título"
    subtitle="Descrição"
    icon="📝"
    onPress={() => {}}
/>
```

---

## 📊 TrainerStatsBar

Cabeçalho de pontuação compartilhado pelos treinos e labs (derivadas, integrais, Symbol Sprint, Function Lab, Quadrantes). Mostra pontos, sequência e questões respondidas, mais um botão "Encerrar" acessível. Constrói os próprios estilos a partir do tema.

```jsx
import TrainerStatsBar from '../components/TrainerStatsBar';

<TrainerStatsBar
    score={score}
    streak={streak}
    questionsAnswered={questionsAnswered}
    onEnd={endPractice}
    labels={{                      // opcional — sobrepõe os rótulos (i18n)
        points: strings.quadrant.points,
        streak: strings.quadrant.streak,
        questions: strings.quadrant.questions,
        end: strings.quadrant.end,
    }}
/>
```

**Detalhes:**
- `streak >= 3` destaca a sequência com 🔥 e cor de erro.
- Rótulos padrão: Pontos / Sequência / Questões / Encerrar.
- O botão "Encerrar" expõe `accessibilityRole="button"` e `accessibilityLabel`.

---

## Acessibilidade

Todos os componentes seguem:
- `accessibilityLabel` em elementos interativos
- `accessibilityRole="button"` onde apropriado
- Cores contrastantes para legibilidade

Os botões de resposta/opção dos treinos e labs expõem `accessibilityRole="button"`, um rótulo legível (fórmulas convertidas via `latexToUnicode`) e `accessibilityState` (`selected`/`disabled`) para leitores de tela.
