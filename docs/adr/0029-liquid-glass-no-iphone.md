# 0029 — Liquid Glass no iPhone

Data: 07/10/2026

## Status

Aceito, implementado em parte: a barra de abas já usa o vidro. Falta aplicar nos botões
circulares da barra superior e conferir num iPhone real (issue #44).

## Contexto

O Figma desenha as telas do iPhone com o kit "iOS and iPadOS 26", em que a camada de
navegação flutua sobre o conteúdo em Liquid Glass. O app usava no iPhone as mesmas
superfícies sólidas do Android, então a barra de abas e os controles flutuantes não
correspondiam ao quadro.

A [referência do design system](../design-system/referencia/ios.md) já define a receita e,
o que importa mais, os limites:

- **Onde:** só na camada de navegação que flutua — barra de abas, botões circulares da
  barra superior, barra de mensagem, controles sobre a câmera e sobre a capa.
- **Onde não:** listas, cartões, campos e textos ficam em superfícies sólidas
  (`ios-cell`, `ios-grouped-background`). Vidro sobre vidro também não.
- **Receita:** `glass-fill` + desfoque de 22 pt e saturação de 180% + `glass-stroke` de
  0,5 pt + `glass-shadow`.
- Com **Reduzir Transparência** ligado, o vidro vira superfície sólida (`ios-cell`).

O React Native não desfoca nada por conta própria: sem uma biblioteca, "vidro" vira um
retângulo translúcido chapado, que não é o efeito e ainda por cima piora o contraste.

## Decisão

Adotar o Liquid Glass no iPhone com um componente próprio, `GlassSurface`, e os tokens da
referência copiados para `design-tokens.json` (`color.ios.glass*`, `platform.ios.glassBlur`,
`platform.ios.glassSaturation`, `border.hairline`).

- **`expo-blur` (~57.0.3) entra como dependência.** É o módulo oficial do Expo para desfoque
  e acompanha a versão do SDK em uso. Sem ele não há desfoque no iOS.
- **`GlassSurface` concentra a regra.** Quem usa não decide plataforma nem acessibilidade:
  fora do iPhone, e com "Reduzir Transparência" ligado, o componente devolve a célula
  sólida. As props de `View` seguem adiante, para papéis e rótulos de acessibilidade não se
  perderem justamente onde o vidro entra.
- **O vidro é acabamento, nunca legibilidade.** Nenhum texto ou estado depende dele: o que
  se lê sobre o vidro também se lê sobre a superfície sólida.

## Alternativas

- **Translúcido sem desfoque, para não adicionar dependência:** foi a primeira ideia e foi
  descartada. O efeito depende do desfoque; sem ele o resultado é um painel leitoso que
  reduz o contraste do que está atrás e não se parece com o quadro.
- **`backdrop-filter` via CSS:** resolveria só a Web. O iPhone, que é o alvo, ficaria de fora.
- **Aplicar vidro em cartões e listas:** contraria a referência, que reserva o efeito à
  camada que flutua, e cria vidro sobre vidro.

## Consequências

- O app ganha uma dependência nativa. **O build do EAS (issue #51) precisa ser refeito**
  depois desta mudança; não basta recarregar o JavaScript.
- A saturação de 180% da receita não tem equivalente no `expo-blur`, que só expõe
  `intensity` e `tint`. O desfoque e o preenchimento ficam fiéis; a saturação não é
  aplicada. Registrado em `docs/design-system/divergencias.md`.
- O `intensity` do `expo-blur` vai de 1 a 100 e não é medido em pontos. O token guarda os
  22 pt da referência e o componente os usa como intensidade — é uma aproximação, não uma
  conversão, e precisa de conferência num iPhone real.
- Android e Web não mudam: continuam com as superfícies sólidas do Material 3 e do
  responsivo. Não há token de vidro para essas plataformas, e um teste garante isso.
