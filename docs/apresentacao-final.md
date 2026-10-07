# Roteiro da apresentação final — IpêBook

> **Rascunho** (issue #50). Data do grupo (10, 15 ou 17/12/2026) **a confirmar com o professor**. Os tempos abaixo são sugestões para ajustar ao limite definido. O que ainda não existe aparece como **depende de**; não apresentar como pronto antes de estar. Atualizado em 02/10/2026.

## Objetivo

Mostrar um aplicativo que funciona de ponta a ponta, instalado no aparelho, com o sistema de design e a arquitetura que o sustentam. PDM avalia requisitos, design de software e código; IHC avalia o sistema de design e a UI/UX.

## Estrutura (sugestão de 15 minutos)

| #   | Bloco                     | Quem                 | Tempo | Conteúdo                                                                                        |
| --- | ------------------------- | -------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| 1   | Problema e público        | A definir            | 2 min | Por que livros param nas estantes; leitores de Piripiri (PI); venda, troca e doação             |
| 2   | Demonstração no aparelho  | Todos, um fluxo cada | 6 min | Roteiro de demo abaixo                                                                          |
| 3   | Sistema de design         | A definir            | 3 min | Figma, `design-tokens.json`, Material 3 no Android e componentes nativos no iOS, acessibilidade |
| 4   | Arquitetura e qualidade   | A definir            | 3 min | MVVM, Repository, Factory, Supabase com RLS, testes e CI                                        |
| 5   | Limites e próximos passos | A definir            | 1 min | O que ficou de fora e por quê                                                                   |

## Roteiro da demonstração

Executar no celular, com o app instalado pela loja (teste fechado, issue #46). Usar contas e anúncios de demonstração identificados como tais.

1. **Abertura e onboarding** (Maria Clara): primeira abertura, tela de boas-vindas, Começar e Já tenho conta.
2. **Criar conta e entrar** (Maria Clara): cadastro, código por e-mail, entrar, recuperar senha. Mostrar uma mensagem de erro em português.
3. **Descobrir um livro** (Micael): Início com saudação e chips de modalidade, Explorar com busca, filtros e rolagem, Detalhe do livro. Mostrar vazio, erro e sem conexão.
4. **Publicar um anúncio** (Eric): criar, editar e arquivar (specs 025 e 026, implementadas; falta validar em aparelho).
5. **Pedir e concluir** (Antonio) — _depende da issue #38_: pedir o livro com outra conta, aceitar e concluir.
6. **Segurança** (Antonio) — _depende da issue #40_: denunciar e bloquear.

Se algum item dependente não estiver pronto até a véspera, tirá-lo do roteiro em vez de simular.

## Pontos para o bloco de design (IHC)

- Fonte da verdade: Figma, `design-tokens.json` e [`docs/design-system.md`](design-system.md).
- Semântica fixa de **Venda**, **Troca**, **Doação**, **Reservado** e **Concluído**; preço em BRL só na venda.
- Alvos de 48 × 48, rótulos acessíveis, foco visível na Web, texto ampliável, movimento reduzido, estados que não dependem só de cor.
- Mostrar um componente (Book Card ou Status Badge) no Figma e no app.

## Pontos para o bloco de arquitetura (PDM)

- Diagrama MVVM e fluxos do [relatório de PDM](relatorio-pdm.md).
- Padrões: MVVM Simplificado, Repository, Factory, injeção de dependência.
- Testes automatizados (`npm run verify`) e como as ViewModels são testadas sem rede.
- Decisões em [ADRs](adr/index.md).

## Preparação

- [ ] Confirmar a data com o professor e o tempo disponível.
- [ ] App instalável pela loja (issues #51 e #46) e testado em Android e iOS reais (issue #44).
- [ ] Contas e anúncios de demonstração criados, marcados como demonstração, e uma conta extra para o fluxo de pedido.
- [ ] Relatório de PDM completo (issue #48) e política de privacidade coerente (issues #25 e #49).
- [ ] Ensaio completo, cronometrado, pelo menos duas vezes.
- [ ] Plano B: vídeo curto gravado de cada fluxo, caso a rede ou o aparelho falhe.
- [ ] Carregador, dados móveis de reserva e espelhamento de tela testado.

## Perguntas prováveis

- Como os dados ficam protegidos? (RLS no Supabase; o app só usa a chave publicável.)
- Por que MVVM e não colocar a lógica nas telas? (ADR 0002; testes sem interface.)
- O que acontece sem internet? (banner de conexão e estados de erro com "Tentar de novo".)
- Quem é o responsável pelos dados? (**Definir na issue #25 antes da data.**)
