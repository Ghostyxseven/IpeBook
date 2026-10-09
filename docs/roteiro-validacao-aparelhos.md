# Roteiro de validação em aparelho real (Android e iPhone)

Consolida as tarefas de "conferir no aparelho" espalhadas pelas specs, para executar numa rodada só com duas contas reais. Resolve, ao concluir e registrar nos respectivos `verify.md`, as issues #10, #12, #28, #36, #37, #39, #44 e #54 (e avança #18/#029 catálogo e conversa).

## 0. Pré-requisitos (bloqueiam o resto)

Sem isso, a rodada não pode nem começar — resolver primeiro.

- [ ] `.env` da equipe com projeto Supabase real preenchido no aparelho de teste (spec 014).
- [ ] Aplicar no Supabase da equipe as migrações pendentes:
  - [ ] `book_requests`, segurança e transições (spec 028, negociação — issue #54).
  - [ ] Migração de conversas (spec 029 — issue #39), com ok do responsável.
  - [ ] `notifications` e `notification_preferences` com RLS (spec 024 — issue #29), depois de validar o ADR 0011 com Antonio e Eric.
  - [ ] Migração de avaliações/perfil público (spec 031 — issue #53).
- [ ] Duas contas de teste criadas (uma para cada aparelho/papel na negociação e na conversa).
- [ ] Um Android real e um iPhone real disponíveis (não emulador/Waydroid — a sessão anterior caiu no Waydroid).

## 1. Autenticação e base nativa (issues #10, #12, #11)

Specs: 013-base-app-nativo, 014-autenticacao-onboarding.

- [ ] Comparar as telas de onboarding/autenticação com os quadros do Figma (seção iPhone, nó `206:6868`).
- [ ] Conferir campos, botões, navegação, voltar, mensagens e estados com as diretrizes iOS (SF Symbols, teclado, autofill, código de uso único, mostrar/ocultar senha).
- [ ] Testar login/cadastro ponta a ponta com o Supabase real, em Android e iPhone.
- [ ] Validar áreas seguras, rolagem, teclado aberto e texto ampliado no iPhone.
- [ ] Ler com VoiceOver (iOS) e TalkBack (Android); confirmar alvos de 48×48 px.
- [ ] Registrar capturas, aparelho/versão e limitações em `specs/013-base-app-nativo/verify.md` e `specs/014-autenticacao-onboarding/verify.md`.

## 2. Catálogo com dados reais (issue #28)

Spec: 018-catalogo-descoberta.

- [ ] Publicar 2-3 anúncios reais pela outra conta (venda, troca, doação).
- [ ] Conferir Book Card, grade do Início, Explorar e Detalhe contra os quadros 02, 03 e 04 do Figma, com dados reais (não mocados).
- [ ] Conferir paginação com anúncios de outra conta.
- [ ] Conferir a saudação e a alternância dos chips de filtro.
- [ ] Confirmar a fonte da marca carregando corretamente.

## 3. Anúncio e perfil mínimos (issues #36, #37)

Specs: 025-anuncios-gestao, 026-perfil-minimo.

- [ ] Criar, editar, arquivar e excluir um anúncio nas três modalidades (venda, troca, doação).
- [ ] Confirmar que o anúncio publicado aparece no catálogo da outra conta e que arquivado/excluído desaparece.
- [ ] Conferir abas Estante e Perfil na `NavigationBar` e o botão Sair dentro do Perfil.
- [ ] Registrar em `specs/025-anuncios-gestao/verify.md` e `specs/026-perfil-minimo/verify.md`.

## 4. Segurança: denúncia e bloqueio (issue #40)

Spec: 027-seguranca-denuncias-bloqueios.

- [ ] Com as duas contas, denunciar um anúncio/pessoa e confirmar o registro.
- [ ] Bloquear a outra conta e confirmar que anúncios e conversas dela somem.
- [ ] Desbloquear e confirmar que voltam a aparecer.

## 5. Negociação completa (issue #54)

Spec: 028-negociacao.

- [ ] Com duas contas, percorrer os dois lados da negociação: proposta por modalidade, ponto de encontro, confirmação e avaliação final.
- [ ] Validar o fluxo integrado em Android e iPhone.
- [ ] Registrar em `specs/028-negociacao/verify.md`.

## 6. Conversa e mensagens (issue #39)

Spec: 029-conversa.

- [ ] Com duas contas, trocar mensagens numa negociação e confirmar entrega/leitura.
- [ ] Conferir em Android e iPhone.

## 7. Leitura de ISBN (issue #52, extra)

Spec: 030-leitura-isbn.

- [ ] Testar a leitura com câmera real (não simulador) e registrar em `verify.md`.

## 8. Perfil completo (issue #53, extra)

Spec: 031-perfil-completo.

- [ ] Depois de aplicar a migração, validar avaliações, histórico e perfil público de outra conta.

## 9. App Web (issue #41, #35)

Spec: 035-validacao-app-web.

- [ ] Validar login, persistência de sessão e publicação de anúncio pelo navegador real (não só pelo app nativo).
- [ ] Comparar os estados do sistema (vazio, erro, offline, carregando) com a seção I do Figma.
- [ ] Liberar o acesso institucional só depois dessa validação.

## Ao final de cada bloco

- Marcar o item correspondente como `[x]` no `tasks.md` da spec.
- Registrar aparelho, versão de SO e eventuais limitações no `verify.md` da spec.
- Fechar a issue do GitHub citando a evidência (capturas, specs e `verify.md` atualizados), não apenas "testado".
