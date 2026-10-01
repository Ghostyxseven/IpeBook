# Otimizar recursos da página

## Objetivo e escopo

Reduzir o peso da primeira visita à página institucional, principalmente em conexões móveis. Mede-se o que é de fato baixado e remove-se o que é desnecessário. Não altera a aparência.

## Critérios de aceite

- A fonte Roboto da Web carrega só os caracteres usados em português, com os eixos variáveis de peso e largura mantidos, e nenhum caractere usado no projeto some.
- A fonte recebe um nome novo, para não ficar presa no cache imutável do arquivo antigo.
- O favicon deixa de usar o `book-open.svg` (um PNG embutido de 117 KB); os favicons PNG continuam.
- Arquivos duplicados e não usados em `public/` deixam de ser publicados.
- O comando que gera a fonte fica registrado em `scripts/gerar-fonte-web.sh`.

## Validação

Medição de rede em Chromium (390 × 844), verificador de recursos, tipos, lint, formatação, testes e build.
