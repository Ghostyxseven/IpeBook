# Verificação

Data: 07/10/2026 · Branch `feat/isbn-e-perfil-completo`.

## Executado

| Verificação                          | Resultado                                           |
| ------------------------------------ | --------------------------------------------------- |
| `npm run typecheck`                  | sem erros                                           |
| `npm run lint`                       | sem erros novos                                     |
| `npm run format:check`               | sem diferenças                                      |
| `npm test`                           | 297 testes, 297 aprovados (18 novos desta spec)     |
| `architecture.test.mjs`              | Model sem React/Expo; View e rotas sem repositórios |
| `npx expo export --platform android` | bundle gerado (4,1 MB)                              |
| `npx expo export --platform ios`     | bundle gerado (3,8 MB)                              |

`reputation.test.mjs` (18): média que vira `null` em vez de "0,0 de 5"; plural
de trocas concluídas; monograma do avatar com primeira e última inicial; "desde"
mostrando só o ano; o verbo do histórico mudando conforme o lado (vendido/
comprado, doado/recebido); os três tópicos da Ajuda; cada erro do Postgres
virando código do app (migração ausente, RLS recusando, `unique` barrando a
segunda avaliação); e as três ViewModels nos caminhos de pronto, vazio e erro.

Um teste trava o que mais importa: **o perfil público devolve exatamente seis
campos**. Se alguém acrescentar e-mail ou bairro ao retorno, ele falha.

## Reconferência do Meu perfil contra o quadro novo (débito técnico de UI)

A spec 026 montou o Meu perfil **sem conseguir abrir o Figma** — os `node-id` da
issue #37 tinham morrido na reorganização de 01/10/2026, e o `verify.md` de lá
registrou a comparação como bloqueada. Com o quadro `25:524` em mãos, as
diferenças eram grandes:

| O quadro 07.01 pede                                   | O que existia                            | O que foi feito                                                                         |
| ----------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Barra "Perfil" com engrenagem                         | Título "Meu perfil" no corpo             | Barra com a engrenagem levando a Configurações                                          |
| Avatar monograma + nome + "Piripiri, PI · desde 2026" | Cartão com nome, nome completo e e-mail  | Identidade como no quadro. **O e-mail saiu**: ele não aparece em lugar nenhum do quadro |
| Três números: anúncios, trocas, avaliação             | Uma frase contada                        | Os três azulejos                                                                        |
| Lista de seis destinos                                | Um botão "Ver minha estante" e um "Sair" | A lista inteira                                                                         |

**Acrescentado além do quadro:** a entrada **Histórico**. A issue #53 pede
"histórico de trocas e doações" e a seção 07 não tem quadro para ela — e é de lá
que a avaliação sai, que também não tem quadro. Registrado em
`docs/design-system/divergencias.md`.

## Divergências do Figma

| Quadro              | O que o app faz de diferente, e por quê                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 03.04               | O cartão "Perfil confirmado" diz "E-mail confirmado", não "Telefone confirmado": o IpêBook confirma por e-mail e não pede telefone (ADR 0020) |
| 03.04               | "Histórico na comunidade" vira link para as avaliações só quando existe alguma; sem nota, não há lista para abrir                             |
| 07.03               | A mesma tela serve às próprias avaliações e às de outra pessoa — quem olha a própria reputação quer ver o que os outros veem                  |
| Histórico e avaliar | Sem quadro no Figma. Desenhados com os componentes da biblioteca                                                                              |

## Não executado

| O quê                             | Por quê                                                                                                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluxo real contra o Supabase      | **A migração `20261007120000_avaliacoes_e_perfil_publico.sql` ainda não foi aplicada.** Até lá o app mostra "As avaliações ainda não foram configuradas neste ambiente" e o resto segue funcionando |
| Avaliar uma negociação de verdade | Depende do item acima e de duas contas com uma negociação concluída                                                                                                                                 |
| Fluxo em aparelho                 | Pendente, junto com as specs 025 e 026                                                                                                                                                              |

## Pendências

- **Aplicar a migração** no projeto do Supabase (`supabase db push` ou o SQL
  Editor) e confirmar que `public_profile` não devolve e-mail — a função é
  `security definer`, então vale olhar o retorno real uma vez.
- Conferir com duas contas: concluir uma negociação, avaliar dos dois lados, e
  checar que a segunda tentativa de avaliar a mesma negociação é recusada pelo
  banco, não só pela tela.
- A `auth.users.deleted_at` usada no `public_profile` existe no Supabase atual;
  se o projeto for antigo, confirmar antes de aplicar.
