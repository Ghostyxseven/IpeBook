# Segurança, Denúncias e Bloqueios

## Objetivo

Implementar o fluxo de denúncias e bloqueios de usuários e anúncios conforme a Issue #40 e os designs da Seção H do Figma, garantindo privacidade e controle para a comunidade.

## Requisitos do Figma (Seção H)

O fluxo deve contemplar exatamente as 5 telas identificadas:

1. **Sua segurança**: Menu que permite escolher entre denunciar usuário, denunciar anúncio ou bloquear perfil.
2. **Fazer denúncia**: Tela para escolha do motivo e submissão.
3. **Denúncia recebida**: Confirmação visual de que a denúncia está em análise e orientações de privacidade.
4. **Bloquear [nome do usuário]?**: Modal/Tela de confirmação explicando as consequências (ex: encontros pendentes devem ser cancelados via chat).
5. **Perfil bloqueado**: Confirmação de bloqueio, aviso de conversa encerrada e opção secundária "Denunciar também".

_(Nota: a tela "Usuários bloqueados" das configurações não faz parte deste escopo principal de transação)._

## Requisitos de Regra de Negócio (Issue #40)

- **Bloqueio Unilateral**: A bloquear B esconde os anúncios de B no catálogo de A.
- **Isolamento**: O ato de bloquear **não** cancela negociações existentes em `book_requests` nem modifica o comportamento da Issue #38 no backend.
- **Denúncias**: Podem ter como alvo usuário, anúncio ou ambos, persistindo o denunciante.
- **Sem Backoffice**: Nenhuma tela administrativa será desenvolvida no app.
- **Segurança (RLS)**: Usuários só visualizam as próprias denúncias e bloqueios, não podendo editar nem excluir denúncias.

## Requisitos Técnicos

- **Banco de Dados**: Criar as tabelas `user_blocks` e `reports`. Alterar a view `catalog_listings` preservando o escopo atual e adicionando apenas a cláusula de exclusão unilateral.
- **Arquitetura MVVM**: Utilizar Entity, Repository (Memory e Supabase), ViewModel, e Factories para injeção de dependência.
- **Testabilidade**: Implementar suporte a testes através do `MemorySecurityRepository`.
