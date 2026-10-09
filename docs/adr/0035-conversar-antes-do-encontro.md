# 0034 — Conversar antes do encontro

Data: 09/10/2026
Status: aceito e implementado localmente; validação real pendente.

## Contexto

O Figma 03.01 (Detalhe do livro) mostra dois botões: "Conversar" e a ação por
modalidade ("Tenho interesse" na venda, "Propor troca" na troca, "Quero receber" na
doação). O app só tinha o segundo — a spec 037 registrou "Conversar" como fora de
escopo porque a tabela `book_requests` exigia local, dia e horário já na criação
(`not null` + `check`), e não existia tela nenhuma para propor um encontro depois de
a negociação já existir. Ver [spec 037](../../specs/037-detalhe-do-livro-ios/spec.md).

Sem "Conversar", quem quer só perguntar algo antes de se comprometer com um
horário é obrigado a já propor local/dia/hora para abrir o chat — ou a usar o
único botão existente como se fosse os dois.

## Decisão

1. **Local, dia e horário viram opcionais no banco.** `alter table ... drop not null`
   nos três campos de `book_requests`. Os `check` de formato continuam — passam
   sozinhos quando o valor é nulo, regra padrão do Postgres.
2. **Nova função `propose_meeting`**, espelho de `reschedule_book_request` (ADR
   0022), mas para **antes** do aceite: só roda em `pending` com os três campos
   ainda nulos, e qualquer um dos dois lados da negociação pode chamá-la.
3. **`transition_book_request` ganha uma trava**: não deixa aceitar
   (`next_status = 'accepted'`) se `public_location` ainda for nulo. Sem isso,
   "aceitar" uma conversa sem encontro vira um encontro às cegas — a regra mora no
   banco, não só na tela, mesmo padrão já usado para avaliações (ADR 0027).
4. **"Conversar" cria a negociação direto**, sem formulário: chama `createRequest`
   com os três campos nulos e `offeredListingId: null` (mesmo na troca — o livro
   oferecido continua podendo vir depois, pela contraproposta que já existia, ADR
   0030). Se já existir uma negociação pendente para o mesmo anúncio e pessoa, abre
   essa em vez de criar outra (o índice único do banco recusaria duplicar).
5. **Tela nova, `ProposeMeetingScreen`**, é o `RescheduleScreen` com a entrada
   trocada: em vez de `accepted` com local já preenchido, lida com `pending` sem
   local nenhum. Dois arquivos quase iguais, de propósito — misturar os dois modos
   num só arriscava quebrar o reagendamento, que já tinha testes e uso real.
6. **Dentro da negociação**, quando `publicLocation` é nulo, a tela de detalhe troca
   o cartão do encontro por um botão "Propor encontro"; o botão "Aceitar" só
   aparece depois que o encontro existe.

## O que não mudou

- "Tenho interesse"/"Propor troca"/"Quero receber" continuam criando a negociação
  já com o encontro proposto, exatamente como antes.
- `reschedule_book_request` e a tela de reagendar continuam intocadas.
- O texto de "Proposta enviada"/"X quer comprar seu livro" (status `pending`) não
  diferencia ainda "só conversa" de "já tem encontro proposto" — fica para quando
  houver tempo de revisar a copy com mais calma; hoje funciona para os dois casos
  sem travar nada.

## Consequências

- Mais um estado possível para `pending`: sem encontro algum. Toda tela que lê
  `book_requests` e assume `publicLocation`/`meetingDate`/`meetingTime`
  preenchidos precisa checar antes de usar (feito em `MeetingCard`,
  `BookRequestDetailScreen` e nas funções de formatação de `bookRequestFormat.ts`).
- `BookRequest.publicLocation/meetingDate/meetingTime` são `string | null` no
  Model agora, não só `string`.

## Referências

- [ADR 0018](0018-transicoes-da-negociacao-no-banco.md) — `transition_book_request`.
- [ADR 0022](0022-troca-e-reagendamento-no-banco.md) — `reschedule_book_request`,
  o espelho que `propose_meeting` segue.
- [spec 037](../../specs/037-detalhe-do-livro-ios/spec.md) — onde "Conversar" foi
  registrado como pendência.
- Migração `supabase/migrations/20261009130000_conversar_antes_do_encontro.sql`.
