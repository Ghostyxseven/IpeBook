# 030 — Leitura de ISBN

Responsável: Eric Vinícius dos Santos Oliveira. Issue #52 (extra), depois da #36.

## Objetivo

Encurtar o cadastro do anúncio: a pessoa aponta a câmera para o código de barras
da contracapa e o título e o autor chegam preenchidos. É um **atalho**, nunca um
caminho obrigatório — o cadastro manual da spec 025 continua inteiro e funcionando
em todas as três modalidades (venda, troca e doação).

## Por que é só um atalho

A leitura depende de três coisas que podem faltar: a câmera (permissão negada,
aparelho sem câmera, navegador), o código de barras (exemplar antigo, capa
rasgada, livro sem ISBN) e a base pública (edição brasileira que ninguém
cadastrou). Em qualquer uma dessas falhas o fluxo cai de volta no formulário
manual sem perder nada do que já foi digitado.

## Fluxos

As seis telas de ISBN do Figma, seção **04 · Publicação**:

| #   | Tela                 | Figma                      | O que faz                                                                                                                                                                                             |
| --- | -------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Anunciar — etapa 1   | `12:210` → link `108:2430` | O atalho **"Ler ISBN com a câmera"** aparece acima dos campos, com a legenda "Preenche título e autor"                                                                                                |
| 2   | Ler ISBN             | `12:275`                   | Visor da câmera com a moldura âmbar e "Centralize o código de barras". Abaixo: "Mantenha o livro parado e com boa luz. A leitura começa sozinha." mais **Digitar o ISBN** e **Preencher sem ISBN**    |
| 3   | Digitar o ISBN       | `12:275` (ação)            | O mesmo visor com o campo ISBN no lugar da câmera — a saída de quem não tem câmera ou prefere teclar                                                                                                  |
| 4   | Livro identificado   | `12:320`                   | Folha sobre o visor escurecido: selo **Código lido**, "Encontramos seu livro.", cartão com capa, título, autor e "Confira título e autor", e as ações **Usar estes dados** / **Corrigir manualmente** |
| 5   | Câmera não permitida | `370:6349`                 | "Precisamos da câmera para ler o ISBN." + **Tentar novamente** / **Preencher manualmente**                                                                                                            |
| 6   | ISBN não encontrado  | `370:6391`                 | "Não encontramos esse ISBN." com o código lido no campo, **Ler novamente** / **Preencher manualmente**                                                                                                |

A leitura dispara sozinha quando o código entra no quadro — não existe botão de
capturar, e é por isso que a tela avisa "A leitura começa sozinha".

## Regras

1. **O ISBN é validado antes de qualquer rede.** ISBN-10 e ISBN-13 têm dígito
   verificador; um código errado vira "Não encontramos esse ISBN" sem gastar uma
   requisição. O leitor de barras devolve EAN-13, que para livro é o próprio
   ISBN-13 (prefixos 978 e 979).
2. **A leitura nunca sobrescreve o que a pessoa já escreveu.** Campo preenchido
   fica como está; o ISBN só preenche o que está vazio. "Usar estes dados" com
   título já digitado mantém o digitado — a tela 04.03 existe justamente para
   conferir antes de aplicar.
3. **A pessoa confirma sempre.** Nada entra no formulário sem passar pela 04.03.
4. **Só título e autor.** A base pública erra categoria, conservação e preço, que
   são do exemplar e não da edição. Esses continuam sendo escolhidos na etapa 3.
5. **Sem câmera, o fluxo não morre.** Na Web e em qualquer aparelho que negue a
   permissão, "Digitar o ISBN" alcança exatamente o mesmo resultado.

## Aceite

- As seis telas acima existem e seguem os quadros citados do Figma.
- O cadastro manual continua funcionando quando o ISBN não é encontrado, quando
  a câmera é negada e quando o livro não tem código de barras.
- Um ISBN com dígito verificador errado é recusado localmente, sem chamada de
  rede.
- Um ISBN válido que a base não conhece mostra a tela 04.18, com o código no
  campo para corrigir.
- Título ou autor já digitados não são sobrescritos pela leitura.
- Falha de rede mostra mensagem em português e deixa tentar de novo.
- Alvos de 48 × 48, rótulos acessíveis nos ícones, texto ampliável, foco visível
  na Web e nada que dependa só de cor.
- ViewModel testada com repositório em memória, sem rede nem câmera.

## Fora do escopo

Ler a capa por OCR; buscar preço; preencher categoria, conservação ou descrição;
cadastrar o livro numa base pública quando ele não existe; ler ISBN na edição de
um anúncio já publicado (o fluxo é de criação).

## Dependências

- **Spec 025** (`usePublishListingViewModel`, `useListingForm`): é onde o atalho
  entra e onde o resultado é aplicado.
- `expo-camera` — dependência nova, justificada no ADR 0026.
- Base pública de livros — escolha e risco no ADR 0026.

## Referência de design

Figma `cxEisNRzOQR6krv8Ow7HCa`, seção **04 · Publicação** (`206:3587`). Os
`node-id` citados na issue #52 apontam para o arquivo antigo
(`qSTmNLUhC6PwJlbyUmytbe`), que depois da reorganização de 01/10/2026 só tem a
capa. O mapa novo está em [`docs/figma-mapa.md`](../../docs/figma-mapa.md).
