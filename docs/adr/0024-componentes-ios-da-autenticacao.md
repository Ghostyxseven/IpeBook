# 0024 — Componentes do iPhone nas telas de acesso

Data: 03/10/2026

## Status

Proposto, implementado (issue #10). Falta validar num iPhone real com VoiceOver.

## Contexto

O Figma (página 07 · iPhone, seção 01 · Acesso) desenha as telas de acesso com os componentes do kit "iOS and iPadOS 26": Text Field em célula preenchida, Button - Content Area em cápsula, lista agrupada com marca de seleção e Toggle no aceite dos termos. O app usava no iPhone a mesma forma do Android, com borda e rótulo em negrito.

## Decisão

- **Sem biblioteca nova:** os controles continuam em React Native (`Pressable`, `TextInput`, `Switch`), com estilos por plataforma nos componentes de `components/ui`. O `Switch` do React Native já é o UISwitch nativo no iOS, e o `TextInput` já traz teclado, preenchimento automático e código de uso único do sistema.
- **Campo (iOS):** rótulo `typography.iosFootnote` acima, célula `color.ios.cell` com raio 12 (`platform.ios.fieldRadius`), sem borda; a borda aparece só no foco e no erro. Valor em `typography.iosBody`.
- **Botão (iOS):** cápsula de 50 px (`platform.ios.controlHeight`), rótulo `iosBody` sem negrito. O secundário vira o botão sem borda do sistema.
- **Aceite (iOS):** linha agrupada com ícone `doc.text` e chave. A linha inteira é o controle acessível (`accessibilityRole="switch"`).
- **Escolha única (iOS):** `RadioGroup` mostra a lista agrupada com cabeçalho em maiúsculas e separadores `color.ios.separator`; o item selecionado tem `checkmark`.
- **Tokens:** `platform.ios.fieldRadius` mudou de 20 para 12 e `platform.ios.controlHeight` de 52 para 50, como no Figma. Entraram `color.ios.*` e `typography.ios.*`.

## Consequências

- O Android e a Web não mudam.
- Outras telas que usam `metrics.fieldRadius` ou `metrics.controlHeight` no iPhone ficam com 12 px e 50 px.
- O alvo mínimo de 48 × 48 continua garantido (`Math.max(controlHeight, touchTarget)`).
- A barra de navegação "Liquid Glass" e os botões "Continuar com a Apple/Google" do quadro iOS ficam de fora: não há login social (veja a spec 014).
