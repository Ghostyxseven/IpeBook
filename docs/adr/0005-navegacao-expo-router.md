# 0005 — Navegação do aplicativo com Expo Router

Data: 30/09/2026

## Status

Aceito. Complementa o [ADR 0004](0004-pagina-institucional-web.md): a Web continua com entrada própria e sem roteador; o Expo Router passa a ser a navegação do aplicativo Android e iOS.

## Contexto

O aplicativo vai ter dezenas de telas (66 quadros por plataforma no Figma) divididas entre quatro pessoas: autenticação, catálogo, negociação e perfil. O projeto só tinha `App.js` (template do Expo) e a apresentação Web em `App.web.tsx`. Sem um roteador comum, cada feature criaria sua própria navegação, com conflitos de código e fluxos incoerentes.

Também avaliamos colocar a Web sob o Expo Router, com `/` para a apresentação e as rotas de conta no site. Medição local de 30/09/2026 (build de produção com gzip, celular 390 × 844, CPU 4× mais lenta, rede de 150 ms e 1,6 Mbps, três execuções):

| Web                             |                                     JS inicial (gzip) | LCP (mediana) |
| ------------------------------- | ----------------------------------------------------: | ------------: |
| `develop`, sem roteador         |                                                112 KB |         2,0 s |
| Com Expo Router                 |                                                402 KB |         5,2 s |
| Com Expo Router + `asyncRoutes` | cerca de 400 KB (layouts e `__common` pré-carregados) |             — |

Uma entrada Web com `import()` dinâmico do roteador gerou erros "Requiring unknown module" no SDK 57. Por decisão da equipe em 30/09/2026, a Web mantém o desempenho obtido na [spec 011](../../specs/011-auditoria-web/spec.md).

## Decisão

Adotar o **Expo Router** (SDK 57) no Android e no iOS, com rotas por arquivo em `src/app/` (diretório padrão quando existe `src/`).

- `package.json` aponta `main` para `index`. O Metro escolhe `index.js` no celular (importa `expo-router/entry`) e `index.web.js` na Web (registra `InstitutionalScreen`, como antes fazia `App.web.tsx`).
- `src/app/_layout.tsx`: área segura, barra de status e `Stack`.
- `src/app/index.tsx`: abertura enquanto a sessão carrega e redirecionamento para onboarding, Entrar ou Início.
- `src/app/(auth)/`: onboarding, entrar, criar conta, verificar e-mail e recuperar senha. O layout redireciona para `/inicio` quando já existe sessão.
- `src/app/(app)/`: área autenticada. O layout mostra a abertura enquanto carrega e redireciona para `/entrar` sem sessão. Cada feature acrescenta suas rotas aqui.
- A proteção usa `Redirect` nos layouts dos grupos, e não `Stack.Protected`: assim a saída de uma área leva sempre ao destino certo, sem depender da rota âncora.
- Arquivos de rota só reexportam telas de `src/view/screens/`, mantendo a regra do ADR 0004 de não concentrar JSX em `app`. Os `_layout.tsx` contêm apenas navegação e proteção.

## Alternativas

- **Expo Router também na Web:** entregaria as telas de conta no site, mas com a regressão medida acima. Pode voltar numa spec futura, por exemplo com renderização estática (`output: "static"`) ou com a apresentação em projeto separado.
- **React Navigation direto:** exigiria configurar deep links manualmente. Desde o SDK 56 o Expo Router não aceita importar pacotes `@react-navigation/*` externos, então misturar os dois não é possível.
- **Manter sem roteador:** inviável para 66 telas e quatro pessoas.

## Consequências

- `App.js` e `App.web.tsx` deixam de existir; `index.js` e `index.web.js` são as entradas por plataforma.
- A Web não tem as rotas do app: "Entrar" e "Criar conta" continuam mostrando o aviso de indisponibilidade.
- Importar `expo-router` em código usado pela Web colocaria o roteador no pacote do site. Telas da Web não devem depender dele.
- A área `(app)` fica disponível para as outras features criarem suas rotas sem mexer na autenticação.

Referências: [Expo Router — instalação](https://docs.expo.dev/router/installation/), [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/), [Async routes](https://docs.expo.dev/router/web/async-routes/).
