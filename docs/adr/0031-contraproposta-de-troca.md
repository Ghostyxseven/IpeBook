# 0030 — Contraproposta de troca

Data: 07/10/2026

## Status

Aceito, implementação com testes locais de domínio, ViewModel, SQL e interface Web. Falta aplicar a migração `20261007130000_contraproposta.sql` no
Supabase da equipe e conferir com duas contas num aparelho (issue #44).

## Contexto

Na troca, quem pede escolhe um livro seu para oferecer (ADR 0022). Até aqui, quem anunciou
só podia **aceitar** ou **recusar** essa proposta. Se o livro oferecido não interessasse, mas
outro da mesma estante interessasse, não havia caminho: a pessoa recusava e a negociação
morria.

Os quadros 06.19 e 06.20 resolvem isso com a contraproposta: quem anunciou abre a estante de
quem propôs e pede **outro** livro. No 06.20, quem propôs vê a contraproposta e responde.

## Decisão

Uma coluna nova em `book_requests`, `counter_listing_id`, e duas funções no banco.

- **A contraproposta não muda o status.** A proposta segue `pending`; o que muda é de quem é a
  vez de responder. Enquanto `counter_listing_id` está preenchido, quem responde é quem
  propôs, e o dono não pode contrapor de novo — uma por vez.
- **Ela fica ao lado da proposta original, não no lugar.** `offered_listing_id` continua
  apontando para o livro oferecido, então a tela mostra as duas coisas: o que foi oferecido e
  o que foi pedido em troca.
- **Aceitar a contraproposta fecha o acordo.** O contraproposto vira o `offered_listing_id`,
  o status vai para `accepted` e os dois anúncios ficam `reservado`, na mesma transação. Os outros pedidos
  pendentes do anúncio solicitado são recusados. O livro oferecido originalmente
  permanece disponível. Não há segunda rodada de
  aprovação: o dono já disse qual livro quer, e quem propôs concordou.
- **Recusar encerra a negociação** (`rejected`). Quem propôs não quer abrir mão do outro
  livro, e o dono já disse que não quer o oferecido — não sobra acordo possível.
- **As RPCs usam `security definer` com `search_path` vazio**, autenticação e
  papel conferidos explicitamente. RLS continua impedindo atualização direta; uma
  política restritiva impede criar pedidos com contraproposta forjada. O aceite
  trava e revalida ambos os livros. A transição original fica bloqueada enquanto
  há contraproposta pendente.
- **Só na troca.** Venda e doação não têm livro do outro lado para trocar.
- **A estante de quem propôs sai de uma função `security definer`** (`shelf_of_requester`),
  que devolve só anúncios de troca disponíveis — o mesmo recorte que o catálogo já mostra a
  qualquer pessoa. O dono não ganha acesso a nada que já não pudesse ver.

## Alternativas

- **Um status `countered` próprio:** espalharia a contraproposta por toda a máquina de
  estados (listas, resumos, transições) para descrever o que continua sendo uma proposta
  pendente. A coluna diz a mesma coisa sem alargar o enum.
- **Substituir `offered_listing_id` na hora de contrapor:** apagaria o que a pessoa ofereceu,
  e a tela não teria como mostrar "você ofereceu X, pediram Y".
- **Exigir que o dono aceite de novo depois do aceite da contraproposta:** uma rodada a mais
  sem informação nova; o dono escolheu o livro, não há o que reavaliar.
- **Deixar quem propôs mandar outro livro por mensagem:** é o que acontece hoje na prática,
  mas não muda a negociação: o livro da troca continuaria errado no banco e no encontro.

## Consequências

- A migração precisa ser aplicada antes de a tela funcionar; sem ela, `counter_listing_id`
  não existe e a consulta falha.
- `SupabaseBookRequestClient` passou a incluir `storage`: a estante mostra a capa real de
  cada anúncio, pela mesma URL pública que o catálogo usa.
- A conversa (06.20) mostra a contraproposta como cartão. O app mostra na tela da negociação,
  que é onde aceitar e recusar já acontecem. Registrado em
  `docs/design-system/divergencias.md`.
- Não há aviso de contraproposta em Notificações: `notifications.kind` não tem esse tipo
  (mesma limitação do reagendamento, ADR 0022).
