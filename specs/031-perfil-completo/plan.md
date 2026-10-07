# Plano

## Banco

Migração `20261007120000_avaliacoes_e_perfil_publico.sql` (ADR 0027):

- Tabela `public.ratings` — `request_id`, `author_id`, `subject_id`, `score`
  (1 a 5), `comment` (até 280), `created_at`. Única por `(request_id, author_id)`
  e com `check (author_id <> subject_id)`.
- RLS de escrita que exige negociação **concluída** e autoria de quem participou.
  Sem `update` e sem `delete` para ninguém: a reputação não se apaga.
- `public.public_profile(person uuid)` — `security definer`, devolve primeiro
  nome, desde quando, concluídas, média e total de avaliações. É a única porta
  para o perfil de outra pessoa, e ela não tem como devolver e-mail.
- `public.my_history()` — as negociações concluídas de quem chama, com o livro.

Reaproveita `public.listing_owner_first_name`, que já existe desde o catálogo e
já é a função que expõe só o primeiro nome.

## Model

- `entities/Rating.ts` — `Rating`, `Reputation`, `PublicProfile`,
  `HistoryEntry` e `ReputationError`.
- `services/reputationFormat.ts` — puro: `averageLabel` ("4,8 de 5" ou
  `null` quando não há nota), `completedLabel` ("8 trocas concluídas"),
  `initials` ("Ana Paula" → "AP") e `historyLine`.
- `services/helpTopics.ts` — os três cartões da 09.01, em dado e não em JSX, para
  que o texto seja testável e a tela só desenhe.
- `repositories/ReputationRepository.ts` + versão Supabase + versão em memória.

## ViewModels

- `usePublicProfileViewModel(repository, userId)` — carrega o perfil público.
- `useReputationViewModel(repository)` — as avaliações de quem está na conta.
- `useHistoryViewModel(repository)` — as negociações concluídas.

Os três seguem o `useListingDetailViewModel`: `loading | ready | error`, com
`retry` e `requestId` para descartar resposta velha.

## Views

- `screens/profile/PublicProfileScreen.tsx` (03.04)
- `screens/profile/RatingsScreen.tsx` (07.03)
- `screens/profile/HistoryScreen.tsx`
- `screens/profile/HelpScreen.tsx` (09.01)
- `components/profile/Avatar.tsx` — o monograma do Figma, reusado pelas duas
  telas de perfil.
- Rotas `pessoa/[id].tsx`, `avaliacoes.tsx`, `historico.tsx` e `ajuda.tsx`.
- `screens/catalog/ListingDetailScreen.tsx` — o nome de quem anunciou vira link.
- `screens/profile/ProfileScreen.tsx` — ganha as três entradas.

## Decisões

1. **O perfil público sai de uma função, não de um `select`.** Uma consulta
   direta a `auth.users` não existe para o cliente, e montar o perfil juntando
   tabelas no app vazaria o que elas têm de sobra. A função devolve exatamente os
   seis campos da tela.
2. **A regra de quem pode avaliar é do banco.** A tela também a aplica, para não
   oferecer um botão que vai falhar — mas quem decide é a RLS. Regra de
   integridade que mora só na tela não é regra.
3. **Sem `update` e sem `delete` em `ratings`.** É o que faz a reputação valer.
4. **Perfil sem nota não tem média.** `averageLabel` devolve `null`, e a tela diz
   "Ainda sem avaliações".
5. **A Ajuda é conteúdo, não tela.** Os três tópicos ficam em `helpTopics.ts`;
   mudar um texto não é mexer em componente.

## Verificação

`npm run verify` e o `architecture.test.mjs`. `npx expo export` nas duas
plataformas. A migração precisa ser aplicada no Supabase antes de o fluxo real
funcionar; enquanto não for, o app mostra "ainda não foi configurado" — e isso
fica registrado no `verify.md`.
