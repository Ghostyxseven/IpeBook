# 0033 — Conclusão do cadastro Google na mesma identidade

Data: 08/10/2026
Status: aceito e implementado localmente; validação real pendente (spec 034).

## Contexto

O usuário exige nome, senha do IpêBook e bairro após o primeiro login Google.
O ADR 0028 deixou termos e conclusão do perfil pendentes. Criar outro usuário por
`signUp` duplicaria identidades e dados. Referência: [spec 034](../../specs/034-completar-cadastro-google/spec.md).

## Decisão

Usar `updateUser({ password, data })` na sessão Google já autenticada. Salvar bairro
no repositório de perfil existente primeiro. Gravar nome, aceite e
`google_registration_completed: true` junto da senha no Auth. Identificar pendência
pelo provedor inicial `app_metadata.provider === 'google'` e ausência da marca.
Contas originalmente de e-mail ficam fora, mesmo que vinculem Google depois.

A marca é estado de onboarding controlado pelo cliente, não privilégio de segurança.
Não usar senha em metadados. RLS continua responsável por acesso aos dados.
Guarda de navegação em todas as entradas da área autenticada, inclusive deep links.

## Alternativas

Criar conta separada: rejeitado por duplicar identidade. Armazenar senha em tabela:
rejeitado; autenticação fica no Supabase Auth. Marcar conclusão antes do bairro:
rejeitado porque liberaria cadastro incompleto se a segunda gravação falhasse.

## Consequências

Bairro pode ser salvo mesmo se a etapa Auth falhar; repetir é seguro via upsert.
Senha e marca são enviadas na mesma atualização; erro mantém a etapa pendente.
Contas Google anteriores sem marca também passam por essa etapa uma vez.
Não muda senha do Google. Complementa ADR 0028, resolvendo sua pendência de termos.
Sem nova tabela ou dependência. Validar com conta descartável antes de publicar.
