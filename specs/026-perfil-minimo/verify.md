# Verificação

Data: 02/10/2026 · Branch `feature/anuncios-perfil`.

## Executado

| Verificação             | Resultado                                        |
| ----------------------- | ------------------------------------------------ |
| `npm run typecheck`     | sem erros                                        |
| `npm run lint`          | sem erros                                        |
| `npm test`              | 150 testes, 150 aprovados (4 novos desta spec)   |
| `architecture.test.mjs` | View e rotas sem repositórios nem infraestrutura |

- `profile.test.mjs` (4): contagem por situação, perfil sem anúncio convidando em vez de mostrar zeros, a frase que não lista situação inexistente, e concordância de singular e plural.
- A Minha estante usa `useMyListingsViewModel`, coberto em `listings-viewmodel.test.mjs` (carregar, vazio, arquivar no próprio card, excluir e ação recusada).

## Mudanças em arquivo de outra feature

Duas, as duas previstas pela issue #37 e já anotadas em comentário no código:

- `(tabs)/_layout.tsx` e `NavigationBar.tsx` ganharam as abas Estante e Perfil. Os dois arquivos tinham comentário reservando o lugar.
- `HomeScreen.tsx` perdeu o botão Sair do topo, que foi para o Perfil. O comentário dizia "temporário: sair fica aqui até a feature de Perfil existir".

Nada além disso foi tocado no código do catálogo.

## Não executado

| O quê                  | Por quê                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Fluxo real em aparelho | Pendente, junto com a spec 025                                                               |
| Comparação com o Figma | **Bloqueado** pelos mesmos links quebrados: os quadros 07 e 10 da issue #37 não existem mais |

## Pendências

- Conferir a barra de navegação com quatro abas em tela pequena: quatro rótulos podem apertar o Material 3.
- A issue #47 (excluir a conta) vai pendurar o botão dela nesta tela.
