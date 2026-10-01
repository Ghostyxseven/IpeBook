# Plano

Depende das specs [013](../013-base-app-nativo/spec.md) e [014](../014-autenticacao-onboarding/spec.md) e do [ADR 0007](../../docs/adr/0007-modelo-de-anuncios-supabase.md). Nenhuma dependência nova: usa `@supabase/supabase-js` e `expo-router` já instalados, com `Tabs` do Expo Router.

## Model

- `entities/Listing.ts`: `Listing` (`id`, `title`, `author`, `category`, `modality`, `priceCents`, `tradeTerms`, `condition`, `neighborhood`, `city`, `description`, `coverUrl`, `status`, `ownerFirstName`, `createdAt`), `Modality` (`sale` | `trade` | `donation`), `ListingStatus` e `CatalogFilters` (`query`, `modalities`, `category`).
- `entities/CatalogError.ts`: códigos `not_found`, `network`, `not_configured`, `unknown`.
- `services/catalogFormat.ts`: preço em BRL, rótulos de modalidade, estado e situação, localização e rótulo acessível do card.
- `services/catalogFilters.ts`: normalização da busca (aparar, mínimo de 2 caracteres), contagem de filtros ativos e limpeza.
- `services/categories.ts`: lista fixa de categorias (a mesma do ADR 0007).
- `services/catalogMessages.ts`: código → mensagem em português.
- `repositories/CatalogRepository.ts`: `list({ filters, cursor, limit })` → `{ items, nextCursor }` e `getById(id)`.
- `repositories/supabaseCatalogRepository.ts`: consulta na view `catalog_listings` com `ilike` em título e autor, `in` na modalidade, `eq` na categoria, ordenação por `created_at desc, id desc` e cursor por `created_at`/`id`; traduz erros.
- `repositories/memoryCatalogRepository.ts`: implementação em memória para testes.

## ViewModels

- `useCatalogFeedViewModel(repo)`: primeira página, próxima página sem duplicar requisições, atualizar, erro e repetição.
- `useCatalogSearchViewModel(repo, initial)`: texto com espera de 300 ms, filtros, paginação e descarte de respostas antigas (contador de requisição).
- `useListingDetailViewModel(repo, id)`: carregar, não encontrado, erro e repetição.
- `src/factories/catalog.ts` injeta o repositório real.

## Views

- Componentes: `catalog/StatusBadge`, `catalog/BookCard`, `catalog/CategoryChips`, `catalog/ModalityFilter`, `catalog/SearchField` e `catalog/ListingCover`; reutiliza `EmptyState`, `ErrorState`, `LoadingState` e `OfflineBanner`.
- Telas: `catalog/HomeFeedScreen` (substitui a Início provisória), `catalog/SearchScreen` e `catalog/ListingDetailScreen`, com `FlatList`.
- Rotas: `src/app/(app)/(tabs)/_layout.tsx` (Tabs Início e Buscar), `(tabs)/inicio.tsx`, `(tabs)/buscar.tsx` e `src/app/(app)/livro/[id].tsx`, que só reexportam telas. O redirecionamento para `/inicio` continua válido porque grupos não entram na URL.

## Decisões

- O catálogo lê uma view (`catalog_listings`) que já filtra a situação e expõe só o primeiro nome de quem anunciou, para não depender da tabela de perfis do Eric nem expor dados a mais.
- Paginação por cursor, e não por `offset`, para não repetir nem pular anúncios quando surgem novos.
- Busca por `ilike` basta para o MVP; busca textual completa (`tsvector`) só se o volume exigir.
- Ícones das abas: enquanto não houver ADR da biblioteca de ícones por plataforma, usar o componente existente ou só o rótulo de texto, sem nova família de ícones.

## Verificação

Testes unitários em Node (`tests/catalog-*.test.mjs`), typecheck, exportação dos bundles Android e iOS, conferência visual em celular (estados: carregando, vazio, nenhum resultado, erro, offline e foco) e registro das pendências (Supabase real, Figma, aparelhos) no `verify.md`.
