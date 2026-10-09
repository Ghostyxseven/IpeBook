# Tarefas

- [x] Migração `20261007120000_avaliacoes_e_perfil_publico.sql`: `ratings`, RLS,
      `public_profile` e `my_history`.
- [x] ADR 0027 com a decisão de reputação não apagável e perfil por função.
- [x] `entities/Rating.ts` e `services/reputationFormat.ts`.
- [x] `services/helpTopics.ts` com os três tópicos da 09.01.
- [x] Porta `ReputationRepository`, versão Supabase e dublê em memória.
- [x] `usePublicProfileViewModel`, `useReputationViewModel`, `useHistoryViewModel`.
- [x] `components/profile/Avatar.tsx` (monograma).
- [x] Telas: perfil de outra pessoa, avaliações, histórico e ajuda.
- [x] Rotas `pessoa/[id]`, `avaliacoes`, `historico` e `ajuda`.
- [x] O nome de quem anunciou, no detalhe do livro, vira link para o perfil.
- [x] Entradas de Avaliações, Histórico e Ajuda no Meu perfil.
- [x] Testes: média sem nota, plural, iniciais, perfil público, histórico vazio,
      erro com "Tentar de novo".
- [x] `npm run verify` e `npx expo export` nas duas plataformas.
- [ ] Aplicar a migração no Supabase e conferir o fluxo real; registrar no `verify.md`.
