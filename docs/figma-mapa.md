# Mapa do Figma

O arquivo de telas do IpêBook é **`cxEisNRzOQR6krv8Ow7HCa`**
([IpêBook Mobile](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile)).

O arquivo antigo `qSTmNLUhC6PwJlbyUmytbe`, citado nas issues #36, #37, #47, #52 e
#53, hoje tem só a capa: a equipe de design reorganizou tudo em 01/10/2026 e
**todos os `node-id` das issues apontam para nada**. Este arquivo existe para que
ninguém mais perca tempo descobrindo isso de novo.

## A listagem de páginas mente; o acesso direto funciona

A ferramenta de leitura do Figma lista só algumas páginas do arquivo — foi isso
que levou o `specs/024-configuracoes-notificacoes/spec.md` a registrar que "a
ferramenta de leitura só enxerga as páginas 00 e 05", e foi por isso que as specs
025 e 026 ficaram com a comparação visual marcada como bloqueada.

**Não está bloqueada.** Pedir um `node-id` diretamente funciona para qualquer
seção, inclusive as que a listagem não mostra. O que faltava era o número, não a
permissão. Os números estão abaixo.

## Seções (canvas Android)

| Seção                      | `node-id`  | Telas |
| -------------------------- | ---------- | ----- |
| 01 · Acesso                | `206:3560` | 17    |
| 02 · Descoberta            | `206:3568` | —     |
| 03 · Livro e comunidade    | `206:3579` | 6     |
| 04 · Publicação            | `206:3587` | 21    |
| 05 · Estante               | `206:3600` | 8     |
| 06 · Conversa e negociação | `206:3607` | 20    |
| 07 · Perfil e conta        | `206:3618` | 21    |
| 08 · Compartilhar          | `206:3630` | 2     |
| 09 · Ajuda e moderação     | `206:3635` | 4     |
| 10 · Estados do sistema    | `206:3641` | —     |

O canvas do iPhone tem seções próprias; a de acesso é `206:6868`.

## Telas citadas pelas specs 025, 026, 030 e 031

| Tela                         | `node-id`  | Onde é usada              |
| ---------------------------- | ---------- | ------------------------- |
| 03.04 · Perfil de Ana Paula  | `19:21`    | spec 031 — perfil público |
| 04.01 · Anunciar — etapa 1   | `12:210`   | specs 025 e 030           |
| 04.02 · Ler ISBN             | `12:275`   | spec 030                  |
| 04.03 · Livro identificado   | `12:320`   | spec 030                  |
| 04.04 · Mostre seu livro     | `28:685`   | spec 025                  |
| 04.05 · Anunciar — etapa 2   | `12:360`   | spec 025                  |
| 04.06 · Revise o anúncio     | `19:327`   | spec 025                  |
| 04.07 · Anúncio publicado    | `12:418`   | spec 025                  |
| 04.08 · Gerenciar anúncio    | `149:3348` | spec 025                  |
| 04.09 · Editar anúncio       | `19:242`   | spec 025                  |
| 04.10 · Anúncio pausado      | `150:3367` | spec 025                  |
| 04.17 · Câmera não permitida | `370:6349` | spec 030                  |
| 04.18 · ISBN não encontrado  | `370:6391` | spec 030                  |
| 04.20 · Excluir anúncio?     | `397:6961` | spec 025                  |
| 04.21 · Anúncio excluído     | `397:7003` | spec 025                  |
| 07.01 · Meu perfil           | `25:524`   | specs 026 e 031           |
| 07.03 · Avaliações recebidas | `145:2486` | spec 031                  |
| 07.09 · Excluir conta        | `149:3589` | issue #47                 |
| 07.17 · Conta excluída       | `370:6769` | issue #47                 |
| 09.01 · Ajuda                | `145:2702` | spec 031                  |

## Como manter

Se a equipe de design reorganizar de novo, as seções mudam de `node-id` e esta
tabela envelhece em silêncio. Antes de abrir uma spec que cite um quadro,
confirme um `node-id` desta tabela; se ele não existir mais, redescubra as
seções e **atualize este arquivo no mesmo PR**.
