# Plano de Implementação — Ocultação de Botões no Mobile e Indicação de Deslizar

## Passos

1. **Estrutura no Componente (`BookPresentation.tsx`)**:
   - Adicionar dentro de `.book-controls` um elemento dedicado ao guia mobile de gesto de deslizar:
     `<div className="book-swipe-indicator" aria-hidden="true">`
     `<span className="swipe-arrow swipe-arrow-left">‹</span>`
     `<span className="swipe-text">Deslize para navegar</span>`
     `<span className="swipe-arrow swipe-arrow-right">›</span>`
     `</div>`
   - O elemento será visível apenas no mobile via CSS (no desktop permanece oculto).
   - O contador de páginas (`04 / 07`) e a barra de progresso continuam acessíveis e visíveis.

2. **Estilização no CSS (`book-experience.css` e `institutional.css`)**:
   - No breakpoint `@media (max-width: 760px)`:
     - Ocultar botões `.book-turn` (`display: none;`).
     - Redefinir a altura de `.book-controls` para `44px` (em vez de `72px`).
     - Alinhar `.book-controls` em linha única, centralizando o indicador de deslizar e mantendo o contador sutil ou unificado:
       `[ ‹ Deslize para navegar › ]` e `[ 04 / 07 ]` com tipografia refinada e legível.
     - Ajustar o padding inferior das páginas em `.book-page > .reader-chapter` para `calc(44px + 20px) = 64px` (em vez dos 112px anteriores), dando mais de 45px extras de altura visível ao leitor.
   - No desktop (`> 760px`):
     - Manter `.book-swipe-indicator` oculto (`display: none;`).
     - Manter `.book-turn` visíveis com 72px de altura.

3. **Verificação Visual e Funcional**:
   - Testar o fluxo mobile no navegador via Playwright na resolução 390x844 (celular).
   - Validar se o swipe horizontal continua avançando e retrocedendo os capítulos.
   - Capturar prints de validação visual.
   - Executar suíte de testes automatizados (`npm test`).
