# 0008 — Endereços reais para os documentos legais

Data: 01/10/2026

## Status

Aceito. Substitui, em parte, o [ADR 0004](0004-pagina-institucional-web.md), que usava fragmentos (`/#privacidade`) para os documentos.

## Contexto

Links como `/#privacidade` não são tratados por buscadores como páginas distintas, o servidor não os enxerga e eles ficam menos claros ao serem compartilhados. A hospedagem na Vercel já devolve o `index.html` para qualquer caminho (`rewrites` em `vercel.json`), e a página continua sendo uma aplicação de arquivo único.

## Decisão

- Os documentos passam a ter endereço próprio: `/termos`, `/privacidade`, `/lgpd` e `/seguranca`.
- Os capítulos do livro continuam como fragmentos da raiz (`/#sobre`, `/#como-funciona`...), porque são âncoras de uma única página, e o livro e a leitura normal já dependem delas.
- A resolução do endereço fica no Model (`resolveRoute`, `canonicalPath`); a ViewModel usa a API de histórico (`pushState`, `popstate`) e expõe `navigate`; a View intercepta cliques em links internos e não recarrega a página. Abas novas, download e teclas modificadoras seguem com o navegador.
- Links antigos (`/#privacidade`) e caminhos desconhecidos são levados ao endereço canônico com `replaceState`.
- Sem roteador externo: o ADR 0004 já rejeitou o Expo Router para a Web, e três regras de resolução não justificam outra dependência.

## Alternativas

- Manter fragmentos: simples, mas ruim para compartilhar e para buscadores.
- Expo Router na Web: aumenta o JavaScript inicial, que a entrada Web evita de propósito.
- Também transformar os capítulos em rotas (`/sobre`): quebraria a mecânica do livro e da leitura normal, sem ganho claro.

## Consequências

- A hospedagem precisa devolver o `index.html` para qualquer caminho; em `vercel.json` isso já existe.
- Caminhos desconhecidos mostram a página inicial com status HTTP 200 (não há 404 de verdade em uma aplicação de arquivo único) e a URL é corrigida para `/`.
- Mapa do site (`sitemap.xml`) e URL canônica dependem do domínio definitivo, que ainda não foi informado; ficam como pendência.
