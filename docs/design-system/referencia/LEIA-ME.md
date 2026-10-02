# Referência do Design System (artifact)

Cópia, em arquivos, do design system IpêBook publicado como artifact (https://claude.ai/artifact/Samu6TYyrkgcwy117iaBhu). Serve para que qualquer pessoa ou agente de IA consulte as regras sem sair do repositório.

## Como usar

1. Comece por [`README.md`](README.md): voz, fundamentos visuais, iconografia, plataformas.
2. Consulte a seção da plataforma: [`ios.md`](ios.md), [`web.md`](web.md), [`tipografia.md`](tipografia.md), [`movimento-e-estados.md`](movimento-e-estados.md), [`acessibilidade.md`](acessibilidade.md).
3. Antes de criar um controle, leia `components/<Nome>/README.md` (Button, Chip, Tag, TextField, BookCard, IOSTabBar etc.). Os `preview.html` não foram copiados.
4. Valores de cor, tipografia, espaço e raio estão em [`tokens.json`](tokens.json).

## Relação com as outras fontes

- O contrato de implementação continua sendo o [`design-tokens.json`](../../../design-tokens.json) da raiz. Esta pasta é referência de consulta; se houver divergência com ele, registre no PR e alinhe Figma, tokens e documentação no mesmo fluxo.
- Regras gerais: [`docs/design-system.md`](../../design-system.md) e demais arquivos de `docs/design-system/`.
- Não invente cor, medida, radius, ícone ou componente que já exista aqui.
