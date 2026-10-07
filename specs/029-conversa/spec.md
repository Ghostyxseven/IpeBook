# 029 — Conversa da negociação

Responsável: Micael Cardoso Reis (ver `docs/DIVISAO_FEATURES.md`). Issue #39.

## Objetivo

Deixar quem pediu e quem anunciou um livro conversarem dentro do IpêBook, sem trocar telefone, para combinar o encontro. É parte do pattern **Combinar encontro** do design system e segue os quadros Android 06.01, 06.02, 06.09, 06.10 e 06.16 do Figma.

## Fluxos

1. **Conversas (06.01):** a aba lista uma linha por negociação, com as iniciais e o primeiro nome de quem está do outro lado, a última mensagem, o horário dela e "Sobre <livro>". Sem mensagem ainda, a linha mostra a situação da negociação. Tocar abre a conversa.
2. **Conversa (06.02):** barra com o nome da pessoa, cartão do livro com a modalidade e o atalho "Negociação", balões com a hora e o campo de envio.
3. **Enviar (06.16):** a mensagem aparece no fim da lista e o campo fica vazio.
4. **Falha ao enviar (06.10):** o texto continua no campo e um aviso diz que a mensagem ficou pendente; tocar em enviar tenta de novo.
5. **Negociação encerrada:** recusada, cancelada ou concluída, a conversa fica só para leitura.
6. **Do pedido para a conversa:** o detalhe de uma negociação pendente ou combinada tem o botão "Abrir conversa".

## Aceite

- Só os dois lados da negociação leem e enviam mensagens, também pela API do Supabase (RLS, ADR 0021).
- Mensagem vazia não é enviada; o limite é de 1.000 caracteres no app e no banco.
- Ninguém envia mensagem em nome de outra pessoa nem numa negociação encerrada.
- Mensagens não podem ser editadas nem apagadas.
- Com a conversa aberta, mensagens novas aparecem sem a pessoa precisar sair da tela.
- Falha ao carregar nome ou última mensagem não derruba a lista de Conversas.
- Model, repositórios e ViewModels testados com repositório em memória e cliente falso.

## Fora do escopo

- Entrega em tempo real (Supabase Realtime) e aviso de mensagem nova em Notificações.
- Anexos, fotos e localização na conversa.
- Marcar como lida e contador de não lidas.
