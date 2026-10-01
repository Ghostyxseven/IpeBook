# Lembrar o modo de leitura

## Objetivo e escopo

Lembrar, entre visitas, a escolha entre Livro 3D e Leitura normal (spec 017). A preferência é guardada em `localStorage`, sob a chave `ipebook:modo-de-leitura`, e a Política de Privacidade passa a descrevê-la.

Fora do escopo: cookies, sessão, qualquer identificador do visitante e sincronização entre aparelhos.

## Critérios de aceite

- Ao abrir a página, nada é gravado. A gravação acontece só depois que o visitante escolhe um modo.
- A escolha guardada vale mais que a preferência de movimento reduzido do sistema; sem escolha, vale a regra da spec 017.
- Valores desconhecidos no armazenamento são ignorados.
- Se o armazenamento estiver bloqueado, a página funciona e a escolha vale só nessa visita, sem erro.
- A Política de Privacidade informa a preferência guardada, que ela fica no aparelho, quando é gravada e como apagá-la.
- Nenhum cookie e nada em `sessionStorage`.

## Validação

Testes do Model e da ViewModel (inclui armazenamento bloqueado), tipos, lint, formatação, build e verificação em Chromium: abrir, escolher, recarregar, movimento reduzido.
