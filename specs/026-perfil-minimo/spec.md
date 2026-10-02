# 026 — Perfil mínimo: Meu perfil, Minha estante e sair

Responsável: Eric Vinícius dos Santos Oliveira (ver `docs/DIVISAO_FEATURES.md`). Issue #37.

## Objetivo

Dar à pessoa um lugar seu dentro do aplicativo: ver quem ela é na comunidade, cuidar dos próprios anúncios e sair da conta. É o mínimo do perfil para o trabalho — avaliações, histórico e o perfil de outras pessoas ficaram para a issue #53.

Depende da spec 025: a Minha estante é a lista de anúncios que a feature de anúncios criou, e as ações de editar, arquivar e excluir são as de lá.

## Fluxos

1. **Minha estante (Figma 07):** os próprios anúncios, dos mais recentes aos mais antigos, em todas as situações. Cada um mostra capa, título, autor, destaque da modalidade e a situação por extenso, com as ações permitidas por aquela situação. Sem nenhum anúncio, um estado vazio que leva a publicar o primeiro.
2. **Meu perfil (Figma 10):** nome e e-mail de quem está na sessão, um resumo de quantos anúncios estão publicados, atalho para a Minha estante e o botão **Sair**.
3. **Navegação:** as abas **Estante** e **Perfil** entram na `NavigationBar` do Material 3, ao lado de Início e Explorar, com ícones `expo-symbols` (ADR 0009).
4. **Sair sai do Início:** o botão que estava no topo da tela de Início passa para o Perfil, que é onde as pessoas procuram.

## Aceite

- As abas Estante e Perfil aparecem na barra; Início e Explorar continuam funcionando como antes.
- O botão Sair não existe mais no topo do Início e existe no Perfil.
- A estante mostra anúncios em todas as situações, com a situação por extenso — não só a cor.
- Um anúncio em negociação mostra por que não dá para mexer, em vez de botões desabilitados sem explicação.
- Estados: carregando, vazio ("Você ainda não anunciou nenhum livro"), erro com "Tentar de novo" e aviso quando uma ação é recusada.
- O perfil não inventa dado: mostra o que a sessão tem (nome e e-mail) e o que dá para contar dos anúncios. Nada de avaliação ou reputação, que são da #53.
- Alvos de 48 × 48, rótulos acessíveis, títulos com papel de cabeçalho e texto ampliável.
- ViewModels testadas com repositório em memória.

## Fora do escopo

Avaliações, histórico de trocas e perfil de outras pessoas (#53); excluir a conta (#47); editar o próprio nome ou foto; configurações e notificações (spec futura do Micael, que entra pelo Perfil).

## Dependências

- **Spec 025**: `useMyListingsViewModel` e as ações de anúncio.
- `src/app/(app)/(tabs)/_layout.tsx` e `src/view/components/NavigationBar.tsx` — os dois já têm comentário reservando o lugar destas abas.
- A issue #47 (excluir a conta) vai pendurar o botão dela nesta tela.

## Referência de design

`docs/design-system/referencia/components/NavigationBar/README.md`, Book Card, Empty State e `design-tokens.json`. Os `node-id` da issue #37 não existem mais no Figma (arquivo reorganizado em 01/10/2026); a conferência visual fica pendente no `verify.md`.
