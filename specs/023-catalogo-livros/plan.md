# Plano

## Arquitetura (MVVM simplificado, ADR 0002)

- **Model**
  - `entities/Listing.ts`: tipos do anúncio (união discriminada por modalidade) e `CatalogError`.
  - `services/catalog.ts`: busca, filtros, ordenação, categorias, preço em BRL, textos do Book Card, mensagens de erro e `discoverStatus`. Funções puras.
  - `repositories/CatalogRepository.ts` (contrato), `memoryCatalogRepository.ts` (testes e desenvolvimento) e `supabaseCatalogRepository.ts` (conversão `rowToListing` e acesso à tabela `listings`).
- **ViewModel:** `useCatalogViewModel` (descobrir) e `useListingDetailViewModel` (detalhe), ambos recebem o repositório.
- **Fábrica:** `factories/catalog.ts` liga os ViewModels ao Supabase, no mesmo padrão da autenticação.
- **View:** pendente (telas nativas e Web; consultar o Figma).

## Dados (proposta)

Tabela `listings` com as colunas de `contracts/listings.sql`. Pontos de decisão da equipe:

1. **Quem vê o catálogo:** a proposta libera leitura só para pessoas autenticadas, coerente com as rotas do app (`(app)` exige sessão). Abrir a anônimos exigiria rever privacidade e a política de acesso.
2. **Localização:** campo textual opcional e escolhido por quem anuncia; não há geolocalização nesta fase.
3. **Capas:** URL opcional; envio de imagens (Storage) pertence à feature de Inventário.
4. **Escrita:** inserir/editar/arquivar pertence à feature de Inventário; a proposta já restringe a escrita ao dono (`owner_id = auth.uid()`).

## Riscos

- O contrato da tabela é suposição até a equipe aprovar e aplicar; `rowToListing` é rígido de propósito, então uma coluna diferente vira "nenhum anúncio" em vez de dado errado.
- Sem Supabase real disponível, a camada de acesso foi testada com um cliente falso.
