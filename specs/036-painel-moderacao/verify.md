# Verificação — Painel de Moderação de Denúncias

## 1. Verificações Automatizadas

- `typecheck`: `tsc --noEmit` — 0 erros.
- `lint`: `eslint . --ext .js,.mjs` — 0 erros.
- `format`: `prettier --check ...` — 100% formatado.
- `tests`: `node --test tests/*.test.mjs` — 386 testes aprovados (0 falhas).

## 2. Evidências de Teste

- `tests/moderation.test.mjs`:
  - Formatação de textos e mensagens de erro do domínio (`unauthorized`, `not_found`).
  - Repositório em memória com verificação de `isModerator()`, bloqueio de acesso a não moderadores, listagem com filtros (`pending`/`resolved`/`all`) e resolução atômica de denúncia.
  - Repositório Supabase com mapeamento de erro 42501 e chamada de RPCs `admin_list_reports` e `admin_resolve_report`.
  - ViewModel `useModerationReportsViewModel`: ciclo de vida completo de carga, filtragem por chips, abertura de diálogo de confirmação, resolução de denúncia com atualização reativa dos contadores e tratamento de erro.
  - Acesso não autorizado levando a estado visual `unauthorized`.

## 3. Estado Final

- Implementação concluída e verificada conforme ADR 0034 e Spec 036.
