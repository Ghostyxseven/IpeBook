# Plano

## Model

- `entities/Draft.ts` — `DraftRecord` (`id`, `draft`, `savedAt`) e `DraftError`.
- `services/draftSummary.ts` — puro: `draftTitle` ("Sem título" quando vazio) e
  `draftSupporting` ("Venda · faltam estado e localização"). A frase do que falta
  sai da mesma `validateDraft` que o formulário usa, para não existirem duas
  noções de "incompleto".
- `repositories/DraftsRepository.ts` — a porta, com `Promise` mesmo sendo
  síncrona hoje: é o que deixa trocar por servidor sem tocar em tela (ADR 0028).
- `repositories/localDraftsRepository.ts` — `localStorage` do `src/infra`.
- `repositories/memoryDraftsRepository.ts` — o dublê dos testes.

## ViewModel

- `useDraftsViewModel` — lista, retoma e descarta. `loading | ready | error`,
  com `retry`, igual ao resto do projeto.
- `usePublishListingViewModel` ganha três coisas: `hasContent` (se há algo a
  perder), `saveDraft()` e `resume(record)`.

## View

- `screens/listings/DraftsScreen.tsx` — 04.11, 04.15 e 04.16.
- `screens/listings/ManageListingScreen.tsx` — 04.08, 04.10, 04.20 e 04.21, que
  são estados do mesmo anúncio e não quatro rotas.
- `PublishListingScreen` ganha o diálogo 04.13 e o estado 04.14.
- `EditListingScreen` ganha o título "Revise o anúncio" e a linha de correção.
- `MyShelfScreen`: tocar num anúncio abre Gerenciar, no lugar da folha.

Rotas novas: `anunciar/rascunhos` e `anuncio/[id]`.

`anuncio/[id]` e não `anunciar/gerenciar/[id]`: já existe `anunciar/[id]` para a
edição, e aninhar uma rota estática dentro de uma dinâmica é um convite a erro de
roteamento difícil de enxergar.

## Decisões

1. **Quatro quadros, uma tela** (04.08, 04.10, 04.20, 04.21). São estados do
   mesmo anúncio. Rotas separadas deixariam, depois de excluir, uma tela de
   anúncio inexistente no histórico, alcançável pelo botão voltar.
2. **A folha de opções sai.** O Figma desenhou uma tela, e a tela cabe o que a
   folha não cabia: a prévia do anúncio e o cartão de situação.
3. **O rascunho não guarda a foto** (ADR 0028), e a tela diz isso.
4. **Salvar é escolha, não automático** — o quadro 04.13 existe para perguntar.
5. **"Pausar" em vez de "arquivar"** na tela; `arquivado` continua no banco.

## Verificação

`npm run verify` e o `architecture.test.mjs` (o Model não pode importar
`expo-sqlite`; quem o conhece é o `src/infra`). `npx expo export` nas duas
plataformas.
