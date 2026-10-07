# 0028 — Entrar com o Google e avisos de sucesso no acesso

Data: 07/10/2026

## Status

Proposto, implementado (numerado como 0026 até o merge com os ADRs 0026 de leitura de ISBN e 0027 de avaliações, em 07/10/2026). Falta configurar o provedor Google no painel do Supabase e testar no Android, no iPhone e na Web.

## Contexto

Uma comparação das telas do fluxo "01 · Acesso" do Figma (`cxEisNRzOQR6krv8Ow7HCa`, páginas "06 · Android" e "07 · iPhone") com o app achou lacunas sem decisão registrada:

- As telas 01.02 "Entrar", 01.03 "Criar conta" e 01.09 "Senha atualizada" têm o botão "Continuar com o Google" (e, no iPhone, também "Continuar com a Apple"); o app não tinha login social (já registrado no ADR 0024, que deixou os dois de fora por não haver decisão).
- **Os quadros 01.09 "Senha atualizada" e 01.13 "E-mail confirmado" não são iguais nas duas plataformas.** No iPhone, não são telas à parte: são a tela seguinte de verdade (Entrar e Início) com um aviso "Liquid Glass" por cima. No Android, são telas dedicadas de sucesso, com cabeçalho, cartão Material 3 e botão — a mesma estrutura que o app já tinha em `AuthSuccessScreen`. A primeira versão desta decisão trocou as duas telas por um aviso em todas as plataformas; a conferência do Android corrigiu isso (ver "Decisão").
- A tela 01.14 "E-mail já cadastrado" tem 3 ações (Entrar na minha conta, Recuperar senha, Usar outro e-mail); o app só mostrava o erro no campo de e-mail, sem o atalho para recuperar a senha.
- **01.01 "Boas-vindas" no Android tem um terceiro botão, "Explorar livros sem entrar"**, que não existe no app nem no quadro do iPhone. Navegar pelo catálogo sem conta mudaria a proteção de rotas de `(app)` (hoje exige sessão) — fica registrado aqui, sem decisão, para não ficar esquecido; não foi implementado nesta rodada.

## Decisão

- **Login com o Google, sem o Apple por enquanto.** O Apple exige conta paga no Apple Developer Program e `Sign in with Apple` nativo; fica de fora até essa decisão ser tomada (ADR 0024 continua valendo para o Apple).
- **Fluxo pelo navegador do sistema, não pelo SDK nativo do Google.** `signInWithOAuth` do Supabase abre a URL com `expo-web-browser` (`openAuthSessionAsync`) e volta pelo esquema do app (`ipebook://`, `expo-linking`); a sessão começa com `exchangeCodeForSession`. A alternativa oficial do Supabase para React Native (`@react-native-google-signin/google-signin`) exige módulo nativo, build própria por loja (com SHA-1 no Android) e sai do fluxo 100% Expo gerenciado que o projeto usa; o navegador do sistema só precisa de um client OAuth Web no Google Cloud, configurado uma vez no Supabase.
- **Logotipo do Google:** baixado uma vez do arquivo Figma (célula "Logo Google" das telas 01.02/01.03) para `assets/images/google-logo.png`, por ser identidade de marca de terceiros — não um ícone do Material Symbols nem do SF Symbols.
- **Erro "e-mail já cadastrado":** passa a marcar `emailInUse` na ViewModel de cadastro; a tela mostra, além do erro inline, o botão "Recuperar senha" com o e-mail já preenchido. "Entrar na minha conta" já existe como "Já tenho conta"; "Usar outro e-mail" já é editar o campo, então não ganharam botão à parte.
- **Aviso de sucesso só no iPhone; Android e Web mantêm a tela dedicada.** `successRoutes` do layout de Entrada vira `Platform.OS`: no iPhone leva direto para `/seu-bairro` (e-mail confirmado) e `/inicio` (senha atualizada), e `(app)/_layout` mostra um `Snackbar` (célula clara, como a referência do Liquid Glass) uma vez, lendo e limpando `afterSignIn`. No Android e na Web, continua indo para `/email-confirmado` e `/senha-atualizada` (`EmailConfirmedScreen`, `PasswordUpdatedScreen`, construídas sobre `AuthSuccessScreen`), que são quem lê e limpa a marca nesse caso — sem mudança nessas duas telas.

## Alternativas

- **Login nativo do Google (`@react-native-google-signin/google-signin`):** mais próximo do botão oficial do Google e sem abrir navegador, mas pede client ID por plataforma, SHA-1 de debug e de release no Android, e módulo nativo fora do Expo Go — custo maior do que o prazo da disciplina permite agora.
- **Um único padrão de sucesso (aviso ou tela) nas três plataformas:** mais simples de manter, mas contradiz um dos dois quadros do Figma — o Android pede tela dedicada, o iPhone pede aviso. Seguir só um lado deixaria a outra plataforma infiel sem necessidade documentada (regra para IA do AGENTS.md).

## Consequências

- No painel do Supabase: Authentication → Providers → Google, com o client ID e o client secret de um client OAuth "Web application" do Google Cloud Console. Em Authentication → URL Configuration, acrescentar `ipebook://auth/callback` (e o `https://auth.expo.io/...` do Expo Go, se o time testar por ele) em "Redirect URLs".
- `signInWithGoogle` cria a conta no primeiro acesso (comportamento padrão do Supabase para OAuth); quem entra pelo Google não passa pela verificação de e-mail nem grava `terms_accepted_at` — falta decidir onde registrar o aceite dos termos para essas contas.
- As telas 01.04, 01.05, 01.08 e 01.12 do Figma ainda falam em "link" de e-mail; o app continua com código (OTP), como já decidido no ADR 0006. Ninguém atualizou o texto dessas telas no Figma — fica para quando o arquivo for revisado de novo.
