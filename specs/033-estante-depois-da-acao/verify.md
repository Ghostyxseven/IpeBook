# Verificação

Data: 07/10/2026 · Branch `feat/isbn-e-perfil-completo`.

## Executado

| Verificação            | Resultado                                      |
| ---------------------- | ---------------------------------------------- |
| `npm run typecheck`    | sem erros                                      |
| `npm run lint`         | sem erros novos                                |
| `npm run format:check` | sem diferenças                                 |
| `npm test`             | 317 testes, 317 aprovados (2 novos desta spec) |
| `npx expo export`      | Android e iOS gerados                          |

Os dois testes cobrem a concordância de número das duas frases — "1 anúncio
restante" × "2 anúncios restantes" e "Uma proposta" × "3 propostas" —, que é o
que de fato pode sair errado num aviso montado a partir de uma contagem.

## Divergências do Figma

As três estão explicadas na spec e registradas em `divergencias.md`:

1. **05.07 é um aviso no topo da estante, não uma tela.** O quadro 04.21 já
   ocupa o momento logo após excluir; uma segunda tela cheia repetiria a notícia.
2. **05.08 é um bloco na aba Propostas, não uma tela.** Para ser tela, a recusa
   teria de navegar até aqui — e a recusa acontece na negociação, que é feature
   de outra pessoa.
3. **O nome de quem propôs não aparece.** A lista carrega o pedido e o livro, não
   o nome; buscá-lo seria uma chamada por proposta ao repositório da negociação.

## Não executado

Conferência visual em aparelho, junto com as specs 025, 026 e 032.
