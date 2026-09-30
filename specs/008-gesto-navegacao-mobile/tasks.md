# Tarefas — Ocultação de Botões no Mobile e Indicação de Deslizar

- [x] 1. Adicionar o elemento visual `.book-swipe-indicator` em `src/view/components/BookPresentation.tsx`.
- [x] 2. Configurar classes e regras responsivas em `src/view/styles/book-experience.css` e `src/view/styles/institutional.css`:
  - Ocultar `.book-turn` no breakpoint `<= 760px`.
  - Exibir e animar sutilmente `.book-swipe-indicator` no mobile com as setas `‹ Deslize para navegar ›`.
  - Ajustar altura de `.book-controls` (48px) e padding inferior de `.reader-chapter` (68px em vez de 112px).
- [x] 3. Corrigir sobreposição e corte do cabeçalho do sumário mobile (`site-header` com `env(safe-area-inset-top)`, alinhamento de 20px com o drawer e bloqueio de scroll de fundo).
- [x] 4. Validar visualmente a tela em 390x844 e desktop com Playwright.
- [x] 5. Executar testes automatizados com `npm test` (7 testes aprovados).
- [x] 6. Concluir spec com `verify.md` e atualizar o `walkthrough.md`.
