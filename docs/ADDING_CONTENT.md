# Adicionando Conteúdo

Este guia explica como adicionar novos tópicos, lições, exercícios e questões MCQ.

> [!NOTE]
> Todos os arquivos de conteúdo usam formato **JSON** e ficam em `src/content/`.
> A lógica de importação fica em `src/data/registry.ts` (fonte única de verdade).

---

## 📂 Arquitetura de Dados

```
src/
├── content/                    # DADOS (JSON puro)
│   ├── exercises/              # Exercícios por prova
│   ├── lessons/                # Lições por tópico
│   ├── mcq/                    # Questões múltipla escolha
│   └── schemas/                # JSON Schemas para validação
│
└── data/                       # LÓGICA (TypeScript)
    ├── registry.ts             # 👑 FONTE ÚNICA DE VERDADE
    ├── exercises/index.ts      # Helpers para exercícios
    ├── lessons/index.ts        # Helpers para lições
    └── mcq/index.ts            # Helpers para MCQ
```

### Princípios

1. **Dados separados da lógica**: JSON para conteúdo, TypeScript para código
2. **Registry Pattern**: Toda a configuração centralizada em `registry.ts`
3. **Sem switch statements**: Usar registry lookup ao invés de switch
4. **Backward compatibility**: Index files re-exportam do registry

---

## 📝 Adicionando um Novo Tópico de Aprendizado

### Passo 1: Criar arquivo de lições (JSON)

```json
// src/content/lessons/novoTopico.json

{
    "topic": "novo-topico",
    "title": "Novo Tópico",
    "lessons": [
        {
            "id": "nt-1",
            "title": "1. Introdução",
            "level": "Básico",
            "content": "📌 Conceito Principal\n\nExplicação aqui...\n\n📝 Exemplos:\n• Exemplo 1\n• Exemplo 2\n\n💡 Dica importante",
            "questions": [
                { "q": "Pergunta 1?", "a": "resposta", "hint": "Dica" },
                { "q": "Pergunta 2?", "a": "resposta", "hint": "Dica" }
            ]
        }
    ]
}
```

### Passo 2: Importar e registrar em `registry.ts`

```typescript
// src/data/registry.ts

// 1. Adicionar import
import novoTopicoLessonsData from '../content/lessons/novoTopico.json';

// 2. Extrair array de lições
const novoTopicoLessons = novoTopicoLessonsData.lessons;

// 3. Adicionar ao topicRegistry usando factory function
export const topicRegistry = {
    // ... tópicos existentes
    
    novoTopico: createTopic({
        id: 'novoTopico',
        mainCategory: 'mat-elementar',  // ou outra categoria
        title: 'Novo Tópico',
        icon: '🔢',
        color: colors.primary,
        lessons: novoTopicoLessons,
        mcq: null,  // ou array de MCQ se disponível
    }),
};
```

**Pronto!** O tópico aparecerá automaticamente na aba Aprender.

---

## 📋 Adicionando Exercícios (Provas)

### Passo 1: Criar arquivo de exercícios (JSON)

```json
// src/content/exercises/nova-prova.json

{
    "topicId": "nova-prova",
    "title": "Nova Prova",
    "exercises": [
        {
            "id": "np-q1",
            "topicId": "nova-prova",
            "category": "Categoria",
            "title": "Q1: Título do exercício",
            "difficulty": "Intermediário",
            "problem": "Enunciado do problema...",
            "finalAnswer": "Resposta final",
            "steps": [
                {
                    "title": "Passo 1: Identificar",
                    "explanation": "Por que fazer isso",
                    "content": "Conteúdo detalhado..."
                }
            ],
            "tips": [
                "Dica 1",
                "Dica 2"
            ]
        }
    ]
}
```

> [!NOTE]
> O campo `topicId` em cada exercício deve corresponder ao `topicId` do arquivo.
> Isso permite identificar a origem do exercício quando misturado com outros.

### Passo 2: Importar e registrar em `registry.ts`

```typescript
// src/data/registry.ts

// 1. Adicionar import
import novaProvaData from '../content/exercises/nova-prova.json';

// 2. Extrair array de exercícios
const novaProvaExercises = novaProvaData.exercises;

// 3. Adicionar ao exerciseRegistry usando factory function
export const exerciseRegistry = {
    // ... provas existentes
    
    'nova-prova': createExerciseTopic({
        id: 'nova-prova',
        mainCategory: 'mat-elementar',
        title: 'Nova Prova',
        icon: '📝',
        color: colors.primary,
        exercises: novaProvaExercises,
    }),
};
```

---

