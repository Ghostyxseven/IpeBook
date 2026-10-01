# 🏗️ Skill: MVVM Simplificado e Sofisticado (Padrão PDM)

> Uma skill para inteligências artificiais (Antigravity, Claude Code, etc.) que ensina e impõe rigorosamente a arquitetura MVVM utilizada na disciplina de PDM (Programação para Dispositivos Móveis).

## 🎯 O que essa skill faz

Quando ativada, a IA abandona o péssimo padrão "CR - Codifica e Remenda" (código espaguete misturando tela, API e regras em um arquivo só) e passa a desenvolver seguindo uma separação profissional de responsabilidades.

A skill guia a IA para construir as funcionalidades passo a passo, realizando validações e aplicando **Injeção de Dependências** através do padrão *Factory*.

---

## 💻 Como Instalar a Skill

Essa skill é instalada **globalmente no seu assistente de IA**, e não no seu projeto React Native (`package.json`). Ao instalar, a IA usará essas regras em qualquer projeto mobile que você abrir no seu computador.

**Opção 1: Via CLI de Skills (Recomendado)**
```bash
skills install github:SEU-USUARIO/skill_mvvm_simplificado
```

**Opção 2: Instalação Manual (Git Clone)**
Se você não possui o comando `skills`, basta clonar o repositório diretamente na pasta oculta de agentes do seu sistema:
```bash
mkdir -p ~/.agents/skills
git clone https://github.com/SEU-USUARIO/skill_mvvm_simplificado.git ~/.agents/skills/skill_mvvm_simplificado
```

---

## 🚀 Como Usar no Dia a Dia (Na Prática)

Você não precisa decorar a arquitetura, criar as pastas manualmente ou ficar brigando com a IA para ela separar o código. A skill cuida disso sozinha.

### 1. Inicie seu projeto normalmente
```bash
npx create-expo-app meu-projeto
cd meu-projeto
```

### 2. Faça o pedido para a IA
Abra o seu assistente de IA no terminal (dentro da pasta do projeto) e faça o pedido com linguagem natural:
> **Você:** *"Crie uma tela de Login que autentica usando Firebase, contendo os campos de e-mail e senha."*

### 3. A Mágica Acontece
A IA vai detectar que é um projeto mobile e executará os seguintes passos autonomamente:
1. ⚙️ Cria a entidade e a regra de negócio (`Model`).
2. 🔌 Cria a conexão real com o Firebase de forma isolada (`Infraestrutura`).
3. 🧠 Cria o Custom Hook que fará a ponte e gerenciará os estados de erro/loading (`ViewModel`).
4. 🎨 Desenha a interface pura puxando o hook (`View`).
5. ✅ Lê o próprio código e faz um "checklist" para garantir que não misturou as responsabilidades.

### 4. Código Limpo
Sua pasta `src/` estará perfeitamente modularizada e pronta para ser avaliada pelo seu professor.

---

## 📂 Estrutura de Pastas (Como seu projeto vai ficar)

Sempre que a IA trabalhar, ela organizará os arquivos exatamente nesta árvore:

```text
src/
├── app/                        ← View: Telas e rotas (Expo Router)
│   └── index.tsx               (Apenas renderiza e interage com o usuário)
├── model/                      ← Model: Regras de negócio puras
│   ├── entities/               (Entidades, ex: User.ts)
│   ├── usecases/               (Regras, ex: AuthUseCases.ts)
│   └── services/               (Contratos e Interfaces)
├── viewmodel/                  ← ViewModel: Custom Hooks
│   └── useLoginViewModel.ts    (Gerencia loading, erro e chama Casos de Uso)
├── infra/                      ← Infraestrutura: Onde fica o código "sujo"
│   └── services/               (Implementações reais: Firebase, Axios, SQLite)
└── factories/                  ← Factories: Injeção de dependências
    └── loginFactory.ts         (Fábricas que montam a ViewModel para a View)
```

---

## 📚 O que tem dentro da Skill?

Se você quiser ler e aprender como a skill ensina a IA, explore os arquivos do repositório:

- **`SKILL.md`**: O cérebro da skill. Tem as regras de ouro, a ordem de implementação (TDD) e o checklist rigoroso de validação para a IA.
- **`examples/mvvm_sofisticado.md`**: Exemplo completo e comentado da arquitetura em 5 camadas.
- **`examples/react_typescript.md` & `expo.md`**: Exemplos para a versão MVVM Simplificada.
- **`references/camadas_explicadas.md`**: Explicação extremamente didática do papel de cada pasta (View, ViewModel, Model, Infra, Factories) através de analogias simples.
- **`references/padroes_estado.md`**: A regra exata de 5 passos para tratar erros sem usar `try/catch` na View.
- **`references/injecao_dependencias.md`**: Como criar e usar *Factories* para desacoplar a arquitetura e permitir testes unitários (Mocks).
