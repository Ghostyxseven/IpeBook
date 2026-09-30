export type OnboardingPage = { id: string; title: string; description: string };

export const onboardingPages: OnboardingPage[] = [
  {
    id: 'boas-vindas',
    title: 'Boas histórias merecem novos leitores',
    description:
      'O IpêBook aproxima leitores de Piripiri, no Piauí, para dar um novo destino aos livros que já foram lidos.',
  },
  {
    id: 'modalidades',
    title: 'Venda, troca ou doação',
    description:
      'Na venda, o livro tem preço em reais. Na troca, vocês combinam uma leitura por outra. Na doação, o livro segue gratuitamente.',
  },
  {
    id: 'encontro',
    title: 'Combine com cuidado',
    description:
      'Confira o estado do livro antes, prefira locais públicos para a entrega e nunca pague taxas para "liberar" um livro.',
  },
];
