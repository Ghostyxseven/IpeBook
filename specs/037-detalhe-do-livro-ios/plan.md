# Plano

## Model

- `catalogFormat.ts`: nova `detailCard(listing)` → `{ condition, category, location }`,
  reaproveitando `conditionLabels` e `locationLabel` que já existiam. Substitui
  `detailMeta`/`meta` (removidos: nada mais os usava fora do campo composto).
- `ListingDetails.card: DetailCard` no lugar de `ListingDetails.meta: string`.
- `AppIcon`: novo nome `share` (`square.and.arrow.up` no iOS, `share` no Android/Web).

## View

- `ListingDetailScreen.tsx`:
  - Linha de ações acima da capa: ícone de compartilhar (`Share.share`, sempre
    visível) e o `FavoriteButton` existente (só quando logada e não é dona) —
    sai do lado do título.
  - Bloco do título fica só com título e autor.
  - A antiga `<Text>{details.meta}</Text>` vira um cartão (`styles.card`) com
    três linhas rotuladas (Conservação/Categoria/Retirada), a última condicional.
- Nenhuma mudança em `ListingCover`, no botão de ação principal do rodapé, em
  denunciar/bloquear ou nas rotas.

## Decisões

1. **Compartilhar não depende de sessão nem de dono.** Qualquer pessoa pode
   compartilhar o link/texto de um anúncio público; diferente do favoritar, que
   precisa de conta.
2. **"Conversar" fica fora** (ver `spec.md`): exigiria modelar conversa sem
   negociação, decisão de banco que não cabe num ajuste de layout.
3. **`detailMeta` foi removido, não preservado como alias.** Nada mais o usava
   depois da tela trocar para o cartão; manter uma função morta só para não
   tocar num teste não é o padrão do projeto.

## Verificação

- `npx tsc --noEmit`, `npm test`, `npx prettier --write` nos arquivos tocados
  (o ESLint do projeto não cobre `src/`, como já registrado nas specs
  anteriores).
- Teste novo do Model para `detailCard` (com e sem localização).
- Conferência visual em aparelho fica para a rodada geral do
  `docs/roteiro-validacao-aparelhos.md` (não há Metro rodando nesta máquina
  para recarregar o app agora).
