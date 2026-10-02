# ADR 0017: Segurança, Denúncias e Bloqueios

## Contexto

O aplicativo precisa permitir que os usuários denunciem comportamentos indevidos e bloqueiem outros usuários, como parte da política de Trust & Safety (Issue #40). É necessário definir como esses dados serão armazenados e como o bloqueio afetará a visibilidade no aplicativo, garantindo isolamento em relação a outros domínios já implementados (como a Issue #38 de negociações).

## Decisão

### Tabelas e Persistência

Serão criadas estritamente duas tabelas no Supabase:

1. `reports`: Para armazenar denúncias de usuários e/ou anúncios.
2. `user_blocks`: Para armazenar os registros de bloqueio entre usuários.

Não haverá tabela extra nem painel administrativo no aplicativo. A moderação das denúncias será feita pela equipe externamente, através do Supabase Studio.

### Regras de Bloqueio e Visibilidade

- O bloqueio atuará na camada visual do catálogo de forma **unilateral**. Se o usuário A bloquear o usuário B, os anúncios de B deixarão de aparecer para A. A regra inversa não será aplicada automaticamente para B.
- A exclusão visual ocorrerá através de alteração na View `catalog_listings`. A view manterá suas regras originais de `status` e exibição, adicionando apenas a exclusão baseada na tabela `user_blocks`.
- O bloqueio **não** cancelará automaticamente negociações ou registros em `book_requests`. Embora a interface do usuário avise que encontros pendentes devam ser cancelados, essa ação deve ser manual por parte do usuário (ou gerida futuramente pelo domínio de mensagens), sem gatilhos mágicos no backend.

### Regras de Denúncia

- Uma denúncia pode ter como alvo um usuário, um anúncio ou ambos.
- O registro é imutável para o usuário.

### Políticas de Segurança (RLS)

- `reports`:
  - `Insert`: O próprio usuário (auth.uid()).
  - `Select`: O próprio usuário (auth.uid()).
  - `Update/Delete`: Bloqueados para usuários comuns.
- `user_blocks`:
  - Policy `FOR ALL` condicionada ao próprio `blocker_id` (auth.uid() = blocker_id), tanto no `USING` quanto no `WITH CHECK`. Isso permite que o usuário execute SELECT, INSERT e DELETE apenas sobre os seus próprios registros de bloqueio. O DELETE é necessário para viabilizar o desbloqueio de perfis sem a criação de uma nova migration. Não existe risco de acesso indevido, pois a condição `blocker_id = auth.uid()` é aplicada em todas as operações.

### Arquitetura

A implementação seguirá o MVVM Simplificado (ADR 0002), utilizando:

- **Entities**: Para `Report` e `UserBlock`.
- **Repositories**: Interface `SecurityRepository` com implementações concreta `SupabaseSecurityRepository` e `MemorySecurityRepository` para testes.
- **ViewModels**: Gerenciamento de estado via `ReportViewModel` e `BlockViewModel`.
- **DI/Factory**: Injeção de dependência pelo padrão já existente.

## Consequências

- **Positivas**: O catálogo filtra usuários bloqueados diretamente no banco de forma performática. O domínio de transações/negociações (Issue #38) permanece blindado e sem efeitos colaterais de regras implícitas. A policy `FOR ALL` em `user_blocks` viabiliza o desbloqueio futuro sem nova migration.
- **Negativas**: Como não há painel admin, a equipe precisará de acesso direto ao Supabase para atuar nas denúncias e o cancelamento de encontros com usuários bloqueados demanda ação manual no app.
- **Pendência**: A integração do atalho "Sua segurança" na tela de Perfil Público ficará para quando essa tela for desenvolvida no projeto.
