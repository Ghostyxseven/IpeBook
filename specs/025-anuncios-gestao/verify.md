# Verificação

Data: 02/10/2026 · Branch `feature/anuncios-perfil`.

## Executado

| Verificação                          | Resultado                                           |
| ------------------------------------ | --------------------------------------------------- |
| `npm run typecheck`                  | sem erros                                           |
| `npm run lint`                       | sem erros                                           |
| `npm run format:check`               | sem diferenças                                      |
| `npm test`                           | 150 testes, 150 aprovados (38 novos desta feature)  |
| `architecture.test.mjs`              | Model sem React/Expo; View e rotas sem repositórios |
| `npx expo export --platform android` | bundle gerado (3,7 MB)                              |
| `npx expo export --platform ios`     | bundle gerado                                       |

Cobertura dos testes novos:

- `listings-model.test.mjs` (23): reais ↔ centavos nos formatos que as pessoas digitam, o centavo que o ponto flutuante comeria, separador de milhar, validação das três modalidades, limpeza do campo da modalidade anterior, situações editáveis, e o repositório em memória — publicar, trocar capa removendo a antiga, excluir apagando a foto, arquivar, republicar e a recusa em anúncio reservado.
- `listings-repository.test.mjs` (13): mapeamento de cada erro do Postgres, filtro por dono, URL pública da capa, os três campos da modalidade gravados juntos, nome único da foto sem `upsert`, limpeza da foto quando a linha não entra, ordem da troca de capa, exclusão apagando a foto antes da linha, recusa em reservado e ausência de sessão.
- `listings-viewmodel.test.mjs` (21, 11 desta spec): formulário sem erro antes de tentar avançar, passo travado por campo faltando, preço convertido, troca de modalidade limpando preço e condições, publicação bem-sucedida, publicação que não chama o servidor, erro de rede virando mensagem, edição preenchida, anúncio reservado travado com motivo, e salvar mantendo ou removendo a capa.

## Dois erros que os testes pegaram

1. **`reset` sem identidade estável.** O efeito que carrega o anúncio na edição depende dele; recriado a cada render, o efeito rodava para sempre. O teste da edição derrubou o Node com estouro de memória. Corrigido com `useCallback`.
2. **A mensagem de erro sumia antes de ser lida.** Uma ação recusada recarregava a lista, e o recarregamento limpava o erro. Carregar e agir passaram a ter erros separados.

## Não executado

| O quê                                 | Por quê                                                                                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluxo real em aparelho                | Pendente. Precisa de Android e iPhone reais, e das chaves do Supabase da equipe                                                                                             |
| Publicar contra o Supabase de verdade | As chaves não estão no repositório (só `.env.example`); os testes rodam contra cliente falso                                                                                |
| Envio real da foto ao bucket          | Depende do item acima. `expo-image-picker` foi adicionado nesta branch e ainda não rodou em aparelho                                                                        |
| Comparação com o Figma                | **Bloqueado**: os `node-id` da issue #36 não existem mais. O arquivo foi reorganizado em 01/10/2026 (capa "v1.0 · Em revisão") e a numeração das páginas mudou por completo |

## Pendências

- Conferir no aparelho e preencher a tabela de fluxo real, como a spec 018 fez.
- Repor os links do Figma nas issues #36 e #37 e comparar as telas.
- A exclusão da capa depende de uma chamada ao Storage que só dá para confirmar em ambiente real.

---

## Reconferência com o Figma — 07/10/2026 (débito técnico de UI)

**A comparação deixou de estar bloqueada.** O arquivo novo é
`cxEisNRzOQR6krv8Ow7HCa` e a seção da publicação é `206:3587` (04 · Publicação,
21 telas). A listagem de páginas da ferramenta de leitura mostra só algumas, mas
**pedir um `node-id` direto funciona** — era o número que faltava, não a
permissão. O mapa está em [`docs/figma-mapa.md`](../../docs/figma-mapa.md).

### O que bate

| Quadro                                | Situação                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 04.01 · Anunciar — etapa 1 (`12:210`) | Bate: "Etapa 1 de 3", rótulo "Livro", modalidade, capa, título, autor e a nota de rodapé. O link "Ler ISBN com a câmera" que faltava entrou pela spec 030 |
| 04.04 · Mostre seu livro (`28:685`)   | Bate                                                                                                                                                      |
| 04.05 · Anunciar — etapa 2 (`12:360`) | Bate                                                                                                                                                      |
| 04.07 · Anúncio publicado (`12:418`)  | Bate                                                                                                                                                      |
| 04.09 · Editar anúncio (`19:242`)     | Bate                                                                                                                                                      |
| Seção 05 · Estante (`206:3600`)       | Já havia sido conferida em 03/10/2026                                                                                                                     |

### O que não bate

| Quadro                                                        | Divergência                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **04.08 · Gerenciar anúncio** (`149:3348`)                    | O Figma tem uma **tela inteira** — "Seu livro, suas escolhas.", cartão do livro, cartão de situação ("Anúncio ativo"), e as ações _Editar anúncio_, _Pausar anúncio_, _Marcar como concluído_ e _Excluir anúncio_. O app usa a folha de opções `ShelfActionsSheet`, com _Ver anúncio_, _Editar_, _Arquivar_, _Republicar_ e _Excluir_. Três diferenças reais: tela × folha; "Pausar" × "Arquivar"; e **"Marcar como concluído" não existe no app** — concluir passa pela negociação (ADR 0018) |
| **04.06 · Revise o anúncio** (`19:327`)                       | Não existe no app. O fluxo publica direto do passo 3                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **04.10 · Anúncio pausado** (`150:3367`)                      | Não existe como tela; o app volta para a estante                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **04.11 a 04.16 · Rascunhos**                                 | **Nada disso existe.** Seis quadros: lista, retomar, "Salvar para depois?", "Rascunho salvo", "Descartar rascunho?" e o estado vazio. Sair do Anunciar hoje perde tudo                                                                                                                                                                                                                                                                                                                         |
| **04.20 e 04.21 · Excluir anúncio?** (`397:6961`, `397:7003`) | A confirmação existe dentro da folha de opções, não como quadro próprio; não há tela de "Anúncio excluído"                                                                                                                                                                                                                                                                                                                                                                                     |

### O que fazer com isso

Nada aqui é regressão: é escopo que a issue #36 não cobriu e que ninguém tinha
como ver enquanto os links estavam quebrados. **Rascunhos (04.11–04.16) é o maior
buraco** e merece issue própria — perder um anúncio meio preenchido ao sair da
tela é o tipo de coisa que faz a pessoa não voltar. As outras quatro são de
superfície e cabem numa passada só.

Registrado também em `docs/design-system/divergencias.md`.
