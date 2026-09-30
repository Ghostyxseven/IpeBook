# IpeBook 🌳📚

O **IpêBook** é uma projeto de plataforma comunitária para compra, venda, troca e doação de livros. Encontre livros disponíveis perto de você, compartilhe os que já leu e ajude novas histórias a circularem pela comunidade de forma simples e sustentável.

---

## 🛠 Tecnologias

Este aplicativo é construído utilizando as seguintes tecnologias:

- **React Native** / **Expo**: Framework para desenvolvimento móvel cruzado (iOS e Android).
- **TypeScript**: Adicionando tipagem estática e maior confiabilidade ao código.
- **Expo Router**: navegação do app Android e iOS ([ADR 0005](docs/adr/0005-navegacao-expo-router.md)).
- **Supabase Auth**: contas, confirmação de e-mail e recuperação de senha ([ADR 0006](docs/adr/0006-autenticacao-supabase.md)).

---

## 📐 Arquitetura: MVVM Simplificado (Padrão PDM)

O projeto adota rigorosamente a arquitetura **MVVM Simplificada**, ensinada na disciplina de Programação para Dispositivos Móveis (PDM). O objetivo é isolar a lógica de negócios da interface gráfica.

A estrutura de pastas (`src/`) divide as responsabilidades em:

- **Model (`model/`)**: Regras de negócio puras, entidades e acesso a dados (APIs, Firebase, etc). **Não conhece React ou UI**.
  - `entities/`
  - `services/`
  - `repositories/`
- **ViewModel (`viewmodel/`)**: Conecta o Model à View. Implementados como _Custom Hooks_, gerenciam o estado da tela (dados, erro, loading) e expõem funções, sem possuir elementos visuais (JSX).
- **View (`app/` e `view/`)**: Telas e componentes visuais. Somente renderiza os dados da ViewModel e aciona suas ações. **Não contém regras de negócio ou chamadas de API**.

_(Para mais detalhes, consulte o documento de decisão arquitetural: [ADR 0002](docs/adr/0002-adotar-mvvm-pdm.md))_

---

## 🔄 Fluxo de Desenvolvimento e Padrões

O projeto utiliza um conjunto estrito de ferramentas e regras para manter a qualidade e o histórico íntegros.

1.  **GitHub Spec Kit**: O desenvolvimento é orientado a especificações. Antes de implementar qualquer funcionalidade, ela deve ser especificada, planejada e validada.
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
| `/inicio`                              | Área autenticada (provisória)                      |

- `(auth)`: só sem sessão. `(app)`: só com sessão; **as outras features criam suas rotas aqui**.
- Componentes base: `src/view/components/ui/` (`Button`, `TextField`, `FormMessage`, `AuthLayout`) e estados em `src/view/components/feedback/` (`LoadingState`, `EmptyState`, `ErrorState`, `OfflineBanner`). Tema: `src/view/theme/nativeTheme.ts`.
- Injeção de dependências: `src/factories/auth.ts` liga as ViewModels ao Supabase. Nos testes, use `createMemoryAuthRepository`.
- Especificações: [base do app](specs/012-base-app-nativo/spec.md) e [autenticação](specs/013-autenticacao-onboarding/spec.md).

---

## 🎨 Design system e instruções para IA

- [Guia visual e de experiência](docs/design-system.md)
- [Foundations](docs/design-system/foundations.md)
- [Components e Patterns](docs/design-system/components-patterns.md)
- [Plataformas e Acessibilidade](docs/design-system/platforms-accessibility.md)
- [IA e Governança](docs/design-system/ai-governance.md)
- [Tokens de design em JSON](design-tokens.json)
- [Regras para agentes de IA](AGENTS.md)
- [Instruções do GitHub Copilot](.github/copilot-instructions.md)
- [Protótipo no Figma](https://www.figma.com/design/qSTmNLUhC6PwJlbyUmytbe?node-id=0-1)

Para implementar uma tela, informe a plataforma e o fluxo; por exemplo: “Implemente Descobrir no Android seguindo AGENTS.md, docs/design-system.md, design-tokens.json e o quadro Android do Figma”.

## Página institucional Web (`/`)

Apresenta o projeto, modalidades, como funciona e dúvidas. Documentos acessíveis em `/#termos`, `/#privacidade` e `/#lgpd`. As ações Entrar/Criar conta mostram um aviso: no site, autenticação e cadastro ainda não estão disponíveis. O site não coleta dados de cadastro (as contas existem só no aplicativo) e não usa cookies opcionais. Vercel Web Analytics e Speed Insights medem visitas e desempenho de forma agregada, como descrito na Política de Privacidade.

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
