# 🌳 Histórico e Documentação da Branch

**Branch:** `feature/pagina-institucional-pr`

## 🎯 Visão Geral

Esta documentação descreve o escopo, as decisões técnicas e as entregas realizadas durante o desenvolvimento da **Página Institucional Web** do IpêBook.

O objetivo desta branch não foi apenas criar uma "landing page" estática, mas desenvolver uma experiência imersiva ("Book Experience") que simula um livro interativo. Isso permite ao usuário folhear as páginas, consultar a estante de livros e ler os documentos legais do projeto de forma fluida, responsiva e totalmente alinhada ao Design System.

---

## 📦 O que foi entregue nesta branch?

### 1. A Experiência Interativa do Livro (Web)

- **Navegação 3D:** Desenvolvemos um motor visual focado no DOM que simula fisicamente o virar de páginas de um livro, permitindo navegar de forma fluida entre os capítulos institucionais.
- **Estante Interativa:** Implementamos uma estante virtual com busca e filtros visuais para exibir os livros disponíveis (usando dados simulados para demonstração).
- **Identidade Visual (UI/UX):** Aplicação de conceitos de _Glassmorphism_ (efeito de vidro translúcido), novo logotipo e uso consistente e estrito dos tokens de design em `design-tokens.json`.

### 2. Otimização Profunda para Mobile (Responsividade)

A experiência do livro precisava parecer nativa e natural nos celulares. Para isso, realizamos:

- **Cards e Filtros Touch:** A estante foi totalmente reorganizada em formato de _cards_ e botões grandes amigáveis ao toque.
- **Gestos de Navegação (Swipes):** Implementação de um guia animado ("swipe indicator") que ensina o usuário a arrastar a tela para trocar de página, além da física do gesto em si.
- **Limpeza de Layout:** Ocultamento de botões físicos desnecessários para limpar a tela pequena, reposicionamento da fita marcadora de página e adição de uma área de segurança ("respiro") em volta da capa do livro.

### 3. Transparência e Documentos Legais

- **Páginas de Privacidade e LGPD:** Estruturação visual focada em legibilidade e navegação para os documentos legais, essenciais para a segurança da comunidade.
- **Comunicação Honesta:** Inclusão de avisos visuais deixando claro que os textos atuais são preliminares e que o cadastro/coleta de dados ainda não está ativo (conforme formalizado no documento ADR 0004).

---

## 📋 Especificações (Spec Kit) Atendidas

Seguindo o rigor do **GitHub Spec Kit**, todas as entregas passaram pelo fluxo de especificação antes da implementação:

- **Specs 002 e 003:** Estruturação da navegação central do livro, layout estrutural das páginas e conteúdo da estante.
- **Spec 015:** Profissionalização técnica: CI, testes portáteis, cabeçalhos de segurança, zoom liberado e metadados de compartilhamento.
- **Spec 004:** Implementação da tela e revisão semântica dos documentos legais.
- **Specs 005 a 008:** Refinamentos massivos de usabilidade e visualização mobile (sumário adaptado, espaçamentos, feedbacks visuais).
- **Spec 009 (concluída):** Desacoplamento da lógica de gestos touch e animações 3D para um _controller_ isolado, mantendo a View limpa e ganhando performance.
- **Spec 010 (implementada; `verify.md` pendente):** Separação da renderização dos documentos legais em um componente modular (`LegalDocumentContent.tsx`).

---

## 📐 Respeito à Arquitetura (MVVM Simplificado - PDM)

O desenvolvimento aderiu rigorosamente à arquitetura definida para o projeto, sem desvios:

- **Model:** Os serviços (`institutional.ts`, `bookExperience.ts`) lidam exclusivamente com o provimento dos dados brutos (textos legais, livros falsos), sem qualquer conhecimento sobre como a tela será desenhada.
- **ViewModel:** O Hook de controle `useInstitutionalViewModel.ts` orquestra o estado da navegação institucional e o documento selecionado, blindando a lógica e sem acoplar HTML/JSX.
- **View:** As telas e componentes (ex: `InstitutionalScreen.web.tsx`, `BookPresentation.tsx`) permaneceram puramente visuais, encarregados apenas de consumir o estado da ViewModel e despachar intenções (cliques/gestos).

---

## 🛠️ Automação, Testes e Qualidade

Para garantir a estabilidade do trabalho feito:

- Configuração de CI/CD para deploy estático web automatizado via **Vercel** (`build:web`).
- Criação e integração de scripts locais (`scripts/verificar-documentos.js` e `scripts/verificar-gesto-livro.mjs`) que operam em integração direta para proteger as regras de navegação 3D e as lógicas de renderização contra regressões futuras.
