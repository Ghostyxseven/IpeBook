# 040 — Aplicativo Web responsivo

## Objetivo e escopo

Quem usa o IpêBook pelo navegador deve encontrar uma interface adequada à largura da janela, sem perder os fluxos existentes de acesso, descoberta, anúncios, conversas, perfil e configurações. A versão compacta preserva o comportamento atual de celular; a média e a larga usam os padrões Web já documentados em `docs/design-system/referencia/web.md`.

Esta entrega altera somente apresentação e navegação Web. Não muda autenticação, contratos do banco, regras de negócio, aplicativos Android/iOS nem a página institucional em `/`.

## Critérios de aceite

1. Abaixo de 600 px, navegação inferior e telas compactas continuam utilizáveis, sem rolagem horizontal indesejada.
2. Entre 600 e 1199 px, a área autenticada usa navegação lateral; a partir de 1200 px, usa cabeçalho Web. A rota e a indicação da seção ativa permanecem corretas.
3. As telas de acesso oferecem composição em duas colunas em janela larga, preservando largura legível para formulários e estados de erro, carregamento e sucesso.
4. Descoberta, estante e listas aproveitam a largura disponível com cartões em múltiplas colunas onde apropriado; detalhes, formulários, conversas e configurações recebem limites de leitura ou painéis coerentes.
5. Controles permanecem acessíveis por teclado, com foco visível, alvos de pelo menos 48 px, rótulos e ordem de leitura coerentes. Não há dependência exclusiva de hover.
6. Tokens e padrões Web documentados são reutilizados; divergências da referência visual são registradas. Typecheck, lint, formatação, testes e exportação Web passam. Fluxos visuais compactos e largos são conferidos quando houver navegador disponível.

## Riscos concretos

- Quebrar a navegação do Expo Router ao mudar a posição da barra de abas.
- Aumentar a largura sem organizar o conteúdo, prejudicando leitura e hierarquia.
- Alterar involuntariamente Android/iOS ao reutilizar componentes compartilhados.
- Renderizar muitos cartões ou painéis de conversa sem preservar paginação e estados vazios.

## Referências

- `docs/design-system/referencia/web.md` e componentes WebHeader, WebThreePane e Breakpoints.
- `design-tokens.json` e `docs/design-system.md`.
- Captura do cadastro Web fornecida pelo usuário em 10/10/2026. O quadro atual do Figma deve ser reconferido antes de declarar paridade visual, pois não ficou acessível nesta sessão.
