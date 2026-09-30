# 009 — Folha acompanha o gesto

## Objetivo e escopo

Melhorar a virada da apresentação Web, especialmente no navegador de celular. Preservar os sete capítulos, a curvatura, os controles, o sumário e o conteúdo. Não alterar telas nativas nem instalar dependências.

## Comportamento e aceite

- Arrasto horizontal move a folha continuamente antes de soltar o dedo, nos dois sentidos.
- Soltar após 35% da largura ou com impulso suficiente conclui; gesto curto, reversão e cancelamento retornam sem mudar o capítulo.
- Um novo toque durante a finalização retoma a posição visível; gestos verticais preservam a rolagem, botões, links e campos internos não iniciam virada; perguntas do FAQ aceitam arrasto horizontal e preservam abrir/fechar com toque simples. Dedos adicionais não assumem o gesto.
- Primeira/última página não ultrapassam limites. Redimensionamento e desmontagem limpam o efeito.
- Hash, contador e anúncio acessível só mudam quando o gesto é confirmado. Movimento reduzido e teclado fazem troca direta.
- Reduzir de 60 para 12 cópias decorativas; finalizar em até 250 ms após soltar. A orientação animada para após três ciclos ou uso do gesto.

## Validação

Testes de comportamento com Node/JSDOM, tipos, exportação Web e Chromium via CDP (sem Playwright): arrasto parcial, conclusão, retorno, inversão, interrupção, rolagem, controles, limites, movimento reduzido e tamanhos celular/desktop. Inspecionar capturas. Sensação física em aparelho real deve ser distinguida da emulação.
