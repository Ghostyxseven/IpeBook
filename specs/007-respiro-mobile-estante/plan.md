# Plano: Respiro e Layout Mobile da Estante de Livros

1. **Reorganização de Ferramentas (`.shelf-tools`) no Mobile**:
   - Ajustar flex-direction para coluna com alinhamento stretch e gap de 16px.
   - Campo de busca `.shelf-search`: largura 100%, input com altura 48px e bordas arredondadas.
   - Filtros `.shelf-filters`: distribuição em grid ou flex com botões de altura mínima 44px, facilitando o toque com uma mão.

2. **Reestruturação da Grade de Livros (`.example-grid`) no Mobile**:
   - Mudar para `grid-template-columns: 1fr;` no breakpoint móvel (`<= 768px`).
   - Ajustar cada `.example-card`:
     - Layout horizontal elegante: `grid-template-columns: 110px 1fr; gap: var(--spacing-16);`.
     - Capa `.example-cover`: largura de 110px, altura proporcional (~155px-165px), com tipografia legível (`font-size: 14px; line-height: 1.2; text-wrap: normal; word-break: normal;`).
     - Detalhes `.example-copy`: selo da modalidade, título completo h3, preço em destaque, condição e botão "Conhecer o exemplo" de 48px.
     - Em telas muito estreitas (`< 360px`): empilhar se necessário (`grid-template-columns: 1fr;`).

3. **Verificação**:
   - Validar ausência de overflow horizontal (`scrollWidth === clientWidth`).
   - Executar testes automatizados (`npm test`).
   - Capturar screenshots via Playwright MCP na página `#em-construcao`.
