# Supabase

Migrações do banco do IpêBook (ADR 0006 e ADR 0008).

## Aplicar num projeto

1. Abra o projeto no painel do Supabase → **SQL Editor**.
2. Cole e execute cada arquivo de `migrations/` em ordem de nome.
3. Confira em **Table Editor** a tabela `listings` e a view `catalog_listings`, e em **Storage** o bucket `listing-covers`.

Com a CLI do Supabase vinculada ao projeto, `supabase db push` aplica as mesmas migrações.

## Modelos de e-mail com código (issue #31)

O app confirma o cadastro e recupera a senha por **código digitado no app**, não por link ([ADR 0006](../docs/adr/0006-autenticacao-supabase.md)). Os modelos padrão do Supabase mandam só um link, que confirma a conta e abre o navegador em `localhost`.

No painel: **Authentication → Emails → Templates** (em versões antigas, Authentication → Email Templates).

| Modelo no painel   | Assunto                                                     | Corpo (copiar o arquivo inteiro)                                         |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Confirm signup** | `Seu código do IpêBook: {{ .Token }}`                       | [`templates/confirmar-cadastro.html`](templates/confirmar-cadastro.html) |
| **Reset password** | `Código para criar uma nova senha no IpêBook: {{ .Token }}` | [`templates/recuperar-senha.html`](templates/recuperar-senha.html)       |

Confira também em **Authentication → Sign In / Providers → Email** que **Confirm email** está ligado.

**Teste:** criar uma conta no app com um e-mail seu, confirmar que chega um código e que ele ativa a conta; depois, "Esqueci minha senha" com o mesmo e-mail. Registrar o resultado no `verify.md` da spec 014.

O SMTP padrão do Supabase limita o número de e-mails por hora. Se os testes da equipe esbarrarem nesse limite, configure um SMTP próprio no mesmo painel.

## Notificações (ADR 0011, spec 024)

Aplique `migrations/20261002120000_notificacoes.sql` depois da migração do catálogo. Ela cria `notifications` e `notification_preferences` com RLS (cada pessoa lê e altera só as suas; o app só pode atualizar `read_at`) e a função `create_notification`, que respeita as preferências e **não pode ser chamada pelo app**: apenas gatilhos do banco, como os da negociação (#38), a executam.

Para ver um aviso no app antes da negociação existir, no SQL Editor (projeto de desenvolvimento):

```sql
select public.create_notification('<id-da-conta-que-abre-o-app>', 'request_received', 'Aviso de teste', 'Texto de teste');
```

Sobre o endereço da página institucional (`EXPO_PUBLIC_SITE_URL` no `.env`), veja `.env.example`. Apague os avisos de teste antes de usar o projeto com pessoas reais.

## Negociação e segurança (ADRs 0018 e 0017, specs 028 e 027)

Aplique, nesta ordem e depois das migrações do catálogo e das notificações:

1. `migrations/20261002125000_book_requests.sql` — tabela `book_requests`.
2. `migrations/20261002130000_seguranca_denuncias_bloqueios.sql` — `reports`, `user_blocks` e a view `catalog_listings` sem anúncios de quem foi bloqueado.
3. `migrations/20261002140000_negociacao_transicoes.sql` — a função `transition_book_request`, que é o único jeito de aceitar, recusar, cancelar ou concluir, e os avisos da negociação.

## Perfil e bairro (Figma 01.17 e 11.01)

Aplique `migrations/20261003140000_perfil_bairro.sql` depois da migração do catálogo. Ela cria `profiles` com o bairro de cada pessoa e RLS: cada pessoa lê e grava só o próprio perfil, o app só altera `neighborhood` e a cidade fica fixa em Piripiri. Sem essa migração, Seu bairro e Escolher bairro mostram "O perfil ainda não foi configurado neste ambiente.".

## Excluir conta (ADR 0023)

Aplique `migrations/20261003150000_excluir_conta.sql` por último. Ela cria `delete_own_account()`, que só a própria pessoa autenticada pode chamar. A função apaga a conta, e os dados ligados saem em cascata; as capas são removidas pelo app antes. Teste com uma conta descartável: depois de excluir, o login com ela deve falhar.

## Entrar com o Google (ADR 0028)

1. **Authentication → Providers → Google:** ligue o provedor e cole o client ID e o client secret de um client OAuth "Web application" do Google Cloud. Nele, a "Authorized redirect URI" é `https://<projeto>.supabase.co/auth/v1/callback`.
2. **Authentication → URL Configuration → Redirect URLs:** acrescente **os três** endereços abaixo. O app volta para um deles depois do Google; se o endereço não estiver na lista, o Supabase manda para a "Site URL", e o celular mostra "O Safari não pode abrir a página porque o endereço é inválido".
   - `ipebook://**`: app instalado (build de desenvolvimento ou de loja).
   - `exp://**`: Expo Go. Nele o retorno é `exp://<IP-do-computador>:8081/--/auth/callback`, e o IP muda de rede para rede; por isso o curinga.
   - O endereço da Web, se o login pelo site for usado (ex.: `https://<dominio>/**`).

## Anúncio de teste (só em projeto de desenvolvimento)

O catálogo esconde os anúncios da própria pessoa. Para ver um anúncio no app, crie duas contas de teste e insira o anúncio com o id da conta que **não** vai abrir o app (Authentication → Users):

```sql
insert into public.listings (owner_id, title, author, category, modality, price_cents, condition, neighborhood, city)
values ('<id-da-outra-conta>', 'Livro de teste', 'Autoria de teste', 'Outros', 'sale', 1500, 'bom', 'Bairro de teste', 'Cidade de teste');
```

Apague esses registros antes de usar o projeto com pessoas reais.

## Diagnóstico do login Google (08/10/2026)

As correções locais do fluxo foram:

1. Extrair apenas `code` da URL antes de chamar `exchangeCodeForSession`; remover
   logs que imprimiam códigos e URLs de autenticação.
2. Configurar `flowType: 'pkce'` no cliente. Sem isso, o SDK iniciava `implicit`,
   incompatível com a troca de código feita pelo aplicativo.
3. Fornecer SHA-256 e aleatoriedade segura ao PKCE nativo via `expo-crypto` do SDK 57.
   A ausência de WebCrypto causava o aviso de fallback para `plain`. Na Web,
   preservar WebCrypto do navegador; usar HTTPS ou localhost.
4. Adicionar a rota `/auth/callback`: o Expo Router exibia "Unmatched Route"
   depois do retorno do Google. A rota reutiliza a decisão de abertura por sessão;
   a troca do código continua na operação OAuth, evitando reutilização do código.
5. Para "Cannot connect to Expo CLI" no Android conectado por USB, verificar
   `http://127.0.0.1:8081/status` e configurar `adb reverse tcp:8081 tcp:8081`.
   Abrir `exp://127.0.0.1:8081` no Expo Go e manter o cabo conectado.

Testes reproduziram configuração sem PKCE e ambiente sem WebCrypto, depois
validaram os caminhos corrigidos. Tipos, lint, formatação e 32 arquivos de testes
passaram antes da evolução do cadastro. O empacotamento iOS passou; no Android,
a rota corrigida encaminhou para Entrar. Isso não comprova login completo com
uma conta real. Detalhes e limites estão no
[registro da autenticação](../specs/014-autenticacao-onboarding/verify.md).

Não publicar screenshots, códigos OAuth, tokens ou senhas em issues e commits.
A conclusão de nome, senha do IpêBook e bairro está na
[spec 034](../specs/034-completar-cadastro-google/spec.md).
