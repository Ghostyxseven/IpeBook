# Catálogo: descobrir e ver o detalhe de um livro

## Objetivo e escopo

Permitir que a pessoa autenticada **busque, filtre e compare** anúncios de livros e **abra o detalhe** de um deles (pattern "Descobrir livro" do design system). É a feature de Exploração e Descoberta da [divisão de features](../../docs/DIVISAO_FEATURES.md).

Esta entrega cobre **somente a camada de domínio e a ViewModel**, que podem ser verificadas por testes: entidades, regras de busca e ordenação, contrato do repositório, implementação em memória, implementação Supabase (conversão das linhas) e os dois ViewModels. As **telas** (Início/Descobrir, Busca e Detalhe) dependem de inspeção do Figma e de teste em aparelho e ficam para a próxima etapa.

Fora do escopo: publicar, editar e arquivar anúncios (feature de Inventário), solicitar/negociar (feature de Negociação), notificações e configurações, e qualquer dado de exemplo apresentado como real.

## Regras de domínio

- **Modalidades:** Venda, Troca e Doação. O preço (em BRL) existe só na venda; a troca explicita o interesse; a doação é gratuita.
- **Status:** disponível, reservado e concluído. Reservado continua visível e marcado; concluído sai da descoberta.
- **Busca:** ignora acentos e caixa e procura em título, autor e categoria.
- **Filtros:** modalidade e categoria combinam entre si e com a busca.
- **Ordenação:** mais recentes, título (A–Z) e menor preço (doação, depois venda por preço, troca por último).
- **Book Card (conteúdo mínimo):** título, autor, modalidade, preço ou gratuidade, estado do exemplar e localização **só quando informada**.

## Estados da tela de descoberta

Carregando, erro (com nova tentativa), catálogo vazio, sem resultados para a busca/filtro e pronto. Cada estado vem de um único valor (`discoverStatus`) para a View não recombinar flags.

## Critérios de aceite

- Nenhum dado de exemplo faz parte do aplicativo; dados de teste existem só nos testes.
- Linhas incompletas ou inconsistentes vindas do backend (preço ausente na venda, interesse vazio na troca, modalidade ou status desconhecidos) são **descartadas**, nunca completadas.
- Falha de rede, tabela ainda inexistente e erro desconhecido têm mensagens distintas em português.
- O detalhe distingue "carregando", "não encontrado" e "falhou".
- Carregar o catálogo respeita cancelamento (sem atualizar estado depois de desmontar).

## Dependências e pendências

- A tabela `listings` e as políticas de acesso estão **propostas** em [`contracts/listings.sql`](contracts/listings.sql) e **não foram aplicadas**; dependem de decisão da equipe (ver `plan.md`).
- Telas: consultar os quadros Android, iPhone e Web do Figma antes de implementar.

## Validação

Testes de Model e ViewModel (`tests/catalog.test.mjs`), tipos, lint, formatação e build. Sem validação em aparelho nem contra um Supabase real.
