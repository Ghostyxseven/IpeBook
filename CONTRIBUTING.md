# Guia de Contribuição do IpêBook

Bem-vindo! Para garantirmos que o projeto seja sustentável, todos os membros e IA's devem seguir estas regras:

## 1. Arquitetura (MVVM Simplificado)

Temos um ADR (`docs/adr/0002-adotar-mvvm-pdm.md`) documentando nossa arquitetura.
A regra de ouro é: **A interface não tem regras de negócio**.
Coloque os arquivos nas pastas corretas em `src/`.

## 2. Padrões de Código

Usamos **ESLint e Prettier** para formatação, e configuramos **Husky e lint-staged**.
Sempre que você tentar comitar, o código será validado e formatado automaticamente.

**Importações Absolutas:**
Nunca faça `import { User } from '../../../model/entities/User'`.
Use sempre o alias `@/`:
`import { User } from '@/model/entities/User'`

## 3. Branches e Commits

- NUNCA suba nada diretamente na `main`. A branch de trabalho coletivo é a `develop`.
- Crie sua feature branch a partir de develop: `git checkout -b feature/minha-feature`.
- **Commits:** Siga o Conventional Commits. Exemplo: `feat: adiciona componente de botão`. O Husky bloqueará commits fora do padrão.

## 4. Pull Requests

Ao abrir um PR para a `develop`, o próprio GitHub vai gerar um checklist (a partir do nosso template). Preencha-o integralmente para facilitar a revisão dos seus colegas!
