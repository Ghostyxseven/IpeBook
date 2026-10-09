# 34. Painel de Moderação de Denúncias

- **Status:** Aceito
- **Data:** 2026-10-09

## Contexto

O IpêBook possui um sistema de segurança comunitária (ADR 0017 e spec 027) que permite aos usuários autenticados denunciar anúncios com problemas ou pessoas com condutas ofensivas/golpes. Os registros são gravados na tabela `public.reports`.

Entretanto, as denúncias ficavam apenas registradas no banco de dados com status `pending`, sem uma interface administrativa ou fluxo seguro para que moderadores possam auditar, filtrar e marcar denúncias como resolvidas diretamente pelo aplicativo ou painel web.

## Decisão

1. **Controle de Acesso de Moderação:**
   - Criar uma verificação de permissão no PostgreSQL (`public.is_moderator(user_id)`) baseada em metadados de autenticação (`app_metadata->>'role' = 'moderator'` ou lista explícita de moderadores autorizados).
   - O acesso às denúncias de terceiros é bloqueado para usuários comuns por RLS e pelas funções de backend.

2. **RPCs Seguras de Administração:**
   - `public.admin_list_reports(p_status text)`: Função `security definer` que retorna a lista de denúncias com o contexto expandido (primeiro nome do denunciante, primeiro nome da pessoa denunciada, título do anúncio denunciado, motivo, detalhes, status e data de criação).
   - `public.admin_resolve_report(p_report_id uuid)`: Função `security definer` que transiciona o status da denúncia de `pending` para `resolved`.

3. **Arquitetura MVVM e Repositório:**
   - Estender `SecurityRepository` com os métodos `isModerator()`, `listModerationReports(status)` e `resolveReport(reportId)`.
   - Implementar no repositório em memória (`memorySecurityRepository.ts`) para testes rápidos e isolados.
   - Implementar no repositório Supabase (`supabaseSecurityRepository.ts`) integrando com as RPCs.
   - Criar o hook de apresentação `useModerationReportsViewModel` para gerenciar carregamento, filtros (`pending`, `resolved`, `all`), confirmações de resolução e mensagens de erro.

4. **Interface e Acessibilidade:**
   - Criar a tela `ModerationReportsScreen` e a rota `/(app)/seguranca/moderacao`.
   - Disponibilizar filtros por abas/chips, badges semânticos de status (Pendente / Resolvida) e diálogo de confirmação antes de concluir a moderação.
   - Respeitar todos os tokens visuais de `nativeTheme.ts` e padrões de acessibilidade WCAG AA (alvos de toque de 48×48 px, rótulos descritivos para leitores de tela).

## Consequências

- **Positivas:**
  - Moderadores podem auditar e agir prontamente sobre conteúdos abusivos e golpes na comunidade.
  - Segurança reforçada: dados sensíveis de denúncias não vazam para usuários comuns, protegidos por verificação estrita de papéis no banco.
  - Totalmente testável em memória sem necessidade de chamadas externas de rede.
- **Limitações:**
  - A atribuição inicial do papel de moderador continua sendo gerida no backend/Supabase Auth (`app_metadata`).
