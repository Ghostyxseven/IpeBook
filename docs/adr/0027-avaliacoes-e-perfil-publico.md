# 0027 — Avaliações e perfil público

Data: 07/10/2026

## Status

Proposto, implementado (issue #53, spec 031, Figma 03.04, 07.03 e 09.01).

## Contexto

Trocar um livro é combinar de encontrar um desconhecido num lugar público. O que
faz alguém aceitar isso é saber que a outra pessoa já fez o mesmo antes e saiu
bem. Hoje o catálogo mostra só o primeiro nome de quem anunciou — não há nada
atrás dele.

Ao mesmo tempo, perfil público é a porta mais fácil de vazar dado pessoal: o
`auth.users` do Supabase tem e-mail, e a tabela `profiles` tem bairro. Nenhum dos
dois pode aparecer para outra pessoa.

## Decisão

- **Tabela `public.ratings`**, uma linha por avaliação: `request_id`,
  `author_id`, `subject_id`, `score` (1 a 5), `comment` (até 280) e `created_at`.
  Única por `(request_id, author_id)`, com `check (author_id <> subject_id)`.
- **A avaliação nasce de uma negociação concluída.** A política de `insert` exige
  `book_requests.status = 'completed'` e que quem escreve seja um dos dois lados,
  avaliando o outro. A tela aplica a mesma regra, mas quem decide é a RLS.
- **Sem `update` e sem `delete` para ninguém.** Reputação que a pessoa avaliada
  consegue limpar não é reputação. Comentário abusivo sai pela denúncia da spec
  027, que já existe e tem moderação humana.
- **O perfil de outra pessoa sai de `public.public_profile(person uuid)`**, uma
  função `security definer` que devolve exatamente seis campos: primeiro nome,
  desde quando, negociações concluídas, média, total de avaliações e o próprio
  id. Não existe caminho pelo qual ela devolva e-mail, bairro ou sobrenome —
  essa é a razão de ela existir em vez de um `select` com `join`.
- **Leitura das avaliações é aberta a quem está logado.** São públicas por
  natureza: o objetivo é justamente que apareçam para quem está decidindo se vai
  ao encontro. Nada de identificável vai junto além do primeiro nome de quem
  escreveu.
- **`public.my_history()`** devolve as negociações concluídas de quem chama, com
  o livro e a modalidade — o histórico é da própria pessoa, nunca de outra.
- **Perfil sem avaliação não tem média.** O app mostra "Ainda sem avaliações".
  Um `0,0` numa escala de 1 a 5 é uma nota ruim atribuída a quem não fez nada.

## Consequências

- A migração precisa ser aplicada no Supabase. Sem ela, o app mostra "as
  avaliações ainda não foram configuradas neste ambiente" e o resto segue
  funcionando — mesmo tratamento que o perfil e a exclusão de conta já dão.
- Uma avaliação injusta não tem conserto pelo app, de propósito. A saída é a
  denúncia, que é analisada por gente.
- `ratings` tem `on delete cascade` para `auth.users`: quem exclui a conta leva
  junto as avaliações que **escreveu**. As que recebeu também somem, porque a
  pessoa somiu. Se um dia a moderação precisar do histórico, o caminho é trocar
  o `author_id` para `on delete set null` numa migração futura — e aí a
  avaliação fica sem autor, não sem existir.
- A média é calculada na função, a cada leitura. No volume de uma cidade isso é
  instantâneo; se um dia doer, vira coluna mantida por gatilho.
