# Verificação — 01/10/2026

- Primeira carga em 390 × 844 (sem compressão): 796 KB em 10 requisições → 510 KB. Fonte: 222 KB → 50 KB; `book-open.svg` (117 KB) deixou de ser baixado. O que sobra é principalmente o JavaScript (376 KB sem compressão; a Vercel o serve comprimido).
- Subset da fonte: eixos `wght` 100–900 e `wdth` 75–100 mantidos; dos 28 caracteres não ASCII do projeto, nenhum existente na fonte original foi perdido. `←`, `↑`, `↗` e `✳` já não existiam na Roboto e usam a fonte reserva, como antes.
- Renderização conferida em Chromium (acentos, pesos e títulos corretos).
- `scripts/verificar-recursos-web.mjs` aprovado; `npm run verify` e `npm run build:web` aprovados.
- Não alterados: `assets/book-open.png` (1,4 MB), `logo-clean.png` e `logo.jpg` não são usados pela Web nem pelo `app.json`; ficam como arte-fonte do repositório.
- Limitação: medido sem compressão e sem a rede real da Vercel.
