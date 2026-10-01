# Verificação — 01/10/2026

- `npm run verify` aprovado (6 testes novos em `tests/routes.test.mjs`).
- Chromium contra a exportação, servida com fallback para `index.html` (como a Vercel):
  1. `/privacidade` direto: documento e título corretos;
  2. `/#privacidade`: redireciona para `/privacidade`;
  3. `/xyz`: vai para `/`;
  4. `/#informacoes`: capítulo correto;
  5. clique em "Termos de Uso" no rodapé: `/termos` sem recarregar (marcador em memória preservado);
  6. voltar: `/#informacoes`, ainda sem recarregar; avançar: `/termos`;
  7. "Voltar à apresentação" e logo: `/#inicio`; "Quero comprar": `/#como-funciona`;
  8. celular: menu → Privacidade abre `/privacidade` e fecha o menu;
  9. 0 erros de JavaScript.
- Limitações: não testado na Vercel de verdade nem em aparelho real; caminhos desconhecidos respondem 200 (aplicação de arquivo único); sem `sitemap.xml` e sem URL canônica até haver domínio.
