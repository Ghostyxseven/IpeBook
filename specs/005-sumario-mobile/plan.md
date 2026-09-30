# Plano de Implementação: Sumário Editorial Mobile e Ajuste da Fita

1. **Definição de dados e itens do Sumário**:
   - Mapear os 6 capítulos da apresentação com id, número, rótulo principal e breve descrição.
   - Manter consistência com `bookPages` de `useBookNavigation.ts`.

2. **Refatoração da View em `InstitutionalScreen.web.tsx`**:
   - Reestruturar `.main-navigation` para ter:
     - Bloco de Capítulos (`.nav-chapters`), com cada item exibindo o número (`01`, `02`), o título do capítulo e a legenda explicativa.
     - Bloco de Comunidade (`.nav-community`), contendo o Instagram em formato de card/destaque com badge.
     - Bloco de Ações e Transparência (`.nav-actions`), com aviso de aplicativo em desenvolvimento, botões Entrar/Criar conta e links legais.
   - Garantir que no desktop a navegação continue horizontal e minimalista.

3. **Estilização em `institutional.css`**:
   - No breakpoint mobile (`@media (max-width: 900px)`):
     - Estilizar `.nav-chapter-item` com layout flex/grid, padding confortável (touch targets 48px+), numeração estilizada em cor primária/dourada e subtítulo em tom suave.
     - Estilizar `.nav-community-card` com borda suave, fundo temático, ícone e link externo.
     - Estilizar o rodapé com o badge de status e links rápidos.

4. **Correção do posicionamento da fita em `book-experience.css`**:
   - Ajustar `.cover-scene-caption` para `right: 12px` (ou `right: 16px`), garantindo que não avance sobre a coluna central de texto da capa encadernada.

5. **Verificação**:
   - Executar testes automatizados com `npm test`.
   - Inspecionar visualmente via MCP Playwright no viewport 390x844.
