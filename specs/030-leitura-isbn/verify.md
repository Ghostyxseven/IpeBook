# Verificação

Data: 07/10/2026 · Branch `feat/isbn-e-perfil-completo`.

## Executado

| Verificação                          | Resultado                                       |
| ------------------------------------ | ----------------------------------------------- |
| `npm run typecheck`                  | sem erros                                       |
| `npm run lint`                       | sem erros novos                                 |
| `npm run format:check`               | sem diferenças                                  |
| `npm test`                           | 297 testes, 297 aprovados (18 novos desta spec) |
| `architecture.test.mjs`              | o Model não importa `expo-camera`               |
| `npx expo export --platform android` | bundle gerado (4,1 MB)                          |
| `npx expo export --platform ios`     | bundle gerado (3,8 MB)                          |

`isbn.test.mjs` (18): dígito verificador de ISBN-10 (inclusive o `X`) e de
ISBN-13; normalização com hífen; conversão de 10 para 13 com dígito novo;
EAN-13 de livro contra código de barras de produto comum; código torto que não
vira requisição (provado pela lista de chamadas vazia do dublê); resposta vazia
da Open Library tratada como "não encontrado" e não como erro de rede; falha de
rede virando `network`; a máquina de estados da tela nos seis caminhos; e
`fillFromLookup` preservando o que a pessoa digitou.

## O ISBN de exemplo do Figma é inválido

O quadro 04.18 mostra `9788522005472` no campo. **Esse número não passa no
próprio dígito verificador** — a soma ponderada dá 117, e um ISBN-13 válido
precisa de múltiplo de 10. O dígito certo para `978852200547` é `5`.

Os testes e o `placeholder` do campo usam `9788522005475`. Vale avisar a equipe
de design: um exemplo inválido num quadro de "não encontrado" confunde quem for
testar a tela com aquele número.

## Divergências do Figma

| Quadro                     | O que o app faz de diferente, e por quê                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 04.02, 04.03, 04.17, 04.18 | São **estados de uma tela**, não quatro rotas. Rota separada desmontaria o Anunciar e levaria o rascunho junto (ver o plano)         |
| 04.02                      | "Digitar o ISBN" troca o visor pelo campo na mesma tela, em vez de abrir outro quadro                                                |
| 04.03                      | A capa do livro encontrado é um ícone, não a imagem: a Open Library nem sempre tem capa, e um quadrado vazio seria pior que um ícone |
| visor                      | Cor nova `color.scanner.*`, registrada em `docs/design-system/divergencias.md`                                                       |

## Não executado

| O quê                                 | Por quê                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Câmera real lendo um código de barras | `expo-camera` é módulo nativo: precisa de build de desenvolvimento (ADR 0015), que não existe nesta máquina. O Expo Go não serve |
| Consulta real à Open Library          | Os testes usam `fetch` falso. A chamada real depende de aparelho com internet                                                    |
| Permissão negada em aparelho          | Mesmo motivo do primeiro item                                                                                                    |

## Pendências

- Rodar em Android com build de desenvolvimento e ler o código de barras de um
  livro de verdade, de preferência uma edição brasileira — é onde a cobertura da
  Open Library é mais fraca e onde a tela 04.18 mais vai aparecer.
- Avisar a equipe de design sobre o ISBN inválido do quadro 04.18.
