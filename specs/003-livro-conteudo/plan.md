# Plano

## Direção visual

Preservar os tokens de marca: papel #F6F1E8, superfície #FCFAF6, verde #426B55, verde profundo #2F503D, dourado #F4B942 e texto #3C302A. Roboto permanece na leitura e controles; títulos mantêm a família do contrato. Usar linguagem de livro por meio de capa encadernada, lombada, linhas de corte e marcador, sem substituir a identidade por outra tipografia.

Cada folha combina uma hierarquia editorial própria: capa com ações, ensaio breve e valores, guia com passos e checklist, estante com capas e filtros, perguntas e orientação, agenda de desenvolvimento, colofão e índice. Não preencher áreas com números ou depoimentos fictícios. O sumário melhora acesso direto sem exigir seis viradas.

## Implementação

Manter ADR 0004 e MVVM. Dados demonstrativos e filtros puros no Model; guias, filtro e seleção em hook; componentes específicos de leitura e exemplos na View. Sem dependências novas, backend ou publicação. Reutilizar diálogo nativo, ícones e tokens. Melhorar apresentação do papel e clareza da virada sem alterar a arquitetura.

## Sequência

1. Implementar e testar conteúdo/filtros puros.
2. Implementar e testar estado dos guias e estante.
3. Implementar apresentação enriquecida e sumário.
4. Validar sete folhas, fluxos compra/venda, filtros/vazio/detalhes, foco, dimensões e animação; atualizar documentação.
