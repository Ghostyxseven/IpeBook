# Verificação — 01/10/2026

## Resultado

Implementado e verificado. Nenhum texto da página institucional fica abaixo de 12 px.

## Evidências

- **Estilos:** nenhuma regra `font-size` com valor abaixo de 12 px em `book-experience.css` e `institutional.css` (antes havia valores de 8, 9, 10 e 11 px).
- **Renderização:** em Chromium, contra a exportação atual da `develop` (`npm run build:web`), medi o tamanho calculado de todo texto visível no DOM. O menor encontrado foi **12 px** em todos os casos:
  - celular 390 × 844: leitura normal (200 textos), livro 3D (200), `/privacidade` (116) e `/termos` (97);
  - desktop 1440 × 900: leitura normal (210), livro 3D (210), `/privacidade` (121) e `/termos` (102).
- **Layout:** na entrega original, em 1440 × 900 e 390 × 844 não houve rolagem horizontal nem erros de JavaScript, e o livro e a leitura normal continuaram íntegros.
- `npm run verify` e `npm run build:web` aprovados na entrega original e na `main` (79 testes).

## Limitações

- A medição vale para o DOM renderizado no Chromium; texto dentro de imagens e o texto de fallback de fontes não entra na medição.
- Sem teste em aparelho real, com o zoom do sistema ampliado nem com leitor de tela.
- As telas nativas (Android e iOS) não fazem parte desta spec.
