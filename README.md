# IpeBook 🌳📚

O **IpêBook** é um projeto de plataforma comunitária para compra, venda, troca e doação de livros. Encontre livros disponíveis perto de você, compartilhe os que já leu e ajude novas histórias a circularem pela comunidade de forma simples e sustentável.

---

## 🛠 Tecnologias

Este aplicativo é construído utilizando as seguintes tecnologias:

- **React Native** / **Expo**: Framework para desenvolvimento móvel cruzado (iOS, Android e Web).
- **TypeScript**: Adicionando tipagem estática e maior confiabilidade ao código.
- **Expo Router**: navegação do app Android e iOS ([ADR 0005](docs/adr/0005-navegacao-expo-router.md)).
- **Supabase**: contas com código por e-mail ([ADR 0006](docs/adr/0006-autenticacao-supabase.md)), anúncios em Postgres com RLS e capas no Storage ([ADR 0008](docs/adr/0008-modelo-de-anuncios-supabase.md) e [ADR 0014](docs/adr/0014-gestao-de-anuncios.md)) e notificações dentro do app ([ADR 0011](docs/adr/0011-entrega-de-notificacoes.md)). Migrações em [`supabase/`](supabase/README.md).
- **EAS Build**: binários Android gerados na nuvem ([ADR 0015](docs/adr/0015-build-e-distribuicao-android.md) e [guia](docs/build-android.md)).
- **Vercel**: hospedagem da página institucional Web ([ADR 0007](docs/adr/0007-qualidade-automatizada-e-hospedagem.md)).

## 📍 Estado atual

| Área                                                                  | Situação                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Página institucional Web                                              | Pronta: livro interativo, estante de exemplos fictícios, documentos legais e modo leitura (specs 001 a 023) |
| Autenticação e onboarding                                             | Implementada (spec 014)                                                                                     |
| Catálogo: Início, Explorar, busca, filtros e detalhe                  | Implementado (spec 018)                                                                                     |
| Anúncios: publicar, editar, arquivar, excluir, Minha estante e Perfil | Implementado (specs 025 e 026)                                                                              |
| Notificações no app e Configurações                                   | Implementadas (spec 024)                                                                                    |
| Negociação, encontro, denúncia e bloqueio                             | **Ainda não implementados** (issues #38 e #40)                                                              |

As telas do app ainda não foram validadas em aparelho real (ver os `verify.md` das specs). Responsáveis por feature: [divisão de features](docs/DIVISAO_FEATURES.md).

---

## 📐 Arquitetura: MVVM Simplificado (Padrão PDM)

O projeto adota rigorosamente a arquitetura **MVVM Simplificada**, ensinada na disciplina de Programação para Dispositivos Móveis (PDM). O objetivo é isolar a lógica de negócios da interface gráfica.

A estrutura de pastas (`src/`) divide as responsabilidades em:

- **Model (`model/`)**: Regras de negócio puras, entidades e acesso a dados (repositórios Supabase e em memória). **Não conhece React ou UI**.
  - `entities/`
  - `services/`
  - `repositories/`
- **ViewModel (`viewmodel/`)**: Conecta o Model à View. Implementados como _Custom Hooks_, gerenciam o estado da tela (dados, erro, loading) e expõem funções, sem possuir elementos visuais (JSX).
- **View (`app/` e `view/`)**: Telas e componentes visuais. Somente renderiza os dados da ViewModel e aciona suas ações. **Não contém regras de negócio ou chamadas de API**.
- **Infra (`infra/`)** e **Factories (`factories/`)**: cliente Supabase, armazenamento local e recursos da plataforma ficam em `infra/`; as factories montam repositórios e ViewModels ([ADR 0012](docs/adr/0012-camada-de-infraestrutura.md)). `tests/architecture.test.mjs` garante que o Model não importa React, React Native ou Expo e que a View não importa repositórios.

_(Para mais detalhes, consulte o documento de decisão arquitetural: [ADR 0002](docs/adr/0002-adotar-mvvm-pdm.md))_

---

## 🔄 Fluxo de Desenvolvimento e Padrões

O projeto utiliza um conjunto estrito de ferramentas e regras para manter a qualidade e o histórico íntegros.

1.  **GitHub Spec Kit**: O desenvolvimento é orientado a especificações (`specs/`). Antes de implementar qualquer funcionalidade, ela deve ser especificada, planejada e validada; o resultado da verificação fica no `verify.md` da spec.
2.  **Architecture Decision Records (ADRs)**: Qualquer decisão de engenharia importante fica registrada na pasta `docs/adr/`.
3.  **Git e Versionamento**:
    - **Branches**: A branch `main` é sagrada (produção). O desenvolvimento contínuo ocorre na `develop`. Toda nova funcionalidade deve ser feita em uma _feature branch_ (ex: `feature/nova-tela`) a partir da `develop`.
    - **Commits**: Utilizamos o **Conventional Commits** (ex: `feat:`, `fix:`, `docs:`, `chore:`).

_(Para detalhes de versionamento, veja o [ADR 0003](docs/adr/0003-estrategia-de-git-e-commits.md))_

---

## 🚀 Como rodar o projeto localmente

Siga as instruções abaixo para rodar o app no seu simulador ou dispositivo físico:

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Configure o Supabase:** copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API). No painel, mantenha **Confirm email** ligado e inclua `{{ .Token }}` nos modelos **Confirm signup** e **Reset password**, para o e-mail trazer o código. Sem o `.env`, o app abre, mas as telas de conta avisam que a autenticação não foi configurada.

