# 0030 — Rascunho de anúncio guardado no aparelho

Data: 07/10/2026

## Status

Proposto, implementado (issue #36, spec 032, Figma 04.11 a 04.16).

## Contexto

Hoje, quem começa a anunciar um livro e sai da tela perde tudo o que digitou. O
Figma tem seis quadros de rascunho desenhados desde o começo (04.11 a 04.16) e
nenhum deles existe no aplicativo — foi a maior divergência encontrada na
reconferência de 07/10/2026.

Um rascunho é trabalho inacabado e privado: ninguém além de quem escreveu precisa
vê-lo, ele não aparece no catálogo, e boa parte dos rascunhos é abandonada.

## Decisão

- **O rascunho fica no aparelho**, em `localStorage` (que no Android e no iPhone
  é SQLite, pelo `src/infra/localStore.ts`), sob a chave `ipebook:rascunhos`.
  Não há tabela nova, não há migração, não há RLS.
- **Até 20 rascunhos**, o mais recente primeiro. Passando disso, o mais antigo
  sai. É um limite alto o bastante para ninguém esbarrar nele por uso normal e
  baixo o bastante para o armazenamento não crescer sem fim.
- **O rascunho guarda o texto, não a foto.** A foto escolhida é um `ArrayBuffer`
  de alguns megabytes; guardar isso em `localStorage` é usar o lugar errado. A
  tela avisa que a foto é escolhida de novo ao retomar.
- **Salvar é uma escolha, não um salvamento automático.** Ao sair do Anunciar
  com algo preenchido, o aplicativo pergunta (quadro 04.13). Salvar sozinho a
  cada tecla encheria a lista de lixo que ninguém pediu para guardar.
- **Descartar não tem desfazer**, e o quadro 04.15 avisa isso antes.

## O que foi recusado, e por quê

**Uma tabela `listing_drafts` no Supabase.** Daria rascunho sincronizado entre
aparelhos, que é bom. Custa uma migração a mais numa fila que já tem uma
esperando para ser aplicada, RLS para dados que a pessoa nem decidiu publicar, e
uma rotina de limpeza para rascunho abandonado. O ganho não paga agora; se um dia
alguém pedir "comecei no celular e quero terminar no computador", o caminho é
trocar a implementação do `DraftsRepository` sem mexer em tela nenhuma — a porta
já existe exatamente para isso.

**Salvamento automático.** Mais simples de implementar e pior de usar: a lista
de rascunhos viraria um histórico de tentativas, e o quadro 04.13 ("Salvar para
depois?") deixa claro que a equipe de design decidiu perguntar.

## Consequências

- Reinstalar o aplicativo, limpar os dados ou trocar de aparelho leva os
  rascunhos junto. É o preço de não ter servidor, e está dito na tela.
- A foto precisa ser escolhida de novo ao retomar um rascunho.
- O `DraftsRepository` é síncrono por fora porque o `localStorage` é síncrono;
  se um dia virar servidor, a porta passa a devolver `Promise` e as ViewModels
  acompanham. Por isso ela já é escrita com `Promise`, mesmo sem precisar hoje.
- Falha de armazenamento não quebra o anúncio: o rascunho não salva, a tela avisa,
  e o formulário continua preenchido. É a mesma regra do `preferencesRepository`.
