# TextField
Campo contornado com ícone à esquerda (acesso) ou rótulo flutuante (formulários).

- Acesso: altura `field-height`, raio `radius-lg`, borda 1px; o rótulo é o placeholder enquanto vazio.
- Formulários: raio `radius-md`, rótulo de 12px sobre a borda quando há valor.
- Foco: borda `primary` com 2px. Erro: borda `error` e mensagem de 12px embaixo, que diz como corrigir ("O preço deve ser maior que zero.").
- Senha: botão de olho (48px) à direita com `aria-label` "Mostrar senha". Use `autocomplete` correto.
- Ajuda abaixo do campo em `m3-body-sm`, nunca menor que 12px.
