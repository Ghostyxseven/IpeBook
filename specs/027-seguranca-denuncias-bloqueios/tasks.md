# Tarefas: Segurança (Issue #40)

- [x] Criar a migration SQL unificada:
  - [x] Tabela `user_blocks` com constraints e índices.
  - [x] Tabela `reports` com constraints e índices.
  - [x] RLS para `user_blocks` (Select/Insert/Delete para blocker_id).
  - [x] RLS para `reports` (Select/Insert para reporter_id).
  - [x] View `catalog_listings` alterada (filtro de bloqueio unilateral mantendo regras originais).
- [x] Criar arquivo `src/model/entities/Report.ts` e `UserBlock.ts`.
- [x] Criar repositórios `SecurityRepository` (interface, Supabase e Memory).
- [x] Injetar o repositório na Factory.
- [x] Criar `ReportViewModel` (com gestão de motivos estáticos e chamada de salvar).
- [x] Criar `BlockViewModel`.
- [x] Desenvolver a tela 1: "Sua segurança" (Menu de opções).
- [x] Desenvolver a tela 2: "Fazer denúncia" (Escolha de motivo e input).
- [x] Desenvolver a tela 3: "Denúncia recebida" (Feedback visual).
- [x] Desenvolver a tela 4: "Bloquear [nome]?" (Confirmação descritiva).
- [x] Desenvolver a tela 5: "Perfil bloqueado" (Sucesso e atalho extra).
- [x] Adicionar atalho (botão "Sua segurança") na tela de Detalhes do Anúncio (`ListingDetailScreen`).
- [ ] Adicionar atalho na tela de Perfil Público — **pendente: tela de Perfil Público ainda não existe no projeto (dependência futura)**.
- [x] Validar que nenhum Request de adoção existente está sendo deletado ou alterado automaticamente.
- [x] Validar a filtragem do catálogo com testes (ou manual no Supabase).

## Telas pelo Figma (03/10/2026, issue #40)

- [x] Denunciar anúncio (09.03): motivos em rádio, detalhes opcionais e "Enviar denúncia" na barra inferior. Sem anúncio, a mesma tela vira "Denunciar pessoa", com motivos de pessoa.
- [x] Denúncia enviada (09.04): "Recebemos sua denúncia.", "Voltar ao livro" e "Bloquear [nome]".
- [x] Bloquear (09.02): diálogo do M3 aberto pelo detalhe do livro e pela denúncia enviada. Substitui as telas "Sua segurança", "Bloquear [nome]?" e "Perfil bloqueado".
- [x] Pessoas bloqueadas (07.10), desbloquear (07.11) e lista vazia (07.12), abertas por Configurações.
- [x] Repositório: `listBlocked`, `unblockUser` e bloqueio repetido tratado como sucesso; erros em português (`SecurityError`).
- [x] Testes em `tests/security.test.mjs`.
- [ ] Conferir no aparelho com duas contas.
