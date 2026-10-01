# Endereços reais para os documentos legais

## Objetivo e escopo

Dar endereço próprio aos documentos (`/termos`, `/privacidade`, `/lgpd`, `/seguranca`), mantendo os capítulos do livro como fragmentos da raiz. Decisão no [ADR 0010](../../docs/adr/0010-rotas-reais-para-documentos.md).

Fora do escopo: rotas para os capítulos, `sitemap.xml` e URL canônica (dependem do domínio), página 404 personalizada (a hospedagem responde o 404 padrão).

## Critérios de aceite

- Abrir `/privacidade` (e os outros três) mostra o documento, com título e descrição próprios.
- Links antigos `/#privacidade` redirecionam para `/privacidade`; na hospedagem, caminhos desconhecidos respondem 404 (só os quatro documentos são reescritos para `index.html`). Em servidor de desenvolvimento que devolve o `index.html` para tudo, a ViewModel leva caminhos desconhecidos para `/`.
- Clicar em links internos não recarrega a página; voltar e avançar do navegador restauram o documento ou o capítulo.
- O menu do celular fecha e os diálogos fecham ao navegar.
- Abrir em nova aba, ctrl/cmd+clique e links externos continuam com o navegador.
- Rodapé, menu, sumário, diálogos e `llms.txt` apontam para os novos endereços.

## Validação

Testes do Model e da ViewModel, tipos, lint, formatação, build e verificação em Chromium com servidor que imita o `rewrite` da Vercel (URL direta, link antigo, `/xyz`, clique, voltar/avançar, celular).
