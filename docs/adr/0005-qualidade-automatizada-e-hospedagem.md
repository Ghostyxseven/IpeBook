# 0005 — Qualidade automatizada e endurecimento da hospedagem estática

Data: 01/10/2026

## Status

Aceito.

## Contexto

Os testes dependiam de um jsdom instalado fora do repositório e falhavam em outras máquinas. Não havia CI. O lint não lia TypeScript. O `vercel.json` declarava um framework incorreto e não definia cabeçalhos de segurança.

## Decisão

- jsdom passa a dependência de desenvolvimento.
- ESLint cobre JS/MJS; arquivos TS são verificados por `tsc` estrito com `noUnusedLocals`, porque typescript-eslint ainda não suporta o TypeScript 7.
- `npm run verify` reúne tipos, lint, formatação e testes; o workflow de CI o repete e acrescenta o build Web.
- `vercel.json` define CSP restritiva, `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, cache imutável para recursos com hash e fallback para `index.html`.
- A trava de rolagem de diálogos e menu usa um contador compartilhado (`useScrollLock`). O foco dos diálogos usa o comportamento nativo de `showModal()`.

## Alternativas

- Manter o jsdom fora do repositório: falha em CI e em outras máquinas.
- Fixar TypeScript 5 para usar typescript-eslint: recuar uma dependência já adotada só para o lint.

## Consequências

Regressões passam a ser barradas no PR. A CSP pode bloquear recursos externos futuros; qualquer novo domínio precisa ser liberado explicitamente. Voltar ao lint de TS exige suporte do typescript-eslint ao TypeScript 7.
