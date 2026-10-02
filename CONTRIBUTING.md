# Guia de Contribuição do IpêBook

Bem-vindo! Para garantirmos que o projeto seja sustentável, todos os membros e IA's devem seguir estas regras. Agentes de IA seguem também o [`AGENTS.md`](AGENTS.md); os princípios gerais estão na [constituição](.specify/memory/constitution.md).

## 1. Arquitetura (MVVM Simplificado)

Temos um ADR (`docs/adr/0002-adotar-mvvm-pdm.md`) documentando nossa arquitetura.
A regra de ouro é: **A interface não tem regras de negócio**.
Coloque os arquivos nas pastas corretas em `src/`: `model/`, `viewmodel/`, `view/` e `app/`. O que depende da plataforma ou de SDKs (cliente Supabase, armazenamento, câmera) fica em `src/infra/` e é injetado pelas factories em `src/factories/` ([ADR 0012](docs/adr/0012-camada-de-infraestrutura.md)). O teste `tests/architecture.test.mjs` barra importações proibidas.

## 2. Especificação antes do código (Spec Kit)

Cada funcionalidade tem uma pasta em `specs/` e passa por especificar → planejar → decompor em tarefas → implementar → verificar. Registre no `verify.md` da spec o que foi conferido e o que ficou pendente (aparelho real, leitor de tela, Figma).

## 3. Decisões (ADRs)

Decisões de arquitetura, biblioteca, modelo de dados ou hospedagem recebem um ADR em `docs/adr/` (contexto, decisão, alternativas e consequências) e uma linha em `docs/adr/index.md`. Se a decisão mudar, atualize o ADR antigo apontando para o novo.

## 4. Padrões de Código

Usamos **ESLint e Prettier** para formatação, e configuramos **Husky e lint-staged**.
Sempre que você tentar comitar, o código será validado e formatado automaticamente.

Antes de abrir o PR, rode:

```bash
npm run verify     # tipos, lint, formatação e testes (o CI repete)
```

**Importações Absolutas:**
Nunca faça `import { User } from '../../../model/entities/User'`.
Use sempre o alias `@/`:
`import { User } from '@/model/entities/User'`

## 5. Interface e acessibilidade

Siga o [design system](docs/design-system.md) e o `design-tokens.json`: não crie cor, medida, raio ou ícone fora dos tokens. Garanta alvos de 48 × 48 px, rótulos acessíveis, foco visível na Web e estados de carregamento, vazio, erro e sem conexão. Divergências intencionais do Figma vão no PR e, se forem duradouras, em [`docs/design-system/divergencias.md`](docs/design-system/divergencias.md).

## 6. Branches e Commits

- NUNCA suba nada diretamente na `main`. A branch de trabalho coletivo é a `develop`.
- Crie sua feature branch a partir de develop: `git checkout -b feature/minha-feature`.
- **Commits:** Siga o Conventional Commits. Exemplo: `feat: adiciona componente de botão`. O Husky bloqueará commits fora do padrão.

## 7. Pull Requests

Ao abrir um PR para a `develop`, o próprio GitHub vai gerar um checklist (a partir do nosso template). Preencha-o integralmente para facilitar a revisão dos seus colegas!
