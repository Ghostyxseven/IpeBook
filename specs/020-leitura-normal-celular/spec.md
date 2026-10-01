# Leitura normal no celular

## Objetivo e escopo

Corrigir o aspecto da leitura normal (spec 017) em telas estreitas. Em 352 px o seletor encolhia para 208 px e os rótulos quebravam em até 3 linhas (botões de 61 px), porque a folha mantinha a moldura e a margem de 24 px do desktop e a barra do seletor tinha recuo de 48 px.

## Critérios de aceite

- Até 760 px, a folha da leitura normal ocupa a largura toda, sem moldura, raio nem sombra, como o livro.
- O seletor ocupa a largura disponível; cada botão tem 48 px de altura e o rótulo cabe em uma linha em 320, 352, 390 e 768 px.
- Abaixo de 380 px os ícones do seletor são ocultados para dar espaço aos rótulos.
- Sem rolagem horizontal e sem erros de JavaScript.

## Validação

Tipos, lint, formatação, testes, build e medição em Chromium (320, 352, 390 e 768 px) nos dois modos.
