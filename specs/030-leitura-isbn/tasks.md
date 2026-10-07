# Tarefas

- [ ] `expo-camera` na dependência e a permissão de câmera no `app.json`, em português.
- [ ] `services/isbn.ts` — normalizar, validar ISBN-10 e ISBN-13, converter para 13.
- [ ] `entities/BookLookup.ts` e `services/bookLookupMessages.ts`.
- [ ] Porta `BookLookupRepository` com a Open Library e o dublê em memória.
- [ ] `useIsbnScanViewModel` com os estados lendo, consultando, encontrado, não
      encontrado, sem permissão e digitando.
- [ ] `IsbnCamera` — o visor da 04.02, único arquivo com `expo-camera`.
- [ ] `ScanIsbnScreen` com os quatro quadros (04.02, 04.03, 04.17, 04.18).
- [ ] Link "Ler ISBN com a câmera" na 04.01 e a leitura como estado do Anunciar.
- [ ] `fillFromLookup` — aplicar título e autor só nos campos vazios.
- [ ] Testes: dígito verificador, código torto não chama a rede, não encontrado,
      falha de rede, e campo preenchido não é sobrescrito.
- [ ] `npm run verify` e `npx expo export` nas duas plataformas.
- [ ] Conferir no aparelho com câmera real e registrar no `verify.md`.
