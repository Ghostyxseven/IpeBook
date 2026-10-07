# Button

Botões em pílula de 52px (M3 médio) para as ações de cada tela.

- **Preenchido** (`primary` / `on-primary`): uma ação principal por tela. Seta à direita quando avança o fluxo (Entrar, Continuar, Criar conta).
- **Contornado** (borda 1.5px `primary`): a alternativa direta (Criar minha conta, Combinar encontro).
- **Tonal** (`secondary-container`): ação de apoio dentro de um fluxo (Digitar o ISBN).
- **Texto**: ação de baixa ênfase (Salvar rascunho, Agora não, Voltar ao início), altura 44px.
- Lado a lado (grade de 2 colunas, `space-3`) quando as duas ações têm peso parecido: contornado à esquerda, preenchido à direita.
- Rótulo em verbo no infinitivo ou primeira pessoa: "Tenho interesse", "Propor troca". Sem caixa-alta.
- Foco: anel de 3px. Altura nunca menor que `touch-target`.
