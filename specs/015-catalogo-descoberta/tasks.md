# Tarefas

- [ ] Combinar o ADR 0007 (tabela `listings`, view `catalog_listings`, bucket de capas e RLS) com o Eric e marcar como aceito.
- [x] Criar a migração SQL em `supabase/migrations/` e documentar como aplicá-la (`supabase/README.md`). SQL não validado localmente (sem Postgres nesta máquina).
- [ ] Aplicar a migração no projeto Supabase da equipe.
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
- [ ] Conferir as telas e os estados num celular ou emulador (depende do Supabase; ver `verify.md`).
- [ ] Testar ponta a ponta com anúncios reais num projeto Supabase de desenvolvimento.
- [ ] Comparar as telas com os quadros do Figma.
