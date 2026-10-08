# 018 — Catálogo: descobrir livros

Responsável: Micael Cardoso Reis (ver `docs/DIVISAO_FEATURES.md`).

## Objetivo

Permitir que a pessoa autenticada encontre livros anunciados por outras pessoas, no Android e no iOS, seguindo o pattern **Descobrir livro**: buscar → comparar resultados → abrir detalhe → agir. Os anúncios vêm do Supabase (ADR 0008). A Web continua só com a apresentação institucional (ADR 0005).

Configurações gerais e notificações também são do Micael, mas ficam numa spec própria, depois desta, depois desta.

## Fluxos

1. **Início (Figma 02):** marca e saudação, barra de busca que abre o Explorar, chips Todos/Venda/Troca/Doação que filtram a prévia, os 4 anúncios mais recentes em grade, "Ver todos" e o atalho "Explorar livros para doação". O botão Sair fica no topo até existir a área de Perfil.
2. **Explorar (Figma 03, 12 e 26 a 28):** barra de busca por título, autor ou categoria (a partir de 2 caracteres, com espera de 300 ms), chips de modalidade combináveis, resumo "N livros · Mais recentes", lista com rolagem infinita (20 por página) e "puxar para atualizar". O título muda com o filtro ("Livros à venda.") e, sem resultados, mostra "Ainda não encontramos." com "Explorar todos os livros".
3. **Categoria:** a categoria é encontrada pela busca de texto, como no Figma ("Buscar título, autor ou categoria"); os atalhos do Início abrem o Explorar já filtrado pela modalidade. **Decisão de 02/10/2026 (#26):** a busca basta; não haverá tela própria de categorias. Se a equipe quiser um atalho depois, será uma faixa de chips no Explorar, sem tela nova.
4. **Detalhe do livro (Figma 04, 13 e 14):** capa (foto ou capa ilustrativa), título, autor, destaque da modalidade ("R$ 25,00 · À VENDA", "Troca · POR OUTRO LIVRO", "Gratuito · DOAÇÃO"), **Reservado** quando for o caso, estado e categoria, condições da troca ou descrição, primeiro nome e bairro de quem anunciou e data da publicação.
5. **Navegação:** barra de navegação do Material 3 com Início e Explorar e ícones `expo-symbols` (ADR 0009). Estante e Perfil entram com as features de Anúncios e Perfil.

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

Publicar, editar e arquivar anúncios e as abas Estante e Perfil (feature do Eric); "Combinar encontro" e conversa (feature do Antonio); "ver perfil" e reputação de quem anunciou; "Avisar quando aparecer" e compartilhar no WhatsApp (extras, ver a decisão da #27 em [`docs/DIVISAO_FEATURES.md`](../../docs/DIVISAO_FEATURES.md)); "Livros perto de você" e distâncias (exigem localização, continuam fora); ordenação por distância ou preço; busca por ISBN; catálogo na Web; configurações e notificações (spec futura).

## Favoritar (08/10/2026)

Abertura do extra #2 da decisão #27 (`docs/DIVISAO_FEATURES.md`): o coração no Book
Card e no Book Tile do Início e do Explorar, e no Detalhe, para quem está logado e não
é dono do anúncio. Tabela, RLS e as regras de implementação estão no
[ADR 0032](../../docs/adr/0032-favoritos.md). Critérios de aceite:

- O coração muda na hora do toque (otimista) e volta ao estado anterior se o servidor
  recusar, com o motivo em português.
- Alvo de 48 × 48 e rótulo acessível ("Favoritar Dom Casmurro" / "Remover Dom Casmurro
  dos favoritos"), lido separado do resto do card.
- Dono do próprio anúncio não vê o coração no Detalhe.
- Toda a área `(app)` — Início, Explorar e Detalhe inclusive — já exige sessão
  (`_layout.tsx` redireciona `signedOut` para `/entrar`); não há tela de catálogo
  para quem não entrou, então o coração não precisa de um estado "visitante".
- Model e ViewModel testados com repositório em memória; montagem da consulta e
  mapeamento de erros do Supabase testados com cliente falso (`tests/favorites.test.mjs`).

## Bairro no topo do Início e do Explorar (08/10/2026)

O chip "Centro ⌄" do Figma 02.01 e 02.02 não exige localização: é o bairro do perfil,
já coletado no onboarding (Figma 01.17, spec de Perfil). O chip lê
`ProfileRepository.getProfile()` e abre a tela de editar bairro ao tocar; sem bairro
salvo, convida a escolher um. Cidade continua fixa (ADR 0020) — isto não reabre
localização nem "Livros perto de você".

## Dependências

- Tabela `listings` e bucket de capas definidos no ADR 0008, que precisa da concordância do Eric porque a feature dele grava os anúncios.
- Até a feature de anúncios existir, os testes reais dependem de anúncios inseridos pelo painel do Supabase num projeto de desenvolvimento.

## Referência de design

`docs/design-system/components-patterns.md` (Book Card, Status Badge, Empty State e Descobrir livro), `design-tokens.json` e os quadros do Figma de Início, Buscar e Detalhe. A comparação com o Figma fica registrada no `verify.md`.
