# Plataformas e acessibilidade — IpêBook

## Android

- Material 3 para componentes e navegação.
- Material Symbols para ícones.
- Altura base de controle: 56 px.
- Margem de página: 24 px.
- Respeitar barra de sistema, gesto de voltar e áreas seguras.

## iOS

- Componentes e padrões nativos da biblioteca iOS do projeto.
- SF Symbols para ícones.
- Altura base de controle: 52 px.
- Margem de página: 24 px.
- Respeitar safe areas, teclado, navegação e sheets nativos.

## Web

- Grid de 12 colunas.
- Gutter 24 px.
- Conteúdo máximo 1280 px.
- Margem base 32 px.
- Altura base de controle: 48 px.
- Hover não substitui foco.
- Navegação completa por teclado.
- No app, a navegação compacta fica no rodapé, a média e a expandida usam trilho lateral e a larga usa cabeçalho persistente. Conteúdo geral cabe em até 1280 px; leitura e formulários usam limites menores.

## Equivalência, não cópia

O fluxo e a semântica devem ser equivalentes entre plataformas, mas os componentes não precisam ser pixel a pixel iguais. Não copie Android para iOS ou mobile para Web.

## Checklist de acessibilidade

- 48 × 48 px em áreas interativas.
- Rótulo acessível para ações somente com ícone.
- Foco visível na Web.
- Estado não comunicado apenas por cor.
- Mensagem de erro específica e próxima da origem.
- Ordem de leitura coerente.
- Zoom e texto ampliado preservam ações críticas.
- Movimento reduzido respeitado.