## 🧠 Adicionando Questões MCQ

### Passo 1: Criar arquivo MCQ (JSON)

```json
// src/content/mcq/novoTopico.json

{
    "topic": "novo-topico",
    "title": "MCQ - Novo Tópico",
    "questions": [
        {
            "id": "mcq-nt-1",
            "question": "Pergunta aqui?",
            "topic": "novoTopico",
            "difficulty": "basico",
            "options": [
                { "id": "A", "text": "Opção A", "explanation": "Por que está errado/certo" },
                { "id": "B", "text": "Opção B", "explanation": "Por que está errado/certo" },
                { "id": "C", "text": "Opção C", "explanation": "Por que está errado/certo" },
                { "id": "D", "text": "Opção D", "explanation": "Por que está errado/certo" }
            ],
            "correctAnswer": "B",
            "concept": "Conceito sendo testado"
        }
    ]
}
```

### Passo 2: Associar ao tópico no Registry

```typescript
// src/data/registry.ts

// 1. Adicionar import
import novoTopicoMCQData from '../content/mcq/novoTopico.json';

// 2. Extrair array de questões
const novoTopicoMCQ = novoTopicoMCQData.questions;

// 3. Associar ao tópico
export const topicRegistry = {
    novoTopico: {
        // ... outras propriedades
        mcq: novoTopicoMCQ,  // <- Adicione aqui!
    },
};
```

**Pronto!** As questões serão automaticamente incluídas no MCQ Practice.

---

## 🏷️ Adicionando Nova Categoria Principal

```typescript
// src/data/registry.ts

export const mainCategories = [
    // ... categorias existentes
    { 
        id: 'calculo-ii', 
        title: 'Cálculo II', 
        icon: '∫', 
        color: colors.success,
        description: 'Integrais e Séries',
    },
];

// Depois adicione tópicos com mainCategory: 'calculo-ii'
```

---

## 🔍 Validação com JSON Schema

O projeto inclui JSON Schemas para validação estrutural:

```
src/content/schemas/
├── exercise-file.schema.json   # Schema para exercícios
├── lesson-file.schema.json     # Schema para lições
└── mcq-file.schema.json        # Schema para MCQ
```

### Uso no VS Code

Adicione ao início do seu arquivo JSON:

```json
{
    "$schema": "../schemas/exercise-file.schema.json",
    "topicId": "...",
    ...
}
```

### Validação via CLI

```powershell
# Usando ajv-cli (npm install -g ajv-cli)
ajv validate -s src/content/schemas/exercise-file.schema.json -d src/content/exercises/nova-prova.json
```

---

## ✅ Checklist de Novo Conteúdo

- [ ] Criar arquivo JSON em `content/exercises/`, `content/lessons/` ou `content/mcq/`
- [ ] Verificar estrutura com JSON Schema (opcional)
- [ ] Importar o JSON no `registry.ts`
- [ ] Extrair o array (`.exercises`, `.lessons` ou `.questions`)
- [ ] Adicionar entrada no `topicRegistry` ou `exerciseRegistry`
- [ ] Verificar que IDs são únicos
- [ ] Verificar que `mainCategory` existe em `mainCategories`
- [ ] Rodar `npx tsc --noEmit` para validar tipos
- [ ] Testar no app

---

## 🎨 Cores Disponíveis

```typescript
// src/styles/theme.ts
colors.primary       // Indigo
colors.primaryLight  // Indigo claro
colors.secondary     // Purple
colors.logaritmos    // Deep Blue
colors.trigonometria // Deep Purple
colors.elementar     // Pink
colors.elementarLight// Pink claro
colors.limites       // Teal
colors.derivadas     // Orange
colors.derivadasLight// Orange claro
colors.success       // Green
colors.warning       // Amber
colors.error         // Red
```

---

## 💡 Dicas

> [!TIP]
> **Validação JSON**: Use `Get-Content arquivo.json | ConvertFrom-Json` no PowerShell para validar rapidamente.

> [!TIP]
> **Quebras de linha**: No JSON, use `\n` para quebras de linha no conteúdo.

> [!TIP]
> **Dificuldade**: Use "Básico", "Intermediário" ou "Avançado" (com acentos) para exercícios e lições. Para MCQ, use "basico", "intermediario", "avancado" (sem acentos, minúsculo).

> [!IMPORTANT]
> Sempre mantenha o `topicId` do arquivo JSON igual ao ID usado no registry.

> [!WARNING]
> Não edite `src/data/lessons/index.ts` ou `src/data/mcq/index.ts` diretamente.
> Eles são wrappers de backward compatibility que derivam dados do registry.
