# 0026 — Leitura de ISBN pela câmera

Data: 07/10/2026

## Status

Proposto, implementado (issue #52, spec 030, Figma 04.01, 04.02, 04.03, 04.17 e 04.18).

## Contexto

Digitar título e autor é o passo mais chato de anunciar um livro, e o dado já está impresso na contracapa em código de barras. O IpêBook roda em Android, iPhone e Web a partir do mesmo código (ADR 0025), e nenhum desses três tem câmera garantida: o navegador pode negar, o aparelho pode não ter, a pessoa pode recusar a permissão. O exemplar também pode simplesmente não ter ISBN — livro antigo, edição artesanal, capa rasgada.

## Decisão

- **Leitor: `expo-camera`.** É o pacote da própria Expo, já traz leitura de código de barras no `CameraView` (`barcodeScannerSettings`) e tem implementação para Web. `expo-barcode-scanner` está descontinuado desde o SDK 51, então entrar por ele seria entrar por uma porta que já está fechando.
- **Formato aceito: EAN-13.** O código de barras de livro é o ISBN-13 em EAN-13 (prefixos `978` e `979`, "Bookland"). Aceitar EAN-8 ou UPC-A só abriria porta para ler o código de barras errado da embalagem.
- **Validação local antes da rede.** ISBN-10 e ISBN-13 têm dígito verificador. Um código torto é recusado em `src/model/services/isbn.ts`, sem gastar requisição nem tempo de quem está esperando.
- **Base pública: Open Library** (`https://openlibrary.org/api/books`). Não pede chave, responde CORS, e os dados são de domínio público. A alternativa óbvia era a Google Books API: tem cobertura melhor em português, mas o uso sem chave é limitado por IP e sem aviso, e guardar uma chave dentro do aplicativo é guardar uma chave em público.
- **Só título e autor.** A base descreve a _edição_, não o _exemplar_. Preço, conservação e categoria são do exemplar e continuam sendo escolhidos à mão.
- **Nada entra sem confirmação.** O resultado aparece na tela 04.03 e só é aplicado quando a pessoa toca em "Usar estes dados". Campo já preenchido não é sobrescrito.
- **A câmera é opcional em todo o caminho.** "Digitar o ISBN" leva ao mesmo resultado sem câmera nenhuma, e é o que a Web usa.
- **Permissão declarada no `app.json`**, com texto em português explicando que a câmera serve só para ler o código de barras.

## Consequências

- O aplicativo passa a pedir permissão de câmera. Quem negar continua anunciando normalmente; a tela 04.17 explica e oferece as duas saídas.
- O `expo-camera` **está incluído no Expo Go**, então a leitura dá para testar sem build. O que o config plugin do `app.json` acrescenta é o texto da permissão em português — e esse, sim, só aparece num build próprio (ADR 0015); no Expo Go a permissão é pedida com o texto genérico do próprio Expo Go.
- A cobertura da Open Library para edições brasileiras é irregular. É por isso que a tela 04.18 existe e é um caminho normal, não um erro: o cadastro manual continua sendo o caminho principal.
- Uma consulta a serviço externo acontece com o ISBN lido. Nenhum dado da pessoa viaja junto — só o código impresso no livro.
- Se a Open Library sair do ar, a leitura falha com mensagem em português e o cadastro manual segue intacto.
