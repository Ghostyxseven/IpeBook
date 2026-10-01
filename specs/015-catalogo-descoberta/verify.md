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

## Ajuste ao Figma (Waydroid)

| Cenário                                                                                                 | Resultado                                       |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Início: marca, saudação, sair, barra de busca M3, chips coloridos, "Livros recentes" e atalho de doação | conforme quadro 02                              |
| Chip selecionado inverte a cor e mostra a marca de seleção; vazio muda conforme a modalidade            | ok                                              |
| Chips quebravam em duas linhas com a fonte do aparelho                                                  | corrigido com rolagem horizontal                |
| Explorar: título "Encontre sua próxima história.", barra de busca e chips                               | conforme quadro 03                              |
| Busca "astronomia" sem resultado: "Ainda não encontramos." e "Explorar todos os livros"                 | conforme quadro 12                              |
| Barra de navegação M3 com ícones `expo-symbols`                                                         | ok; o indicador saía retangular e foi corrigido |
| `npm test` (60), `npm run typecheck`, bundle Android (Metro) e `expo export --platform ios`             | ok                                              |

## Comparação lado a lado com o Figma (densidade 140 dpi, tela inteira visível)

| Item             | Antes                                                      | Depois                                                                                      |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Chips            | cantos de 8, Troca em amarelo forte, Todos em verde-escuro | pílula, Troca em `color.badge.trade.chip`, selecionado em `color.action`, como no quadro 02 |
| Indicador da aba | retangular (o ícone nativo impedia o canto arredondado)    | pílula, com `overflow: 'hidden'`                                                            |

## Pendências

- **Book Card e Detalhe com dados reais:** ainda não há anúncio de outra conta no projeto. Falta conferir card, capa, badges, preço, detalhe, livro reservado e paginação.
- **Estados de erro e offline no aparelho:** cobertos só pelos testes; desligar a rede do Waydroid derruba o `adb`.
- **Texto ampliado e leitor de tela (TalkBack):** não conferidos.
- **ADR 0007:** a migração já foi aplicada no projeto da equipe, mas o ADR continua proposto até a concordância do Eric.
- **iOS:** os SF Symbols e o visual não foram conferidos num iPhone; só o bundle iOS foi gerado.
- **ESLint:** a configuração do projeto não cobre `src`; só o Prettier foi aplicado nesses arquivos.
