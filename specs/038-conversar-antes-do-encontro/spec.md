# 038 — Conversar antes do encontro

Continuação da [spec 037](../037-detalhe-do-livro-ios/spec.md), que deixou o botão
"Conversar" do Figma 03.01 fora de escopo. ADR 0034.

## Objetivo

Hoje o Detalhe do livro só tem um botão de ação, que já cria a negociação com
local, dia e horário propostos. "Conversar" é o segundo botão do Figma: abre a
negociação **sem** encontro nenhum, só para falar com quem anunciou antes de se
comprometer com um horário. Alguém pode propor o encontro depois, dentro da
própria negociação.

## Fluxo

1. Detalhe do livro: além do botão principal, aparece "Conversar" (quando a pessoa
   pode negociar — mesma regra do botão principal: não é dona, anúncio disponível,
   logada).
2. Tocar "Conversar" cria a negociação sem local/dia/horário e abre a tela da
   negociação. Se já houver uma pendente para esse anúncio e essa pessoa, abre a
   que já existe em vez de criar outra.
3. Na negociação, sem encontro ainda: em vez do cartão com local/dia/hora, aparece
   "Ainda não há encontro proposto" e um botão "Propor encontro".
4. "Propor encontro" abre uma tela com local, dia e horário — igual ao que
   "Combinar encontro" já pede, só que preenchendo uma negociação que já existe.
5. Depois de propor, o encontro aparece na negociação dos dois lados; só a partir
   daí o botão "Aceitar" existe para quem anunciou.
6. O resto do ciclo (aceitar, recusar, reagendar, cancelar, concluir, avaliar)
   continua exatamente como já era.

## Aceite

- "Conversar" só aparece quando a pessoa pode negociar (mesma regra do botão
  principal).
- Tocar "Conversar" não pede nada: cria a negociação e abre a tela dela.
- Tocar "Conversar" de novo no mesmo anúncio, com uma negociação pendente já
  aberta, volta pra ela — não duplica.
- Negociação sem encontro mostra "Propor encontro" no lugar do cartão; depois de
  propor, o cartão aparece normalmente para os dois lados.
- Sem encontro proposto, quem anunciou não vê o botão "Aceitar" — nem na tela, nem
  no banco (o banco recusa `accepted` com `public_location` nulo).
- Abrir conversa (chat) continua funcionando normalmente, com ou sem encontro
  proposto.
- Testes do Model cobrindo: criar sem encontro, propor encontro, recusar propor
  fora de hora, e as funções de formatação com os três campos nulos.

## Fora do escopo

- Diferenciar o texto de "Proposta enviada"/"X quer comprar seu livro" entre "só
  conversa" e "já tem encontro" — fica pra quando houver tempo de revisar a copy.
- Mudar `reschedule_book_request` ou a tela de reagendar.
- Mudar a contraproposta de troca (ADR 0030) — continua igual, só que agora pode
  acontecer numa negociação que nasceu sem encontro.

## Dependências

- Migração `supabase/migrations/20261009130000_conversar_antes_do_encontro.sql` —
  **ainda não aplicada no Supabase da equipe** quando esta spec foi escrita.
- ADR 0034.

## Referência de design

Figma `cxEisNRzOQR6krv8Ow7HCa`, quadro 03.01 (botão "Conversar", ao lado da ação
principal).
