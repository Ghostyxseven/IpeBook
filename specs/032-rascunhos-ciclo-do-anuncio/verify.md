# Verificação

Data: 07/10/2026 · Branch `feat/isbn-e-perfil-completo`.

## Executado

| Verificação                          | Resultado                                       |
| ------------------------------------ | ----------------------------------------------- |
| `npm run typecheck`                  | sem erros                                       |
| `npm run lint`                       | sem erros novos                                 |
| `npm run format:check`               | sem diferenças                                  |
| `npm test`                           | 317 testes, 317 aprovados (17 novos desta spec) |
| `architecture.test.mjs`              | o Model não importa `expo-sqlite`               |
| `npx expo export --platform android` | bundle gerado                                   |
| `npx expo export --platform ios`     | bundle gerado                                   |

`drafts.test.mjs` (16): o que falta num rascunho em branco e a ordem da frase;
concordância de número ("falta categoria" × "faltam categoria e localização");
doação sem preço e troca cobrando o que aceita; rascunho sem título; a linha de
apoio do quadro 04.11; guardar e ler; atualizar sem duplicar e subindo para o
topo; atualizar o que sumiu; o teto de 20; JSON corrompido virando lista vazia;
armazenamento recusando gravar; e as duas ViewModels.

## O que a revisão pegou

**O quadro 04.19 tinha passado batido.** A varredura tela a tela mostrou que
"Falha ao enviar fotos" não era citado em lugar nenhum do código nem das specs —
eu havia contado onze quadros faltando na seção 04 quando eram doze. Implementado
agora, com teste que separa os dois casos: falha de rede **com** foto abre o
quadro; **sem** foto continua sendo mensagem no rodapé.

**Uma caixa de tarefa ficou aberta por engano.** O script que marcou as tarefas
concluídas pulava toda linha contendo "aparelho", para preservar as pendências de
teste em dispositivo — e o título "ADR 0028 — por que o rascunho mora no
aparelho" casou com o filtro. O ADR existe desde o primeiro commit da spec.

**Um teste criava o repositório dentro do hook.** `renderHook(() =>
useDraftsViewModel(createMemoryDraftsRepository([])))` devolve um repositório
novo a cada render; o efeito que carrega a lista depende dele, então renderizava
sem parar. O arquivo levava 93 segundos e terminava em falha. Corrigido tirando a
criação de dentro do hook — e o comentário no teste explica por quê, porque é um
erro fácil de repetir.

## Divergências do Figma

| Quadro                     | O que o app faz de diferente, e por quê                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 04.08, 04.10, 04.20, 04.21 | São **estados de uma tela**. Rotas separadas deixariam, depois de excluir, uma tela de anúncio inexistente alcançável pelo botão voltar                     |
| 04.08                      | **"Marcar como concluído" não grava nada.** Concluir pertence à negociação (ADR 0018); a linha leva às Conversas, com o apoio dizendo isso                  |
| 04.11 a 04.16              | O rascunho **não guarda a foto** (ADR 0028). A tela avisa antes de a pessoa descobrir sozinha                                                               |
| 04.16                      | O texto é o do quadro renderizado ("Salve um anúncio durante o preenchimento e continue quando quiser."), não o do nome da camada, que estava desatualizado |
| vocabulário                | "Pausar", "Pausado" e "Retomar" nas telas; a situação no banco continua `arquivado`                                                                         |
| estante                    | A folha de opções saiu: o Figma desenhou uma tela, e ela cabe a prévia e o cartão de situação que a folha não cabia                                         |

## Não executado

| O quê                                    | Por quê                                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Fluxo real em aparelho                   | Depende das chaves do Supabase, que não estão nesta cópia                                       |
| Rascunho sobrevivendo a fechar e reabrir | Precisa de aparelho: no teste, o `Storage` é de mentira. A persistência real é do `expo-sqlite` |

## Pendências

- Conferir no aparelho que o rascunho sobrevive a fechar o aplicativo — é a
  promessa central da spec e a única que o teste não alcança.
- Conferir que pausar e retomar refletem no catálogo de outra conta.
