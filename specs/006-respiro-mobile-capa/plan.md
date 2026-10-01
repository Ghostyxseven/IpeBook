# Plano: Respiro e Ergonomia Mobile da Apresentação do Livro

1. **Tokens de espaçamento**:
   - Incluir token `"20": { "$type": "dimension", "$value": "20px" }` e `"6": { "$type": "dimension", "$value": "6px" }` em `design-tokens.json` para garantir robustez.
   - Definir fallback no CSS para evitar que variáveis indefinidas anulem declarações de preenchimento (`var(--spacing-20, 20px)`).

2. **Padding da folha no Mobile (`book-experience.css`)**:
   - Ajustar `.book-page > .reader-chapter` no breakpoint `<= 760px` para usar `padding: var(--spacing-24) var(--spacing-24) calc(var(--landing-book-controlsHeight) + 48px);`.
   - Garantir que `box-sizing: border-box` e `overflow-x: hidden` impeçam qualquer drift horizontal.

3. **Hierarquia e Respiração na Capa (`.reader-cover`)**:
   - Ajustar `.cover-introduction h1` para tamanho proporcional: `font-size: clamp(26px, 6.8vw, 34px); line-height: 1.15;`.
   - Ajustar parágrafo `.chapter-lead` com margem suave e leitura confortável.
   - Ajustar botões `.reader-actions` para altura mínima de 48px com padding e gap proporcionais.
   - Ajustar `.cover-scene` e `.bound-book`: largura reduzida para `min(190px, 55vw)` no mobile, tornando a ilustração harmoniosa e deixando o conteúdo leve.

4. **Verificação**:
   - Rodar testes automatizados (`npm test`).
   - Avaliar via Playwright com inspeção de `scrollWidth`, `clientWidth`, `getBoundingClientRect` e capturas de tela nos viewports mobile (360px, 390px, 414px).
