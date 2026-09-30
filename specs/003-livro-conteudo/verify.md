# Verificação — livro enriquecido

Data: 29/09/2026. Branch mantida: `feature/pagina-institucional`, HEAD `d93bb98`. Sem commit, publicação ou instalação de dependências. Alterações e arquivos preexistentes preservados.

## Entrega

Sete capítulos com capa encadernada ilustrativa, papel, marcador/sumário e progresso. Guias de comprar, vender, trocar e doar com passos e checklists. Estante de exemplos fictícios com três modalidades, busca por título/categoria, filtros, recuperação do vazio e detalhes em diálogo. Propósito, dúvidas, desenvolvimento e informações enriquecidos. Compra e venda são conteúdo demonstrativo, não transações reais.

O domínio e os filtros ficam no Model; a seleção dos guias e exemplos, na ViewModel. O diálogo nativo é reutilizado para sumário e detalhes. Não houve mudança arquitetural além do ADR 0004. Foram consultados os quadros Figma `33:267` e `33:585`; diferenças editoriais documentadas no design system.

## Verificações aprovadas

- `node --test tests/book-experience.test.mjs`: filtro combinado, título/categoria, resultado vazio e semântica de preço, troca e gratuidade.
- `node --test tests/book-experience-viewmodel.test.mjs`: guia de venda, navegação, filtro, vazio, recuperação e fechamento do detalhe na mudança de página.
- `npm test`: quatro arquivos aprovados, incluindo domínio e ViewModel preexistentes.
- `npm run typecheck`, `npm run format:check`, `npm run build:web` e `git diff --check`: aprovados.
- MCP Playwright, `scripts/verificar-conteudo-livro.js`: ações Comprar/Vender da capa, quatro guias, sumário, Escape, retorno de foco, setas dentro do diálogo, filtros, preços, detalhes, busca vazia e recuperação. Verificadas 28 combinações de sete capítulos e quatro viewports: 320, 390, 768 e 1440 px, incluindo altura de 500 px. Sem overflow horizontal externo ou interno.
- MCP Playwright, `scripts/verificar-livro.js`: limites, navegação, histórico, teclado, gesto sintético, movimento reduzido e limpeza de clones após cliques rápidos.
- MCP Playwright, `scripts/verificar-web.js`: fluxo original aprovado usando 8081 em vez de 8082 somente na execução; documentos com recarga, menu móvel, diálogos, foco, FAQ e ausência de cookies/armazenamento.
- axe-core compartilhado: sem violações detectadas nas regras WCAG A/AA examinadas nas sete páginas desktop, capa/guia/estante móveis e diálogos de detalhe e sumário. Isso não equivale a certificação de acessibilidade.
- Medidos controles dos sete capítulos em viewport móvel: todos os alvos interativos examinados têm ao menos 48 × 48 px.
- Inspeção visual das sete páginas desktop; capa, guias, estante, detalhe e sumário móveis. Quadro intermediário da virada inspecionado; animação concluída sem clones residuais.
- Nenhum erro JavaScript nos fluxos automatizados.

## Limites e continuidade

Testes feitos em Chromium com viewport móvel; nenhum aparelho Android/iOS físico foi validado. O conteúdo mais longo rola dentro da folha para preservar legibilidade, enquanto a troca entre capítulos permanece lateral. Gesto sintético não mede sensação tátil ou desempenho em aparelhos reais. A estante não faz requisições, anúncios ou pagamentos e não fornece contato real. Nenhuma etapa de publicação foi executada.

Prévia local testada em `http://localhost:8081`. Recarregar para consumir a exportação atualizada. Arquivos principais: `InstitutionalBook.tsx`, `ExampleShelf.tsx`, `BookDialog.tsx`, `book-experience.css`, `useBookExperience.ts` e `bookExperience.ts`. Os procedimentos de validação podem ser repetidos pelos scripts citados.
