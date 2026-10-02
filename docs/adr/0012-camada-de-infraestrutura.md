# 0012 — Camada de infraestrutura para clientes e recursos da plataforma

Data: 01/10/2026

## Status

Aceito. Complementa o [ADR 0002](0002-adotar-mvvm-pdm.md). Issue: #33.

## Contexto

Pelo MVVM Simplificado da disciplina, o Model "não conhece React nem UI". Dois arquivos em `src/model/repositories/` dependiam da plataforma:

- `supabaseClient.ts` importava `AppState` e `Platform` do `react-native` para renovar o token só com o app em primeiro plano;
- `localStore.ts` importava `expo-sqlite/localStorage/install` para guardar a sessão no aparelho.

Os repositórios precisam desses recursos, mas não precisam saber de onde eles vêm: as factories já injetam o cliente e o armazenamento.

## Decisão

Criar a pasta **`src/infra/`** para o que depende da plataforma ou de bibliotecas nativas e é entregue pronto às factories:

| Arquivo                                     | Responsabilidade                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `infra/supabaseClient.ts`                   | Cria o cliente Supabase a partir do `.env`                                                                        |
| `infra/sessionRefresh.ts`                   | Liga a renovação do token ao `AppState` (Android e iOS); começa já na abertura se o app estiver em primeiro plano |
| `infra/localStore.ts` / `localStore.web.ts` | Armazenamento local: SQLite no celular, `localStorage` na Web                                                     |

Dependências permitidas:

- **Model** (`src/model`): só TypeScript e tipos de bibliotecas de dados (por exemplo, `import type` do `@supabase/supabase-js`). Nada de `react`, `react-native` ou `expo-*`.
- **Infra** (`src/infra`): pode usar `react-native`, `expo-*` e SDKs. Não contém regra de negócio.
- **Factories** (`src/factories`): única camada que junta infra, repositórios e ViewModels.
- **View** (`src/view`, `src/app`): não importa repositórios nem a infra.

O teste `tests/architecture.test.mjs` verifica as duas proibições automaticamente.

## Alternativas

- **Ligar o `AppState` direto na factory:** resolveria o `AppState`, mas o `expo-sqlite` continuaria no Model, e cada factory repetiria a ligação.
- **Manter o armazenamento no Model com justificativa em ADR**, como a issue permite: resolveria a exigência, mas deixaria uma exceção à regra da disciplina sem necessidade.

## Consequências

- Os repositórios continuam recebendo o cliente e o armazenamento por parâmetro, então os testes não mudam.
- Novas integrações com a plataforma (câmera, notificações, leitura de ISBN) entram em `src/infra/` e são injetadas pelas factories.
- A renovação do token passa a começar na abertura do app, e não só na primeira troca de primeiro/segundo plano.
