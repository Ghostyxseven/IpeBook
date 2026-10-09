# Plano

Seguir ADR 0025 e Expo SDK 57. Usar adaptador `.web.ts` de infraestrutura para construir o retorno dentro do caminho de publicação. Manter o adaptador nativo. A conclusão da janela OAuth já existe em `src/factories/auth.ts`.

Verificar primeiro o estado local e configuração remota, reproduzir o endereço errado em teste, implementar a correção e executar teste, tipos e exportação. Validar uso real quando houver navegador conectado e sessão disponível. Não alterar telas ou design neste passo.
