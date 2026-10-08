# Funcionamento do aplicativo na Web

## Objetivo e escopo

Validar o app servido em `/app` com Supabase real, preservando a apresentação e as alterações de cadastro em andamento. Correção identificada: o retorno Google usa `/auth/callback`, fora do caminho publicado.

## Critérios de aceite

- O retorno Google usa a origem atual e `/app/auth/callback`.
- O adaptador mantém a abertura de sessão do Expo e sua verificação de retorno.
- Tipos, teste de regressão e exportação Web passam.
- Entrar, restaurar sessão e anunciar precisam ser conferidos no navegador real antes de declarar a Web liberada ou ligar os botões institucionais.

Não publicar anúncios fictícios no catálogo público nem publicar alterações de terceiros sem revisão. Publicação e liberação dependem da validação real.
