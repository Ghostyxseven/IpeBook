# Verificação — 01/10/2026

- `npm run verify` aprovado (testes novos: padrão sem gravar, gravação e prioridade da escolha, valores inválidos, armazenamento bloqueado).
- Chromium em 390 × 844 contra a exportação:
  1. ao abrir: `localStorage` vazio, sem cookies, `sessionStorage` vazio;
  2. ao escolher Leitura normal: só `ipebook:modo-de-leitura=normal`;
  3. ao recarregar: continua em Leitura normal;
  4. ao voltar ao livro e recarregar: continua no livro; sem erros de JavaScript;
  5. com movimento reduzido e sem escolha: começa na leitura normal.
- Limitação: sem teste em aparelho real, em navegador com armazenamento bloqueado de verdade nem com leitor de tela.
