# Modo de leitura: livro 3D ou leitura normal

## Objetivo e escopo

Deixar o visitante escolher, na própria página institucional, entre o **livro 3D** (folhas que viram, com gesto e teclado) e a **leitura normal** (os mesmos capítulos em rolagem contínua). O conteúdo é o mesmo nos dois modos.

Fora do escopo: salvar a escolha entre visitas, rotas reais no lugar de `#fragmentos` e mudanças no conteúdo dos capítulos.

## Critérios de aceite

- Um seletor "Livro 3D / Leitura normal" aparece nos dois modos, com `aria-pressed`, alvos de pelo menos 48 px e foco visível.
- Quem pede menos movimento no sistema (`prefers-reduced-motion`) começa na leitura normal; os demais começam no livro.
- Na leitura normal a página rola como um documento comum, sem moldura fixa; os links `#sobre`, `#como-funciona` etc. levam ao capítulo.
- Ao passar para a leitura normal, o leitor continua no capítulo em que estava.
- (Substituído pela spec 022) Na entrega original a escolha não era gravada; hoje ela é lembrada em `localStorage`, só depois que o visitante escolhe.
- Documentos legais (`#termos` etc.) não mudam.

## Validação

Testes do Model e da ViewModel, tipos, lint, formatação e build. Inspeção visual em celular e desktop registrada no `verify.md`.
