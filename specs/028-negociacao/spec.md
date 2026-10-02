# 028 — Negociação: pedir o livro, aceitar ou recusar, cancelar e concluir

Responsável: Micael Cardoso Reis (ver `docs/DIVISAO_FEATURES.md`). Issues #38 (entregue no PR #84, por Antonio Carlos Gomes) e #54.

## Objetivo

Registrar o fluxo de negociação que já está na `develop` e fechar as lacunas de segurança e de consistência encontradas nele. É o pattern **Combinar encontro** e **Concluir negociação** do design system. Ponto de encontro com telas próprias, propostas por modalidade e avaliação continuam na #54 e entram numa próxima etapa desta spec.

## Fluxos

1. **Pedir o livro (Figma 06):** no detalhe de um anúncio disponível de outra pessoa, "Combinar encontro" abre o pedido com local público, data e horário sugeridos.
2. **Decidir (Figma 39, 45 e 46):** quem anunciou aceita ou recusa o pedido. Aceitar reserva o livro e recusa os outros pedidos pendentes do mesmo anúncio.
3. **Cancelar:** quem pediu cancela um pedido pendente; depois de aceito, qualquer um dos dois cancela, e o livro volta a ficar disponível.
4. **Concluir (Figma 61):** quem anunciou confirma a entrega e o anúncio sai do catálogo como Concluído.
5. **Acompanhar:** a lista "Negociações" mostra os pedidos enviados e recebidos.

## Aceite

- Livro reservado aparece como Reservado no catálogo; concluído sai do catálogo.
- Só quem anunciou aceita, recusa ou conclui; quem pediu nunca consegue aceitar o próprio pedido, nem chamando a API do Supabase diretamente.
- O pedido e o anúncio mudam juntos: não existe pedido aceito com o livro ainda disponível, nem cancelamento que deixa o livro preso em Reservado.
- Uma pessoa tem no máximo um pedido ativo (pendente ou aceito) por anúncio.
- Não dá para pedir o próprio anúncio nem um anúncio que não está disponível.
- Quem pediu continua vendo o anúncio depois de reservado ou concluído.
- Pedido recebido, aceito, recusado e concluído geram aviso na tela de Notificações (spec 024), respeitando as preferências da pessoa.
- Model e ViewModels testados com repositório em memória; chamada ao banco e mapeamento de erros testados com cliente falso.

## Fora do escopo desta etapa

- Ponto de encontro com telas próprias, propostas de troca e de retirada e avaliação (#54).
- Conversa e mensagens (#39).
- Aviso de cancelamento: `notifications.kind` ainda não tem esse tipo.
