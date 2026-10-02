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
