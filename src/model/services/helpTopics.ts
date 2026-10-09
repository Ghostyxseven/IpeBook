/**
 * Os três cartões da Ajuda (Figma 09.01).
 *
 * Dado e não JSX: mudar um texto de ajuda não devia pedir alteração em
 * componente, e assim a tela só desenha o que está aqui.
 */
export type HelpTopic = { id: string; question: string; answer: string };

export const helpTopics: readonly HelpTopic[] = [
  {
    id: 'troca',
    question: 'Como funciona a troca?',
    answer: 'Abra um livro de troca, escolha um título da sua estante e envie a proposta.',
  },
  {
    id: 'entrega',
    question: 'Onde acontece a entrega?',
    answer: 'Combine dia, horário e um local público pela conversa. Confira o livro no encontro.',
  },
  {
    id: 'problema',
    question: 'Algo não saiu como combinado?',
    answer:
      'No menu da conversa, você pode bloquear a pessoa. No anúncio, use a opção de denunciar.',
  },
];
