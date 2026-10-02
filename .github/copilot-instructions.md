# Instruções do GitHub Copilot — IpêBook

Leia [`AGENTS.md`](../AGENTS.md) antes de propor mudanças na interface.

Fontes obrigatórias:

1. [`design-tokens.json`](../design-tokens.json) — contrato de implementação.
2. [`docs/design-system.md`](../docs/design-system.md) — visão geral.
3. [`docs/design-system/`](../docs/design-system/) — foundations, components, platforms, acessibilidade e governança.
4. [Figma](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile?node-id=20-207) — referência visual.

Para cada tela, identifique Android, iOS ou Web. Android segue Material 3; iOS usa padrões nativos e SF Symbols; Web usa grid responsivo, hover/focus e teclado.

Reutilize tokens, componentes e patterns existentes. Não crie hex, spacing, radius, motion ou família de ícones paralelos quando houver equivalente no sistema. Preserve Venda, Troca, Doação, Reservado e Concluído. Produza textos em pt-BR, componentes reutilizáveis, estados acessíveis e áreas interativas mínimas de 48 × 48 px.

Qualquer divergência intencional do Figma ou do contrato visual deve ser documentada no PR.
