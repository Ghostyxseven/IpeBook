/**
 * Os três cartões da Ajuda no Android e na Web (Figma 09.01, quadro antigo em FAQ).
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

/**
 * Os três passos da Ajuda no iPhone (Figma 09.01, quadro atual: passos numerados em vez
 * de FAQ). `tone` escolhe só a cor do círculo do número — reaproveita `colors.selected`,
 * não inventa paleta nova.
 */
export type HelpStep = { id: string; title: string; description: string };

export const helpSteps: readonly HelpStep[] = [
  {
    id: 'anunciar',
    title: 'Anuncie ou encontre',
    description: 'Fotografe seu livro ou busque por título, autor e bairro.',
  },
  {
    id: 'combinar',
    title: 'Combine pelo chat',
    description: 'Proponha venda, troca ou doação. Nada de telefone no anúncio.',
  },
  {
    id: 'concluir',
    title: 'Encontre e conclua',
    description: 'Encontre em local público, confira o livro e avalie.',
  },
];

/**
 * Dicas de segurança da Ajuda no iPhone (Figma 09.01, seção "Segurança"). Reaproveita os
 * avisos que já existem na conversa (`Combine sempre pelo chat do IpêBook. Não compartilhe
 * senhas ou códigos.`) e no detalhe do livro, sem inventar orientação nova.
 */
export type SafetyTip = { id: string; icon: 'place' | 'eye' | 'error'; text: string };

export const safetyTips: readonly SafetyTip[] = [
  { id: 'local', icon: 'place', text: 'Encontre em local público' },
  { id: 'conferir', icon: 'eye', text: 'Confira o livro antes de pagar' },
  { id: 'senha', icon: 'error', text: 'Nunca compartilhe códigos ou senhas' },
];
