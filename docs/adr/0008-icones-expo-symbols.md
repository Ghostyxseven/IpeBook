# 0008 — Ícones com expo-symbols

Data: 30/09/2026

## Status

Aceito. Resolve a pendência de ícones registrada na [spec 013](../../specs/013-base-app-nativo/spec.md).

## Contexto

O `AGENTS.md` pede Material Symbols no Android e SF Symbols no iOS. O Figma usa ícones Material na barra de navegação, na busca e no botão voltar. O app só tinha o componente `Icon` da Web (SVG do HTML), que não funciona no celular. A [spec 015](../../specs/015-catalogo-descoberta/spec.md) precisa de ícones na barra de navegação e na busca.

## Decisão

Usar o **`expo-symbols`** (SDK 57, `~57.0.3`), por meio de um componente único `AppIcon` com o nome de cada ícone nas duas bibliotecas (`{ ios, android, web }`).

- iOS: SF Symbols nativos.
- Android e Web: Material Symbols.
- O `Icon` atual continua só na página institucional Web.

## Alternativas

- **`@expo/vector-icons`:** traz Material Icons (família antiga, não Material Symbols) e não usa SF Symbols no iOS.
- **SVGs próprios com `react-native-svg`:** exigiria desenhar e manter cada ícone, criando uma família nova, o que o design system proíbe.

## Consequências

- O pacote está em beta e pode mudar entre versões do SDK; as atualizações precisam conferir o `AppIcon`.
- Está incluído no Expo Go, então não exige build próprio.
- Cada ícone novo precisa de nome nas duas bibliotecas; ícones sem rótulo visível precisam de rótulo acessível no controle que os contém.

Referência: [Expo — Symbols (SDK 57)](https://docs.expo.dev/versions/v57.0.0/sdk/symbols/).
