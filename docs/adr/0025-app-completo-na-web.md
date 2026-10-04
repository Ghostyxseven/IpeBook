# 0025 — App completo na Web, em /app

Data: 04/10/2026

## Status

Proposto, implementado. Falta configurar as variáveis do Supabase na Vercel e testar entrar e anunciar no navegador.

## Contexto

Pelo [ADR 0005](0005-navegacao-expo-router.md), a Web mostra só a apresentação institucional, sem o Expo Router, para manter o JavaScript inicial em cerca de 112 KB (gzip). Com isso, quem abre o site não consegue entrar, anunciar nem negociar. O app já roda com react-native-web: a sessão usa o `localStorage` do navegador (`localStore.web.ts`), a confirmação de conta e a recuperação de senha usam código, sem link de retorno, e não há `Alert` nativo nas telas.

## Decisão

- O mesmo projeto exporta dois pacotes Web. `npm run build:web` (`scripts/build-web.mjs`) gera a apresentação em `dist/` e o app em `dist/app/`.
- `index.web.js` escolhe a entrada por `EXPO_PUBLIC_WEB_APP`, fixada no build. Sem ela, o pacote da apresentação continua igual (o ramo do roteador sai na minificação). Com `1`, carrega `expo-router/entry`.
- `app.config.js` define `experiments.baseUrl = '/app'` só no build do app.
- `vercel.json` reescreve `/app/:path*` para `/app/index.html`. Os demais caminhos inexistentes continuam respondendo 404, como pede a [spec 011](../../specs/011-auditoria-web/spec.md).
- A CSP passa a aceitar `https://*.supabase.co` e `wss://*.supabase.co` em `connect-src`, e `blob:` e `https://*.supabase.co` em `img-src` (capas e foto escolhida). A `Permissions-Policy` libera a localização para o próprio site (bairro aproximado).

## Alternativas

- **Expo Router também na raiz:** troca a apresentação rápida por cerca de 400 KB de JavaScript inicial (medição do ADR 0005).
- **Segundo projeto na Vercel:** isolaria os cabeçalhos, mas o `vercel.json` é um só por repositório e dobraria a configuração.

## Consequências

- Na Vercel, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` precisam existir nos ambientes Preview e Production; sem elas o app mostra "não configurado".
- Os botões "Entrar" e "Criar conta" da apresentação ainda abrem o aviso de indisponibilidade. Ligá-los a `/app/entrar` e `/app/criar-conta` fica para quando o app na Web for validado.
- O build da Web leva mais tempo, porque exporta o app inteiro.
