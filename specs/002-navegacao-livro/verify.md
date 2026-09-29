# Verificação — 29/09/2026

Branch mantida: `feature/pagina-institucional`, HEAD `d93bb98`. Alterações locais preexistentes da tela, CSS e arquivos não rastreados preservadas. Sem commit ou publicação.

## Resultado

- `npm run typecheck`: aprovado.
- `npm test`: 2 arquivos de teste aprovados.
- `npm run build:web`: exportação aprovada após os ajustes finais.
- MCP Playwright: `scripts/verificar-livro.js` aprovado contra a exportação local em `localhost:8081`. Larguras 320, 390, 768, 1440 e 1778 px sem overflow externo; sete folhas, limites, inércia das folhas ocultas, privacidade com recarga, diálogo, FAQ, teclado, histórico, gesto horizontal sintético, movimento reduzido e cliques rápidos verificados.
- `scripts/verificar-web.js`: aprovado, substituindo a porta 8082 por 8081 somente na execução; documentos, foco do diálogo, menu móvel, FAQ e armazenamento vazio preservados. O procedimento foi adaptado para navegar até as folhas que contêm os links, mantendo as verificações existentes.
- Inspeção visual de desktop, viewport móvel e quadro intermediário da curvatura. Movimento em 40 faixas com verso sem texto espelhado e sombreamento por inclinação.
- Nenhum erro JavaScript nos fluxos automatizados.

## Limitações

Validação em navegador Chromium com viewport móvel, não em dispositivo físico nem nos aplicativos Android/iOS. O gesto foi sintetizado no navegador; desempenho e sensação tátil em aparelhos reais ainda não foram medidos. Rolagem interna permanece disponível para conteúdo longo, telas baixas e ampliação. As telas de descoberta, detalhe e contato continuam como prévias existentes, sem backend.

## Continuidade

Abrir a apresentação local e recarregar para carregar a nova exportação. Usar Anterior/Próxima ou deslizar horizontalmente. Documentação de comportamento em `spec.md`, implementação visual em `BookPresentation.tsx` e navegação em `useBookNavigation.ts`.
