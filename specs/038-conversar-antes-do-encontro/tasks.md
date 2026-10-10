# Tarefas

- [x] Migração: campos de encontro opcionais, `propose_meeting`, trava no
      `transition_book_request`.
- [x] ADR 0035.
- [x] Model: `BookRequest` com campos nulos, `proposeMeeting` no repositório
      (interface, Supabase e memória), formatação null-safe, `proposedMeetingCopy`.
- [x] ViewModels: `useStartConversationViewModel`, `useProposeMeetingViewModel`.
- [x] Telas: botão "Conversar" no Detalhe; `ProposeMeetingScreen`; Detalhe da
      negociação trocando cartão por "Propor encontro" e escondendo "Aceitar"
      sem encontro.
- [x] Rota `negociacoes/[id]/propor-encontro`.
- [x] Testes do Model: ciclo conversar → propor → aceitar; recusa de propor fora
      de hora; formatação com campos nulos.
- [x] `npx tsc --noEmit` e `npm test` (383 testes).
- [ ] Aplicar a migração no Supabase da equipe.
- [ ] Conferir no aparelho (Android e iPhone) com duas contas: conversar, propor
      encontro, aceitar, e confirmar que "Aceitar" some sem encontro.
- [ ] Revisar a copy de `requestScreenCopy` para diferenciar "só conversa" de
      "já tem encontro" (fora do escopo desta spec; registrado para depois).
