# Tarefas

- [ ] Combinar o ADR 0007 (tabela `listings`, view `catalog_listings`, bucket de capas e RLS) com o Eric e marcar como aceito.
- [x] Criar a migração SQL em `supabase/migrations/` e documentar como aplicá-la (`supabase/README.md`). SQL não validado localmente (sem Postgres nesta máquina).
- [x] Aplicar a migração no projeto Supabase da equipe (aplicada pelo Micael em 30/09/2026; conferida pela API).
- [x] Model: entidades, formatação, filtros, categorias e mensagens.
- [x] Model: `CatalogRepository`, implementação Supabase (lê a view `catalog_listings`) e implementação em memória.
- [x] Testes do Model independentes da tabela (formatação BRL, filtros, categorias e mensagens) em `tests/catalog-model.test.mjs`.
- [x] Testes da montagem da consulta e dos erros do Supabase com cliente falso (`tests/catalog-repository.test.mjs`).
- [x] ViewModels: feed, busca e detalhe, com testes (`tests/catalog-viewmodel.test.mjs`).
- [x] Componentes: Status Badge, Book Card e capa (tipos e bundle validados; conferência visual pendente até existir tela que os use).
- [x] Componentes: chips de categoria e modalidade (`Chip`, `ChipRow`) e lista paginada (`CatalogList`); a busca reutiliza `TextField`.
- [x] Navegação por abas (Início e Buscar, `expo-router/js-tabs`) e rota de detalhe `livro/[id]`.
- [x] Telas: Início com feed (substitui a Início provisória e mantém Sair), Buscar com filtros e Detalhe do livro, com todos os estados.
- [x] Validar tipos, testes e bundles nativos; registrar evidências e pendências em `verify.md`.
- [x] Conferir Início e Buscar no Waydroid com o Supabase real (ver `verify.md`).
- [ ] Conferir Book Card, Detalhe e paginação com anúncios de outra conta.
- [ ] Testar ponta a ponta com anúncios reais num projeto Supabase de desenvolvimento.
- [x] Comparar as telas com os quadros do Figma (02, 03, 04, 12, 13, 14 e 26) e refazer o visual (ADR 0008, tokens `color.cover.*`).
- [ ] Conferir Book Card, grade do Início e Detalhe com anúncios reais contra os quadros 02, 03 e 04.
