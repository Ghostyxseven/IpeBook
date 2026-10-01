# Verificação — 01/10/2026

## Resultado

Implementado. O visitante alterna entre livro 3D e leitura normal pelo seletor; o conteúdo é o mesmo.

## Evidências

- `npm run verify`: tipos, lint, formatação e 37 testes aprovados (inclui `tests/reading-mode.test.mjs`: regra do modo padrão, troca de modo e ausência de gravação em `localStorage`/`sessionStorage`).
- `npm run build:web`: exportação aprovada.
- Chromium (Playwright) contra a exportação, em 1440 × 900 e 390 × 844:
  - seletor com dois botões de 48 px de altura, `aria-pressed` correto; no celular fica numa barra própria, porque o cabeçalho do livro é oculto abaixo de 760 px (spec 008);
  - na leitura normal, os 7 capítulos aparecem em rolagem contínua, sem a moldura fixa e sem rolagem horizontal;
  - o link "Veja como participar de cada jeito" leva ao capítulo `#como-funciona`;
  - ao voltar para o livro, ele abre no capítulo do `#hash` atual;
  - sem exceções de JavaScript na página.
- Corrigido durante a verificação: o `overflow` do contêiner e do `body` (react-native-web) impedia o cabeçalho fixo na leitura normal; o seletor `body:has(.is-normal-reading)` resolve.

## Limitações

- Não houve teste em aparelho real, com leitor de tela nem com `prefers-reduced-motion` ativado no navegador (a regra do modo inicial está coberta só por teste unitário).
- A escolha não é salva entre visitas, de propósito, para manter a Política de Privacidade correta.
- Na leitura normal, rolar não atualiza o `#hash`; ao voltar para o livro ele abre no último capítulo escolhido por link ou gesto.
