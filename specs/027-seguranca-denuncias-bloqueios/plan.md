# Plano de Implementação: Segurança (Issue #40)

Este plano descreve os passos lógicos e seguros para implementar a funcionalidade de denúncias e bloqueios sem quebrar o ecossistema existente ou afetar as negociações em andamento (Issue #38).

## Fase 1: Banco de Dados e RLS

1. Criar a migration que adiciona a tabela `user_blocks` (com restrição UNIQUE para `blocker_id` e `blocked_id`) e `reports`.
2. Aplicar políticas RLS para garantir que a inserção e leitura ocorram somente pelo autor (auth.uid()), e bloquear UPDATE/DELETE na tabela de denúncias.
3. Na mesma migration, atualizar (CREATE OR REPLACE) a view `catalog_listings` adicionando o filtro para excluir anúncios cujo proprietário tenha sido bloqueado pelo usuário logado, respeitando a decisão de bloqueio unilateral.

## Fase 2: Domínio e Dados (MVVM)

1. Criar as entidades TypeScript `Report` e `UserBlock`.
2. Criar a interface `SecurityRepository`.
3. Criar a implementação `MemorySecurityRepository` para validar regras em testes.
4. Criar a implementação `SupabaseSecurityRepository` comunicando com as novas tabelas.
5. Injetar o repositório na Factory/DI da aplicação.

## Fase 3: ViewModels

1. Criar `ReportViewModel` para gerenciar a lista estática de motivos e o estado do envio.
2. Criar `BlockViewModel` para gerenciar a ação de bloquear e o feedback.

## Fase 4: Telas e Rotas

1. Desenvolver as 5 telas da Seção H do Figma ("Sua segurança", "Fazer denúncia", "Denúncia recebida", "Bloquear [nome do usuário]?", "Perfil bloqueado").
2. Conectar as telas de Perfil e Anúncios para chamar a tela de entrada ("Sua segurança").
3. Garantir que os avisos do Figma estejam presentes e claros.

## Fase 5: Revisão

1. Confirmar que `book_requests` continuam intactos ao realizar bloqueios.
2. Confirmar a visibilidade no catálogo após bloqueio.
