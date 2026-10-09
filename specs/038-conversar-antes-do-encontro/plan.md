# Plano

## Banco

Migração `20261009130000_conversar_antes_do_encontro.sql` (ADR 0034):

- `alter table book_requests` torna `public_location`, `meeting_date` e
  `meeting_time` opcionais.
- `propose_meeting(request_id, new_location, new_date, new_time)` — espelho de
  `reschedule_book_request`, mas para `pending` sem encontro ainda; qualquer um
  dos dois lados pode chamar.
- `transition_book_request` ganha a trava: não aceita (`accepted`) sem
  `public_location` preenchido.

## Model

- `entities/BookRequest.ts`: `publicLocation`/`meetingDate`/`meetingTime` viram
  `string | null`.
- `repositories/BookRequestRepository.ts`: `MeetingChange` explícito (não nasce
  mais de `Pick<BookRequest,...>`, já que a entidade aceita null); novo método
  `proposeMeeting`.
- `repositories/supabaseBookRequestRepository.ts` e
  `memoryBookRequestRepository.ts`: `proposeMeeting` implementado nos dois
  (RPC `propose_meeting` / regra equivalente em memória).
- `services/bookRequestFormat.ts`: `meetingDateLabel`, `meetingTimeLabel`,
  `meetingDayLabel`, `meetingHourLabel` aceitam `string | null` e devolvem algo
  sensato (`null` ou string vazia) em vez de quebrar; nova `proposedMeetingCopy`.

## ViewModel

- `useStartConversationViewModel.ts` (novo): cria a negociação sem encontro (ou
  reabre a pendente existente) e expõe `startedId` para a tela navegar.
- `useProposeMeetingViewModel.ts` (novo): clone de `useRescheduleViewModel`, só
  que parte de `pending` sem local em vez de `accepted`, e chama
  `proposeMeeting` em vez de `reschedule`.

## View

- `screens/catalog/ListingDetailScreen.tsx`: botão "Conversar" (secundário) ao
  lado do botão principal, quando `canNegotiate`.
- `screens/negotiation/ProposeMeetingScreen.tsx` (novo): clone de
  `RescheduleScreen.tsx` com os textos ajustados.
- `screens/negotiation/BookRequestDetailScreen.tsx`: no estado `pending`, troca
  o cartão do encontro por "Propor encontro" quando `publicLocation` é nulo;
  esconde "Aceitar" até existir encontro.
- Rota `app/(app)/negociacoes/[id]/propor-encontro.tsx`.
- `factories/bookRequest.ts`: `useStartConversation`, `useProposeMeeting`.

## Decisões

1. **Tela própria em vez de generalizar `RescheduleScreen`.** Misturar os dois
   modos (reagendar vs propor) na mesma ViewModel arriscava quebrar o
   reagendamento, que já tinha testes e uso real. Duplicar um arquivo pequeno
   custou menos do que o risco.
2. **A regra de "sem encontro não aceita" mora no banco.** A tela também esconde
   o botão, mas quem decide é a função SQL — mesmo padrão já usado para
   avaliações (ADR 0027) e a própria aceitação (ADR 0018).
3. **Troca também usa "Conversar" sem oferta nenhuma.** `offeredListingId` fica
   nulo até a contraproposta (ADR 0030) escolher um livro depois — nada novo
   precisou ser criado para isso.

## Verificação

- `npx tsc --noEmit`, `npm test` (383 testes).
- Testes novos em `tests/book-request-model.test.mjs`: ciclo completo
  conversar → propor → aceitar; `proposeMeeting` recusando fora de hora; e as
  funções de formatação com os três campos nulos.
- Conferência no aparelho fica para depois de aplicar a migração no Supabase da
  equipe — enquanto isso, o app trata o erro de função inexistente como
  "não configurado" (mesmo padrão dos outros repositórios Supabase).
