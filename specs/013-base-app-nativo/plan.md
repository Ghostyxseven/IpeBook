# Plano

Branch `feature/autenticacao`, criada de `develop` em `7833b2b`. Expo SDK 57, React 19.2, React Native 0.86, MVVM do ADR 0002.

## Dependências

Instaladas com `npx expo install` para manter versões compatíveis com o SDK 57: `expo-router`, `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants` e `@react-native-community/netinfo`. O `jsdom` vira devDependency para os testes rodarem em qualquer máquina.

## Estrutura

```
src/
├── app/                      # só rotas (reexportam telas)
│   ├── _layout.tsx           # SafeArea, StatusBar, Stack
│   ├── index.tsx             # abertura + redirecionamento
│   ├── (auth)/_layout.tsx    # sessão, aviso offline, redireciona se já entrou
│   └── (app)/_layout.tsx, inicio.tsx  # sessão, aviso offline, exige sessão
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
- Entradas por plataforma: `index.js` (Expo Router) e `index.web.js` (apresentação institucional). Medições e alternativas no ADR 0005.
- O aviso offline fica nos layouts `(auth)` e `(app)`.
- A proteção usa `Redirect` nos layouts dos grupos em vez de `Stack.Protected`, para que entrar e sair levem sempre ao destino certo.

## Verificação

`npm run typecheck`, `npm test`, `npm run build:web`, exportação dos bundles Android e iOS, os roteiros CDP existentes no Chrome local e comparação de tamanho e LCP com a `develop`.
