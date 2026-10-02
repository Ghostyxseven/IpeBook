# 0014 — Gestão dos próprios anúncios

Data: 02/10/2026

## Status

Proposto. Implementado nas specs [025](../../specs/025-anuncios-gestao/spec.md) e [026](../../specs/026-perfil-minimo/spec.md) (issues #36 e #37), aguardando a revisão da equipe.

## Contexto

O [ADR 0008](0008-modelo-de-anuncios-supabase.md) definiu a tabela `listings` e o bucket `listing-covers`, e o catálogo (spec 018) já os lê. Faltava quem **grava**: criar, editar, arquivar e excluir anúncio, mais a foto do exemplar.

Ao implementar apareceram quatro decisões que o ADR 0008 não cobria, e todas têm consequência visível para quem usa o aplicativo.

## Decisão

### 1. Tipo próprio para as quatro situações, sem alargar o do catálogo

`ListingStatus` descreve o que **chega ao catálogo** — só `disponivel` e `reservado`. A gestão vê as quatro do banco, então ganhou `MyListingStatus` e `MyListing` separados.

Alargar `ListingStatus` obrigaria `statusLabels`, em `catalogFormat.ts`, a crescer junto — arquivo da feature de catálogo, que não tem nada a ver com esta mudança. Um tipo a mais é mais barato que um conflito entre features.

### 2. A foto nasce com nome único e a antiga é removida depois

O bucket tem política de `insert` e de `delete`, mas **não tem de `update`**. O caminho natural — `upload(mesmoCaminho, { upsert: true })` — levaria 403, porque sobrescrever é um `UPDATE` em `storage.objects`.

Duas saídas: acrescentar a política que falta, ou nunca sobrescrever. Escolhemos a segunda: cada capa recebe um nome único (`<id da pessoa>/<aleatório>.<ext>`) e a antiga é removida depois que a linha já aponta para a nova.

A ordem importa. Se a remoção falhar, sobra um arquivo sem uso — ruim, mas invisível. Na ordem inversa, o anúncio ficaria apontando para uma capa apagada, o que a pessoa vê na hora. **E esta feature não precisa de migração nenhuma.**

### 3. Excluir o anúncio apaga a foto, antes da linha

Não há trigger nem cascade entre `listings` e `storage.objects`. E o bucket é **público**: um arquivo órfão continua acessível por link para quem já o tinha.

Então `remove` apaga a capa primeiro e a linha depois. Se a capa falhar, o anúncio continua lá e dá para tentar de novo; o contrário deixaria uma foto pública sem dono. "Excluí meu anúncio" tem de significar que sumiu.

### 4. Só anúncio `disponivel` pode ser editado, arquivado ou excluído

O ADR 0008 deixou a troca de situação para o ADR da negociação (feature do Antonio), o que abria um buraco: dá para baixar o preço de um livro que alguém já pediu?

Decidimos que **não**. `reservado` e `concluido` são só leitura nesta feature, e a tela diz o motivo em vez de desabilitar botões em silêncio. Protege o combinado da negociação sem invadir a feature de ninguém.

### 5. Os três campos da modalidade viajam sempre juntos

`listings_price_only_on_sale` e `listings_terms_only_on_trade` são constraints de **linha**. Trocar venda por doação mandando só `modality` é recusado pelo banco.

Por isso `normalizeDraft` zera o campo que não vale mais, e a gravação sempre envia `modality`, `price_cents` e `trade_terms` na mesma instrução.

## Alternativas

- **Acrescentar a política de `update` no bucket:** mais direto, mas exigiria uma migração e, com nome único, não é necessário.
- **Marcar como excluído em vez de apagar:** preservaria histórico, mas o requisito do trabalho pede exclusão de verdade, e o anúncio arquivado já cobre o caso de "tirar do ar sem perder".
- **Deixar editar anúncio reservado:** mais liberdade para quem anuncia, menos previsibilidade para quem já pediu o livro.

## Consequências

- Nenhuma mudança no banco: esta feature roda sobre o schema do ADR 0008 como ele está hoje.
- Uma capa pode sobrar no bucket se a remoção falhar. É lixo, não vazamento do anúncio — e um ADR futuro pode decidir limpar periodicamente.
- A feature de negociação, ao reservar um anúncio, trava a edição automaticamente: não precisa combinar nada além da situação.