3. **Inicie o servidor do Expo:**

   ```bash
   npx expo start
   ```

4. **Abra o aplicativo:**
   - **Web:** Pressione `w` no terminal para abrir o aplicativo no seu navegador.
   - **Android:** Pressione `a` no terminal para rodar no emulador Android.
   - **iOS:** Pressione `i` no terminal para rodar no simulador iOS (somente macOS).
   - **Dispositivo físico:** Baixe o aplicativo "Expo Go" no seu celular e escaneie o QR Code exibido no terminal.

---

## 📱 Aplicativo (Android e iOS)

A entrada `index.js` carrega o Expo Router; as rotas ficam em `src/app/` e só reexportam telas de `src/view/screens/`.

| Rota                                   | Tela                                               |
| -------------------------------------- | -------------------------------------------------- |
| `/`                                    | Abertura: decide entre onboarding, Entrar e Início |
| `/onboarding`                          | Apresentação na primeira abertura                  |
| `/entrar`, `/criar-conta`              | Entrar e cadastro                                  |
| `/verificar-email`, `/recuperar-senha` | Códigos enviados por e-mail                        |
| `/inicio`, `/explorar`                 | Abas do catálogo: feed e busca com filtros         |
| `/estante`, `/perfil`                  | Abas de Minha estante e Perfil                     |
| `/livro/[id]`                          | Detalhe do livro                                   |
| `/anunciar`, `/anunciar/[id]`          | Publicar e editar anúncio                          |
| `/notificacoes`, `/configuracoes`      | Avisos e preferências (sem entrada nas telas hoje) |

- `(auth)`: só sem sessão. `(app)`: só com sessão; **as outras features criam suas rotas aqui**.
- Componentes base: `src/view/components/ui/` (`Button`, `TextField`, `FormMessage`, `AuthLayout`) e estados em `src/view/components/feedback/` (`LoadingState`, `EmptyState`, `ErrorState`, `OfflineBanner`). Componentes de domínio em `components/catalog/` (`BookCard`, `BookTile`, `StatusBadge`, `ModalityChip`, `SearchBar`), `components/listings/` e `components/notifications/`. Tema: `src/view/theme/nativeTheme.ts`.
- Injeção de dependências: `src/factories/` (`auth`, `catalog`, `listings`, `notifications`) liga as ViewModels ao Supabase. Nos testes, use os repositórios em memória (`memory*Repository`).
- Especificações: [base do app](specs/013-base-app-nativo/spec.md), [autenticação](specs/014-autenticacao-onboarding/spec.md), [catálogo](specs/018-catalogo-descoberta/spec.md), [notificações e configurações](specs/024-configuracoes-notificacoes/spec.md), [anúncios](specs/025-anuncios-gestao/spec.md) e [perfil](specs/026-perfil-minimo/spec.md).

## ✅ Verificação

```bash
npm run verify     # tipos, lint, formatação e testes
npm run build:web  # exportação estática (pasta dist)
```

O CI (`.github/workflows/ci.yml`) executa esses passos em cada PR. Veja o [ADR 0007](docs/adr/0007-qualidade-automatizada-e-hospedagem.md).

