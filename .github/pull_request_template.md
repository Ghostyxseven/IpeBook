## O que foi feito?

- Descreva as mudanças realizadas neste PR.

## Feature Envolvida

- Qual a feature/domínio? (Ex: Autenticação, Exploração, etc)
- Spec: `specs/NNN-...` · ADR (se houver): `docs/adr/NNNN-...`

## Checklist de Qualidade (MVVM & Padrões)

- [ ] O código respeita a arquitetura MVVM Simplificado (Padrão PDM).
- [ ] A View não contém lógicas de negócio ou chamadas de API (tudo está na ViewModel ou Service).
- [ ] O Model não contém nenhuma importação do React ou elementos visuais.
- [ ] Utilizei importações absolutas (ex: `@/model/...`) em vez de relativas.
- [ ] `npm run verify` passou localmente (tipos, lint, formatação e testes).

## Processo

- [ ] A spec foi atualizada e o `verify.md` registra o que foi conferido e o que ficou pendente.
- [ ] Decisões novas de arquitetura, biblioteca ou dados têm ADR.

## Design e acessibilidade

- [ ] Usei tokens de `design-tokens.json`, sem cores, medidas ou ícones novos.
- [ ] Alvos de 48 × 48, rótulos acessíveis, foco visível na Web e estados que não dependem só de cor.
- [ ] Estados de carregamento, vazio, erro e sem conexão, quando aplicáveis.
- [ ] Divergências do Figma listadas abaixo (ou nenhuma).

## Testes Realizados

- [ ] Testado no Android.
- [ ] Testado no iOS (se possível).
- [ ] Testado na Web.

## Telas/Anexos

_(Se houver mudanças visuais, inclua prints ou vídeos aqui. Liste divergências do Figma.)_
