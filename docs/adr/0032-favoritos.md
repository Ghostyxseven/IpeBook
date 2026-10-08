# 0032 — Favoritos

Data: 08/10/2026

## Status

Aceito, implementado. Falta aplicar a migração `20261008120000_favoritos.sql` no
Supabase da equipe e conferir no aparelho (Android e iPhone).

## Contexto

`docs/DIVISAO_FEATURES.md` listava Favoritos (Figma 37) como extra da descoberta,
fora do MVP, "a abrir como spec só quando alguém assumir", com a condição de exigir
"tabela `favorites` com RLS, ADR e spec" antes de implementar (decisão de 02/10/2026,
#27). O Micael pediu o recurso em 08/10/2026, com o coração nos cards do Início e do
Explorar, igual ao Figma. Esta é essa abertura.

## Decisão

Tabela própria, sem tocar em `listings`:

```sql
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
```

- **Chave primária composta `(user_id, listing_id)`**, não um `id` próprio: um favorito
  é a existência da linha, não um registro com ciclo de vida. Favoritar duas vezes é
  `upsert`, não erro de duplicidade.
- **RLS por `user_id = auth.uid()`** nas três operações (select, insert, delete). Cada
  pessoa só lê, grava e apaga os próprios favoritos; não há como ver quem favoritou o
  quê, nem contagem pública — o Figma 37 não pede isso, e expor essa contagem seria
  inventar um recurso que não foi pedido.
- **Sem update**: o coração só tem dois estados. Marcar e desmarcar são inserir e
  apagar a linha.
- **Mudança otimista na tela**: o coração muda na hora do toque, antes do servidor
  responder, e volta ao estado anterior se o servidor recusar. O Figma não tem um
  estado "salvando" para o coração, então a tela também não tem.
- **Repositório próprio** (`FavoritesRepository`), ao lado de `CatalogRepository` e
  `ListingsRepository`, não dentro deles: favoritar é ação de quem está logado sobre
  um anúncio, não um dado do catálogo nem do dono do anúncio.
- **Um hook por tela** (`useFavorites()`), sem estado global: o mesmo padrão que o
  app já usa para contagem de não lidos (`useFocusEffect` recarrega ao focar a tela).
  Marcar um favorito no Explorar e voltar ao Início mostra o coração atualizado porque
  o Início recarrega ao focar, não porque as telas compartilham um store.

## Alternativas

- **Coluna booleana em `listings`:** colocaria "favoritado por mim" dentro do anúncio,
  que é de outra pessoa — teria de ser por usuário, então viraria uma tabela de
  qualquer jeito. Mais simples só na aparência.
- **Guardar no aparelho (AsyncStorage), sem tabela:** não sincroniza entre aparelhos
  nem sobrevive a reinstalar o app; o Figma mostra o coração como parte da conta, não
  do aparelho.
- **Um store global de favoritos:** resolveria a atualização entre telas sem recarregar,
  mas o projeto não tem nenhum store global hoje (Redux, Zustand, Context de dados) e
  introduzir um só para isto seria desproporcional. O recarregar-ao-focar já existente
  resolve o mesmo problema.

## Consequências

- Mais uma tabela e três políticas de RLS para a equipe aplicar e manter.
- O Book Card e o Book Tile ganham uma prop opcional (`favorite`, `onToggleFavorite`):
  quem não passar essas props continua sem o coração, sem quebrar nenhum uso existente.
- Alvo de toque do coração aninhado dentro do toque do card inteiro (abrir detalhe):
  funciona pelo sistema de responder do React Native (o toque direto no coração vira
  o respondedor antes do card), sem precisar de `stopPropagation`.
- "Avisar quando aparecer" e compartilhar (os outros dois extras da decisão #27)
  continuam fora: a decisão de 02/10 só abriu Favoritos.
