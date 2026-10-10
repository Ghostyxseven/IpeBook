# Plano — Painel de Moderação de Denúncias

## 1. Arquitetura e Estrutura de Arquivos

### A. Banco de Dados / Migração SQL

- Arquivo: `supabase/migrations/20261009120000_painel_moderacao_reports.sql`
- Funções a criar:
  - `public.is_moderator(user_id uuid)`
  - `public.admin_list_reports(p_status text default null)`
  - `public.admin_resolve_report(p_report_id uuid)`

### B. Camada Model

- `src/model/entities/Report.ts`:
  - Adicionar o tipo `ReportModerationItem`.
- `src/model/entities/SecurityError.ts`:
  - Incluir código de erro `'unauthorized'`.
- `src/model/repositories/SecurityRepository.ts`:
  - Adicionar contratos: `isModerator()`, `listModerationReports()`, `resolveReport()`.
- `src/model/repositories/memorySecurityRepository.ts`:
  - Implementar suporte em memória para moderador e lista de denúncias detalhadas.
- `src/model/repositories/supabaseSecurityRepository.ts`:
  - Implementar chamadas às RPCs com mapeamento de erros.
- `src/model/services/securityFormat.ts`:
  - Funções de formatação de badges de status e rótulos da moderação.

### C. Camada ViewModel & Factory

- `src/viewmodel/useModerationReportsViewModel.ts`:
  - Gerenciamento de carregamento, lista de denúncias, filtro selecionado, estado de resolução, repetição (_retry_) e mensagens de erro.
- `src/factories/security.ts`:
  - Exportar hook `useModerationReports()`.

### D. Camada View & Rotas

- `src/view/screens/security/ModerationReportsScreen.tsx`:
  - Interface do painel com abas/chips de filtro, cards de denúncia e diálogo de confirmação.
- `src/app/(app)/seguranca/moderacao.tsx`:
  - Rota de navegação Expo Router.
- `src/view/screens/settings/SettingsScreen.tsx`:
  - Link de atalho para o painel de moderação.

### E. Testes Automatizados

- Criar `tests/moderation.test.mjs`:
  - Testes do repositório em memória e Supabase.
  - Testes da ViewModel e suas transições de estado.
- Executar `npm run verify` para validar types, lint, format e testes.
