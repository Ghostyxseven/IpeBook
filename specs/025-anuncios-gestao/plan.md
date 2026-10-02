# Plano

Espelha a estrutura da feature de catálogo (spec 018), que já provou o caminho: entidade → porta → duas implementações → ViewModel → tela. O MVVM é verificado pelo `tests/architecture.test.mjs`.

## Model

- `entities/Listing.ts` — acrescenta, **sem mexer no que o catálogo já usa**:
  - `MyListingStatus` com as quatro situações do banco (`disponivel`, `reservado`, `concluido`, `arquivado`). O `ListingStatus` do catálogo continua com duas; alargá-lo quebraria o `statusLabels` de `catalogFormat.ts`, que é código do Micael.
  - `MyListing` — o anúncio visto por quem o publicou: tudo do `Listing` menos `ownerFirstName`, mais a situação completa e o `coverPath` (o caminho no bucket, necessário para apagar a foto).
  - `ListingDraft` — o que o formulário produz, antes de virar linha.
- `entities/ListingError.ts` — `invalid` | `not_found` | `not_allowed` | `network` | `not_configured` | `unknown`, no mesmo molde do `CatalogError`.
- `services/listingValidation.ts` — **regra de negócio pura, sem React**: título e autor não vazios, categoria da lista fixa, estado entre os quatro, venda com preço > 0, troca com condições, doação sem preço. Devolve os erros por campo.
- `services/listingFormat.ts` — `parseBRLToCents` e `formatCentsToBRL` (inteiro, nunca float), rótulos das situações e o texto do resumo de revisão.
- `repositories/ListingsRepository.ts` — a porta: `listMine`, `getMineById`, `create`, `update`, `archive`, `republish`, `remove`, `uploadCover`, `removeCover`.
- `repositories/memoryListingsRepository.ts` — o que torna o teste possível, igual ao do catálogo.
- `repositories/supabaseListingsRepository.ts` — a única parte que conhece o Supabase.

## ViewModels

- `usePublishListingViewModel` — os quatro passos, o rascunho, a validação por passo e o envio. Um passo só avança com os campos dele válidos.
- `useEditListingViewModel` — carrega o anúncio, reusa a mesma validação e grava.
- `useMyListingsViewModel` — lista os próprios anúncios, arquiva, republica e exclui, com confirmação.
- `factories/listings.ts` — monta as dependências reais, como `factories/catalog.ts`.

## Views

- `screens/listings/PublishListingScreen.tsx` — o fluxo em passos.
- `screens/listings/EditListingScreen.tsx`.
- `components/listings/ListingForm.tsx`, `ModalityPicker.tsx`, `CoverPicker.tsx`, `ListingStepper.tsx`.
- Rotas em `src/app/(app)/anunciar/` (`index`, `[id]/editar`).
- Reusa `ui/Button`, `ui/TextField`, `ui/FormMessage`, `catalog/StatusBadge`, `catalog/ListingCover` e o `nativeTheme`. Nenhuma cor, medida ou raio novo.

## Decisões

1. **Tipo próprio em vez de alargar o do catálogo.** Menos atrito e nenhuma mudança em arquivo de outra pessoa. Registrado no ADR 0014.
2. **Foto com nome único, nunca sobrescrita.** O `storage.objects` tem política de `insert` e de `delete`, mas **não tem de `update`**: um `upload(..., { upsert: true })` levaria 403. Então cada foto nasce com um nome novo e a antiga é removida depois. Isso também evita precisar de migração — e esta feature não muda o banco.
3. **Excluir o anúncio apaga a foto antes da linha.** Se a remoção da foto falhar, o anúncio continua lá e a pessoa pode tentar de novo; na ordem inversa restaria uma foto pública sem dono.
4. **Só `disponivel` é editável.** Protege o combinado da negociação sem invadir a feature do Antonio.
5. **Gravação da modalidade sempre com os três campos juntos.** As constraints `listings_price_only_on_sale` e `listings_terms_only_on_trade` são de linha: um `UPDATE` parcial viola.
6. **Preço em centavos, `integer`.** Nunca float — é dinheiro.

## Verificação

`npm run verify` (typecheck, lint, format, testes) e o `architecture.test.mjs` provando o MVVM. O fluxo real no aparelho e a comparação com o Figma ficam no `verify.md`.
