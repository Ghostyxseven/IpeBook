# Tarefas

- [x] Entidades: `MyListingStatus`, `MyListing`, `ListingDraft` e `ListingError`, sem tocar no que o catálogo usa.
- [x] `listingValidation.ts` — regras das três modalidades, puras e testadas.
- [x] `listingFormat.ts` — reais ↔ centavos e os rótulos.
- [x] Porta `ListingsRepository` e implementação em memória.
- [x] `supabaseListingsRepository` — consulta, gravação, upload e remoção da capa, com mapeamento de erros.
- [x] `usePublishListingViewModel`, `useEditListingViewModel` e `useMyListingsViewModel`.
- [x] `factories/listings.ts`.
- [x] Telas de publicar e editar, e os componentes de formulário.
- [x] Rotas em `src/app/(app)/anunciar/`.
- [x] Testes do Model e das ViewModels.
- [x] ADR 0014 com as decisões 1 a 4 do plano.
- [ ] Conferir no aparelho (Android e iPhone) e registrar no `verify.md`.
- [x] Comparar com os quadros do Figma (03/10/2026): Anunciar livro refeito pelos quadros Android 04.01 (livro e modalidade), 04.04 (fotos), 04.05 (detalhes) e 04.07 (publicado), em três etapas. Divergências em `docs/design-system/divergencias.md`.
- [x] Corrigir a foto que subia vazia no aparelho (03/10/2026): o arquivo chegava ao bucket com 14 bytes porque `fetch(uri).arrayBuffer()` não lê arquivo local no React Native. O `CoverPicker` agora pede `base64` ao seletor e converte com `base64ToArrayBuffer`.
