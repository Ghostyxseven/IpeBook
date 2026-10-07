# Plano

## Model

- `entities/BookLookup.ts` — `BookLookup` (`isbn`, `title`, `author`) e `BookLookupError`
  com os códigos `invalid_isbn`, `not_found`, `network` e `unknown`.
- `services/isbn.ts` — puro e sem rede: `normalizeIsbn` (tira hífen e espaço,
  aceita o `X` final do ISBN-10), `isValidIsbn` (dígito verificador de 10 e 13),
  `toIsbn13` e `isBooklandEan`. É aqui que um código torto morre.
- `services/bookLookupMessages.ts` — um código de erro vira uma frase em
  português, como `listingMessages` já faz.
- `repositories/BookLookupRepository.ts` — a porta: `findByIsbn(isbn)`.
- `repositories/openLibraryBookLookupRepository.ts` — a Open Library do ADR 0026.
- `repositories/memoryBookLookupRepository.ts` — o dublê dos testes.

## ViewModel

- `useIsbnScanViewModel.ts` — a máquina de estados da tela:
  `scanning → looking-up → found | not-found`, mais `denied` e `typing`.
  Guarda o último código lido (é ele que aparece no campo da 04.18), ignora
  leitura repetida enquanto uma consulta está no ar e descarta resposta velha
  pelo mesmo `requestId` que o `useListingDetailViewModel` usa.

## View

- `components/listings/IsbnCamera.tsx` — o visor com a moldura âmbar da 04.02.
  É o único arquivo que importa `expo-camera`, do mesmo jeito que `CoverPicker`
  é o único que importa `expo-image-picker`.
- `screens/listings/ScanIsbnScreen.tsx` — as telas 04.02, 04.03, 04.17 e 04.18,
  que são estados da mesma tela.
- `screens/listings/PublishListingScreen.tsx` ganha o link da 04.01 e passa a
  mostrar a leitura em tela cheia enquanto ela acontece.

## Como o resultado volta para o formulário

**A leitura é um estado do Anunciar, não uma rota.** Uma rota separada
desmontaria — ou obrigaria a contornar — o `PublishListingScreen`, e com ele o
rascunho que a pessoa já digitou; devolver o resultado exigiria um store
compartilhado ou parâmetro de volta, e os dois criam um segundo lugar onde o
rascunho pode divergir.

O arquivo já faz exatamente isso com a 04.07: `if (vm.published) return
<Published/>`. A leitura entra pelo mesmo caminho — `if (vm.scanning) return
<ScanIsbnScreen/>` — com a barra superior "Ler ISBN" que o Figma mostra. O botão
voltar da barra fecha a leitura e devolve o formulário intacto.

`fillFromLookup` (Model, puro) decide o que entra: **só os campos vazios**.

## Decisões

1. **Quatro quadros, uma tela, e nenhuma rota.** 04.02, 04.03, 04.17 e 04.18 são
   estados do mesmo passo, e o passo inteiro é um estado do Anunciar. Rotas
   dariam voltas no histórico para um fluxo de segundos — e custariam o
   rascunho.
2. **A validação é do Model.** Dígito verificador é regra do domínio, não da
   tela — e é o que deixa testar o caso difícil sem câmera nem rede.
3. **Campo preenchido manda.** Quem digitou já decidiu; a leitura só completa.
4. **A câmera não bloqueia nada.** Todo caminho tem saída para o manual.

## Verificação

`npm run verify` e o `architecture.test.mjs` (o Model não pode importar
`expo-camera`). `npx expo export` nas duas plataformas. A câmera real exige
build de desenvolvimento (ADR 0015) e fica registrada no `verify.md`.
