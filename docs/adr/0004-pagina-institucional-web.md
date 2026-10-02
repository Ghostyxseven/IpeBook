# 0004 — Apresentação Web com entrada específica e navegação por fragmentos

Data: 29/09/2026

## Status

Aceito para a [página institucional](../../specs/001-pagina-institucional/spec.md).

## Contexto

O projeto usa Expo sem Expo Router e possui apenas a tela padrão. O pedido é apresentação Web na raiz com documentos públicos, não o aplicativo autenticado. HTML semântico favorece links, teclado e leitura.

## Decisão

Usar App.web.tsx, HTML semântico e CSS suportados pelo Metro Expo 57. Manter MVVM: conteúdo e resolução de destinos no Model, estado em hook e apresentação na View. Documentos usam /#termos, /#privacidade e /#lgpd, permitindo hospedagem estática, recarga e histórico sem roteador. Tokens JSON viram variáveis CSS. Fontes e recursos são locais; sem analytics, cookies opcionais ou cadastro.

## Alternativas

- Expo Router: adequado ao aplicativo futuro, desnecessário para esta página e documentos.
- Aplicação independente: duplicaria build e dependências.
- Documentos em modais: prejudicariam links e leitura; reservar diálogo ao acesso indisponível.

## Consequências

A entrada nativa é preservada. URLs legais usam fragmentos. SEO completo/pré-renderização ficam fora desta etapa. Documentos preliminares não atestam conformidade: responsável, canal de dados e hospedagem precisam ser definidos antes da operação. TypeScript e tipos React passam a dependências de desenvolvimento explícitas para validar TSX.

Referências: [ADR](https://github.com/architecture-decision-record/architecture-decision-record), [Metro Expo 57](https://docs.expo.dev/versions/v57.0.0/config/metro/), [plano](../../specs/001-pagina-institucional/plan.md).

## Organização da View

Conforme correção explícita do usuário, `App.web.tsx` e `src/app/index.web.tsx` apenas exportam a tela. A interface está em `src/view/screens/InstitutionalScreen.web.tsx`; não concentrar JSX em `app`.

Atualização: os documentos passaram a ter endereços reais (`/privacidade` etc.) pelo [ADR 0010](0010-rotas-reais-para-documentos.md); os capítulos do livro seguem como fragmentos.

Atualização (02/10/2026): a decisão "sem analytics" deixou de valer. O site passou a usar **Vercel Web Analytics** e **Speed Insights** (`@vercel/analytics` e `@vercel/speed-insights`), que medem visitas e desempenho de forma agregada, sem cookies opcionais; a Política de Privacidade descreve esse uso (PR #7). Cookies opcionais e cadastro no site continuam fora.
