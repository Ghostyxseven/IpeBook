# Verificação

Data: 02/10/2026 · Branch `feature/anuncios-perfil`.

## Executado

| Verificação                          | Resultado                                        |
| ------------------------------------ | ------------------------------------------------ |
| `npm run typecheck`                  | sem erros                                        |
| `npm run lint`                       | sem erros                                        |
| `npm test`                           | 150 testes, 150 aprovados (4 novos desta spec)   |
| `architecture.test.mjs`              | View e rotas sem repositórios nem infraestrutura |
| `npx expo export --platform android` | bundle gerado (3,7 MB)                           |
| `npx expo export --platform ios`     | bundle gerado                                    |

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

---

## Reconferência com o Figma — 07/10/2026 (débito técnico de UI)

**Desbloqueada.** O quadro é `25:524` (07.01 · Meu perfil), no arquivo
`cxEisNRzOQR6krv8Ow7HCa`; o mapa completo está em
[`docs/figma-mapa.md`](../../docs/figma-mapa.md).

A tela tinha sido montada às cegas, e as diferenças eram grandes: o quadro pede
barra "Perfil" com engrenagem, avatar monograma com nome e "Piripiri, PI · desde
2026", três números (anúncios, trocas, avaliação) e uma lista de seis destinos —
Minhas publicações, Avaliações recebidas, Notificações, Segurança e verificação,
Ajuda e Sair. O que existia era um título no corpo, um cartão com nome e e-mail,
um botão para a estante e o Sair.

**Já corrigido**, na spec 031 (a issue #53 é justamente a do perfil completo). A
tabela com o antes e o depois está em
[`specs/031-perfil-completo/verify.md`](../031-perfil-completo/verify.md).

Uma mudança merece destaque porque **remove** informação: **o e-mail saiu do
perfil**. Ele não aparece em nenhum ponto do quadro 07.01, e não há motivo para a
tela mostrar a quem já sabe. Quem precisa conferir a conta encontra em
Configurações.

A Minha estante continua como estava: já tinha sido conferida contra 05.01–05.06
em 03/10/2026, e o "Concluídos" dela é a "Estante após venda, troca e doação" que
a issue #53 pedia.
