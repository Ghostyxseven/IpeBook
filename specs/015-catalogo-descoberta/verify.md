# Verificação

Data: 30/09/2026 · Branch `feature/exploracao-livros`.

## Executado

| Verificação                          | Resultado                                      |
| ------------------------------------ | ---------------------------------------------- |
| `npm run typecheck`                  | sem erros                                      |
| `npm test`                           | 56 testes, 56 aprovados (21 novos do catálogo) |
| `npx expo export --platform android` | bundle gerado                                  |
| `npx expo export --platform ios`     | bundle gerado                                  |

Cobertura dos testes do catálogo:

- `catalog-model.test.mjs`: preço em BRL, gratuidade, localização sem endereço, data, rótulo acessível do card, busca curta, filtros, curingas do `ilike`, categorias e mensagens.
- `catalog-repository.test.mjs`: sem configuração não simula dados; consulta à view com busca, modalidade, categoria, ordenação e cursor; valores com vírgula e parênteses entre aspas; anúncio inexistente; erro de rede.
- `catalog-viewmodel.test.mjs`: paginação sem duplicar requisições nem itens, fim da lista, vazio, erro com nova tentativa, atualização que preserva a lista, espera da digitação, filtros combinados, limpar, categoria inicial do atalho, descarte de resposta atrasada e estados do detalhe.

## Fluxo real (Waydroid, Expo Go 57.0.9, Supabase da equipe)

Conta de teste da própria pessoa, migração `20260930120000_catalogo_anuncios.sql` aplicada e nenhum anúncio de outra pessoa.

| Cenário                                                                                | Resultado                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Login leva ao novo Início com abas Início e Buscar                                     | ok                                                                  |
| Início sem anúncios mostra "Ainda não há livros anunciados" (consulta à view sem erro) | ok                                                                  |
| Buscar: um toque marca um chip, contador "1 filtro ativo", "Limpar tudo"               | ok                                                                  |
| Filtro sem resultado mostra "Nenhum livro encontrado"                                  | ok                                                                  |
| Busca por texto ("machado") consulta o Supabase sem erro                               | ok                                                                  |
| Atalho de categoria do Início abre Buscar filtrada                                     | ok                                                                  |
| Mesmo atalho depois de limpar os filtros                                               | **falhava**; corrigido com o parâmetro `atalho` e conferido de novo |
| Barra de abas acima do teclado ocupava a tela                                          | corrigido com `tabBarHideOnKeyboard`                                |

## Pendências

- **Book Card e Detalhe com dados reais:** ainda não há anúncio de outra conta no projeto. Falta conferir card, capa, badges, preço, detalhe, livro reservado e paginação.
- **Estados de erro e offline no aparelho:** cobertos só pelos testes; desligar a rede do Waydroid derruba o `adb`.
- **Texto ampliado e leitor de tela (TalkBack):** não conferidos.
- **ADR 0007:** a migração já foi aplicada no projeto da equipe, mas o ADR continua proposto até a concordância do Eric.
- **Figma:** comparação com os quadros de Início, Buscar e Detalhe não feita.
- **Ícones das abas:** as abas mostram só o rótulo até existir o ADR da biblioteca de ícones por plataforma.
- **ESLint:** a configuração do projeto não cobre `src`; só o Prettier foi aplicado nesses arquivos.
