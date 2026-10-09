# Plano

## Model

Nada novo. O aviso do 05.07 usa a contagem que `shelfSections` já devolve, e o
bloco do 05.08 filtra a lista que `useBookRequestListViewModel` já carrega.

Não inventar repositório para dois avisos é o ponto: o dado existe em tela.

## View

Só `screens/profile/MyShelfScreen.tsx`:

- O aviso do 05.07, no topo da aba Anúncios, quando a rota traz `removido`.
- `ClosedProposals`, na aba Propostas, a partir das propostas `rejected`.

## Decisões

1. **O nome do livro excluído chega pela rota.** O anúncio já não existe para ser
   consultado — quem sabe o nome é a tela que acabou de excluí-lo.
2. **O aviso é descartável e não volta.** Ele é notícia, não estado: depois de
   lido, a estante é só a estante.
3. **Nada de tabela de "avisos pendentes".** Guardar isso sobreviveria ao
   reinício do aplicativo, o que é exatamente o que não se quer.

## Verificação

`npm run verify`. A concordância de número entra em teste; o resto é conferência
visual no aparelho, junto com as specs 025, 026 e 032.
