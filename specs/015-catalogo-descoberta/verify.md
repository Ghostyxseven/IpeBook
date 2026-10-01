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

## Pendências

- **Conferência visual em celular ou emulador:** não foi feita. Não há AVD configurado nesta máquina nem `.env` do Supabase, e sem o Supabase não é possível entrar na área autenticada. Falta conferir Início, Buscar e Detalhe nos estados carregando, vazio, nenhum resultado, erro, offline e com texto ampliado.
- **Supabase real:** depende do ADR 0007 aceito pelo Eric e da migração com a tabela `listings` e a view `catalog_listings`.
- **Figma:** comparação com os quadros de Início, Buscar e Detalhe não feita.
- **Ícones das abas:** as abas mostram só o rótulo até existir o ADR da biblioteca de ícones por plataforma.
- **ESLint:** a configuração do projeto não cobre `src`; só o Prettier foi aplicado nesses arquivos.
