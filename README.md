# Math Learning App

Um aplicativo de aprendizado de matemática com recursos avançados de psicologia do aprendizado.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm start

# Web
npm run web

# Android
npm run android

# iOS
npm run ios

# Rodar testes
npm test

# Verificar tipos
npx tsc --noEmit
```

## 📱 Features

- **🚀 Onboarding** - Introdução ao método + diagnóstico de nível na primeira abertura
- **📝 Exercícios** - Exercícios resolvidos passo a passo (com prompt de autoexplicação)
- **📚 Aprender** - Lições interativas por tópico
- **🧠 MCQ** - Prática inteligente com spaced repetition, incluindo **Revisão de Hoje** (fila de cartões vencidos)
- **🎯 Treino** - 13 minigames; os treinos alimentam o domínio por tópico e têm dificuldade adaptativa
- **📈 Progresso** - Dashboard de domínio por tópico, revisões pendentes, streak e calibração

## 🧠 Learning Psychology Features

| Feature | Descrição | Impacto |
|---------|-----------|---------|
| **SRS** | Spaced Repetition System + fila de revisão diária | +30-50% retenção |
| **MCQ Smart** | Distratores inteligentes (Logaritmos, Trig, Limites, Derivadas) | +15-25% retenção |
| **Metacognição** | Tracking de confiança e calibração | Autoconsciência |
| **Interleaving** | Prática intercalada e adaptativa | +40-50% transferência |
| **Dificuldade adaptativa** | Sobe após 3 acertos, desce após 2 erros | Zona de desenvolvimento proximal |
| **Domínio por tópico** | Treinos alimentam o painel de Progresso | Visão de lacunas |

## 📂 Estrutura do Projeto

```
math-app/
├── src/
│   ├── components/     # Componentes reutilizáveis (.tsx)
│   ├── screens/        # Telas do app (.tsx)
│   ├── data/           # Dados e conteúdo
│   │   ├── registry.ts # 👑 Fonte única de verdade
│   │   ├── lessons/    # Lições por tópico
│   │   ├── exercises/  # Exercícios por prova
│   │   └── mcq/        # Questões múltipla escolha
│   ├── learning/       # Algoritmos de aprendizado (.ts)
│   ├── styles/         # Tema e estilos
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utilitários
│   └── navigation/     # Navegação
├── docs/               # Documentação
├── __tests__/          # Testes unitários
└── package.json
```

## 📖 Documentação

- [Arquitetura](./docs/ARCHITECTURE.md)
- [Adicionar Conteúdo](./docs/ADDING_CONTENT.md)
- [Componentes](./docs/COMPONENTS.md)
- [Learning Psychology](./docs/LEARNING_PSYCHOLOGY.md)
- [QA Audit](./docs/QA_AUDIT_REPORT.md)

## 🛠️ Tech Stack

- **React Native + Expo** - Framework mobile
- **TypeScript** - Tipagem estática (strict mode ✓)
- **React Navigation** - Navegação
- **AsyncStorage** - Persistência
- **expo-av** - Audio
- **react-native-svg** - Gráficos vetoriais
- **Jest** - Testes unitários

## 📊 Status

- ✅ TypeScript strict mode enabled in project configuration
- ✅ QA audit report maintained in docs (`docs/QA_AUDIT_REPORT.md`)
- ℹ️ Test pass counts may vary by environment and dependency availability
- ⚠️ If npm registry access is restricted, run tests in CI or a network-enabled local setup