---

## 🎨 Design system e instruções para IA

- [Guia visual e de experiência](docs/design-system.md)
- [Foundations](docs/design-system/foundations.md)
- [Components e Patterns](docs/design-system/components-patterns.md)
- [Plataformas e Acessibilidade](docs/design-system/platforms-accessibility.md)
- [IA e Governança](docs/design-system/ai-governance.md)
- [Divergências entre tokens e referência](docs/design-system/divergencias.md)
- [Referência do design system publicado](docs/design-system/referencia/LEIA-ME.md)
- [Tokens de design em JSON](design-tokens.json)
- [Regras para agentes de IA](AGENTS.md)
- [Instruções do GitHub Copilot](.github/copilot-instructions.md)
- [Protótipo no Figma](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile?node-id=20-207)

Para implementar uma tela, informe a plataforma e o fluxo; por exemplo: “Implemente Descobrir no Android seguindo AGENTS.md, docs/design-system.md, design-tokens.json e o quadro Android do Figma”.

## Página institucional Web (`/`)

Apresenta o projeto, modalidades, como funciona e dúvidas. Documentos acessíveis em `/termos`, `/privacidade`, `/lgpd` e `/seguranca` (links antigos como `/#privacidade` redirecionam). As ações Entrar/Criar conta mostram um aviso: no site, autenticação e cadastro ainda não estão disponíveis. O site não coleta dados de cadastro (as contas existem só no aplicativo) e não usa cookies opcionais. Vercel Web Analytics e Speed Insights medem visitas e desempenho de forma agregada, como descrito na Política de Privacidade.

A entrada Web (`index.web.js`) registra `src/view/screens/InstitutionalScreen.web.tsx`, sem o Expo Router, para manter o JavaScript inicial pequeno (ADR 0005). Componentes e estilos ficam na View; estado em `src/viewmodel/useInstitutionalViewModel.ts`; documentos e resolução de destinos no Model.

```bash
npm run web
npm run typecheck
npm test
npm run format:check
npm run build:web
python3 -m http.server 8082 --bind 127.0.0.1 --directory dist
```

Os testes de ViewModel usam `jsdom`, instalado como dependência de desenvolvimento. Os testes Node usam suporte nativo a TypeScript (Node 22.18+; validados em Node 26.8.2). O aplicativo não depende desse ambiente de testes em produção.

Abra `http://localhost:8082` para verificar o build. A apresentação usa JavaScript e ainda não tem pré-renderização para SEO. Fonte Roboto servida localmente sob licença OFL em `public/fonts/Roboto-LICENSE.txt`.

**Documentos preliminares:** antes de publicar/operar, definir responsável/controlador, canal de atendimento, hospedagem, eventuais logs e tratamento de dados. Os textos não certificam conformidade com a LGPD. Ver [especificação](specs/001-pagina-institucional/spec.md), [plano](specs/001-pagina-institucional/plan.md) e [ADR 0004](docs/adr/0004-pagina-institucional-web.md).

## Apresentação em livro

A apresentação Web tem sete capítulos, sumário, virada lateral e guias de compra, venda, troca e doação. A estante permite buscar, filtrar e abrir exemplos fictícios. Isso não habilita anúncios reais, compras, pagamentos ou mensagens. A navegação continua lateral; conteúdo longo pode ser rolado dentro da folha.

- Componente principal: `src/view/components/InstitutionalBook.tsx`.
- Navegação e animação: `BookPresentation.tsx` e `useBookNavigation.ts`.
- Conteúdo demonstrativo: `src/model/services/bookExperience.ts`; estado em `useBookExperience.ts`.
- Especificação e verificação: [livro enriquecido](specs/003-livro-conteudo/spec.md) e [resultados](specs/003-livro-conteudo/verify.md).

Os scripts `scripts/verificar-livro.js` e `scripts/verificar-conteudo-livro.js` podem ser executados pelo MCP Playwright (`browser_run_code_unsafe`, parâmetro `filename`). Eles esperam a exportação em `http://localhost:8082`; para preparar essa prévia, use `python3 -m http.server 8082 --bind 127.0.0.1 --directory dist` após `npm run build:web`, ou ajuste a porta dos scripts à prévia já em execução. O roteiro institucional original está em `scripts/verificar-web.js` e usa a mesma porta.
