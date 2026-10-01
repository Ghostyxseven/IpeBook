# Verificação — 01/10/2026

## Resultado

Camada de domínio e ViewModel implementadas e testadas. **A feature não está concluída**: faltam as telas, a aplicação da tabela no Supabase e a validação em aparelho.

## Evidências

- `tests/catalog.test.mjs`: 11 testes aprovados e estáveis em execuções repetidas:
  - busca sem acento/caixa, concluídos fora da descoberta e reservados visíveis;
  - filtros combinados, categorias e três ordenações, sem alterar a lista original;
  - preço só na venda, "Gratuito" na doação e interesse na troca;
  - estado da descoberta (carregando, erro, vazio, sem resultados, pronto) e mensagens de erro;
  - conversão das linhas do Supabase (válidas e 8 casos inválidos descartados);
  - repositório Supabase com cliente falso (lista, falha de rede, erro desconhecido, não configurado, detalhe e concluído oculto);
  - ViewModels: carregar, filtrar, ordenar, limpar, catálogo vazio, falha com nova tentativa e detalhe (carregando, encontrado, inexistente, falha).
- `npm run verify` e `npm run build:web` aprovados.

## Limitações

- Nenhum teste contra um Supabase real; o contrato da tabela é uma proposta.
- Nenhuma tela nem teste visual; o Figma não foi consultado nesta etapa porque não há interface.
- A fábrica `factories/catalog.ts` não é usada por nenhuma tela ainda.
