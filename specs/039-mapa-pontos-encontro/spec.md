# 039 — Livros no mapa e pontos públicos de encontro

## Objetivo e escopo

Quem anuncia pode escolher, nomear e remover um ponto público opcional no mapa. Quem explora alterna lista/mapa e toca em capas flutuantes para consultar os livros naquele ponto e abrir seu detalhe. A negociação permite confirmar o ponto sugerido, escolher outro ou continuar apenas com um nome de local.

Plataformas: Android, iOS e Web, Expo SDK 57. O mapa abre em Piripiri; não solicita GPS, não usa endereço do perfil e não publica localização atual. A pessoa confirma que o ponto escolhido é público; isso é uma declaração, não uma verificação automática do estabelecimento.

## Critérios de aceite

1. Ponto opcional com nome e coordenadas válidas, persistido no anúncio; anúncios antigos continuam sem marcador. Editar, remover e retomar rascunho preservam o comportamento.
2. Mapa Mapbox com capas, fallback sem foto, agrupamento de livros no mesmo ponto e detalhes acessíveis. Filtros e paginação continuam funcionais; só anúncios disponíveis com ponto válido aparecem.
3. Negociações guardam cópia do ponto escolhido; mudar o anúncio não muda encontro já combinado. Alterar o nome manualmente remove coordenadas antigas.
4. Sem GPS, dados pessoais, chave secreta ou anúncios fictícios. Chave pública por variável de ambiente; ausência/erro/rede indisponível oferecem retorno à lista e preenchimento textual.
5. Controles de 48 px, foco visível, alternativa por texto/coordenadas à seleção por toque, sem animação contínua. Atribuição Mapbox preservada.
6. Validação de coordenadas e permissões no banco; preservar RLS e bloqueios existentes. Migração aditiva e validação local, sem publicação remota implícita.

## Fora do escopo

Rastreamento, rotas, distância até a pessoa, busca paga de endereços e publicação em produção. O consumo do mapa segue os limites e preços da conta Mapbox; não contratar plano nem modificar cobrança.

## Referência visual

Figma: Explorar Android `10:2`, iOS `70:1313`, descoberta `206:3568`; negociação `206:3607`. Não há quadro específico do mapa com capas: extensão solicitada pelo usuário, usando tokens, BookCard e controles existentes. Registrar essa lacuna em divergências, sem alterar fundamentos globais.
