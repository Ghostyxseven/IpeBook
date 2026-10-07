# Tarefas

- [x] `expo-camera` na dependência e a permissão de câmera no `app.json`, em português.
- [x] `services/isbn.ts` — normalizar, validar ISBN-10 e ISBN-13, converter para 13.
- [x] `entities/BookLookup.ts` e `services/bookLookupMessages.ts`.
- [x] Porta `BookLookupRepository` com a Open Library e o dublê em memória.
- [x] `useIsbnScanViewModel` com os estados lendo, consultando, encontrado, não
      encontrado, sem permissão e digitando.
- [x] `IsbnCamera` — o visor da 04.02, único arquivo com `expo-camera`.
- [x] `ScanIsbnScreen` com os quatro quadros (04.02, 04.03, 04.17, 04.18).
- [x] Link "Ler ISBN com a câmera" na 04.01 e a leitura como estado do Anunciar.
- [x] `fillFromLookup` — aplicar título e autor só nos campos vazios.
- [x] Testes: dígito verificador, código torto não chama a rede, não encontrado,
      falha de rede, e campo preenchido não é sobrescrito.
- [x] `npm run verify` e `npx expo export` nas duas plataformas.
- [ ] Conferir no aparelho com câmera real e registrar no `verify.md`.
