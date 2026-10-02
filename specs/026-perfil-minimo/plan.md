# Plano

## Model

Nada novo. A estante usa `ListingsRepository.listMine` da spec 025, e o perfil usa o `User` que a sessão já carrega.

- `services/profileSummary.ts` — conta os anúncios por situação, puro e testável. Fica no Model porque é regra de apresentação do domínio, não da tela.

## ViewModels

- `useMyListingsViewModel` (da spec 025) serve as duas telas. Não duplicar: duas listas divergiriam.
- O perfil lê a sessão por `useSessionContext`, que já existe.

## Views

- `screens/profile/MyShelfScreen.tsx` e `screens/profile/ProfileScreen.tsx`.
- `components/listings/MyListingCard.tsx` (spec 025) é o card da estante.
- Rotas `src/app/(app)/(tabs)/estante.tsx` e `src/app/(app)/(tabs)/perfil.tsx`.
- `(tabs)/_layout.tsx` ganha as duas abas; `NavigationBar.tsx` ganha os dois ícones.
- `screens/catalog/HomeScreen.tsx` perde o botão Sair.

## Decisões

1. **Uma lista só para estante e perfil.** O perfil mostra o resumo contado da mesma fonte; dois caminhos de leitura dariam números diferentes na mesma tela.
2. **Sair fica no Perfil, não no Início.** É onde as pessoas procuram, e libera o topo do Início para o que a spec 018 desenhou.
3. **O perfil não inventa reputação.** Sem avaliações (são da #53), ele mostra o que existe: quem é a pessoa e quantos anúncios ela tem.

## Verificação

`npm run verify` e o `architecture.test.mjs`. O fluxo real no aparelho fica no `verify.md`.
