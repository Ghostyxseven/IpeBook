# Verificação — 30/09/2026

## Resultado

Implementado e verificado na apresentação Web. A folha acompanha o arrasto horizontal nos dois sentidos; confirmar, retornar e retomar a finalização preservam o progresso. Hash e contador só avançam após confirmação do gesto. Foram reduzidas de 60 para 12 as cópias decorativas, e a finalização usa o token de 250 ms. Não houve instalação de dependências.

O relato adicional sobre o FAQ foi corrigido: arrastar sobre `summary` vira a página; toque simples abre/fecha a resposta. Links, botões e campos continuam protegidos contra início de virada.

## Evidências

- `node tests/book-turn.test.mjs`: oito testes aprovados, incluindo transferência de captura do filho, retorno, retomada, movimento reduzido, redimensionamento, controles e FAQ.
- `npm test`: suíte do projeto aprovada.
- `npm run typecheck`: aprovado.
- `npm run build:web`: exportação aprovada.
- `node scripts/verificar-gesto-livro.mjs`: aprovado no Chromium via CDP, sem Playwright, com eventos reais de toque em viewport de 390 × 844 e desktop de 1440 × 900.
- Fluxos CDP: folha parcialmente dobrada antes de soltar; confirmação; voltar; gesto curto; cancelamento; inversão; retomada durante finalização; primeira e última páginas; proteção de botões; rolagem vertical; movimento reduzido; controles desktop e teclado sem animação. Também foram testados arrasto nas perguntas do FAQ e toque para abrir e fechar a resposta. Sem exceções JavaScript capturadas.
- Capturas inspecionadas: `/tmp/ipebook-gesto/celular-inicio.png`, `celular-arrasto.png`, `celular-sobre.png` e `desktop-sobre.png`. A dobra mostra o capítulo seguinte, sem overflow horizontal externo.
- Formatação dos arquivos desta entrega e `git diff --check`: aprovados.

O teste real identificou a perda de captura implícita de um descendente ao transferir o gesto para o palco. O controlador agora ignora essa transferência e cancela somente a perda de captura do próprio palco; a regressão recebeu teste.

## Repetição local

1. Executar `npm run build:web`.
2. Servir a exportação: `python3 -m http.server 8089 --bind 127.0.0.1 --directory dist`.
3. Iniciar Chromium isolado com depuração local: `chromium --headless --remote-debugging-port=9333 --user-data-dir=/tmp/ipebook-validacao about:blank` (este ambiente exigiu `--no-sandbox` e autorização para iniciar/conectar ao processo).
4. Executar `node scripts/verificar-gesto-livro.mjs`. As variáveis `IPEBOOK_TEST_URL`, `IPEBOOK_CDP_URL` e `IPEBOOK_SCREENSHOTS` permitem escolher servidor, depurador e pasta das capturas.

## Limitações e continuidade

Validação realizada em Chromium com emulação de toque, não em aparelho físico nem em Safari/iOS. Não foi medida taxa de quadros; a redução do custo é estrutural, sem promessa de FPS. Não foram usados os scripts antigos baseados em Playwright, conforme preferência global do usuário.

Branch mantida: `feature/pagina-institucional-pr`; referência inicial `444ebe9`. Sem commit ou publicação. Alterações simultâneas de sumário móvel e documentos legais foram preservadas; não pertencem a esta entrega. A documentação mantém a interação em livro como divergência deliberada da referência Figma `53:185`.
