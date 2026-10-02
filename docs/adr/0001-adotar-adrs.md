# 0001 — Adotar Architecture Decision Records (ADRs)

Data: 29/09/2026

## Status

Aceito

## Contexto

Precisamos manter um registro histórico das decisões arquiteturais e tecnológicas tomadas durante o desenvolvimento do IpeBook. Manter o histórico de decisões em um local centralizado facilita a integração de novos membros (ou agentes) e explica o racional por trás de escolhas que podem parecer arbitrárias no futuro.

## Decisão

Adotaremos Architecture Decision Records (ADRs) conforme descrito em [https://github.com/architecture-decision-record/architecture-decision-record](https://github.com/architecture-decision-record/architecture-decision-record). Registraremos decisões significativas, de infraestrutura ou arquiteturais em formato Markdown neste diretório `docs/adr/`.

## Consequências

- Todas as decisões importantes serão registradas e documentadas em português.
- O contexto e as consequências de cada decisão serão mantidos junto ao código.
- Devemos atualizar ou criar novos ADRs sempre que tomarmos uma decisão técnica ou arquitetural de peso (ex: escolha de bibliotecas de navegação, persistência, etc).
