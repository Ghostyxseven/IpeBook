# 015 — Catálogo: descobrir livros

Responsável: Micael Cardoso Reis (ver `docs/DIVISAO_FEATURES.md`).

## Objetivo

Permitir que a pessoa autenticada encontre livros anunciados por outras pessoas, no Android e no iOS, seguindo o pattern **Descobrir livro**: buscar → comparar resultados → abrir detalhe → agir. Os anúncios vêm do Supabase (ADR 0007). A Web continua só com a apresentação institucional (ADR 0005).

Configurações gerais e notificações também são do Micael, mas ficam numa spec própria (016), depois desta.

## Fluxos

1. **Início (feed):** saudação, atalho para a busca, lista de categorias e os anúncios disponíveis mais recentes em Book Cards, com rolagem infinita (20 por página) e "puxar para atualizar". Mantém o botão Sair até existir a área de Perfil.
2. **Buscar:** campo de busca por título ou autor (a partir de 2 caracteres, com espera de 300 ms após a digitação) e filtros por modalidade (**Venda**, **Troca**, **Doação**) e categoria, combináveis. Mostra a quantidade de filtros ativos e permite limpar tudo.
3. **Categoria:** ao tocar numa categoria no Início, abre Buscar com a categoria já filtrada.
4. **Detalhe do livro:** capa, título, autor, Status Badge da modalidade (e **Reservado**, quando for o caso), preço em BRL na venda, "Gratuito" na doação, condições na troca, estado do exemplar, categoria, bairro e cidade, descrição, primeiro nome de quem anunciou e data da publicação.
5. **Navegação:** abas inferiores Início e Buscar dentro de `(app)`. As outras features acrescentam suas abas depois.

## Aceite

- Só aparecem anúncios com situação `disponivel` ou `reservado`, de outras pessoas. Anúncios próprios, arquivados ou concluídos não aparecem.
- Book Card mostra o conteúdo mínimo do design system: capa (ou marcador sem imagem com rótulo acessível), título, autor, modalidade, preço ou gratuidade, estado do exemplar e localização quando houver.
- Status Badge sempre com texto; a cor vem de `color.badge.*` e só reforça.
- Preço formatado em BRL (`R$ 25,00`) somente na venda.
- Estados: carregando (primeira página e próximas), vazio sem anúncios ("Ainda não há livros anunciados"), nenhum resultado na busca (com ação "Limpar filtros"), erro com "Tentar de novo", sem conexão (banner existente) e anúncio não encontrado no detalhe.
- Sem as variáveis do Supabase, as telas mostram que o catálogo não foi configurado; o app não exibe livros de exemplo como se fossem reais.
- A busca não dispara para menos de 2 caracteres; respostas antigas não sobrescrevem a mais recente.
- Localização mostra só bairro e cidade; nunca endereço.
- Alvos de 48 × 48, rótulos acessíveis em ícones e cards (título, autor, modalidade e preço lidos juntos), títulos com papel de cabeçalho, texto ampliável e respeito a movimento reduzido.
- Model e ViewModels testados com repositório em memória; montagem da consulta e mapeamento de erros do Supabase testados com cliente falso.

## Fora do escopo

Publicar, editar e arquivar anúncios (feature do Eric), solicitar o livro e conversar (feature do Antonio), perfil de quem anunciou, favoritos, ordenação por distância ou preço, busca por ISBN, catálogo na Web, configurações e notificações (spec 016).

## Dependências

- Tabela `listings` e bucket de capas definidos no ADR 0007, que precisa da concordância do Eric porque a feature dele grava os anúncios.
- Até a feature de anúncios existir, os testes reais dependem de anúncios inseridos pelo painel do Supabase num projeto de desenvolvimento.

## Referência de design

`docs/design-system/components-patterns.md` (Book Card, Status Badge, Empty State e Descobrir livro), `design-tokens.json` e os quadros do Figma de Início, Buscar e Detalhe. A comparação com o Figma fica registrada no `verify.md`.
