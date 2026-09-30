# IpeBook 🌳📚

O **IpêBook** é uma projeto de plataforma comunitária para compra, venda, troca e doação de livros. Encontre livros disponíveis perto de você, compartilhe os que já leu e ajude novas histórias a circularem pela comunidade de forma simples e sustentável.

---

## 🛠 Tecnologias

Este aplicativo é construído utilizando as seguintes tecnologias:

- **React Native** / **Expo**: Framework para desenvolvimento móvel cruzado (iOS e Android).
- **TypeScript**: Adicionando tipagem estática e maior confiabilidade ao código.

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

2. **Inicie o servidor do Expo:**

   ```bash
   npx expo start
   ```

3. **Abra o aplicativo:**
   - **Web:** Pressione `w` no terminal para abrir o aplicativo no seu navegador.
   - **Android:** Pressione `a` no terminal para rodar no emulador Android.
   - **iOS:** Pressione `i` no terminal para rodar no simulador iOS (somente macOS).
   - **Dispositivo físico:** Baixe o aplicativo "Expo Go" no seu celular e escaneie o QR Code exibido no terminal.

---

## 🎨 Design system e instruções para IA

- [Guia visual e de experiência](docs/design-system.md)
- [Tokens de design em JSON](design-tokens.json)
- [Regras para agentes de IA](AGENTS.md)
- [Instruções do GitHub Copilot](.github/copilot-instructions.md)
- [Protótipo no Figma](https://www.figma.com/design/qSTmNLUhC6PwJlbyUmytbe?node-id=0-1)

Para implementar uma tela, informe a plataforma e o fluxo; por exemplo: “Implemente Descobrir no Android seguindo AGENTS.md, docs/design-system.md, design-tokens.json e o quadro Android do Figma”.

## Página institucional Web (`/`)

Apresenta o projeto, modalidades, como funciona e dúvidas. Documentos acessíveis em `/#termos`, `/#privacidade` e `/#lgpd`. As ações Entrar/Criar conta mostram um aviso: autenticação e cadastro ainda não estão disponíveis. Nenhum dado de cadastro é coletado e não há analytics ou cookies opcionais no código.

A entrada Web (`App.web.tsx` → `src/app/index.web.tsx`) só encaminha para `src/view/screens/InstitutionalScreen.web.tsx`. Componentes e estilos ficam na View; estado em `src/viewmodel/useInstitutionalViewModel.ts`; documentos e resolução de destinos no Model. A entrada nativa permanece independente.

```bash
npm run web
npm run typecheck
npm test
npm run format:check
npm run build:web
python3 -m http.server 8082 --bind 127.0.0.1 --directory dist
```

O teste da ViewModel usa jsdom do ambiente compartilhado descrito em `/home/usermicael/.local/share/ia-integracoes/qualidade/README.md`; em outro computador, informe `IPEBOOK_JSDOM_PATH` com o caminho absoluto para `jsdom/lib/api.js`. Os testes Node usam suporte nativo a TypeScript (Node 22.18+; validados em Node 26.8.2). O aplicativo não depende desse ambiente de testes em produção.

Abra `http://localhost:8082` para verificar o build. A apresentação usa JavaScript e ainda não tem pré-renderização para SEO. Fonte Roboto servida localmente sob licença OFL em `public/fonts/Roboto-LICENSE.txt`.

**Documentos preliminares:** antes de publicar/operar, definir responsável/controlador, canal de atendimento, hospedagem, eventuais logs e tratamento de dados. Os textos não certificam conformidade com a LGPD. Ver [especificação](specs/001-pagina-institucional/spec.md), [plano](specs/001-pagina-institucional/plan.md) e [ADR 0004](docs/adr/0004-pagina-institucional-web.md).

## Apresentação em livro

A apresentação Web tem sete capítulos, sumário, virada lateral e guias de compra, venda, troca e doação. A estante permite buscar, filtrar e abrir exemplos fictícios. Isso não habilita anúncios reais, compras, pagamentos ou mensagens. A navegação continua lateral; conteúdo longo pode ser rolado dentro da folha.

- Componente principal: `src/view/components/InstitutionalBook.tsx`.
- Navegação e animação: `BookPresentation.tsx` e `useBookNavigation.ts`.
- Conteúdo demonstrativo: `src/model/services/bookExperience.ts`; estado em `useBookExperience.ts`.
- Especificação e verificação: [livro enriquecido](specs/003-livro-conteudo/spec.md) e [resultados](specs/003-livro-conteudo/verify.md).

Os scripts `scripts/verificar-livro.js` e `scripts/verificar-conteudo-livro.js` podem ser executados pelo MCP Playwright (`browser_run_code_unsafe`, parâmetro `filename`). Eles esperam a exportação em `http://localhost:8081`; para preparar essa prévia, use `python3 -m http.server 8081 --bind 127.0.0.1 --directory dist` após `npm run build:web`, ou ajuste a porta dos scripts à prévia já em execução. O roteiro institucional original está em `scripts/verificar-web.js` e usa a porta 8082.
