# Plano

Branch `feature/autenticacao`, criada de `develop` em `7833b2b`. Expo SDK 57, React 19.2, React Native 0.86, MVVM do ADR 0002.

## Dependências

Instaladas com `npx expo install` para manter versões compatíveis com o SDK 57: `expo-router`, `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants` e `@react-native-community/netinfo`. O `jsdom` vira devDependency para os testes rodarem em qualquer máquina.

## Estrutura

```
src/
├── app/                      # só rotas (reexportam telas)
│   ├── _layout.tsx           # SafeArea, StatusBar, OfflineBanner, Stack.Protected
│   ├── index.tsx             # nativo: abertura + redirecionamento
│   ├── index.web.tsx         # Web: apresentação institucional
│   ├── (auth)/_layout.tsx
│   └── (app)/_layout.tsx, inicio.tsx
├── factories/                # monta repositórios e ViewModels (injeção de dependências)
├── viewmodel/useConnectivity.ts
└── view/
    ├── theme/nativeTheme.ts  # tokens → objeto React Native com Platform.select
    ├── components/ui/        # Button, TextField, FormMessage
    ├── components/feedback/  # LoadingState, EmptyState, ErrorState, OfflineBanner
    └── screens/              # SplashScreen, HomeScreen e telas das features
```

## Decisões

- O tema lê `design-tokens.json` diretamente. Os valores por plataforma vêm de `platform.android|ios|web` via `Platform.select`.
- Fonte: a Web usa Roboto (já carregada em `public/index.html`). O Android usa a fonte do sistema, que é Roboto. O iOS usa a fonte do sistema, conforme a regra do design system sobre tipografia nativa. Divergência registrada no `verify.md`.
- O aviso offline usa NetInfo. Considera offline só quando `isConnected === false` ou `isInternetReachable === false`; o valor `null` (ainda desconhecido) não mostra aviso.
- A raiz mostra a abertura enquanto a sessão carrega, exceto em `/` na Web, para não atrasar a apresentação institucional.
- `vercel.json`: reescritas explícitas das rotas do app para `/index.html`, sem fallback universal.

## Verificação

`npm run typecheck`, `npm test`, `npm run build:web`, os roteiros CDP existentes (`verificar-recursos-web.mjs`, `verificar-gesto-livro.mjs`) no Chrome local e a verificação das rotas nativas no build Web.
