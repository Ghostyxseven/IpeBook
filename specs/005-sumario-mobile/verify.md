# Verificação: Sumário Editorial Mobile e Ajuste da Fita

## Verificações Realizadas

1. **Testes Automatizados (`npm test`)**:
   - 7 testes em `tests/*.test.mjs` executados com sucesso (testes de ViewModel de navegação, experiência do livro e documentos institucionais).

2. **Inspeção Visual e Interativa via Playwright MCP**:
   - **Viewport Mobile (390x844)**:
     - Sumário aberto via clique no botão `menu-toggle`.
     - 6 capítulos numerados (`01` a `06`) renderizados com títulos e subtítulos legíveis.
     - Capítulo atual (`Início`) destacado suavemente com `aria-current="page"`.
     - Card de comunidade com Instagram `@ipebook`, badge com ícone de folha e indicação de link externo `↗`.
     - Rodapé com nota de localização ("Em construção para Piripiri, Piauí"), botões "Entrar" (outline) e "Criar conta" (primário) com touch targets de 48px, e links legais.
     - Fechamento do drawer funcionando via botão `✕ Fechar`.
   - **Viewport Desktop (1200x800)**:
     - Barra de navegação superior intacta e horizontal.
     - Fita marcadora na capa (`.cover-scene-caption`) posicionada na borda superior direita do livro, sem nenhuma colisão com o título "Histórias que continuam." nem com o logotipo do Ipê.

## Correção do cabeçalho — 30/09/2026

- Causa: a regra da apresentação em livro impunha altura mínima de 88 px, enquanto o painel começava em 56 px; o contêiner também somava margem e padding lateral.
- Tokens compartilhados agora fixam a linha superior em 72 px e margens em 16 px. Marca e Fechar ficam entre y=12 e y=60; o painel começa em y=72 e o título em y=80.
- MCP Playwright em 320×844, 390×844 e 768×844: sem sobreposição ou transbordamento horizontal, alinhamento lateral confirmado e botão com 48 px de altura. Abertura, fechamento por botão, Escape e navegação para Sobre funcionaram.
- Capturas inspecionadas em 390×844 e 1440×900: cabeçalho íntegro e divisor legível no celular; navegação horizontal preservada no desktop. Arquivos locais: `.playwright-mcp/ipebook-menu-corrigido.png` e `.playwright-mcp/ipebook-desktop-corrigido.png`.
- `npm test`: 4 arquivos de teste aprovados, nenhuma falha. `npm run typecheck` e `npm run build:web`: aprovados. Diff revisado.
- Limites: validação no navegador Chromium, sem teste em aparelho físico ou validação de áreas seguras reais de iOS. Não houve publicação.
- Branch mantida: `feature/pagina-institucional-pr`, base observada `444ebe9`. O diretório `specs/009-folha-acompanha-gesto/` surgiu durante o trabalho e foi preservado sem alterações.
