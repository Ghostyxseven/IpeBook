# 032 — Rascunhos e o ciclo de vida do anúncio

Responsável: Eric Vinícius dos Santos Oliveira. Issue #36 (as telas que faltavam).

## Objetivo

Fechar a seção **04 · Publicação** do Figma. A spec 025 entregou o caminho feliz —
preencher e publicar. Faltavam doze quadros: o que fazer com um anúncio depois de
publicado, o que acontece quando você desiste no meio, e o que acontece quando
você exclui.

Esta spec existe porque a reconferência de 07/10/2026 encontrou esses quadros.
Enquanto os links do Figma estavam quebrados, ninguém tinha como ver que eles
existiam.

## Por que os rascunhos são o item mais importante

Hoje, **sair da tela de Anunciar perde tudo o que foi digitado**. Quem estava
cadastrando um livro, recebeu uma ligação e voltou, começa do zero. É o tipo de
perda que faz a pessoa não tentar de novo — e são seis quadros desenhados,
esperando desde o começo.

## Fluxos

### Rascunhos (04.11 a 04.16)

| Quadro           | Tela                | O que faz                                                                                                                                                         |
| ---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 04.13 `254:7274` | Salvar para depois? | Ao sair do Anunciar com algo preenchido: "Guarde este anúncio como rascunho e continue quando quiser. Ele ainda não será publicado." · **Continuar** / **Salvar** |
| 04.14 `254:5014` | Rascunho salvo      | "Seu anúncio pode esperar." · o rascunho listado · **Continuar edição**, **Ver rascunhos**, **Voltar à estante**                                                  |
| 04.11 `254:4884` | Rascunhos           | "Sua ideia está guardada." · a lista · **Retomar anúncio**, **Descartar rascunho**, **Criar outro anúncio**                                                       |
| 04.12 `254:7056` | Retomar rascunho    | O formulário do Anunciar, já preenchido com o rascunho                                                                                                            |
| 04.15 `254:7408` | Descartar rascunho? | "As informações deste rascunho serão apagadas. Esta ação não pode ser desfeita." · **Cancelar** / **Descartar**                                                   |
| 04.16 `254:5144` | Rascunhos · vazio   | "Nenhum rascunho salvo" · **Anunciar um livro**, **Voltar à estante**                                                                                             |

Cada rascunho mostra o título e **o que ainda falta** nele: "Venda · faltam
estado e localização". Dizer o que falta é o que transforma a lista num convite
para terminar, em vez de um depósito.

### Gerenciar o anúncio (04.08, 04.10, 04.20, 04.21)

| Quadro           | Tela              | O que faz                                                                                                                                                           |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 04.08 `149:3348` | Gerenciar anúncio | "Seu livro, suas escolhas." · prévia do anúncio · cartão **Anúncio ativo** · **Editar anúncio**, **Pausar anúncio**, **Marcar como concluído**, **Excluir anúncio** |
| 04.10 `150:3367` | Anúncio pausado   | "Um intervalo para seu livro." · cartão **Fora do catálogo** · **Editar anúncio** · **Retomar anúncio**, **Voltar à estante**                                       |
| 04.20 `397:6961` | Excluir anúncio?  | "Excluir este anúncio?" · "As conversas sobre o livro continuam disponíveis no seu histórico." · **Excluir anúncio** / **Manter anúncio**                           |
| 04.21 `397:7003` | Anúncio excluído  | "Anúncio excluído." · **Ver minha estante**, **Anunciar outro livro**                                                                                               |

### Falha ao enviar fotos (04.19)

`370:6433` — publicar falhou por rede **com uma foto escolhida**. "Sua foto não
foi enviada." · "Confira sua conexão. As informações do anúncio continuam
guardadas." · **Tentar novamente** / **Salvar rascunho**.

A perda aqui é assimétrica: o texto inteiro está digitado e só a foto não subiu.
É também o quadro que mais depende desta spec — ele oferece "Salvar rascunho",
que até agora não existia.

Sem foto, a mesma falha de rede continua sendo só uma mensagem no rodapé do
formulário: não é problema de envio de foto, e abrir uma tela cheia para dizer
"sem internet" seria exagero.

### Revise o anúncio (04.06)

`19:327` — a edição quando a validação recusa: a barra passa a dizer **"Revise o
anúncio"**, com a linha "Corrija os campos destacados para salvar." acima dos
campos. Os campos com erro já existiam; o que faltava era a tela se nomear pelo
que está acontecendo.

## Vocabulário: "pausar", não "arquivar"

O Figma diz **Pausar**, **Pausado** e **Retomar**. O aplicativo dizia _Arquivar_,
_Arquivado_ e _Republicar_. A situação no banco continua `arquivado` — mudar isso
exigiria migração sem ganho nenhum —, mas **as palavras na tela passam a ser as
do Figma**. "Pausar" descreve o que a pessoa quer fazer; "arquivar" descreve o
que o banco faz.

## O botão que não pode funcionar

**"Marcar como concluído"** está no quadro 04.08, mas concluir um anúncio não é
uma ação de quem anunciou: a situação `concluido` pertence à negociação e é a
função `transition_book_request` que a aplica (ADR 0018). Um botão que grava
`concluido` por fora quebraria o combinado com a outra pessoa.

A linha aparece na tela, como no quadro, e leva às **Conversas** — com o texto de
apoio "Pela negociação, em Conversas" dizendo onde a conclusão acontece de
verdade. Está registrado em `docs/design-system/divergencias.md`.

## Aceite

- Sair do Anunciar com qualquer campo preenchido pergunta antes de descartar.
- O rascunho salvo sobrevive a fechar e reabrir o aplicativo.
- A lista de rascunhos diz, de cada um, o que ainda falta preencher.
- Retomar abre o formulário preenchido na etapa 1.
- Descartar pede confirmação e não tem desfazer.
- Sem rascunho nenhum, a tela convida a anunciar em vez de mostrar lista vazia.
- Tocar num anúncio da estante abre **Gerenciar anúncio**, não uma folha.
- Um anúncio pausado mostra "Fora do catálogo" e oferece **Retomar**.
- Excluir pede confirmação, e a confirmação diz que as conversas continuam.
- A edição com erro se chama "Revise o anúncio".
- Publicar sem rede com foto escolhida mostra o quadro 04.19, com a saída de salvar rascunho; sem foto, segue sendo mensagem no rodapé.
- Estados: carregando, vazio, erro com "Tentar de novo", e ação recusada.
- Alvos de 48 × 48, rótulos acessíveis, texto ampliável, nada só por cor.
- Model e ViewModel testados com repositório em memória.

## Fora do escopo

Rascunho sincronizado entre aparelhos (ADR 0030); guardar a foto no rascunho;
agendar publicação; duplicar um anúncio existente.

## Dependências

- **Spec 025** — o formulário, a estante e o `ListingsRepository`.
- **ADR 0030** — por que o rascunho mora no aparelho.
- **ADR 0018** — por que "Marcar como concluído" não grava nada.

## Referência de design

Figma `cxEisNRzOQR6krv8Ow7HCa`, seção **04 · Publicação** (`206:3587`). Mapa em
[`docs/figma-mapa.md`](../../docs/figma-mapa.md).
