# 0005 — Navegação do aplicativo com Expo Router

Data: 30/09/2026

## Status

Aceito. Substitui a parte do [ADR 0004](0004-pagina-institucional-web.md) que mantinha o projeto sem roteador e com entrada `App.web.tsx`.

## Contexto

O aplicativo nativo vai ter dezenas de telas (66 quadros por plataforma no Figma) divididas entre quatro pessoas: autenticação, catálogo, negociação e perfil. O projeto só tinha `App.js` (template do Expo) e a apresentação Web em `App.web.tsx`. Sem um roteador comum, cada feature criaria sua própria navegação, com conflitos de código e fluxos incoerentes.

A página institucional precisa continuar na raiz `/` da Web e manter os fragmentos `/#termos`, `/#privacidade`, `/#lgpd` e `/#seguranca`. O design system reforça que `/` não é a tela Entrar.

## Decisão

Adotar o **Expo Router** (SDK 57), com rotas por arquivo em `src/app/` (diretório padrão quando existe `src/`) e entrada `expo-router/entry`.

- `src/app/_layout.tsx`: provedores globais, aviso de conexão e proteção de rotas com `Stack.Protected`.
- `src/app/index.web.tsx`: página institucional na Web, sem mudança de comportamento.
- `src/app/index.tsx`: no Android e no iOS, mostra a abertura enquanto a sessão carrega e redireciona para onboarding, Entrar ou Início.
- `src/app/(auth)/`: onboarding, entrar, criar conta, verificar e-mail e recuperar senha. Só acessível sem sessão.
- `src/app/(app)/`: área autenticada. Cada feature acrescenta suas rotas aqui.
- Arquivos de rota só reexportam telas de `src/view/screens/`, mantendo a regra do ADR 0004 de não concentrar JSX em `app`. Os `_layout.tsx` contêm apenas a configuração do navegador.

A Web continua com `output: "single"`. As rotas do aplicativo recebem reescritas explícitas para `/index.html` no `vercel.json`; arquivos ausentes continuam respondendo 404, como decidido na [spec 011](../../specs/011-auditoria-web/spec.md).

## Alternativas

- **React Navigation direto:** exigiria configurar deep links e Web manualmente. Desde o SDK 56 o Expo Router não aceita importar pacotes `@react-navigation/*` externos, então misturar os dois não é possível.
- **Manter sem roteador:** inviável para 66 telas e quatro pessoas.
- **Renderização estática (`output: "static"`):** melhoraria o SEO da página institucional, mas ela depende de `window` em vários pontos. Fica para uma decisão futura.

## Consequências

- `App.js`, `App.web.tsx` e `index.js` deixam de existir; a entrada passa a ser `expo-router/entry`.
- Novas rotas do app precisam entrar na lista de reescritas do `vercel.json` para funcionar ao recarregar na Web.
- A área `(app)` fica disponível para as outras features criarem suas rotas sem mexer na autenticação.

Referências: [Expo Router — instalação](https://docs.expo.dev/router/installation/), [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/).
