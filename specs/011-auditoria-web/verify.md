# Verificação — 30/09/2026

## Resultado

Implementado e verificado com sucesso na branch `fix/lighthouse-web`. Os problemas apontados no relatório Lighthouse de 30/09/2026 foram corrigidos:

- O zoom móvel foi liberado (remoção de `maximum-scale=1` e `user-scalable=0`).
- A marca foi otimizada para derivados WebP responsivos (96 px, 128 px, 224 px e 320 px com `srcset` e `sizes`), eliminando a transferência do PNG original de 613 KB na Web.
- As imagens possuem largura e altura intrínsecas e proporção 1:1 preservada.
- A fonte Roboto foi convertida para WOFF2 (redução de 488 KB para 222 KB), mantendo pesos, caracteres e licença.
- Arquivos `robots.txt` e `llms.txt` foram criados e validados em formato texto puro.
- URLs de arquivos inexistentes respondem com HTTP 404 sem cair no HTML da aplicação SPA (`vercel.json` com `framework: null`).

## Medições do Lighthouse (CLI 13.5.0)

Comparações executadas em ambiente isolado antes e depois sob condições idênticas:

### Mobile

| Métrica / Categoria                |  Antes   |    Depois    |     Variação     |
| :--------------------------------- | :------: | :----------: | :--------------: |
| **Performance**                    |    64    |    **83**    |     +19 pts      |
| **Acessibilidade**                 |    94    |   **100**    |      +6 pts      |
| **Melhores Práticas**              |    96    |    **96**    |     estável      |
| **SEO**                            |    92    |   **100**    |      +8 pts      |
| **Agentic Browsing**               |    50    |   **100**    |     +50 pts      |
| **LCP (Largest Contentful Paint)** | 7.894 ms | **3.160 ms** | -4.734 ms (-60%) |
| **FCP (First Contentful Paint)**   |  910 ms  |  **910 ms**  |     estável      |
| **TBT (Total Blocking Time)**      |  457 ms  |  **402 ms**  |      -55 ms      |
| **CLS (Cumulative Layout Shift)**  |  0,000   |  **0,000**   |       zero       |

### Desktop

| Métrica / Categoria   |  Antes   |   Depois   |    Variação    |
| :-------------------- | :------: | :--------: | :------------: |
| **Performance**       |    95    |  **100**   |     +5 pts     |
| **Acessibilidade**    |    94    |  **100**   |     +6 pts     |
| **Melhores Práticas** |    96    |   **96**   |    estável     |
| **SEO**               |    92    |  **100**   |     +8 pts     |
| **Agentic Browsing**  |    50    |  **100**   |    +50 pts     |
| **LCP**               | 1.490 ms | **647 ms** | -843 ms (-56%) |
| **FCP**               |  253 ms  | **247 ms** |     -6 ms      |
| **TBT**               |  21 ms   | **40 ms**  |    estável     |
| **CLS**               |  0,000   | **0,000**  |      zero      |

## Evidências

- `npm run typecheck`: aprovado.
- `npm test`: 15 testes aprovados.
- `npm run build:web`: exportação gerada sem erros.
- `node scripts/verificar-recursos-web.mjs`: aprovado (zoom liberado, WOFF2 servido, robots e llms válidos, 404 para arquivos ausentes).
- `node scripts/verificar-documentos.js`: aprovado.
- `node scripts/verificar-gesto-livro.mjs`: aprovado no Chromium via CDP (dobra, arrasto, toques e limites preservados).
- Relatórios JSON salvos em `/tmp/ipebook-lighthouse-depois-completo/`.

## Limitações

- Medições locais refletem a máquina de desenvolvimento e rede local; variações de latência podem ocorrer em produção (Vercel).
- A apresentação interativa continua executada via client-side rendering (SPA), conforme arquitetura do Expo Web.
