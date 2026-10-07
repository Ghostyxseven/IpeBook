# Verificação

Data: 07/10/2026 · Branch `feat/isbn-e-perfil-completo`.

## Executado

| Verificação                          | Resultado                                       |
| ------------------------------------ | ----------------------------------------------- |
| `npm run typecheck`                  | sem erros                                       |
| `npm run lint`                       | sem erros novos                                 |
| `npm run format:check`               | sem diferenças                                  |
| `npm test`                           | 298 testes, 298 aprovados (18 novos desta spec) |
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

## O que a revisão pegou

**Pedido de permissão em laço.** `useIsbnCameraPermission` devolvia um objeto
novo a cada render, e o efeito que pede a permissão dependia dele — então o
efeito rodava sempre, reabrindo o pedido enquanto a pessoa não respondesse. Em
aparelho isso é um diálogo que não para de voltar. O hook passou a memorizar o
retorno, e os efeitos passaram a depender dos valores (`granted`, `canAskAgain`)
em vez do objeto.

O `npm test` não pegaria: a tela da câmera não é montada em teste. Apareceu
relendo o código à procura de dependência de efeito instável.

## Não executado

| O quê                                 | Por quê                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Câmera real lendo um código de barras | Depende de aparelho. `expo-camera` **está incluído no Expo Go**, então o teste não espera build — o que falta é alguém rodar |
| Consulta real à Open Library          | Os testes usam `fetch` falso. A chamada real depende de aparelho com internet                                                |
| Permissão negada em aparelho          | Mesmo motivo do primeiro item                                                                                                |

## Pendências

- Rodar em Android pelo Expo Go e ler o código de barras de um
  livro de verdade, de preferência uma edição brasileira — é onde a cobertura da
  Open Library é mais fraca e onde a tela 04.18 mais vai aparecer.
- Avisar a equipe de design sobre o ISBN inválido do quadro 04.18.
