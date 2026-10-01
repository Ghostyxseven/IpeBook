# Plano

Depende do [ADR 0011](../../docs/adr/0011-entrega-de-notificacoes.md), do [ADR 0002](../../docs/adr/0002-adotar-mvvm-pdm.md) (MVVM) e das features de negociação (#38) e perfil (#37). Sem dependências novas de pacote.

## Model

- `entities/Notification.ts`: `AppNotification` (`id`, `kind`, `title`, `body`, `targetListingId`, `readAt`, `createdAt`) e `NotificationKind` (`request_received`, `request_accepted`, `request_declined`, `listing_reserved`, `deal_completed`).
- `entities/NotificationPreferences.ts`: um booleano por `NotificationKind`.
- `services/notificationFormat.ts`: data relativa, rótulo acessível ("não lida") e texto do contador.
- `services/notificationMessages.ts`: código de erro → mensagem em português.
- `repositories/NotificationRepository.ts`: `list({ cursor, limit })`, `unreadCount()`, `markRead(id)`, `markAllRead()`, `getPreferences()` e `setPreference(kind, enabled)`.
- `repositories/supabaseNotificationRepository.ts` e `memoryNotificationRepository.ts`.
- Migração `supabase/migrations/…_notificacoes.sql`: tabela `notifications` e `notification_preferences` com RLS pelo `auth.uid()`; a criação dos avisos fica em gatilhos da negociação (ADR 0011).

## ViewModels

- `useNotificationsViewModel(repo)`: carregar, paginar, atualizar, marcar uma ou todas como lidas com reversão em caso de falha.
- `useUnreadCountViewModel(repo)`: contador para o ícone de acesso.
- `useSettingsViewModel(repo, session)`: preferências, versão do app e Sair.
- Montagem em `src/factories/notifications.ts`.

## Views

- Rotas finas em `src/app/(app)/`: `notificacoes.tsx` e `configuracoes.tsx`, que só reexportam telas.
- `view/screens/notifications/NotificationsScreen.tsx`, `view/components/notifications/NotificationItem.tsx` e `view/screens/settings/SettingsScreen.tsx`, com tokens de `design-tokens.json`, ícones `expo-symbols` (ADR 0009) e componentes existentes (Empty State, banner de conexão).

## Riscos

- Os gatilhos dependem do modelo de negociação do Antonio; combinar os nomes dos eventos antes da migração.
- Quadro 35 do Figma ainda não conferido (ver spec).
