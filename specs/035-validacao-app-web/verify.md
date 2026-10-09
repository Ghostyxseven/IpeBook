# Verificação — 08/10/2026

## Estado e evidências

- Branch `develop`, commit inicial `2a92825`; alterações locais de autenticação/cadastro preexistentes e trabalho concorrente preservados. Sem commit ou publicação nesta tarefa.
- `npm run verify` inicial: aprovado, 33 arquivos de teste, sem falhas ou ignorados.
- Vercel: as duas variáveis públicas do Supabase já existem em Production, Preview e Development. A pendência de configuração do ADR 0025 está desatualizada.
- A implantação de produção consultada está `Ready`, criada em 03/10/2026. `https://ipebook.vercel.app/app/entrar` retornou HTTP 200. Seu pacote JavaScript contém URL e chave publicável do Supabase; valores não registrados.
- O `Linking.createURL` instalado usa a origem, sem `/app`. Adaptador Web corrigido para `/app/auth/callback`, preservando o adaptador nativo e a verificação da sessão pelo Expo. A conclusão da janela já existe na factory de autenticação.
- `node tests/oauth-browser-web.test.mjs`: aprovado. Em cópia isolada em `/tmp`, restaurar a construção anterior do endereço fez o teste falhar por comparar `/auth/callback` com `/app/auth/callback`.
- `npm run typecheck`: aprovado.
- `npm run build:web` após a correção: aprovado, apresentação em `dist/` e app em `dist/app/`. Exportação não comprova fluxo remoto ou visual.
- Prettier dos arquivos desta entrega: aprovado. ESLint do teste: sem erros; TypeScript é ignorado pelo ESLint existente e foi conferido pelo typecheck.

## Bloqueio do fluxo real

`cua.getState()` não listou navegadores; `cua.getBrowser()` respondeu `No browser is available`. Solicitada conexão do navegador ao usuário. Não usados Playwright ou simulação de sessão como evidência de login real.

Login, persistência de sessão e anúncio real continuam pendentes. Nenhum anúncio fictício foi publicado. Os botões institucionais não foram liberados. Próximo passo: conectar o navegador, validar `/app/entrar` com conta autorizada, conferir sessão após recarga e fluxo de anúncio antes de preparar publicação da correção. A lista de retornos permitidos no Supabase também precisa ser confirmada durante o login Google.
