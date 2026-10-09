# 0020 — Só Piripiri e confirmação só por e-mail

Data: 02/10/2026

## Status

Aceito.

## Contexto

O Figma oficial (`cxEisNRzOQR6krv8Ow7HCa`) chegou a ter escolha de cidade no primeiro acesso e verificação de telefone por SMS no perfil. O projeto atende uma comunidade só, e o código já confirma a conta por e-mail. No app, o campo `city` do anúncio não aparecia no formulário e ficava sempre `null`, então o local mostrado era só o bairro, quando havia.

## Decisão

- O IpêBook atende só Piripiri. `SERVED_CITY` (`src/model/services/listingValidation.ts`) vale `'Piripiri'`, e `normalizeDraft` grava essa cidade em todo anúncio, qualquer que seja o valor recebido. O formulário não pede cidade.
- A conta é confirmada só por e-mail. Não há telefone, SMS nem verificação de número; o código atual já não tem nada disso.

O Figma foi ajustado junto: a tela de cidade e as telas de telefone saíram, e o primeiro acesso pede só o bairro (01.17 "Seu bairro").

## Alternativas

- **Deixar a cidade livre no formulário:** abriria anúncios de outras cidades que ninguém de Piripiri pode buscar.
- **Remover a coluna `city`:** exigiria migração e mudaria o catálogo e as views. Gravar a constante mantém o banco igual e deixa a porta aberta se o escopo crescer.

## Consequências

- Anúncios novos e editados passam a mostrar "Bairro, Piripiri" ou só "Piripiri". Anúncios antigos com `city` nulo mudam quando forem editados.
- Ampliar para outras cidades volta a pedir uma decisão, um campo no formulário e a busca por cidade.
- A tela 01.17 "Seu bairro" ainda não existe no app.
